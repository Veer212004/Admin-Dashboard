import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { UserService } from '../../../services/user.service';
import { SessionService } from '../../../services/session.service';
import { SocketService } from '../../../services/socket.service';
import { Subscription } from 'rxjs';

interface UserCard {
  _id: string;
  name: string;
  email: string;
  role: string;
  verified: boolean;
  online: boolean;
  status: 'pending' | 'active' | 'suspended' | 'roleChange';
  authorizationState?: string;
  roleChangeRequest?: {
    status: string;
    requestedRole?: string;
  };
  lastLoginAt?: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span class="text-2xl">👥</span>
              </div>
              User Status Board
            </h1>
            <p class="text-sm text-slate-500 mt-2">Manage users by verification and activity status</p>
          </div>
          <div class="px-6 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <span class="text-xs text-slate-500 block">Total Users</span>
            <p class="text-2xl font-bold text-indigo-600">{{ getTotalUsers() }}</p>
          </div>
        </div>

        <!-- Stats Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div class="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 md:p-4 border border-amber-200">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl md:text-2xl">📧</span>
              <span class="text-xs font-semibold text-amber-800 leading-tight">Pend Verif</span>
            </div>
            <p class="text-2xl md:text-3xl font-bold text-amber-900">{{ pendingUsers.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 md:p-4 border border-green-200">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl md:text-2xl">✅</span>
              <span class="text-xs font-semibold text-green-800 leading-tight">Active Online</span>
            </div>
            <p class="text-2xl md:text-3xl font-bold text-green-900">{{ activeUsers.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 md:p-4 border border-red-200">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl md:text-2xl">🚫</span>
              <span class="text-xs font-semibold text-red-800 leading-tight">Susp</span>
            </div>
            <p class="text-2xl md:text-3xl font-bold text-red-900">{{ suspendedUsers.length }}</p>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 md:p-4 border border-purple-200">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl md:text-2xl">⏳</span>
              <span class="text-xs font-semibold text-purple-800 leading-tight">Role Change</span>
            </div>
            <p class="text-2xl md:text-3xl font-bold text-purple-900">{{ roleChangeUsers.length }}</p>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <!-- Email Verification Pending -->
        <div class="bg-white rounded-xl shadow-sm border-2 border-amber-200 overflow-hidden">
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 p-4">
            <div class="text-white">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-2xl">📧</span>
                <h2 class="text-lg font-bold">Email Verification Pending</h2>
              </div>
              <p class="text-xs opacity-90">Users who haven't verified their email</p>
              <p class="text-sm font-semibold mt-2">{{ pendingUsers.length }} users</p>
            </div>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="pendingUsers"
            [cdkDropListConnectedTo]="['active-list', 'suspended-list', 'roleChange-list']"
            id="pending-list"
            (cdkDropListDropped)="drop($event, 'pending')"
            class="p-4 space-y-3 min-h-[500px] max-h-[700px] overflow-y-auto bg-amber-50"
          >
            <div
              *ngFor="let user of pendingUsers"
              cdkDrag
              class="bg-white rounded-lg p-4 border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-move"
            >
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {{ getInitials(user.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ user.name }}</h3>
                  <p class="text-xs text-slate-600 truncate">{{ user.email }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                      {{ user.role }}
                    </span>
                    <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                      ⚠️ Unverified
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-2">
                    Joined: {{ user.createdAt | date: 'short' }}
                  </p>
                </div>
              </div>
            </div>
            
            <div *ngIf="pendingUsers.length === 0" class="text-center py-16 text-slate-400">
              <p class="text-5xl mb-3">✅</p>
              <p class="text-sm font-semibold">All users verified!</p>
            </div>
          </div>
        </div>

        <!-- Active Users (Currently Logged In) -->
        <div class="bg-white rounded-xl shadow-sm border-2 border-green-200 overflow-hidden">
          <div class="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <div class="text-white">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-2xl">✅</span>
                <h2 class="text-lg font-bold">Active Users</h2>
              </div>
              <p class="text-xs opacity-90">Currently logged in and online</p>
              <p class="text-sm font-semibold mt-2">{{ activeUsers.length }} users</p>
            </div>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="activeUsers"
            [cdkDropListConnectedTo]="['pending-list', 'suspended-list', 'roleChange-list']"
            id="active-list"
            (cdkDropListDropped)="drop($event, 'active')"
            class="p-4 space-y-3 min-h-[500px] max-h-[700px] overflow-y-auto bg-green-50"
          >
            <div
              *ngFor="let user of activeUsers"
              cdkDrag
              class="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-all cursor-move"
            >
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0 relative">
                  {{ getInitials(user.name) }}
                  <span class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ user.name }}</h3>
                  <p class="text-xs text-slate-600 truncate">{{ user.email }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      {{ user.role }}
                    </span>
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      🟢 Online
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-2">
                    Last login: {{ user.lastLoginAt | date: 'short' }}
                  </p>
                </div>
              </div>
            </div>
            
            <div *ngIf="activeUsers.length === 0" class="text-center py-16 text-slate-400">
              <p class="text-5xl mb-3">😴</p>
              <p class="text-sm font-semibold">No active users</p>
            </div>
          </div>
        </div>

        <!-- Suspended Users -->
        <div class="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
          <div class="bg-gradient-to-r from-red-500 to-red-600 p-4">
            <div class="text-white">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-2xl">🚫</span>
                <h2 class="text-lg font-bold">Suspended Users</h2>
              </div>
              <p class="text-xs opacity-90">Temporarily blocked by admin</p>
              <p class="text-sm font-semibold mt-2">{{ suspendedUsers.length }} users</p>
            </div>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="suspendedUsers"
            [cdkDropListConnectedTo]="['pending-list', 'active-list', 'roleChange-list']"
            id="suspended-list"
            (cdkDropListDropped)="drop($event, 'suspended')"
            class="p-4 space-y-3 min-h-[500px] max-h-[700px] overflow-y-auto bg-red-50"
          >
            <div
              *ngFor="let user of suspendedUsers"
              cdkDrag
              class="bg-white rounded-lg p-4 border border-red-200 shadow-sm hover:shadow-md transition-all cursor-move"
            >
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {{ getInitials(user.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ user.name }}</h3>
                  <p class="text-xs text-slate-600 truncate">{{ user.email }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                      {{ user.role }}
                    </span>
                    <span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                      🔒 Blocked
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-2">
                    Suspended: {{ user.createdAt | date: 'short' }}
                  </p>
                </div>
              </div>
            </div>
            
            <div *ngIf="suspendedUsers.length === 0" class="text-center py-16 text-slate-400">
              <p class="text-5xl mb-3">👍</p>
              <p class="text-sm font-semibold">No suspended users</p>
            </div>
          </div>
        </div>

        <!-- Role Change Pending -->
        <div class="bg-white rounded-xl shadow-sm border-2 border-purple-200 overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
            <div class="text-white">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-2xl">⏳</span>
                <h2 class="text-lg font-bold">Role Change Pending</h2>
              </div>
              <p class="text-xs opacity-90">Awaiting admin approval</p>
              <p class="text-sm font-semibold mt-2">{{ roleChangeUsers.length }} users</p>
            </div>
          </div>
          
          <div
            cdkDropList
            [cdkDropListData]="roleChangeUsers"
            [cdkDropListConnectedTo]="['pending-list', 'active-list', 'suspended-list']"
            id="roleChange-list"
            (cdkDropListDropped)="drop($event, 'roleChange')"
            class="p-4 space-y-3 min-h-[500px] max-h-[700px] overflow-y-auto bg-purple-50"
          >
            <div
              *ngFor="let user of roleChangeUsers"
              cdkDrag
              class="bg-white rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition-all cursor-move"
            >
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {{ getInitials(user.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-slate-900 text-sm truncate">{{ user.name }}</h3>
                  <p class="text-xs text-slate-600 truncate">{{ user.email }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                      {{ user.role }}
                    </span>
                    <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold" *ngIf="user.roleChangeRequest?.requestedRole">
                      → {{ user.roleChangeRequest?.requestedRole }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-2">
                    Request pending approval
                  </p>
                </div>
              </div>
            </div>
            
            <div *ngIf="roleChangeUsers.length === 0" class="text-center py-16 text-slate-400">
              <p class="text-5xl mb-3">📋</p>
              <p class="text-sm font-semibold">No pending requests</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div *ngIf="showNotification" 
           class="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 z-50 flex items-center gap-3">
        <span class="text-2xl">✅</span>
        <div>
          <p class="font-bold">{{ notificationTitle }}</p>
          <p class="text-sm opacity-90">{{ notificationMessage }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .cdk-drag-preview {
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      border-radius: 12px;
      opacity: 0.95;
    }

    :host ::ng-deep .cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      background: #f1f5f9;
    }

    :host ::ng-deep .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    :host ::ng-deep .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class KanbanComponent implements OnInit, OnDestroy {
  pendingUsers: UserCard[] = [];
  activeUsers: UserCard[] = [];
  suspendedUsers: UserCard[] = [];
  roleChangeUsers: UserCard[] = [];

  showNotification = false;
  notificationTitle = '';
  notificationMessage = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setupRealtime();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.categorizeUsers(response.users);
      },
      error: (err) => console.error('Failed to load users:', err)
    });
  }

  categorizeUsers(users: any[]): void {
    // Load active sessions to determine online users
    this.sessionService.getAllSessions().subscribe({
      next: (response) => {
        const activeSessions = response.sessions.filter((s: any) => !s.endedAt);
        const activeUserIds = activeSessions.map((s: any) => s.user._id);

        this.pendingUsers = [];
        this.activeUsers = [];
        this.suspendedUsers = [];
        this.roleChangeUsers = [];

        users.forEach(user => {
          const userCard: UserCard = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified,
            online: activeUserIds.includes(user._id),
            status: 'pending',
            authorizationState: user.authorizationState,
            roleChangeRequest: user.roleChangeRequest,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt
          };

          // Categorize by priority
          if (user.authorizationState === 'suspended') {
            userCard.status = 'suspended';
            this.suspendedUsers.push(userCard);
          } else if (user.roleChangeRequest?.status === 'pending') {
            userCard.status = 'roleChange';
            this.roleChangeUsers.push(userCard);
          } else if (activeUserIds.includes(user._id) && user.verified) {
            userCard.status = 'active';
            this.activeUsers.push(userCard);
          } else if (!user.verified) {
            userCard.status = 'pending';
            this.pendingUsers.push(userCard);
          } else {
            // Verified but not online - consider as active but offline
            userCard.status = 'active';
            this.activeUsers.push(userCard);
          }
        });
      },
      error: (err) => console.error('Failed to load sessions:', err)
    });
  }

  setupRealtime(): void {
    // Listen for user status changes via socket
    this.socketService.on('userStatusChanged').subscribe((data: any) => {
      this.loadUsers(); // Reload to reflect changes
    });

    // Listen for session changes
    this.socketService.on('sessionStarted').subscribe(() => {
      this.loadUsers();
    });

    this.socketService.on('sessionEnded').subscribe(() => {
      this.loadUsers();
    });
  }

  drop(event: CdkDragDrop<UserCard[]>, targetStatus: string): void {
    const user = event.item.data || event.previousContainer.data[event.previousIndex];
    const previousStatus = user.status;

    if (event.previousContainer === event.container) {
      // Same column - just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Different column - move user
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update user status based on target column
      this.updateUserStatus(user, targetStatus, previousStatus);
    }
  }

  updateUserStatus(user: UserCard, newStatus: string, oldStatus: string): void {
    const updateData: any = {};

    switch (newStatus) {
      case 'pending':
        // Move to pending = mark as unverified
        updateData.verified = false;
        updateData.authorizationState = 'active';
        updateData.roleChangeRequest = null; // Clear any role change request
        break;
      
      case 'active':
        // Move to active = verify user and activate
        updateData.verified = true;
        updateData.authorizationState = 'active';
        updateData.roleChangeRequest = null; // Clear any role change request
        break;
      
      case 'suspended':
        // Move to suspended = block user
        updateData.verified = true; // Keep verification status
        updateData.authorizationState = 'suspended';
        updateData.roleChangeRequest = null; // Clear any role change request
        break;
      
      case 'roleChange':
        // Move to role change = create pending role change request
        updateData.verified = true; // Ensure user is verified
        updateData.authorizationState = 'active'; // Ensure user is active
        updateData.roleChangeRequest = {
          status: 'pending',
          requestedRole: user.role === 'admin' ? 'user' : 'admin',
          requestedBy: user._id,
          requestedAt: new Date()
        };
        break;
    }

    console.log('Updating user:', user.email, 'to status:', newStatus, 'with data:', updateData);

    // Update user in backend
    this.userService.updateUser(user._id, updateData).subscribe({
      next: (response) => {
        console.log('User updated successfully:', response);
        this.showNotificationMessage(
          'Status Updated!',
          `${user.name} moved from ${this.getStatusName(oldStatus)} to ${this.getStatusName(newStatus)}`
        );
        // Reload users to ensure sync with backend
        setTimeout(() => this.loadUsers(), 500);
      },
      error: (err: any) => {
        console.error('Failed to update user status:', err);
        this.showNotificationMessage(
          'Update Failed',
          `Could not update ${user.name}'s status. ${err.error?.message || 'Please try again.'}`
        );
        // Reload to revert changes
        this.loadUsers();
      }
    });
  }

  getStatusName(status: string): string {
    const names: any = {
      'pending': 'Email Verification Pending',
      'active': 'Active Users',
      'suspended': 'Suspended',
      'roleChange': 'Role Change Pending'
    };
    return names[status] || status;
  }

  showNotificationMessage(title: string, message: string): void {
    this.notificationTitle = title;
    this.notificationMessage = message;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getTotalUsers(): number {
    return this.pendingUsers.length + this.activeUsers.length + 
           this.suspendedUsers.length + this.roleChangeUsers.length;
  }
}

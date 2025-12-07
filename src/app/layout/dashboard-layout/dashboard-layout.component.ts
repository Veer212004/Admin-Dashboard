import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.model';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="flex flex-col md:flex-row h-screen bg-gray-100">
      <!-- Mobile Menu Button -->
      <button (click)="toggleSidebar()" 
              class="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg">
        <svg *ngIf="!sidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg *ngIf="sidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Sidebar -->
      <aside [class.hidden]="!sidebarOpen" 
             class="md:block fixed md:relative w-64 bg-slate-900 text-white shadow-lg overflow-y-auto h-full z-40 transition-transform duration-300">
        <div class="p-4 md:p-6">
          <h1 class="text-xl md:text-2xl font-bold">Dashboard</h1>
        </div>
        <nav class="mt-4 md:mt-6">
          <a routerLink="/dashboard" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition text-sm md:text-base">
            📊 Home
          </a>
          <a *ngIf="isAdmin$ | async" 
             routerLink="/dashboard/users" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition text-sm md:text-base">
            👥 Users
          </a>
          <a *ngIf="isAdmin$ | async" 
             routerLink="/dashboard/sessions" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition text-sm md:text-base">
            🔐 Sessions
          </a>
          <a routerLink="/dashboard/notifications" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition flex justify-between items-center text-sm md:text-base">
            <span>🔔 Notifications</span>
            <ng-container *ngIf="unreadCount$ | async as count">
              <span *ngIf="count > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {{ count }}
              </span>
            </ng-container>
          </a>
          <a *ngIf="isAdmin$ | async" 
             routerLink="/dashboard/activity" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition text-sm md:text-base">
            📝 Activity
          </a>
          <a routerLink="/dashboard/kanban" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition text-sm md:text-base">
            📋 Kanban
          </a>
          <a routerLink="/dashboard/settings" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition text-sm md:text-base">
            ⚙️ Settings
          </a>
          <a routerLink="/dashboard/guide" 
             (click)="closeSidebarOnMobile()"
             routerLinkActive="bg-slate-800" 
             class="block px-4 md:px-6 py-3 hover:bg-slate-800 transition text-sm md:text-base">
            📚 Guide
          </a>
        </nav>
      </aside>

      <!-- Overlay for mobile -->
      <div *ngIf="sidebarOpen" 
           (click)="closeSidebarOnMobile()"
           class="md:hidden fixed inset-0 bg-black/50 z-30"></div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden w-full">
        <!-- Header -->
        <header class="bg-white shadow">
          <div class="w-full mx-auto py-3 md:py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 class="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 pl-12 md:pl-0">Admin Dashboard</h1>
            <div class="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-end">
              <span *ngIf="currentUser$ | async as user" class="text-xs sm:text-sm md:text-base text-gray-700 truncate max-w-[150px] sm:max-w-none">
                {{ user.name }} <span class="hidden sm:inline">({{ user.role }})</span>
              </span>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition text-sm md:text-base whitespace-nowrap"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto bg-gray-100">
          <div class="w-full mx-auto py-4 md:py-6 px-3 sm:px-4 md:px-6 lg:px-8">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardLayoutComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  unreadCount$!: Observable<number>;
  isAdmin$!: Observable<boolean>;
  sidebarOpen = false;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.unreadCount$ = this.notificationService.unreadCount$;
    this.isAdmin$ = this.authService.currentUser$.pipe(map((user: any) => user?.role === 'admin'));

    const user = this.authService.currentUserValue;
    if (user && !this.socketService.isConnected()) {
      this.socketService.connect(user._id, user.role);
      this.setupSocketListeners();
      this.loadNotifications();
    }
  }

  private setupSocketListeners(): void {
    this.socketService.on<any>('newNotification').subscribe((notification) => {
      this.notificationService.addNotification(notification);
    });

    this.socketService.on<any>('analyticsUpdate').subscribe((data) => {
      console.log('Analytics updated:', data);
    });
  }

  private loadNotifications(): void {
    this.notificationService.getNotifications({ limit: 10 }).subscribe((response) => {
      this.notificationService.setNotifications(response.notifications);
      this.notificationService.setUnreadCount(response.unreadCount);
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.socketService.disconnect();
        this.router.navigate(['/login']);
      },
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebarOnMobile(): void {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      this.sidebarOpen = false;
    }
  }
}

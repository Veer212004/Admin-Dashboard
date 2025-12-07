import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/auth.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">User Management</h1>
            <p class="text-sm text-slate-500 mt-1">Manage and monitor your users</p>
          </div>
          <div class="flex items-center gap-2">
            <div class="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200">
              <span class="text-xs text-slate-500">Total Users</span>
              <p class="text-2xl font-bold text-slate-900">{{ total }}</p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            placeholder="🔍 Search users..."
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
          />
          <select
            [(ngModel)]="roleFilter"
            (ngModelChange)="onFilter()"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          <select
            [(ngModel)]="verifiedFilter"
            (ngModelChange)="onFilter()"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
          >
            <option value="">All Status</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <button
            (click)="exportCSV()"
            class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>

        <!-- Column Headers -->
        <div class="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 mb-3 border border-indigo-100 shadow-sm">
          <div class="flex items-center gap-4">
            <!-- User Info Column -->
            <div class="flex items-center gap-2 flex-1">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <span class="text-xl">👤</span>
              </div>
              <span class="text-sm font-bold text-slate-700 uppercase tracking-wide">User Info</span>
            </div>

            <!-- Role Column -->
            <div class="flex items-center gap-2 w-[140px]">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                <span class="text-lg">👑</span>
              </div>
              <span class="text-sm font-bold text-slate-700 uppercase tracking-wide">Role</span>
            </div>

            <!-- Status Column -->
            <div class="flex items-center gap-2 w-[160px]">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <span class="text-lg">✓</span>
              </div>
              <span class="text-sm font-bold text-slate-700 uppercase tracking-wide">Status</span>
            </div>

            <!-- Activity Column -->
            <div class="flex items-center gap-2 w-[140px]">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-sm">
                <span class="text-lg">●</span>
              </div>
              <span class="text-sm font-bold text-slate-700 uppercase tracking-wide">Activity</span>
            </div>

            <!-- Actions Column -->
            <div class="flex items-center gap-2 justify-end">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-sm">
                <span class="text-lg">⚡</span>
              </div>
              <span class="text-sm font-bold text-slate-700 uppercase tracking-wide">Actions</span>
            </div>
          </div>
        </div>

        <!-- Users List -->
        <div class="space-y-3">
          <div *ngFor="let user of users" 
               class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all duration-200 hover:border-indigo-200">
            <div class="flex items-center gap-4">
              <!-- User Info with Avatar -->
              <div class="flex items-center gap-4 flex-1">
                <div class="relative">
                  <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                       [style.background]="getAvatarGradient(user.name)">
                    {{ getInitials(user.name) }}
                  </div>
                  <div *ngIf="user.online" 
                       class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-semibold text-slate-900">{{ user.name }}</h3>
                    <span *ngIf="user.verified" class="text-blue-500" title="Verified">✓</span>
                  </div>
                  <p class="text-sm text-slate-500">{{ user.email }}</p>
                </div>
              </div>

              <!-- Role Badge -->
              <div class="w-[140px]">
                <div class="px-4 py-2 rounded-xl text-xs font-semibold"
                     [ngClass]="{
                       'bg-purple-50 text-purple-700 border border-purple-200': user.role === 'admin',
                       'bg-cyan-50 text-cyan-700 border border-cyan-200': user.role === 'user'
                     }">
                  {{ user.role === 'admin' ? '👑 Admin' : '👤 User' }}
                </div>
              </div>

              <!-- Status Badge -->
              <div class="w-[160px]">
                <div class="px-4 py-2 rounded-xl text-xs font-semibold"
                     [ngClass]="{
                       'bg-green-50 text-green-700 border border-green-200': user.verified,
                       'bg-amber-50 text-amber-700 border border-amber-200': !user.verified
                     }">
                  {{ user.verified ? '✅ Verified' : '⏳ Pending' }}
                </div>
              </div>

              <!-- Online Status -->
              <div class="w-[140px]">
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                     [ngClass]="{
                       'bg-emerald-50 text-emerald-700': user.online,
                       'bg-slate-100 text-slate-500': !user.online
                     }">
                  <span class="w-2 h-2 rounded-full" 
                        [ngClass]="{
                          'bg-emerald-500 animate-pulse': user.online,
                          'bg-slate-400': !user.online
                        }"></span>
                  {{ user.online ? 'Online' : 'Offline' }}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center gap-2 justify-end">
                <!-- Admin Actions -->
                <div *ngIf="isAdmin" class="flex items-center gap-2">
                  <!-- Change Role Button -->
                  <button 
                    *ngIf="!isCurrentUser(user)"
                    (click)="toggleRole(user)" 
                    [disabled]="user.loading"
                    class="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-xl transition-colors border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    [title]="user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'">
                    <span *ngIf="!user.loading" class="text-lg">{{ user.role === 'admin' ? '👤' : '👑' }}</span>
                    <span *ngIf="user.loading" class="text-lg">⏳</span>
                    <span *ngIf="!user.loading" class="text-xs">{{ user.role === 'admin' ? 'Demote' : 'Promote' }}</span>
                  </button>

                  <!-- Delete Button -->
                  <button 
                    *ngIf="!isCurrentUser(user)"
                    (click)="deleteUser(user)" 
                    [disabled]="user.loading"
                    class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    title="Delete User">
                    <span *ngIf="!user.loading" class="text-lg">🗑️</span>
                    <span *ngIf="user.loading" class="text-lg">⏳</span>
                    <span *ngIf="!user.loading" class="text-xs">Delete</span>
                  </button>

                  <!-- Current User Badge -->
                  <div *ngIf="isCurrentUser(user)" class="px-3 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-200 text-sm">
                    You
                  </div>
                </div>

                <!-- View Button (for non-admin or as fallback) -->
                <button 
                  *ngIf="!isAdmin"
                  (click)="viewUser(user)" 
                  class="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors border border-indigo-200 text-sm">
                  View →
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="users.length === 0" class="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div class="text-6xl mb-4">👥</div>
            <p class="text-slate-500 text-lg">No users found</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center bg-white rounded-xl p-4 border border-slate-200">
          <span class="text-slate-600 font-medium">Showing {{ users.length }} of {{ total }} users</span>
          <div class="flex gap-2">
            <button
              [disabled]="page === 1"
              (click)="previousPage()"
              class="px-5 py-2 bg-white border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition font-medium text-slate-700"
            >
              ← Previous
            </button>
            <div class="px-5 py-2 bg-indigo-50 border border-indigo-200 rounded-xl font-semibold text-indigo-700">
              Page {{ page }} of {{ pages }}
            </div>
            <button
              [disabled]="page === pages"
              (click)="nextPage()"
              class="px-5 py-2 bg-white border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition font-medium text-slate-700"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- User Demographics Chart -->
      <div class="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-slate-900">User Demographics</h2>
          <p class="text-sm text-slate-500 mt-1">Distribution by role and gender</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Role & Gender Distribution Chart -->
          <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Role & Gender Breakdown</h3>
            <div class="h-80 relative">
              <canvas
                baseChart
                *ngIf="demographicsChartData.labels && demographicsChartData.labels.length > 0"
                [data]="demographicsChartData"
                [options]="demographicsChartOptions"
                [type]="'bar'"
              ></canvas>
              <div *ngIf="!demographicsChartData.labels || demographicsChartData.labels.length === 0" 
                   class="flex flex-col items-center justify-center h-full text-slate-400">
                <div class="text-6xl mb-2">📊</div>
                <p class="text-sm">No demographic data available</p>
              </div>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-purple-600 font-medium">Admin Users</p>
                  <p class="text-3xl font-bold text-purple-900">{{ adminCount }}</p>
                  <div class="flex gap-4 mt-2">
                    <span class="text-xs text-purple-700">👨 Male: {{ maleAdminCount }}</span>
                    <span class="text-xs text-purple-700">👩 Female: {{ femaleAdminCount }}</span>
                  </div>
                </div>
                <div class="text-4xl">👑ADMINS</div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl p-5 border border-cyan-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-cyan-600 font-medium">Regular Users</p>
                  <p class="text-3xl font-bold text-cyan-900">{{ userCount }}</p>
                  <div class="flex gap-4 mt-2">
                    <span class="text-xs text-cyan-700">👨 Male: {{ maleUserCount }}</span>
                    <span class="text-xs text-cyan-700">👩 Female: {{ femaleUserCount }}</span>
                  </div>
                </div>
                <div class="text-4xl">👤USERS</div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-indigo-600 font-medium">Gender Distribution</p>
                  <div class="mt-2 space-y-2">
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-indigo-700 font-medium">👨 Male</span>
                        <span class="text-xs text-indigo-900 font-bold">{{ maleCount }} ({{ malePercentage }}%)</span>
                      </div>
                      <div class="h-2 bg-indigo-200 rounded-full overflow-hidden">
                        <div class="h-full bg-indigo-600 rounded-full" [style.width.%]="malePercentage"></div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-pink-700 font-medium">👩 Female</span>
                        <span class="text-xs text-pink-900 font-bold">{{ femaleCount }} ({{ femalePercentage }}%)</span>
                      </div>
                      <div class="h-2 bg-pink-200 rounded-full overflow-hidden">
                        <div class="h-full bg-pink-600 rounded-full" [style.width.%]="femalePercentage"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="text-4xl">📊STATS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  total = 0;
  page = 1;
  pages = 1;
  limit = 10;
  searchTerm = '';
  roleFilter = '';
  verifiedFilter = '';

  // Demographics data
  adminCount = 0;
  userCount = 0;
  maleAdminCount = 0;
  femaleAdminCount = 0;
  maleUserCount = 0;
  femaleUserCount = 0;
  maleCount = 0;
  femaleCount = 0;
  malePercentage = 0;
  femalePercentage = 0;

  // Chart configuration
  demographicsChartData: ChartConfiguration['data'] = {
    labels: ['Admin', 'User'],
    datasets: [
      {
        label: 'Male',
        data: [0, 0],
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        barPercentage: 0.6
      },
      {
        label: 'Female',
        data: [0, 0],
        backgroundColor: '#ec4899',
        borderRadius: 8,
        barPercentage: 0.6
      }
    ]
  };

  demographicsChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: 500
          },
          color: '#1e293b'
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y} users`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          },
          stepSize: 1
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 12,
            weight: 500
          }
        }
      }
    }
  };

  isAdmin = false;
  currentUserId: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.currentUserValue?._id || null;
    this.loadUsers();
  }

  loadUsers(): void {
    const params: any = {
      page: this.page,
      limit: this.limit,
      ...(this.searchTerm && { search: this.searchTerm }),
      ...(this.roleFilter && { role: this.roleFilter }),
      ...(this.verifiedFilter && { verified: this.verifiedFilter }),
    };

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.users;
        this.total = response.total;
        this.pages = response.pages;
        this.calculateDemographics();
      },
      error: (err) => console.error('Failed to load users:', err),
    });
  }

  calculateDemographics(): void {
    // Reset counts
    this.adminCount = 0;
    this.userCount = 0;
    this.maleAdminCount = 0;
    this.femaleAdminCount = 0;
    this.maleUserCount = 0;
    this.femaleUserCount = 0;
    this.maleCount = 0;
    this.femaleCount = 0;

    // Calculate demographics from users
    this.users.forEach(user => {
      // Determine gender from name (simple heuristic - in real app, this should be a user property)
      const gender = this.inferGender(user.name);
      
      if (user.role === 'admin') {
        this.adminCount++;
        if (gender === 'male') {
          this.maleAdminCount++;
        } else {
          this.femaleAdminCount++;
        }
      } else {
        this.userCount++;
        if (gender === 'male') {
          this.maleUserCount++;
        } else {
          this.femaleUserCount++;
        }
      }

      if (gender === 'male') {
        this.maleCount++;
      } else {
        this.femaleCount++;
      }
    });

    // Calculate percentages
    const totalGender = this.maleCount + this.femaleCount;
    this.malePercentage = totalGender > 0 ? Math.round((this.maleCount / totalGender) * 100) : 0;
    this.femalePercentage = totalGender > 0 ? Math.round((this.femaleCount / totalGender) * 100) : 0;

    // Update chart data
    this.demographicsChartData.datasets[0].data = [this.maleAdminCount, this.maleUserCount];
    this.demographicsChartData.datasets[1].data = [this.femaleAdminCount, this.femaleUserCount];
  }

  inferGender(name: string): 'male' | 'female' {
    // Simple heuristic based on common name endings
    // In a real application, gender should be a user property
    const nameLower = name.toLowerCase();
    const femaleEndings = ['a', 'e', 'ie', 'y', 'ine', 'elle', 'ette'];
    const maleNames = ['john', 'james', 'robert', 'michael', 'david', 'william', 'richard', 'joseph', 'thomas', 'charles', 'admin'];
    const femaleNames = ['mary', 'patricia', 'jennifer', 'linda', 'barbara', 'elizabeth', 'susan', 'jessica', 'sarah', 'karen'];

    // Check if name contains known male/female names
    if (maleNames.some(n => nameLower.includes(n))) return 'male';
    if (femaleNames.some(n => nameLower.includes(n))) return 'female';

    // Check name endings
    const lastWord = name.split(' ').pop()?.toLowerCase() || '';
    if (femaleEndings.some(ending => lastWord.endsWith(ending))) {
      return 'female';
    }
    
    // Default to male if uncertain
    return 'male';
  }

  onSearch(): void {
    this.page = 1;
    this.loadUsers();
  }

  onFilter(): void {
    this.page = 1;
    this.loadUsers();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.page < this.pages) {
      this.page++;
      this.loadUsers();
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  getAvatarGradient(name: string): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
      'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      'linear-gradient(135deg, #f77062 0%, #fe5196 100%)'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }

  isCurrentUser(user: any): boolean {
    return user._id === this.currentUserId;
  }

  toggleRole(user: any): void {
    if (!this.isAdmin || this.isCurrentUser(user)) {
      return;
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'promote' : 'demote';
    
    if (!confirm(`Are you sure you want to ${action} ${user.name} to ${newRole}?`)) {
      return;
    }

    user.loading = true;
    this.userService.changeUserRole(user._id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        user.loading = false;
        this.calculateDemographics();
        alert(`Successfully ${action}d ${user.name} to ${newRole}`);
      },
      error: (err) => {
        console.error('Failed to change user role:', err);
        user.loading = false;
        alert(`Failed to change user role: ${err.error?.message || 'Unknown error'}`);
      }
    });
  }

  deleteUser(user: any): void {
    if (!this.isAdmin || this.isCurrentUser(user)) {
      return;
    }

    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    user.loading = true;
    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u._id !== user._id);
        this.total--;
        this.calculateDemographics();
        alert(`Successfully deleted ${user.name}`);
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        user.loading = false;
        alert(`Failed to delete user: ${err.error?.message || 'Unknown error'}`);
      }
    });
  }

  viewUser(user: any): void {
    console.log('Viewing user:', user);
  }

  exportCSV(): void {
    const params: any = {
      format: 'csv',
      ...(this.searchTerm && { search: this.searchTerm }),
      ...(this.roleFilter && { role: this.roleFilter }),
    };

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        const csv = this.convertToCSV(response.users);
        this.downloadCSV(csv, 'users.csv');
      },
    });
  }

  private convertToCSV(data: any[]): string {
    const headers = ['Name', 'Email', 'Role', 'Verified', 'Last Login'];
    const rows = data.map(u => [u.name, u.email, u.role, u.verified ? 'Yes' : 'No', u.lastLoginAt || 'Never']);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCSV(csv: string, filename: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}

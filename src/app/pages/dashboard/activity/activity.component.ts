import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivityService } from '../../../services/activity.service';
import { ActivityLog } from '../../../models/activity.model';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <span class="text-2xl">📋</span>
              </div>
              Activity Log
            </h1>
            <p class="text-sm text-slate-500 mt-2">Track user actions and system events</p>
          </div>
          <div class="px-5 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <span class="text-xs text-slate-500 block">Total Entries</span>
            <p class="text-2xl font-bold text-indigo-600">{{ total }}</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            [(ngModel)]="actionFilter"
            (ngModelChange)="onFilter()"
            placeholder="🔍 Filter by action..."
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
          />
          <input
            type="date"
            [(ngModel)]="fromDate"
            (ngModelChange)="onFilter()"
            placeholder="From date"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
          />
          <input
            type="date"
            [(ngModel)]="toDate"
            (ngModelChange)="onFilter()"
            placeholder="To date"
            class="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition"
          />
          <button
            (click)="exportCSV()"
            class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>

        <!-- Activity Columns -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Login Activities -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <span class="text-xl">🔓</span>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900">Login Activities</h2>
                <p class="text-xs text-slate-500">Users who logged in</p>
              </div>
            </div>
            
            <div class="space-y-3 max-h-[600px] overflow-y-auto">
              <div *ngFor="let log of getLoginLogs()" 
                   class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                    {{ getInitials(log.actor.name) }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <h3 class="font-semibold text-slate-900">{{ log.actor.name }}</h3>
                      <span class="text-xs text-slate-500">{{ log.createdAt | date: 'short' }}</span>
                    </div>
                    <p class="text-sm text-slate-600 mb-2">{{ log.actor.email }}</p>
                    
                    <!-- Quick Info -->
                    <div class="bg-white rounded-lg p-3 border border-green-200">
                      <div class="grid grid-cols-1 gap-2">
                        <div class="flex items-center justify-between">
                          <p class="text-xs text-slate-500">
                            <span class="font-semibold text-green-700">Action:</span> {{ log.action }}
                          </p>
                          <button 
                            (click)="toggleDetails(log._id)"
                            class="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-semibold transition flex-shrink-0"
                          >
                            {{ isExpanded(log._id) ? '▼ Hide' : '▶ Details' }}
                          </button>
                        </div>
                        <p class="text-xs text-slate-500 break-all">
                          <span class="font-semibold text-green-700">Target:</span> {{ log.target }}
                        </p>
                      </div>
                    </div>

                    <!-- Expanded Details -->
                    <div *ngIf="isExpanded(log._id)" class="bg-green-50 rounded-lg p-4 border border-green-300 mt-3 space-y-3">
                      <div class="bg-white rounded-lg p-3 border border-green-200">
                        <p class="text-xs font-semibold text-green-700 mb-2">👤 User ID</p>
                        <p class="text-xs text-slate-600 font-mono break-all">{{ log.actor._id }}</p>
                      </div>
                      
                      <div class="bg-white rounded-lg p-3 border border-green-200">
                        <p class="text-xs font-semibold text-green-700 mb-2">📝 Log ID</p>
                        <p class="text-xs text-slate-600 font-mono break-all">{{ log._id }}</p>
                      </div>

                      <div class="bg-white rounded-lg p-3 border border-green-200">
                        <p class="text-xs font-semibold text-green-700 mb-2">🕐 Timestamp</p>
                        <p class="text-xs text-slate-600">{{ log.createdAt | date: 'medium' }}</p>
                      </div>
                      
                      <div class="bg-white rounded-lg p-3 border border-green-200" *ngIf="getMetaEntries(log.meta).length > 0">
                        <p class="text-xs font-semibold text-green-700 mb-3">📊 Metadata</p>
                        <div class="space-y-2">
                          <div *ngFor="let entry of getMetaEntries(log.meta)" class="bg-green-50 rounded-lg p-2 border border-green-100">
                            <p class="text-xs font-medium text-slate-700 mb-1">{{ entry.key }}</p>
                            <p class="text-xs text-slate-900 font-mono break-all">{{ entry.value }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="getLoginLogs().length === 0" class="text-center py-8">
                <div class="text-4xl mb-2">🔐</div>
                <p class="text-slate-500 text-sm">No login activities</p>
              </div>
            </div>
          </div>

          <!-- Logout Activities -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-sm">
                <span class="text-xl">🔒</span>
              </div>
              <div>
                <h2 class="text-lg font-bold text-slate-900">Logout Activities</h2>
                <p class="text-xs text-slate-500">Users who logged out</p>
              </div>
            </div>
            
            <div class="space-y-3 max-h-[600px] overflow-y-auto">
              <div *ngFor="let log of getLogoutLogs()" 
                   class="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 hover:shadow-md transition-all">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                    {{ getInitials(log.actor.name) }}
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                      <h3 class="font-semibold text-slate-900">{{ log.actor.name }}</h3>
                      <span class="text-xs text-slate-500">{{ log.createdAt | date: 'short' }}</span>
                    </div>
                    <p class="text-sm text-slate-600 mb-2">{{ log.actor.email }}</p>
                    
                    <!-- Quick Info -->
                    <div class="bg-white rounded-lg p-3 border border-red-200">
                      <div class="grid grid-cols-1 gap-2">
                        <div class="flex items-center justify-between">
                          <p class="text-xs text-slate-500">
                            <span class="font-semibold text-red-700">Action:</span> {{ log.action }}
                          </p>
                          <button 
                            (click)="toggleDetails(log._id)"
                            class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition flex-shrink-0"
                          >
                            {{ isExpanded(log._id) ? '▼ Hide' : '▶ Details' }}
                          </button>
                        </div>
                        <p class="text-xs text-slate-500 break-all">
                          <span class="font-semibold text-red-700">Target:</span> {{ log.target }}
                        </p>
                      </div>
                    </div>

                    <!-- Expanded Details -->
                    <div *ngIf="isExpanded(log._id)" class="bg-red-50 rounded-lg p-4 border border-red-300 mt-3 space-y-3">
                      <div class="bg-white rounded-lg p-3 border border-red-200">
                        <p class="text-xs font-semibold text-red-700 mb-2">👤 User ID</p>
                        <p class="text-xs text-slate-600 font-mono break-all">{{ log.actor._id }}</p>
                      </div>
                      
                      <div class="bg-white rounded-lg p-3 border border-red-200">
                        <p class="text-xs font-semibold text-red-700 mb-2">📝 Log ID</p>
                        <p class="text-xs text-slate-600 font-mono break-all">{{ log._id }}</p>
                      </div>

                      <div class="bg-white rounded-lg p-3 border border-red-200">
                        <p class="text-xs font-semibold text-red-700 mb-2">🕐 Timestamp</p>
                        <p class="text-xs text-slate-600">{{ log.createdAt | date: 'medium' }}</p>
                      </div>
                      
                      <div class="bg-white rounded-lg p-3 border border-red-200" *ngIf="getMetaEntries(log.meta).length > 0">
                        <p class="text-xs font-semibold text-red-700 mb-3">📊 Metadata</p>
                        <div class="space-y-2">
                          <div *ngFor="let entry of getMetaEntries(log.meta)" class="bg-red-50 rounded-lg p-2 border border-red-100">
                            <p class="text-xs font-medium text-slate-700 mb-1">{{ entry.key }}</p>
                            <p class="text-xs text-slate-900 font-mono break-all">{{ entry.value }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="getLogoutLogs().length === 0" class="text-center py-8">
                <div class="text-4xl mb-2">👋</div>
                <p class="text-slate-500 text-sm">No logout activities</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Activities -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mt-6">
          <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-sm">
              <span class="text-xl">⚡</span>
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Other Activities</h2>
              <p class="text-xs text-slate-500">All other system events</p>
            </div>
          </div>
          
          <div class="space-y-3 max-h-[400px] overflow-y-auto">
            <div *ngFor="let log of getOtherLogs()" 
                 class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {{ getInitials(log.actor.name) }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-1">
                    <h3 class="font-semibold text-slate-900">{{ log.actor.name }}</h3>
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                      {{ log.action }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-600 mb-2">{{ log.actor.email }}</p>
                  
                  <!-- Quick Info -->
                  <div class="bg-white rounded-lg p-3 border border-blue-200">
                    <div class="grid grid-cols-1 gap-2">
                      <div class="flex items-center justify-between">
                        <p class="text-xs text-slate-500">
                          <span class="font-semibold text-blue-700">Time:</span> {{ log.createdAt | date: 'short' }}
                        </p>
                        <button 
                          (click)="toggleDetails(log._id)"
                          class="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-semibold transition flex-shrink-0"
                        >
                          {{ isExpanded(log._id) ? '▼ Hide' : '▶ Details' }}
                        </button>
                      </div>
                      <p class="text-xs text-slate-500 break-all">
                        <span class="font-semibold text-blue-700">Target:</span> {{ log.target }}
                      </p>
                    </div>
                  </div>

                  <!-- Expanded Details -->
                  <div *ngIf="isExpanded(log._id)" class="bg-blue-50 rounded-lg p-4 border border-blue-300 mt-3 space-y-3">
                    <div class="bg-white rounded-lg p-3 border border-blue-200">
                      <p class="text-xs font-semibold text-blue-700 mb-2">👤 User ID</p>
                      <p class="text-xs text-slate-600 font-mono break-all">{{ log.actor._id }}</p>
                    </div>
                    
                    <div class="bg-white rounded-lg p-3 border border-blue-200">
                      <p class="text-xs font-semibold text-blue-700 mb-2">📝 Log ID</p>
                      <p class="text-xs text-slate-600 font-mono break-all">{{ log._id }}</p>
                    </div>

                    <div class="bg-white rounded-lg p-3 border border-blue-200">
                      <p class="text-xs font-semibold text-blue-700 mb-2">🕐 Timestamp</p>
                      <p class="text-xs text-slate-600">{{ log.createdAt | date: 'medium' }}</p>
                    </div>
                    
                    <div class="bg-white rounded-lg p-3 border border-blue-200" *ngIf="getMetaEntries(log.meta).length > 0">
                      <p class="text-xs font-semibold text-blue-700 mb-3">📊 Metadata</p>
                      <div class="space-y-2">
                        <div *ngFor="let entry of getMetaEntries(log.meta)" class="bg-blue-50 rounded-lg p-2 border border-blue-100">
                          <p class="text-xs font-medium text-slate-700 mb-1">{{ entry.key }}</p>
                          <p class="text-xs text-slate-900 font-mono break-all">{{ entry.value }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div *ngIf="getOtherLogs().length === 0" class="text-center py-8">
              <div class="text-4xl mb-2">📝</div>
              <p class="text-slate-500 text-sm">No other activities</p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center bg-white rounded-xl p-4 border border-slate-200">
          <span class="text-slate-600 font-medium">Total: {{ total }} entries</span>
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
    </div>
  `,
})
export class ActivityComponent implements OnInit {
  logs: ActivityLog[] = [];
  total = 0;
  page = 1;
  pages = 1;
  limit = 10;
  actionFilter = '';
  fromDate = '';
  toDate = '';
  expandedLogs: Set<string> = new Set();

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.loadActivity();
  }

  loadActivity(): void {
    const params: any = {
      page: this.page,
      limit: this.limit,
      ...(this.actionFilter && { action: this.actionFilter }),
      ...(this.fromDate && { from: this.fromDate }),
      ...(this.toDate && { to: this.toDate }),
    };

    this.activityService.getActivityLog(params).subscribe({
      next: (response) => {
        this.logs = response.logs;
        this.total = response.total;
        this.pages = response.pages;
      },
    });
  }

  onFilter(): void {
    this.page = 1;
    this.loadActivity();
  }

  getLoginLogs(): ActivityLog[] {
    return this.logs.filter(log => log.action.toLowerCase().includes('login'));
  }

  getLogoutLogs(): ActivityLog[] {
    return this.logs.filter(log => log.action.toLowerCase().includes('logout'));
  }

  getOtherLogs(): ActivityLog[] {
    return this.logs.filter(log => 
      !log.action.toLowerCase().includes('login') && 
      !log.action.toLowerCase().includes('logout')
    );
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  formatMeta(meta: any): string {
    if (!meta) return '';
    if (typeof meta === 'string') return meta;
    const entries = Object.entries(meta).map(([key, value]) => `${key}: ${value}`);
    return entries.join(', ');
  }

  toggleDetails(logId: string): void {
    if (this.expandedLogs.has(logId)) {
      this.expandedLogs.delete(logId);
    } else {
      this.expandedLogs.add(logId);
    }
  }

  isExpanded(logId: string): boolean {
    return this.expandedLogs.has(logId);
  }

  getMetaEntries(meta: any): { key: string; value: any }[] {
    if (!meta || typeof meta !== 'object') return [];
    return Object.entries(meta).map(([key, value]) => ({ key, value }));
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadActivity();
    }
  }

  nextPage(): void {
    if (this.page < this.pages) {
      this.page++;
      this.loadActivity();
    }
  }

  exportCSV(): void {
    const params: any = {
      ...(this.actionFilter && { action: this.actionFilter }),
      ...(this.fromDate && { from: this.fromDate }),
      ...(this.toDate && { to: this.toDate }),
    };

    this.activityService.getActivityLog(params).subscribe({
      next: (response) => {
        const csv = this.convertToCSV(response.logs);
        this.downloadCSV(csv, 'activity.csv');
      },
    });
  }

  private convertToCSV(data: ActivityLog[]): string {
    const headers = ['Timestamp', 'Actor', 'Email', 'Action', 'Target', 'Details'];
    const rows = data.map(l => [
      l.createdAt,
      l.actor.name,
      l.actor.email,
      l.action,
      l.target,
      JSON.stringify(l.meta || {}),
    ]);
    return [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
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

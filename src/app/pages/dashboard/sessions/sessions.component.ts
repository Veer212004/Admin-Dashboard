import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../services/session.service';
import { SocketService } from '../../../services/socket.service';
import { Session } from '../../../models/session.model';
import { Subject } from 'rxjs';
import { takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl shadow-lg p-4 md:p-6 border border-indigo-100">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div class="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span class="text-xl md:text-2xl">⚡</span>
              </div>
              Active Sessions
            </h1>
            <p class="text-xs md:text-sm text-slate-500 mt-2">Monitor and manage user sessions in real-time</p>
          </div>
          <div class="flex gap-2 md:gap-3">
            <div class="flex-1 md:flex-none px-3 md:px-5 py-2 md:py-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <span class="text-xs text-slate-500 block">Total Active</span>
              <p class="text-xl md:text-2xl font-bold text-indigo-600">{{ sessions.length }}</p>
            </div>
            <div class="flex-1 md:flex-none px-3 md:px-5 py-2 md:py-3 bg-white rounded-xl shadow-sm border border-slate-200">
              <span class="text-xs text-slate-500 block">Current Page</span>
              <p class="text-xl md:text-2xl font-bold text-purple-600">{{ page }}/{{ pages }}</p>
            </div>
          </div>
        </div>

        <!-- Enhanced Session Cards -->
        <div class="space-y-3">
          <div *ngFor="let session of sessions" 
               class="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-5 hover:shadow-md transition-all duration-200 hover:border-indigo-200">
            <!-- Mobile Layout -->
            <div class="md:hidden space-y-3">
              <!-- User Info -->
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {{ getInitials(session.user.name) }}
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-slate-900 truncate">{{ session.user.name }}</h3>
                    <span class="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200 shrink-0">Active</span>
                  </div>
                  <p class="text-xs text-slate-500 truncate">{{ session.user.email }}</p>
                </div>
              </div>

              <!-- Session Details Grid -->
              <div class="grid grid-cols-2 gap-2">
                <div class="bg-blue-50 rounded-lg p-2 border border-blue-100">
                  <div class="flex items-center gap-1 mb-1">
                    <span class="text-sm">🕐</span>
                    <span class="text-xs text-slate-600 font-medium">Started</span>
                  </div>
                  <p class="text-xs font-semibold text-slate-900">{{ session.startedAt | date: 'short' }}</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-2 border border-purple-100">
                  <div class="flex items-center gap-1 mb-1">
                    <span class="text-sm">⏱️</span>
                    <span class="text-xs text-slate-600 font-medium">Duration</span>
                  </div>
                  <p class="text-xs font-bold text-purple-600">{{ formatDuration(session.duration || 0) }}</p>
                </div>
              </div>

              <!-- IP & Device -->
              <div class="bg-indigo-50 rounded-lg p-2 border border-indigo-100">
                <div class="flex items-center gap-1 mb-1">
                  <span class="text-sm">🌐</span>
                  <span class="text-xs text-slate-600 font-medium">Location & Device</span>
                </div>
                <p class="text-xs font-semibold text-slate-700">{{ session.ip || 'N/A' }}</p>
                <p class="text-xs text-slate-500">{{ session.device || 'Unknown Device' }}</p>
              </div>

              <!-- Terminate Button -->
              <button
                (click)="terminateSession(session._id)"
                class="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition-colors border border-red-200 flex items-center justify-center gap-2">
                <span class="text-base">🚫</span>
                <span class="text-sm">Terminate Session</span>
              </button>
            </div>

            <!-- Desktop Layout -->
            <div class="hidden md:flex items-center justify-between gap-4">
              <!-- User Info -->
              <div class="flex items-center gap-4 flex-1">
                <div class="relative">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {{ getInitials(session.user.name) }}
                  </div>
                  <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-semibold text-slate-900">{{ session.user.name }}</h3>
                    <span class="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-200">Active</span>
                  </div>
                  <p class="text-sm text-slate-500">{{ session.user.email }}</p>
                </div>
              </div>

              <!-- Session Time Info -->
              <div class="flex items-center gap-6">
                <!-- Started At -->
                <div class="text-center">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <span class="text-sm">🕐</span>
                    </div>
                    <span class="text-xs text-slate-500 font-medium">Started</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-900">{{ session.startedAt | date: 'short' }}</p>
                </div>

                <!-- Duration -->
                <div class="text-center">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <span class="text-sm">⏱️</span>
                    </div>
                    <span class="text-xs text-slate-500 font-medium">Duration</span>
                  </div>
                  <p class="text-sm font-bold text-purple-600">{{ formatDuration(session.duration || 0) }}</p>
                </div>

                <!-- IP & Device -->
                <div class="text-center min-w-[150px]">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <span class="text-sm">🌐</span>
                    </div>
                    <span class="text-xs text-slate-500 font-medium">Location</span>
                  </div>
                  <p class="text-xs font-semibold text-slate-700">{{ session.ip || 'N/A' }}</p>
                  <p class="text-xs text-slate-500">{{ session.device || 'Unknown Device' }}</p>
                </div>

                <!-- Terminate Button -->
                <button
                  (click)="terminateSession(session._id)"
                  class="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl transition-colors border border-red-200 flex items-center gap-2">
                  <span class="text-lg">🚫</span>
                  <span class="text-xs">Terminate</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="sessions.length === 0" class="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div class="text-6xl mb-4">💤</div>
            <h3 class="text-xl font-semibold text-slate-700 mb-2">No Active Sessions</h3>
            <p class="text-slate-500">There are currently no active user sessions</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex flex-col md:flex-row justify-between items-center gap-3 bg-white rounded-xl p-3 md:p-4 border border-slate-200 shadow-sm">
          <span class="text-sm md:text-base text-slate-600 font-medium">Showing {{ sessions.length }} of {{ total }} sessions</span>
          <div class="flex gap-2 w-full md:w-auto">
            <button
              [disabled]="page === 1"
              (click)="previousPage()"
              class="flex-1 md:flex-none px-3 md:px-5 py-2 bg-white border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition font-medium text-slate-700 text-sm"
            >
              ← Previous
            </button>
            <div class="flex-1 md:flex-none px-3 md:px-5 py-2 bg-indigo-50 border border-indigo-200 rounded-xl font-semibold text-indigo-700 text-sm text-center">
              Page {{ page }} of {{ pages }}
            </div>
            <button
              [disabled]="page === pages"
              (click)="nextPage()"
              class="flex-1 md:flex-none px-3 md:px-5 py-2 bg-white border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition font-medium text-slate-700 text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class SessionsComponent implements OnInit, OnDestroy {
  sessions: Session[] = [];
  total = 0;
  page = 1;
  pages = 1;
  limit = 10;
  private destroy$ = new Subject<void>();

  constructor(
    private sessionService: SessionService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.loadSessions();
    this.setupRealtime();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSessions(): void {
    this.sessionService.getAllSessions({ page: this.page, limit: this.limit }).subscribe({
      next: (response) => {
        this.sessions = response.sessions;
        this.total = response.total;
        this.pages = response.pages;
      },
      error: (err) => console.error('Failed to load sessions:', err),
    });
  }

  private setupRealtime(): void {
    this.socketService.on<any>('sessionEnded').pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.sessions = this.sessions.filter(s => s._id !== data.sessionId);
    });
  }

  private startTimer(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.sessions.forEach(session => {
          if (!session.endedAt) {
            session.duration = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
          }
        });
      });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  terminateSession(id: string): void {
    if (confirm('Terminate this session?')) {
      this.sessionService.terminateSession(id).subscribe({
        next: () => {
          this.loadSessions();
        },
        error: (err) => console.error('Failed to terminate session:', err),
      });
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadSessions();
    }
  }

  nextPage(): void {
    if (this.page < this.pages) {
      this.page++;
      this.loadSessions();
    }
  }
}

import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../services/analytics.service';
import { SessionService } from '../../../services/session.service';
import { AnalyticsSummary } from '../../../models/analytics.model';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TutorialOverlayComponent } from './tutorial-overlay.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule, TutorialOverlayComponent],
  template: `
    <!-- Tutorial Overlay -->
    <app-tutorial-overlay #tutorialOverlay
                         (tutorialComplete)="onTutorialComplete()"
                         (tutorialSkipped)="onTutorialSkipped()">
    </app-tutorial-overlay>

    <!-- Floating Tutorial Button -->
    <button *ngIf="showTutorialButton"
            (click)="startTutorial()"
            class="fixed bottom-6 left-6 z-[9999] px-5 py-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center gap-2 group pointer-events-auto"
            title="Start Interactive Tutorial">
      <span class="text-2xl group-hover:rotate-12 transition-transform">🎓</span>
      <span class="font-semibold text-sm hidden sm:inline">Start Tutorial</span>
      <div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
        ?
      </div>
    </button>

    <div class="space-y-6">
      <!-- Hero + quick glance -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 hero-section">
        <div class="lg:col-span-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 text-white p-6 shadow-lg relative overflow-hidden">
          <div class="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div class="flex items-start justify-between relative z-10">
            <div>
              <p class="text-sm uppercase tracking-wide text-white/80">Welcome back</p>
              <h1 class="text-3xl font-bold mt-1">Analytics Overview</h1>
              <p class="text-white/80 mt-2">Realtime snapshot of users, sessions, and engagement.</p>
              <div class="mt-4 flex flex-wrap gap-3">
                <div class="px-4 py-2 rounded-lg bg-white/15 backdrop-blur flex items-center gap-2">
                  <span class="text-sm">Total Users</span>
                  <span class="text-xl font-semibold">{{ summary?.totalUsers || 0 }}</span>
                </div>
                <div class="px-4 py-2 rounded-lg bg-white/15 backdrop-blur flex items-center gap-2">
                  <span class="text-sm">Active</span>
                  <span class="text-xl font-semibold">{{ summary?.activeUsers || 0 }}</span>
                </div>
                <div class="px-4 py-2 rounded-lg bg-white/15 backdrop-blur flex items-center gap-2">
                  <span class="text-sm">Verified</span>
                  <span class="text-xl font-semibold">{{ summary?.verifiedUsers || 0 }}</span>
                </div>
              </div>
            </div>
            <div class="hidden md:block text-5xl">🎯</div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-2xl bg-white shadow-lg p-5 border border-slate-100">
            <p class="text-sm text-slate-500">Today Signups</p>
            <div class="flex items-end justify-between mt-2">
              <span class="text-3xl font-bold text-slate-900">{{ summary?.todaySignups || 0 }}</span>
              <span class="text-green-500 text-sm">▲ live</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-blue-500" [style.width]="(summary?.todaySignups || 0) > 0 ? '80%' : '20%'"></div>
            </div>
          </div>
          <div class="rounded-2xl bg-white shadow-lg p-5 border border-slate-100">
            <p class="text-sm text-slate-500">Avg Session (s)</p>
            <div class="flex items-end justify-between mt-2">
              <span class="text-3xl font-bold text-slate-900">{{ summary?.avgSessionDurationSec || 0 }}</span>
              <span class="text-indigo-500 text-sm">⏱ realtime</span>
            </div>
            <div class="mt-3 h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-indigo-500" [style.width]="(summary?.avgSessionDurationSec || 0) > 0 ? '70%' : '15%'"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- KPI row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Users Card -->
        <div class="rounded-2xl bg-white shadow border border-slate-100 p-5 total-users-card">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Total Users</p>
            <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl">👥</div>
          </div>
          <p class="text-3xl font-bold text-slate-900">{{ summary?.totalUsers || 0 }}</p>
          <div class="mt-3 h-12 relative">
            <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="totalUsersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:0.05" />
                </linearGradient>
              </defs>
              <path d="M 0,20 Q 20,15 40,18 T 80,12 L 100,10 L 100,40 L 0,40 Z" fill="url(#totalUsersGradient)" />
              <path d="M 0,20 Q 20,15 40,18 T 80,12 L 100,10" fill="none" stroke="#8b5cf6" stroke-width="2" />
              <circle cx="100" cy="10" r="3" fill="#8b5cf6">
                <title>Current: {{ summary?.totalUsers || 0 }}</title>
              </circle>
            </svg>
          </div>
          <p class="text-xs text-green-500 mt-1 flex items-center gap-1">
            <span>↗</span> Live count
          </p>
        </div>

        <!-- Active Now Card -->
        <div class="rounded-2xl bg-white shadow border border-slate-100 p-5 active-users-card">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Active Now</p>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">⚡</div>
          </div>
          <p class="text-3xl font-bold text-emerald-600">{{ summary?.activeUsers || 0 }}</p>
          <div class="mt-3 h-12 relative">
            <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="activeUsersGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.05" />
                </linearGradient>
              </defs>
              <path d="M 0,25 L 20,22 L 40,28 L 60,15 L 80,20 L 100,12 L 100,40 L 0,40 Z" fill="url(#activeUsersGradient)" />
              <path d="M 0,25 L 20,22 L 40,28 L 60,15 L 80,20 L 100,12" fill="none" stroke="#10b981" stroke-width="2" />
              <circle cx="100" cy="12" r="3" fill="#10b981">
                <title>Active: {{ summary?.activeUsers || 0 }}</title>
              </circle>
            </svg>
          </div>
          <p class="text-xs text-emerald-500 mt-1 flex items-center gap-1">
            <span>●</span> Sessions online
          </p>
        </div>

        <!-- Verified Card -->
        <div class="rounded-2xl bg-white shadow border border-slate-100 p-5 verified-card">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Verified</p>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">✅</div>
          </div>
          <p class="text-3xl font-bold text-indigo-600">{{ summary?.verifiedUsers || 0 }}</p>
          <div class="mt-3 h-12 relative">
            <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="verifiedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#6366f1;stop-opacity:0.05" />
                </linearGradient>
              </defs>
              <path d="M 0,30 Q 25,28 50,20 T 100,8 L 100,40 L 0,40 Z" fill="url(#verifiedGradient)" />
              <path d="M 0,30 Q 25,28 50,20 T 100,8" fill="none" stroke="#6366f1" stroke-width="2" />
              <circle cx="100" cy="8" r="3" fill="#6366f1">
                <title>Verified: {{ summary?.verifiedUsers || 0 }}</title>
              </circle>
            </svg>
          </div>
          <p class="text-xs text-indigo-500 mt-1 flex items-center gap-1">
            <span>↗</span> Email verified
          </p>
        </div>

        <!-- Today Signups Card -->
        <div class="rounded-2xl bg-white shadow border border-slate-100 p-5 signups-card">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Today Signups</p>
            <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">📈</div>
          </div>
          <p class="text-3xl font-bold text-blue-600">{{ summary?.todaySignups || 0 }}</p>
          <div class="mt-3 h-12 relative">
            <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="signupsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.3" />
                  <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0.05" />
                </linearGradient>
              </defs>
              <path d="M 0,28 L 20,30 L 40,25 L 60,22 L 80,18 L 100,10 L 100,40 L 0,40 Z" fill="url(#signupsGradient)" />
              <path d="M 0,28 L 20,30 L 40,25 L 60,22 L 80,18 L 100,10" fill="none" stroke="#3b82f6" stroke-width="2" />
              <circle cx="100" cy="10" r="3" fill="#3b82f6">
                <title>Today: {{ summary?.todaySignups || 0 }}</title>
              </circle>
            </svg>
          </div>
          <p class="text-xs text-blue-500 mt-1 flex items-center gap-1">
            <span>↗</span> Last 24h
          </p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Signup Trend Chart -->
        <div class="rounded-2xl bg-white shadow p-6 border border-slate-100 signup-chart">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-slate-900">Signup Trend</h2>
            <p class="text-xs text-slate-500">New user registrations</p>
          </div>
          <div class="h-64 relative">
            <canvas
              baseChart
              *ngIf="signupChartData.datasets[0].data.length > 0"
              [data]="signupChartData"
              [options]="signupChartOptions"
              [type]="'bar'"
            ></canvas>
            <div *ngIf="signupError" class="flex items-center justify-center h-full text-red-500 font-medium">
              {{ signupError }}
            </div>
            <div *ngIf="!signupError && signupChartData.datasets[0].data.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
              <div class="text-6xl mb-2">📊</div>
              <p class="text-sm">No signups in the selected window.</p>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl">👥</div>
              <div>
                <p class="text-xs text-slate-500">Total Signups</p>
                <p class="text-lg font-semibold text-slate-900">{{ summary?.totalUsers || 0 }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">📈</div>
              <div>
                <p class="text-xs text-slate-500">This Week</p>
                <p class="text-lg font-semibold text-slate-900">{{ summary?.todaySignups || 0 }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-xl">✅</div>
              <div>
                <p class="text-xs text-slate-500">Verified</p>
                <p class="text-lg font-semibold text-slate-900">{{ summary?.verifiedUsers || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Users Chart -->
        <div class="rounded-2xl bg-white shadow p-6 border border-slate-100 active-users-chart">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-slate-900">Active Users Forecast</h2>
            <p class="text-xs text-slate-500">Daily active engagement</p>
          </div>
          <div class="h-64 relative">
            <canvas
              baseChart
              *ngIf="activeUsersChartData.datasets[0].data.length > 0"
              [data]="activeUsersChartData"
              [options]="activeUsersChartOptions"
              [type]="'bar'"
            ></canvas>
            <div *ngIf="activeUsersError" class="flex items-center justify-center h-full text-red-500 font-medium">
              {{ activeUsersError }}
            </div>
            <div *ngIf="!activeUsersError && activeUsersChartData.datasets[0].data.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
              <div class="text-6xl mb-2">📊</div>
              <p class="text-sm">No active user data.</p>
            </div>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl">⏱</div>
              <div>
                <p class="text-xs text-slate-500">Total</p>
                <p class="text-lg font-semibold text-slate-900">{{ summary?.totalUsers || 0 }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl">🔥</div>
              <div>
                <p class="text-xs text-slate-500">Active</p>
                <p class="text-lg font-semibold text-slate-900">{{ summary?.activeUsers || 0 }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-xl">💎</div>
              <div>
                <p class="text-xs text-slate-500">Verified</p>
                <p class="text-lg font-semibold text-slate-900">{{ summary?.verifiedUsers || 0 }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Session Duration Chart -->
        <div class="rounded-2xl bg-white shadow p-6 border border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Avg Session Duration (Last 7 Days)</h2>
              <p class="text-xs text-slate-500">Average time spent per session</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs">Duration</span>
          </div>
          <div class="h-64 relative">
            <canvas
              baseChart
              *ngIf="sessionChartData.datasets[0].data.length > 0"
              [data]="sessionChartData"
              [options]="sessionChartOptions"
              [type]="'line'"
            ></canvas>
            <div *ngIf="sessionError" class="flex items-center justify-center h-full text-red-500 font-medium">
              {{ sessionError }}
            </div>
            <div *ngIf="!sessionError && sessionChartData.datasets[0].data.length === 0" class="flex items-center justify-center h-full text-gray-500">
              No session data.
            </div>
          </div>
        </div>

        <!-- Role Distribution Pie Chart -->
        <div class="rounded-2xl bg-white shadow p-6 border border-slate-100 demographics-chart">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Users by Role</h2>
              <p class="text-xs text-slate-500">Current distribution</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs">Roles</span>
          </div>
          <div class="h-64 relative">
            <canvas
              baseChart
              *ngIf="roleChartData.labels && roleChartData.labels.length > 0"
              [data]="roleChartData"
              [options]="roleChartOptions"
              [type]="'doughnut'"
            ></canvas>
            <div *ngIf="roleChartError" class="flex items-center justify-center h-full text-red-500 font-medium">
              {{ roleChartError }}
            </div>
            <div *ngIf="!roleChartError && (!roleChartData.labels || roleChartData.labels.length === 0)" class="flex items-center justify-center h-full text-gray-500">
              No role distribution data.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardHomeComponent implements OnInit, OnDestroy {
  @ViewChild('tutorialOverlay') tutorialOverlay!: TutorialOverlayComponent;
  
  summary: AnalyticsSummary | null = null;
  showTutorialButton = true;

  signupError = '';
  activeUsersError = '';
  sessionError = '';
  roleChartError = '';

  // Chart configurations
  signupChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Current Year',
        data: [],
        backgroundColor: '#6366f1',
        borderRadius: {
          topLeft: 20,
          topRight: 20,
          bottomLeft: 20,
          bottomRight: 20
        },
        barPercentage: 0.5,
        categoryPercentage: 0.8
      },
      {
        label: 'Last Year',
        data: [],
        backgroundColor: '#ec4899',
        borderRadius: {
          topLeft: 20,
          topRight: 20,
          bottomLeft: 20,
          bottomRight: 20
        },
        barPercentage: 0.5,
        categoryPercentage: 0.8
      }
    ]
  };

  activeUsersChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: '2024',
      data: [],
      backgroundColor: '#6366f1',
      borderRadius: {
        topLeft: 20,
        topRight: 20,
        bottomLeft: 20,
        bottomRight: 20
      },
      barPercentage: 0.5,
      categoryPercentage: 0.8
    }]
  };

  sessionChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Avg Duration (seconds)',
      data: [],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  roleChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#6366f1', // Indigo
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#ec4899', // Pink
        '#8b5cf6', // Purple
        '#06b6d4'  // Cyan
      ],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

  signupChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        align: 'end',
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
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: '#f1f5f9'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          },
          stepSize: 2.5
        }
      },
      x: {
        border: {
          display: false
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11
          }
        }
      }
    }
  };

  activeUsersChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: '#475569',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
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
            size: 11
          }
        }
      }
    }
  };

  sessionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  roleChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 12,
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
            const label = context.label || '';
            const value = context.parsed || 0;
            const dataset = context.dataset;
            const total = dataset.data.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  } as any;

  constructor(
    private analyticsService: AnalyticsService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    // Always show tutorial button (users can dismiss it if they want)
    this.showTutorialButton = true;
    
    this.loadAnalytics();
    this.loadChartData();
    this.setupRealtimeUpdates();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadAnalytics(): void {
    this.analyticsService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.analyticsService.setSummary(data);
        this.updateRoleChart(data);
      },
      error: (err) => console.error('Failed to load analytics:', err),
    });
  }

  private loadChartData(): void {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Load signup trend
    this.analyticsService.getSignupTrend(from, to).subscribe({
      next: (data) => {
        if (data.trend && data.trend.length > 0) {
          this.signupChartData.labels = data.trend.map(t => new Date(t._id).toLocaleDateString('en-US', { month: 'short' }));
          const counts = data.trend.map(t => t.count);
          this.signupChartData.datasets[0].data = counts;
          this.signupChartData.datasets[1].data = counts.map(() => 0);
        }
        this.signupError = '';
      },
      error: (err) => {
        console.error('Failed to load signup trend:', err);
        this.signupError = err.status === 403 ? 'Admin access required for analytics' : 'Could not load signups';
      }
    });

    // Load active users
    this.analyticsService.getActiveUsersByDay(from, to).subscribe({
      next: (data) => {
        if (data.data && data.data.length > 0) {
          this.activeUsersChartData.labels = data.data.map(d => new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          this.activeUsersChartData.datasets[0].data = data.data.map(d => d.count);
        } else {
          // Demo data when no real data exists
          const demoLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          this.activeUsersChartData.labels = demoLabels;
          this.activeUsersChartData.datasets[0].data = [5, 8, 6, 10, 7, 4, 6];
        }
        this.activeUsersError = '';
      },
      error: (err) => {
        console.error('Failed to load active users:', err);
        this.activeUsersError = err.status === 403 ? 'Admin access required for analytics' : 'Could not load active users';
      }
    });

    // Load session trend
    this.analyticsService.getSessionsTrend(from, to).subscribe({
      next: (data) => {
        if (data.trend && data.trend.length > 0) {
          this.sessionChartData.labels = data.trend.map(t => new Date(t._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          this.sessionChartData.datasets[0].data = data.trend.map(t => t.avgDuration);
        } else {
          // Demo data when no real data exists
          const demoLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          this.sessionChartData.labels = demoLabels;
          this.sessionChartData.datasets[0].data = [120, 180, 150, 200, 170, 140, 160];
        }
        this.sessionError = '';
      },
      error: (err) => {
        console.error('Failed to load session trend:', err);
        this.sessionError = err.status === 403 ? 'Admin access required for analytics' : 'Could not load sessions';
      }
    });
  }

  private updateRoleChart(summary: AnalyticsSummary): void {
    if (summary.roleDistribution && summary.roleDistribution.length > 0) {
      this.roleChartData.labels = summary.roleDistribution.map(r => r._id.toUpperCase());
      this.roleChartData.datasets[0].data = summary.roleDistribution.map(r => r.count);
      this.roleChartError = '';
    } else {
      this.roleChartError = '';
    }
  }

  private setupRealtimeUpdates(): void {
    // Socket updates would be handled here
    // You can subscribe to socket events and refresh data
  }

  startTutorial(): void {
    if (this.tutorialOverlay) {
      this.showTutorialButton = false;
      this.tutorialOverlay.startTutorial();
    }
  }

  onTutorialComplete(): void {
    this.showTutorialButton = false;
    // Save to localStorage to not show again
    localStorage.setItem('dashboardTutorialCompleted', 'true');
    console.log('Tutorial completed!');
  }

  onTutorialSkipped(): void {
    this.showTutorialButton = true;
    console.log('Tutorial skipped');
  }
}

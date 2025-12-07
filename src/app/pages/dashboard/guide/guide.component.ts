import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../services/analytics.service';
import { AnalyticsSummary } from '../../../models/analytics.model';

interface TutorialStep {
  id: number;
  title: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  features: string[];
  howTo: { step: string; action: string }[];
  tips: string[];
}

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <!-- Header -->
      <div class="max-w-6xl mx-auto mb-8">
        <div class="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-indigo-600">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Dashboard Tutorial
              </h1>
              <p class="text-gray-600 text-lg">Interactive guide to master your admin dashboard</p>
            </div>
            <div class="text-center bg-indigo-50 rounded-xl px-6 py-4">
              <div class="text-3xl font-bold text-indigo-600">{{ currentStep + 1 }}/{{ tutorialSteps.length }}</div>
              <div class="text-sm text-gray-600">Steps Completed</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                 [style.width.%]="((currentStep + 1) / tutorialSteps.length) * 100">
            </div>
          </div>
        </div>
      </div>

      <!-- Tutorial Content -->
      <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          <!-- Current Step Content -->
          <div class="p-8 md:p-12">
            <div class="flex items-center mb-6">
              <div [class]="'text-6xl mr-4 p-4 rounded-2xl bg-gradient-to-br ' + tutorialSteps[currentStep].gradient">
                {{ tutorialSteps[currentStep].icon }}
              </div>
              <div>
                <h2 class="text-3xl font-bold text-gray-900">{{ tutorialSteps[currentStep].title }}</h2>
                <p class="text-gray-600 mt-1">{{ tutorialSteps[currentStep].description }}</p>
              </div>
            </div>

            <!-- Features Section -->
            <div class="mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span class="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg mr-2">✨</span>
                Key Features
              </h3>
              <div class="grid md:grid-cols-2 gap-4">
                <div *ngFor="let feature of tutorialSteps[currentStep].features" 
                     class="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <span class="text-green-500 mr-3 text-xl">✓</span>
                  <span class="text-gray-700">{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- How To Section -->
            <div class="mb-8">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span class="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg mr-2">📖</span>
                How to Use
              </h3>
              <div class="space-y-4">
                <div *ngFor="let howTo of tutorialSteps[currentStep].howTo; let i = index" 
                     class="flex items-start">
                  <div [class]="'flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ' + tutorialSteps[currentStep].gradient + ' text-white flex items-center justify-center font-bold mr-4'">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1">
                    <h4 class="font-bold text-gray-900 mb-1">{{ howTo.step }}</h4>
                    <p class="text-gray-600">{{ howTo.action }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tips Section -->
            <div class="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span class="mr-2">💡</span>
                Pro Tips
              </h3>
              <ul class="space-y-2">
                <li *ngFor="let tip of tutorialSteps[currentStep].tips" class="text-gray-700 flex items-start">
                  <span class="text-yellow-500 mr-2">★</span>
                  <span>{{ tip }}</span>
                </li>
              </ul>
            </div>

            <!-- Analytics Integration (for Dashboard step) -->
            <div *ngIf="currentStep === 0 && summary" class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div class="text-3xl font-bold">{{ summary.totalUsers }}</div>
                <div class="text-sm opacity-90">Total Users</div>
              </div>
              <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                <div class="text-3xl font-bold">{{ summary.activeUsers }}</div>
                <div class="text-sm opacity-90">Active Now</div>
              </div>
              <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                <div class="text-3xl font-bold">{{ summary.todaySignups }}</div>
                <div class="text-sm opacity-90">Today Signups</div>
              </div>
              <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
                <div class="text-3xl font-bold">{{ summary.verifiedUsers }}</div>
                <div class="text-sm opacity-90">Verified Users</div>
              </div>
            </div>
          </div>

          <!-- Navigation Controls -->
          <div class="bg-gray-50 px-8 py-6 flex items-center justify-between border-t">
            <button (click)="previousStep()" 
                    [disabled]="currentStep === 0"
                    [class.opacity-50]="currentStep === 0"
                    [class.cursor-not-allowed]="currentStep === 0"
                    class="flex items-center px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition disabled:hover:bg-white">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Previous
            </button>

            <!-- Step Indicators -->
            <div class="flex space-x-2">
              <button *ngFor="let step of tutorialSteps; let i = index"
                      (click)="goToStep(i)"
                      [class.bg-indigo-600]="i === currentStep"
                      [class.bg-gray-300]="i !== currentStep"
                      class="w-3 h-3 rounded-full transition hover:scale-125">
              </button>
            </div>

            <button (click)="nextStep()" 
                    [disabled]="currentStep === tutorialSteps.length - 1"
                    [class.opacity-50]="currentStep === tutorialSteps.length - 1"
                    [class.cursor-not-allowed]="currentStep === tutorialSteps.length - 1"
                    class="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:hover:from-indigo-600 disabled:hover:to-purple-600">
              {{ currentStep === tutorialSteps.length - 1 ? 'Completed!' : 'Next' }}
              <svg *ngIf="currentStep !== tutorialSteps.length - 1" class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span *ngIf="currentStep === tutorialSteps.length - 1" class="ml-2">🎉</span>
            </button>
          </div>
        </div>

        <!-- Quick Navigation -->
        <div class="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button *ngFor="let step of tutorialSteps; let i = index"
                  (click)="goToStep(i)"
                  [class]="'p-4 rounded-xl text-white font-semibold transition hover:scale-105 ' + 
                           (i === currentStep ? 'ring-4 ring-offset-2 ring-indigo-400 ' : '') +
                           'bg-gradient-to-br ' + step.gradient">
            <div class="text-3xl mb-2">{{ step.icon }}</div>
            <div class="text-sm">{{ step.title }}</div>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class GuideComponent implements OnInit {
  summary: AnalyticsSummary | null = null;
  currentStep = 0;

  tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: 'Dashboard Overview',
      icon: '📊',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Monitor real-time analytics and system health',
      features: [
        'View total user count and growth trends',
        'Track active users currently online',
        'Monitor today\'s new signups',
        'Check email verification status',
        'Analyze user engagement with sparkline charts',
        'View demographic breakdowns by role'
      ],
      howTo: [
        { step: 'Navigate to Dashboard', action: 'Click "Dashboard" in the sidebar to view analytics home' },
        { step: 'Review Analytics Cards', action: 'Each card shows a key metric with trend indicators' },
        { step: 'Check Sparklines', action: 'Mini charts show data trends over the last 7 days' },
        { step: 'Analyze Charts', action: 'Bar charts display user distribution and activity patterns' }
      ],
      tips: [
        'Sparklines update in real-time as new data arrives',
        'Green arrows indicate positive growth trends',
        'Demographics chart helps understand your user base composition',
        'Refresh the page to see the latest statistics'
      ]
    },
    {
      id: 2,
      title: 'User Management',
      icon: '👥',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      description: 'Manage all users with powerful admin controls',
      features: [
        'View complete user list with profile details',
        'See dynamic gradient avatars with user initials',
        'Change user roles (User ↔ Admin)',
        'Delete users with confirmation',
        'Search and filter users by name/email',
        'Export user data to CSV format',
        'Real-time online status indicators'
      ],
      howTo: [
        { step: 'Access Users Page', action: 'Click "Users" in the sidebar to view all registered users' },
        { step: 'View User Details', action: 'Each row shows avatar, name, email, role, and online status' },
        { step: 'Change User Role', action: 'Click "Change to Admin/User" button to update permissions' },
        { step: 'Delete User', action: 'Click delete icon and confirm to remove user account' },
        { step: 'Export Data', action: 'Click "Export CSV" button to download user list' }
      ],
      tips: [
        'Use the search box to quickly find specific users',
        'Green dot indicates user is currently online',
        'Role changes take effect immediately',
        'Deleted users cannot be recovered - use with caution',
        'CSV export includes all user fields for backup'
      ]
    },
    {
      id: 3,
      title: 'Session Tracking',
      icon: '🔐',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      description: 'Monitor active sessions and user activity in real-time',
      features: [
        'View all active user sessions',
        'Live duration counter for each session',
        'Device and browser information',
        'IP address and location tracking',
        'Session termination controls',
        'Real-time session updates via WebSocket',
        'Session history and patterns'
      ],
      howTo: [
        { step: 'Open Sessions Page', action: 'Click "Sessions" in the sidebar' },
        { step: 'Monitor Active Sessions', action: 'See all currently logged-in users with live durations' },
        { step: 'View Session Details', action: 'Check device info, IP address, and login time' },
        { step: 'Terminate Session', action: 'Click "Terminate" button to force logout a user' },
        { step: 'Watch Real-time Updates', action: 'Session list updates automatically as users login/logout' }
      ],
      tips: [
        'Duration updates every second for precision tracking',
        'Multiple sessions per user indicate logins from different devices',
        'Terminate sessions for security if suspicious activity detected',
        'Session data helps identify peak usage times',
        'WebSocket ensures instant updates without page refresh'
      ]
    },
    {
      id: 4,
      title: 'Activity Logs',
      icon: '📝',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      description: 'Audit trail of all system actions and events',
      features: [
        'Three-column layout: Logins, Logouts, Other Activities',
        'Expandable details for each activity',
        'User avatars and timestamps',
        'Action type categorization',
        'IP address and device tracking',
        'Search and filter capabilities',
        'Export audit logs for compliance'
      ],
      howTo: [
        { step: 'Navigate to Activity', action: 'Click "Activity" in the sidebar' },
        { step: 'Browse Columns', action: 'Login activities on left, logouts in middle, other actions on right' },
        { step: 'Expand Details', action: 'Click "Show Details" to see full information about an activity' },
        { step: 'Check Metadata', action: 'View IP address, device info, and exact timestamps' },
        { step: 'Monitor Patterns', action: 'Identify unusual activity or security concerns' }
      ],
      tips: [
        'Organized columns make it easy to track specific event types',
        'Details include IP address for security auditing',
        'Look for patterns in login/logout times',
        'Export logs regularly for compliance records',
        'Expandable cards keep the interface clean while providing depth'
      ]
    },
    {
      id: 5,
      title: 'Kanban Board',
      icon: '📋',
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Manage user statuses with drag-and-drop interface',
      features: [
        'Four status columns for user categorization',
        'Email Verification Pending (new users)',
        'Active Users (verified and authorized)',
        'Suspended Users (blocked accounts)',
        'Role Change Pending (awaiting approval)',
        'Drag-and-drop to change user status',
        'Real-time updates across all admins',
        'Visual status indicators and badges'
      ],
      howTo: [
        { step: 'Open Kanban View', action: 'Click "Kanban" in the sidebar' },
        { step: 'Review User Cards', action: 'Each card shows user info, role, and current status' },
        { step: 'Drag to Move', action: 'Click and drag user cards between columns to update status' },
        { step: 'Update Authorization', action: 'Move users to "Suspended" column to block access' },
        { step: 'Handle Role Requests', action: 'Users in "Role Change Pending" are awaiting admin approval' }
      ],
      tips: [
        'Drag from "Email Verification Pending" to "Active" once verified',
        'Suspended users cannot login until moved back to Active',
        'Role change requests notify all admins automatically',
        'Status updates sync instantly via WebSocket',
        'Use Kanban for quick visual overview of user states'
      ]
    },
    {
      id: 6,
      title: 'Settings & Themes',
      icon: '⚙️',
      color: 'teal',
      gradient: 'from-teal-500 to-teal-600',
      description: 'Customize your profile and dashboard appearance',
      features: [
        'Edit username and profile information',
        'Request role changes (user → admin)',
        'Light and Dark theme modes',
        'Six color scheme options',
        'RTL/LTR text direction support',
        'Sidebar layout customization',
        'Theme persistence across sessions',
        'Floating theme bubble for quick access'
      ],
      howTo: [
        { step: 'Access Settings', action: 'Click "Settings" in the sidebar or your profile icon' },
        { step: 'Update Profile', action: 'Edit username field and click "Save Changes"' },
        { step: 'Request Role Change', action: 'Click "Request Admin Role" to notify admins' },
        { step: 'Open Theme Panel', action: 'Click the 🎨 bubble at bottom-right corner' },
        { step: 'Choose Theme', action: 'Toggle Light/Dark mode and select your preferred color scheme' },
        { step: 'Customize Layout', action: 'Set text direction, sidebar type, and other preferences' }
      ],
      tips: [
        'Theme changes apply instantly to all pages',
        'Selected themes persist across browser sessions',
        'Role change requests notify all admin users',
        'Dark mode reduces eye strain in low-light environments',
        'Experiment with different color schemes to find your favorite',
        'RTL mode supports languages like Arabic and Hebrew'
      ]
    }
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getSummary().subscribe({
      next: (data) => {
        this.summary = data;
      },
    });
  }

  nextStep(): void {
    if (this.currentStep < this.tutorialSteps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(index: number): void {
    this.currentStep = index;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { UserSettings } from '../../../models/auth.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <!-- Profile Section -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                [(ngModel)]="userName"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full md:w-96"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                [value]="userEmail"
                disabled
                class="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 w-full md:w-96 cursor-not-allowed"
              />
              <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
              <div class="flex items-center gap-3">
                <span class="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-bold text-sm">
                  {{ userRole }}
                </span>
                <button
                  *ngIf="userRole === 'user'"
                  (click)="requestRoleChange()"
                  [disabled]="roleChangeRequested"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {{ roleChangeRequested ? '⏳ Request Pending' : '👑 Request Admin Role' }}
                </button>
                <span *ngIf="roleChangeRequested" class="text-sm text-amber-600 font-semibold">
                  Awaiting admin approval
                </span>
              </div>
            </div>
            <button
              (click)="updateProfile()"
              class="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              💾 Save Profile Changes
            </button>
          </div>
        </div>

        <div *ngIf="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {{ errorMessage }}
        </div>
      </div>
    </div>

    <!-- Floating Theme Bubble -->
    <button
      (click)="toggleThemePanel()"
      class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-40 flex items-center justify-center"
      title="Theme Settings"
    >
      <span class="text-2xl">🎨</span>
    </button>

    <!-- Theme Panel Sidebar -->
    <div
      *ngIf="themePanelOpen"
      class="fixed inset-0 z-50"
      (click)="closeThemePanel()"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      <div
        (click)="$event.stopPropagation()"
        class="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto"
      >
        <!-- Panel Header -->
        <div class="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 flex items-center justify-between z-10">
          <div>
            <h2 class="text-2xl font-bold">Settings</h2>
            <p class="text-sm opacity-90">Customize your experience</p>
          </div>
          <button
            (click)="closeThemePanel()"
            class="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all"
          >
            <span class="text-2xl">✕</span>
          </button>
        </div>

        <!-- Panel Content -->
        <div class="p-6 space-y-6">
          <!-- Theme Option -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Theme Option</h3>
            <div class="flex gap-3">
              <button
                (click)="setTheme('light')"
                [class]="settings.theme === 'light' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'"
                class="flex-1 flex flex-col items-center gap-2 px-4 py-4 border-2 rounded-xl hover:border-indigo-400 transition-all"
              >
                <span class="text-3xl">☀️</span>
                <span class="font-semibold text-sm">Light</span>
                <span *ngIf="settings.theme === 'light'" class="text-indigo-600 font-bold">✓</span>
              </button>
              <button
                (click)="setTheme('dark')"
                [class]="settings.theme === 'dark' ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300'"
                class="flex-1 flex flex-col items-center gap-2 px-4 py-4 border-2 rounded-xl hover:border-slate-600 transition-all"
              >
                <span class="text-3xl">🌙</span>
                <span class="font-semibold text-sm">Dark</span>
                <span *ngIf="settings.theme === 'dark'" class="text-slate-300 font-bold">✓</span>
              </button>
            </div>
          </div>

          <!-- Theme Colors -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Theme Colors</h3>
            <div class="grid grid-cols-3 gap-3">
              <button
                *ngFor="let color of themeColors"
                (click)="setThemeColor(color.value)"
                [class]="selectedColor === color.value ? 'ring-4 ring-offset-2' : ''"
                [style.background]="color.gradient"
                [style.ring-color]="color.ring"
                class="h-20 rounded-xl shadow-md hover:scale-105 transition-all relative"
              >
                <span *ngIf="selectedColor === color.value" class="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">✓</span>
              </button>
            </div>
          </div>

          <!-- Theme Direction -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Theme Direction</h3>
            <div class="flex gap-3">
              <button
                (click)="setDirection('ltr')"
                [class]="settings.direction === 'ltr' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'"
                class="flex-1 flex flex-col items-center gap-2 px-4 py-4 border-2 rounded-xl hover:border-indigo-400 transition-all"
              >
                <span class="text-3xl">¶</span>
                <span class="font-semibold text-sm">LTR</span>
                <span *ngIf="settings.direction === 'ltr'" class="text-indigo-600 font-bold">✓</span>
              </button>
              <button
                (click)="setDirection('rtl')"
                [class]="settings.direction === 'rtl' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'"
                class="flex-1 flex flex-col items-center gap-2 px-4 py-4 border-2 rounded-xl hover:border-indigo-400 transition-all"
              >
                <span class="text-3xl">¶</span>
                <span class="font-semibold text-sm">RTL</span>
                <span *ngIf="settings.direction === 'rtl'" class="text-indigo-600 font-bold">✓</span>
              </button>
            </div>
          </div>

          <!-- Sidebar Type -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Sidebar type</h3>
            <div class="flex gap-3">
              <button
                (click)="setSidebarType('full')"
                [class]="settings.sidebarType === 'full' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'"
                class="flex-1 px-4 py-2 border-2 rounded-xl hover:border-indigo-400 transition-all font-semibold text-sm"
              >
                Full
              </button>
              <button
                (click)="setSidebarType('mini')"
                [class]="settings.sidebarType === 'mini' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'"
                class="flex-1 px-4 py-2 border-2 rounded-xl hover:border-indigo-400 transition-all font-semibold text-sm"
              >
                Mini
              </button>
              <button
                (click)="setSidebarType('hidden')"
                [class]="settings.sidebarType === 'hidden' ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300'"
                class="flex-1 px-4 py-2 border-2 rounded-xl hover:border-indigo-400 transition-all font-semibold text-sm"
              >
                Hidden
              </button>
            </div>
          </div>

          <!-- Preferences -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Preferences</h3>
            <div class="space-y-3">
              <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                <span class="font-semibold text-gray-700">Compact Spacing</span>
                <input
                  type="checkbox"
                  [(ngModel)]="settings.compactSpacing"
                  (ngModelChange)="saveSettings()"
                  class="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                <span class="font-semibold text-gray-700">Enable Animations</span>
                <input
                  type="checkbox"
                  [(ngModel)]="settings.animations"
                  (ngModelChange)="saveSettings()"
                  class="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit, OnDestroy {
  settings: UserSettings = {
    theme: 'light',
    sidebarType: 'full',
    layout: 'vertical',
    container: 'full',
    cardStyle: 'shadow',
    direction: 'ltr',
    compactSpacing: false,
    animations: true,
  };
  successMessage = '';
  errorMessage = '';
  themePanelOpen = false;
  userName = '';
  userEmail = '';
  userRole: 'user' | 'admin' = 'user';
  userId = '';
  roleChangeRequested = false;
  selectedColor = 'blue';

  themeColors = [
    { value: 'blue', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', ring: '#667eea' },
    { value: 'ocean', gradient: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)', ring: '#2E3192' },
    { value: 'purple', gradient: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)', ring: '#7F00FF' },
    { value: 'teal', gradient: 'linear-gradient(135deg, #0F2027 0%, #2C5364 100%)', ring: '#2C5364' },
    { value: 'cyan', gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)', ring: '#00d2ff' },
    { value: 'coral', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)', ring: '#ff6b6b' }
  ];

  private subscription: Subscription = new Subscription();

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.userId = currentUser._id;
      this.userName = currentUser.name;
      this.userEmail = currentUser.email;
      this.userRole = currentUser.role;
      this.roleChangeRequested = currentUser.roleChangeRequest?.status === 'pending';
      
      if (currentUser.settings) {
        this.settings = { ...this.settings, ...currentUser.settings };
      }
    }

    const savedThemeColor = localStorage.getItem('themeColor');
    if (savedThemeColor) {
      this.selectedColor = savedThemeColor;
      this.applyThemeColor(savedThemeColor);
    }

    this.applyTheme(this.settings.theme || 'light');
    this.applyDirection(this.settings.direction || 'ltr');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateProfile(): void {
    if (!this.userName.trim()) {
      this.errorMessage = 'Name cannot be empty';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.userService.updateUser(this.userId, { name: this.userName }).subscribe({
      next: () => {
        this.successMessage = 'Profile updated successfully!';
        setTimeout(() => this.successMessage = '', 3000);
        
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.authService.updateCurrentUser({ ...currentUser, name: this.userName });
        }
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
        this.errorMessage = 'Failed to update profile. Please try again.';
        setTimeout(() => this.errorMessage = '', 3000);
      },
    });
  }

  requestRoleChange(): void {
    if (this.roleChangeRequested) return;

    const requestData = {
      roleChangeRequest: {
        status: 'pending' as 'pending',
        requestedRole: 'admin' as 'admin',
        requestedBy: this.userId,
        requestedAt: new Date().toISOString()
      }
    };

    this.userService.updateUser(this.userId, requestData).subscribe({
      next: () => {
        this.roleChangeRequested = true;
        this.successMessage = 'Role change request submitted! Admin will review your request.';
        setTimeout(() => this.successMessage = '', 5000);

        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.authService.updateCurrentUser({
            ...currentUser,
            roleChangeRequest: requestData.roleChangeRequest as any
          });
        }
      },
      error: (err) => {
        console.error('Failed to request role change:', err);
        this.errorMessage = 'Failed to submit role change request. Please try again.';
        setTimeout(() => this.errorMessage = '', 3000);
      },
    });
  }

  toggleThemePanel(): void {
    this.themePanelOpen = !this.themePanelOpen;
  }

  closeThemePanel(): void {
    this.themePanelOpen = false;
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.settings.theme = theme;
    this.applyTheme(theme);
    this.saveSettings();
  }

  setThemeColor(color: string): void {
    this.selectedColor = color;
    localStorage.setItem('themeColor', color);
    this.applyThemeColor(color);
  }

  setDirection(direction: 'ltr' | 'rtl'): void {
    this.settings.direction = direction;
    this.applyDirection(direction);
    this.saveSettings();
  }

  setSidebarType(type: 'full' | 'mini' | 'hidden'): void {
    this.settings.sidebarType = type;
    this.saveSettings();
  }

  setLayout(layout: 'vertical' | 'horizontal'): void {
    this.settings.layout = layout;
    this.saveSettings();
  }

  setContainer(container: 'full' | 'boxed'): void {
    this.settings.container = container;
    this.saveSettings();
  }

  setCardStyle(style: 'shadow' | 'border'): void {
    this.settings.cardStyle = style;
    this.saveSettings();
  }

  applyTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    // Save to localStorage for persistence
    localStorage.setItem('theme', theme);
  }

  applyThemeColor(color: string): void {
    const colorMap: any = {
      blue: { 
        primary: '#667eea', 
        secondary: '#764ba2',
        light: '#a78bfa',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      ocean: { 
        primary: '#2E3192', 
        secondary: '#1BFFFF',
        light: '#06b6d4',
        gradient: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)'
      },
      purple: { 
        primary: '#7F00FF', 
        secondary: '#E100FF',
        light: '#c084fc',
        gradient: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)'
      },
      teal: { 
        primary: '#2C5364', 
        secondary: '#0F2027',
        light: '#14b8a6',
        gradient: 'linear-gradient(135deg, #0F2027 0%, #2C5364 100%)'
      },
      cyan: { 
        primary: '#00d2ff', 
        secondary: '#3a7bd5',
        light: '#22d3ee',
        gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
      },
      coral: { 
        primary: '#ff6b6b', 
        secondary: '#ee5a6f',
        light: '#fb7185',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
      }
    };

    const colors = colorMap[color] || colorMap.blue;
    
    // Apply CSS custom properties
    document.documentElement.style.setProperty('--primary-color', colors.primary);
    document.documentElement.style.setProperty('--secondary-color', colors.secondary);
    document.documentElement.style.setProperty('--primary-light', colors.light);
    document.documentElement.style.setProperty('--gradient-primary', colors.gradient);
    
    // Apply to body for immediate visual feedback
    const style = document.createElement('style');
    style.id = 'dynamic-theme-colors';
    const existingStyle = document.getElementById('dynamic-theme-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.innerHTML = `
      .bg-indigo-600, .bg-purple-500, .bg-blue-600 {
        background: ${colors.gradient} !important;
      }
      .bg-indigo-500, .bg-purple-400 {
        background-color: ${colors.primary} !important;
      }
      .bg-indigo-100 {
        background-color: ${colors.light}20 !important;
      }
      .text-indigo-600, .text-purple-600 {
        color: ${colors.primary} !important;
      }
      .border-indigo-500, .border-purple-500 {
        border-color: ${colors.primary} !important;
      }
      .ring-indigo-500 {
        --tw-ring-color: ${colors.primary} !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  applyDirection(direction: 'ltr' | 'rtl'): void {
    document.documentElement.dir = direction;
  }

  saveSettings(): void {
    this.userService.updateSettings(this.settings).subscribe({
      next: () => {
        this.successMessage = 'Settings saved successfully!';
        setTimeout(() => (this.successMessage = ''), 3000);
        
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.authService.updateCurrentUser({ ...currentUser, settings: this.settings });
        }
      },
      error: (err) => {
        console.error('Failed to save settings:', err);
        this.errorMessage = 'Failed to save settings. Please try again.';
        setTimeout(() => this.errorMessage = '', 3000);
      },
    });
  }
}

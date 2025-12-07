import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon: string;
  tips: string[];
}

@Component({
  selector: 'app-tutorial-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Dark Overlay with Cutout -->
    <div *ngIf="isActive" 
         class="fixed inset-0 z-40 transition-opacity duration-300 pointer-events-none">
      <!-- Top overlay -->
      <div *ngIf="highlightElement" 
           [style.height.px]="highlightElement.top"
           class="absolute top-0 left-0 right-0 bg-black/70">
      </div>
      <!-- Left overlay -->
      <div *ngIf="highlightElement" 
           [style.top.px]="highlightElement.top"
           [style.width.px]="highlightElement.left"
           [style.height.px]="highlightElement.height"
           class="absolute left-0 bg-black/70">
      </div>
      <!-- Right overlay -->
      <div *ngIf="highlightElement" 
           [style.top.px]="highlightElement.top"
           [style.left.px]="highlightElement.left + highlightElement.width"
           [style.height.px]="highlightElement.height"
           class="absolute right-0 bg-black/70">
      </div>
      <!-- Bottom overlay -->
      <div *ngIf="highlightElement" 
           [style.top.px]="highlightElement.top + highlightElement.height"
           class="absolute left-0 right-0 bottom-0 bg-black/70">
      </div>
    </div>

    <!-- Tutorial Card -->
    <div *ngIf="isActive && currentStepData"
         [style.top.px]="cardPosition.top"
         [style.left.px]="cardPosition.left"
         class="fixed z-[60] bg-white rounded-2xl shadow-2xl border-2 border-indigo-500 w-[95%] sm:w-[90%] md:max-w-md mx-auto transition-all duration-300 animate-fadeIn">
      
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 md:p-6 rounded-t-2xl">
        <div class="flex items-center justify-between mb-2 md:mb-3">
          <div class="flex items-center gap-2 md:gap-3">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl md:text-2xl backdrop-blur">
              {{ currentStepData.icon }}
            </div>
            <div>
              <h3 class="text-lg md:text-xl font-bold">{{ currentStepData.title }}</h3>
              <p class="text-xs md:text-sm text-white/80">Step {{ currentStep + 1 }} of {{ steps.length }}</p>
            </div>
          </div>
          <button (click)="skipTutorial()" 
                  class="w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Progress Bar -->
        <div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div class="bg-white h-2 rounded-full transition-all duration-500"
               [style.width.%]="((currentStep + 1) / steps.length) * 100">
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p class="text-gray-700 text-base mb-4 leading-relaxed">
          {{ currentStepData.description }}
        </p>

        <!-- Tips Section -->
        <div class="bg-gradient-to-br from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg p-4 mb-6">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">💡</span>
            <h4 class="font-bold text-gray-900">Quick Tips</h4>
          </div>
          <ul class="space-y-2">
            <li *ngFor="let tip of currentStepData.tips" class="text-sm text-gray-700 flex items-start gap-2">
              <span class="text-yellow-500 mt-0.5">★</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between">
          <button (click)="previousStep()" 
                  [disabled]="currentStep === 0"
                  [class.opacity-50]="currentStep === 0"
                  [class.cursor-not-allowed]="currentStep === 0"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition disabled:hover:bg-gray-100 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Previous
          </button>

          <div class="flex gap-1">
            <button *ngFor="let step of steps; let i = index"
                    (click)="goToStep(i)"
                    [class.bg-indigo-600]="i === currentStep"
                    [class.bg-gray-300]="i !== currentStep"
                    class="w-2 h-2 rounded-full transition hover:scale-150">
            </button>
          </div>

          <button (click)="nextStep()" 
                  class="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition flex items-center gap-2">
            {{ currentStep === steps.length - 1 ? 'Finish' : 'Next' }}
            <svg *ngIf="currentStep !== steps.length - 1" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span *ngIf="currentStep === steps.length - 1">🎉</span>
          </button>
        </div>

        <!-- Skip Tutorial Link -->
        <div class="text-center mt-4">
          <button (click)="skipTutorial()" 
                  class="text-sm text-gray-500 hover:text-gray-700 underline">
            Skip tutorial
          </button>
        </div>
      </div>
    </div>

    <!-- Highlight Spotlight -->
    <div *ngIf="isActive && highlightElement"
         [style.top.px]="highlightElement.top"
         [style.left.px]="highlightElement.left"
         [style.width.px]="highlightElement.width"
         [style.height.px]="highlightElement.height"
         class="fixed z-[55] pointer-events-none transition-all duration-300">
      <div class="absolute inset-0 rounded-2xl border-4 border-indigo-500 shadow-2xl shadow-indigo-500/50 animate-pulse"></div>
      <div class="absolute -inset-1 rounded-2xl border-2 border-white/50"></div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class TutorialOverlayComponent {
  @Output() tutorialComplete = new EventEmitter<void>();
  @Output() tutorialSkipped = new EventEmitter<void>();

  isActive = false;
  currentStep = 0;
  cardPosition = { top: 100, left: 100 };
  highlightElement: { top: number; left: number; width: number; height: number } | null = null;

  steps: TutorialStep[] = [
    {
      id: 1,
      title: 'Welcome to Analytics',
      description: 'This hero section gives you a quick overview of your entire platform. See total users, active sessions, and verified accounts at a glance.',
      targetSelector: '.hero-section',
      position: 'bottom',
      icon: '🎯',
      tips: [
        'The gradient background makes key metrics stand out',
        'Numbers update in real-time as users join',
        'Click on any metric to dive deeper'
      ]
    },
    {
      id: 2,
      title: 'Total Users Metric',
      description: 'Track the total number of registered users in your system. The sparkline shows growth trends over the past week.',
      targetSelector: '.total-users-card',
      position: 'top',
      icon: '👥',
      tips: [
        'The mini chart shows 7-day trend',
        'Green arrow indicates positive growth',
        'Click the card to view detailed user list'
      ]
    },
    {
      id: 3,
      title: 'Active Users Now',
      description: 'See how many users are currently online in real-time. This helps you understand peak usage times and engagement levels.',
      targetSelector: '.active-users-card',
      position: 'top',
      icon: '⚡',
      tips: [
        'Green color indicates active sessions',
        'Updates automatically via WebSocket',
        'Navigate to Sessions page for detailed view'
      ]
    },
    {
      id: 4,
      title: 'Verified Users',
      description: 'Monitor how many users have verified their email addresses. Email verification improves account security and reduces spam.',
      targetSelector: '.verified-card',
      position: 'top',
      icon: '✅',
      tips: [
        'Higher verification rate = better security',
        'Send reminder emails to unverified users',
        'Check Kanban board for pending verifications'
      ]
    },
    {
      id: 5,
      title: 'Today\'s Signups',
      description: 'Track new user registrations in the last 24 hours. This metric helps you measure marketing campaign effectiveness.',
      targetSelector: '.signups-card',
      position: 'top',
      icon: '📈',
      tips: [
        'Spikes often correlate with marketing campaigns',
        'Compare with previous days for trends',
        'Set up alerts for unusual signup patterns'
      ]
    },
    {
      id: 6,
      title: 'Signup Trend Chart',
      description: 'Visualize user registration patterns over time. The bar chart shows daily signups to help identify growth trends.',
      targetSelector: '.signup-chart',
      position: 'right',
      icon: '📊',
      tips: [
        'Hover over bars to see exact numbers',
        'Look for weekly patterns in signups',
        'Export chart data for reporting'
      ]
    },
    {
      id: 7,
      title: 'Active Users Chart',
      description: 'Analyze daily active user engagement. This dual-bar chart compares different user segments to show engagement patterns.',
      targetSelector: '.active-users-chart',
      position: 'left',
      icon: '📈',
      tips: [
        'Purple bars show admin activity',
        'Blue bars represent regular users',
        'Use this data to plan feature releases'
      ]
    },
    {
      id: 8,
      title: 'Demographics Breakdown',
      description: 'Understand your user base composition by gender and role. This pie chart helps you tailor features to your audience.',
      targetSelector: '.demographics-chart',
      position: 'right',
      icon: '🎨',
      tips: [
        'Click legend items to filter data',
        'Use demographics for targeted messaging',
        'Export data for detailed analysis'
      ]
    }
  ];

  get currentStepData(): TutorialStep | undefined {
    return this.steps[this.currentStep];
  }

  startTutorial(): void {
    this.isActive = true;
    this.currentStep = 0;
    setTimeout(() => this.updateHighlight(), 100);
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.updateHighlight();
    } else {
      this.completeTutorial();
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateHighlight();
    }
  }

  goToStep(index: number): void {
    this.currentStep = index;
    this.updateHighlight();
  }

  skipTutorial(): void {
    this.isActive = false;
    this.tutorialSkipped.emit();
  }

  completeTutorial(): void {
    this.isActive = false;
    this.tutorialComplete.emit();
  }

  private updateHighlight(): void {
    const step = this.currentStepData;
    if (!step) return;

    // Find target element
    const targetElement = document.querySelector(step.targetSelector);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      
      // Update highlight position (fixed to viewport)
      this.highlightElement = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      };

      // Calculate card position based on step position preference
      const cardWidth = 420;
      const cardHeight = 450;
      const padding = 20;

      let top = 0;
      let left = 0;

      // Position card in viewport (not absolute positioning)
      switch (step.position) {
        case 'top':
          top = Math.max(20, rect.top - cardHeight - padding);
          left = rect.left + (rect.width / 2) - (cardWidth / 2);
          break;
        case 'bottom':
          top = Math.min(window.innerHeight - cardHeight - 20, rect.bottom + padding);
          left = rect.left + (rect.width / 2) - (cardWidth / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (cardHeight / 2);
          left = Math.max(20, rect.left - cardWidth - padding);
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (cardHeight / 2);
          left = Math.min(window.innerWidth - cardWidth - 20, rect.right + padding);
          break;
      }

      // Final viewport boundary check
      top = Math.max(20, Math.min(top + window.scrollY, window.scrollY + window.innerHeight - cardHeight - 20));
      left = Math.max(20, Math.min(left, window.innerWidth - cardWidth - 20));

      this.cardPosition = { top, left };

      // Scroll element into view smoothly
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }
}

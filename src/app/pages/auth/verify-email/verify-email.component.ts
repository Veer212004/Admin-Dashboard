import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Email Verification</h1>

        <div *ngIf="loading" class="py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Verifying your email...</p>
        </div>

        <div *ngIf="!loading && success" class="py-8">
          <div class="text-green-500 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-green-600 mb-2">Email Verified!</h2>
          <p class="text-gray-600 mb-6">Your email has been successfully verified.</p>
          <a routerLink="/login" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
            Go to Login
          </a>
        </div>

        <div *ngIf="!loading && !success && errorMessage" class="py-8">
          <div class="text-red-500 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
          <p class="text-gray-600 mb-2">{{ errorMessage }}</p>
          <a routerLink="/login" class="inline-block text-blue-600 hover:text-blue-700 font-semibold">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class VerifyEmailComponent implements OnInit {
  loading = true;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const token = params['token'];
      const email = params['email'] || '';

      if (!token) {
        this.loading = false;
        this.errorMessage = 'No verification token found';
        return;
      }

      this.authService.verifyEmail({ token, email }).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Email verification failed';
        },
      });
    });
  }
}

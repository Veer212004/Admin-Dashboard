import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="admin@example.com"
            />
            <p *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
              Valid email is required
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
            <p *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
              Password is required
            </p>
          </div>

          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ errorMessage }}
          </div>

          <div class="flex items-center justify-between text-sm text-gray-700">
            <span>Didn't get verification?</span>
            <button
              type="button"
              class="text-blue-600 hover:text-blue-700 font-semibold"
              (click)="onResendVerification()"
              [disabled]="resendLoading"
            >
              {{ resendLoading ? 'Sending...' : 'Resend email' }}
            </button>
          </div>

          <div *ngIf="resendMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {{ resendMessage }}
            <span *ngIf="resendToken" class="block mt-1 text-gray-800 break-all">Token: {{ resendToken }}</span>
          </div>

          <div *ngIf="resendError" class="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            {{ resendError }}
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <a routerLink="/register" class="text-blue-600 hover:text-blue-700 font-semibold">Register here</a>
          </p>
        </div>

        <div class="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p class="font-semibold mb-2">Demo Credentials:</p>
          <p>Admin: admin@example.com / admin123</p>
          <p>User: john@example.com / password123</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  resendLoading = false;
  resendMessage = '';
  resendError = '';
  resendToken: string | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.authService.setCurrentUser(response.user);
        this.socketService.connect(response.user._id, response.user.role);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }

  onResendVerification(): void {
    this.resendMessage = '';
    this.resendError = '';
    this.resendToken = undefined;

    const emailCtrl = this.loginForm.get('email');
    if (!emailCtrl || emailCtrl.invalid) {
      this.resendError = 'Enter a valid email to resend verification.';
      emailCtrl?.markAsTouched();
      return;
    }

    const email = emailCtrl.value;
    this.resendLoading = true;

    this.authService.resendVerification(email).subscribe({
      next: (res) => {
        this.resendLoading = false;
        this.resendMessage = res.message || 'Verification email sent.';
        this.resendToken = res.verificationToken;
      },
      error: (err) => {
        this.resendLoading = false;
        this.resendError = err.error?.message || 'Failed to resend verification.';
      },
    });
  }
}

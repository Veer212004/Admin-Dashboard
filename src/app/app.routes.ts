import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/dashboard/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'sessions',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/dashboard/sessions/sessions.component').then(m => m.SessionsComponent),
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/dashboard/notifications/notifications.component').then(m => m.NotificationsComponent),
      },
      {
        path: 'activity',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/dashboard/activity/activity.component').then(m => m.ActivityComponent),
      },
      {
        path: 'kanban',
        loadComponent: () => import('./pages/dashboard/kanban/kanban.component').then(m => m.KanbanComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/dashboard/settings/settings.component').then(m => m.SettingsComponent),
      },
      {
        path: 'guide',
        loadComponent: () => import('./pages/dashboard/guide/guide.component').then(m => m.GuideComponent),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

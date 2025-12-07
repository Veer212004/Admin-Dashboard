export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  verified: boolean;
  createdAt?: string;
  lastLoginAt?: string;
  authorizationState?: 'active' | 'suspended';
  roleChangeRequest?: {
    status: 'pending' | 'approved' | 'rejected';
    requestedRole?: 'user' | 'admin';
    requestedBy?: string;
    requestedAt?: string;
  };
  profile?: {
    avatarUrl?: string;
    phone?: string;
  };
  settings?: UserSettings;
}

export interface UserSettings {
  theme?: 'light' | 'dark';
  sidebarType?: 'full' | 'mini' | 'hidden';
  layout?: 'vertical' | 'horizontal';
  container?: 'full' | 'boxed';
  cardStyle?: 'shadow' | 'border';
  direction?: 'ltr' | 'rtl';
  compactSpacing?: boolean;
  animations?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
  email: string;
}

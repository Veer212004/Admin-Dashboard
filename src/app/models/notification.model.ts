export interface Notification {
  _id: string;
  title: string;
  message: string;
  user?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pages: number;
}

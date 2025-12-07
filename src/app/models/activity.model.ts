export interface ActivityLog {
  _id: string;
  actor: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  target: string;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface ActivityResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  pages: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  todaySignups: number;
  roleDistribution: Array<{ _id: string; count: number }>;
  avgSessionDurationSec: number;
  activeSessionsCount: number;
}

export interface SignupTrend {
  _id: string;
  count: number;
}

export interface SessionTrend {
  _id: string;
  count: number;
  avgDuration: number;
}

export interface ActiveUsersByDay {
  _id: string;
  count: number;
}

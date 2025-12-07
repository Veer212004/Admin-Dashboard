export declare class AnalyticsService {
    getSummary(): Promise<{
        totalUsers: number;
        activeUsers: number;
        verifiedUsers: number;
        todaySignups: number;
        roleDistribution: any[];
        avgSessionDurationSec: number;
        activeSessionsCount: number;
    }>;
    getSignupTrend(from: Date, to: Date): Promise<any[]>;
    getSessionsTrend(from: Date, to: Date): Promise<any[]>;
    getActiveUsersByDay(from: Date, to: Date): Promise<any[]>;
}
export declare const analyticsService: AnalyticsService;
//# sourceMappingURL=AnalyticsService.d.ts.map
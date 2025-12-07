"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
class AnalyticsService {
    async getSummary() {
        const totalUsers = await User_1.User.countDocuments();
        const verifiedUsers = await User_1.User.countDocuments({ verified: true });
        const activeSessions = await Session_1.Session.find({ endedAt: null }).populate('user');
        const activeUsers = new Set(activeSessions.map((s) => s.user._id.toString())).size;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySignups = await User_1.User.countDocuments({ createdAt: { $gte: today } });
        const roleDistribution = await User_1.User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);
        const avgSessionDuration = await Session_1.Session.aggregate([
            {
                $match: { endedAt: { $ne: null } },
            },
            {
                $group: {
                    _id: null,
                    avgDuration: {
                        $avg: { $subtract: ['$endedAt', '$startedAt'] },
                    },
                },
            },
        ]);
        return {
            totalUsers,
            activeUsers,
            verifiedUsers,
            todaySignups,
            roleDistribution,
            avgSessionDurationSec: avgSessionDuration[0]?.avgDuration ? Math.floor(avgSessionDuration[0].avgDuration / 1000) : 0,
            activeSessionsCount: activeSessions.length,
        };
    }
    async getSignupTrend(from, to) {
        return await User_1.User.aggregate([
            {
                $match: {
                    createdAt: { $gte: from, $lte: to },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
    async getSessionsTrend(from, to) {
        return await Session_1.Session.aggregate([
            {
                $match: {
                    startedAt: { $gte: from, $lte: to },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
                    count: { $sum: 1 },
                    avgDuration: {
                        $avg: {
                            $cond: [
                                { $ne: ['$endedAt', null] },
                                { $subtract: ['$endedAt', '$startedAt'] },
                                null,
                            ],
                        },
                    },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
    async getActiveUsersByDay(from, to) {
        return await Session_1.Session.aggregate([
            {
                $match: {
                    startedAt: { $gte: from, $lte: to },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
                    uniqueUsers: { $addToSet: '$user' },
                },
            },
            {
                $project: {
                    _id: 1,
                    count: { $size: '$uniqueUsers' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=AnalyticsService.js.map
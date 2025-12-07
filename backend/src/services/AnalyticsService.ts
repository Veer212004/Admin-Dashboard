import { User } from '../models/User';
import { Session } from '../models/Session';

export class AnalyticsService {
  async getSummary() {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });

    const activeSessions = await Session.find({ endedAt: null }).populate('user');
    const activeUsers = new Set(activeSessions.map((s) => s.user._id.toString())).size;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySignups = await User.countDocuments({ createdAt: { $gte: today } });

    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const avgSessionDuration = await Session.aggregate([
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

  async getSignupTrend(from: Date, to: Date) {
    return await User.aggregate([
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

  async getSessionsTrend(from: Date, to: Date) {
    return await Session.aggregate([
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

  async getActiveUsersByDay(from: Date, to: Date) {
    return await Session.aggregate([
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

export const analyticsService = new AnalyticsService();

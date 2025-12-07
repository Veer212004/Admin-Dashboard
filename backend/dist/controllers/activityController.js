"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivity = exports.getActivityStats = exports.getActivityLog = void 0;
const ActivityLog_1 = require("../models/ActivityLog");
const getActivityLog = async (req, res) => {
    try {
        const { page = 1, limit = 10, actor, action, from, to, target, } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (actor) {
            filter.actor = actor;
        }
        if (action) {
            filter.action = action;
        }
        if (target) {
            filter.target = target;
        }
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = new Date(from);
            if (to)
                filter.createdAt.$lte = new Date(to);
        }
        const logs = await ActivityLog_1.ActivityLog.find(filter)
            .populate('actor', 'name email')
            .sort('-createdAt')
            .limit(limitNum)
            .skip(skip);
        const total = await ActivityLog_1.ActivityLog.countDocuments(filter);
        res.json({
            logs,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error('Get activity log error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getActivityLog = getActivityLog;
const getActivityStats = async (req, res) => {
    try {
        const actionCounts = await ActivityLog_1.ActivityLog.aggregate([
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const dailyActivity = await ActivityLog_1.ActivityLog.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        res.json({
            actionCounts,
            dailyActivity,
        });
    }
    catch (error) {
        console.error('Get activity stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getActivityStats = getActivityStats;
const getUserActivity = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const logs = await ActivityLog_1.ActivityLog.find({ actor: userId })
            .sort('-createdAt')
            .limit(limitNum)
            .skip(skip);
        const total = await ActivityLog_1.ActivityLog.countDocuments({ actor: userId });
        res.json({
            logs,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserActivity = getUserActivity;
//# sourceMappingURL=activityController.js.map
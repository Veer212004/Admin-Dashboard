import { Request, Response } from 'express';
import { ActivityLog } from '../models/ActivityLog';

export const getActivityLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      actor,
      action,
      from,
      to,
      target,
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

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
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    const logs = await ActivityLog.find(filter)
      .populate('actor', 'name email')
      .sort('-createdAt')
      .limit(limitNum)
      .skip(skip);

    const total = await ActivityLog.countDocuments(filter);

    res.json({
      logs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivityStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const actionCounts = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dailyActivity = await ActivityLog.aggregate([
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
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const logs = await ActivityLog.find({ actor: userId })
      .sort('-createdAt')
      .limit(limitNum)
      .skip(skip);

    const total = await ActivityLog.countDocuments({ actor: userId });

    res.json({
      logs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

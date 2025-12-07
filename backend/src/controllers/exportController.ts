import { Request, Response } from 'express';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { Session } from '../models/Session';

export const exportUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search = '',
      role,
      verified,
      format = 'csv',
    } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (verified !== undefined) {
      filter.verified = verified === 'true';
    }

    const users = await User.find(filter).select('-password').lean();

    // Get online status
    const activeSessions = await Session.find({ endedAt: null }).distinct('user');
    const onlineUserIds = new Set(activeSessions.map((id) => id.toString()));

    const usersWithStatus = users.map((user: any) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified ? 'Yes' : 'No',
      online: onlineUserIds.has(user._id.toString()) ? 'Yes' : 'No',
      lastLoginAt: user.lastLoginAt?.toISOString() || 'Never',
      createdAt: user.createdAt?.toISOString(),
    }));

    if (format === 'csv') {
      const headers = ['ID', 'Name', 'Email', 'Role', 'Verified', 'Online', 'Last Login', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...usersWithStatus.map((user: any) =>
          [user.id, user.name, user.email, user.role, user.verified, user.online, user.lastLoginAt, user.createdAt].join(',')
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send(csvContent);
    } else {
      res.json(usersWithStatus);
    }
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportActivityLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      actor,
      action,
      from,
      to,
      format = 'csv',
    } = req.query;

    const filter: any = {};

    if (actor) {
      filter.actor = actor;
    }

    if (action) {
      filter.action = action;
    }

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    const logs = await ActivityLog.find(filter)
      .populate('actor', 'name email')
      .lean();

    if (format === 'csv') {
      const headers = ['Timestamp', 'Actor', 'Email', 'Action', 'Target', 'Details'];
      const csvContent = [
        headers.join(','),
        ...logs.map((log: any) =>
          [
            log.createdAt?.toISOString(),
            log.actor?.name || 'Unknown',
            log.actor?.email || 'Unknown',
            log.action,
            log.target,
            JSON.stringify(log.meta || {}),
          ]
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(',')
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-log.csv');
      res.send(csvContent);
    } else {
      res.json(logs);
    }
  } catch (error) {
    console.error('Export activity log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format = 'csv' } = req.query;

    const sessions = await Session.find().populate('user', 'name email').lean();

    const sessionsData = sessions.map((session: any) => ({
      id: session._id,
      user: session.user?.name || 'Unknown',
      email: session.user?.email || 'Unknown',
      startedAt: session.startedAt?.toISOString(),
      endedAt: session.endedAt?.toISOString() || 'Active',
      ip: session.ip || 'N/A',
      device: session.device || 'N/A',
      duration: session.endedAt
        ? Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
        : Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    }));

    if (format === 'csv') {
      const headers = ['ID', 'User', 'Email', 'Started At', 'Ended At', 'IP', 'Device', 'Duration (sec)'];
      const csvContent = [
        headers.join(','),
        ...sessionsData.map((session: any) =>
          [session.id, session.user, session.email, session.startedAt, session.endedAt, session.ip, session.device, session.duration].join(',')
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sessions.csv');
      res.send(csvContent);
    } else {
      res.json(sessionsData);
    }
  } catch (error) {
    console.error('Export sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

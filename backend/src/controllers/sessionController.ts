import { Request, Response } from 'express';
import { Session } from '../models/Session';
import { ActivityLog } from '../models/ActivityLog';
import { Notification } from '../models/Notification';
import { socketManager } from '../utils/socket';

export const startSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { socketId, device, ip } = req.body;

    const session = new Session({
      user: req.userId,
      socketId,
      device,
      ip,
      startedAt: new Date(),
    });

    await session.save();
    socketManager.registerUserSocket(req.userId!, socketId);
    socketManager.emitSessionStarted(session);

    res.status(201).json(session);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const endSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await Session.findByIdAndUpdate(
      id,
      { endedAt: new Date() },
      { new: true }
    ).populate('user');

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    socketManager.unregisterUserSocket(session.user._id.toString());
    socketManager.emitSessionEnded(id);

    await ActivityLog.create({
      actor: req.userId,
      action: 'END_SESSION',
      target: id,
    });

    res.json({ message: 'Session ended', session });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActiveSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await Session.find({ endedAt: null })
      .populate('user', '-password')
      .sort('-startedAt');

    const sessionsWithDuration = sessions.map((session: any) => ({
      ...session.toObject(),
      duration: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    }));

    res.json({
      sessions: sessionsWithDuration,
      total: sessionsWithDuration.length,
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, userId } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (userId) {
      filter.user = userId;
    }

    const sessions = await Session.find(filter)
      .populate('user', '-password')
      .sort('-startedAt')
      .limit(limitNum)
      .skip(skip);

    const total = await Session.countDocuments(filter);

    const sessionsWithDuration = sessions.map((session: any) => ({
      ...session.toObject(),
      duration: session.endedAt
        ? Math.floor((session.endedAt.getTime() - session.startedAt.getTime()) / 1000)
        : Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
    }));

    res.json({
      sessions: sessionsWithDuration,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get all sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const terminateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await Session.findByIdAndUpdate(
      id,
      { endedAt: new Date() },
      { new: true }
    ).populate('user');

    if (!session) {
      res.status(404).json({ message: 'Session not found' });
      return;
    }

    socketManager.unregisterUserSocket(session.user._id.toString());
    socketManager.emitSessionEnded(id);

    await ActivityLog.create({
      actor: req.userId,
      action: 'TERMINATE_SESSION',
      target: id,
      meta: { userId: session.user._id },
    });

    await Notification.create({
      title: 'Session Terminated',
      message: 'One of your sessions has been terminated by an administrator',
      user: session.user._id,
    });

    res.json({ message: 'Session terminated', session });
  } catch (error) {
    console.error('Terminate session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

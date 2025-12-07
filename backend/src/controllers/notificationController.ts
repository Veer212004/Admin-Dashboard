import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { ActivityLog } from '../models/ActivityLog';
import { emailService } from '../services/EmailService';
import { socketManager } from '../utils/socket';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {
      $or: [{ user: req.userId }, { user: null }],
    };

    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .sort('-createdAt')
      .limit(limitNum)
      .skip(skip);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      ...filter,
      read: false,
    });

    res.json({
      notifications,
      total,
      unreadCount,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, title, message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const notification = new Notification({
      title,
      message,
      user: userId,
    });

    await notification.save();

    await ActivityLog.create({
      actor: req.userId,
      action: 'SEND_NOTIFICATION',
      target: userId,
      meta: { title, message },
    });

    socketManager.emitNotification({
      _id: notification._id,
      title,
      message,
      user: userId,
      createdAt: notification.createdAt,
    });

    res.status(201).json({ message: 'Notification sent', notification });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const broadcastMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, filter } = req.body;

    // Find users matching the filter
    let users = [];
    if (filter?.role) {
      users = await User.find({ role: filter.role });
    } else if (filter?.verified !== undefined) {
      users = await User.find({ verified: filter.verified });
    } else {
      users = await User.find({});
    }

    // Create notifications for each user and broadcast
    const notifications = [];
    for (const user of users) {
      const notification = new Notification({
        title,
        message,
        user: user._id,
      });
      notifications.push(notification);
      socketManager.emitNotification({
        _id: notification._id,
        title,
        message,
        user: user._id,
        createdAt: notification.createdAt,
      });

      // Optionally send email asynchronously
      if (filter?.sendEmail) {
        emailService.sendBroadcastMessage(user.email, title, message).catch((error) => {
          console.error('❌ Broadcast email failed (non-blocking):', error instanceof Error ? error.message : error);
        });
      }
    }

    await Notification.insertMany(notifications);

    await ActivityLog.create({
      actor: req.userId,
      action: 'BROADCAST_MESSAGE',
      target: 'broadcast',
      meta: { title, message, filter, recipientCount: users.length },
    });

    res.status(201).json({
      message: 'Message broadcast successfully',
      recipientCount: users.length,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Notification.countDocuments({
      $or: [{ user: req.userId }, { user: null }],
      read: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

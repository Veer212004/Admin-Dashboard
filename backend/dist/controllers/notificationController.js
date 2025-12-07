"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.broadcastMessage = exports.sendNotification = exports.markNotificationAsRead = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const ActivityLog_1 = require("../models/ActivityLog");
const EmailService_1 = require("../services/EmailService");
const socket_1 = require("../utils/socket");
const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, unreadOnly = false } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const filter = {
            $or: [{ user: req.userId }, { user: null }],
        };
        if (unreadOnly === 'true') {
            filter.read = false;
        }
        const notifications = await Notification_1.Notification.find(filter)
            .sort('-createdAt')
            .limit(limitNum)
            .skip(skip);
        const total = await Notification_1.Notification.countDocuments(filter);
        const unreadCount = await Notification_1.Notification.countDocuments({
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
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getNotifications = getNotifications;
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification_1.Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.json({ message: 'Notification marked as read', notification });
    }
    catch (error) {
        console.error('Mark notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const sendNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const notification = new Notification_1.Notification({
            title,
            message,
            user: userId,
        });
        await notification.save();
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'SEND_NOTIFICATION',
            target: userId,
            meta: { title, message },
        });
        socket_1.socketManager.emitNotification({
            _id: notification._id,
            title,
            message,
            user: userId,
            createdAt: notification.createdAt,
        });
        res.status(201).json({ message: 'Notification sent', notification });
    }
    catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.sendNotification = sendNotification;
const broadcastMessage = async (req, res) => {
    try {
        const { title, message, filter } = req.body;
        // Find users matching the filter
        let users = [];
        if (filter?.role) {
            users = await User_1.User.find({ role: filter.role });
        }
        else if (filter?.verified !== undefined) {
            users = await User_1.User.find({ verified: filter.verified });
        }
        else {
            users = await User_1.User.find({});
        }
        // Create notifications for each user and broadcast
        const notifications = [];
        for (const user of users) {
            const notification = new Notification_1.Notification({
                title,
                message,
                user: user._id,
            });
            notifications.push(notification);
            socket_1.socketManager.emitNotification({
                _id: notification._id,
                title,
                message,
                user: user._id,
                createdAt: notification.createdAt,
            });
            // Optionally send email
            if (filter?.sendEmail) {
                await EmailService_1.emailService.sendBroadcastMessage(user.email, title, message);
            }
        }
        await Notification_1.Notification.insertMany(notifications);
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'BROADCAST_MESSAGE',
            target: 'broadcast',
            meta: { title, message, filter, recipientCount: users.length },
        });
        res.status(201).json({
            message: 'Message broadcast successfully',
            recipientCount: users.length,
        });
    }
    catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.broadcastMessage = broadcastMessage;
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification_1.Notification.countDocuments({
            $or: [{ user: req.userId }, { user: null }],
            read: false,
        });
        res.json({ unreadCount: count });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=notificationController.js.map
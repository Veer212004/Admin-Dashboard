"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminateSession = exports.getAllSessions = exports.getActiveSessions = exports.endSession = exports.startSession = void 0;
const Session_1 = require("../models/Session");
const ActivityLog_1 = require("../models/ActivityLog");
const Notification_1 = require("../models/Notification");
const socket_1 = require("../utils/socket");
const startSession = async (req, res) => {
    try {
        const { socketId, device, ip } = req.body;
        const session = new Session_1.Session({
            user: req.userId,
            socketId,
            device,
            ip,
            startedAt: new Date(),
        });
        await session.save();
        socket_1.socketManager.registerUserSocket(req.userId, socketId);
        socket_1.socketManager.emitSessionStarted(session);
        res.status(201).json(session);
    }
    catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.startSession = startSession;
const endSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Session_1.Session.findByIdAndUpdate(id, { endedAt: new Date() }, { new: true }).populate('user');
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }
        socket_1.socketManager.unregisterUserSocket(session.user._id.toString());
        socket_1.socketManager.emitSessionEnded(id);
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'END_SESSION',
            target: id,
        });
        res.json({ message: 'Session ended', session });
    }
    catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.endSession = endSession;
const getActiveSessions = async (req, res) => {
    try {
        const sessions = await Session_1.Session.find({ endedAt: null })
            .populate('user', '-password')
            .sort('-startedAt');
        const sessionsWithDuration = sessions.map((session) => ({
            ...session.toObject(),
            duration: Math.floor((Date.now() - session.startedAt.getTime()) / 1000),
        }));
        res.json({
            sessions: sessionsWithDuration,
            total: sessionsWithDuration.length,
        });
    }
    catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getActiveSessions = getActiveSessions;
const getAllSessions = async (req, res) => {
    try {
        const { page = 1, limit = 10, userId } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (userId) {
            filter.user = userId;
        }
        const sessions = await Session_1.Session.find(filter)
            .populate('user', '-password')
            .sort('-startedAt')
            .limit(limitNum)
            .skip(skip);
        const total = await Session_1.Session.countDocuments(filter);
        const sessionsWithDuration = sessions.map((session) => ({
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
    }
    catch (error) {
        console.error('Get all sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllSessions = getAllSessions;
const terminateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await Session_1.Session.findByIdAndUpdate(id, { endedAt: new Date() }, { new: true }).populate('user');
        if (!session) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }
        socket_1.socketManager.unregisterUserSocket(session.user._id.toString());
        socket_1.socketManager.emitSessionEnded(id);
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'TERMINATE_SESSION',
            target: id,
            meta: { userId: session.user._id },
        });
        await Notification_1.Notification.create({
            title: 'Session Terminated',
            message: 'One of your sessions has been terminated by an administrator',
            user: session.user._id,
        });
        res.json({ message: 'Session terminated', session });
    }
    catch (error) {
        console.error('Terminate session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.terminateSession = terminateSession;
//# sourceMappingURL=sessionController.js.map
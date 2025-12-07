"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSettings = exports.deleteUser = exports.changeUserRole = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = require("../models/User");
const Session_1 = require("../models/Session");
const ActivityLog_1 = require("../models/ActivityLog");
const Notification_1 = require("../models/Notification");
const EmailService_1 = require("../services/EmailService");
const socket_1 = require("../utils/socket");
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', role, verified, online, sort = '-createdAt', from, to, } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
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
        if (from || to) {
            filter.createdAt = {};
            if (from)
                filter.createdAt.$gte = new Date(from);
            if (to)
                filter.createdAt.$lte = new Date(to);
        }
        const users = await User_1.User.find(filter)
            .select('-password')
            .sort(sort)
            .limit(limitNum)
            .skip(skip)
            .lean();
        // Get online status
        const activeSessions = await Session_1.Session.find({ endedAt: null }).distinct('user');
        const onlineUserIds = new Set(activeSessions.map((id) => id.toString()));
        const usersWithStatus = users.map((user) => ({
            ...user,
            online: onlineUserIds.has(user._id.toString()),
            lastLoginAt: user.lastLoginAt,
        }));
        // Filter by online status if requested
        let finalUsers = usersWithStatus;
        if (online !== undefined) {
            const isOnline = online === 'true';
            finalUsers = usersWithStatus.filter((u) => u.online === isOnline);
        }
        const total = await User_1.User.countDocuments(filter);
        res.json({
            users: finalUsers,
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const sessions = await Session_1.Session.find({ user: id }).sort('-startedAt');
        const activeSessions = sessions.filter((s) => !s.endedAt);
        res.json({
            ...user.toObject(),
            sessions: activeSessions,
            online: activeSessions.length > 0,
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, verified, authorizationState, roleChangeRequest } = req.body;
        const updateFields = {
            ...(name && { name }),
            ...(email && { email }),
            ...(phone && { 'profile.phone': phone }),
        };
        // Allow updating verified status
        if (verified !== undefined) {
            updateFields.verified = verified;
        }
        // Allow updating authorization state (active/suspended)
        if (authorizationState) {
            updateFields.authorizationState = authorizationState;
        }
        // Allow updating role change request (including clearing it)
        if (roleChangeRequest !== undefined) {
            if (roleChangeRequest === null) {
                updateFields.roleChangeRequest = null;
            }
            else {
                updateFields.roleChangeRequest = roleChangeRequest;
                // If user is requesting role change, notify all admins
                if (roleChangeRequest.status === 'pending') {
                    const adminUsers = await User_1.User.find({ role: 'admin' });
                    const requestingUser = await User_1.User.findById(id).select('name email');
                    for (const admin of adminUsers) {
                        await Notification_1.Notification.create({
                            title: 'Role Change Request',
                            message: `${requestingUser?.name} (${requestingUser?.email}) has requested a role change to ${roleChangeRequest.requestedRole}`,
                            user: admin._id,
                            type: 'info',
                        });
                    }
                    // Emit socket event to admins
                    socket_1.socketManager.emitToAdmins('roleChangeRequested', {
                        userId: id,
                        userName: requestingUser?.name,
                        userEmail: requestingUser?.email,
                        requestedRole: roleChangeRequest.requestedRole,
                    });
                }
            }
        }
        const user = await User_1.User.findByIdAndUpdate(id, { $set: updateFields }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'UPDATE_USER',
            target: id,
            meta: { updatedFields: Object.keys(updateFields) },
        });
        // Emit socket event for real-time updates
        socket_1.socketManager.emitUserUpdated(id, updateFields);
        res.json(user);
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateUser = updateUser;
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await User_1.User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'CHANGE_ROLE',
            target: id,
            meta: { newRole: role, oldRole: user.role },
        });
        await Notification_1.Notification.create({
            title: 'Role Changed',
            message: `Your role has been changed to ${role}`,
            user: id,
        });
        await EmailService_1.emailService.sendRoleChangeEmail(user.email, role);
        socket_1.socketManager.emitRoleChanged(id, role);
        socket_1.socketManager.emitUserUpdated(id, { role });
        res.json({
            message: 'Role changed successfully',
            user,
        });
    }
    catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.changeUserRole = changeUserRole;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_1.User.findByIdAndDelete(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await ActivityLog_1.ActivityLog.create({
            actor: req.userId,
            action: 'DELETE_USER',
            target: id,
            meta: { email: user.email },
        });
        await Notification_1.Notification.create({
            title: 'Account Deleted',
            message: 'Your account has been deleted',
            user: id,
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteUser = deleteUser;
const updateUserSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        const user = await User_1.User.findByIdAndUpdate(req.userId, { $set: { settings } }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'Settings updated', settings: user.settings });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateUserSettings = updateUserSettings;
//# sourceMappingURL=userController.js.map
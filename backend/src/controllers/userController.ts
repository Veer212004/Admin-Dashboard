import { Request, Response } from 'express';
import { User } from '../models/User';
import { Session } from '../models/Session';
import { ActivityLog } from '../models/ActivityLog';
import { Notification } from '../models/Notification';
import { emailService } from '../services/EmailService';
import { socketManager } from '../utils/socket';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role,
      verified,
      online,
      sort = '-createdAt',
      from,
      to,
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

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

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sort as string)
      .limit(limitNum)
      .skip(skip)
      .lean();

    // Get online status
    const activeSessions = await Session.find({ endedAt: null }).distinct('user');
    const onlineUserIds = new Set(activeSessions.map((id) => id.toString()));

    const usersWithStatus = users.map((user: any) => ({
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

    const total = await User.countDocuments(filter);

    res.json({
      users: finalUsers,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const sessions = await Session.find({ user: id }).sort('-startedAt');
    const activeSessions = sessions.filter((s) => !s.endedAt);

    res.json({
      ...user.toObject(),
      sessions: activeSessions,
      online: activeSessions.length > 0,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, verified, authorizationState, roleChangeRequest } = req.body;

    const updateFields: any = {
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
      } else {
        updateFields.roleChangeRequest = roleChangeRequest;
        
        // If user is requesting role change, notify all admins
        if (roleChangeRequest.status === 'pending') {
          const adminUsers = await User.find({ role: 'admin' });
          const requestingUser = await User.findById(id).select('name email');
          
          for (const admin of adminUsers) {
            await Notification.create({
              title: 'Role Change Request',
              message: `${requestingUser?.name} (${requestingUser?.email}) has requested a role change to ${roleChangeRequest.requestedRole}`,
              user: admin._id,
              type: 'info',
            });
          }
          
          // Emit socket event to admins
          socketManager.emitToAdmins('roleChangeRequested', {
            userId: id,
            userName: requestingUser?.name,
            userEmail: requestingUser?.email,
            requestedRole: roleChangeRequest.requestedRole,
          });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await ActivityLog.create({
      actor: req.userId,
      action: 'UPDATE_USER',
      target: id,
      meta: { updatedFields: Object.keys(updateFields) },
    });

    // Emit socket event for real-time updates
    socketManager.emitUserUpdated(id, updateFields);

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await ActivityLog.create({
      actor: req.userId,
      action: 'CHANGE_ROLE',
      target: id,
      meta: { newRole: role, oldRole: user.role },
    });

    await Notification.create({
      title: 'Role Changed',
      message: `Your role has been changed to ${role}`,
      user: id,
    });

    // Send email asynchronously to prevent blocking
    emailService.sendRoleChangeEmail(user.email, role).catch((error) => {
      console.error('❌ Role change email failed (non-blocking):', error instanceof Error ? error.message : error);
      console.error('Full error:', error);
    });

    socketManager.emitRoleChanged(id, role);
    socketManager.emitUserUpdated(id, { role });

    res.json({
      message: 'Role changed successfully',
      user,
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await ActivityLog.create({
      actor: req.userId,
      action: 'DELETE_USER',
      target: id,
      meta: { email: user.email },
    });

    await Notification.create({
      title: 'Account Deleted',
      message: 'Your account has been deleted',
      user: id,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { settings } },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'Settings updated', settings: user.settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

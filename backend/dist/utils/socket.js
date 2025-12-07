"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketManager = void 0;
class SocketManager {
    constructor() {
        this.io = null;
        this.userSockets = new Map();
    }
    setIO(io) {
        this.io = io;
    }
    getIO() {
        if (!this.io) {
            throw new Error('Socket.io not initialized');
        }
        return this.io;
    }
    registerUserSocket(userId, socketId) {
        this.userSockets.set(userId, socketId);
    }
    unregisterUserSocket(userId) {
        this.userSockets.delete(userId);
    }
    getUserSocketId(userId) {
        return this.userSockets.get(userId);
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }
    getOnlineUsersCount() {
        return this.userSockets.size;
    }
    getOnlineUserIds() {
        return Array.from(this.userSockets.keys());
    }
    emitToUser(userId, event, data) {
        const socketId = this.userSockets.get(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit(event, data);
        }
    }
    emitToRole(role, event, data) {
        if (this.io) {
            this.io.to(`role:${role}`).emit(event, data);
        }
    }
    emitToAll(event, data) {
        if (this.io) {
            this.io.emit(event, data);
        }
    }
    emitPresenceUpdate(userId, online, lastSeen) {
        if (this.io) {
            this.io.emit('presenceUpdate', {
                userId,
                online,
                lastSeen,
            });
        }
    }
    emitUserUpdated(userId, updates) {
        if (this.io) {
            this.io.emit('userUpdated', {
                userId,
                ...updates,
            });
        }
    }
    emitNotification(notification) {
        if (this.io) {
            if (notification.user) {
                this.emitToUser(notification.user.toString(), 'newNotification', notification);
            }
            else {
                this.io.emit('newNotification', notification);
            }
        }
    }
    emitAnalyticsUpdate(deltas) {
        if (this.io) {
            this.io.emit('analyticsUpdate', deltas);
        }
    }
    emitSessionStarted(session) {
        if (this.io) {
            this.io.emit('sessionStarted', session);
        }
    }
    emitSessionEnded(sessionId) {
        if (this.io) {
            this.io.emit('sessionEnded', { sessionId });
        }
    }
    emitRoleChanged(userId, newRole) {
        if (this.io) {
            this.emitToUser(userId, 'roleChanged', { userId, newRole });
        }
    }
    emitToAdmins(event, data) {
        if (this.io) {
            this.io.to('role:admin').emit(event, data);
        }
    }
    emitKanbanUpdate(boardId, update) {
        if (this.io) {
            this.io.to(`board:${boardId}`).emit('kanbanUpdate', update);
        }
    }
    joinRoom(socketId, room) {
        if (this.io) {
            this.io.sockets.sockets.get(socketId)?.join(room);
        }
    }
    leaveRoom(socketId, room) {
        if (this.io) {
            this.io.sockets.sockets.get(socketId)?.leave(room);
        }
    }
}
exports.socketManager = new SocketManager();
//# sourceMappingURL=socket.js.map
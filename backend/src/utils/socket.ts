import { Server as SocketIOServer, Socket } from 'socket.io';
import { Session } from '../models/Session';

export interface SocketUser {
  userId: string;
  role: 'user' | 'admin';
  socketId: string;
}

class SocketManager {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string> = new Map();

  setIO(io: SocketIOServer) {
    this.io = io;
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io not initialized');
    }
    return this.io;
  }

  registerUserSocket(userId: string, socketId: string) {
    this.userSockets.set(userId, socketId);
  }

  unregisterUserSocket(userId: string) {
    this.userSockets.delete(userId);
  }

  getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  emitToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  emitToRole(role: 'user' | 'admin', event: string, data: any) {
    if (this.io) {
      this.io.to(`role:${role}`).emit(event, data);
    }
  }

  emitToAll(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  emitPresenceUpdate(userId: string, online: boolean, lastSeen?: Date) {
    if (this.io) {
      this.io.emit('presenceUpdate', {
        userId,
        online,
        lastSeen,
      });
    }
  }

  emitUserUpdated(userId: string, updates: any) {
    if (this.io) {
      this.io.emit('userUpdated', {
        userId,
        ...updates,
      });
    }
  }

  emitNotification(notification: any) {
    if (this.io) {
      if (notification.user) {
        this.emitToUser(notification.user.toString(), 'newNotification', notification);
      } else {
        this.io.emit('newNotification', notification);
      }
    }
  }

  emitAnalyticsUpdate(deltas: any) {
    if (this.io) {
      this.io.emit('analyticsUpdate', deltas);
    }
  }

  emitSessionStarted(session: any) {
    if (this.io) {
      this.io.emit('sessionStarted', session);
    }
  }

  emitSessionEnded(sessionId: string) {
    if (this.io) {
      this.io.emit('sessionEnded', { sessionId });
    }
  }

  emitRoleChanged(userId: string, newRole: string) {
    if (this.io) {
      this.emitToUser(userId, 'roleChanged', { userId, newRole });
    }
  }

  emitToAdmins(event: string, data: any) {
    if (this.io) {
      this.io.to('role:admin').emit(event, data);
    }
  }

  emitKanbanUpdate(boardId: string, update: any) {
    if (this.io) {
      this.io.to(`board:${boardId}`).emit('kanbanUpdate', update);
    }
  }

  joinRoom(socketId: string, room: string) {
    if (this.io) {
      this.io.sockets.sockets.get(socketId)?.join(room);
    }
  }

  leaveRoom(socketId: string, room: string) {
    if (this.io) {
      this.io.sockets.sockets.get(socketId)?.leave(room);
    }
  }
}

export const socketManager = new SocketManager();

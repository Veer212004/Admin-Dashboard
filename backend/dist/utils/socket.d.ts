import { Server as SocketIOServer } from 'socket.io';
export interface SocketUser {
    userId: string;
    role: 'user' | 'admin';
    socketId: string;
}
declare class SocketManager {
    private io;
    private userSockets;
    setIO(io: SocketIOServer): void;
    getIO(): SocketIOServer;
    registerUserSocket(userId: string, socketId: string): void;
    unregisterUserSocket(userId: string): void;
    getUserSocketId(userId: string): string | undefined;
    isUserOnline(userId: string): boolean;
    getOnlineUsersCount(): number;
    getOnlineUserIds(): string[];
    emitToUser(userId: string, event: string, data: any): void;
    emitToRole(role: 'user' | 'admin', event: string, data: any): void;
    emitToAll(event: string, data: any): void;
    emitPresenceUpdate(userId: string, online: boolean, lastSeen?: Date): void;
    emitUserUpdated(userId: string, updates: any): void;
    emitNotification(notification: any): void;
    emitAnalyticsUpdate(deltas: any): void;
    emitSessionStarted(session: any): void;
    emitSessionEnded(sessionId: string): void;
    emitRoleChanged(userId: string, newRole: string): void;
    emitToAdmins(event: string, data: any): void;
    emitKanbanUpdate(boardId: string, update: any): void;
    joinRoom(socketId: string, room: string): void;
    leaveRoom(socketId: string, room: string): void;
}
export declare const socketManager: SocketManager;
export {};
//# sourceMappingURL=socket.d.ts.map
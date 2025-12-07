"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const socket_1 = require("./socket");
const Session_1 = require("../models/Session");
const setupSocketHandlers = (io) => {
    io.on('connection', (socket) => {
        console.log('New socket connection:', socket.id);
        socket.on('registerUserSocket', async (data) => {
            const { userId, role } = data;
            socket_1.socketManager.registerUserSocket(userId, socket.id);
            socket.join(`user:${userId}`);
            socket.join(`role:${role}`);
            socket.join('global');
            io.emit('onlineCountUpdate', {
                count: socket_1.socketManager.getOnlineUsersCount(),
                onlineUserIds: socket_1.socketManager.getOnlineUserIds(),
            });
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });
        socket.on('disconnect', async () => {
            console.log('Socket disconnected:', socket.id);
            // Find and end associated session
            const session = await Session_1.Session.findOneAndUpdate({ socketId: socket.id, endedAt: null }, { endedAt: new Date() }, { new: true }).populate('user');
            if (session) {
                socket_1.socketManager.unregisterUserSocket(session.user._id.toString());
                socket_1.socketManager.emitSessionEnded(session._id.toString());
                io.emit('onlineCountUpdate', {
                    count: socket_1.socketManager.getOnlineUsersCount(),
                    onlineUserIds: socket_1.socketManager.getOnlineUserIds(),
                });
            }
        });
        socket.on('heartbeat', (data) => {
            // Keep session alive
            console.log('Heartbeat received for session:', data.sessionId);
        });
        socket.on('terminateSession', async (data) => {
            await Session_1.Session.findByIdAndUpdate(data.sessionId, { endedAt: new Date() });
            socket_1.socketManager.emitSessionEnded(data.sessionId);
        });
        socket.on('joinBoardRoom', (data) => {
            socket.join(`board:${data.boardId}`);
        });
        socket.on('leaveBoardRoom', (data) => {
            socket.leave(`board:${data.boardId}`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=socketHandler.js.map
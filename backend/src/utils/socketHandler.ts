import { Socket, Server } from 'socket.io';
import { socketManager } from './socket';
import { Session } from '../models/Session';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New socket connection:', socket.id);

    socket.on('registerUserSocket', async (data: { userId: string; role: string }) => {
      const { userId, role } = data;

      socketManager.registerUserSocket(userId, socket.id);

      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);
      socket.join('global');

      io.emit('onlineCountUpdate', {
        count: socketManager.getOnlineUsersCount(),
        onlineUserIds: socketManager.getOnlineUserIds(),
      });

      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', async () => {
      console.log('Socket disconnected:', socket.id);

      // Find and end associated session
      const session = await Session.findOneAndUpdate(
        { socketId: socket.id, endedAt: null },
        { endedAt: new Date() },
        { new: true }
      ).populate('user');

      if (session) {
        socketManager.unregisterUserSocket(session.user._id.toString());
        socketManager.emitSessionEnded(session._id.toString());

        io.emit('onlineCountUpdate', {
          count: socketManager.getOnlineUsersCount(),
          onlineUserIds: socketManager.getOnlineUserIds(),
        });
      }
    });

    socket.on('heartbeat', (data: { sessionId: string }) => {
      // Keep session alive
      console.log('Heartbeat received for session:', data.sessionId);
    });

    socket.on('terminateSession', async (data: { sessionId: string }) => {
      await Session.findByIdAndUpdate(
        data.sessionId,
        { endedAt: new Date() }
      );
      socketManager.emitSessionEnded(data.sessionId);
    });

    socket.on('joinBoardRoom', (data: { boardId: string }) => {
      socket.join(`board:${data.boardId}`);
    });

    socket.on('leaveBoardRoom', (data: { boardId: string }) => {
      socket.leave(`board:${data.boardId}`);
    });
  });
};

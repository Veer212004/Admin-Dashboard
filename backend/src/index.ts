import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

import { connectMongoDB } from './config/mongodb';
import { socketManager } from './utils/socket';
import { setupSocketHandlers } from './utils/socketHandler';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import sessionRoutes from './routes/sessionRoutes';
import notificationRoutes from './routes/notificationRoutes';
import activityRoutes from './routes/activityRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import kanbanRoutes from './routes/kanbanRoutes';
import exportRoutes from './routes/exportRoutes';

// Load .env from backend directory
const envPath = path.resolve(__dirname, '../.env');
console.log('[Init] Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('[Init] SMTP_HOST:', process.env.SMTP_HOST);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: process.env.SOCKET_PATH || '/socket.io',
});

socketManager.setIO(io);

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '50'),
  message: 'Too many auth attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/export', exportRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
  });
});

// Socket.io handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();

    httpServer.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket available at ws://localhost:${PORT}${process.env.SOCKET_PATH || '/socket.io'}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { httpServer, io };

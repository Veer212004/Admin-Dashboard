"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const mongodb_1 = require("./config/mongodb");
const socket_1 = require("./utils/socket");
const socketHandler_1 = require("./utils/socketHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const kanbanRoutes_1 = __importDefault(require("./routes/kanbanRoutes"));
const exportRoutes_1 = __importDefault(require("./routes/exportRoutes"));
// Load .env from backend directory
const envPath = path_1.default.resolve(__dirname, '../.env');
console.log('[Init] Loading .env from:', envPath);
dotenv_1.default.config({ path: envPath });
console.log('[Init] SMTP_HOST:', process.env.SMTP_HOST);
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    path: process.env.SOCKET_PATH || '/socket.io',
});
exports.io = io;
socket_1.socketManager.setIO(io);
// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = (0, express_rate_limit_1.default)({
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
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/sessions', sessionRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/activity', activityRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/kanban', kanbanRoutes_1.default);
app.use('/api/export', exportRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(error.status || 500).json({
        message: error.message || 'Internal server error',
    });
});
// Socket.io handlers
(0, socketHandler_1.setupSocketHandlers)(io);
// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, mongodb_1.connectMongoDB)();
        httpServer.listen(PORT, () => {
            console.log(`\n✅ Server running on http://localhost:${PORT}`);
            console.log(`🔌 WebSocket available at ws://localhost:${PORT}${process.env.SOCKET_PATH || '/socket.io'}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api\n`);
        });
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map
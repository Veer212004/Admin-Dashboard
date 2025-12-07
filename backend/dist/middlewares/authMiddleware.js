"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.adminMiddleware = exports.authMiddleware = void 0;
const token_1 = require("../utils/token");
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    const payload = (0, token_1.verifyAccessToken)(token);
    if (!payload) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
    req.userId = payload.userId;
    req.userRole = payload.role;
    req.userEmail = payload.email;
    next();
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    if (!req.userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (req.userRole !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        const payload = (0, token_1.verifyAccessToken)(token);
        if (payload) {
            req.userId = payload.userId;
            req.userRole = payload.role;
            req.userEmail = payload.email;
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=authMiddleware.js.map
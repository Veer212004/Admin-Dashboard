"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKanbanCardValidator = exports.createKanbanCardValidator = exports.broadcastValidator = exports.sendNotificationValidator = exports.paginationValidator = exports.changeRoleValidator = exports.updateUserValidator = exports.refreshTokenValidator = exports.resendVerificationValidator = exports.verifyEmailValidator = exports.loginValidator = exports.registerValidator = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Auth validators
exports.registerValidator = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
exports.loginValidator = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
exports.verifyEmailValidator = [(0, express_validator_1.body)('token').notEmpty().withMessage('Token is required')];
exports.resendVerificationValidator = [(0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required')];
exports.refreshTokenValidator = [(0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required')];
// User validators
exports.updateUserValidator = [
    (0, express_validator_1.body)('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Valid email is required'),
];
exports.changeRoleValidator = [(0, express_validator_1.body)('role').isIn(['user', 'admin']).withMessage('Invalid role')];
// Pagination validators
exports.paginationValidator = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];
// Notification validators
exports.sendNotificationValidator = [
    (0, express_validator_1.body)('userId').notEmpty().withMessage('User ID is required'),
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('message').notEmpty().withMessage('Message is required'),
];
exports.broadcastValidator = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('message').notEmpty().withMessage('Message is required'),
];
// Kanban validators
exports.createKanbanCardValidator = [
    (0, express_validator_1.body)('title').trim().notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('boardId').notEmpty().withMessage('Board ID is required'),
    (0, express_validator_1.body)('column').isIn(['todo', 'inprogress', 'onhold', 'completed']).withMessage('Invalid column'),
    (0, express_validator_1.body)('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];
exports.updateKanbanCardValidator = [
    (0, express_validator_1.param)('id').notEmpty().withMessage('Card ID is required'),
    (0, express_validator_1.body)('title').optional().trim().notEmpty(),
    (0, express_validator_1.body)('column').optional().isIn(['todo', 'inprogress', 'onhold', 'completed']),
];
//# sourceMappingURL=validationMiddleware.js.map
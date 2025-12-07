import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    return;
  }
  next();
};

// Auth validators
export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const verifyEmailValidator = [body('token').notEmpty().withMessage('Token is required')];

export const resendVerificationValidator = [body('email').isEmail().withMessage('Valid email is required')];

export const refreshTokenValidator = [body('refreshToken').notEmpty().withMessage('Refresh token is required')];

// User validators
export const updateUserValidator = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
];

export const changeRoleValidator = [body('role').isIn(['user', 'admin']).withMessage('Invalid role')];

// Pagination validators
export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

// Notification validators
export const sendNotificationValidator = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
];

export const broadcastValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
];

// Kanban validators
export const createKanbanCardValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('boardId').notEmpty().withMessage('Board ID is required'),
  body('column').isIn(['todo', 'inprogress', 'onhold', 'completed']).withMessage('Invalid column'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];

export const updateKanbanCardValidator = [
  param('id').notEmpty().withMessage('Card ID is required'),
  body('title').optional().trim().notEmpty(),
  body('column').optional().isIn(['todo', 'inprogress', 'onhold', 'completed']),
];

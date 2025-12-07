import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: 'user' | 'admin';
      userEmail?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  req.userId = payload.userId;
  req.userRole = payload.role;
  req.userEmail = payload.email;

  next();
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.userId = payload.userId;
      req.userRole = payload.role;
      req.userEmail = payload.email;
    }
  }

  next();
};

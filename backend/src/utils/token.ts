import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { RefreshToken } from '../models/RefreshToken';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '1h',
  } as any);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret', {
    expiresIn: '7d',
  } as any);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const generateVerificationToken = (email?: string): string => {
  const payload = {
    type: 'email-verification',
    timestamp: Date.now(),
    email: email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '24h',
  });
};

export const verifyVerificationToken = (token: string): any | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
  } catch (error) {
    return null;
  }
};

export const saveRefreshToken = async (userId: string, token: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
  });
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.updateOne({ token }, { isRevoked: true });
};

export const isRefreshTokenValid = async (token: string): Promise<boolean> => {
  const refreshToken = await RefreshToken.findOne({ token, isRevoked: false });
  return !!refreshToken && new Date(refreshToken.expiresAt) > new Date();
};

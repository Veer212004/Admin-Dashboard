"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRefreshTokenValid = exports.revokeRefreshToken = exports.saveRefreshToken = exports.verifyVerificationToken = exports.generateVerificationToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const RefreshToken_1 = require("../models/RefreshToken");
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'default-secret', {
        expiresIn: '1h',
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret', {
        expiresIn: '7d',
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret');
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const generateVerificationToken = (email) => {
    const payload = {
        type: 'email-verification',
        timestamp: Date.now(),
        email: email,
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'default-secret', {
        expiresIn: '24h',
    });
};
exports.generateVerificationToken = generateVerificationToken;
const verifyVerificationToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
    }
    catch (error) {
        return null;
    }
};
exports.verifyVerificationToken = verifyVerificationToken;
const saveRefreshToken = async (userId, token) => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken_1.RefreshToken.create({
        user: userId,
        token,
        expiresAt,
    });
};
exports.saveRefreshToken = saveRefreshToken;
const revokeRefreshToken = async (token) => {
    await RefreshToken_1.RefreshToken.updateOne({ token }, { isRevoked: true });
};
exports.revokeRefreshToken = revokeRefreshToken;
const isRefreshTokenValid = async (token) => {
    const refreshToken = await RefreshToken_1.RefreshToken.findOne({ token, isRevoked: false });
    return !!refreshToken && new Date(refreshToken.expiresAt) > new Date();
};
exports.isRefreshTokenValid = isRefreshTokenValid;
//# sourceMappingURL=token.js.map
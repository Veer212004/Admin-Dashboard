export interface TokenPayload {
    userId: string;
    email: string;
    role: 'user' | 'admin';
}
export declare const generateAccessToken: (payload: TokenPayload) => string;
export declare const generateRefreshToken: (payload: TokenPayload) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload | null;
export declare const verifyRefreshToken: (token: string) => TokenPayload | null;
export declare const generateVerificationToken: (email?: string) => string;
export declare const verifyVerificationToken: (token: string) => any | null;
export declare const saveRefreshToken: (userId: string, token: string) => Promise<void>;
export declare const revokeRefreshToken: (token: string) => Promise<void>;
export declare const isRefreshTokenValid: (token: string) => Promise<boolean>;
//# sourceMappingURL=token.d.ts.map
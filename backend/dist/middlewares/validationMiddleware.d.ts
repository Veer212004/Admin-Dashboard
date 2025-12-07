import { Request, Response, NextFunction } from 'express';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const registerValidator: import("express-validator").ValidationChain[];
export declare const loginValidator: import("express-validator").ValidationChain[];
export declare const verifyEmailValidator: import("express-validator").ValidationChain[];
export declare const resendVerificationValidator: import("express-validator").ValidationChain[];
export declare const refreshTokenValidator: import("express-validator").ValidationChain[];
export declare const updateUserValidator: import("express-validator").ValidationChain[];
export declare const changeRoleValidator: import("express-validator").ValidationChain[];
export declare const paginationValidator: import("express-validator").ValidationChain[];
export declare const sendNotificationValidator: import("express-validator").ValidationChain[];
export declare const broadcastValidator: import("express-validator").ValidationChain[];
export declare const createKanbanCardValidator: import("express-validator").ValidationChain[];
export declare const updateKanbanCardValidator: import("express-validator").ValidationChain[];
//# sourceMappingURL=validationMiddleware.d.ts.map
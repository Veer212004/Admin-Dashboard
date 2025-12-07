import { Request, Response } from 'express';
export declare const startSession: (req: Request, res: Response) => Promise<void>;
export declare const endSession: (req: Request, res: Response) => Promise<void>;
export declare const getActiveSessions: (req: Request, res: Response) => Promise<void>;
export declare const getAllSessions: (req: Request, res: Response) => Promise<void>;
export declare const terminateSession: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=sessionController.d.ts.map
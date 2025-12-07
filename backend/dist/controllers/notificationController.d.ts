import { Request, Response } from 'express';
export declare const getNotifications: (req: Request, res: Response) => Promise<void>;
export declare const markNotificationAsRead: (req: Request, res: Response) => Promise<void>;
export declare const sendNotification: (req: Request, res: Response) => Promise<void>;
export declare const broadcastMessage: (req: Request, res: Response) => Promise<void>;
export declare const getUnreadCount: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=notificationController.d.ts.map
import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import {
  handleValidationErrors,
  sendNotificationValidator,
  broadcastValidator,
} from '../middlewares/validationMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);

router.get('/unread-count', notificationController.getUnreadCount);

router.post(
  '/mark-read/:id',
  notificationController.markNotificationAsRead
);

router.post(
  '/send',
  adminMiddleware,
  sendNotificationValidator,
  handleValidationErrors,
  notificationController.sendNotification
);

router.post(
  '/broadcast',
  adminMiddleware,
  broadcastValidator,
  handleValidationErrors,
  notificationController.broadcastMessage
);

export default router;

import { Router } from 'express';
import * as activityController from '../controllers/activityController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/', activityController.getActivityLog);

router.get('/stats', activityController.getActivityStats);

router.get('/user/:userId', activityController.getUserActivity);

export default router;

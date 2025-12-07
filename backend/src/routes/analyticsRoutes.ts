import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/summary', analyticsController.getSummary);

router.get('/signups', analyticsController.getSignupTrend);

router.get('/sessions', analyticsController.getSessionsTrend);

router.get('/active-users', analyticsController.getActiveUsersByDay);

export default router;

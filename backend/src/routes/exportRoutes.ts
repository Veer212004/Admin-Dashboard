import { Router } from 'express';
import * as exportController from '../controllers/exportController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', exportController.exportUsers);

router.get('/activity', exportController.exportActivityLog);

router.get('/sessions', exportController.exportSessions);

export default router;

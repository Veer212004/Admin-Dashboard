import { Router } from 'express';
import * as sessionController from '../controllers/sessionController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/start', sessionController.startSession);

router.post('/:id/end', sessionController.endSession);

router.get('/active', sessionController.getActiveSessions);

router.get('/', sessionController.getAllSessions);

router.post('/:id/terminate', adminMiddleware, sessionController.terminateSession);

export default router;

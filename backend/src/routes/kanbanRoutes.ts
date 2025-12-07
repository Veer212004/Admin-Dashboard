import { Router } from 'express';
import * as kanbanController from '../controllers/kanbanController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  handleValidationErrors,
  createKanbanCardValidator,
  updateKanbanCardValidator,
} from '../middlewares/validationMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/boards', kanbanController.createBoard);

router.get('/boards', kanbanController.getBoards);

router.get('/boards/:id', kanbanController.getBoardById);

router.post(
  '/cards',
  createKanbanCardValidator,
  handleValidationErrors,
  kanbanController.createCard
);

router.put(
  '/cards/:id',
  updateKanbanCardValidator,
  handleValidationErrors,
  kanbanController.updateCard
);

router.delete('/cards/:id', kanbanController.deleteCard);

router.put('/cards/:cardId/assignee/:assigneeId/role', kanbanController.updateAssigneeRole);

export default router;

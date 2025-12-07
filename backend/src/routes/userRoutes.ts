import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';
import {
  handleValidationErrors,
  paginationValidator,
  updateUserValidator,
  changeRoleValidator,
} from '../middlewares/validationMiddleware';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  paginationValidator,
  handleValidationErrors,
  userController.getUsers
);

router.get('/:id', userController.getUserById);

router.put('/:id', updateUserValidator, handleValidationErrors, userController.updateUser);

router.put(
  '/:id/role',
  adminMiddleware,
  changeRoleValidator,
  handleValidationErrors,
  userController.changeUserRole
);

router.delete('/:id', adminMiddleware, userController.deleteUser);

router.put('/settings/update', userController.updateUserSettings);

export default router;

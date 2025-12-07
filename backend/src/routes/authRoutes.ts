import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  handleValidationErrors,
  registerValidator,
  loginValidator,
  verifyEmailValidator,
  refreshTokenValidator,
  resendVerificationValidator,
} from '../middlewares/validationMiddleware';

const router = Router();

router.post(
  '/register',
  registerValidator,
  handleValidationErrors,
  authController.register
);

router.post(
  '/verify-email',
  verifyEmailValidator,
  handleValidationErrors,
  authController.verifyEmail
);

router.post(
  '/resend-verification',
  resendVerificationValidator,
  handleValidationErrors,
  authController.resendVerification
);

router.post(
  '/login',
  loginValidator,
  handleValidationErrors,
  authController.login
);

router.post(
  '/refresh',
  refreshTokenValidator,
  handleValidationErrors,
  authController.refresh
);

router.post(
  '/logout',
  authMiddleware,
  authController.logout
);

router.get(
  '/me',
  authMiddleware,
  authController.getCurrentUser
);

router.post(
  '/forgot-password',
  authController.forgotPassword
);

export default router;

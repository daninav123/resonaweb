import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  resetPasswordRequestSchema,
} from '../utils/validation';
import { authRateLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public routes (with rate limiting for auth endpoints)
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  authRateLimiter,
  validate(refreshTokenSchema),
  authController.refreshToken
);

router.post(
  '/password-reset',
  authRateLimiter,
  validate(resetPasswordRequestSchema),
  authController.requestPasswordReset
);

// Protected routes
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

export { router as authRouter };

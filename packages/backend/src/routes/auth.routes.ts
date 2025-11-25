import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { loginRateLimiter, registerRateLimiter, passwordResetRateLimiter, authRateLimiter } from '../middleware/rateLimiters';
import {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  resetPasswordRequestSchema,
} from '../utils/validation';

const router = Router();

// Public routes (with rate limiting for auth endpoints)
router.post(
  '/register',
  registerRateLimiter, // 3 intentos por hora
  validate(registerSchema),
  authController.register
);

router.post(
  '/login',
  loginRateLimiter, // 5 intentos cada 15 min
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
  passwordResetRateLimiter, // 3 intentos por hora
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

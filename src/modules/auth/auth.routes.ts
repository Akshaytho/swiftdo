import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  validate({ body: registerSchema }),
  (req, res, next) => authController.register(req, res, next)
);

// POST /api/v1/auth/login
router.post(
  '/login',
  validate({ body: loginSchema }),
  (req, res, next) => authController.login(req, res, next)
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  (req, res, next) => authController.refreshToken(req, res, next)
);

// GET /api/v1/auth/me
router.get(
  '/me',
  authenticate,
  (req, res, next) => authController.me(req, res, next)
);

export { router as authRoutes };

// login and logout routes

import { Router } from 'express';
import { login, logout, register } from '../controllers/authController.js';
import { loginSchema } from '../schemas/authSchema.js';
import { validate } from '../schemas/validate.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { Role } from '../generated/prisma/client.js';

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/logout
router.post('/logout', logout);

// POST /api/auth/register
router.post('/register', 
  authenticate, 
  authorize([Role.SUPER_ADMIN, Role.HR]),
  register
);

export default router;
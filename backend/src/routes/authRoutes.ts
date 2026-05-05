import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  register,
  login,
  refresh,
  logout,
  me,
  updateProfile,
  listPeers,
} from '../controllers/authController';

export const authRoutes = Router();

// Public routes
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/refresh', refresh);

// Protected routes
authRoutes.post('/logout', authMiddleware, logout);
authRoutes.get('/me', authMiddleware, me);
authRoutes.patch('/me', authMiddleware, updateProfile);
authRoutes.get('/peers', authMiddleware, listPeers);

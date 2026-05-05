import { Router } from 'express';
import { verifyQR } from '../controllers/verifyController';

export const verifyRoutes = Router();

// GET /verify/:hash — public, no auth required
verifyRoutes.get('/:hash', verifyQR);

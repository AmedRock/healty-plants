import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Açık endpoint'ler (token gerektirmez)
router.post('/register', register);
router.post('/login', login);

// Korumalı endpoint (geçerli token gerektirir)
router.get('/me', protect, getMe);

export default router;

import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// [MİMARİ] Public Endpoints (Açık Rotalar)
// JWT Token gerektirmeyen (authorization middlewaresi olmayan) authentication entry point'leri.
router.post('/register', register);
router.post('/login', login);

// [MİMARİ] Protected Endpoints (Korumalı Rotalar)
// Client'ın gönderdiği JWT'yi `protect` middleware'i ile filtreleyip geçerliyse `getMe` controller'ına aktaran rota.
router.get('/me', protect, getMe);

export default router;

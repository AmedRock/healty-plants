import express from 'express';
import { chatWithText } from '../controllers/chatController.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkAiLimit } from '../middlewares/aiLimitMiddleware.js';

const router = express.Router();

// [MİMARİ] Route Middlewares Pipeline (Zincirleme Middleware Mimarisi)
// 1. protect -> Kullanıcı giriş yapmış mı?
// 2. checkAiLimit -> Veritabanındaki günlük hakkı dolmuş mu?
// 3. aiRateLimiter -> Aynı IP'den spam atıyor mu (saatlik)?
// 4. chatWithText -> Her şey uygunsa Controller tetiklenir.
router.post('/', protect, checkAiLimit, aiRateLimiter, chatWithText);

export default router;


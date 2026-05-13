import express from 'express';
import { chatWithText } from '../controllers/chatController.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkAiLimit } from '../middlewares/aiLimitMiddleware.js';

const router = express.Router();

// Saf metin mesajları için AI chat endpoint'i (auth + limit koruması)
router.post('/', protect, checkAiLimit, aiRateLimiter, chatWithText);

export default router;


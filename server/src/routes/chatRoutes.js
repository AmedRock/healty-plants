import express from 'express';
import { chatWithText } from '../controllers/chatController.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';

const router = express.Router();

// Saf metin mesajları için AI chat endpoint'i
router.post('/', aiRateLimiter, chatWithText);

export default router;

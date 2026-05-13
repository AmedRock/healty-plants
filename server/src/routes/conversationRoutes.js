import express from 'express';
import { getConversations, getConversationById, deleteConversation } from '../controllers/conversationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getConversations);
router.get('/:id', protect, getConversationById);
router.delete('/:id', protect, deleteConversation);

export default router;

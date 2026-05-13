import { analyzeTextWithGemini } from '../services/geminiService.js';
import Conversation from '../models/ConversationModel.js';

export const chatWithText = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user._id;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Lütfen bir mesaj girin.' });
    }

    const aiResult = await analyzeTextWithGemini(message.trim());

    // Conversation bul veya oluştur
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, userId });
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Sohbet bulunamadı.' });
      }
    } else {
      // Başlık: ilk mesajın ilk 50 karakteri
      const title = message.trim().substring(0, 50) + (message.trim().length > 50 ? '...' : '');
      conversation = new Conversation({ userId, title });
    }

    // Kullanıcı mesajını ekle
    conversation.messages.push({ role: 'user', text: message.trim() });

    // AI cevabını ekle
    conversation.messages.push({ role: 'ai', aiData: aiResult });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        aiData: aiResult,
        conversationId: conversation._id
      },
      usage: {
        count: req.user.aiUsageCount,
        limit: req.user.aiUsageLimit
      }
    });

  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

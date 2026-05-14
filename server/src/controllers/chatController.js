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
      // [MİMARİ] Conversation Persistence (Sohbet Kalıcılığı)
      // Eğer frontend bir `conversationId` gönderdiyse mevcut sohbet dizisine ekleme yapacağız.
      // Eğer yoksa (yeni sohbet başlatıldıysa) yeni bir Conversation dokümanı oluşturulacak.
      const title = message.trim().substring(0, 50) + (message.trim().length > 50 ? '...' : '');
      conversation = new Conversation({ userId, title });
    }

    // [MİMARİ] Mesajların Alt Doküman Olarak Eklenmesi (Subdocument Push)
    // Kullanıcının attığı text mesajını 'user' rolüyle diziye ekliyoruz.
    conversation.messages.push({ role: 'user', text: message.trim() });

    // [MİMARİ] AI Yanıtı Entegrasyonu
    // Servisten dönen yapılandırılmış AI verisini, model şemasına uygun şekilde ekliyoruz.
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

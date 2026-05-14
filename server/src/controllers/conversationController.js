import Conversation from '../models/ConversationModel.js';

// [MİMARİ] GET /api/conversations (Sohbet Ön İzleme Listesi)
// Frontend'deki Sidebar bileşenini besleyen API. 
// Performans Optimizasyonu: .select() ile sadece başlık ve mesajlar çekilir, `.lean()` ile Mongoose dokümanları saf JS nesnelerine (POJO) dönüştürülür (hız ve bellek tasarrufu sağlar).
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .select('title updatedAt messages')
      .sort({ updatedAt: -1 })
      .lean();

    const list = conversations.map(conv => {
      const lastMsg = conv.messages[conv.messages.length - 1];
      const preview = lastMsg
        ? (lastMsg.text || lastMsg.aiData?.kisa_ozet || '').substring(0, 80)
        : '';
      return {
        _id: conv._id,
        title: conv.title,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
        preview
      };
    });

    res.status(200).json({ success: true, data: list, total: list.length });
  } catch (error) {
    console.error('GetConversations Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

// [MİMARİ] GET /api/conversations/:id (Sohbet Detayları)
// Belirli bir sohbetin tüm mesajlarını ve meta verilerini getirir.
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Sohbet bulunamadı.' });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('GetConversationById Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

// DELETE /api/conversations/:id — sohbet sil
export const deleteConversation = async (req, res) => {
  try {
    const deleted = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Sohbet bulunamadı.' });
    }

    res.status(200).json({ success: true, message: 'Sohbet silindi.' });
  } catch (error) {
    console.error('DeleteConversation Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

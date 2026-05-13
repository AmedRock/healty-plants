import Conversation from '../models/ConversationModel.js';

// GET /api/conversations — kullanıcının sohbet listesi (önizleme ile)
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

// GET /api/conversations/:id — tekil sohbet (tüm mesajlarıyla)
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

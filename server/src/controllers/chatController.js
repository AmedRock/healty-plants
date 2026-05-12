import { analyzeTextWithGemini } from '../services/geminiService.js';

export const chatWithText = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Lütfen bir mesaj girin.' });
    }

    const aiResult = await analyzeTextWithGemini(message.trim());

    res.status(200).json({
      success: true,
      data: {
        aiData: aiResult
      }
    });

  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';
import { analyzeMediaWithGemini } from '../services/geminiService.js';
import Analysis from '../models/AnalysisModel.js';

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Lütfen bir dosya seçin.' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    
    // Boyut güvenlik kontrolü
    if (isVideo && req.file.size > 20 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Video boyutu 20 MB sınırını aşıyor.' });
    }
    if (!isVideo && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Resim boyutu 5 MB sınırını aşıyor.' });
    }

    // 1. Cloudinary Upload (Promise tabanlı sarmalayıcı)
    const cloudinaryUpload = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'healty-plants-uploads', resource_type: isVideo ? 'video' : 'image' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    const cloudResult = await cloudinaryUpload;

    // 2. Gemini AI Analizi
    const aiResult = await analyzeMediaWithGemini(req.file.buffer, req.file.mimetype, req.body.text);

    // 3. MongoDB Kaydı
    const newAnalysis = new Analysis({
      mediaUrl: cloudResult.secure_url,
      mediaType: isVideo ? 'video' : 'image',
      aiResponse: aiResult
    });
    await newAnalysis.save();

    // 4. Client'a Döndür
    res.status(200).json({
      success: true,
      message: 'Analiz başarıyla tamamlandı.',
      data: {
        id: newAnalysis._id,
        url: cloudResult.secure_url,
        aiData: aiResult
      }
    });

  } catch (error) {
    console.error("Upload Controller Error:", error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { uploadRateLimiter } from '../middlewares/rateLimiter.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkAiLimit } from '../middlewares/aiLimitMiddleware.js';

const router = express.Router();

// [MİMARİ] Upload Middleware Pipeline
// Sırasıyla: Auth kontrolü -> Günlük AI Limit Kontrolü -> Genel API spam kontrolü -> AI spam kontrolü -> Multer ile RAM'e dosya alımı -> Cloudinary/Gemini Controller'ı.
router.post('/', protect, checkAiLimit, uploadRateLimiter, aiRateLimiter, upload.single('media'), uploadMedia);


// [MİMARİ] Global Error Handler (Hata Yakalayıcı) for Multer
// Express mimarisinde 4 parametreli fonksiyonlar hata yakalayıcı (error middleware) olarak davranır. Sadece dosya limiti/Multer hatalarını sarmalamak (catch) için kullanılır.
router.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Dosya boyutu çok büyük (Maks 20MB).' });
    }
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

export default router;

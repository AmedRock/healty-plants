import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { uploadRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Sadece bir tane medya (resim veya video) kabul ediyoruz
// İsim "media" olarak gönderilmeli
router.post('/', uploadRateLimiter, upload.single('media'), uploadMedia);

// Multer hata yakalayıcı middleware
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

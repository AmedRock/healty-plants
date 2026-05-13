import express from 'express';
import { uploadMedia } from '../controllers/uploadController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { uploadRateLimiter } from '../middlewares/rateLimiter.js';
import { aiRateLimiter } from '../middlewares/aiRateLimiter.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkAiLimit } from '../middlewares/aiLimitMiddleware.js';

const router = express.Router();

// Hem dosya yükleme hem de AI rate limiter uygulanır (auth + limit koruması)
router.post('/', protect, checkAiLimit, uploadRateLimiter, aiRateLimiter, upload.single('media'), uploadMedia);


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

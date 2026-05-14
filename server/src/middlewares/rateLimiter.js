import rateLimit from 'express-rate-limit';

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20, // 15 dakika içinde maksimum 20 dosya yükleme
  message: {
    success: false,
    message: 'Çok fazla dosya yükleme isteği gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // [MİMARİ BİLGİ] Zaman penceresi: 1 Saatte en fazla 15 analiz isteği (Makul Sınır)
  max: 15, // Saatte en fazla 15 analiz isteği (Makul Sınır)
  message: {
    success: false,
    message: 'Kullanım limitiniz doldu. Sistemi korumak amacıyla saatlik analiz kotanızı doldurdunuz. Lütfen daha sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

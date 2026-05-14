import rateLimit from 'express-rate-limit';

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // [MİMARİ] Zaman Penceresi (Window): 15 Dakika
  max: 50, // [BİLEŞEN] Güvenlik Limiti: Aynı IP adresinden 15 dakika içinde en fazla 50 dosya yüklenebilir (Disk/Memory flood koruması).
  message: {
    success: false,
    message: 'Çok fazla dosya yükleme isteği gönderdiniz. Lütfen 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // [MİMARİ] Stateless Authentication (Durumsuz Doğrulama)
    // Authorization başlığında (header) 'Bearer <token>' formatı kullanılarak sunucuya oturum durumu (session id) gönderilmez.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor.',
        code: 'TOKEN_MISSING'
      });
    }

    // [MİMARİ] Kriptografik İmza Doğrulaması (Signature Verification)
    // JWT_SECRET kullanılarak token'ın bütünlüğü (tampered) ve süresi (expired) asenkron olmayan (senkron) şekilde doğrulanır.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // [BİLEŞEN] Varlık Doğrulaması (Entity Validation)
    // Token geçerli olsa bile kullanıcının veritabanından silinmiş olma ihtimaline karşı ek güvenlik kontrolü.
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Bu token'a ait kullanıcı bulunamadı.",
        code: 'USER_NOT_FOUND'
      });
    }

    // [MİMARİ] Request Context Payload (Bağlam Enjeksiyonu)
    // Doğrulanan kullanıcı nesnesi `req.user` içine gömülerek kendisinden sonraki Controller'ların (örn. chatController) bu kullanıcıya doğrudan erişmesi sağlanır.
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz oturum. Lütfen tekrar giriş yapın.',
        code: 'TOKEN_INVALID'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası.' });
  }
};

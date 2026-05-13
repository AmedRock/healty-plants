import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Authorization: Bearer <token> başlığını kontrol et
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

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı veritabanından getir
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Bu token'a ait kullanıcı bulunamadı.",
        code: 'USER_NOT_FOUND'
      });
    }

    // req.user'a ekle → sonraki middleware'ler kullanabilir
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

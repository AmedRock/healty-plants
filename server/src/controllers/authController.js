import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

// JWT token oluşturucu
// [MİMARİ] JWT Token Oluşturucu (Stateless Auth)
// Sunucu RAM'inde oturum (session) tutmak yerine bilgiyi imzalı bir token içerisine gömüyoruz.
// jwt.sign() ile { id } payload'ı şifrelenir ve istemciye gönderilir.
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// [MİMARİ] DTO (Data Transfer Object) Benzeri Veri Temizleyici
// Veritabanı dokümanından (User) sadece istemcinin ihtiyacı olan alanları çıkarır. (Şifre veya gereksiz alanların sızmasını önler)
const buildUserPayload = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  aiUsageCount: user.aiUsageCount,
  aiUsageLimit: user.aiUsageLimit,
  aiUsageResetDate: user.aiUsageResetDate,
  createdAt: user.createdAt
});

// ---------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    // [VALIDATION] Tüm zorunlu alanların varlığı kontrol edilir
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Tüm alanlar zorunludur.' });
    }

    // [VALIDATION] İki şifrenin eşleşme kontrolü
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Şifreler eşleşmiyor.' });
    }

    // [VALIDATION] Güvenlik için minimum karakter sınırı
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    // [MİMARİ] Email Uniqueness Check (Benzersizlik Kontrolü)
    // Aynı email ile mükerrer kayıt açılmasını engelliyoruz. Aramaları case-insensitive (küçük harf) yapıyoruz.
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Bu email adresi zaten kayıtlı.' });
    }

    // Kullanıcı oluştur (şifre model pre-save hook'unda hashleniyor)
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Hesabınız başarıyla oluşturuldu!',
      token,
      user: buildUserPayload(user)
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

// ---------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email ve şifre zorunludur.' });
    }

    // [MİMARİ] Sensitive data access
    // select('+password') → password alanı select:false olduğu için açıkça çekiyoruz
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Email veya şifre hatalı.' });
    }

    // [İŞ MANTIĞI] Günlük Limitlerin Yenilenmesi (Lazy Reset Pattern)
    // Cron job (zamanlanmış görev) kullanmak yerine, kullanıcı işlem yaptığında zaman kontrolü yapıp hakları o an sıfırlıyoruz.
    await user.checkAndResetUsage();

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı!',
      token,
      user: buildUserPayload(user)
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

// ---------------------------------------------------------------
// GET /api/auth/me  (korumalı)
// ---------------------------------------------------------------
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }

    // Günlük reset kontrolü
    await user.checkAndResetUsage();

    res.status(200).json({
      success: true,
      user: buildUserPayload(user)
    });

  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası: ' + error.message });
  }
};

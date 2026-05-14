import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Ad alanı zorunludur'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyad alanı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi girin']
  },
  password: {
    type: String,
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false // [MİMARİ BİLGİ] select: false -> Güvenlik önlemi. Veritabanından kullanıcı çekilirken password alanının kazara frontende sızmasını engeller. (Açıkça .select('+password') denmedikçe gelmez)
  },
  aiUsageCount: {
    type: Number,
    default: 0
  },
  aiUsageLimit: {
    type: Number,
    default: 50 // [BİLEŞEN] aiUsageLimit -> Sistemin sömürülmesini engellemek için kullanıcı başına günlük kota uygulanmıştır.
  },
  aiUsageResetDate: {
    type: Date,
    default: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// [MİMARİ] Mongoose Pre-Save Hook (Şifre Hashleme)
// Kullanıcı şifresi asla düz metin (plain text) olarak saklanmaz (Güvenlik ihlali). Kaydedilmeden önce bcrypt ile 12 round hash'lenir.
// Neden 12 round? Güvenlik/performans dengesi için ideal orandır, brute force saldırılarını inanılmaz yavaşlatır.
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// [MİMARİ] Instance Method - Şifre Doğrulama
// Giriş (Login) işleminde kullanıcının girdiği düz metin şifre ile veritabanındaki hash'li şifreyi asenkron olarak karşılaştırır.
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// [MİMARİ] Instance Method - Günlük Limit Sıfırlama
// Herhangi bir AI işlemi (chat/upload) yapılmadan önce bu fonksiyon tetiklenir. Zaman damgası kontrol edilir ve yeni güne girilmişse sayaç sıfırlanır.
UserSchema.methods.checkAndResetUsage = async function () {
  const now = new Date();
  if (now >= this.aiUsageResetDate) {
    this.aiUsageCount = 0;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    this.aiUsageResetDate = tomorrow;
    await this.save({ validateBeforeSave: false });
  }
};


const User = mongoose.model('User', UserSchema);
export default User;

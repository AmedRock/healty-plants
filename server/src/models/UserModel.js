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
    select: false // Sorgularda otomatik gelmez, güvenlik
  },
  aiUsageCount: {
    type: Number,
    default: 0
  },
  aiUsageLimit: {
    type: Number,
    default: 50 // Günlük limit
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

// Şifreyi kaydetmeden önce bcrypt ile hashle
// Mongoose 9: async pre hook'larda next() yerine sadece return kullanılır
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Şifre doğrulama instance metodu
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Günlük AI kullanım limitini sıfırla (gerekiyorsa)
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

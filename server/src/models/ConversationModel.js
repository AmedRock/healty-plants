import mongoose from 'mongoose';

// [MİMARİ BİLGİ] - Subdocument Pattern (Alt Doküman Deseni)
// MongoDB'nin NoSQL esnekliğinden faydalanarak mesajları ayrı bir SQL tablosunda tutmak yerine, ait oldukları sohbetin (Conversation) içine bir dizi (array) olarak gömüyoruz. Bu, okuma (read) performansını inanılmaz hızlandırır (JOIN işlemine gerek kalmaz).
const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, default: '' },
  aiData: {
    baslik: { type: String, default: '' },
    kisa_ozet: { type: String, default: '' },
    oneri: { type: String, default: '' },
    etiketler: [{ type: String }]
  },
  mediaUrl: { type: String, default: null },
  mediaType: { type: String, enum: ['image', 'video', null], default: null },
  createdAt: { type: Date, default: Date.now }
});

// [MİMARİ BİLGİ] - Conversation Model
// Bir kullanıcının başlattığı sohbet zincirinin ana kökü.
const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // [PERFORMANS] userId üzerinden çok fazla arama (find) yapacağımız için bu alanı indeksliyoruz (Index Scan, Collection Scan'den çok daha hızlıdır).
  },
  title: { type: String, default: 'Yeni Sohbet' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;

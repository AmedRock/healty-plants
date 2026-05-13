import mongoose from 'mongoose';

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

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: { type: String, default: 'Yeni Sohbet' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;

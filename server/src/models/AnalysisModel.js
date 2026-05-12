import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  // İleriki aşamalar için kullanıcı ID'si (Opsiyonel şimdilik)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  aiResponse: {
    baslik: { type: String, required: true },
    kisa_ozet: { type: String, required: true },
    oneri: { type: String, required: true },
    etiketler: [{ type: String }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Analysis = mongoose.model('Analysis', AnalysisSchema);

export default Analysis;

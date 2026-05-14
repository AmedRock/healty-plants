import mongoose from 'mongoose';

// [MİMARİ BİLGİ] - AnalysisModel (Geçmişe Yönelik Uyumluluk)
// İlk mimaride sadece tekil analizler vardı, sonradan sohbet (conversation) mantığına geçildiğinde bu model silinmedi. 
// "Geriye dönük uyumluluk (Backward Compatibility)" sağlanması amacıyla yeni yüklemeler hem buraya hem Conversation modeline kaydedilir.
const AnalysisSchema = new mongoose.Schema({
  // [İlişki] SQL'deki Foreign Key mantığının MongoDB'deki karşılığıdır (Reference).
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

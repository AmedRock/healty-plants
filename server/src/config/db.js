import mongoose from 'mongoose';

// [MİMARİ BİLGİ] - MongoDB Veritabanı Bağlantı Konfigürasyonu
// Neden MongoDB? -> Sohbet mesajları (messages dizisi) ve esnek AI analiz sonuçları (JSON nesnesi) 
// ilişkisel veritabanlarına (SQL) göre NoSQL ortamında (doküman tabanlı) çok daha performanslı ve esnek yönetilir.
// Mongoose kütüphanesi (ODM), MongoDB ile Node.js arasında bir köprü görevi görerek şema (schema) doğrulama işlemlerini kolaylaştırır.

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

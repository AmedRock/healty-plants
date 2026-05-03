import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// .env dosyasını yükle
dotenv.config();

const PORT = process.env.PORT || 5000;

// Veritabanına Bağlan ve Sunucuyu Başlat
const startServer = async () => {
  try {
    // Önce veritabanı bağlantısını kur
    await connectDB();
    
    // Bağlantı başarılıysa sunucuyu dinlemeye başla
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor...`);
      console.log(`Test için: http://localhost:${PORT}/api/test`);
    });
  } catch (error) {
    console.error('Sunucu başlatılırken kritik hata oluştu:', error);
  }
};

startServer();

import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// [MİMARİ BİLGİ] - Environment Variables Bootstrap
// Uygulama çalışmadan önce dotenv yüklenmelidir. Aksi halde alt modüllerde process.env.* değerleri undefined dönebilir.
dotenv.config();

const PORT = process.env.PORT || 5000;

// [MİMARİ] - Uygulama Başlatma Döngüsü (Server Initialization)
// Sunucunun başlatılabilmesi için (app.listen) önce veritabanının (connectDB) başarıyla kurulması gerekir. 
// Bu pattern (desen) sayesinde veritabanına bağlanılamazsa sunucu hiç ayağa kalkmaz, böylece hatalı istek alınmasının önüne geçilir.
const startServer = async () => {
  try {
    // Adım 1: Asenkron veritabanı bağlantısını başlat.
    await connectDB();

    // Adım 2: Bağlantı başarılıysa, Express uygulamasını ilgili portta dinlemeye (listen) başla.
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor...`);
      console.log(`Test için: http://localhost:${PORT}/api/test`);
    });
  } catch (error) {
    console.error('Sunucu başlatılırken kritik hata oluştu:', error);
  }
};

startServer();

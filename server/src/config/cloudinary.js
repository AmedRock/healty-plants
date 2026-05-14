import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// [MİMARİ BİLGİ] - Cloudinary (CDN ve Medya Yönetimi) Konfigürasyon Dosyası
// Neden Cloudinary? -> Kullanıcıların yüklediği yüksek boyutlu fotoğrafları ve videoları kendi sunucumuzda (Node.js diskinde) 
// tutmak sunucuyu inanılmaz yorar, bant genişliğini tüketir ve ölçeklenmeyi (scaling) zorlaştırır. 
// Bu yüzden "multer" ile medyayı RAM'e alıp direkt Cloudinary sunucularına aktarıyoruz (Stream).

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;

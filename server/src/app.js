import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

const app = express();

// [MİMARİ BİLGİ] - Güvenlik Middleware'i (Helmet)
// HTTP başlıklarını (headers) otomatik ayarlayarak bilinen birçok web zafiyetine (XSS, Clickjacking vb.) karşı koruma sağlar.
app.use(helmet());

// [MİMARİ BİLGİ] - CORS (Cross-Origin Resource Sharing)
// Uygulamanın frontend ve backend'i farklı portlarda çalıştığı için CORS politikalarını ayarlıyoruz.
// origin -> Sadece izin verilen URL'den gelen isteklere yanıt verilir.
// credentials -> Cookie ve Authorization başlıklarının iletilmesine izin verir.
// exposedHeaders -> Client'ın response header'larındaki AI limit sayaçlarını okuyabilmesini sağlar.
app.use(cors({
  origin: ['http://localhost:5173', 'https://healty-plants.vercel.app'],
  credentials: true,
  exposedHeaders: ['X-AI-Usage-Count', 'X-AI-Usage-Limit']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// [BİLEŞEN] - Health Check (Sağlık Kontrolü) Rotası
// Sunucunun ve API'nin erişilebilir olup olmadığını doğrulamak için kullanılır.
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend API sorunsuz çalışıyor!' });
});

// [MİMARİ] - Kimlik Doğrulama Rotaları
app.use('/api/auth', authRoutes);

// [BİLEŞEN] - Dosya (resim/video) yükleme işlemleri rotaları
app.use('/api/upload', uploadRoutes);

// [BİLEŞEN] - Metin Chat Rotaları
app.use('/api/chat', chatRoutes);

// [BİLEŞEN] - Sohbet (Conversation) veritabanı CRUD rotaları
app.use('/api/conversations', conversationRoutes);

export default app;

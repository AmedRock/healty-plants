import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import uploadRoutes from './routes/uploadRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import authRoutes from './routes/authRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

const app = express();

// Güvenlik Middleware'i
app.use(helmet());

// CORS Ayarları (Frontend uygulamasına izin veriyoruz)
app.use(cors({
  origin: 'http://localhost:5173', // Vite varsayılan portu
  credentials: true,
  exposedHeaders: ['X-AI-Usage-Count', 'X-AI-Usage-Limit'] // AI limit header'larını frontend'e aç
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temel Test Rotası
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend API sorunsuz çalışıyor!' });
});

// Kimlik Doğrulama Rotaları
app.use('/api/auth', authRoutes);

// Yükleme (Upload) Rotaları
app.use('/api/upload', uploadRoutes);

// Metin Chat Rotaları
app.use('/api/chat', chatRoutes);

// Sohbet Geçmişi Rotaları
app.use('/api/conversations', conversationRoutes);

export default app;


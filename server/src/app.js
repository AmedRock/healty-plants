import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

// Güvenlik Middleware'i
app.use(helmet());

// CORS Ayarları (Frontend uygulamasına izin veriyoruz)
app.use(cors({
  origin: 'http://localhost:5173', // Vite varsayılan portu
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temel Test Rotası
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend API sorunsuz çalışıyor!' });
});

// Yükleme (Upload) Rotaları
app.use('/api/upload', uploadRoutes);

export default app;

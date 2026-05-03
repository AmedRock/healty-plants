import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Lütfen bir dosya seçin.' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    
    // Boyut güvenlik kontrolü
    if (isVideo && req.file.size > 20 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Video boyutu 20 MB sınırını aşıyor.' });
    }
    if (!isVideo && req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Resim boyutu 5 MB sınırını aşıyor.' });
    }

    // Cloudinary upload stream oluştur
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'healty-plants-uploads', // Dosyaların saklanacağı klasör
        resource_type: isVideo ? 'video' : 'image', // Türü belirt
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return res.status(500).json({ success: false, message: 'Dosya yüklenirken bir hata oluştu.', error });
        }
        
        res.status(200).json({
          success: true,
          message: 'Dosya başarıyla yüklendi.',
          data: {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            resource_type: result.resource_type
          }
        });
      }
    );

    // Buffer verisini streamifier ile stream'e çevirip Cloudinary'ye gönder
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

  } catch (error) {
    console.error("Upload Controller Error:", error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

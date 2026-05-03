import multer from 'multer';

// Sunucu diski yerine RAM üzerinde geçici depolama
const storage = multer.memoryStorage();

// Sadece izin verilen dosya tiplerini geçir
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/webp',
    'image/heic', // HEIC desteği
    'image/gif',  // GIF desteği
    'video/mp4',
    'video/quicktime', // MOV desteği
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Desteklenmeyen dosya formatı. Lütfen geçerli bir resim veya video yükleyin. (Gelen: ${file.mimetype})`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    // Toplam dosya boyutu (Genel limit - Route özelinde kontrol edeceğiz)
    fileSize: 20 * 1024 * 1024 // Maksimum 20MB
  }
});

export default upload;

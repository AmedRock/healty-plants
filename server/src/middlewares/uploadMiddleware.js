import multer from 'multer';

// [MİMARİ BİLGİ] RAM Üzerinde Depolama (Memory Storage)
// `multer.memoryStorage()` kullanılarak dosyalar Node.js diskine (fs) fiziksel olarak yazılmaz. 
// Bunun yerine doğrudan RAM'de (Buffer) tutulur ve Cloudinary'ye Stream (akış) yöntemiyle aktarılır. Bu, Docker/Serverless mimarilerde disk sorunu yaşamamak içindir.
const storage = multer.memoryStorage();

// [VALIDATION] MIME Tipi Kontrolü (Güvenlik Kalkanı)
// Yalnızca belirli uzantılı resim ve videolara izin verilerek sisteme zararlı yazılım (.exe, .sh vb.) sokulması (RCE açıkları) engellenir.
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
    // [MİMARİ] Multer Konfigürasyonu
    // limits: Dosya başına maksimum 20 Megabayt sınır konularak Out-Of-Memory (OOM) hataları (sunucu çökmesi) engellenir.
    fileSize: 20 * 1024 * 1024 // Maksimum 20MB
  }
});

export default upload;

// [MİMARİ BİLGİ] Merkezi HTTP İstemci (Fetch Wrapper) Katmanı
// Uygulamadaki tüm API çağrıları tek bir noktadan geçer. Bu "Facade" deseni (pattern) sayesinde:
// 1. Request Interceptor (İstek Yakalayıcı) mantığı kurularak JWT Token'ı tüm isteklere otomatik enjekte edilir.
// 2. Response Interceptor (Yanıt Yakalayıcı) mantığı kurularak 401 durum kodları (Oturum Düşmesi) merkezi olarak yönetilip AuthContext tetiklenir.

const API_BASE = 'https://healty-plants.onrender.com/api'; // Production URL

// Storage'dan token al
const getToken = () =>
  localStorage.getItem('bitki_token') || sessionStorage.getItem('bitki_token');

// ---------------------------------------------------------------
// JSON body ile istek (chat, auth vb.)
// ---------------------------------------------------------------
export const apiRequest = async (endpoint, options = {}, onAuthError = null) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    // [MİMARİ] Header Injection (Enjeksiyon)
    // Eğer storage'da token varsa "Bearer <token>" formatında Authorization başlığına (header) ekler. Backend'in authMiddleware'i bunu bekler.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // [MİMARİ] Hata Zinciri ve Merkezi Yönlendirme (Centralized Error Handling)
  // Backend 401 (Unauthorized) dönerse, token süresi dolmuştur. Fonksiyon parametresi olarak gelen `onAuthError` (Context'teki handleAuthError fonksiyonu) çalıştırılır.
  if (response.status === 401 && onAuthError) {
    onAuthError();
    throw new Error(data.message || 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.');
  }

  return { response, data };
};

export const apiPost = (endpoint, body, onAuthError) =>
  apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }, onAuthError);

export const apiGet = (endpoint, onAuthError) =>
  apiRequest(endpoint, { method: 'GET' }, onAuthError);

export const apiDelete = (endpoint, onAuthError) =>
  apiRequest(endpoint, { method: 'DELETE' }, onAuthError);

// ---------------------------------------------------------------
// [MİMARİ BİLGİ] Multipart/FormData Yüklemeleri (MIME ve Boundary Ayarı)
// Neden Content-Type boş bırakılıyor? -> Fetch API, formData'yı gönderirken sınırları (boundary) kendisi belirler. 
// Eğer biz buraya "Content-Type: application/json" koysaydık, backend "multipart/form-data" beklediği için hata fırlatır ve dosya (resim/video) okunamazdı.
// ---------------------------------------------------------------
export const apiPostFormData = async (endpoint, formData, onAuthError = null) => {
  const token = getToken();

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await response.json();

  if (response.status === 401 && onAuthError) {
    onAuthError();
    throw new Error(data.message || 'Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.');
  }

  // [MİMARİ] Custom Header Extraction (HTTP Başlık Okuma)
  // Backend'in aiLimitMiddleware'inde "res.setHeader" ile eklenen AI kullanım sayılarını, Response başlığından okuyarak UI'ın güncellenmesi için geri döneriz.
  const usageCount = response.headers.get('X-AI-Usage-Count');
  const usageLimit = response.headers.get('X-AI-Usage-Limit');

  return { response, data, usageCount, usageLimit };
};

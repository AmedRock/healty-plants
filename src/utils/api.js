// Tüm backend API istekleri için merkezi yardımcı modül
// Token'ı otomatik ekler ve 401 hatalarını yakalar

const API_BASE = '/api'; // Vite proxy üzerinden

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
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // 401 → oturum süresi dolmuş veya geçersiz token
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
// FormData ile istek (medya yükleme — Content-Type'ı browser ayarlar)
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

  // AI kullanım sayaçlarını response header'larından oku
  const usageCount = response.headers.get('X-AI-Usage-Count');
  const usageLimit = response.headers.get('X-AI-Usage-Limit');

  return { response, data, usageCount, usageLimit };
};

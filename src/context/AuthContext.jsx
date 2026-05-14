import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// [MİMARİ] React Context API Kullanımı (Global State Management)
// Neden Redux değil de Context API? -> Sadece auth durumu (user, token) ve UI bazlı basit veriler tutulduğu için Redux gibi ağır bir boilerplate'e (kod yığınına) gerek duyulmadı. Uygulama hafif tutuldu.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Sayfa ilk açılışta token kontrolü sırasında true

  useEffect(() => {
    // [MİMARİ] Effect Hook (Mounting) - Token Hydration
    // Uygulama ilk yüklendiğinde (mount) veya sayfa yenilendiğinde RAM'deki state (useState) uçacağı için, kalıcı hafızadan (localStorage/sessionStorage) JWT ve kullanıcı bilgilerini geri yükleme işlemi (hydration) yapılır.
    const savedToken =
      localStorage.getItem('bitki_token') || sessionStorage.getItem('bitki_token');
    const savedUser =
      localStorage.getItem('bitki_user') || sessionStorage.getItem('bitki_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // [BİLEŞEN] Fallback Mechanism (Hata Yönetimi)
        // Eğer kullanıcı LocalStorage'a manuel olarak bozuk bir JSON verisi girmişse (JSON.parse patlarsa) sistemi kitlememek için veriyi temizleyip login sayfasına atar.
        localStorage.removeItem('bitki_token');
        localStorage.removeItem('bitki_user');
        sessionStorage.removeItem('bitki_token');
        sessionStorage.removeItem('bitki_user');
      }
    }
    setIsLoading(false);
  }, []);

  // [MİMARİ] Callback Optimizasyonu (useCallback)
  // Bellekte referansların sabit tutulması sağlanarak, bu fonksiyonların props olarak geçildiği alt bileşenlerin (Child Components) gereksiz yere tekrar render (re-render) olması engellenir.
  const login = useCallback((tokenData, userData, rememberMe = false) => {
    // [BİLEŞEN] Kalıcılık Kararı (Persistence Strategy)
    // "Beni Hatırla" işaretlendiyse kalıcı olan `localStorage` (7 gün yaşar), işaretlenmediyse tarayıcı sekmesi kapanınca silinen `sessionStorage` kullanılır. Güvenlik ve UX (Kullanıcı Deneyimi) dengesidir.
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('bitki_token', tokenData);
    storage.setItem('bitki_user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  }, []);

  // [MİMARİ] Logout Süreci (Oturum Sonlandırma)
  // Hem global state (user, token) sıfırlanır, hem de tarayıcıdaki tüm izler (Storage) silinerek tam güvenlik sağlanır.
  const logout = useCallback(() => {
    localStorage.removeItem('bitki_token');
    localStorage.removeItem('bitki_user');
    sessionStorage.removeItem('bitki_token');
    sessionStorage.removeItem('bitki_user');
    setToken(null);
    setUser(null);
  }, []);

  // [MİMARİ] Global Error Handler Tetikleyicisi (Interceptor Yansıması)
  // API katmanında (api.js) bir 401 Unauthorized (Token süresi dolmuş veya token imitası yapılmış) yanıtı dönerse, API katmanı doğrudan bu metodu çağırıp kullanıcıyı dışarı atar.
  const handleAuthError = useCallback(() => {
    logout();
  }, [logout]);

  // [MİMARİ] State Update Entegrasyonu (React & LocalStorage Senkronizasyonu)
  // Backend'ten her fotoğraf yükleme sonrası dönen güncel "AI Kota" sayısı, hem React state'ine (anında UI yansıması için) hem de Storage'a (sayfa yenilenince kaybolmaması için) asenkron olmayan şekilde yazılır.
  const updateUserUsage = useCallback((newCount) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, aiUsageCount: newCount };
      // Storage'daki kullanıcı verisini de güncelle
      if (localStorage.getItem('bitki_token')) {
        localStorage.setItem('bitki_user', JSON.stringify(updated));
      } else {
        sessionStorage.setItem('bitki_user', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        handleAuthError,
        updateUserUsage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

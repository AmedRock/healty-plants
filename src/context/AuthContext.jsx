import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Sayfa ilk açılışta token kontrolü sırasında true

  useEffect(() => {
    // Sayfa yüklendiğinde hem localStorage hem sessionStorage'ı kontrol et
    const savedToken =
      localStorage.getItem('bitki_token') || sessionStorage.getItem('bitki_token');
    const savedUser =
      localStorage.getItem('bitki_user') || sessionStorage.getItem('bitki_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        // Bozuk veri varsa temizle
        localStorage.removeItem('bitki_token');
        localStorage.removeItem('bitki_user');
        sessionStorage.removeItem('bitki_token');
        sessionStorage.removeItem('bitki_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Giriş başarılı olduğunda çağrılır
  const login = useCallback((tokenData, userData, rememberMe = false) => {
    // "Beni Hatırla" → localStorage (7 gün), değilse → sessionStorage (sekme kapatılınca sona erer)
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('bitki_token', tokenData);
    storage.setItem('bitki_user', JSON.stringify(userData));
    setToken(tokenData);
    setUser(userData);
  }, []);

  // Çıkış yap
  const logout = useCallback(() => {
    localStorage.removeItem('bitki_token');
    localStorage.removeItem('bitki_user');
    sessionStorage.removeItem('bitki_token');
    sessionStorage.removeItem('bitki_user');
    setToken(null);
    setUser(null);
  }, []);

  // Token süresi dolduğunda veya 401 geldiğinde çağrılır (otomatik çıkış)
  const handleAuthError = useCallback(() => {
    logout();
  }, [logout]);

  // AI kullanım sayacını güncelle (API çağrısından sonra)
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

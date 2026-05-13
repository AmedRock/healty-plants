import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/Auth/AuthModal';
import Topbar from './components/Topbar';
import ChatLayout from './components/Chat/ChatLayout';

// ---------------------------------------------------------------
// İç bileşen: Auth durumuna göre içerik gösterir
// ---------------------------------------------------------------
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // localStorage kontrolü yapılırken kısa bir loading ekranı
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 text-sm">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa → Auth Modal (arka planda chat görünmez)
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  // Giriş yapılmışsa → Normal uygulama
  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      <Topbar />
      <main className="flex-grow flex overflow-hidden">
        <ChatLayout />
      </main>
    </div>
  );
};

// ---------------------------------------------------------------
// Kök bileşen: AuthProvider ile sarıyor
// ---------------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/Auth/AuthModal';
import Topbar from './components/Topbar';
import ChatLayout from './components/Chat/ChatLayout';

// ---------------------------------------------------------------
// [MİMARİ] Component Lifecycle ve Authentication State (Durum) Kontrolü
// AppContent, useAuth hook'u aracılığıyla uygulamanın merkezi global durumunu dinler. 
// Token varsa (isAuthenticated === true), yönlendirmeyi ChatLayout'a yapar. Aksi takdirde AuthModal render edilir (Protected Route mantığı).
// ---------------------------------------------------------------
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // [BİLEŞEN] Hydration Loading State
  // Sayfa ilk yenilendiğinde (F5) localStorage'dan token'ın okunup state'e basılması (hydration) milisaniyeler sürer. Bu süreçte ekranda flash efekti olmasın diye loading spinner gösterilir.
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

  // [MİMARİ] Koşullu Render (Conditional Rendering)
  // Kullanıcı giriş yapmamışsa, DOM ağacında hiçbir sohbet verisi veya layout barındırmadan saf AuthModal'ı döner.
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  // [BİLEŞEN] Ana Uygulama Çatısı (Main Layout)
  // Giriş yapılmışsa Topbar ve ChatLayout'u grid/flex mimarisi ile ekrana yerleştirir. CSS flex-grow sayesinde mesaj alanı kalan boşluğu otomatik doldurur.
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
// [MİMARİ] Kök Bileşen (Root Component) ve Context Provider Pattern
// React'ın render ağacının (DOM tree) en tepesinde AuthProvider konumlandırılır.
// Bu sayede uygulamadaki tüm alt bileşenler (AppContent ve içindekiler) props geçmeye gerek kalmadan (Prop Drilling engellenerek) global auth durumuna erişebilir.
// ---------------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

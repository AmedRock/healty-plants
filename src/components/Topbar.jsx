import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, Mail } from 'lucide-react';

const Topbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Profil / Sol Taraf */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <User size={20} />
        </button>

        {/* Profil Dropdown */}
        {isProfileOpen && (
          <div className="absolute top-12 left-0 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-4 px-4 flex flex-col gap-4 origin-top-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <User size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800">Kullanıcı Adı</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail size={12} /> kullanici@ornek.com
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left w-full">
                <Settings size={16} />
                <span>Hesabı Yönet</span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <button className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left w-full">
                <LogOut size={16} />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ortadaki Başlık (Opsiyonel) veya Logo - Şimdilik boş bırakıyoruz sade olması için */}
      <div className="font-semibold text-xl text-green-800 tracking-tight">
        BitkiAI
      </div>

      {/* Navigasyon / Sağ Taraf */}
      <nav className="flex items-center gap-6">
        <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">Ana Sayfa</a>
        <a href="#" className="text-green-600 border-b-2 border-green-600 pb-1 font-medium">Sor</a>
        <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">Blog</a>
      </nav>
    </div>
  );
};

export default Topbar;

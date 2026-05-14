import React, { useState, useRef, useEffect } from 'react';
import { User, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './Auth/ProfileModal';

const Topbar = () => {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const used = user?.aiUsageCount ?? 0;
  const limit = user?.aiUsageLimit ?? 50;
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  const limitColor =
    pct >= 90 ? 'text-red-500' :
      pct >= 70 ? 'text-amber-500' :
        'text-green-600';

  // İlk harflerden avatar
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">

        {/* Sol — Profil Butonu */}
        <button
          id="profile-button"
          onClick={() => setShowProfileModal(true)}
          title="Profili Görüntüle"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm hover:scale-105 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {user ? initials : <User size={18} />}
        </button>

        {/* Orta — Logo */}
        <div className="font-bold text-xl text-green-800 tracking-tight">
          BitkiAI
        </div>

        {/* Sağ — AI Kullanım Sayacı + Nav */}
        <div className="flex items-center gap-5">
          {/* AI Kullanım Mini Sayacı */}
          {user && (
            <div
              className="flex items-center gap-1.5 cursor-pointer group"
              onClick={() => setShowProfileModal(true)}
              title="AI kullanım detayları"
            >
              <Zap size={14} className={`${limitColor} transition-colors`} />
              <span className={`text-xs font-semibold ${limitColor} transition-colors`}>
                {used}/{limit}
              </span>
            </div>
          )}

          <nav className="flex items-center gap-5">
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm">Ana Sayfa</a>
            <a href="#" className="text-green-600 border-b-2 border-green-600 pb-0.5 font-medium text-sm">Sor</a>
            <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors font-medium text-sm">Blog</a>
          </nav>
        </div>
      </div>

      {/* Profil Modalı */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </>
  );
};

export default Topbar;

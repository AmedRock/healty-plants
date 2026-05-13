import React, { useEffect, useRef, useState } from 'react';
import {
  X, User, Mail, Calendar, Zap, TrendingUp, LogOut, ShieldCheck, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGet } from '../../utils/api';

// ---------------------------------------------------------------
// AI Kullanım Progress Bar
// ---------------------------------------------------------------
const UsageBar = ({ used, limit }) => {
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  const color =
    pct >= 90 ? 'bg-red-500' :
    pct >= 70 ? 'bg-amber-500' :
    'bg-green-500';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Bugünkü AI Kullanımı</span>
        <span className={pct >= 90 ? 'text-red-500 font-semibold' : 'font-medium text-gray-700'}>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {limit - used > 0
          ? `${limit - used} istek kaldı · Her gün sıfırlanır`
          : 'Günlük limitinize ulaştınız · Yarın sıfırlanacak'}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------
// Tarih formatlama
// ---------------------------------------------------------------
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// ---------------------------------------------------------------
// ProfileModal
// ---------------------------------------------------------------
const ProfileModal = ({ onClose }) => {
  const { user, logout, handleAuthError } = useAuth();
  const modalRef = useRef(null);
  const [conversationCount, setConversationCount] = useState(null);

  // Modal açılınca sohbet sayısını çek
  useEffect(() => {
    apiGet('/conversations', handleAuthError)
      .then(({ data }) => { if (data.success) setConversationCount(data.total); })
      .catch(() => {});
  }, [handleAuthError]);

  // Dışarıya tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Escape tuşuyla kapat
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Kart */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Üst Gradient Başlık */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-4">
            {/* Avatar - initials */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-xl font-bold shadow-lg border-2 border-white/30">
              {initials}
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-white/75 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* İçerik */}
        <div className="p-6 flex flex-col gap-5">
          {/* AI Kullanım Özeti */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-green-800">Yapay Zeka Kullanımı</span>
            </div>
            <UsageBar
              used={user.aiUsageCount ?? 0}
              limit={user.aiUsageLimit ?? 50}
            />
          </div>

          {/* Hesap Bilgileri */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Hesap Bilgileri
            </h3>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <User size={15} />
              </div>
              <span>{user.firstName} {user.lastName}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Mail size={15} />
              </div>
              <span className="truncate">{user.email}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <Calendar size={15} />
              </div>
              <span>{formatDate(user.createdAt)} tarihinde katıldı</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <ShieldCheck size={15} />
              </div>
              <span className="text-green-700 font-medium">Hesap doğrulandı</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                <TrendingUp size={15} />
              </div>
              <span>Günlük limit: <span className="font-semibold text-gray-800">{user.aiUsageLimit ?? 50} istek</span></span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <MessageSquare size={15} />
              </div>
              <span>Toplam sohbet: <span className="font-semibold text-gray-800">
                {conversationCount !== null ? conversationCount : '—'}
              </span></span>
            </div>
          </div>

          {/* Çıkış Butonu */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-medium 
              hover:bg-red-50 hover:border-red-300 transition-all mt-1"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, X, MessageSquare, Loader2 } from 'lucide-react';
import ConversationItem from './ConversationItem';

const Sidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
  // Mobil
  isMobileOpen,
  onMobileClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const searchRef = useRef(null);

  // Arama odaklandığında glow animasyonu tetikle
  const handleFocus = () => {
    setSearchFocused(true);
    setPulseKey(k => k + 1);
  };

  // Türkçe karakter destekli ve null korumalı toLowerCase
  const safeToLower = (str) => (str || '').toLocaleLowerCase('tr-TR');
  const searchLower = safeToLower(searchQuery.trim());

  // Filtrelenmiş sohbetler
  const filtered = searchLower
    ? conversations.filter(c =>
      safeToLower(c.title).includes(searchLower) ||
      safeToLower(c.preview).includes(searchLower)
    )
    : conversations;

  // ---- Sidebar içeriği (desktop + mobil paylaşımlı) ----
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Başlık + Yeni Sohbet */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <MessageSquare size={15} className="text-green-600" />
            Sohbetler
          </span>
          <button
            onClick={onNewConversation}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <Plus size={13} /> Yeni
          </button>
        </div>

        {/* Animasyonlu Arama Kutusu */}
        <div
          key={pulseKey}
          className={`relative transition-all duration-200 rounded-lg ${searchFocused ? 'search-focus-pulse' : ''}`}
        >
          <Search
            size={13}
            className={`absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${searchFocused ? 'text-green-500' : 'text-gray-400'
              }`}
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Sohbet ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={handleFocus}
            onBlur={() => setSearchFocused(false)}
            className={`w-full pl-7 pr-7 py-1.5 text-xs rounded-lg border outline-none transition-all duration-200
              ${searchFocused
                ? 'border-green-400 bg-white ring-2 ring-green-100'
                : 'border-gray-200 bg-gray-100 hover:bg-gray-50'
              }`}
          />
          {/* Temizle butonu — metin varsa fade-in */}
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Sohbet Listesi */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 px-4">
            {searchQuery ? (
              <>
                <Search size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-400">"{searchQuery}" için sonuç bulunamadı</p>
              </>
            ) : (
              <>
                <MessageSquare size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-xs text-gray-400">Henüz sohbet yok</p>
                <p className="text-xs text-gray-300 mt-1">Yeni bir sohbet başlatın</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((conv, idx) => (
              <div
                key={conv._id}
                className="animate-fadeSlideDown"
                style={{ animationDelay: searchQuery ? `${idx * 25}ms` : '0ms' }}
              >
                <ConversationItem
                  conversation={conv}
                  isActive={activeConversationId === conv._id}
                  onSelect={(id) => {
                    onSelectConversation(id);
                    onMobileClose?.();
                  }}
                  onDelete={onDeleteConversation}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop — her zaman görünür */}
      <aside className="hidden md:flex w-72 flex-shrink-0 border-r border-gray-200 bg-white flex-col">
        {sidebarContent}
      </aside>

      {/* Mobil — overlay drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;

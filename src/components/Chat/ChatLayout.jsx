import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Sidebar from './Sidebar';
import { Leaf, Sparkles, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiGet, apiDelete } from '../../utils/api';

// [MİMARİ] DTO (Data Transfer Object) Adaptörü / Normalization
// Backend'den gelen karmaşık (Mongoose Document) veriyi, Frontend'deki UI bileşenlerinin (MessageBubble) hatasız okuyabilmesi için standart ve basit bir JSON objesine (Unified format) dönüştürür.
const normalizeMessage = (msg, idx) => ({
  id: msg._id || `${idx}-${msg.role}`,
  sender: msg.role,
  text: msg.text || '',
  media: msg.mediaUrl ? { type: msg.mediaType, url: msg.mediaUrl } : null,
  aiData: msg.aiData?.baslik ? msg.aiData : null,
  createdAt: msg.createdAt,
});

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'ai',
  text: 'Merhaba! Ben BitkiAI asistanınız. Bitkilerinizle ilgili her türlü soruyu sorabilir, fotoğraf veya video göndererek hastalık tespiti veya bakım tavsiyesi isteyebilirsiniz. Size nasıl yardımcı olabilirim?',
};

// ---------------------------------------------------------------
// [MİMARİ] Container Component Pattern (Akıllı Kapsayıcı Bileşen Deseni)
// ChatLayout uygulamadaki tüm ana sohbet State'lerini (mesajlar, seçili sohbet vs.) kendi üzerinde tutar. Alt bileşenlere (Sidebar, ChatInput) sadece gereken fonksiyonları (Prop Drilling ile) geçer.
// ---------------------------------------------------------------
const ChatLayout = () => {
  const { handleAuthError } = useAuth();

  // Sohbet geçmişi
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Mesajlar
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Mobil sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isAiThinking]);

  // ── [MİMARİ] useCallback ile Asenkron İstek Sabitleme ──────────────────────────────────
  // fetchConversations fonksiyonunun bellek referansı sabitlenerek, useEffect'in bu fonksiyonu sürekli tetiklemesi (Sonsuz Döngü / Memory Leak) engellenmiştir.
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await apiGet('/conversations', handleAuthError);
      if (data.success) setConversations(data.data);
    } catch (e) {
      console.error('Sohbet listesi alınamadı:', e);
    } finally {
      setConvLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ── Tekil sohbet yükle ─────────────────────────────────────
  const loadConversation = async (id) => {
    setMsgLoading(true);
    setActiveConversationId(id);
    try {
      const { data } = await apiGet(`/conversations/${id}`, handleAuthError);
      if (data.success) {
        setMessages(data.data.messages.map(normalizeMessage));
      }
    } catch (e) {
      console.error('Sohbet yüklenemedi:', e);
    } finally {
      setMsgLoading(false);
    }
  };

  // ── Yeni sohbet başlat ─────────────────────────────────────
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([WELCOME_MESSAGE]);
  };

  // ── Sohbet sil ─────────────────────────────────────────────
  const handleDeleteConversation = async (id) => {
    try {
      await apiDelete(`/conversations/${id}`, handleAuthError);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeConversationId === id) handleNewConversation();
    } catch (e) {
      console.error('Sohbet silinemedi:', e);
    }
  };

  // ── [MİMARİ] Optimistic UI Update (İyimser Güncelleme) ──────────────────
  const handleSendMessage = (messageData) => {
    // API'nin cevabını (Promise resolve) beklemeden, kullanıcının mesajı anında (0ms gecikme) DOM'a (Ekrana) basılır. (Perceived Performance - Algılanan Performans optimizasyonu).
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageData.text,
      media: messageData.media,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // AI cevabını ekle
    const aiData = messageData.aiData || messageData.media?.aiData;
    if (aiData) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        aiData,
        createdAt: new Date().toISOString(),
      }]);
    }
  };

  // ── Yeni conversation ID gelince (ChatInput'tan) ────────────
  const handleConversationCreated = (newId) => {
    setActiveConversationId(newId);
    // Listeyi güncelle
    fetchConversations();
  };

  return (
    <div className="flex h-full w-full">
      {/* ── Sidebar ── */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={loadConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isLoading={convLoading}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* ── Ana Chat Alanı ── */}
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Mobil: hamburger + başlık */}
        <div className="md:hidden flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium text-gray-600">Sohbetler</span>
        </div>

        {/* Mesaj Alanı */}
        <div className="flex-grow overflow-y-auto px-4 py-6">

          {msgLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Sohbet yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto flex flex-col">
              {/* Boş durum (yeni sohbet) */}
              {messages.length === 1 && messages[0].id === 'welcome' && (
                <div className="flex flex-col items-center justify-center mt-10 mb-12 opacity-50">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <Leaf size={32} />
                  </div>
                  <h2 className="text-xl font-medium text-gray-700">Bitkiniz hakkında konuşmaya başlayın</h2>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm text-center">
                    Fotoğraf çekip göndererek hastalık teşhisi veya bakım önerileri alabilirsiniz.
                  </p>
                </div>
              )}

              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* AI Düşünüyor */}
              {isAiThinking && (
                <div className="flex w-full mb-6 justify-start">
                  <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm bg-white border border-gray-100 rounded-tl-sm animate-pulse">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-gray-300" size={18} />
                      <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 rounded w-4/6" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 bg-gray-50 pt-2 w-full">
          <ChatInput
            onSendMessage={handleSendMessage}
            setIsAiThinking={setIsAiThinking}
            activeConversationId={activeConversationId}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;

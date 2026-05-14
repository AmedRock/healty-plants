import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { useAuth } from '../../context/AuthContext';
import { apiPost, apiPostFormData } from '../../utils/api';

// ---------------------------------------------------------------
// [MİMARİ] Stateful Komponent & Asenkron Medya Yönetimi
// ChatInput, kullanıcının metin girişini ve medya (resim/video) seçimini yöneten "Controlled Component"tir.
// ---------------------------------------------------------------
const ChatInput = ({ onSendMessage, setIsAiThinking, activeConversationId, onConversationCreated }) => {
  const { handleAuthError, updateUserUsage } = useAuth();
  const [text, setText] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const handleSend = async () => {
    if (text.trim() === '' && !previewMedia) return;
    setErrorMsg('');

    let uploadedMediaData = null;
    let textAiData = null;
    let returnedConvId = null;

    // [MİMARİ] API Entegrasyonu (Yönlendirme Deseni - Routing Pattern)
    // Eğer medya (resim/video) varsa 'multipart/form-data' olarak '/upload' rotasına, sadece metin varsa 'application/json' olarak '/chat' rotasına dinamik yönlendirme yapılır.
    if (previewMedia) {
      setIsLoading(true);
      if (setIsAiThinking) setIsAiThinking(true);
      try {
        const formData = new FormData();
        formData.append('media', previewMedia.file);
        if (text.trim() !== '') formData.append('text', text);
        if (activeConversationId) formData.append('conversationId', activeConversationId);

        const { data } = await apiPostFormData('/upload', formData, handleAuthError);

        if (data.success) {
          uploadedMediaData = {
            type: previewMedia.type,
            url: data.data.url,
            id: data.data.id,
            aiData: data.data.aiData,
          };
          returnedConvId = data.data.conversationId;
          if (data.usage?.count !== undefined) updateUserUsage(data.usage.count);
        } else {
          showError('İşlem sırasında bir hata oluştu: ' + data.message);
          setIsLoading(false);
          if (setIsAiThinking) setIsAiThinking(false);
          return;
        }
      } catch (error) {
        if (!error.message?.includes('Oturum')) showError('Bağlantı hatası: Sunucuya ulaşılamadı.');
        setIsLoading(false);
        if (setIsAiThinking) setIsAiThinking(false);
        return;
      }
      setIsLoading(false);
      if (setIsAiThinking) setIsAiThinking(false);

    } else if (text.trim() !== '') {
      setIsLoading(true);
      // [MİMARİ] Optimistic UI Update (İyimser Arayüz Öncesi State)
      // İstek gönderilmeden önce "AI Düşünüyor" animasyonu tetiklenerek kullanıcıya anında görsel geri bildirim (Fast Feedback) sağlanır.
      if (setIsAiThinking) setIsAiThinking(true);
      try {
        const { data } = await apiPost(
          '/chat',
          { message: text.trim(), conversationId: activeConversationId || null },
          handleAuthError
        );

        if (data.success) {
          textAiData = data.data.aiData;
          returnedConvId = data.data.conversationId;
          if (data.usage?.count !== undefined) updateUserUsage(data.usage.count);
        } else {
          showError('Hata: ' + data.message);
          setIsLoading(false);
          if (setIsAiThinking) setIsAiThinking(false);
          return;
        }
      } catch (error) {
        if (!error.message?.includes('Oturum')) showError('Bağlantı hatası: Sunucuya ulaşılamadı.');
        setIsLoading(false);
        if (setIsAiThinking) setIsAiThinking(false);
        return;
      }
      setIsLoading(false);
      if (setIsAiThinking) setIsAiThinking(false);
    }

    onSendMessage({
      text,
      media: uploadedMediaData || (previewMedia ? { type: previewMedia.type, url: previewMedia.url } : null),
      aiData: uploadedMediaData?.aiData || textAiData || null,
    });

    // Yeni conversation oluşturulduysa üst bileşeni bilgilendir
    if (returnedConvId && returnedConvId !== activeConversationId) {
      onConversationCreated?.(String(returnedConvId));
    }

    setText('');
    setPreviewMedia(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    // [MİMARİ] Client-Side Compression (İstemci Tarafı Sıkıştırma)
    // Frontend'den backend'e resim yollanmadan önce `browser-image-compression` kütüphanesi ile tarayıcı RAM'inde sıkıştırma yapılır. 
    // Bu işlem sunucu maliyetini (Storage/Bandwidth) ve ağ gecikmesini (Latency) dramatik şekilde düşürür.
    let finalFile = file;

    if (isVideo && file.size > 20 * 1024 * 1024) {
      showError("Video 20MB'dan büyük olamaz.");
      e.target.value = null;
      return;
    } else if (file.type.startsWith('image/') && !file.type.includes('gif')) {
      try {
        finalFile = await imageCompression(file, { maxSizeMB: 5, maxWidthOrHeight: 1920, useWebWorker: true });
      } catch { }
    }

    setPreviewMedia({ type: isVideo ? 'video' : 'image', url: URL.createObjectURL(finalFile), file: finalFile });
    e.target.value = null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-6 px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 transition-all">

        {errorMsg && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-sm text-red-600 flex items-center gap-2">
            <span>⚠</span> {errorMsg}
          </div>
        )}

        {previewMedia && (
          <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-start gap-3">
            <div className="relative inline-block">
              {previewMedia.type === 'image'
                ? <img src={previewMedia.url} alt="Preview" className="h-24 w-auto rounded-lg border border-gray-200 object-cover" />
                : <video src={previewMedia.url} className="h-24 w-auto rounded-lg border border-gray-200 object-cover" />
              }
              {!isLoading && (
                <button onClick={() => setPreviewMedia(null)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 text-gray-500 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            {isLoading && (
              <div className="text-sm text-green-600 flex items-center gap-2 mt-auto mb-1">
                <Loader2 size={16} className="animate-spin" /> Yapay Zeka İnceliyor...
              </div>
            )}
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50" title="Dosya Ekle">
            <Paperclip size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,.heic,.mov" onChange={handleFileChange} />
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bitkinize ne olduğunu sorun..."
            disabled={isLoading}
            className="flex-grow max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-gray-700 placeholder-gray-400 disabled:opacity-50"
            rows={1}
            style={{ overflowY: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={(text.trim() === '' && !previewMedia) || isLoading}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 flex items-center justify-center
              ${(text.trim() !== '' || previewMedia) && !isLoading
                ? 'bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
      <div className="text-center mt-3 text-xs text-gray-400">
        Yapay zeka asistanı bitkileriniz hakkında yanılabilir. Önemli kararlarda bir uzmana danışın.
      </div>
    </div>
  );
};

export default ChatInput;

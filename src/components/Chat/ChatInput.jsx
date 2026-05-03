import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

const ChatInput = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (text.trim() === '' && !previewMedia) return;
    
    let uploadedMediaData = null;

    if (previewMedia) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('media', previewMedia.file);

        // Backend'e dosyayı yükle
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const data = await response.json();
        
        if (data.success) {
          uploadedMediaData = {
            type: previewMedia.type,
            url: data.data.url, // Cloudinary URL
            public_id: data.data.public_id
          };
        } else {
          alert("Dosya yüklenirken bir hata oluştu: " + data.message);
          setIsUploading(false);
          return; // Hata varsa mesajı gönderme
        }
      } catch (error) {
        console.error("Yükleme hatası:", error);
        alert("Bağlantı hatası: Dosya yüklenemedi.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }
    
    onSendMessage({
      text: text,
      media: uploadedMediaData || (previewMedia ? { type: previewMedia.type, url: previewMedia.url } : null)
    });
    
    setText('');
    setPreviewMedia(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    let finalFile = file;

    // Video Boyut Kontrolü (20MB)
    if (isVideo) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Hata: Seçtiğiniz video 20MB'dan büyük. Lütfen daha küçük bir video seçin.");
        e.target.value = null;
        return;
      }
    } 
    // Resim Sıkıştırma (Client-Side Compression)
    else if (file.type.startsWith('image/') && !file.type.includes('gif')) {
      try {
        const options = {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        };
        finalFile = await imageCompression(file, options);
      } catch (error) {
        console.error("Resim sıkıştırma hatası:", error);
      }
    }

    const url = URL.createObjectURL(finalFile);
    
    setPreviewMedia({
      type: isVideo ? 'video' : 'image',
      url: url,
      file: finalFile
    });
    
    e.target.value = null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-6 px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 transition-all">
        
        {/* Medya Önizleme Alanı */}
        {previewMedia && (
          <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-start gap-3 relative">
            <div className="relative inline-block">
              {previewMedia.type === 'image' ? (
                <img src={previewMedia.url} alt="Preview" className="h-24 w-auto rounded-lg border border-gray-200 object-cover"/>
              ) : (
                <video src={previewMedia.url} className="h-24 w-auto rounded-lg border border-gray-200 object-cover" />
              )}
              {!isUploading && (
                <button onClick={() => setPreviewMedia(null)} className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 text-gray-500 hover:text-red-500 transition-colors" title="Kaldır">
                  <X size={14} />
                </button>
              )}
            </div>
            {isUploading && <div className="text-sm text-green-600 flex items-center gap-2 mt-auto mb-1"><Loader2 size={16} className="animate-spin" /> Yükleniyor...</div>}
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors flex-shrink-0 disabled:opacity-50" title="Dosya Ekle">
            <Paperclip size={20} />
          </button>
          
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,.heic,.mov" onChange={handleFileChange} />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bitkinize ne olduğunu sorun..."
            disabled={isUploading}
            className="flex-grow max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2.5 px-2 text-gray-700 placeholder-gray-400 disabled:opacity-50"
            rows={1}
            style={{ overflowY: 'auto' }}
          />

          <button onClick={handleSend} disabled={(text.trim() === '' && !previewMedia) || isUploading} className={`p-2.5 rounded-xl transition-all flex-shrink-0 flex items-center justify-center ${(text.trim() !== '' || previewMedia) && !isUploading ? 'bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={(text.trim() !== '' || previewMedia) ? "translate-x-0.5 -translate-y-0.5" : ""} />}
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

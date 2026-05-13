import React, { useState } from 'react';
import { Tag, Sprout, Sparkles, Copy, Check } from 'lucide-react';

// Saat formatı
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

// Kopyalanabilir AI metni oluştur
const buildCopyText = (aiData) =>
  [aiData.baslik, aiData.kisa_ozet, aiData.oneri && `Öneri: ${aiData.oneri}`]
    .filter(Boolean)
    .join('\n\n');

const MessageBubble = ({ message }) => {
  const isAI = message.sender === 'ai';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = message.aiData
      ? buildCopyText(message.aiData)
      : message.text;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm relative group
          ${isAI
            ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            : 'bg-green-600 text-white rounded-tr-sm'
          }`}
      >
        {/* Kullanıcı Medyası */}
        {!isAI && message.media?.type === 'image' && (
          <div className="mb-3">
            <img src={message.media.url} alt="Uploaded" className="rounded-lg max-h-64 object-cover" />
          </div>
        )}
        {!isAI && message.media?.type === 'video' && (
          <div className="mb-3">
            <video src={message.media.url} controls className="rounded-lg max-h-64 object-cover w-full" />
          </div>
        )}

        {/* Kullanıcı metni */}
        {!isAI && (
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-green-50">
            {message.text}
          </div>
        )}

        {/* AI — JSON cevap */}
        {isAI && message.aiData && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Sparkles className="text-green-500" size={18} />
              <h3 className="font-semibold text-lg text-gray-800">{message.aiData.baslik}</h3>
            </div>
            <div className="text-[15px] text-gray-700 leading-relaxed">{message.aiData.kisa_ozet}</div>
            {message.aiData.oneri && (
              <div className="bg-green-50/50 rounded-xl p-3 border border-green-100/50">
                <div className="flex items-start gap-2">
                  <Sprout className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <span className="font-medium text-green-800 text-sm block mb-1">Bakım Önerisi</span>
                    <p className="text-sm text-green-700/90 leading-relaxed">{message.aiData.oneri}</p>
                  </div>
                </div>
              </div>
            )}
            {message.aiData.etiketler?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1 pt-3 border-t border-gray-100">
                {message.aiData.etiketler.map((etiket, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    <Tag size={10} /> {etiket}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI — düz metin (karşılama vb.) */}
        {isAI && !message.aiData && (
          <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">{message.text}</div>
        )}

        {/* Alt satır: kopyala butonu + zaman damgası */}
        <div className={`flex items-center justify-between mt-2 ${isAI ? '' : 'flex-row-reverse'}`}>
          {/* Kopyala — sadece AI mesajlarında, hover'da görünür */}
          {isAI && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11px] text-gray-400 hover:text-green-600 transition-all duration-150"
              title="Yanıtı kopyala"
            >
              {copied
                ? <><Check size={11} className="text-green-500" /> Kopyalandı</>
                : <><Copy size={11} /> Kopyala</>
              }
            </button>
          )}
          {!isAI && <span />}

          {/* Zaman damgası */}
          {message.createdAt && (
            <span className={`text-[10px] ${isAI ? 'text-gray-400 ml-auto' : 'text-green-200'}`}>
              {formatTime(message.createdAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

import React from 'react';
import { Tag, Sprout, AlertCircle, Sparkles } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm
          ${isAI 
            ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
            : 'bg-green-600 text-white rounded-tr-sm'
          }`}
      >
        {/* Kullanıcı Medyası (Resim/Video) */}
        {!isAI && message.media && message.media.type === 'image' && (
          <div className="mb-3">
            <img 
              src={message.media.url} 
              alt="Uploaded content" 
              className="rounded-lg max-h-64 object-cover"
            />
          </div>
        )}
        {!isAI && message.media && message.media.type === 'video' && (
          <div className="mb-3">
            <video 
              src={message.media.url} 
              controls
              className="rounded-lg max-h-64 object-cover w-full"
            />
          </div>
        )}
        
        {/* Standart Metin (Kullanıcı için) */}
        {!isAI && (
          <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isAI ? 'text-gray-700' : 'text-green-50'}`}>
            {message.text}
          </div>
        )}

        {/* Yapay Zeka Cevabı - Yapılandırılmış JSON Formatı */}
        {isAI && message.aiData && (
          <div className="flex flex-col gap-4">
            {/* Başlık */}
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Sparkles className="text-green-500" size={18} />
              <h3 className="font-semibold text-lg text-gray-800">{message.aiData.baslik}</h3>
            </div>

            {/* Kısa Özet */}
            <div className="text-[15px] text-gray-700 leading-relaxed">
              {message.aiData.kisa_ozet}
            </div>

            {/* Öneri (Eğer Varsa) */}
            {message.aiData.oneri && (
              <div className="bg-green-50/50 rounded-xl p-3 mt-1 border border-green-100/50">
                <div className="flex items-start gap-2">
                  <Sprout className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <span className="font-medium text-green-800 text-sm block mb-1">Bakım Önerisi</span>
                    <p className="text-sm text-green-700/90 leading-relaxed">{message.aiData.oneri}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Etiketler */}
            {message.aiData.etiketler && message.aiData.etiketler.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-gray-100">
                {message.aiData.etiketler.map((etiket, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                  >
                    <Tag size={10} />
                    {etiket}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Standart AI Metni (Eğer JSON gelmemişse veya karşılama mesajıysa) */}
        {isAI && !message.aiData && (
          <div className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap">
            {message.text}
          </div>
        )}

      </div>
    </div>
  );
};

export default MessageBubble;

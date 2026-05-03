import React from 'react';

const MessageBubble = ({ message }) => {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm
          ${isAI 
            ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm' 
            : 'bg-green-600 text-white rounded-tr-sm'
          }`}
      >
        {/* Medya İçeriği (Eğer varsa) */}
        {message.media && message.media.type === 'image' && (
          <div className="mb-3">
            <img 
              src={message.media.url} 
              alt="Uploaded content" 
              className="rounded-lg max-h-64 object-cover"
            />
          </div>
        )}
        {message.media && message.media.type === 'video' && (
          <div className="mb-3">
            <video 
              src={message.media.url} 
              controls
              className="rounded-lg max-h-64 object-cover w-full"
            />
          </div>
        )}
        
        {/* Metin İçeriği */}
        <div className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isAI ? 'text-gray-700' : 'text-green-50'}`}>
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

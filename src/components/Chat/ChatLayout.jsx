import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Leaf, Sparkles } from 'lucide-react';

const ChatLayout = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Merhaba! Ben BitkiAI asistanınız. Bitkilerinizle ilgili her türlü soruyu sorabilir, fotoğraf veya video göndererek hastalık tespiti veya bakım tavsiyesi isteyebilirsiniz. Size nasıl yardımcı olabilirim?',
    }
  ]);
  
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiThinking]);

  const handleSendMessage = (messageData) => {
    // Kullanıcı mesajını anında ekle
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageData.text,
      media: messageData.media
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Eğer backend'den hazır bir AI cevabı geldiyse (ChatInput'un içinden)
    // aiData ya üst seviyede ya da media.aiData içinde gelebilir
    const aiData = messageData.aiData || messageData.media?.aiData;
    if (aiData) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        aiData: aiData
      }]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full max-w-5xl mx-auto relative">
      
      {/* Mesaj Geçmişi Alanı */}
      <div className="flex-grow overflow-y-auto px-4 py-6 scroll-smooth">
        {messages.length === 1 && (
           <div className="flex flex-col items-center justify-center mt-10 mb-12 opacity-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                 <Leaf size={32} />
              </div>
              <h2 className="text-xl font-medium text-gray-700">Bitkiniz hakkında konuşmaya başlayın</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-sm text-center">Fotoğraf çekip göndererek hastalık teşhisi veya bakım önerileri alabilirsiniz.</p>
           </div>
        )}
        
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {/* Yapay Zeka Düşünüyor (Skeleton Loader) */}
        {isAiThinking && (
          <div className="flex w-full mb-6 justify-start">
            <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm bg-white border border-gray-100 rounded-tl-sm animate-pulse">
               <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-gray-300" size={18} />
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
               </div>
               <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
               </div>
               <div className="flex gap-2 mt-4">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
               </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Giriş Alanı */}
      <div className="w-full bg-gray-50 pt-2">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          setIsAiThinking={setIsAiThinking} 
        />
      </div>
    </div>
  );
};

export default ChatLayout;

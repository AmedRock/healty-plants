import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Leaf } from 'lucide-react';

const ChatLayout = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Merhaba! Ben BitkiAI asistanınız. Bitkilerinizle ilgili her türlü soruyu sorabilir, fotoğraf veya video göndererek hastalık tespiti veya bakım tavsiyesi isteyebilirsiniz. Size nasıl yardımcı olabilirim?',
    }
  ]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (messageData) => {
    // Kullanıcı mesajını ekle
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      ...messageData
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Sahte (Mock) Yapay Zeka Cevabı
    setTimeout(() => {
      let aiResponseText = 'Bu çok güzel bir bitki! Gelişimi gayet sağlıklı görünüyor. Sormak istediğiniz belirli bir bakım detayı var mı?';
      
      if (messageData.media) {
        if (messageData.media.type === 'image') {
          aiResponseText = 'Gönderdiğiniz fotoğrafı inceledim. Yapraklardaki renk canlılığı gayet iyi. Sadece biraz daha fazla güneş ışığına ihtiyacı olabilir.';
        } else {
          aiResponseText = 'Videonuzu analiz ettim. Toprağının nem dengesi iyi görünüyor, sulama düzeninize böyle devam edebilirsiniz.';
        }
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full max-w-5xl mx-auto">
      {/* Karşılama veya Boş Durum (Eğer mesaj yoksa, şimdilik hep 1 mesaj var) */}
      
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
        <div ref={messagesEndRef} />
      </div>

      {/* Mesaj Giriş Alanı */}
      <div className="w-full bg-gray-50 pt-2">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatLayout;

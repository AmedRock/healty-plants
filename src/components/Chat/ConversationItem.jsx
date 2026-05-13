import React from 'react';
import { Trash2, Leaf } from 'lucide-react';

// Tarihi sidebar'a uygun formatta göster
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Dün';
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

const ConversationItem = ({ conversation, isActive, onSelect, onDelete }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Bu sohbeti silmek istediğinize emin misiniz?')) {
      onDelete(conversation._id);
    }
  };

  return (
    <div
      onClick={() => onSelect(conversation._id)}
      className={`group relative flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
        ${isActive
          ? 'bg-green-100 border border-green-200'
          : 'hover:bg-gray-100 border border-transparent'
        }`}
    >
      {/* İkon */}
      <div className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'} transition-colors`}>
        <Leaf size={14} />
      </div>

      {/* İçerik */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
          {conversation.title || 'Yeni Sohbet'}
        </p>
        {conversation.preview && (
          <p className="text-xs text-gray-400 truncate mt-0.5 leading-relaxed">
            {conversation.preview}
          </p>
        )}
      </div>

      {/* Tarih + Sil */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-gray-400">{formatDate(conversation.updatedAt)}</span>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all duration-150"
          title="Sohbeti sil"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

export default ConversationItem;

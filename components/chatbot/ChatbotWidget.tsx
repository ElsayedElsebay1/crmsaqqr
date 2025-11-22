import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import { ChatBubbleIcon } from '../icons/ChatBubbleIcon';
import { XIcon } from '../icons/XIcon';

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Chat Window */}
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[#0D1C3C] ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600 focus:ring-slate-500'
            : 'bg-gradient-to-br from-[#00B7C1] to-[#008f97] hover:from-[#00a3ad] hover:to-[#00B7C1] focus:ring-[#00B7C1]'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <XIcon className="w-8 h-8" />
        ) : (
          <ChatBubbleIcon className="w-8 h-8" />
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;

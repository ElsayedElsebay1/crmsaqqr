import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';
import ThinkingSpinner from './ThinkingSpinner';
import { chatWithGemini } from '../../services/api';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatWindowProps {
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'أهلاً بك! أنا مساعد الصقر الذكي. يمكنك أن تسألني عن بياناتك، مثلاً "كم عدد فرضي المفتوحة؟" أو "أعطني ملخصاً عن العميل شركة الأفق الجديد".' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loadingState, setLoadingState] = useState<'idle' | 'thinking'>('idle');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingState]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loadingState !== 'idle') return;

    const userMessage: Message = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoadingState('thinking');
    setError(null);

    const history = messages.map(m => ({ role: m.role, text: m.text }));

    try {
        // AI logic is now handled by the backend via this API call.
        const response = await chatWithGemini(history, userMessage.text, 'gemini-pro', {});
        
        const modelResponse: Message = { role: 'model', text: response.candidates[0].content.parts[0].text };
        setMessages(prev => [...prev, modelResponse]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'عذرًا، حدث خطأ أثناء التواصل مع المساعد الذكي.');
    } finally {
      setLoadingState('idle');
    }
  };

  return (
    <div className="absolute bottom-20 right-0 w-[90vw] max-w-md h-[70vh] bg-[#1A2B4D] border border-[#2C3E5F] rounded-2xl shadow-2xl flex flex-col modal-content">
      {/* Header */}
      <div className="p-4 border-b border-[#2C3E5F] flex-shrink-0">
        <h3 className="font-bold text-lg text-center text-white flex items-center justify-center gap-2">
            <SparklesIcon className="w-5 h-5 text-yellow-300"/>
            <span>مساعد الصقر الذكي</span>
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${
              msg.role === 'user' ? 'bg-[#00B7C1] text-white rounded-br-none' : 'bg-[#2C3E5F] text-slate-200 rounded-bl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {loadingState !== 'idle' && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-[#2C3E5F] rounded-bl-none">
                <ThinkingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2C3E5F] flex-shrink-0">
        {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اسأل عن بياناتك..."
            className="w-full bg-[#2C3E5F] border border-[#3E527B] rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#00B7C1] disabled:opacity-50"
            disabled={loadingState !== 'idle'}
          />
          <button onClick={handleSendMessage} disabled={loadingState !== 'idle' || !inputValue.trim()} className="p-2 bg-[#00B7C1] rounded-full text-white disabled:bg-slate-600">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

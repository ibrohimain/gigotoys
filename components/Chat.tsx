
import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import { Send, User as UserIcon, MessageSquare, Sparkles } from 'lucide-react';

interface ChatProps {
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('gigo_chat');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputText,
      timestamp: new Date().toISOString()
    };
    const updated = [...messages, newMessage];
    setMessages(updated);
    localStorage.setItem('gigo_chat', JSON.stringify(updated));
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
         <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-[0.2em]"><MessageSquare size={18} className="text-indigo-600"/> GIGO Korporativ Chat</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Barcha xodimlar va direktor muloqot xonasi</p>
         </div>
         <div className="px-4 py-1.5 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={12}/> Online
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
         {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            const showName = idx === 0 || messages[idx-1].senderId !== msg.senderId;
            return (
               <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showName && <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-1">{msg.senderName}</p>}
                  <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all hover:shadow-md ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'}`}>
                     {msg.text}
                  </div>
                  <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
               </div>
            );
         })}
         {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-300 italic font-black text-sm">Xabarlar mavjud emas. Birinchi bo'lib yozing!</div>
         )}
         <div ref={scrollRef} />
      </div>

      <div className="p-8 bg-slate-50/50 border-t border-slate-100">
         <div className="flex gap-4">
            <input 
               value={inputText} 
               onChange={e => setInputText(e.target.value)} 
               onKeyPress={e => e.key === 'Enter' && handleSend()}
               placeholder="Xabaringizni yozing..." 
               className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all"
            />
            <button onClick={handleSend} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all">
               <Send size={24}/>
            </button>
         </div>
      </div>
    </div>
  );
};

export default Chat;

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, ShoppingBag, ChevronRight, Minus, Maximize2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// LƯU Ý QUAN TRỌNG: Bạn cần import file cấu hình supabase của bạn vào đây. 
// Hãy sửa lại đường dẫn './supabaseClient' cho đúng với project của bạn nhé!
import { supabase } from './supabaseClient'; 

const MessageBubble = ({ msg, onViewProduct }) => {
  const isBot = msg.isBot;

  return (
    <div className={`flex flex-col gap-2 ${isBot ? 'items-start' : 'items-end'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm whitespace-pre-line leading-relaxed
          ${isBot
            ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            : 'bg-brand text-white rounded-tr-none'
          }`}
      >
        {msg.text}
      </div>

      {isBot && msg.products && msg.products.length > 0 && (
        <div className="w-full max-w-[90%] mt-2 space-y-3">
          {msg.products.map((p) => (
            <div
              key={p.id}
              onClick={() => onViewProduct(p.id)}
              className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-brand/50 transition-all cursor-pointer overflow-hidden"
            >
              <div className="flex gap-3 items-center">
                <div className="bg-brand/10 p-2.5 rounded-xl text-brand group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300 shrink-0">
                  <ShoppingBag size={20} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-700 text-sm line-clamp-2 leading-snug">
                    {p.name}
                  </h4>
                  <p className="text-brand font-black text-sm mt-1">
                    {p.price.toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>
              <div className="w-full mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400 group-hover:text-brand transition-colors">
                <span className="text-xs font-medium">Xem chi tiết sản phẩm</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatAI = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(() => {
    const savedState = sessionStorage.getItem('saha_chat_is_open');
    return savedState === 'true';
  });

  const [isMinimized, setIsMinimized] = useState(() => {
    const savedMin = sessionStorage.getItem('saha_chat_is_minimized');
    return savedMin === 'true';
  });

  const [messages, setMessages] = useState(() => {
    const savedMessages = sessionStorage.getItem('saha_chat_history');
    if (savedMessages) {
      return JSON.parse(savedMessages);
    }
    return [
      {
        id: 1,
        text: 'Chào bạn! Mình là Dược sĩ AI của SaHa.\nBạn cần tư vấn sức khỏe hoặc tìm sản phẩm gì không?',
        isBot: true,
        products: null,
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('saha_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('saha_chat_is_open', isOpen.toString());
    sessionStorage.setItem('saha_chat_is_minimized', isMinimized.toString());
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (containerRef.current && !isMinimized) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), text, isBot: false, products: null };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. LẤY ID NGƯỜI DÙNG TỪ SUPABASE
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user ? user.id : "guest-session-anonymous";

      // 2. GỬI KÈM USER_ID TRONG BODY
      const res = await fetch(import.meta.env.VITE_AI_URL + '/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
          user_id: currentUserId 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Loi mang: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const botMsg = {
        id: Date.now() + 1,
        text: data.answer || data.response, // Dự phòng nếu API trả về 'response' thay vì 'answer'
        isBot: true,
        products: data.products || null,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        text: `Lỗi kết nối Backend: ${err.message}`,
        isBot: true,
        products: null,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
    setIsMinimized(true);
  };

  const hiddenRoutes = ['/login', '/register', '/forgot-password'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null; 
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false); 
          }}
          className="bg-brand text-white px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 transition-all hover:bg-brand-hover animate-bounce-slow"
        >
          <Sparkles size={22} />
          <span className="font-bold text-sm">Hỏi Dược Sĩ AI</span>
        </button>
      )}

      {isOpen && (
        <div
          className={`bg-white w-[380px] rounded-[1.75rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'h-auto' : 'h-[580px]'
            }`}
        >
          <div
            className="bg-brand px-5 py-4 text-white flex justify-between items-center shrink-0 cursor-pointer"
            onClick={() => isMinimized && setIsMinimized(false)} 
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot size={22} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Dược Sĩ AI SaHa</h4>
                {!isMinimized && (
                  <div className="text-[10px] opacity-80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
                    Đang trực tuyến
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  setIsMinimized(!isMinimized);
                }}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minus size={18} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                title="Đóng chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div
                ref={containerRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/60"
              >
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} onViewProduct={handleViewProduct} />
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none text-xs border border-slate-100 text-slate-400 shadow-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Hỏi về sức khỏe, sản phẩm..."
                  className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/30 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="bg-brand text-white p-2.5 rounded-xl disabled:opacity-40 hover:bg-brand-hover transition-colors"
                >
                  <Send size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatAI;
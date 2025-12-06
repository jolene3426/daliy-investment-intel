import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Feather } from 'lucide-react';
import { createChatSession } from './services/geminiService';
import { ReportDisplay } from './components/ReportDisplay';
import { PreferencePanel } from './components/PreferencePanel';
import { UserConfig, ChatMessage, GenerationState, NewsPreferences } from './types';
import { Chat } from "@google/genai";

export default function App() {
  // Config is now managed conversationally
  const [config] = useState<UserConfig>({
    email: '',
    targetTime: '',
  });

  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    statusMessage: '',
    error: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start chat on mount
  useEffect(() => {
    if (!hasStartedRef.current) {
      startChat();
      hasStartedRef.current = true;
    }
  }, []);

  const startChat = async () => {
    try {
      setState(prev => ({ ...prev, isGenerating: true }));
      const chat = createChatSession(config);
      setChatSession(chat);

      // Trigger the persona to start Phase 1 with the Welcome Message
      const response = await chat.sendMessage({ message: "系統啟動：請開始你的歡迎詞與介紹。" });
      
      const text = response.text;
      if (text) {
        setMessages([{
          id: Date.now().toString(),
          role: 'model',
          text: text
        }]);
      }
      setState(prev => ({ ...prev, isGenerating: false }));
    } catch (e) {
      console.error(e);
      setState(prev => ({ ...prev, isGenerating: false, error: "無法連接到播報員，請稍後再試。" }));
    }
  };

  const handlePreferencesConfirm = async (prefs: NewsPreferences) => {
    // Send a system-like message from the user to the bot to inform it of the choices
    const textMsg = `我已設定新聞偏好：
- 政治與地緣: ${prefs.politics}%
- 經濟與市場: ${prefs.economics}%
- 生活與健康: ${prefs.lifestyle}%
- ${prefs.includeAiSummary ? '✅ 請務必包含 AI 總結與延伸' : '❌ 不需 AI 總結'}

請確認收到並繼續下一步。`;

    handleSend(textMsg);
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || !chatSession || state.isGenerating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      const response = await chatSession.sendMessage({ message: textToSend });
      const text = response.text;
      
      // Handle grounding metadata (links)
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let finalText = text || "";
      
      if (groundingChunks && groundingChunks.length > 0) {
        const uniqueLinks = new Set();
        let linksText = "\n\n---\n**資料來源:**\n";
        let hasLinks = false;
        
        groundingChunks.forEach((chunk) => {
          if (chunk.web?.uri && chunk.web?.title) {
            const linkMd = `- [${chunk.web.title}](${chunk.web.uri})`;
            if (!uniqueLinks.has(chunk.web.uri)) {
              uniqueLinks.add(chunk.web.uri);
              linksText += `${linkMd}\n`;
              hasLinks = true;
            }
          }
        });
        if (hasLinks) {
          finalText += linksText;
        }
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: finalText
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "抱歉，連線有點不穩定，請再說一次？"
      }]);
    } finally {
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-stone-600 font-sans selection:bg-yellow-200">
      
      {/* Header - Soft Goose Yellow & Beige */}
      <header className="sticky top-0 z-50 w-full bg-[#FFFBEB]/90 backdrop-blur-md shadow-sm border-b border-yellow-200/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center relative">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Feather className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-yellow-900 tracking-tight">
                每日訂製新聞播報
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl flex flex-col h-[calc(100vh-4rem)]">
        
        {/* Preference Panel - Always available or collapsible */}
        <div className="mb-2 shrink-0">
          <PreferencePanel onConfirm={handlePreferencesConfirm} />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pb-4 pr-2 custom-scrollbar">
          {messages.length === 0 && state.isGenerating && (
            <div className="flex justify-center items-center h-full text-yellow-600/50 animate-pulse text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              正在呼叫您的專屬播報員...
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[95%] md:max-w-[85%] rounded-2xl px-5 py-4 shadow-sm text-sm md:text-base ${
                  msg.role === 'user'
                    ? 'bg-[#FDE68A] text-yellow-900 rounded-br-none'
                    : 'bg-white border border-stone-100 text-stone-700 rounded-bl-none'
                }`}
              >
                {msg.role === 'model' ? (
                  <ReportDisplay markdown={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          {state.isGenerating && messages.length > 0 && (
             <div className="flex justify-start w-full">
               <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-4 bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-yellow-100 p-2 flex items-end gap-2 relative z-10 shrink-0">
           <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="請輸入您的回答..."
            className="w-full bg-transparent border-none text-stone-600 placeholder:text-stone-300 focus:ring-0 resize-none py-3 px-4 max-h-32 min-h-[50px] custom-scrollbar text-sm md:text-base"
            rows={1}
            disabled={state.isGenerating}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || state.isGenerating}
            className={`p-3 rounded-2xl mb-1 transition-all duration-200 ${
              input.trim() && !state.isGenerating
                ? 'bg-[#FDE68A] text-yellow-900 shadow-sm hover:bg-yellow-300 hover:scale-105'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center text-[10px] text-stone-300 mt-3 font-light shrink-0">
          AI 播報員可能會有幻覺，投資請謹慎評估
        </div>

      </main>
    </div>
  );
}
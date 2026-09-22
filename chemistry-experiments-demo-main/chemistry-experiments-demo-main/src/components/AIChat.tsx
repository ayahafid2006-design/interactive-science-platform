import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Sparkles, Send, Beaker, Play } from 'lucide-react';
import { ChemistryKeyboard } from './ChemistryKeyboard';
import { soundManager } from '../utils/sound';

interface AIChatProps {
  chapterTitle?: string;
  onSimulate?: () => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  hasSimulation?: boolean;
}

export function AIChat({ chapterTitle = 'الكيمياء', onSimulate }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `أهلاً بك! أنا المساعد الذكي. يمكنك كتابة أي مسألة كيميائية من منهج السادس العلمي وسأقوم بحلها مع الشرح التفصيلي، وسأوفر لك محاكاة 3D حقيقية للتجربة! استخدم الكيبورد الكيميائي لكتابة الرموز والمعادلات.` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (char: string) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const newValue = inputValue.substring(0, start) + char + inputValue.substring(end);
      setInputValue(newValue);
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(start + char.length, start + char.length);
        }
      }, 0);
    } else {
      setInputValue(prev => prev + char);
    }
  };

  const handleBackspace = () => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      if (start === end && start > 0) {
        setInputValue(inputValue.substring(0, start - 1) + inputValue.substring(end));
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(start - 1, start - 1);
          }
        }, 0);
      } else if (start !== end) {
        setInputValue(inputValue.substring(0, start) + inputValue.substring(end));
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.setSelectionRange(start, start);
          }
        }, 0);
      }
    } else {
      setInputValue(prev => prev.slice(0, -1));
    }
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    soundManager.playClick();
    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    
    // Simulate AI response with step-by-step solution and simulation button
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: `لقد قمت بتحليل مسألتك حول "${userText}".\n\nالخطوة 1: نحدد المعطيات الكيميائية للتفاعل.\nالخطوة 2: نطبق قوانين الثرموداينمك (أو التوازن) لحساب الناتج بدقة.\nالخطوة 3: التفاعل باعث للحرارة ויصاحبه تغير في الألوان.\n\nلقد قمت بتجهيز محاكاة واقعية لهذه المسألة في المختبر ثلاثي الأبعاد!`,
        hasSimulation: true
      }]);
      soundManager.playSuccess();
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => { setIsOpen(true); soundManager.playHover(); }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/30 flex items-center justify-center text-white z-40 border border-white/20"
      >
        <Bot size={32} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[450px] h-[650px] max-h-[85vh] max-w-[95vw] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-white">المساعد الكيميائي الذكي</h3>
                  <p className="text-xs text-slate-400 flex items-center">
                    <Sparkles size={12} className="mr-1 text-cyan-400" /> يحل أي مسألة كيميائية
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setIsOpen(false); soundManager.playClick(); }}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  
                  {msg.hasSimulation && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => {
                        soundManager.playSuccess();
                        if (onSimulate) {
                           setIsOpen(false);
                           onSimulate();
                        }
                      }}
                      className="mt-2 mr-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/30"
                    >
                      <Play size={16} fill="currentColor" />
                      محاكاة المسألة في المختبر 3D
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="bg-slate-800/50 p-3 border-t border-white/10">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setShowKeyboard(true)}
                  placeholder="اكتب أي مسألة من كتاب السادس العلمي..."
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none h-12 custom-scrollbar"
                  rows={1}
                />
                <button 
                  onClick={handleSend}
                  className="w-12 h-12 bg-cyan-600 hover:bg-cyan-500 rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  <Send size={20} className="transform rotate-180" />
                </button>
              </div>
            </div>

            {/* Custom Keyboard */}
            <AnimatePresence>
              {showKeyboard && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-900"
                >
                  <ChemistryKeyboard 
                    onInsert={handleInsert}
                    onBackspace={handleBackspace}
                    onSubmit={handleSend}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

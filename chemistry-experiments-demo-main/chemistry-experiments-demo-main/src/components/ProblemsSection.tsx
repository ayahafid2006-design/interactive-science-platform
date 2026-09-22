import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Play, Lightbulb, CheckCircle2, MessageSquare, Bot, Send, X } from 'lucide-react';
import { useState } from 'react';
import { soundManager } from '../utils/sound';

import { SAMPLE_PROBLEMS } from '../data/problems';

export function ProblemsSection({ chapterId, onSimulate }: { chapterId: string, onSimulate: (config: any) => void }) {
  const filteredProblems = SAMPLE_PROBLEMS.filter(p => p.chapterId === chapterId || !p.chapterId);

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatInputs, setChatInputs] = useState<Record<string, string>>({});
  const [chats, setChats] = useState<Record<string, Array<{role: 'user' | 'ai', text: string}>>>({});

  const handleSendMessage = (problemId: string, title: string) => {
    const input = chatInputs[problemId];
    if (!input || !input.trim()) return;

    const currentChat = chats[problemId] || [
      { role: 'ai' as const, text: `أهلاً بك! أنا المساعد الذكي. كيف يمكنني مساعدتك في فهم مسألة "${title}"؟ هل يوجد خطوة غير واضحة؟` }
    ];

    const newChat = [...currentChat, { role: 'user' as const, text: input }];
    setChats({ ...chats, [problemId]: newChat });
    setChatInputs({ ...chatInputs, [problemId]: '' });

    setTimeout(() => {
      setChats(prev => ({
        ...prev,
        [problemId]: [
          ...newChat,
          { role: 'ai' as const, text: `الخطوة التي تسأل عنها في مسألة "${title}" مهمة جداً. في هذه الخطوة نطبق القانون بشكل مباشر لأن المعطيات تدل على ذلك. هل تود أن أعيد صياغة المعادلة لك بطريقة أبسط؟` }
        ]
      }));
    }, 1000);
  };

  const toggleChat = (problemId: string, title: string) => {
    if (activeChat === problemId) {
      setActiveChat(null);
    } else {
      setActiveChat(problemId);
      if (!chats[problemId]) {
        setChats({
          ...chats,
          [problemId]: [
            { role: 'ai' as const, text: `أهلاً بك! أنا المساعد الذكي. كيف يمكنني مساعدتك في فهم مسألة "${title}"؟ هل يوجد خطوة غير واضحة؟` }
          ]
        });
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-900/40 to-slate-900/40 p-8 rounded-3xl border border-blue-500/20 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <Calculator className="ml-3 text-blue-400" />
          بنك المسائل الذكي
        </h2>
        <p className="text-slate-400">
          استعرض أهم المسائل الوزارية وأمثلة الكتاب مع خطوات حل نموذجية وتفسير ذكي لكل خطوة. الأجمل؟ يمكنك محاكاة أي مسألة لمشاهدتها في الواقع!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredProblems.map((problem) => (
          <motion.div 
            key={problem.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col"
          >
            <div className="flex flex-col md:flex-row">
              {/* Problem Info */}
              <div className="p-8 flex-1">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">{problem.title}</h3>
                <p className="text-lg text-slate-200 leading-relaxed mb-6 font-medium whitespace-pre-wrap bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                  {problem.question}
                </p>
                
                <div className="space-y-4 mb-8">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Lightbulb size={16} className="ml-2 text-yellow-500" />
                    خطوات الحل النموذجية:
                  </h4>
                  {problem.steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col mb-2 pl-4 border-r-2 border-slate-700">
                      <p className="text-slate-300 mr-3">{step.text}</p>
                      {step.math && (
                        <p className="text-cyan-300 font-mono mt-2 mr-3 bg-black/30 p-2 rounded-lg text-left" dir="ltr">
                          {step.math}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center text-green-400 bg-green-500/10 p-4 rounded-2xl border border-green-500/20 mb-6">
                  <CheckCircle2 size={24} className="ml-3 flex-shrink-0" />
                  <p className="font-bold text-lg" dir="ltr">{problem.finalAnswer}</p>
                </div>

                <button
                  onClick={() => toggleChat(problem.id, problem.title)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl transition-colors font-bold"
                >
                  <MessageSquare size={18} />
                  {activeChat === problem.id ? 'إخفاء المساعد الذكي' : 'استفسر من المساعد الذكي عن هذه المسألة'}
                </button>
              </div>

              {/* Simulation Sidebar */}
              <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 md:w-72 flex flex-col items-center justify-center border-t md:border-t-0 md:border-r border-white/10 text-center">
                <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30 relative">
                  <div className="absolute inset-0 rounded-full animate-ping bg-cyan-500/20" />
                  <Play size={40} className="text-cyan-400 ml-1" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">محاكاة المسألة</h4>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  اضغط هنا لدخول المختبر الافتراضي ومشاهدة التفاعل بأم عينيك لتعميق الفهم.
                </p>
                <button 
                  onClick={() => { onSimulate(problem.simulationConfig); }}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-1"
                >
                  بدء المحاكاة التفاعلية
                </button>
              </div>
            </div>

            {/* Inline AI Chat */}
            <AnimatePresence>
              {activeChat === problem.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10 bg-slate-900/80 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-400">
                      <Bot size={24} />
                      <h4 className="font-bold">المساعد الذكي للمسألة</h4>
                    </div>
                    
                    <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {(chats[problem.id] || []).map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                            : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleSendMessage(problem.id, problem.title)}
                        className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors flex items-center justify-center shrink-0"
                      >
                        <Send size={20} className="transform rotate-180" />
                      </button>
                      <input
                        type="text"
                        value={chatInputs[problem.id] || ''}
                        onChange={(e) => setChatInputs({ ...chatInputs, [problem.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(problem.id, problem.title)}
                        placeholder="اسأل عن أي خطوة غير واضحة..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

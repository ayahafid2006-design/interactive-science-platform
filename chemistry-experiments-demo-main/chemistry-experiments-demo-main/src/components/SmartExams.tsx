import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Brain, Clock, ShieldAlert, CheckCircle, RefreshCcw, Send, Play, Trophy, Sparkles, ScrollText } from 'lucide-react';
import { CHAPTERS } from '../types';

export function SmartExams({ onBack }: { onBack: () => void }) {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [examMode, setExamMode] = useState<'mcq' | 'written' | null>(null);
  
  // MCQ State
  const [mcqs, setMcqs] = useState<any[]>([]);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [mcqScore, setMcqScore] = useState(0);
  const [showMcqResult, setShowMcqResult] = useState(false);
  const [isLoadingMcq, setIsLoadingMcq] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Written State
  const [writtenQuestion, setWrittenQuestion] = useState('');
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [writtenResult, setWrittenResult] = useState<any>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const startMcqExam = async () => {
    setIsLoadingMcq(true);
    setExamMode('mcq');
    try {
      const chapter = CHAPTERS.find(c => c.id === selectedChapter);
      const res = await fetch('/api/generate-mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterTitle: chapter?.title, count: 5 })
      });
      const data = await res.json();
      // Shuffle questions
      const shuffled = (data.questions || []).sort(() => 0.5 - Math.random());
      setMcqs(shuffled);
      setCurrentMcqIndex(0);
      setMcqScore(0);
      setShowMcqResult(false);
      setSelectedOption(null);
    } catch (e) {
      console.error(e);
    }
    setIsLoadingMcq(false);
  };

  const handleMcqSubmit = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === mcqs[currentMcqIndex].correctOptionIndex) {
      setMcqScore(s => s + 1);
    }

    if (currentMcqIndex < mcqs.length - 1) {
      setCurrentMcqIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setShowMcqResult(true);
    }
  };

  const startWrittenExam = () => {
    setExamMode('written');
    setWrittenQuestion('عرف الانثالبي (ΔH) واذكر متى تكون قيمته موجبة أو سالبة؟'); // Mock question, ideally AI generated
    setTimeLeft(180); // 3 minutes
    setWrittenAnswer('');
    setWrittenResult(null);
  };

  const gradeWrittenAnswer = async () => {
    setIsGrading(true);
    try {
      const chapter = CHAPTERS.find(c => c.id === selectedChapter);
      const res = await fetch('/api/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: writtenQuestion, 
          answer: writtenAnswer, 
          chapter: chapter?.title,
          type: 'تعريف' 
        })
      });
      const data = await res.json();
      setWrittenResult(data);
    } catch (e) {
      console.error(e);
      setWrittenResult({ score: 5, feedback: "حدث خطأ أثناء التقييم الآلي، يرجى المحاولة لاحقاً.", correctAnswer: "..." });
    }
    setIsGrading(false);
  };

  if (!selectedChapter) {
    return (
      <div className="h-full flex flex-col bg-slate-950 p-6 md:p-8">
        <button onClick={onBack} className="self-start p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors mb-6">
          <ArrowRight size={24} className="text-slate-300" />
        </button>
        <div className="mb-8 flex items-center gap-4">
          <div className="p-4 bg-purple-500/20 text-purple-400 rounded-2xl">
            <Brain size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">منصة الامتحانات الذكية (AI)</h2>
            <p className="text-slate-400">اختر الفصل الذي تود امتحانه، وسيقوم الذكاء الاصطناعي بتوليد وتقييم الإجابات.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CHAPTERS.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter.id)}
              className="bg-slate-900 border border-white/10 p-6 rounded-3xl hover:border-purple-500/50 hover:bg-slate-800 transition-all text-right flex flex-col items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl" style={{ backgroundColor: `${chapter.color}20`, color: chapter.color }}>
                {chapter.id.replace('chapter', '')}
              </div>
              <h3 className="text-xl font-bold text-white">{chapter.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2">{chapter.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 p-6 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => { setExamMode(null); setSelectedChapter(null); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowRight size={24} className="text-slate-300" />
        </button>
        <h2 className="text-2xl font-bold text-white">
          امتحان: {CHAPTERS.find(c => c.id === selectedChapter)?.title}
        </h2>
      </div>

      {!examMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">اختيارات متعددة (MCQ)</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              أسئلة شاملة لكل الفصل، تتغير في كل جولة لضمان عدم الحفظ وتنمية الفهم.
            </p>
            <button onClick={startMcqExam} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25">
              <Play size={20} /> ابدأ امتحان الـ MCQ
            </button>
          </div>

          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <ScrollText size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">أسئلة مقالية وتعاريف</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              اكتب التعريف أو التعليل بأسلوبك، وسيقوم المصحح الآلي (AI) بإعطائك درجة عادلة حتى على الإجابات المنقوصة.
            </p>
            <button onClick={startWrittenExam} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25">
              <Play size={20} /> ابدأ الامتحان المقالي
            </button>
          </div>
        </div>
      )}

      {/* MCQ EXAM */}
      {examMode === 'mcq' && (
        <div className="max-w-3xl mx-auto w-full">
          {isLoadingMcq ? (
            <div className="text-center py-20 flex flex-col items-center">
              <RefreshCcw size={48} className="text-blue-500 animate-spin mb-6" />
              <h3 className="text-xl font-bold text-white">جاري توليد الأسئلة بذكاء...</h3>
            </div>
          ) : showMcqResult ? (
            <div className="bg-slate-900 border border-white/10 p-10 rounded-3xl text-center">
              <Trophy size={64} className="text-yellow-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-white mb-2">النتيجة النهائية</h3>
              <p className="text-5xl font-bold text-blue-400 mb-8">{mcqScore} / {mcqs.length}</p>
              <button onClick={() => setExamMode(null)} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all">
                عودة للقائمة
              </button>
            </div>
          ) : mcqs.length > 0 ? (
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-8 text-slate-400">
                <span className="font-bold">سؤال {currentMcqIndex + 1} من {mcqs.length}</span>
                <span className="flex items-center gap-2"><Sparkles size={16} className="text-blue-400"/> مولد بالذكاء الاصطناعي</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">{mcqs[currentMcqIndex].text}</h3>
              <div className="space-y-4 mb-8">
                {mcqs[currentMcqIndex].options.map((opt: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(i)}
                    className={`w-full p-4 rounded-xl text-right border transition-all ${
                      selectedOption === i 
                        ? 'bg-blue-600/20 border-blue-500 text-white' 
                        : 'bg-slate-800 border-white/5 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleMcqSubmit}
                disabled={selectedOption === null}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
              >
                تأكيد الإجابة
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* WRITTEN EXAM */}
      {examMode === 'written' && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl mb-6">
            <div className="flex justify-between items-center mb-6">
              <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 font-bold rounded-full text-sm">
                سؤال تعريفي
              </span>
              <span className="flex items-center gap-2 text-red-400 font-bold bg-red-500/10 px-4 py-1.5 rounded-full">
                <Clock size={16} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-8 leading-relaxed">{writtenQuestion}</h3>
            
            <textarea
              value={writtenAnswer}
              onChange={(e) => setWrittenAnswer(e.target.value)}
              disabled={isGrading || writtenResult !== null}
              placeholder="اكتب إجابتك هنا..."
              className="w-full h-40 bg-black/50 border border-white/10 rounded-2xl p-6 text-white text-lg placeholder-slate-600 focus:outline-none focus:border-purple-500 resize-none mb-6"
            />

            {!writtenResult ? (
              <button 
                onClick={gradeWrittenAnswer}
                disabled={isGrading || !writtenAnswer.trim()}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/25"
              >
                {isGrading ? <RefreshCcw className="animate-spin" /> : <Send size={20} className="transform rotate-180" />}
                {isGrading ? 'جاري تصحيح الإجابة...' : 'تسليم للإجابة'}
              </button>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800/80 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                   <h4 className="font-bold text-xl text-white">تقييم المصحح الآلي:</h4>
                   <span className="text-2xl font-black text-purple-400">{writtenResult.score} / 10</span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">
                  {writtenResult.feedback}
                </p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                   <h5 className="font-bold text-emerald-400 mb-2">الإجابة النموذجية:</h5>
                   <p className="text-emerald-200/80 leading-relaxed">{writtenResult.correctAnswer}</p>
                </div>
                <button onClick={startWrittenExam} className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all">
                  سؤال آخر
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

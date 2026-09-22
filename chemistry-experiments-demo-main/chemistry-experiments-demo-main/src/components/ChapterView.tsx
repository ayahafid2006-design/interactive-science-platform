import { motion, AnimatePresence } from 'motion/react';
import { Chapter } from '../types';
import { soundManager } from '../utils/sound';
import { ArrowRight, Beaker, Play, Info, Maximize2, BookOpen } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Scene3D } from './Scene3D';
import { useState, useEffect } from 'react';
import { InteractiveLab } from './InteractiveLab';
import { AIChat } from './AIChat';

interface ChapterViewProps {
  chapter: Chapter;
  onBack: () => void;
}

export function ChapterView({ chapter, onBack }: ChapterViewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLabConfig, setActiveLabConfig] = useState<any | null>(null);

  useEffect(() => {
    soundManager.playSuccess();
  }, []);

  const handleBack = () => {
    soundManager.playClick();
    onBack();
  };

  const handleInteract = () => {
    soundManager.playHover();
  };

  const startLab = (config: any = { type: 'standard' }) => {
    if (config.type === 'conductivity' || config.id === 'exp_cond1') {
      window.location.href = '/chapter_3/experiment_1_conductivity/index.html';
      return;
    }
    setActiveLabConfig(config);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8 relative font-sans flex flex-col"
      dir="rtl"
    >
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${chapter.color} 0%, transparent 70%)` 
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center mb-8 bg-slate-900/60 backdrop-blur-lg p-4 rounded-2xl border border-white/5 shadow-lg">
        <button 
          onClick={handleBack}
          onMouseEnter={() => soundManager.playHover()}
          className="flex items-center space-x-2 space-x-reverse text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowRight size={20} />
          <span>العودة للفصول</span>
        </button>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-white/10 border" style={{ borderColor: chapter.color, color: chapter.color }}>
            {chapter.number}
          </div>
          <h2 className="text-xl md:text-2xl font-bold">{chapter.title}</h2>
        </div>
      </nav>

      {!chapter.isComingSoon ? (
        <>
          <AnimatePresence>
            {activeLabConfig !== null && (
              <InteractiveLab 
                experiment={activeLabConfig} 
                onBack={() => setActiveLabConfig(null)} 
                chapterColor={chapter.color}
              />
            )}
          </AnimatePresence>

          {/* Main Content - Experiments Only */}
          <div className="flex-1 relative z-10">
            <motion.div 
              key="experiments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
            >
              {/* Left Side: 3D Interaction Area */}
              <div className={`lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 to-black border border-white/10 shadow-2xl flex flex-col ${isFullscreen ? 'fixed inset-4 z-50' : 'min-h-[500px]'}`}>
                
                <div className="absolute top-4 right-4 z-10 flex space-x-2 space-x-reverse">
                  <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center text-sm font-medium">
                    <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: chapter.color }} />
                    محاكاة ثلاثية الأبعاد تفاعلية
                  </div>
                </div>

                <div className="absolute top-4 left-4 z-10">
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-black/50 hover:bg-black/80 backdrop-blur-md p-3 rounded-full border border-white/10 transition-colors text-white"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>

                <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
                  <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
                    <Scene3D chapterId={chapter.id} color={chapter.color} />
                    <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={20} blur={2} far={4.5} color={chapter.color} />
                    <OrbitControls 
                      enablePan={false} 
                      maxPolarAngle={Math.PI / 2 + 0.1}
                      minPolarAngle={Math.PI / 4}
                      onChange={handleInteract}
                    />
                    <Environment preset="studio" />
                  </Canvas>
                </div>
                
                {/* Controls hint */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-sm text-slate-300 pointer-events-none flex items-center">
                  <Info size={16} className="ml-2" />
                  قم بالسحب للتدوير، والتمرير للتكبير
                </div>
              </div>

              {/* Right Side: Interactive Experiments List */}
              <div className="bg-slate-900/60 backdrop-blur-lg p-6 rounded-3xl border border-white/5 flex flex-col h-[500px]">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Beaker size={24} className="ml-2" style={{ color: chapter.color }} />
                  التجارب المتاحة
                </h3>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {chapter.experiments && chapter.experiments.length > 0 ? chapter.experiments.map((exp, index) => (
                    <button 
                      key={exp.id}
                      onClick={() => {
                        soundManager.playClick();
                        startLab(exp);
                      }}
                      onMouseEnter={() => soundManager.playHover()}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group text-right"
                    >
                      <div className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center ml-3 bg-slate-800 group-hover:bg-opacity-80 transition-colors shadow-lg shrink-0"
                          style={{ color: chapter.color, boxShadow: `0 0 10px ${chapter.color}40` }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors text-sm mb-1">
                            {exp.title}
                          </span>
                          <span className="text-xs text-slate-400">
                            المواد: {exp.reagents.join(' + ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white transition-all ml-4 shrink-0">
                        <Play size={12} className="ml-1" />
                        محاكاة
                      </div>
                    </button>
                  )) : (
                    <div className="text-center text-slate-400 py-8">
                      لا توجد تجارب محاكاة متاحة لهذا الفصل حالياً.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg rounded-2xl border border-white/5 shadow-lg mt-12 text-center flex-grow">
          <BookOpen size={64} className="mb-6 opacity-50" style={{ color: chapter.color }} />
          <h2 className="text-4xl font-bold mb-4 text-white">الفصل قريباً</h2>
          <p className="text-xl text-slate-400">نحن نعمل على تجهيز هذا المحتوى بأفضل صورة...</p>
        </div>
      )}

      {/* AI Chat Widget */}
      <AIChat chapterTitle={chapter.title} onSimulate={() => startLab({ type: 'standard', id: 'ai-sim', title: 'محاكاة من المساعد الذكي', reagents: ['مادة 1', 'مادة 2'], colors: ['#ff0000', '#00ff00'], productColor: '#0000ff' })} />

    </motion.div>
  );
}

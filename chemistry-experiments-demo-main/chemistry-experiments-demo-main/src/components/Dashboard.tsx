import { motion, AnimatePresence } from 'motion/react';
import { CHAPTERS, Chapter } from '../types';
import { soundManager } from '../utils/sound';
import { Flame, Scale, Droplet, Zap, Hexagon, TestTube, Share2, Leaf, ArrowRight, Book } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { Scene3D } from './Scene3D';
import { OrbitControls, Environment } from '@react-three/drei';

const ICONS = {
  Flame,
  Scale,
  Droplet,
  Zap,
  Hexagon,
  TestTube,
  Share2,
  Leaf
};

interface DashboardProps {
  onSelectChapter: (chapter: Chapter) => void;
}

export function Dashboard({ onSelectChapter }: DashboardProps) {
  const handleSelect = (chapter: Chapter) => {
    soundManager.playClick();
    if (chapter.id === 'ionic-equilibrium') {
      window.location.href = '/chapter_3/index.html';
      return;
    }
    if (chapter.id === 'chemical-equilibrium') {
      window.location.href = '/chapter_2/index.html';
      return;
    }
    onSelectChapter(chapter);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 overflow-x-hidden relative font-sans" dir="rtl">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-l from-blue-400 via-purple-400 to-cyan-400 text-transparent bg-clip-text tracking-tight">
            الكيمياء التفاعلية
          </h1>
          <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto">
            منصة تعليمية مبهرة لطلاب السادس العلمي، استكشف التفاعلات والمفاهيم الكيميائية بطريقة واقعية واحترافية.
          </p>
        </motion.header>

        <AnimatePresence mode="wait">
          <motion.div 
            key="chapters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {CHAPTERS.map((chapter, index) => {
              const Icon = ICONS[chapter.icon as keyof typeof ICONS];
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onHoverStart={() => soundManager.playHover()}
                  onClick={() => handleSelect(chapter)}
                  className="group relative cursor-pointer rounded-3xl overflow-hidden bg-slate-900/50 border border-slate-800 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="h-48 w-full relative bg-black/20">
                    <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                       <Scene3D chapterId={chapter.id} color={chapter.color} />
                       <Environment preset="city" />
                    </Canvas>
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2 border border-white/10">
                      {Icon && <Icon size={24} color={chapter.color} />}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center border border-white/10 font-bold text-lg text-white">
                      {chapter.number}
                    </div>
                  </div>

                  <div className="p-6 relative">
                    <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                      {chapter.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {chapter.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-semibold transition-colors" style={{ color: chapter.color }}>
                      <span>استكشف الفصل</span>
                      <ArrowRight size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                  
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"
                    style={{ backgroundColor: chapter.color }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

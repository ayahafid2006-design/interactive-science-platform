import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Experiment } from '../types';
import { soundManager } from '../utils/sound';
import { 
  ArrowRight, RotateCcw, Play, Pause, 
  CheckCircle, Clock, ChevronLeft, Scale
} from 'lucide-react';

interface MoleculePair {
  id: number;
  type: 'REACTANTS' | 'PRODUCTS';
  subType?: 'H2' | 'I2' | 'BOTH';
  state: 'FALLING' | 'POOL_LEFT' | 'TO_TOP' | 'TOP_PIPE' | 'TO_RIGHT' | 'POOL_RIGHT' | 'TO_BOTTOM' | 'BOTTOM_PIPE' | 'TO_LEFT';
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  glowTimer: number;
}

interface FlowMarker {
  id: number;
  region: 'LEFT_POOL' | 'RIGHT_POOL' | 'TOP_PIPE' | 'BOTTOM_PIPE';
  radius: number;
  angle: number;
  x: number;
  y: number;
}

interface Props {
  experiment: Experiment;
  onBack: () => void;
  chapterColor?: string;
}

export function DynamicEquilibrium2DLab({ experiment, onBack, chapterColor = '#4CAF50' }: Props) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); 
  const [tutorialStep, setTutorialStep] = useState<number>(-1); 

  const [activeFlask, setActiveFlask] = useState<'H2' | 'I2' | null>(null);
  const [inventory, setInventory] = useState({ h2: 0, i2: 0 });
  const [particles, setParticles] = useState<MoleculePair[]>([]);
  const [markers, setMarkers] = useState<FlowMarker[]>([]);
  
  const canvasWidth = 600;
  const canvasHeight = 380;

  const particlesRef = useRef<MoleculePair[]>([]);
  const markersRef = useRef<FlowMarker[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const particlesDOMRefs = useRef<(SVGGElement | null)[]>([]);
  const markersDOMRefs = useRef<(SVGPathElement | null)[]>([]);
  const renderedTypesRef = useRef<string[]>([]);

  const initSimulation = () => {
    particlesRef.current = [];
    renderedTypesRef.current = [];
    setParticles([]);
    setInventory({ h2: 0, i2: 0 });

    const newMarkers: FlowMarker[] = [];
    let mId = 0;
    
    for (let i = 0; i < 40; i++) {
        newMarkers.push({
            id: mId++, region: 'LEFT_POOL',
            radius: 10 + Math.random() * 35,
            angle: Math.random() * Math.PI * 2,
            x: 0, y: 0
        });
    }
    for (let i = 0; i < 40; i++) {
        newMarkers.push({
            id: mId++, region: 'RIGHT_POOL',
            radius: 10 + Math.random() * 35,
            angle: Math.random() * Math.PI * 2,
            x: 0, y: 0
        });
    }
    for (let i = 0; i < 35; i++) {
        newMarkers.push({
            id: mId++, region: 'TOP_PIPE',
            radius: 70 + Math.floor(Math.random() * 3) * 30 + (Math.random()*14 - 7), 
            angle: 120 + Math.random() * 300, 
            x: 0, y: 0
        });
    }
    for (let i = 0; i < 35; i++) {
        newMarkers.push({
            id: mId++, region: 'BOTTOM_PIPE',
            radius: 210 + Math.floor(Math.random() * 3) * 30 + (Math.random()*14 - 7), 
            angle: 120 + Math.random() * 300, 
            x: 0, y: 0
        });
    }

    markersRef.current = newMarkers;
    setMarkers([...newMarkers]);
    setTutorialStep(-1);
  };

  const dropMolecule = (type: 'H2' | 'I2') => {
    if (type === 'H2' && inventory.h2 >= 6) return;
    if (type === 'I2' && inventory.i2 >= 6) return;

    soundManager.playClick();
    
    setInventory(prev => ({ ...prev, [type.toLowerCase()]: prev[type.toLowerCase() as keyof typeof prev] + 1 }));

    const newParticle: MoleculePair = {
      id: particlesRef.current.length,
      type: 'REACTANTS',
      subType: type,
      state: 'FALLING',
      x: type === 'H2' ? 20 : 200, // spout position when hovering active
      y: -200, // spout position when hovering active
      vx: -1.0 + (Math.random() - 0.5) * 1, // tilt left velocity
      vy: 2 + Math.random() * 2,
      targetY: 0,
      glowTimer: 0
    };
    
    particlesRef.current.push(newParticle);
    renderedTypesRef.current.push(newParticle.type);
    setParticles([...particlesRef.current]);
  };

  const handleStartReaction = () => {
    soundManager.playClick();
    
    // Merge the independent 6 H2 and 6 I2 into 6 BOTH pairs to satisfy the equilibrium physics engine
    const mergedParticles: MoleculePair[] = Array.from({length: 6}).map((_, i) => ({
      id: i,
      type: 'REACTANTS',
      subType: 'BOTH',
      state: 'POOL_LEFT',
      x: 65 + (Math.random() - 0.5) * 40,
      y: 170 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      targetY: 0,
      glowTimer: 0
    }));
    
    particlesRef.current = mergedParticles;
    renderedTypesRef.current = mergedParticles.map(p => p.type);
    setParticles([...mergedParticles]);
    setTutorialStep(1);
    setIsPlaying(true);
    setSimSpeed(1);
  };

  useEffect(() => {
    soundManager.init();
    initSimulation();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    let frameTicks = 0;

    const updatePhysics60FPS = () => {
      const current = particlesRef.current;
      
      const countA = current.filter(p => p.type === 'REACTANTS').length;
      const countB = current.filter(p => p.type === 'PRODUCTS').length;

      const poolLeft = current.filter(p => p.state === 'POOL_LEFT');
      const poolRight = current.filter(p => p.state === 'POOL_RIGHT');

      let kFwd = 0;
      let kRev = 0;
      let topVelocity = 0;
      let bottomVelocity = 0;

      // Calculate future destinations to prevent overshooting in tutorials
      let destinedForA = 0;
      let destinedForB = 0;
      for (let i = 0; i < current.length; i++) {
          if (['POOL_LEFT', 'TO_LEFT', 'TO_BOTTOM', 'BOTTOM_PIPE'].includes(current[i].state)) destinedForA++;
          else destinedForB++;
      }
      const effSimSpeed = isPlaying ? simSpeed : 0.3;

      // Dynamic velocities based on concentration
      if (!isPlaying || tutorialStep === -1 || tutorialStep === 0 || tutorialStep === 0.5) {
         topVelocity = 0;
         bottomVelocity = 0;
         kFwd = 0;
         kRev = 0;
      } else if (tutorialStep === 1) {
         topVelocity = Math.max(0.6, countA * 0.4); 
         bottomVelocity = 0;
         kFwd = destinedForA > 2 ? 0.015 * countA : 0;
         kRev = 0;
      } else if (tutorialStep === 2) {
         topVelocity = Math.max(0.8, countA * 0.4); 
         bottomVelocity = Math.max(0.8, countB * 0.4);
         
         // Use destined counts to prevent overshooting and ensure it stabilizes exactly at 3/3
         kFwd = destinedForB < 3 ? 0.02 * countA : 0;
         kRev = destinedForA < 3 ? 0.03 * countB : 0;
      } else if (tutorialStep === 3) {
         topVelocity = Math.max(0.8, countA * 0.4); 
         bottomVelocity = Math.max(0.8, countB * 0.4);
         
         if (countA > countB) {
             kFwd = 0.03 * countA;
             kRev = 0.01 * countB;
         } else if (countB > countA) {
             kFwd = 0.01 * countA;
             kRev = 0.03 * countB;
         } else {
             kFwd = 0.025 * countA;
             kRev = 0.025 * countB;
         }
      }

      // Fluid Entry Selection (No Teleportation)
      if (Math.random() < kFwd && poolLeft.length > 0) {
         const occupiedLanes = current.filter(p => p.state === 'TO_TOP' || p.state === 'TOP_PIPE').map(p => p.targetY);
         const availableLanes = [70, 100, 130].filter(y => !occupiedLanes.includes(y));
         
         if (availableLanes.length > 0) {
             const p = poolLeft[Math.floor(Math.random() * poolLeft.length)];
             p.state = 'TO_TOP'; 
             p.targetY = availableLanes[Math.floor(Math.random() * availableLanes.length)];
         }
      }
      if (Math.random() < kRev && poolRight.length > 0) {
         const occupiedLanes = current.filter(p => p.state === 'TO_BOTTOM' || p.state === 'BOTTOM_PIPE').map(p => p.targetY);
         const availableLanes = [210, 240, 270].filter(y => !occupiedLanes.includes(y));
         
         if (availableLanes.length > 0) {
             const p = poolRight[Math.floor(Math.random() * poolRight.length)];
             p.state = 'TO_BOTTOM'; 
             p.targetY = availableLanes[Math.floor(Math.random() * availableLanes.length)];
         }
      }

      // Molecule Steering Physics
      const applyFluidSteering = (p: MoleculePair) => {
        if (!isPlaying) {
           p.vx = Math.sin(Date.now() * 0.001 + p.id * 10) * 0.3;
           p.vy = Math.cos(Date.now() * 0.001 + p.id * 10) * 0.3;
           
           if (p.x < 35) { p.x = 35; p.vx = Math.abs(p.vx); }
           if (p.x > 505) { p.x = 505; p.vx = -Math.abs(p.vx); }
           if (p.y < 15) { p.y = 15; p.vy = Math.abs(p.vy); }
           if (p.y > 325) { p.y = 325; p.vy = -Math.abs(p.vy); }

           p.x += p.vx;
           p.y += p.vy;
           return;
        }

        let targetVx = 0;
        let targetVy = 0;
        const turn = 0.08; 

        if (p.state === 'FALLING') {
            targetVx = p.vx * 0.98; // slight air resistance horizontally
            p.vy += 0.25 * effSimSpeed; // Gravity
            targetVy = p.vy; 
            if (p.y > 170) {
                p.state = 'POOL_LEFT';
                p.vy *= 0.2; // Splash slowdown
                p.y = 170;
            }
        } else if (p.state === 'POOL_LEFT') {
           const dx = p.x - 65; const dy = p.y - 170; const dist = Math.sqrt(dx*dx + dy*dy) || 1;
           const tx = -dy / dist; const ty = dx / dist;
           const rx = -dx / dist; const ry = -dy / dist;
           targetVx = tx * 1.0 + rx * (dist - 35) * 0.05 + (isPlaying ? 0 : Math.sin(Date.now()*0.002+p.id)*0.4);
           targetVy = ty * 1.0 + ry * (dist - 35) * 0.05 + (isPlaying ? 0 : Math.cos(Date.now()*0.002+p.id)*0.4);
        } else if (p.state === 'TO_TOP') {
           const dx = 120 - p.x; const dy = p.targetY - p.y; const dist = Math.sqrt(dx*dx + dy*dy) || 1;
           targetVx = isPlaying ? (dx / dist) * topVelocity : Math.sin(Date.now()*0.002+p.id)*0.5;
           targetVy = isPlaying ? (dy / dist) * topVelocity : Math.cos(Date.now()*0.002+p.id)*0.5;
           if (p.x >= 115 && Math.abs(p.y - p.targetY) < 15 && topVelocity > 0) { p.state = 'TOP_PIPE'; p.y = p.targetY; }
        } else if (p.state === 'TOP_PIPE') {
           targetVx = isPlaying ? topVelocity : Math.sin(Date.now()*0.002+p.id)*0.5;
           targetVy = (p.targetY - p.y) * 0.2 + (isPlaying ? 0 : Math.cos(Date.now()*0.002+p.id)*0.5); 
           if (p.x >= 270 && p.type === 'REACTANTS') { p.type = 'PRODUCTS'; }
           if (p.x >= 420 && topVelocity > 0) { p.state = 'TO_RIGHT'; }
        } else if (p.state === 'TO_RIGHT') {
           const dx = 475 - p.x; const dy = 170 - p.y; const dist = Math.sqrt(dx*dx + dy*dy) || 1;
           targetVx = isPlaying ? (dx / dist) * 1.5 : Math.sin(Date.now()*0.002+p.id)*0.5;
           targetVy = isPlaying ? (dy / dist) * 1.5 : Math.cos(Date.now()*0.002+p.id)*0.5;
           if (dist < 60) { p.state = 'POOL_RIGHT'; }
        } else if (p.state === 'POOL_RIGHT') {
           const dx = p.x - 475; const dy = p.y - 170; const dist = Math.sqrt(dx*dx + dy*dy) || 1;
           const tx = -dy / dist; const ty = dx / dist;
           const rx = -dx / dist; const ry = -dy / dist;
           targetVx = tx * 1.0 + rx * (dist - 35) * 0.05 + (isPlaying ? 0 : Math.sin(Date.now()*0.002+p.id)*0.4);
           targetVy = ty * 1.0 + ry * (dist - 35) * 0.05 + (isPlaying ? 0 : Math.cos(Date.now()*0.002+p.id)*0.4);
        } else if (p.state === 'TO_BOTTOM') {
           const dx = 420 - p.x; const dy = p.targetY - p.y; const dist = Math.sqrt(dx*dx + dy*dy) || 1;
           targetVx = isPlaying ? (dx / dist) * bottomVelocity : Math.sin(Date.now()*0.002+p.id)*0.5;
           targetVy = isPlaying ? (dy / dist) * bottomVelocity : Math.cos(Date.now()*0.002+p.id)*0.5;
           if (p.x <= 425 && Math.abs(p.y - p.targetY) < 15 && bottomVelocity > 0) { p.state = 'BOTTOM_PIPE'; p.y = p.targetY; }
        } else if (p.state === 'BOTTOM_PIPE') {
           targetVx = isPlaying ? -bottomVelocity : Math.sin(Date.now()*0.002+p.id)*0.5;
           targetVy = (p.targetY - p.y) * 0.2 + (isPlaying ? 0 : Math.cos(Date.now()*0.002+p.id)*0.5); 
           if (p.x <= 270 && p.type === 'PRODUCTS') { p.type = 'REACTANTS'; }
           if (p.x <= 120 && bottomVelocity > 0) { p.state = 'TO_LEFT'; }
        } else if (p.state === 'TO_LEFT') {
           const dx = 65 - p.x; const dy = 170 - p.y; const dist = Math.sqrt(dx*dx + dy*dy) || 1;
           targetVx = isPlaying ? (dx / dist) * 1.5 : Math.sin(Date.now()*0.002+p.id)*0.5;
           targetVy = isPlaying ? (dy / dist) * 1.5 : Math.cos(Date.now()*0.002+p.id)*0.5;
           if (dist < 60) { p.state = 'POOL_LEFT'; }
        }

        p.vx += (targetVx - p.vx) * turn * effSimSpeed;
        p.vy += (targetVy - p.vy) * turn * effSimSpeed;

        if (p.x < 35) { p.x = 35; p.vx = Math.abs(p.vx); }
        if (p.x > 505) { p.x = 505; p.vx = -Math.abs(p.vx); }
        if (p.y < 15 && p.vy < 0) { p.y = 15; p.vy = Math.abs(p.vy); }
        if (p.y > 325) { p.y = 325; p.vy = -Math.abs(p.vy); }

        p.x += p.vx * effSimSpeed;
        p.y += p.vy * effSimSpeed;
      };

      for (let i = 0; i < current.length; i++) { applyFluidSteering(current[i]); }
      
      // Optimized Marker 'Medium' Engine (O(N) mathematical layout, no collisions or state loops)
      const currentMarkers = markersRef.current;
      for (let i = 0; i < currentMarkers.length; i++) {
          const m = currentMarkers[i];
          
          if (m.region === 'LEFT_POOL') {
              const poolFlow = Math.max(0.2, (topVelocity + bottomVelocity) * 0.5);
              m.angle += (poolFlow / m.radius) * effSimSpeed * 0.8; 
              m.x = 65 + Math.cos(m.angle) * m.radius;
              m.y = 170 + Math.sin(m.angle) * m.radius * 2.0; 
          } else if (m.region === 'RIGHT_POOL') {
              const poolFlow = Math.max(0.2, (topVelocity + bottomVelocity) * 0.5);
              m.angle += (poolFlow / m.radius) * effSimSpeed * 0.8; 
              m.x = 475 + Math.cos(m.angle) * m.radius;
              m.y = 170 + Math.sin(m.angle) * m.radius * 2.0;
          } else if (m.region === 'TOP_PIPE') {
              m.angle += topVelocity * effSimSpeed; 
              if (m.angle > 420) m.angle -= 300;
              m.x = m.angle;
              m.y = m.radius + Math.sin(m.angle * 0.05) * 3; 
          } else if (m.region === 'BOTTOM_PIPE') {
              m.angle -= bottomVelocity * effSimSpeed; 
              if (m.angle < 120) m.angle += 300;
              m.x = m.angle;
              m.y = m.radius + Math.sin(m.angle * 0.05) * 3;
          }
      }

      // Direct DOM Update for ultra-high performance (0 React overhead)
      let typesChanged = false;
      for (let i = 0; i < current.length; i++) {
        const p = current[i];
        if (particlesDOMRefs.current[i]) {
           particlesDOMRefs.current[i]?.setAttribute('transform', `translate(${p.x}, ${p.y})`);
        }
        if (p.type !== renderedTypesRef.current[i]) {
           typesChanged = true;
           renderedTypesRef.current[i] = p.type;
        }
      }
      
      for (let i = 0; i < currentMarkers.length; i++) {
        const m = currentMarkers[i];
        if (markersDOMRefs.current[i]) {
           markersDOMRefs.current[i]?.setAttribute('transform', `translate(${m.x}, ${m.y})`);
           markersDOMRefs.current[i]?.setAttribute('stroke', m.x < 270 ? "#0284c7" : "#ea580c");
        }
      }

      if (typesChanged) {
         // Deep clone objects so Framer Motion detects the state change properly
         setParticles(particlesRef.current.map(p => ({ ...p })));
      }

      animFrameRef.current = requestAnimationFrame(updatePhysics60FPS);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics60FPS);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, simSpeed, tutorialStep]);

  const countA = particles.filter((p) => p.type === 'REACTANTS').length;
  const countB = particles.filter((p) => p.type === 'PRODUCTS').length;



  const handleReset = () => {
    soundManager.playClick();
    initSimulation();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 font-sans overflow-y-auto custom-scrollbar select-none" dir="rtl">
      
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 transition-opacity duration-1000"
        style={{
          background: tutorialStep === 3
            ? `radial-gradient(circle at 50% 50%, #4caf50 0%, #0f172a 60%, #020617 100%)`
            : `radial-gradient(circle at 50% 50%, #0284c7 0%, #0f172a 60%, #020617 100%)`
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col overflow-hidden w-full h-full">
        
        {/* Note Paper Control Panel */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-yellow-50 text-slate-800 p-6 shadow-2xl rounded-sm border-l-8 border-yellow-400 rotate-1 z-30" style={{ boxShadow: '3px 5px 15px rgba(0,0,0,0.15)', backgroundImage: 'linear-gradient(transparent 95%, #fcd34d 100%)', backgroundSize: '100% 1.5rem', lineHeight: '1.5rem' }}>
          <h3 className="font-bold text-lg mb-2 pb-1 border-b-2 border-red-400/50 text-red-700">
             {tutorialStep === -1 && "تحضير المختبر"}
             {tutorialStep === 0 && "الوعاء جاهز"}
             {tutorialStep === 1 && "المرحلة الأولى: تكوين النواتج"}
             {tutorialStep === 2 && "المرحلة الثانية: التفاعل العكسي"}
             {tutorialStep === 3 && "النتيجة: الاتزان الديناميكي"}
          </h3>
          <p className="text-sm font-semibold text-slate-700 mb-5 min-h-[4.5rem]">
             {tutorialStep === -1 && `اسقط 6 جزيئات من كل نوع (H₂: ${inventory.h2}/6، I₂: ${inventory.i2}/6)`}
             {tutorialStep === 0 && "المتفاعلات تملأ الوعاء وتتحرك عشوائياً. جاهز للبدء."}
             {tutorialStep === 1 && "التفاعل الأمامي يبدأ. المتفاعلات تتحول إلى نواتج."}
             {tutorialStep === 2 && "النواتج بدأت تتفكك لتعود إلى متفاعلات (التفاعل العكسي)."}
             {tutorialStep === 3 && "الاتزان! التفاعل الأمامي يساوي العكسي (العدد يثبت)."}
          </p>

          <div className="flex flex-col gap-3">
             <AnimatePresence mode="wait">
                {tutorialStep === -1 && inventory.h2 === 6 && inventory.i2 === 6 && (
                   <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={() => { setTutorialStep(0); soundManager.playClick(); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-all">اذهب إلى الوعاء</motion.button>
                )}
                {tutorialStep === 0 && (
                   <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={handleStartReaction} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-all">ابدأ التفاعل</motion.button>
                )}
                {tutorialStep === 1 && countA <= 2 && (
                   <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={() => { setTutorialStep(2); soundManager.playClick(); }} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-all">مرحلة التفاعل العكسي</motion.button>
                )}
                {tutorialStep === 2 && countA === 3 && countB === 3 && (
                   <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={() => { setTutorialStep(3); soundManager.playClick(); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-all">الوصول للاتزان</motion.button>
                )}
             </AnimatePresence>

             <div className="mt-2 pt-4 border-t-2 border-slate-300/50 border-dashed">
                <div className="text-xs font-bold mb-2 text-slate-500">سرعة المحاكاة:</div>
                <div className="flex flex-wrap gap-1 mb-3">
                   {[0.25, 0.5, 1, 2, 4].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSimSpeed(spd)}
                        className={`flex-1 py-1 text-xs rounded-sm font-bold transition-all ${simSpeed === spd ? 'bg-slate-700 text-white' : 'bg-white/50 text-slate-700 hover:bg-white'}`}
                      >
                        {spd}x
                      </button>
                   ))}
                </div>
                <button
                   onClick={() => setIsPlaying(!isPlaying)}
                   className={`w-full py-2 rounded-sm font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-sm ${isPlaying ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}
                >
                   {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                   <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
                </button>
             </div>
          </div>
        </div>

        {/* Main 2D Particle Simulation Stage */}
        <div 
           className="bg-white flex flex-col flex-1 relative overflow-hidden w-full h-full"
           style={{
             backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             backgroundPosition: 'center top'
           }}
        >

          <div className="flex-1 relative flex items-center justify-center p-8">
            

            <svg viewBox={`-30 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-full max-w-5xl max-h-[75vh] overflow-visible">
              
              <defs>
                 <pattern id="plusPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <text x="15" y="15" fill="rgba(56, 189, 248, 0.2)" fontSize="18" fontWeight="bold" textAnchor="middle" dominantBaseline="central">+</text>
                 </pattern>
                 <pattern id="sandPattern" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                    <text x="3" y="3" fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="central">+</text>
                    <text x="9" y="8" fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="central">+</text>
                    <text x="6" y="11" fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="central">+</text>
                    <text x="2" y="9" fill="#475569" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="central">+</text>
                 </pattern>
              </defs>

              {/* Wrapping motion.g acts as the Camera! */}
              <motion.g animate={{ y: tutorialStep === -1 ? 380 : 0 }} transition={{ duration: 1.5, ease: "easeInOut" }}>

              {/* === SCENE 1: THE SHELVES (-380 to 0) === */}
              <motion.g 
                 animate={{ 
                    y: tutorialStep === -1 ? 0 : 200,
                    scale: tutorialStep === -1 ? 1 : 0.65
                 }} 
                 style={{ transformOrigin: "270px -160px" }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
              >
              {/* Wall Brackets Shelf */}
              <rect x="50" y="-160" width="440" height="15" rx="4" fill="#8b5a2b" stroke="#5c3a21" strokeWidth="2" />
              <path d="M 120,-145 L 120,-100 L 160,-145 Z" fill="#64748b" />
              <path d="M 420,-145 L 420,-100 L 380,-145 Z" fill="#64748b" />
              
              <text x="270" y="-300" fill="#334155" fontSize="24" fontWeight="bold" textAnchor="middle">اضغط على القوارير لإسقاط الجزيئات</text>
              <text x="270" y="-270" fill="#475569" fontSize="14" textAnchor="middle">تحتاج إلى 6 جزيئات من H₂ و 6 من I₂</text>

              {/* Flask H2 (Erlenmeyer) */}
              <g transform="translate(90, -160)">
                 <motion.g 
                    animate={
                        activeFlask === 'H2'
                        ? { rotate: -45, x: -50, y: -40, scale: 1.1 }
                        : { rotate: 0, x: 0, y: 0, scale: 1 }
                    }
                    whileTap={
                       inventory.h2 >= 6 
                       ? undefined 
                       : (activeFlask === 'H2' ? { rotate: -100 } : { scale: 1.05 })
                    }
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className={inventory.h2 >= 6 ? "cursor-default" : "cursor-pointer"} style={{ originX: 0.5, originY: 1 }}
                    onPointerDown={() => {
                        if (inventory.h2 >= 6) return;
                        const h2Count = particlesRef.current.filter(p => p.subType === 'H2').length;
                        if (activeFlask !== 'H2') {
                            soundManager.playClick();
                            setActiveFlask('H2');
                        } else {
                            if (h2Count >= 6) {
                                soundManager.playClick();
                            } else {
                                dropMolecule('H2');
                                if (h2Count + 1 >= 6) setTimeout(() => setActiveFlask(null), 600);
                            }
                        }
                    }}
                 >
                    <rect x="-80" y="-80" width="160" height="120" fill="transparent" /> {/* Huge Hit Area */}
                    {/* Erlenmeyer Shape */}
                    <path d="M -8,-65 L -8,-50 L -25,-5 A 5 5 0 0 0 -20,5 L 20,5 A 5 5 0 0 0 25,-5 L 8,-50 L 8,-65 Z" fill="rgba(255,255,255,0.9)" stroke="#94a3b8" strokeWidth="3" strokeLinejoin="round" />
                    {/* Liquid fill */}
                    <path d="M -20,-15 L -25,-5 A 5 5 0 0 0 -20,5 L 20,5 A 5 5 0 0 0 25,-5 L 20,-15 Z" fill="#e0f2fe" />
                    {/* Rim */}
                    <rect x="-12" y="-68" width="24" height="6" rx="3" fill="#cbd5e1" />
                    <text x="0" y="-20" fill="#0369a1" fontSize="16" fontWeight="bold" textAnchor="middle">H₂</text>
                    <text x="0" y="-85" fill={inventory.h2 >= 6 ? "#10b981" : "#64748b"} fontSize="14" fontWeight="bold" textAnchor="middle">{inventory.h2}/6</text>
                 </motion.g>
              </g>

              {/* Flask I2 (Erlenmeyer) */}
              <g transform="translate(270, -160)">
                 <motion.g 
                    animate={
                        activeFlask === 'I2'
                        ? { rotate: -45, x: -50, y: -40, scale: 1.1 }
                        : { rotate: 0, x: 0, y: 0, scale: 1 }
                    }
                    whileTap={
                       inventory.i2 >= 6 
                       ? undefined 
                       : (activeFlask === 'I2' ? { rotate: -100 } : { scale: 1.05 })
                    }
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className={inventory.i2 >= 6 ? "cursor-default" : "cursor-pointer"} style={{ originX: 0.5, originY: 1 }}
                    onPointerDown={() => {
                        if (inventory.i2 >= 6) return;
                        const i2Count = particlesRef.current.filter(p => p.subType === 'I2').length;
                        if (activeFlask !== 'I2') {
                            soundManager.playClick();
                            setActiveFlask('I2');
                        } else {
                            if (i2Count >= 6) {
                                soundManager.playClick();
                            } else {
                                dropMolecule('I2');
                                if (i2Count + 1 >= 6) setTimeout(() => setActiveFlask(null), 600);
                            }
                        }
                    }}
                 >
                    <rect x="-80" y="-80" width="160" height="120" fill="transparent" /> {/* Huge Hit Area */}
                    <path d="M -8,-65 L -8,-50 L -25,-5 A 5 5 0 0 0 -20,5 L 20,5 A 5 5 0 0 0 25,-5 L 8,-50 L 8,-65 Z" fill="rgba(255,255,255,0.9)" stroke="#94a3b8" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M -20,-15 L -25,-5 A 5 5 0 0 0 -20,5 L 20,5 A 5 5 0 0 0 25,-5 L 20,-15 Z" fill="#f3e8ff" />
                    <rect x="-12" y="-68" width="24" height="6" rx="3" fill="#cbd5e1" />
                    <text x="0" y="-20" fill="#7e22ce" fontSize="16" fontWeight="bold" textAnchor="middle">I₂</text>
                    <text x="0" y="-85" fill={inventory.i2 >= 6 ? "#10b981" : "#64748b"} fontSize="14" fontWeight="bold" textAnchor="middle">{inventory.i2}/6</text>
                 </motion.g>
              </g>

              {/* Decoy Flask O2 (Erlenmeyer) */}
              <g transform="translate(450, -160)">
                 <motion.g 
                    animate={{ rotate: 0, x: 0, y: 0, scale: 1 }}
                    whileTap={(inventory.h2 >= 6 && inventory.i2 >= 6) ? undefined : { rotate: [-15, 15, -15, 15, 0], x: [-5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                    className={(inventory.h2 >= 6 && inventory.i2 >= 6) ? "cursor-default" : "cursor-pointer"} style={{ originX: 0.5, originY: 1 }}
                    onPointerDown={() => {
                        if (inventory.h2 >= 6 && inventory.i2 >= 6) return;
                        soundManager.playClick();
                    }}
                 >
                    <rect x="-80" y="-80" width="160" height="120" fill="transparent" /> {/* Huge Hit Area */}
                    <path d="M -8,-65 L -8,-50 L -25,-5 A 5 5 0 0 0 -20,5 L 20,5 A 5 5 0 0 0 25,-5 L 8,-50 L 8,-65 Z" fill="rgba(255,255,255,0.9)" stroke="#94a3b8" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M -20,-15 L -25,-5 A 5 5 0 0 0 -20,5 L 20,5 A 5 5 0 0 0 25,-5 L 20,-15 Z" fill="#fef08a" />
                    <rect x="-12" y="-68" width="24" height="6" rx="3" fill="#cbd5e1" />
                    <text x="0" y="-20" fill="#a16207" fontSize="16" fontWeight="bold" textAnchor="middle">O₂</text>
                 </motion.g>
              </g>
              </motion.g>


              {/* === SCENE 2: THE REACTION JAR (0 to 380) === */}

              {/* Black Test Table */}
              <rect x="-30" y="340" width={canvasWidth} height="40" fill="#1e293b" rx="4" />
              <rect x="-30" y="340" width={canvasWidth} height="4" fill="#334155" />

              <defs>
                <linearGradient id="glassSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="30%" stopColor="#ffffff" stopOpacity="0.0" />
                  <stop offset="70%" stopColor="#ffffff" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Open Top Glass Tank */}
              <path d="M -15,20 L -15,320 Q -15,340 15,340 L 525,340 Q 555,340 555,320 L 555,20" fill="rgba(255,255,255,0.4)" stroke="none" />
              
              {/* Inner Glassy Sheen / Reflection */}
              <path d="M -15,20 L -15,320 Q -15,340 15,340 L 525,340 Q 555,340 555,320 L 555,20" fill="url(#glassSheen)" stroke="none" />
              <path d="M -8,25 L -8,315 Q -8,330 15,332 L 20,332 Q -2,330 -2,315 L -2,25 Z" fill="#ffffff" opacity="0.5" />

              {/* Tank Outlines */}
              <path d="M -15,20 L -15,320 Q -15,340 15,340 L 525,340 Q 555,340 555,320 L 555,20" fill="none" stroke="#94a3b8" strokeWidth="6" opacity="0.5" strokeLinecap="round" />
              <path d="M -15,20 L -15,320 Q -15,340 15,340 L 525,340 Q 555,340 555,320 L 555,20" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" strokeLinecap="round" />

              {/* Chamber Labels inside the tank */}
              <rect x="-5" y="20" width="80" height="24" rx="12" fill="#e0f2fe" opacity="0.8" stroke="#38bdf8" strokeWidth="1" />
              <text x="35" y="36" fill="#0369a1" fontSize="12" fontWeight="bold" textAnchor="middle">المتفاعلات</text>

              <rect x="465" y="20" width="80" height="24" rx="12" fill="#ffedd5" opacity="0.8" stroke="#fb923c" strokeWidth="1" />
              <text x="505" y="36" fill="#c2410c" fontSize="12" fontWeight="bold" textAnchor="middle">النواتج</text>

              {/* Sand Particles (+) forming dunes at bottom */}
              <path d="M -13,310 Q 50,330 150,315 T 350,325 Q 450,300 553,315 L 553,332 Q 553,338 525,338 L 15,338 Q -13,338 -13,332 Z" fill="url(#sandPattern)" opacity="0.9" />

              {/* Flow Markers (+) */}
              {markers.map((m, i) => {
                 const color = m.x < 270 ? "#0284c7" : "#ea580c"; 
                 return (
                    <path 
                       key={`m-${m.id}`} 
                       ref={el => { markersDOMRefs.current[i] = el; }}
                       d="M-3,0 L3,0 M0,-3 L0,3" 
                       stroke={color} 
                       strokeWidth="1.5" 
                       strokeLinecap="round" 
                       transform={`translate(${m.x}, ${m.y})`} 
                       opacity="0.4" 
                    />
                 )
              })}

              {/* Particles Loop */}
              {particles.map((p, i) => {
                const isProduct = p.type === 'PRODUCTS';
                return (
                  <g key={p.id} ref={el => { particlesDOMRefs.current[i] = el; }} transform={`translate(${p.x}, ${p.y})`}>
                    <motion.g
                      animate={{
                        rotate: isProduct ? 360 : 0,
                      }}
                      transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    >
                       {/* H Atom / Molecule */}
                       {(p.subType === 'H2' || p.subType === 'BOTH' || p.subType === undefined) && (
                         <motion.g
                            animate={{
                               x: isProduct ? -6 : -16,
                               y: isProduct ? [3, -2, 4, -3, 3] : [10, -8, 6, -10, 10],
                            }}
                            transition={{
                               x: { duration: 0.5, type: "spring" },
                               y: { repeat: Infinity, duration: isProduct ? 3.5 + (p.id % 2) * 0.3 : 4 + (p.id % 3) * 0.5, ease: "easeInOut" }
                            }}
                         >
                             <motion.circle 
                                cx={isProduct ? -6 : -16}
                                r={isProduct ? 14 : 12}
                                animate={{
                                   cx: isProduct ? -6 : -16,
                                   r: isProduct ? 14 : 12,
                                }}
                                cy="0" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2"
                                transition={{ duration: 0.5, type: "spring" }}
                             />
                             <motion.text
                                animate={{
                                   x: isProduct ? -6 : -16,
                                   opacity: isProduct ? 0 : 1,
                                   scale: isProduct ? 0.5 : 1
                                }}
                                y="1" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="central"
                             >
                               H₂
                             </motion.text>
                         </motion.g>
                       )}

                       {/* I Atom / Molecule */}
                       {(p.subType === 'I2' || p.subType === 'BOTH' || p.subType === undefined) && (
                         <motion.g
                            animate={{
                               x: isProduct ? 6 : 16,
                               y: isProduct ? [-3, 2, -4, 3, -3] : [-10, 8, -6, 12, -10],
                            }}
                            transition={{
                               x: { duration: 0.5, type: "spring" },
                               y: { repeat: Infinity, duration: isProduct ? 3.5 + (p.id % 2) * 0.3 : 3.5 + (p.id % 2) * 0.5, ease: "easeInOut" }
                            }}
                         >
                             <motion.circle 
                                cx={isProduct ? 6 : 16}
                                r="14"
                                animate={{
                                   cx: isProduct ? 6 : 16,
                                   r: 14
                                }}
                                cy="0" fill="#a855f7" stroke="#9333ea" strokeWidth="2"
                                transition={{ duration: 0.5, type: "spring" }}
                             />
                             <motion.text
                                animate={{
                                   x: isProduct ? 6 : 16,
                                   opacity: isProduct ? 0 : 1,
                                   scale: isProduct ? 0.5 : 1
                                }}
                                y="1" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="central"
                             >
                               I₂
                             </motion.text>
                         </motion.g>
                       )}

                       {/* Product Label (HI) */}
                       {(p.subType === 'BOTH' || p.subType === undefined) && (
                         <motion.g
                            animate={{
                               opacity: isProduct ? 1 : 0,
                               scale: isProduct ? 1 : 0.5
                            }}
                            transition={{ duration: 0.4 }}
                         >
                             <text x="0" y="1" fill="none" stroke="#ffffff" strokeWidth="3" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="central">HI</text>
                             <text x="0" y="1" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle" dominantBaseline="central">HI</text>
                         </motion.g>
                       )}
                    </motion.g>
                  </g>
                );
              })}

          {/* IMPORTANT: Close the motion.g wrapper for the Camera Pan here */}
          </motion.g>
          </svg>
          </div>



        </div>

      </div>

    </div>
  );
}

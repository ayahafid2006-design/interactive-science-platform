import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Languages, Volume2, VolumeX } from 'lucide-react';
import { ExperimentState, Lang, ReagentType } from './types';
import { LabApparatus } from './components/LabApparatus';
import { NotebookAndApplications } from './components/NotebookAndApplications';
import { ControlsAndMetrics } from './components/ControlsAndMetrics';

class LabAudioSynthesizer {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playWaterDrop() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {

    }
  }

  playReactionSwoosh(isAcid: boolean) {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = isAcid ? 440 : 580;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.linearRampToValueAtTime(isAcid ? 330 : 660, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {

    }
  }

  playReset() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); 
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); 

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {

    }
  }
}

const audioSynth = new LabAudioSynthesizer();

export default function App() {
  const [lang, setLang] = useState<Lang>('ar');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [state, setState] = useState<ExperimentState>({
    temperature: 25,          
    concentrationOffset: 0.08,
    equilibrium: 0.08,
    hPlusLevel: 0.12,
    acidDropsCount: 0,
    baseDropsCount: 0,
    activeReagent: null,
    animPhase: 'idle',
    dropProgress: 0,
    plumeScale: 0,
    plumeOpacity: 0,
    rippleScale: 0,
    rippleOpacity: 0,
    dropperSqueeze: 0,
    lastAction: 'initial',
    reactionDirection: 'none',
    selectedTab: 'chatelier',
  });

  const animFrameIdRef = useRef<number | null>(null);
  const animRunningRef = useRef<boolean>(false);
  const startEqValRef = useRef<number>(0.08);
  const targetEqValRef = useRef<number>(0.08);

  const effectiveEquilibrium = useMemo(() => {
    const tempShift = -((state.temperature - 25) / 60) * 0.15;
    return Math.max(0.02, Math.min(1.0, state.concentrationOffset + tempShift));
  }, [state.concentrationOffset, state.temperature]);

  useEffect(() => {
    if (state.animPhase === 'idle') {
      setState(prev => ({ ...prev, equilibrium: effectiveEquilibrium }));
    }
  }, [effectiveEquilibrium, state.animPhase]);

  const interpolateColor = (t: number) => {
    const factor = Math.max(0, Math.min(1, t));

    const r = Math.round(250 + (225 - 250) * factor);
    const g = Math.round(222 + (78 - 222) * factor);
    const b = Math.round(28 + (12 - 28) * factor);

    return {
      main: `rgb(${r}, ${g}, ${b})`,
      translucent: `rgba(${r}, ${g}, ${b}, 0.88)`,
      light: `rgb(${Math.min(255, r + 25)}, ${Math.min(255, g + 25)}, ${Math.min(255, b + 25)})`,
      dark: `rgb(${Math.max(0, r - 35)}, ${Math.max(0, g - 35)}, ${Math.max(0, b - 35)})`,
      hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
    };
  };

  const currentColor = useMemo(() => interpolateColor(state.equilibrium), [state.equilibrium]);
  const chromatePercent = Math.round((1 - state.equilibrium) * 100);
  const dichromatePercent = Math.round(state.equilibrium * 100);

  const handleAddReagent = useCallback((reagent: 'acid' | 'base') => {
    if (animRunningRef.current) return;

    const step = 0.24; 
    let newConcentration: number;
    let newHPlus: number;

    if (reagent === 'acid') {
      newConcentration = Math.min(1.0, state.concentrationOffset + step);
      newHPlus = Math.min(1.0, state.hPlusLevel + 0.22);
    } else {
      newConcentration = Math.max(0.02, state.concentrationOffset - step);
      newHPlus = Math.max(0.02, state.hPlusLevel - 0.22);
    }

    const tempShift = -((state.temperature - 25) / 60) * 0.15;
    const targetEq = Math.max(0.02, Math.min(1.0, newConcentration + tempShift));

    startEqValRef.current = state.equilibrium;
    targetEqValRef.current = targetEq;
    animRunningRef.current = true;

    setState(prev => ({
      ...prev,
      activeReagent: reagent,
      concentrationOffset: newConcentration,
      hPlusLevel: newHPlus,
      acidDropsCount: reagent === 'acid' ? prev.acidDropsCount + 1 : prev.acidDropsCount,
      baseDropsCount: reagent === 'base' ? prev.baseDropsCount + 1 : prev.baseDropsCount,
      animPhase: 'moving_dropper',
      lastAction: reagent === 'acid' ? 'acid_added' : 'base_added',
      reactionDirection: reagent === 'acid' ? 'forward' : 'reverse',
    }));

    const startTime = performance.now();
    let splashPlayed = false;
    let swooshPlayed = false;

    const animateSequence = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      if (elapsed < 400) {
        const squeezeT = Math.sin((elapsed / 400) * Math.PI);
        setState(prev => ({
          ...prev,
          animPhase: 'moving_dropper',
          dropperSqueeze: squeezeT,
          dropProgress: 0,
          plumeScale: 0,
          plumeOpacity: 0,
          rippleScale: 0,
          rippleOpacity: 0,
        }));
        animFrameIdRef.current = requestAnimationFrame(animateSequence);
      }

      else if (elapsed < 850) {
        const dropT = (elapsed - 400) / 450;
        const fallCurve = dropT * dropT;

        setState(prev => ({
          ...prev,
          animPhase: 'falling_drop',
          dropperSqueeze: Math.max(0, 1 - dropT * 2),
          dropProgress: Math.min(1.0, fallCurve),
          plumeScale: 0,
          plumeOpacity: 0,
          rippleScale: 0,
          rippleOpacity: 0,
        }));
        animFrameIdRef.current = requestAnimationFrame(animateSequence);
      }

      else if (elapsed < 2200) {
        if (!splashPlayed && soundEnabled) {
          audioSynth.playWaterDrop();
          splashPlayed = true;
        }
        if (elapsed > 1100 && !swooshPlayed && soundEnabled) {
          audioSynth.playReactionSwoosh(reagent === 'acid');
          swooshPlayed = true;
        }

        const reactElapsed = elapsed - 850;
        const reactProgress = reactElapsed / 1350;

        const ripT = Math.min(1.0, reactElapsed / 600);
        const currentRippleScale = ripT;
        const currentRippleOpacity = Math.max(0, 1 - ripT);

        const plumeT = Math.min(1.0, reactElapsed / 900);
        const currentPlumeScale = plumeT;
        const currentPlumeOpacity = Math.max(0, 1 - reactProgress * 0.9);

        const colorEaseOut = 1 - Math.pow(1 - reactProgress, 3);
        const currentEq = startEqValRef.current + (targetEqValRef.current - startEqValRef.current) * colorEaseOut;

        setState(prev => ({
          ...prev,
          animPhase: 'reacting',
          dropProgress: 1.0,
          dropperSqueeze: 0,
          rippleScale: currentRippleScale,
          rippleOpacity: currentRippleOpacity,
          plumeScale: currentPlumeScale,
          plumeOpacity: currentPlumeOpacity,
          equilibrium: currentEq,
        }));
        animFrameIdRef.current = requestAnimationFrame(animateSequence);
      }

      else if (elapsed < 2600) {
        const settleElapsed = elapsed - 2200;
        const settleT = settleElapsed / 400;

        setState(prev => ({
          ...prev,
          animPhase: 'settling',
          dropperSqueeze: 0,
          dropProgress: 0,
          plumeScale: 1.0,
          plumeOpacity: Math.max(0, 0.1 * (1 - settleT)),
          rippleOpacity: 0,
          equilibrium: targetEqValRef.current,
        }));
        animFrameIdRef.current = requestAnimationFrame(animateSequence);
      }

      else {
        animRunningRef.current = false;
        setState(prev => ({
          ...prev,
          animPhase: 'idle',
          activeReagent: null,
          dropperSqueeze: 0,
          dropProgress: 0,
          plumeScale: 0,
          plumeOpacity: 0,
          rippleScale: 0,
          rippleOpacity: 0,
          equilibrium: targetEqValRef.current,
          reactionDirection: 'none',
        }));
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animateSequence);
  }, [soundEnabled, state.concentrationOffset, state.equilibrium, state.hPlusLevel, state.temperature]);

  const handleSetTemperature = useCallback((newTemp: number) => {
    setState(prev => ({
      ...prev,
      temperature: newTemp,
      lastAction: 'temp_changed',
    }));
  }, []);

  const handleReset = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    animRunningRef.current = false;
    startEqValRef.current = 0.08;
    targetEqValRef.current = 0.08;

    if (soundEnabled) {
      audioSynth.playReset();
    }

    setState({
      temperature: 25,
      concentrationOffset: 0.08,
      equilibrium: 0.08,
      hPlusLevel: 0.12,
      acidDropsCount: 0,
      baseDropsCount: 0,
      activeReagent: null,
      animPhase: 'idle',
      dropProgress: 0,
      plumeScale: 0,
      plumeOpacity: 0,
      rippleScale: 0,
      rippleOpacity: 0,
      dropperSqueeze: 0,
      lastAction: 'reset',
      reactionDirection: 'none',
      selectedTab: 'chatelier',
    });
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  const isAr = lang === 'ar';

  return (
    <div
      id="bento-grid-app"
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900"
    >
      {}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs">
            Cr
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900">
              {isAr ? 'اتزان الكرومات والدايكرومات' : 'Chromate–Dichromate Equilibrium'}
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              2CrO₄²⁻ + 2H⁺ ⇌ Cr₂O₇²⁻ + H₂O
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 text-sm font-medium">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              state.animPhase === 'idle'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${state.animPhase === 'idle' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {state.animPhase === 'idle'
              ? isAr
                ? 'الحالة: متزن'
                : 'Status: Balanced'
              : isAr
              ? 'الحالة: جاري التفاعل والاتزان...'
              : 'Status: Reacting & Shifting...'}
          </span>

          {}
          <button
            id="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
            title={isAr ? 'المؤثرات الصوتية' : 'Sound Effects'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {}
          <button
            id="lang-toggle"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-slate-300 rounded-md bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {}
        <section
          id="apparatus-bento-card"
          className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden"
        >
          {}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-semibold text-slate-700">
            <span>{isAr ? 'دورق التفاعل والمحرك الحراري' : 'Reaction Vessel & Thermal Stirrer'}</span>
            <span className="font-mono text-slate-500">
              T = {state.temperature.toFixed(0)}°C
            </span>
          </div>

          {}
          <LabApparatus
            state={state}
            currentColor={currentColor}
            chromatePercent={chromatePercent}
            dichromatePercent={dichromatePercent}
            onAddReagent={handleAddReagent}
            lang={lang}
          />

          {}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
              <span className="text-xs font-bold text-slate-700">CrO₄²⁻ ({chromatePercent}%)</span>
            </div>

            <div className="flex-1 max-w-[180px] h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
              <div
                className="h-full transition-all duration-300"
                style={{
                  background: 'linear-gradient(to right, #FACC15, #FB923C, #EA580C)',
                  width: '100%',
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-slate-900 rounded-full shadow-xs transition-all duration-200"
                style={{
                  left: `${Math.min(96, Math.max(4, state.equilibrium * 100))}%`,
                }}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700">Cr₂O₇²⁻ ({dichromatePercent}%)</span>
              <div className="w-3 h-3 rounded-full bg-orange-500 border border-orange-600"></div>
            </div>
          </div>
        </section>

        {}
        <aside className="lg:col-span-6 flex flex-col gap-4">
          {}
          <ControlsAndMetrics
            state={state}
            chromatePercent={chromatePercent}
            dichromatePercent={dichromatePercent}
            onAddReagent={handleAddReagent}
            onSetTemperature={handleSetTemperature}
            onReset={handleReset}
            lang={lang}
          />

          {}
          <NotebookAndApplications
            state={state}
            onTabChange={tab => setState(prev => ({ ...prev, selectedTab: tab }))}
            lang={lang}
          />
        </aside>
      </main>
    </div>
  );
}

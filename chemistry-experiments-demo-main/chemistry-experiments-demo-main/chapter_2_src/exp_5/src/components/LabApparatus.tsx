import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ExperimentState, Lang } from '../types';

interface LabApparatusProps {
  state: ExperimentState;
  currentColor: {
    main: string;
    light: string;
    dark: string;
    translucent: string;
    hex: string;
  };
  chromatePercent: number;
  dichromatePercent: number;
  onAddReagent: (reagent: 'acid' | 'base') => void;
  lang: Lang;
}

interface IonParticleData {
  id: number;
  type: 'chromate' | 'dichromate' | 'hplus' | 'water';
  x: number; 
  y: number; 
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  radius: number;
  label: string;
}

export const LabApparatus: React.FC<LabApparatusProps> = ({
  state,
  currentColor,
  chromatePercent,
  dichromatePercent,
  onAddReagent,
  lang,
}) => {
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const wavePathRef = useRef<SVGPathElement | null>(null);
  const meniscusPathRef = useRef<SVGPathElement | null>(null);
  const particleGroupRefs = useRef<(SVGGElement | null)[]>([]);

  const draggedIdRef = useRef<number | null>(null);
  const pointerPosRef = useRef<{ x: number; y: number; lastX: number; lastY: number; lastTime: number }>({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
  });

  const stateRef = useRef({
    temperature: state.temperature,
    animPhase: state.animPhase,
    rippleScale: state.rippleScale,
    chromatePercent,
    dichromatePercent,
  });

  useEffect(() => {
    stateRef.current = {
      temperature: state.temperature,
      animPhase: state.animPhase,
      rippleScale: state.rippleScale,
      chromatePercent,
      dichromatePercent,
    };
  }, [state.temperature, state.animPhase, state.rippleScale, chromatePercent, dichromatePercent]);

  const particlesRef = useRef<IonParticleData[]>([

    { id: 0, type: 'chromate', x: 0.22, y: 0.32, vx: 0, vy: 0, angle: 0.1, angularVelocity: 0.005, radius: 14, label: 'CrO₄²⁻' },
    { id: 1, type: 'chromate', x: 0.78, y: 0.28, vx: 0, vy: 0, angle: -0.4, angularVelocity: -0.004, radius: 14, label: 'CrO₄²⁻' },
    { id: 2, type: 'chromate', x: 0.50, y: 0.52, vx: 0, vy: 0, angle: 0.8, angularVelocity: 0.003, radius: 14, label: 'CrO₄²⁻' },
    { id: 3, type: 'chromate', x: 0.32, y: 0.75, vx: 0, vy: 0, angle: -0.2, angularVelocity: -0.006, radius: 14, label: 'CrO₄²⁻' },
    { id: 4, type: 'chromate', x: 0.68, y: 0.70, vx: 0, vy: 0, angle: 0.5, angularVelocity: 0.004, radius: 14, label: 'CrO₄²⁻' },
    { id: 5, type: 'chromate', x: 0.20, y: 0.55, vx: 0, vy: 0, angle: -0.7, angularVelocity: -0.003, radius: 14, label: 'CrO₄²⁻' },

    { id: 6, type: 'dichromate', x: 0.45, y: 0.25, vx: 0, vy: 0, angle: 0.3, angularVelocity: 0.004, radius: 17, label: 'Cr₂O₇²⁻' },
    { id: 7, type: 'dichromate', x: 0.75, y: 0.50, vx: 0, vy: 0, angle: -0.6, angularVelocity: -0.005, radius: 17, label: 'Cr₂O₇²⁻' },
    { id: 8, type: 'dichromate', x: 0.35, y: 0.40, vx: 0, vy: 0, angle: 0.9, angularVelocity: 0.003, radius: 17, label: 'Cr₂O₇²⁻' },
    { id: 9, type: 'dichromate', x: 0.55, y: 0.78, vx: 0, vy: 0, angle: -0.3, angularVelocity: -0.004, radius: 17, label: 'Cr₂O₇²⁻' },

    { id: 10, type: 'hplus', x: 0.15, y: 0.20, vx: 0, vy: 0, angle: 0, angularVelocity: 0.01, radius: 9, label: 'H⁺' },
    { id: 11, type: 'hplus', x: 0.85, y: 0.22, vx: 0, vy: 0, angle: 0, angularVelocity: -0.01, radius: 9, label: 'H⁺' },
    { id: 12, type: 'hplus', x: 0.38, y: 0.62, vx: 0, vy: 0, angle: 0, angularVelocity: 0.008, radius: 9, label: 'H⁺' },
    { id: 13, type: 'hplus', x: 0.62, y: 0.38, vx: 0, vy: 0, angle: 0, angularVelocity: -0.009, radius: 9, label: 'H⁺' },
    { id: 14, type: 'hplus', x: 0.18, y: 0.82, vx: 0, vy: 0, angle: 0, angularVelocity: 0.012, radius: 9, label: 'H⁺' },
    { id: 15, type: 'hplus', x: 0.82, y: 0.78, vx: 0, vy: 0, angle: 0, angularVelocity: -0.011, radius: 9, label: 'H⁺' },

    { id: 16, type: 'water', x: 0.28, y: 0.16, vx: 0, vy: 0, angle: 0.4, angularVelocity: 0.006, radius: 10, label: 'H₂O' },
    { id: 17, type: 'water', x: 0.72, y: 0.15, vx: 0, vy: 0, angle: -0.5, angularVelocity: -0.007, radius: 10, label: 'H₂O' },
    { id: 18, type: 'water', x: 0.12, y: 0.42, vx: 0, vy: 0, angle: 0.8, angularVelocity: 0.005, radius: 10, label: 'H₂O' },
    { id: 19, type: 'water', x: 0.88, y: 0.40, vx: 0, vy: 0, angle: -0.9, angularVelocity: -0.006, radius: 10, label: 'H₂O' },
    { id: 20, type: 'water', x: 0.50, y: 0.35, vx: 0, vy: 0, angle: 0.2, angularVelocity: 0.004, radius: 10, label: 'H₂O' },
    { id: 21, type: 'water', x: 0.48, y: 0.65, vx: 0, vy: 0, angle: -0.3, angularVelocity: -0.005, radius: 10, label: 'H₂O' },
    { id: 22, type: 'water', x: 0.24, y: 0.88, vx: 0, vy: 0, angle: 0.6, angularVelocity: 0.007, radius: 10, label: 'H₂O' },
    { id: 23, type: 'water', x: 0.76, y: 0.85, vx: 0, vy: 0, angle: -0.4, angularVelocity: -0.008, radius: 10, label: 'H₂O' },
  ]);

  const handleParticlePointerDown = useCallback((e: React.PointerEvent<SVGGElement>, id: number) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);

    draggedIdRef.current = id;
    setDraggedId(id);

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = 500 / rect.width;
      const scaleY = 500 / rect.height;
      const svgX = (e.clientX - rect.left) * scaleX;
      const svgY = (e.clientY - rect.top) * scaleY;
      pointerPosRef.current = {
        x: svgX,
        y: svgY,
        lastX: svgX,
        lastY: svgY,
        lastTime: performance.now(),
      };
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const activeId = draggedIdRef.current;
    if (activeId === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 500 / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    const now = performance.now();
    const dt = Math.max(1, now - pointerPosRef.current.lastTime) / 1000;

    const normX = Math.max(0.08, Math.min(0.92, (svgX - 165) / 170));
    const normY = Math.max(0.10, Math.min(0.90, (svgY - 235) / 175));

    const dx = svgX - pointerPosRef.current.lastX;
    const dy = svgY - pointerPosRef.current.lastY;
    const throwVx = Math.max(-0.8, Math.min(0.8, (dx / 170) / dt * 0.08));
    const throwVy = Math.max(-0.8, Math.min(0.8, (dy / 175) / dt * 0.08));

    pointerPosRef.current = {
      x: svgX,
      y: svgY,
      lastX: svgX,
      lastY: svgY,
      lastTime: now,
    };

    const particle = particlesRef.current.find(p => p.id === activeId);
    if (particle) {
      particle.x = normX;
      particle.y = normY;
      particle.vx = throwVx;
      particle.vy = throwVy;
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (draggedIdRef.current !== null) {
      try {
        (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
      } catch {

      }
      draggedIdRef.current = null;
      setDraggedId(null);
    }
  }, []);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let simTime = 0;

    const physicsStep = (now: number) => {
      const deltaSec = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      const currentTemp = stateRef.current.temperature;

      const tempFactor = (currentTemp / 25) * 0.9;
      simTime += deltaSec * (0.8 + tempFactor * 0.6);

      const beakerLeft = 165;
      const beakerWidth = 170;
      const beakerTop = 235;
      const beakerHeight = 175;

      const startX = 160;
      const endX = 340;
      const baseY = 230;
      const width = endX - startX;
      const waveAmp = 1.2 + (currentTemp - 10) * 0.035;
      const dropAmp = stateRef.current.animPhase === 'reacting' ? (1 - stateRef.current.rippleScale) * 4.0 : 0;
      const totalWaveAmp = waveAmp + dropAmp;

      let wavePoints: [number, number][] = [];
      const steps = 20;
      for (let i = 0; i <= steps; i++) {
        const px = startX + (i / steps) * width;
        const normX = i / steps;
        const wave1 = Math.sin(normX * Math.PI * 2 + simTime * 2.8) * totalWaveAmp;
        const wave2 = Math.cos(normX * Math.PI * 4 - simTime * 1.8) * (totalWaveAmp * 0.4);
        const meniscusEdge = Math.pow(Math.abs(normX - 0.5) * 2, 4) * -2.2;
        const py = baseY + wave1 + wave2 + meniscusEdge;
        wavePoints.push([px, py]);
      }

      if (meniscusPathRef.current) {
        let mPath = `M ${wavePoints[0][0]} ${wavePoints[0][1]}`;
        for (let i = 1; i < wavePoints.length; i++) {
          mPath += ` L ${wavePoints[i][0].toFixed(1)} ${wavePoints[i][1].toFixed(1)}`;
        }
        meniscusPathRef.current.setAttribute('d', mPath);
      }

      if (wavePathRef.current) {
        let fPath = `M 160 405 Q 160 425 180 425 L 320 425 Q 340 425 340 405 L 340 ${wavePoints[wavePoints.length - 1][1].toFixed(1)}`;
        for (let i = wavePoints.length - 1; i >= 0; i--) {
          fPath += ` L ${wavePoints[i][0].toFixed(1)} ${wavePoints[i][1].toFixed(1)}`;
        }
        fPath += ' Z';
        wavePathRef.current.setAttribute('d', fPath);
      }

      const particles = particlesRef.current;
      const numParticles = particles.length;

      const repulsionForces = new Array(numParticles).fill(null).map(() => ({ fx: 0, fy: 0 }));

      for (let i = 0; i < numParticles; i++) {
        for (let j = i + 1; j < numParticles; j++) {
          const pi = particles[i];
          const pj = particles[j];

          const dx = (pj.x - pi.x) * 1.2;
          const dy = pj.y - pi.y;
          const distSq = dx * dx + dy * dy;
          const minDist = 0.16; 

          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);

            const force = (1.0 - dist / minDist) * 0.045;
            const nx = dx / dist;
            const ny = dy / dist;

            repulsionForces[i].fx -= nx * force;
            repulsionForces[i].fy -= ny * force;
            repulsionForces[j].fx += nx * force;
            repulsionForces[j].fy += ny * force;
          }
        }
      }

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];
        const isDragged = p.id === draggedIdRef.current;

        if (!isDragged) {

          const cx = p.x - 0.5; 
          const cy = p.y - 0.5; 

          const streamVx = -Math.cos(Math.PI * p.x) * Math.sin(Math.PI * p.y) * 0.05 * tempFactor;
          const streamVy = (Math.sin(Math.PI * p.x) * Math.cos(Math.PI * p.y) - 0.2) * 0.05 * tempFactor;

          const vortexAngle = Math.atan2(cy, cx);
          const vortexDist = Math.sqrt(cx * cx + cy * cy);
          const swirlSpeed = 0.02 * tempFactor * Math.sin(vortexDist * Math.PI);
          const swirlVx = -Math.sin(vortexAngle) * swirlSpeed;
          const swirlVy = Math.cos(vortexAngle) * swirlSpeed;

          const brownianAmp = 0.012 * Math.sqrt(tempFactor);
          const brownianVx = (Math.random() - 0.5) * brownianAmp;
          const brownianVy = (Math.random() - 0.5) * brownianAmp;

          const targetVx = streamVx + swirlVx + repulsionForces[i].fx + brownianVx;
          const targetVy = streamVy + swirlVy + repulsionForces[i].fy + brownianVy;

          p.vx = p.vx * 0.88 + targetVx * 0.12;
          p.vy = p.vy * 0.88 + targetVy * 0.12;

          p.x += p.vx * deltaSec * 60;
          p.y += p.vy * deltaSec * 60;

          if (p.x < 0.08) {
            p.x = 0.08;
            p.vx = Math.abs(p.vx) * 0.5;
          } else if (p.x > 0.92) {
            p.x = 0.92;
            p.vx = -Math.abs(p.vx) * 0.5;
          }

          if (p.y < 0.10) {
            p.y = 0.10;
            p.vy = Math.abs(p.vy) * 0.5;
          } else if (p.y > 0.90) {
            p.y = 0.90;
            p.vy = -Math.abs(p.vy) * 0.5;
          }

          p.angle += p.angularVelocity * deltaSec * 60;
        }

        const gElem = particleGroupRefs.current[i];
        if (gElem) {
          const screenX = beakerLeft + p.x * beakerWidth;
          const screenY = beakerTop + p.y * beakerHeight;
          const rotDeg = (p.angle * 180) / Math.PI;

          gElem.setAttribute(
            'transform',
            `translate(${screenX.toFixed(2)}, ${screenY.toFixed(2)}) rotate(${rotDeg.toFixed(1)})`
          );

          let targetOpacity = 1.0;
          if (p.type === 'chromate') {
            targetOpacity = Math.max(0.25, stateRef.current.chromatePercent / 100);
          } else if (p.type === 'dichromate') {
            targetOpacity = Math.max(0.25, stateRef.current.dichromatePercent / 100);
          }
          if (isDragged) targetOpacity = 1.0;

          gElem.setAttribute('opacity', targetOpacity.toFixed(2));
        }
      }

      animId = requestAnimationFrame(physicsStep);
    };

    animId = requestAnimationFrame(physicsStep);
    return () => cancelAnimationFrame(animId);
  }, []);

  const isAcidActive = state.activeReagent === 'acid' && state.animPhase !== 'idle';
  const isBaseActive = state.activeReagent === 'base' && state.animPhase !== 'idle';

  const acidDropperX = isAcidActive ? 250 : 80;
  const acidDropperY = isAcidActive ? 90 : 70;
  const acidDropperAngle = isAcidActive ? 0 : -10;

  const baseDropperX = isBaseActive ? 250 : 420;
  const baseDropperY = isBaseActive ? 90 : 70;
  const baseDropperAngle = isBaseActive ? 0 : 10;

  const dropCurrentY = 155 + state.dropProgress * (230 - 155);
  const heatIntensity = Math.max(0, (state.temperature - 20) / 65);

  return (
    <div className="relative w-full max-w-[520px] aspect-square mx-auto flex items-center justify-center my-1 select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 500 500"
        className="w-full h-full overflow-visible"
        aria-label="Interactive Fluid Laboratory Apparatus"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          {}
          <linearGradient id="fluid-grad-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={currentColor.light} stopOpacity="0.88" />
            <stop offset="45%" stopColor={currentColor.main} stopOpacity="0.94" />
            <stop offset="100%" stopColor={currentColor.dark} stopOpacity="0.98" />
          </linearGradient>

          {}
          <radialGradient id="chromate-core-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FACC15" />
            <stop offset="85%" stopColor="#CA8A04" />
            <stop offset="100%" stopColor="#854D0E" />
          </radialGradient>

          <radialGradient id="oxygen-yellow-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FDE047" />
            <stop offset="90%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#A16207" />
          </radialGradient>

          {}
          <radialGradient id="dichromate-core-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="35%" stopColor="#F97316" />
            <stop offset="85%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </radialGradient>

          <radialGradient id="oxygen-bridge-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FB923C" />
            <stop offset="90%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </radialGradient>

          {}
          <radialGradient id="hplus-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEE2E2" />
            <stop offset="40%" stopColor="#EF4444" />
            <stop offset="85%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </radialGradient>

          {}
          <radialGradient id="water-oxygen-grad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="45%" stopColor="#38BDF8" />
            <stop offset="85%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#075985" />
          </radialGradient>

          <radialGradient id="water-h-grad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </radialGradient>

          {}
          <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.30" />
            <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="82%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.25" />
          </linearGradient>

          {}
          <radialGradient id="plume-acid" cx="50%" cy="15%" r="85%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#EA580C" stopOpacity="0.75" />
            <stop offset="80%" stopColor="#F97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor={currentColor.main} stopOpacity="0" />
          </radialGradient>

          <radialGradient id="plume-base" cx="50%" cy="15%" r="85%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#FACC15" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#FDE047" stopOpacity="0.35" />
            <stop offset="100%" stopColor={currentColor.main} stopOpacity="0" />
          </radialGradient>

          {}
          <radialGradient id="thermal-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8 * heatIntensity} />
            <stop offset="60%" stopColor="#F97316" stopOpacity={0.4 * heatIntensity} />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
          </radialGradient>

          {}
          <filter id="atom-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.35" />
          </filter>
        </defs>

        {}
        <g id="hot-plate-base" transform="translate(0, 420)">
          {heatIntensity > 0.05 && (
            <ellipse cx="250" cy="8" rx="90" ry="12" fill="url(#thermal-glow)" />
          )}

          {}
          <rect x="110" y="5" width="280" height="12" rx="4" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
          <rect x="115" y="6" width="270" height="2" fill="#64748B" opacity="0.6" />

          {}
          {heatIntensity > 0.05 && (
            <path
              d="M 170 10 Q 210 8 250 10 Q 290 8 330 10"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.5"
              opacity={0.4 + 0.6 * heatIntensity}
            />
          )}

          {}
          <path d="M 100 17 L 105 52 Q 105 56 110 56 L 390 56 Q 395 56 395 52 L 400 17 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />

          {}
          <rect x="140" y="24" width="70" height="24" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <text x="175" y="40" fill="#22C55E" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            {state.temperature.toFixed(0)}°C
          </text>

          {}
          <circle cx="230" cy="36" r="4" fill={state.temperature > 30 ? '#EF4444' : '#64748B'} className={state.temperature > 50 ? 'animate-pulse' : ''} />
          <text x="240" y="39" fill="#94A3B8" fontSize="8" fontWeight="bold">
            {lang === 'ar' ? 'حرارة' : 'HEAT'}
          </text>

          {}
          <circle cx="300" cy="36" r="4" fill="#3B82F6" className="animate-pulse" />
        </g>

        {}
        <path
          ref={wavePathRef}
          fill="url(#fluid-grad-v)"
          className="transition-colors duration-500 pointer-events-none"
        />

        {}
        {state.plumeOpacity > 0.01 && (
          <g opacity={state.plumeOpacity} className="pointer-events-none">
            <ellipse
              cx="250"
              cy={230 + state.plumeScale * 80}
              rx={15 + state.plumeScale * 75}
              ry={10 + state.plumeScale * 85}
              fill={state.activeReagent === 'acid' ? 'url(#plume-acid)' : 'url(#plume-base)'}
            />
            <circle
              cx={235 - state.plumeScale * 25}
              cy={240 + state.plumeScale * 70}
              r={12 + state.plumeScale * 35}
              fill={state.activeReagent === 'acid' ? '#EF4444' : '#FDE047'}
              opacity={0.4}
            />
            <circle
              cx={265 + state.plumeScale * 25}
              cy={240 + state.plumeScale * 70}
              r={12 + state.plumeScale * 35}
              fill={state.activeReagent === 'acid' ? '#F97316' : '#FEF08A'}
              opacity={0.4}
            />
          </g>
        )}

        {}
        {state.temperature > 35 && (
          <g opacity={(state.temperature - 30) / 90} stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3,3" fill="none" className="pointer-events-none">
            <path d="M 215 385 Q 225 300 245 250" className="animate-pulse" />
            <path d="M 285 385 Q 275 300 255 250" className="animate-pulse" />
            <path d="M 185 320 Q 175 365 195 400" />
            <path d="M 315 320 Q 325 365 305 400" />
          </g>
        )}

        {}
        <g id="dissolved-ions">
          {particlesRef.current.map((p, idx) => {
            const isChromate = p.type === 'chromate';
            const isDichromate = p.type === 'dichromate';
            const isHPlus = p.type === 'hplus';
            const isWater = p.type === 'water';
            const isCurrentDragged = draggedId === p.id;

            return (
              <g
                key={p.id}
                ref={el => { particleGroupRefs.current[idx] = el; }}
                onPointerDown={e => handleParticlePointerDown(e, p.id)}
                onPointerUp={handlePointerUp}
                style={{
                  cursor: isCurrentDragged ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}
                filter="url(#atom-shadow)"
                className="select-none"
              >
                {}
                {isCurrentDragged && (
                  <circle
                    cx={0}
                    cy={0}
                    r={isDichromate ? 22 : isChromate ? 18 : 14}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={2.2}
                    strokeDasharray="4,3"
                    className="animate-spin"
                  />
                )}

                {}
                {isChromate && (
                  <g>
                    {}
                    <line x1="0" y1="0" x2="-9" y2="-8" stroke="#A16207" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="9" y2="-8" stroke="#A16207" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="-8" y2="8" stroke="#A16207" strokeWidth="2.2" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="8" y2="8" stroke="#A16207" strokeWidth="2.2" strokeLinecap="round" />

                    {}
                    <circle cx="-9" cy="-8" r="4.5" fill="url(#oxygen-yellow-grad)" stroke="#CA8A04" strokeWidth="0.8" />
                    <circle cx="9" cy="-8" r="4.5" fill="url(#oxygen-yellow-grad)" stroke="#CA8A04" strokeWidth="0.8" />
                    <circle cx="-8" cy="8" r="4.5" fill="url(#oxygen-yellow-grad)" stroke="#CA8A04" strokeWidth="0.8" />
                    <circle cx="8" cy="8" r="4.5" fill="url(#oxygen-yellow-grad)" stroke="#CA8A04" strokeWidth="0.8" />

                    {}
                    <circle cx="0" cy="0" r="7.5" fill="url(#chromate-core-grad)" stroke="#713F12" strokeWidth="1.2" />

                    {}
                    <rect x="-14" y="-3.5" width="28" height="7" rx="3.5" fill="#FEF08A" stroke="#854D0E" strokeWidth="0.8" opacity="0.95" />
                    <text
                      x="0"
                      y="1.8"
                      fontSize="5.2"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fill="#713F12"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      CrO₄²⁻
                    </text>
                  </g>
                )}

                {}
                {isDichromate && (
                  <g>
                    {}
                    <line x1="-9" y1="0" x2="0" y2="-4" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="9" y1="0" x2="0" y2="-4" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />

                    {}
                    <line x1="-9" y1="0" x2="-16" y2="-6" stroke="#9A3412" strokeWidth="1.8" />
                    <line x1="-9" y1="0" x2="-14" y2="7" stroke="#9A3412" strokeWidth="1.8" />
                    <line x1="9" y1="0" x2="16" y2="-6" stroke="#9A3412" strokeWidth="1.8" />
                    <line x1="9" y1="0" x2="14" y2="7" stroke="#9A3412" strokeWidth="1.8" />

                    {}
                    <circle cx="0" cy="-4" r="4.2" fill="url(#oxygen-bridge-grad)" stroke="#7C2D12" strokeWidth="0.8" />

                    {}
                    <circle cx="-16" cy="-6" r="3.8" fill="url(#oxygen-bridge-grad)" stroke="#7C2D12" strokeWidth="0.8" />
                    <circle cx="-14" cy="7" r="3.8" fill="url(#oxygen-bridge-grad)" stroke="#7C2D12" strokeWidth="0.8" />
                    <circle cx="16" cy="-6" r="3.8" fill="url(#oxygen-bridge-grad)" stroke="#7C2D12" strokeWidth="0.8" />
                    <circle cx="14" cy="7" r="3.8" fill="url(#oxygen-bridge-grad)" stroke="#7C2D12" strokeWidth="0.8" />

                    {}
                    <circle cx="-9" cy="0" r="6.8" fill="url(#dichromate-core-grad)" stroke="#7C2D12" strokeWidth="1.2" />
                    <circle cx="9" cy="0" r="6.8" fill="url(#dichromate-core-grad)" stroke="#7C2D12" strokeWidth="1.2" />

                    {}
                    <rect x="-16" y="2.5" width="32" height="7.5" rx="3.75" fill="#FFEDD5" stroke="#9A3412" strokeWidth="0.8" opacity="0.95" />
                    <text
                      x="0"
                      y="8"
                      fontSize="5.2"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fill="#9A3412"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      Cr₂O₇²⁻
                    </text>
                  </g>
                )}

                {}
                {isHPlus && (
                  <g>
                    <circle cx="0" cy="0" r="7" fill="url(#hplus-grad)" stroke="#FFFFFF" strokeWidth="1.2" />
                    <text
                      x="0"
                      y="2.5"
                      fontSize="6.2"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fill="#FFFFFF"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      H⁺
                    </text>
                  </g>
                )}

                {}
                {isWater && (
                  <g>
                    {}
                    <line x1="0" y1="0" x2="-6.5" y2="5" stroke="#0284C7" strokeWidth="2.0" strokeLinecap="round" />
                    <line x1="0" y1="0" x2="6.5" y2="5" stroke="#0284C7" strokeWidth="2.0" strokeLinecap="round" />

                    {}
                    <circle cx="-6.5" cy="5" r="3.2" fill="url(#water-h-grad)" stroke="#0284C7" strokeWidth="0.8" />
                    <circle cx="6.5" cy="5" r="3.2" fill="url(#water-h-grad)" stroke="#0284C7" strokeWidth="0.8" />

                    {}
                    <circle cx="0" cy="0" r="5.8" fill="url(#water-oxygen-grad)" stroke="#075985" strokeWidth="1.0" />

                    <text
                      x="0"
                      y="2.0"
                      fontSize="4.5"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fill="#FFFFFF"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      H₂O
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {}
        <path
          ref={meniscusPathRef}
          fill="none"
          stroke={currentColor.light}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
          className="pointer-events-none"
        />

        {}
        {state.rippleOpacity > 0.01 && (
          <g className="pointer-events-none">
            <ellipse
              cx="250"
              cy="230"
              rx={state.rippleScale * 48}
              ry={state.rippleScale * 7.5}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              opacity={state.rippleOpacity}
            />
            <ellipse
              cx="250"
              cy="230"
              rx={state.rippleScale * 26}
              ry={state.rippleScale * 4.5}
              fill="none"
              stroke={state.activeReagent === 'acid' ? '#EF4444' : '#FBBF24'}
              strokeWidth="1.5"
              opacity={state.rippleOpacity * 0.8}
            />
          </g>
        )}

        {}
        <path
          d="M 148 135 L 142 135 Q 138 135 142 142 L 155 160 L 155 405 Q 155 428 178 428 L 322 428 Q 345 428 345 405 L 345 135 Z"
          fill="url(#glass-reflection)"
          stroke="#94A3B8"
          strokeWidth="3.5"
          strokeLinejoin="round"
          className="pointer-events-none"
        />
        <ellipse cx="250" cy="135" rx="95" ry="8" fill="none" stroke="#94A3B8" strokeWidth="3.5" className="pointer-events-none" />
        <path d="M 165 137 Q 250 142 335 137" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" className="pointer-events-none" />
        <path d="M 163 160 L 163 405" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.45" strokeLinecap="round" className="pointer-events-none" />
        <path d="M 168 418 Q 250 422 332 418" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" className="pointer-events-none" />

        {}
        <g stroke="#64748B" strokeWidth="1.5" opacity="0.8" className="pointer-events-none">
          <line x1="160" y1="200" x2="190" y2="200" />
          <text x="196" y="204" fontSize="10" fill="#475569" fontWeight="600" stroke="none">200</text>
          <line x1="160" y1="250" x2="185" y2="250" />
          <text x="191" y="254" fontSize="10" fill="#475569" fontWeight="600" stroke="none">150</text>
          <line x1="160" y1="300" x2="190" y2="300" />
          <text x="196" y="304" fontSize="10" fill="#475569" fontWeight="600" stroke="none">100</text>
          <line x1="160" y1="350" x2="185" y2="350" />
          <text x="191" y="354" fontSize="10" fill="#475569" fontWeight="600" stroke="none">50 mL</text>

          <line x1="160" y1="225" x2="175" y2="225" strokeWidth="1" />
          <line x1="160" y1="275" x2="175" y2="275" strokeWidth="1" />
          <line x1="160" y1="325" x2="175" y2="325" strokeWidth="1" />
          <line x1="160" y1="375" x2="175" y2="375" strokeWidth="1" />
        </g>
        <text x="250" y="398" textAnchor="middle" fontSize="9" fill="#64748B" opacity="0.7" fontWeight="600" letterSpacing="0.05em" className="pointer-events-none">
          BOROSILICATE 3.3 • 250mL
        </text>

        {}
        {state.animPhase === 'falling_drop' && (
          <g transform={`translate(250, ${dropCurrentY})`} className="pointer-events-none">
            <path
              d="M 0 -10 C 5 -4, 6 4, 0 8 C -6 4, -5 -4, 0 -10 Z"
              fill={state.activeReagent === 'acid' ? '#EF4444' : '#3B82F6'}
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
            <circle cx="-1.5" cy="1" r="1.5" fill="#FFFFFF" opacity="0.8" />
          </g>
        )}

        {}
        <g
          id="acid-dropper"
          transform={`translate(${acidDropperX}, ${acidDropperY}) rotate(${acidDropperAngle})`}
          className="transition-all duration-300 ease-out"
          style={{ cursor: state.animPhase === 'idle' ? 'pointer' : 'default' }}
          onClick={() => state.animPhase === 'idle' && onAddReagent('acid')}
        >
          <ellipse
            cx="0"
            cy="-42"
            rx={13 - (isAcidActive ? state.dropperSqueeze * 3.5 : 0)}
            ry={18}
            fill="#DC2626"
            stroke="#991B1B"
            strokeWidth="1.5"
          />
          <rect x="-8" y="-26" width="16" height="5" rx="1.5" fill="#7F1D1D" />
          <path d="M -7 -22 L -7 40 L -2.5 58 L -2.5 68 L 2.5 68 L 2.5 58 L 7 40 L 7 -22 Z" fill="#F8FAFC" opacity="0.85" stroke="#64748B" strokeWidth="1.4" />
          <path d="M -5 -5 L -5 38 L -1.8 55 L 1.8 55 L 5 38 L 5 -5 Z" fill="#EF4444" opacity="0.8" />
          <line x1="-3.5" y1="-18" x2="-3.5" y2="45" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />
          <rect x="-16" y="2" width="32" height="15" rx="3" fill="#FFFFFF" stroke="#DC2626" strokeWidth="1.2" />
          <text x="0" y="13" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#DC2626">
            HCl
          </text>
        </g>

        {}
        <g
          id="base-dropper"
          transform={`translate(${baseDropperX}, ${baseDropperY}) rotate(${baseDropperAngle})`}
          className="transition-all duration-300 ease-out"
          style={{ cursor: state.animPhase === 'idle' ? 'pointer' : 'default' }}
          onClick={() => state.animPhase === 'idle' && onAddReagent('base')}
        >
          <ellipse
            cx="0"
            cy="-42"
            rx={13 - (isBaseActive ? state.dropperSqueeze * 3.5 : 0)}
            ry={18}
            fill="#2563EB"
            stroke="#1E40AF"
            strokeWidth="1.5"
          />
          <rect x="-8" y="-26" width="16" height="5" rx="1.5" fill="#1E3A8A" />
          <path d="M -7 -22 L -7 40 L -2.5 58 L -2.5 68 L 2.5 68 L 2.5 58 L 7 40 L 7 -22 Z" fill="#F8FAFC" opacity="0.85" stroke="#64748B" strokeWidth="1.4" />
          <path d="M -5 -5 L -5 38 L -1.8 55 L 1.8 55 L 5 38 L 5 -5 Z" fill="#3B82F6" opacity="0.8" />
          <line x1="-3.5" y1="-18" x2="-3.5" y2="45" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.7" />
          <rect x="-20" y="2" width="40" height="15" rx="3" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.2" />
          <text x="0" y="13" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#2563EB">
            NaOH
          </text>
        </g>
      </svg>
    </div>
  );
};

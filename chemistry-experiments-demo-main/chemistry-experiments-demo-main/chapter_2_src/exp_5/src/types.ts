export type Lang = 'ar' | 'en';
export type ReagentType = 'acid' | 'base' | null;

export interface FluidParticle {
  id: number;
  type: 'chromate' | 'dichromate' | 'hplus' | 'water';
  x: number;          
  y: number;          
  vx: number;         
  vy: number;         
  radius: number;
  label: string;
  color: string;
}

export interface ExperimentState {
  temperature: number;        
  concentrationOffset: number;
  equilibrium: number;        
  hPlusLevel: number;         
  acidDropsCount: number;     
  baseDropsCount: number;     
  activeReagent: ReagentType;
  animPhase: 'idle' | 'moving_dropper' | 'falling_drop' | 'reacting' | 'settling';
  dropProgress: number;       
  plumeScale: number;         
  plumeOpacity: number;       
  rippleScale: number;        
  rippleOpacity: number;      
  dropperSqueeze: number;     
  lastAction: 'initial' | 'acid_added' | 'base_added' | 'temp_changed' | 'reset';
  reactionDirection: 'none' | 'forward' | 'reverse';
  selectedTab: 'chatelier' | 'temperature' | 'fluid_dynamics';
}

import { create } from 'zustand';
import { ChemistryState, ReactionDefinition } from './types';
import { ChemistryEngine } from './engine';

interface LabState {
  // --- Chemistry State ---
  chemistry: ChemistryState;
  activeReactions: ReactionDefinition[];
  
  // --- Simulation Controls ---
  timeScaleMultiplier: number; // 1x = real time, >1x = sped up
  microscopeMode: boolean; // Toggled by camera zoom threshold
  isFractured: boolean;
  
  // --- Actions ---
  setTemperature: (tempK: number) => void;
  setPressure: (atm: number) => void;
  addSpecies: (speciesId: string, moles: number) => void;
  setTimeScale: (scale: number) => void;
  setMicroscopeMode: (enabled: boolean) => void;
  triggerFracture: () => void;
  
  // Ticks the simulation forward
  tick: (deltaTimeMs: number) => void;
}

const INITIAL_CHEMISTRY_STATE: ChemistryState = {
  environment: {
    temperatureK: 298.15, // 25°C
    pressureAtm: 1.0,
    volumeL: 1.0, // Assume 1L flask for simplicity of molarity = moles
  },
  concentrations: {},
};

export const useLabStore = create<LabState>((set, get) => ({
  chemistry: INITIAL_CHEMISTRY_STATE,
  activeReactions: [],
  
  timeScaleMultiplier: 1.0,
  microscopeMode: false,
  isFractured: false,
  
  setTemperature: (tempK) => set((state) => ({
    chemistry: {
      ...state.chemistry,
      environment: { ...state.chemistry.environment, temperatureK: tempK }
    }
  })),
  
  setPressure: (atm) => set((state) => ({
    chemistry: {
      ...state.chemistry,
      environment: { ...state.chemistry.environment, pressureAtm: atm }
    }
  })),
  
  addSpecies: (speciesId, moles) => set((state) => {
    const current = state.chemistry.concentrations[speciesId] || { speciesId, moles: 0, molarity: 0 };
    const newMoles = current.moles + moles;
    const volume = state.chemistry.environment.volumeL;
    
    return {
      chemistry: {
        ...state.chemistry,
        concentrations: {
          ...state.chemistry.concentrations,
          [speciesId]: {
            speciesId,
            moles: newMoles,
            molarity: newMoles / volume
          }
        }
      }
    };
  }),
  
  setTimeScale: (scale) => set({ timeScaleMultiplier: scale }),
  
  setMicroscopeMode: (enabled) => set({ microscopeMode: enabled }),

  triggerFracture: () => set({ isFractured: true, timeScaleMultiplier: 0 }),
  
  tick: (deltaTimeMs) => {
    const state = get();
    if (state.activeReactions.length === 0 || state.isFractured) return;

    const dtSimSeconds = (deltaTimeMs / 1000) * state.timeScaleMultiplier;
    const tempK = state.chemistry.environment.temperatureK;
    const pressureAtm = state.chemistry.environment.pressureAtm;
    
    // Check for hazards (explosions)
    for (const reaction of state.activeReactions) {
      if (reaction.visualHooks?.hazardCurve) {
        const hazardLevel = reaction.visualHooks.hazardCurve(pressureAtm, tempK);
        if (hazardLevel >= 1.0 && !state.isFractured) {
          get().triggerFracture();
          return;
        }
      }
    }
    
    set((currentState) => {
      let newConcentrations = { ...currentState.chemistry.concentrations };

      for (const reaction of currentState.activeReactions) {
        if (!reaction.Kc_ref || !reaction.arrhenius) continue;

        // 1. Calculate K(T) using Van 't Hoff
        const KT = ChemistryEngine.adjustEquilibriumConstant(
          reaction.Kc_ref.value,
          reaction.Kc_ref.atTemperatureK,
          tempK,
          reaction.deltaH_kJmol
        );

        // 2. Calculate current Q
        const Q = ChemistryEngine.calculateReactionQuotient(reaction, currentState.chemistry);

        // 3. Calculate Rate (k_eff)
        const k_eff = ChemistryEngine.calculateRateConstant(
          reaction.arrhenius.A,
          reaction.arrhenius.Ea_kJmol,
          tempK
        );

        // 4. Progress towards equilibrium
        // A simple first-order relaxation approach towards equilibrium position
        // In a real PDE solver, we'd integrate the rate laws exactly.
        const distanceToEq = Math.abs(Q - KT);
        if (distanceToEq < 1e-10) continue; // At equilibrium

        // Direction of shift
        const shiftRight = Q < KT;
        
        // Compute change factor
        const progress = 1 - Math.exp(-k_eff * dtSimSeconds);
        // We need a small, stable step size bounded by available reactants
        // Here we just apply a proportional step for visual plausibility
        const step = progress * 0.05; // Dampened for visual stability in this sandbox
        
        const shiftSign = shiftRight ? 1 : -1;

        // Apply shift
        reaction.reactants.forEach(r => {
          const current = newConcentrations[r.speciesId]?.moles || 0;
          const delta = shiftSign * -r.coeff * step;
          const newMoles = Math.max(0, current + delta);
          newConcentrations[r.speciesId] = {
            ...newConcentrations[r.speciesId],
            moles: newMoles,
            molarity: newMoles / currentState.chemistry.environment.volumeL
          };
        });

        reaction.products.forEach(p => {
          const current = newConcentrations[p.speciesId]?.moles || 0;
          const delta = shiftSign * p.coeff * step;
          const newMoles = Math.max(0, current + delta);
          newConcentrations[p.speciesId] = {
            ...newConcentrations[p.speciesId],
            moles: newMoles,
            molarity: newMoles / currentState.chemistry.environment.volumeL
          };
        });
      }

      return {
        chemistry: {
          ...currentState.chemistry,
          concentrations: newConcentrations
        }
      };
    });
  }
}));

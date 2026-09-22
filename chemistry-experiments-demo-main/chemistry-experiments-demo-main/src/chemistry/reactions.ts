import { ReactionDefinition } from './types';

// Standard Curriculum Reactions for 6th Grade Science (Iraq)

export const HABER_PROCESS: ReactionDefinition = {
  id: 'haber_process',
  equation: 'N2(g) + 3H2(g) <=> 2NH3(g)',
  reactants: [
    { speciesId: 'N2_g', coeff: 1, phase: 'g' },
    { speciesId: 'H2_g', coeff: 3, phase: 'g' }
  ],
  products: [
    { speciesId: 'NH3_g', coeff: 2, phase: 'g' }
  ],
  deltaH_kJmol: -92.4, // Exothermic
  deltaS_JmolK: -198.1,
  Kc_ref: { value: 6.0e5, atTemperatureK: 298 }, // At 25C
  arrhenius: { A: 1e8, Ea_kJmol: 60 }, // Approximations for observable rates in sim
  visualHooks: {
    colorFrom: '#ffffff', // H2 and N2 are colorless
    colorTo: '#a3e635', // Slight greenish/cyan tint for visibility of NH3
    producesGas: true,
    hazardCurve: (P, T) => P > 500 ? 1 : 0 // Haber operates at high pressure, extreme pressure breaks vessel
  }
};

export const WATER_AUTOIONIZATION: ReactionDefinition = {
  id: 'water_autoionization',
  equation: 'H2O(l) <=> H+(aq) + OH-(aq)',
  reactants: [
    { speciesId: 'H2O_l', coeff: 1, phase: 'l' }
  ],
  products: [
    { speciesId: 'H_plus_aq', coeff: 1, phase: 'aq' },
    { speciesId: 'OH_minus_aq', coeff: 1, phase: 'aq' }
  ],
  deltaH_kJmol: 55.8, // Endothermic
  deltaS_JmolK: -80.7,
  Kc_ref: { value: 1.0e-14, atTemperatureK: 298.15 }, // Kw
  arrhenius: { A: 1e11, Ea_kJmol: 20 },
  visualHooks: {
    colorFrom: '#3b82f6',
    colorTo: '#3b82f6',
  }
};

export const SILVER_CHROMATE_PRECIPITATION: ReactionDefinition = {
  id: 'ag2cro4_precipitation',
  equation: '2Ag+(aq) + CrO4^2-(aq) <=> Ag2CrO4(s)',
  reactants: [
    { speciesId: 'Ag_plus_aq', coeff: 2, phase: 'aq' },
    { speciesId: 'CrO4_2minus_aq', coeff: 1, phase: 'aq' }
  ],
  products: [
    { speciesId: 'Ag2CrO4_s', coeff: 1, phase: 's' }
  ],
  deltaH_kJmol: -100, // placeholder
  deltaS_JmolK: -150, // placeholder
  Kc_ref: { value: 1 / 1.1e-12, atTemperatureK: 298.15 }, // Ksp = 1.1e-12 => K = 1/Ksp
  arrhenius: { A: 1e10, Ea_kJmol: 15 },
  visualHooks: {
    colorFrom: '#fde047', // Yellow chromate
    colorTo: '#ef4444', // Red-brown precipitate
    producesPrecipitate: true,
  }
};

export const DANIELL_CELL: ReactionDefinition = {
  id: 'daniell_cell',
  equation: 'Zn(s) + Cu^2+(aq) -> Zn^2+(aq) + Cu(s)',
  reactants: [
    { speciesId: 'Zn_s', coeff: 1, phase: 's' },
    { speciesId: 'Cu_2plus_aq', coeff: 1, phase: 'aq' }
  ],
  products: [
    { speciesId: 'Zn_2plus_aq', coeff: 1, phase: 'aq' },
    { speciesId: 'Cu_s', coeff: 1, phase: 's' }
  ],
  deltaH_kJmol: -212.8,
  deltaS_JmolK: -10.4,
  visualHooks: {
    colorFrom: '#3b82f6', // blue Cu2+
    colorTo: '#ffffff', // colorless Zn2+
  }
};

export interface ChemicalSpecies {
  id: string; // e.g., 'H2O_l', 'H_plus_aq'
  formula: string;
  name: string;
  phase: 's' | 'l' | 'g' | 'aq';
  molarMass?: number; // g/mol
  color?: string; // Hex color for visual rendering reference
}

export interface ReactionDefinition {
  id: string;
  equation: string; // e.g., "N2(g) + 3H2(g) <=> 2NH3(g)"
  reactants: { speciesId: string; coeff: number; phase: 'g' | 'l' | 's' | 'aq' }[];
  products: { speciesId: string; coeff: number; phase: 'g' | 'l' | 's' | 'aq' }[];
  deltaH_kJmol: number;      // negative = exothermic
  deltaS_JmolK: number;
  Kc_ref?: { value: number; atTemperatureK: number }; // reference point for Van't Hoff extrapolation
  arrhenius?: { A: number; Ea_kJmol: number };         // k = A * exp(-Ea / (R*T))
  visualHooks?: {
    colorFrom: string;
    colorTo: string;
    producesGas?: boolean;
    producesPrecipitate?: boolean;   // driven by Ksp comparison
    hazardCurve?: (pressureAtm: number, tempK: number) => number; // 0..1, feeds fracture threshold
  };
}

export interface LabEnvironmentState {
  temperatureK: number;
  pressureAtm: number;
  volumeL: number;
}

export interface SpeciesConcentration {
  speciesId: string;
  molarity: number; // mol/L
  moles: number;
}

export interface ChemistryState {
  environment: LabEnvironmentState;
  concentrations: Record<string, SpeciesConcentration>;
}

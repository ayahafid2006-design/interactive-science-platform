import { ReactionDefinition, ChemistryState } from './types';

export const UNIVERSAL_GAS_CONSTANT_R = 8.314; // J/(mol·K)

/**
 * Core Chemistry Engine
 * Computes chemical realities completely isolated from rendering.
 */
export class ChemistryEngine {
  
  /**
   * Calculates Gibbs Free Energy change (ΔG = ΔH - TΔS)
   * @param deltaH_kJmol Enthalpy change in kJ/mol
   * @param deltaS_JmolK Entropy change in J/(mol·K)
   * @param temperatureK Temperature in Kelvin
   * @returns Delta G in kJ/mol
   */
  static calculateGibbsFreeEnergy(deltaH_kJmol: number, deltaS_JmolK: number, temperatureK: number): number {
    const deltaH_Jmol = deltaH_kJmol * 1000;
    const deltaG_Jmol = deltaH_Jmol - (temperatureK * deltaS_JmolK);
    return deltaG_Jmol / 1000;
  }

  /**
   * Calculates rate constant k using Arrhenius equation: k = A * e^(-Ea / RT)
   */
  static calculateRateConstant(A: number, Ea_kJmol: number, temperatureK: number): number {
    const Ea_Jmol = Ea_kJmol * 1000;
    return A * Math.exp(-Ea_Jmol / (UNIVERSAL_GAS_CONSTANT_R * temperatureK));
  }

  /**
   * Updates Kc for a new temperature using Van 't Hoff equation
   * ln(K2/K1) = -ΔH/R * (1/T2 - 1/T1)
   */
  static adjustEquilibriumConstant(K1: number, T1: number, T2: number, deltaH_kJmol: number): number {
    const deltaH_Jmol = deltaH_kJmol * 1000;
    const exponent = -(deltaH_Jmol / UNIVERSAL_GAS_CONSTANT_R) * ((1 / T2) - (1 / T1));
    return K1 * Math.exp(exponent);
  }

  /**
   * Calculates Reaction Quotient (Q) for a given reaction and state
   */
  static calculateReactionQuotient(reaction: ReactionDefinition, state: ChemistryState): number {
    let Q = 1;
    
    // Products (Numerator)
    for (const prod of reaction.products) {
      if (prod.phase === 'aq' || prod.phase === 'g') {
        const conc = state.concentrations[prod.speciesId]?.molarity || 0;
        Q *= Math.pow(conc, prod.coeff);
      }
    }

    // Reactants (Denominator)
    let reactantTerm = 1;
    for (const react of reaction.reactants) {
      if (react.phase === 'aq' || react.phase === 'g') {
        const conc = state.concentrations[react.speciesId]?.molarity || 0;
        reactantTerm *= Math.pow(conc, react.coeff);
      }
    }

    if (reactantTerm === 0) return Infinity; // Prevent division by zero
    
    return Q / reactantTerm;
  }

  // ==========================================
  // Chapter 3: Ionic Equilibrium
  // ==========================================

  /**
   * Calculates pH from Hydrogen ion concentration
   */
  static calculatePH(hPlusConcentration: number): number {
    if (hPlusConcentration <= 0) return 7; // Neutral fallback, though technically invalid
    return -Math.log10(hPlusConcentration);
  }

  /**
   * Calculates pOH from Hydroxide ion concentration
   */
  static calculatePOH(ohMinusConcentration: number): number {
    if (ohMinusConcentration <= 0) return 7;
    return -Math.log10(ohMinusConcentration);
  }

  /**
   * Henderson-Hasselbalch equation for buffer solutions
   * pH = pKa + log10([A-] / [HA])
   */
  static calculateBufferPH(pKa: number, conjugateBaseConc: number, acidConc: number): number {
    if (acidConc === 0) return Infinity;
    return pKa + Math.log10(conjugateBaseConc / acidConc);
  }

  /**
   * Calculates Ion Product (Qsp) to compare with Ksp for precipitation
   */
  static calculateIonProduct(cationConc: number, cationCoeff: number, anionConc: number, anionCoeff: number): number {
    return Math.pow(cationConc, cationCoeff) * Math.pow(anionConc, anionCoeff);
  }

  // ==========================================
  // Chapter 4: Electrochemistry
  // ==========================================

  /**
   * Standard cell potential
   * E°cell = E°cathode - E°anode
   */
  static calculateStandardCellPotential(eStandardCathode: number, eStandardAnode: number): number {
    return eStandardCathode - eStandardAnode;
  }

  /**
   * Nernst Equation
   * E = E° - (RT/nF) * ln(Q)
   */
  static calculateNernstPotential(eStandard: number, temperatureK: number, nElectrons: number, Q: number): number {
    const FARADAY_CONSTANT = 96485; // C/mol
    if (Q <= 0) return eStandard; // Handle edge case
    const term = (UNIVERSAL_GAS_CONSTANT_R * temperatureK) / (nElectrons * FARADAY_CONSTANT);
    return eStandard - (term * Math.log(Q));
  }

  /**
   * Faraday's Law of Electrolysis
   * Calculates moles of substance produced/consumed
   * moles = (Current * time) / (n * F)
   */
  static calculateElectrolysisMoles(currentAmps: number, timeSeconds: number, nElectrons: number): number {
    const FARADAY_CONSTANT = 96485; // C/mol
    const chargeCoulombs = currentAmps * timeSeconds;
    return chargeCoulombs / (nElectrons * FARADAY_CONSTANT);
  }
}


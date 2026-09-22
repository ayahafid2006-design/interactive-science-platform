import { describe, it, expect } from 'vitest';
import { ChemistryEngine } from './engine';

describe('ChemistryEngine', () => {
  it('calculates Gibbs Free Energy correctly', () => {
    // Example: Haber process N2 + 3H2 <=> 2NH3
    // ΔH = -92.2 kJ/mol, ΔS = -198.7 J/(mol·K) at 298K
    const deltaG = ChemistryEngine.calculateGibbsFreeEnergy(-92.2, -198.7, 298);
    // ΔG = -92200 - (298 * -198.7) = -92200 + 59212.6 = -32987.4 J = -32.987 kJ
    expect(deltaG).toBeCloseTo(-32.987, 2);
  });

  it('adjusts Equilibrium Constant correctly (Van t Hoff)', () => {
    // K1 = 1, T1 = 298K, T2 = 400K, Endothermic (ΔH = 50 kJ/mol)
    const K2_endo = ChemistryEngine.adjustEquilibriumConstant(1, 298, 400, 50);
    expect(K2_endo).toBeGreaterThan(1); // Le Chatelier: Heating endothermic shifts right, K increases

    // K1 = 1, T1 = 298K, T2 = 400K, Exothermic (ΔH = -50 kJ/mol)
    const K2_exo = ChemistryEngine.adjustEquilibriumConstant(1, 298, 400, -50);
    expect(K2_exo).toBeLessThan(1); // Le Chatelier: Heating exothermic shifts left, K decreases
  });

  it('calculates Arrhenius rate constant correctly', () => {
    const k = ChemistryEngine.calculateRateConstant(1e13, 50, 298);
    // k = 1e13 * exp(-50000 / (8.314 * 298))
    expect(k).toBeGreaterThan(0);
    expect(k).toBeLessThan(1e13);
  });

  describe('Chapter 3: Ionic Equilibrium', () => {
    it('calculates pH correctly', () => {
      expect(ChemistryEngine.calculatePH(1e-7)).toBeCloseTo(7, 2);
      expect(ChemistryEngine.calculatePH(0.01)).toBeCloseTo(2, 2);
    });

    it('calculates pOH correctly', () => {
      expect(ChemistryEngine.calculatePOH(1e-5)).toBeCloseTo(5, 2);
    });

    it('calculates buffer pH correctly (Henderson-Hasselbalch)', () => {
      // pKa of acetic acid is ~4.76
      // Equimolar mixture: pH = pKa + log(1) = pKa
      expect(ChemistryEngine.calculateBufferPH(4.76, 0.1, 0.1)).toBeCloseTo(4.76, 2);
      // 10x base: pH = pKa + log(10) = pKa + 1
      expect(ChemistryEngine.calculateBufferPH(4.76, 1.0, 0.1)).toBeCloseTo(5.76, 2);
    });

    it('calculates Ion Product (Qsp) correctly', () => {
      // Ag2CrO4 -> 2Ag+ + CrO4^2-
      const qsp = ChemistryEngine.calculateIonProduct(0.01, 2, 0.005, 1); // (0.01)^2 * (0.005)^1 = 1e-4 * 5e-3 = 5e-7
      expect(qsp).toBeCloseTo(5e-7, 10);
    });
  });

  describe('Chapter 4: Electrochemistry', () => {
    it('calculates standard cell potential', () => {
      // Cu2+ + 2e- -> Cu (0.34V)
      // Zn2+ + 2e- -> Zn (-0.76V)
      // Ecell = 0.34 - (-0.76) = 1.10V
      expect(ChemistryEngine.calculateStandardCellPotential(0.34, -0.76)).toBeCloseTo(1.10, 2);
    });

    it('calculates Nernst potential', () => {
      // Standard Daniell cell at 298K, n=2, Q=1
      const E = ChemistryEngine.calculateNernstPotential(1.10, 298, 2, 1);
      expect(E).toBeCloseTo(1.10, 2); // ln(1) = 0

      // Q = 10, should decrease potential
      const E_nonStd = ChemistryEngine.calculateNernstPotential(1.10, 298, 2, 10);
      expect(E_nonStd).toBeLessThan(1.10);
    });

    it('calculates Faraday electrolysis moles', () => {
      // 1 Amp for 96485 seconds, n=1
      const moles = ChemistryEngine.calculateElectrolysisMoles(1, 96485, 1);
      expect(moles).toBeCloseTo(1.0, 2);
    });
  });
});


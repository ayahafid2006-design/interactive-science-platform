export interface MoleculeCount {
  [name: string]: number;
}
export interface Reaction {
  name: string;
  reactants: MoleculeCount;
  products: MoleculeCount;
  k: number;
}
export class GillespieSSA {
  counts: MoleculeCount;
  reactions: Reaction[];
  time: number;
  constructor(initialCounts: MoleculeCount, reactions: Reaction[]) {
    this.counts = { ...initialCounts };
    this.reactions = reactions;
    this.time = 0;
  }
  step(): { timeDelta: number; reactionIndex: number } | null {
    const propensities = this.reactions.map(rxn => {
      let a = rxn.k;
      for (const [reactant, count] of Object.entries(rxn.reactants)) {
        if (this.counts[reactant] === undefined || this.counts[reactant] < count) {
          return 0;
        }
        for (let i = 0; i < count; i++) {
          a *= (this.counts[reactant] - i);
        }
      }
      return a;
    });
    const a0 = propensities.reduce((sum, a) => sum + a, 0);
    if (a0 === 0) {
      return null;
    }
    const r1 = Math.random();
    const r2 = Math.random();
    const tau = (1 / a0) * Math.log(1 / r1);
    let sum = 0;
    let reactionIndex = 0;
    for (let i = 0; i < propensities.length; i++) {
      sum += propensities[i];
      if (sum > r2 * a0) {
        reactionIndex = i;
        break;
      }
    }
    const rxn = this.reactions[reactionIndex];
    for (const [reactant, count] of Object.entries(rxn.reactants)) {
      this.counts[reactant] -= count;
    }
    for (const [product, count] of Object.entries(rxn.products)) {
      this.counts[product] = (this.counts[product] || 0) + count;
    }
    this.time += tau;
    return { timeDelta: tau, reactionIndex };
  }
  simulate(steps: number): { time: number, counts: MoleculeCount }[] {
    const history = [];
    for (let i = 0; i < steps; i++) {
      const result = this.step();
      if (!result) break;
      history.push({
        time: this.time,
        counts: { ...this.counts }
      });
    }
    return history;
  }
}

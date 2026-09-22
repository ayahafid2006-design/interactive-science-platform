export interface Atom {
  element: string;
  x: number;
  y: number;
  z: number;
}
export interface MoleculeStructure {
  name: string;
  atoms: Atom[];
  bonds: [number, number][];
}
const MOLECULES: Record<string, MoleculeStructure> = {
  'H2': {
    name: 'Hydrogen',
    atoms: [
      { element: 'H', x: -0.37, y: 0, z: 0 },
      { element: 'H', x: 0.37, y: 0, z: 0 }
    ],
    bonds: [[0, 1]]
  },
  'N2': {
    name: 'Nitrogen',
    atoms: [
      { element: 'N', x: -0.55, y: 0, z: 0 },
      { element: 'N', x: 0.55, y: 0, z: 0 }
    ],
    bonds: [[0, 1]]
  },
  'NH3': {
    name: 'Ammonia',
    atoms: [
      { element: 'N', x: 0, y: 0.3, z: 0 },
      { element: 'H', x: 0, y: -0.1, z: 0.94 },
      { element: 'H', x: 0.81, y: -0.1, z: -0.47 },
      { element: 'H', x: -0.81, y: -0.1, z: -0.47 }
    ],
    bonds: [[0, 1], [0, 2], [0, 3]]
  }
};
export const ATOM_COLORS: Record<string, string> = {
  'H': '#ffffff',
  'N': '#3b82f6',
  'O': '#ef4444',
  'C': '#333333'
};
export const ATOM_RADII: Record<string, number> = {
  'H': 0.3,
  'N': 0.6,
  'O': 0.55,
  'C': 0.65
};
export function getMoleculeStructure(name: string): MoleculeStructure | null {
  return MOLECULES[name] || null;
}

import React from 'react';
import { Experiment } from '../types';
import { DynamicEquilibrium2DLab } from './DynamicEquilibrium2DLab';

interface Props {
  experiment: Experiment;
  onBack: () => void;
  chapterColor: string;
}

export function InteractiveLab({ experiment, onBack, chapterColor }: Props) {
  // We only have the Dynamic Equilibrium Lab now
  return <DynamicEquilibrium2DLab experiment={experiment} onBack={onBack} chapterColor={chapterColor} />;
}

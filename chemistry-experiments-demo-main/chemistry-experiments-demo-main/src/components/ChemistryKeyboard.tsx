import { useState } from 'react';
import { motion } from 'motion/react';
import { Delete, CornerDownLeft } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ChemistryKeyboardProps {
  onInsert: (char: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
}

const ARABIC_CHARS = [
  'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د',
  'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط',
  'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'
];

const ENGLISH_CHARS = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
  'z', 'x', 'c', 'v', 'b', 'n', 'm'
];

const ELEMENTS = [
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
];

const MATH_SYMBOLS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉',
  '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹',
  '⁺', '⁻', '⁽', '⁾', '₊', '₋', '+', '-', '=', '(',
  ')', '[', ']', '→', '⇌', '↑', '↓', 'Δ', '°', 'e⁻'
];

export function ChemistryKeyboard({ onInsert, onBackspace, onSubmit }: ChemistryKeyboardProps) {
  const [activeLang, setActiveLang] = useState<'ar' | 'en' | 'chem'>('chem');
  const [chemTab, setChemTab] = useState<'elements' | 'math'>('elements');
  const [isShift, setIsShift] = useState(false);

  const handlePress = (char: string) => {
    soundManager.playClick();
    onInsert(char);
  };

  const renderKey = (char: string, i: number, extraClass = "") => (
    <button 
      key={i} 
      onClick={() => handlePress(char)} 
      className={`h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded shadow-sm border border-white/5 text-lg flex items-center justify-center transition-colors active:scale-95 ${extraClass}`}
    >
      {char}
    </button>
  );

  return (
    <div className="bg-slate-900 border-t border-white/10 p-2 select-none" dir="ltr">
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex space-x-1">
          <button 
            onClick={() => { setActiveLang('chem'); soundManager.playHover(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeLang === 'chem' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-slate-400 hover:bg-white/5'}`}
          >
            رموز كيميائية
          </button>
          <button 
            onClick={() => { setActiveLang('ar'); soundManager.playHover(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeLang === 'ar' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-400 hover:bg-white/5'}`}
          >
            العربية
          </button>
          <button 
            onClick={() => { setActiveLang('en'); soundManager.playHover(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeLang === 'en' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-slate-400 hover:bg-white/5'}`}
          >
            English
          </button>
        </div>
      </div>

      {activeLang === 'chem' && (
        <div className="flex space-x-2 mb-2 px-1">
          <button onClick={() => setChemTab('elements')} className={`flex-1 py-1 rounded text-xs font-semibold ${chemTab === 'elements' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            العناصر (118)
          </button>
          <button onClick={() => setChemTab('math')} className={`flex-1 py-1 rounded text-xs font-semibold ${chemTab === 'math' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            أرقام ورموز
          </button>
        </div>
      )}

      <div className="h-48 overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
        {activeLang === 'chem' && chemTab === 'elements' && (
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-1 pb-2">
            {ELEMENTS.map((char, i) => renderKey(char, i, 'font-medium text-cyan-50'))}
          </div>
        )}
        
        {activeLang === 'chem' && chemTab === 'math' && (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 pb-2">
            {MATH_SYMBOLS.map((char, i) => renderKey(char, i, 'text-orange-200'))}
          </div>
        )}

        {activeLang === 'ar' && (
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-10 gap-1">{ARABIC_CHARS.slice(0, 10).map((c, i) => renderKey(c, i))}</div>
            <div className="grid grid-cols-10 gap-1 px-4">{ARABIC_CHARS.slice(10, 20).map((c, i) => renderKey(c, i))}</div>
            <div className="grid grid-cols-10 gap-1 px-8">{ARABIC_CHARS.slice(20, 30).map((c, i) => renderKey(c, i))}</div>
            <div className="grid grid-cols-3 gap-1 px-12">{ARABIC_CHARS.slice(30).map((c, i) => renderKey(c, i))}</div>
          </div>
        )}

        {activeLang === 'en' && (
          <div className="flex flex-col gap-1">
            <div className="grid grid-cols-10 gap-1">
              {(isShift ? ENGLISH_CHARS.map(c => c.toUpperCase()) : ENGLISH_CHARS).slice(0, 10).map((c, i) => renderKey(c, i))}
            </div>
            <div className="grid grid-cols-9 gap-1 px-4">
              {(isShift ? ENGLISH_CHARS.map(c => c.toUpperCase()) : ENGLISH_CHARS).slice(10, 19).map((c, i) => renderKey(c, i))}
            </div>
            <div className="flex gap-1 px-1">
              <button onClick={() => { setIsShift(!isShift); soundManager.playClick(); }} className={`px-2 w-16 h-10 rounded shadow-sm border border-white/5 text-sm flex items-center justify-center transition-colors active:scale-95 ${isShift ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                Shift
              </button>
              <div className="flex-1 grid grid-cols-7 gap-1">
                {(isShift ? ENGLISH_CHARS.map(c => c.toUpperCase()) : ENGLISH_CHARS).slice(19).map((c, i) => renderKey(c, i))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 px-1 mt-2">
        <button onClick={() => handlePress(' ')} className="flex-grow h-10 bg-slate-800 hover:bg-slate-700 rounded shadow-sm border border-white/5 transition-colors active:scale-95" />
        <button onPointerDown={() => { onBackspace(); soundManager.playClick(); }} className="px-6 h-10 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded shadow-sm border border-white/5 flex items-center justify-center transition-colors active:scale-95">
          <Delete size={20} />
        </button>
        <button onClick={() => { onSubmit(); soundManager.playSuccess(); }} className="px-6 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-sm flex items-center justify-center transition-colors active:scale-95">
          <CornerDownLeft size={20} />
        </button>
      </div>
    </div>
  );
}

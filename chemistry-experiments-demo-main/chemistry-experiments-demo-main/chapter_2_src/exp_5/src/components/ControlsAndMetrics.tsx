import React from 'react';
import { RotateCcw, Thermometer, FlaskConical, Beaker, Sliders, Activity } from 'lucide-react';
import { ExperimentState, Lang } from '../types';

interface ControlsAndMetricsProps {
  state: ExperimentState;
  chromatePercent: number;
  dichromatePercent: number;
  onAddReagent: (reagent: 'acid' | 'base') => void;
  onSetTemperature: (temp: number) => void;
  onReset: () => void;
  lang: Lang;
}

export const ControlsAndMetrics: React.FC<ControlsAndMetricsProps> = ({
  state,
  chromatePercent,
  dichromatePercent,
  onAddReagent,
  onSetTemperature,
  onReset,
  lang,
}) => {
  const isAr = lang === 'ar';

  const tempPresets = [
    { label: isAr ? 'تبريد (15°م)' : 'Cool (15°C)', value: 15 },
    { label: isAr ? 'غرفة (25°م)' : 'Room (25°C)', value: 25 },
    { label: isAr ? 'دافئ (50°م)' : 'Warm (50°C)', value: 50 },
    { label: isAr ? 'ساخن (80°م)' : 'Hot (80°C)', value: 80 },
  ];

  return (
    <div
      id="controls-notebook-card"
      className="bg-[#fdfcf0] shadow-xs border border-slate-200 rounded-xl relative overflow-hidden flex flex-col"
    >
      {}
      <div
        className={`absolute top-0 bottom-0 w-px bg-red-200 z-10 pointer-events-none ${
          isAr ? 'right-10' : 'left-10'
        }`}
      />

      {}
      <div
        className="p-3.5 border-b border-slate-200 bg-white/75 relative z-20 flex items-center justify-end"
        style={{
          paddingLeft: isAr ? '1.25rem' : '3.25rem',
          paddingRight: isAr ? '3.25rem' : '1.25rem',
        }}
      >
        <button
          id="btn-reset-exp"
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
          title={isAr ? 'إعادة ضبط التجربة' : 'Reset Experiment'}
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
        </button>
      </div>

      {}
      <div
        className="flex-1 w-full bg-[linear-gradient(transparent_31px,#e5e7eb_32px)] bg-[length:100%_32px] p-5 space-y-4 relative z-0 text-slate-800"
        style={{
          paddingLeft: isAr ? '1.5rem' : '3.5rem',
          paddingRight: isAr ? '3.5rem' : '1.5rem',
        }}
      >
        {}
        <div className="bg-white/85 rounded-lg border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAr ? 'إضافة الكواشف (تغيير التركيز):' : 'Reagent Additions (Concentration Shift):'}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              {isAr ? 'قطرة تلو الأخرى' : 'Drop-by-drop'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-add-acid"
              disabled={state.animPhase !== 'idle'}
              onClick={() => onAddReagent('acid')}
              className={`flex-1 min-w-[130px] px-3.5 py-2.5 bg-red-600 text-white rounded-lg text-xs md:text-sm font-bold shadow-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                state.animPhase !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:shadow-md'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>{isAr ? 'إضافة حمض (HCl)' : 'Add Acid (HCl)'}</span>
            </button>

            <button
              id="btn-add-base"
              disabled={state.animPhase !== 'idle'}
              onClick={() => onAddReagent('base')}
              className={`flex-1 min-w-[130px] px-3.5 py-2.5 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-bold shadow-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                state.animPhase !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:shadow-md'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>{isAr ? 'إضافة قاعدة (NaOH)' : 'Add Base (NaOH)'}</span>
            </button>
          </div>
        </div>

        {}
        <div className="bg-white/85 rounded-lg border border-slate-200 p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'درجة حرارة المحلول وسرعة حركة المائع:' : 'Solution Temperature & Fluid Speed:'}</span>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {state.temperature.toFixed(0)}°C ({((state.temperature * 9) / 5 + 32).toFixed(0)}°F)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="10"
              max="85"
              step="1"
              value={state.temperature}
              onChange={e => onSetTemperature(parseFloat(e.target.value))}
              className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {}
          <div className="grid grid-cols-4 gap-1.5">
            {tempPresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => onSetTemperature(preset.value)}
                className={`py-1 px-1.5 rounded text-[11px] font-semibold border transition-all text-center cursor-pointer ${
                  Math.abs(state.temperature - preset.value) < 2
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {}
          <div className="bg-white/90 p-3 rounded-lg border border-yellow-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-800">
                {isAr ? 'تركيز الكرومات (CrO₄²⁻)' : 'Chromate (CrO₄²⁻)'}
              </span>
              <span className="text-xs font-bold text-yellow-800 font-mono bg-yellow-100/70 px-1.5 py-0.5 rounded border border-yellow-300">
                {chromatePercent}%
              </span>
            </div>
            <div className="h-2.5 bg-yellow-50 rounded-full overflow-hidden border border-yellow-200">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${chromatePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-yellow-900/70 mt-1 font-medium">
              {isAr ? 'أصفر ليموني (حموضة منخفضة / حرارة أعلى)' : 'Lemon Yellow (Low [H+] / High Temp)'}
            </p>
          </div>

          {}
          <div className="bg-white/90 p-3 rounded-lg border border-orange-200 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-800">
                {isAr ? 'تركيز الدايكرومات (Cr₂O₇²⁻)' : 'Dichromate (Cr₂O₇²⁻)'}
              </span>
              <span className="text-xs font-bold text-orange-800 font-mono bg-orange-100/70 px-1.5 py-0.5 rounded border border-orange-300">
                {dichromatePercent}%
              </span>
            </div>
            <div className="h-2.5 bg-orange-50 rounded-full overflow-hidden border border-orange-200">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${dichromatePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-orange-900/70 mt-1 font-medium">
              {isAr ? 'برتقالي داكن (حموضة عالية / تبريد)' : 'Dark Orange (High [H+] / Cool Temp)'}
            </p>
          </div>
        </div>

        {}
        <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-700">
              {isAr ? 'سجل التجربة الحالية:' : 'Current Log:'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-slate-700">
              <strong className="text-red-600 font-bold">HCl:</strong> {state.acidDropsCount} {isAr ? 'قطرات' : 'drops'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-700">
              <strong className="text-blue-600 font-bold">NaOH:</strong> {state.baseDropsCount} {isAr ? 'قطرات' : 'drops'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-700 font-semibold">
              {isAr ? 'حركة المائع:' : 'Fluid Rate:'} {((state.temperature / 25) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

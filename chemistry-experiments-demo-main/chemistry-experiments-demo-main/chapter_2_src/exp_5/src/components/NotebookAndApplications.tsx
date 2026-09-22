import React from 'react';
import { BookOpen, Info, Activity, Flame, Waves, ArrowRightLeft, Thermometer } from 'lucide-react';
import { ExperimentState, Lang } from '../types';

interface NotebookAndApplicationsProps {
  state: ExperimentState;
  onTabChange: (tab: 'chatelier' | 'temperature' | 'fluid_dynamics') => void;
  lang: Lang;
}

export const NotebookAndApplications: React.FC<NotebookAndApplicationsProps> = ({
  state,
  onTabChange,
  lang,
}) => {
  const isAr = lang === 'ar';

  const getDynamicActionSummary = () => {
    if (state.lastAction === 'initial' || state.lastAction === 'reset') {
      return {
        action: isAr ? 'محلول كرومات البوتاسيوم في حالة اتزان ابتدائية عند درجة حرارة الغرفة.' : 'Potassium chromate solution at initial equilibrium state at room temperature.',
        effect: isAr ? 'يسود اللون الأصفر الليموني المميز لأيونات الكرومات (CrO₄²⁻).' : 'Characteristic lemon yellow color of chromate ions (CrO₄²⁻) dominates.',
        explanation: isAr
          ? 'المحلول يحتوي على أيونات الكرومات والدايكرومات في حالة اتزان ديناميكي. موضع الاتزان يقع حالياً باتجاه المتفاعلات (اليسار).'
          : 'Dynamic chemical equilibrium exists between chromate and dichromate ions, initially positioned toward reactants (left).',
      };
    }

    if (state.lastAction === 'acid_added') {
      return {
        action: isAr ? 'تمت إضافة قطرة من حمض الهيدروكلوريك (HCl).' : 'A drop of hydrochloric acid (HCl) was added.',
        effect: isAr ? 'نزلت القطرة وخلقت دوامة اضطراب موضعي، وتحول اللون تدريجياً نحو البرتقالي الداكن.' : 'The droplet created a localized vortex disturbance, progressively shifting color toward dark orange.',
        explanation: isAr
          ? 'إضافة HCl تزيد من تركيز أيونات الهيدروجين [H⁺]. وفقاً لقاعدة لوشاتيليه، ينزاح الاتزان نحو اليمين (النواتج ⟶) لاستهلاك الفائض، مما يزيد تركيز أيونات الدايكرومات Cr₂O₇²⁻ البرتقالية.'
          : 'Adding HCl increases [H⁺]. According to Le Chatelier’s principle, the system shifts right (products ⟶) to consume excess H⁺, producing orange Cr₂O₇²⁻ ions.',
      };
    }

    if (state.lastAction === 'base_added') {
      return {
        action: isAr ? 'تمت إضافة قطرة من هيدروكسيد الصوديوم (NaOH).' : 'A drop of sodium hydroxide (NaOH) was added.',
        effect: isAr ? 'انتشرت سحابة التفاعل القاعدي واستعاد المحلول لونه الأصفر الليموني.' : 'Basic reaction plume dispersed, restoring the lemon yellow solution color.',
        explanation: isAr
          ? 'تتحد أيونات الهيدروكسيد OH⁻ مع أيونات H⁺ لتكوين الماء (H⁺ + OH⁻ → H₂O)، فينخفض تركيز [H⁺]. ينزاح الاتزان نحو اليسار (المتفاعلات ⟵) لتعويض النقص، فتعود أيونات الكرومات الصفراء للتشكل.'
          : 'Added OH⁻ neutralizes H⁺ to form water (H⁺ + OH⁻ → H₂O), depleting [H⁺]. Equilibrium shifts left (reactants ⟵) to regenerate yellow CrO₄²⁻ ions.',
      };
    }

    if (state.lastAction === 'temp_changed') {
      const isHeating = state.temperature > 25;
      return {
        action: isAr
          ? `تم تعديل درجة الحرارة إلى ${state.temperature.toFixed(0)}°م.`
          : `Temperature adjusted to ${state.temperature.toFixed(0)}°C.`,
        effect: isAr
          ? isHeating
            ? 'ازدادت سرعة حركة وتموج جزيئات السائل مع انزياح طفيف نحو اللون الأصفر.'
            : 'انخفضت سرعة تموج السائل مع انزياح طفيف نحو اللون البرتقالي.'
          : isHeating
          ? 'Fluid wave speed and molecular agitation increased with a subtle shift toward yellow.'
          : 'Fluid wave speed slowed down with a subtle shift toward orange.',
        explanation: isAr
          ? 'التفاعل الأمامي طارد للحرارة (ΔH < 0). رفع درجة الحرارة يزود النظام بالطاقة فينزاح الاتزان نحو اليسار (المتفاعلات) لامتصاص الحرارة، بينما خفضها يزيحه نحو اليمين.'
          : 'The forward reaction is exothermic (ΔH < 0). Increasing temperature shifts equilibrium left toward reactants to absorb heat, while cooling shifts it right.',
      };
    }

    return { action: '', effect: '', explanation: '' };
  };

  const actionSummary = getDynamicActionSummary();

  return (
    <div
      id="notebook-bento-card"
      className="bg-[#fdfcf0] shadow-xs border border-slate-200 rounded-xl relative overflow-hidden flex flex-col min-h-[380px]"
    >
      {}
      <div
        className={`absolute top-0 bottom-0 w-px bg-red-200 z-10 pointer-events-none ${
          isAr ? 'right-10' : 'left-10'
        }`}
      />

      {}
      <div
        className="p-3.5 pb-2.5 border-b border-slate-200 bg-white/70 relative z-20 flex items-center justify-between"
        style={{
          paddingLeft: isAr ? '1.25rem' : '3.25rem',
          paddingRight: isAr ? '3.25rem' : '1.25rem',
        }}
      >
        {}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => onTabChange('chatelier')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              state.selectedTab === 'chatelier'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isAr ? 'تأثير التركيز' : 'Concentration'}</span>
          </button>

          <button
            onClick={() => onTabChange('temperature')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              state.selectedTab === 'temperature'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>{isAr ? 'تأثير الحرارة' : 'Temperature'}</span>
          </button>

          <button
            onClick={() => onTabChange('fluid_dynamics')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
              state.selectedTab === 'fluid_dynamics'
                ? 'bg-white text-indigo-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>{isAr ? 'حركة المائع' : 'Fluid Dynamics'}</span>
          </button>
        </div>
      </div>

      {}
      <div
        className="flex-1 w-full bg-[linear-gradient(transparent_31px,#e5e7eb_32px)] bg-[length:100%_32px] p-6 relative z-0 text-slate-800"
        style={{
          paddingLeft: isAr ? '1.5rem' : '3.5rem',
          paddingRight: isAr ? '3.5rem' : '1.5rem',
        }}
      >
        {}
        {state.selectedTab === 'chatelier' && (
          <div className="space-y-4">
            {}
            <div>
              <p className="text-xs text-slate-500 font-bold mb-1">
                {isAr ? 'معادلة الاتزان الأيوني:' : 'Ionic Equilibrium Equation:'}
              </p>
              <div className="font-serif text-sm md:text-base font-bold tracking-wide text-slate-900 dir-ltr bg-white/85 px-3 py-1.5 rounded-md border border-slate-200 flex items-center justify-between shadow-2xs">
                <span>2CrO₄²⁻ (أصفر) + 2H⁺</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs transition-colors font-mono ${
                    state.reactionDirection === 'forward'
                      ? 'bg-red-100 text-red-700 font-bold animate-pulse'
                      : state.reactionDirection === 'reverse'
                      ? 'bg-blue-100 text-blue-700 font-bold animate-pulse'
                      : 'text-slate-600'
                  }`}
                >
                  {state.reactionDirection === 'forward' ? '⟶' : state.reactionDirection === 'reverse' ? '⟵' : '⇌'}
                </span>
                <span>Cr₂O₇²⁻ (برتقالي) + H₂O</span>
              </div>
            </div>

            {}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 bg-white/60 p-2 rounded-md border border-slate-100">
                <span className="text-red-500 font-bold text-sm leading-tight">●</span>
                <div className="flex-1">
                  <span className="font-bold text-slate-700 block">{isAr ? 'الإجراء الحالي:' : 'Current Action:'}</span>
                  <span className="text-slate-600 leading-relaxed">{actionSummary.action}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/60 p-2 rounded-md border border-slate-100">
                <span className="text-indigo-500 font-bold text-sm leading-tight">●</span>
                <div className="flex-1">
                  <span className="font-bold text-slate-700 block">{isAr ? 'التأثير الملاحظ:' : 'Observed Effect:'}</span>
                  <span className="text-slate-600 leading-relaxed">{actionSummary.effect}</span>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAr ? 'تطبيق قاعدة لوشاتيليه:' : "Le Chatelier's Principle Application:"}</span>
                </p>
                <p className="text-slate-600 leading-relaxed">{actionSummary.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {}
        {state.selectedTab === 'temperature' && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-white/85 p-3 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'الديناميكا الحرارية للاتزان (Thermodynamics)' : 'Equilibrium Thermodynamics'}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {isAr
                  ? 'التفاعل الأمامي لتكوين الدايكرومات هو تفاعل طارد للحرارة (ΔH° < 0):'
                  : 'The forward formation of dichromate is an exothermic process (ΔH° < 0):'}
              </p>
              <div className="dir-ltr font-mono font-bold text-center bg-slate-50 py-1.5 my-2 rounded border border-slate-200 text-slate-800">
                2CrO₄²⁻ + 2H⁺ ⇌ Cr₂O₇²⁻ + H₂O + Heat (طاقة حرارية)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-amber-50/80 p-2.5 rounded-md border border-amber-200">
                <p className="font-bold text-amber-900 mb-1">
                  {isAr ? 'عند رفع درجة الحرارة (التسخين T ↑):' : 'Upon Heating (T ↑):'}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {isAr
                    ? 'ينزاح الاتزان نحو اليسار (المتفاعلات ⟵) لاستهلاك الطاقة الحرارية الزائدة، مما يزيد من تركيز الكرومات الأصفر (CrO₄²⁻).'
                    : 'Equilibrium shifts left (reactants ⟵) to consume thermal energy, favoring yellow CrO₄²⁻ ions.'}
                </p>
              </div>

              <div className="bg-blue-50/80 p-2.5 rounded-md border border-blue-200">
                <p className="font-bold text-blue-900 mb-1">
                  {isAr ? 'عند خفض درجة الحرارة (التبريد T ↓):' : 'Upon Cooling (T ↓):'}
                </p>
                <p className="text-slate-700 leading-relaxed">
                  {isAr
                    ? 'ينزاح الاتزان نحو اليمين (النواتج ⟶) لتعويض النقص الحراري، مما يزيد من تركيز الدايكرومات البرتقالي (Cr₂O₇²⁻).'
                    : 'Equilibrium shifts right (products ⟶) to release heat, favoring orange Cr₂O₇²⁻ ions.'}
                </p>
              </div>
            </div>

            <div className="bg-white/80 p-2.5 rounded-md border border-slate-200">
              <span className="font-bold text-slate-800 block mb-0.5">
                {isAr ? 'حالة النظام الحالية:' : 'Current System Status:'}
              </span>
              <span className="text-slate-600">
                {isAr
                  ? `درجة الحرارة: ${state.temperature.toFixed(0)}°م | سرعة الطاقة الحركية الجزيئية: ${((state.temperature / 25) * 100).toFixed(0)}% مقارنة بحرارة الغرفة القياسية.`
                  : `Temperature: ${state.temperature.toFixed(0)}°C | Molecular kinetic rate: ${((state.temperature / 25) * 100).toFixed(0)}% relative to standard 25°C.`}
              </span>
            </div>
          </div>
        )}

        {}
        {state.selectedTab === 'fluid_dynamics' && (
          <div className="space-y-3 text-xs">
            <div className="bg-white/85 p-3 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-900 text-sm">
                <Waves className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'الفيزياء المائية والحركة الجزيئية للسائل' : 'Hydrodynamics & Molecular Kinetics'}</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {isAr
                  ? 'يتحرك السائل في الكأس بحركة موجية وتذبذب حراري دائم ناتج عن الحركة البراونية (Brownian Motion) وتيارات الحمل الحراري (Convection Currents):'
                  : 'Liquid in the vessel exhibits perpetual surface wave oscillation and thermal Brownian motion governed by convection and kinetic theory:'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="bg-white/70 p-2.5 rounded-md border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">
                  {isAr ? '1. تأثير درجة الحرارة على حركة السائل (Kinetic Speed v ∝ √T):' : '1. Temperature Effect on Fluid Motion (v ∝ √T):'}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {isAr
                    ? 'بارتفاع درجة الحرارة تزداد الطاقة الحركية لجسيمات المائع وتتسارع معدلات التصادم وتيارات الحمل الصاعدة، وتزداد سعة وتردد التموجات السطحية بشكل ملحوظ.'
                    : 'Higher temperature elevates average molecular kinetic energy, accelerating collision frequency, convection cells, and surface wave propagation.'}
                </p>
              </div>

              <div className="bg-white/70 p-2.5 rounded-md border border-slate-200">
                <span className="font-bold text-slate-800 block mb-0.5">
                  {isAr ? '2. ديناميكا سقوط القطرة (Drop Impact & Dispersion):' : '2. Droplet Impact & Dispersion Dynamics:'}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {isAr
                    ? 'عند اصطدام القطرة بالسطح يحدث قص هيدروديناميكي موضعي وتتشكل دوامة انتشار حلقية (Vortex Ring) تنقل المادة الكيميائية إلى عمق السائل حتى يتم التجانس عبر الانتشار الأيوني.'
                    : 'Drop impact generates hydrodynamic shear, surface capillary ripples, and a descending vortex plume transferring reagent throughout the fluid.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

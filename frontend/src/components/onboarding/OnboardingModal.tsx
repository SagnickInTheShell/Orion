import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, Volume2, Camera, ShieldCheck, X } from 'lucide-react';
import { User, PersonalProfile } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (name: string, sensitivities: Partial<PersonalProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>('Alex');

  // Step 2 triggers
  const [triggers, setTriggers] = useState<string[]>([
    'High noise',
    'Crowds',
    'Unexpected changes',
    'Unfamiliar places'
  ]);

  // Step 3 strategies
  const [strategies, setStrategies] = useState<string[]>([
    'Quiet space',
    'Visual schedule',
    'Preparation preview'
  ]);

  const triggerOptions = [
    'High noise',
    'Crowds',
    'Bright environments',
    'Unexpected changes',
    'Unfamiliar places',
    'Social situations',
    'Long waiting periods'
  ];

  const strategyOptions = [
    'Quiet space',
    'Visual schedule',
    'Preparation preview',
    'Familiar person',
    'Break',
    'Reduced sensory input'
  ];

  const toggleTrigger = (item: string) => {
    if (triggers.includes(item)) {
      setTriggers(triggers.filter(t => t !== item));
    } else {
      setTriggers([...triggers, item]);
    }
  };

  const toggleStrategy = (item: string) => {
    if (strategies.includes(item)) {
      setStrategies(strategies.filter(s => s !== item));
    } else {
      setStrategies([...strategies, item]);
    }
  };

  const handleFinish = () => {
    // Map selected triggers to baseline sensitivity weights
    const sensitivities: Partial<PersonalProfile> = {
      noise_sensitivity: triggers.includes('High noise') ? 0.88 : 0.50,
      crowd_sensitivity: triggers.includes('Crowds') ? 0.82 : 0.50,
      brightness_sensitivity: triggers.includes('Bright environments') ? 0.75 : 0.45,
      routine_change_sensitivity: triggers.includes('Unexpected changes') ? 0.90 : 0.50,
      unfamiliar_location_sensitivity: triggers.includes('Unfamiliar places') ? 0.75 : 0.45
    };
    onComplete(name, sensitivities);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel-glow w-full max-w-lg rounded-2xl p-6 border-slate-700 bg-slate-900 shadow-2xl relative">
        
        {/* Header Progress */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Personal Setup Wizard (Step {step} of 4)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Welcome to ORION</h3>
              <p className="text-xs text-slate-400 mt-1">
                ORION builds an individual profile to personalize support for your daily environments.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                What is your name or preferred nickname?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
              💡 "It doesn't learn autism. It learns the individual."
            </div>
          </div>
        )}

        {/* Step 2: Difficult Situations */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Sensory & Contextual Factors</h3>
              <p className="text-xs text-slate-400 mt-1">
                Which situations may be difficult or sensory-taxing for you?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {triggerOptions.map((opt) => {
                const isSelected = triggers.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleTrigger(opt)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/15 text-sky-200'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                        isSelected ? 'bg-sky-500 border-sky-400 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Helpful Strategies */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Support Strategies</h3>
              <p className="text-xs text-slate-400 mt-1">
                Which proactive strategies usually help you recover or stay comfortable?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {strategyOptions.map((opt) => {
                const isSelected = strategies.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleStrategy(opt)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200'
                        : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                        isSelected ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="truncate">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Sensor Permissions */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">Optional Environmental Sensors</h3>
              <p className="text-xs text-slate-400 mt-1">
                ORION can derive ambient acoustic and lighting levels automatically if you allow it.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Volume2 className="h-4 w-4 text-sky-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Microphone Volume Context</span>
                    <span className="text-[10px] text-slate-400">Measures ambient noise level in browser memory</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Ready
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Camera className="h-4 w-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Camera Lighting Context</span>
                    <span className="text-[10px] text-slate-400">Extracts brightness & activity deltas only</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Ready
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>You can enable, disable, or adjust sensors anytime in the Environment tab.</span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-5">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <span>Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>Finish & Enter ORION</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

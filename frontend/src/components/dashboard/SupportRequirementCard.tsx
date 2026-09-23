import React from 'react';
import { ShieldAlert, AlertCircle, CheckCircle2, Sliders, Info } from 'lucide-react';
import { PredictionResponse } from '../../types';

interface SupportRequirementCardProps {
  prediction: PredictionResponse | null;
  onOpenWhatIf: () => void;
  isLoading?: boolean;
}

export const SupportRequirementCard: React.FC<SupportRequirementCardProps> = ({
  prediction,
  onOpenWhatIf,
  isLoading = false
}) => {
  if (isLoading || !prediction) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] animate-pulse">
        <div className="h-4 w-48 bg-slate-800 rounded mb-4"></div>
        <div className="h-12 w-36 bg-slate-800 rounded mb-2"></div>
        <div className="h-4 w-28 bg-slate-800 rounded"></div>
      </div>
    );
  }

  const { support_level, support_score, confidence, contributing_factors, reasons } = prediction;

  const levelConfig = {
    LOW: {
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/25',
      glow: 'shadow-emerald-500/10',
      icon: CheckCircle2,
      desc: 'Environmental factors are currently within comfortable baseline thresholds.'
    },
    MEDIUM: {
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/25',
      glow: 'shadow-amber-500/10',
      icon: AlertCircle,
      desc: 'Sensory or routine demands are elevated. Proactive micro-accommodations recommended.'
    },
    HIGH: {
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/25',
      glow: 'shadow-rose-500/10',
      icon: ShieldAlert,
      desc: 'Multiple sensory stressors and/or unexpected changes detected. Immediate accommodations advised.'
    }
  }[support_level];

  const Icon = levelConfig.icon;

  return (
    <div className={`glass-panel-glow rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${levelConfig.glow}`}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase font-mono">
            CURRENT SUPPORT REQUIREMENT
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalized estimation derived from Alex's individual context sensitivity profile.
          </p>
        </div>

        {/* Confidence metric */}
        <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400">Confidence:</span>
          <span className="text-sm font-bold font-mono text-sky-400">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      </div>

      {/* Main Requirement Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        
        {/* Left Level Badge */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${levelConfig.bgColor} mb-2`}>
            <Icon className={`h-6 w-6 ${levelConfig.color}`} />
            <span className={`text-3xl font-black tracking-tight font-mono ${levelConfig.color}`}>
              {support_level}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs text-slate-400">Support Score Index:</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {(support_score * 100).toFixed(1)} / 100
            </span>
          </div>

          <p className="text-xs text-slate-300 mt-2 max-w-sm">
            {levelConfig.desc}
          </p>
        </div>

        {/* Right Contributing Factors Breakdown */}
        <div className="lg:col-span-7 bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center justify-between">
            <span>Primary Contributing Factors</span>
            <span className="text-[10px] text-slate-500 font-mono">Sensitivity-Weighted</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(contributing_factors).map(([key, val]) => {
              const labelMap: Record<string, string> = {
                noise: 'Acoustic Load',
                crowd: 'Crowd Density',
                brightness: 'Lighting / Glare',
                routine_change: 'Routine Shift',
                unfamiliar_location: 'Location Novelty'
              };
              const pct = Math.min(100, Math.round(val * 200)); // Scaled visualization
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">{labelMap[key] || key}</span>
                    <span className="font-mono text-slate-300">{Math.round(val * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${
                        pct >= 60 ? 'bg-rose-400' : pct >= 35 ? 'bg-amber-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Key Reasons & What-If Action Footer */}
      <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Traceable Drivers:
          </div>
          <ul className="text-xs text-slate-300 space-y-0.5 list-disc list-inside">
            {reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="line-clamp-1">{r}</li>
            ))}
          </ul>
        </div>

        <button
          onClick={onOpenWhatIf}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-semibold transition-all whitespace-nowrap shadow-sm hover:scale-[1.02]"
        >
          <Sliders className="h-4 w-4" />
          <span>Simulate Support Options</span>
        </button>
      </div>

      {/* Medical Boundary Disclaimer */}
      <div className="mt-4 pt-2 border-t border-slate-900 flex items-center gap-1.5 text-[10px] text-slate-500">
        <Info className="h-3 w-3 shrink-0" />
        <span>
          Responsible AI Boundary: ORION estimates personalized support requirement, not medical diagnosis or clinical probability.
        </span>
      </div>

    </div>
  );
};

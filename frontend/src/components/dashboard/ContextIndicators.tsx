import React from 'react';
import { Volume2, Users, Sun, Zap, CalendarClock, Compass } from 'lucide-react';
import { ContextData } from '../../types';

interface ContextIndicatorsProps {
  context: ContextData;
  isMicActive?: boolean;
  isCamActive?: boolean;
}

export const ContextIndicators: React.FC<ContextIndicatorsProps> = ({
  context,
  isMicActive = false,
  isCamActive = false
}) => {
  const getIntensityBadge = (val: number) => {
    if (val >= 0.70) return { label: 'HIGH', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    if (val >= 0.40) return { label: 'MED', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'LOW', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  const noiseBadge = getIntensityBadge(context.noise_level);
  const crowdBadge = getIntensityBadge(context.crowd_level);
  const brightnessBadge = getIntensityBadge(context.brightness);
  const activityBadge = getIntensityBadge(context.activity_level);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      
      {/* Noise Level */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
            <Volume2 className="h-3.5 w-3.5 text-sky-400" />
            Noise
          </span>
          {isMicActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Web Audio active" />
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-100">
            {Math.round(context.noise_level * 100)}%
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${noiseBadge.color}`}>
            {noiseBadge.label}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-sky-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${context.noise_level * 100}%` }}
          />
        </div>
      </div>

      {/* Crowd Level */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            Crowd
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-100">
            {Math.round(context.crowd_level * 100)}%
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${crowdBadge.color}`}>
            {crowdBadge.label}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${context.crowd_level * 100}%` }}
          />
        </div>
      </div>

      {/* Brightness */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
            <Sun className="h-3.5 w-3.5 text-amber-400" />
            Lighting
          </span>
          {isCamActive && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" title="Live Camera active" />
          )}
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-100">
            {Math.round(context.brightness * 100)}%
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${brightnessBadge.color}`}>
            {brightnessBadge.label}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${context.brightness * 100}%` }}
          />
        </div>
      </div>

      {/* Activity Level */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
            Activity
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-100">
            {Math.round(context.activity_level * 100)}%
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${activityBadge.color}`}>
            {activityBadge.label}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-teal-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${context.activity_level * 100}%` }}
          />
        </div>
      </div>

      {/* Routine State */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5 text-purple-400" />
            Routine
          </span>
        </div>
        <div className="mt-1">
          {context.routine_change ? (
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              CHANGED
            </span>
          ) : (
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Expected
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-2">
          {context.routine_change ? 'Schedule shift detected' : 'Standard schedule'}
        </span>
      </div>

      {/* Location State */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-medium uppercase tracking-wider flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            Location
          </span>
        </div>
        <div className="mt-1">
          {context.unfamiliar_location ? (
            <span className="inline-block text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              UNFAMILIAR
            </span>
          ) : (
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Familiar
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 mt-2">
          {context.unfamiliar_location ? 'New physical space' : 'Known environment'}
        </span>
      </div>

    </div>
  );
};

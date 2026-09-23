import React from 'react';
import { Sliders, Volume2, Users, Sun, Zap, CalendarClock, Compass, RotateCcw } from 'lucide-react';
import { ContextData } from '../../types';

interface LiveSimulationSlidersProps {
  context: ContextData;
  onChange: (updated: ContextData) => void;
}

export const LiveSimulationSliders: React.FC<LiveSimulationSlidersProps> = ({
  context,
  onChange
}) => {
  const updateField = (field: keyof ContextData, value: any) => {
    onChange({
      ...context,
      [field]: value
    });
  };

  const applyPreset = (preset: Partial<ContextData>) => {
    onChange({
      ...context,
      ...preset
    });
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              SIMULATION / DEMO CONTROLS
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Judge control panel: Adjust environmental factors to observe real-time support requirement recalculations.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <button
            onClick={() => applyPreset({ noise_level: 0.20, crowd_level: 0.15, brightness: 0.40, routine_change: false, unfamiliar_location: false })}
            className="text-[10px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Quiet Baseline
          </button>
          <button
            onClick={() => applyPreset({ noise_level: 0.88, crowd_level: 0.85, brightness: 0.75, routine_change: false, unfamiliar_location: false })}
            className="text-[10px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Loud Cafeteria
          </button>
          <button
            onClick={() => applyPreset({ noise_level: 0.55, crowd_level: 0.45, brightness: 0.50, routine_change: true, unfamiliar_location: true })}
            className="text-[10px] font-medium px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Routine Shift
          </button>
          <button
            onClick={() => applyPreset({ noise_level: 0.90, crowd_level: 0.88, brightness: 0.85, routine_change: true, unfamiliar_location: true })}
            className="text-[10px] font-medium px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
          >
            High Sensory Load
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Noise Slider */}
        <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-sky-400" />
              Noise Level
            </span>
            <span className="font-mono font-bold text-sky-400">
              {Math.round(context.noise_level * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.noise_level}
            onChange={(e) => updateField('noise_level', parseFloat(e.target.value))}
            className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Crowd Slider */}
        <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              Crowd Density
            </span>
            <span className="font-mono font-bold text-indigo-400">
              {Math.round(context.crowd_level * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.crowd_level}
            onChange={(e) => updateField('crowd_level', parseFloat(e.target.value))}
            className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Brightness Slider */}
        <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              Lighting / Glare
            </span>
            <span className="font-mono font-bold text-amber-400">
              {Math.round(context.brightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.brightness}
            onChange={(e) => updateField('brightness', parseFloat(e.target.value))}
            className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Activity Slider */}
        <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-teal-400" />
              Activity Level
            </span>
            <span className="font-mono font-bold text-teal-400">
              {Math.round(context.activity_level * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.activity_level}
            onChange={(e) => updateField('activity_level', parseFloat(e.target.value))}
            className="w-full accent-teal-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

      </div>

      {/* Discrete State Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-800/80">
        
        {/* Routine Change Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <div className="flex items-center space-x-2">
            <CalendarClock className="h-4 w-4 text-purple-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">Routine Change</div>
              <div className="text-[10px] text-slate-400">Unexpected schedule or task shift</div>
            </div>
          </div>
          <button
            onClick={() => updateField('routine_change', !context.routine_change)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              context.routine_change
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {context.routine_change ? 'ACTIVE (ON)' : 'OFF'}
          </button>
        </div>

        {/* Unfamiliar Location Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <div className="flex items-center space-x-2">
            <Compass className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-slate-200">Unfamiliar Location</div>
              <div className="text-[10px] text-slate-400">New room, building, or route</div>
            </div>
          </div>
          <button
            onClick={() => updateField('unfamiliar_location', !context.unfamiliar_location)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              context.unfamiliar_location
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {context.unfamiliar_location ? 'ACTIVE (ON)' : 'OFF'}
          </button>
        </div>

      </div>

    </div>
  );
};

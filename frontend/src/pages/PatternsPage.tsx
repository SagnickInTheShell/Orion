import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, Sparkles, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { PatternsData } from '../types';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface PatternsPageProps {
  userId: number;
}

export const PatternsPage: React.FC<PatternsPageProps> = ({ userId }) => {
  const [patterns, setPatterns] = useState<PatternsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPatterns = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPatterns(userId);
      setPatterns(data);
    } catch (err) {
      console.error("Failed to load patterns", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [userId]);

  if (isLoading || !patterns) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 animate-pulse">
        Loading personal patterns and historical effectiveness data...
      </div>
    );
  }

  const effectivenessChartData = patterns.effectiveness.map((item) => ({
    name: item.name,
    effectiveness: item.effectiveness_percentage,
    category: item.category,
    samples: item.sample_count
  }));

  const contextChartData = patterns.context_distribution.map((item) => ({
    name: item.factor,
    pct: item.pct,
    occurrences: item.occurrences
  }));

  return (
    <div className="space-y-6">
      
      {/* Header with Demo Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-400" />
              My Patterns & Strategy Effectiveness
            </h1>
            {patterns.is_demo_profile && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Demo Profile Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Empirical effectiveness aggregated from Alex's recorded feedback on interventions across {patterns.total_recorded_situations} situations.
          </p>
        </div>

        <button
          onClick={fetchPatterns}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Sensitivities Breakdown (Personal Digital Twin Profile) */}
      <div className="glass-panel rounded-2xl p-5 border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Personal Digital Twin — Sensitivity Profile (v{patterns.profile_version})
          </span>
          <span className="text-[10px] text-slate-500">Learned Baseline Weights</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(patterns.sensitivities).map(([key, val]) => {
            const labelMap: Record<string, string> = {
              noise: 'Noise Sensitivity',
              crowd: 'Crowd Sensitivity',
              brightness: 'Lighting Sensitivity',
              routine_change: 'Routine Change Sensitivity',
              unfamiliar_location: 'Location Novelty Sensitivity'
            };
            return (
              <div key={key} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block line-clamp-1">{labelMap[key] || key}</span>
                <span className="text-base font-bold font-mono text-sky-400 block mt-1">
                  {Math.round(val * 100)}%
                </span>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${val * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Intervention Effectiveness Ranking */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border-slate-800 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Intervention Effectiveness History
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Percentage of times each support strategy was rated helpful or very helpful by Alex.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={effectivenessChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}% Effectiveness`, 'Score']}
                />
                <Bar dataKey="effectiveness" fill="#38bdf8" radius={[0, 4, 4, 0]}>
                  {effectivenessChartData.map((_, index) => (
                    <Cell key={`eff-cell-${index}`} fill={index === 0 ? '#38bdf8' : index === 1 ? '#818cf8' : '#34d399'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {patterns.effectiveness.slice(0, 4).map((eff) => (
              <div key={eff.id} className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-300">{eff.name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-mono">({eff.sample_count} samples)</span>
                  <span className="font-mono font-bold text-sky-400">{eff.effectiveness_percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Common Context Factors */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border-slate-800 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Common Contextual Triggers
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Frequency distribution across recorded historical contexts.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {patterns.context_distribution.map((ctx, idx) => (
              <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{ctx.factor}</span>
                  <span className="font-mono font-bold text-sky-400">{ctx.pct}% ({ctx.occurrences} events)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-400 to-indigo-400 h-1.5 rounded-full" style={{ width: `${ctx.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Seed Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1 font-semibold text-amber-400">
              <Info className="h-3 w-3" />
              <span>Transparency Disclosure</span>
            </div>
            <p>
              These historical values are seeded demo data for hackathon demonstration. ORION never pretends synthetic demo data represents real clinical measurements.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

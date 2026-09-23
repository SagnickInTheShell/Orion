import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, AlertCircle, ArrowDownRight, Check, BarChart2 } from 'lucide-react';
import { ContextData, SimulationResponse } from '../types';
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

interface WhatIfPageProps {
  userId: number;
  currentContext: ContextData;
}

export const WhatIfPage: React.FC<WhatIfPageProps> = ({ userId, currentContext }) => {
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([
    'none',
    'quiet_break',
    'visual_schedule',
    'quiet_break+visual_schedule',
    'preparation_preview'
  ]);

  const candidateOptions = [
    { id: 'quiet_break', label: 'Quiet Break' },
    { id: 'visual_schedule', label: 'Visual Schedule' },
    { id: 'preparation_preview', label: 'Preparation Preview' },
    { id: 'noise_reduction', label: 'Noise Reduction' },
    { id: 'familiar_person', label: 'Familiar Person' },
    { id: 'reduced_sensory_exposure', label: 'Reduced Sensory Exposure' },
    { id: 'early_arrival', label: 'Early Arrival' },
    { id: 'step_by_step_breakdown', label: 'Step-by-Step Breakdown' }
  ];

  const fetchSimulation = async () => {
    setIsLoading(true);
    try {
      const resp = await api.runSimulation(userId, currentContext, selectedInterventions);
      setSimulation(resp);
    } catch (err) {
      console.error("Simulation request failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, [userId, currentContext, selectedInterventions]);

  const toggleOption = (id: string) => {
    if (selectedInterventions.includes(id)) {
      if (selectedInterventions.length > 2) {
        setSelectedInterventions(selectedInterventions.filter(item => item !== id));
      }
    } else {
      setSelectedInterventions([...selectedInterventions, id]);
    }
  };

  const chartData = simulation?.scenarios.map((sc) => ({
    name: sc.name.length > 20 ? sc.name.substring(0, 18) + '...' : sc.name,
    fullName: sc.name,
    score: Math.round(sc.support_score * 100),
    level: sc.level,
    reduction: Math.round(sc.score_reduction * 100)
  })) || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-sky-400" />
          What-If Scenario Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore counterfactual support scenarios to see how combinations of accommodations reduce projected support demand.
        </p>
      </div>

      {/* Current Situation Strip */}
      <div className="glass-panel rounded-2xl p-4 border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-2">
          Current Baseline Context
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Acoustic Noise</span>
            <span className="font-mono font-bold text-sky-400">{Math.round(currentContext.noise_level * 100)}%</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Crowd Density</span>
            <span className="font-mono font-bold text-indigo-400">{Math.round(currentContext.crowd_level * 100)}%</span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Routine Status</span>
            <span className={`font-bold ${currentContext.routine_change ? 'text-rose-400' : 'text-slate-300'}`}>
              {currentContext.routine_change ? 'Changed' : 'Standard'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Physical Space</span>
            <span className={`font-bold ${currentContext.unfamiliar_location ? 'text-amber-400' : 'text-slate-300'}`}>
              {currentContext.unfamiliar_location ? 'Unfamiliar' : 'Familiar'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Scenarios Comparison Table / Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Simulated Support Requirements
            </h3>
            <span className="text-[10px] text-slate-400">Baseline Level: {simulation?.baseline_level}</span>
          </div>

          <div className="space-y-3">
            {simulation?.scenarios.map((sc, i) => {
              const isBase = sc.intervention_keys.includes('none');
              const levelColor = {
                LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                HIGH: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              }[sc.level];

              return (
                <div
                  key={i}
                  className={`glass-panel rounded-xl p-4 transition-all duration-200 border ${
                    isBase ? 'border-slate-700 bg-slate-900/50' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-100">
                          {sc.name}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelColor}`}>
                          {sc.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {sc.explanation}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-mono font-bold text-sky-400">
                        {Math.round(sc.support_score * 100)}%
                      </div>
                      {!isBase && (
                        <div className="text-[11px] text-emerald-400 flex items-center justify-end gap-0.5 font-medium">
                          <ArrowDownRight className="h-3 w-3" />
                          <span>-{Math.round(sc.score_reduction * 100)}% load</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Comparative Chart & Intervention Toggles */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Visual Chart */}
          <div className="glass-panel rounded-2xl p-5 border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-sky-400" />
              Comparative Impact Visualizer
            </h4>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const color = entry.level === 'HIGH' ? '#f43f5e' : entry.level === 'MEDIUM' ? '#fbbf24' : '#34d399';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-1">
              Simulated Support Index (Lower is calmer / better managed)
            </div>
          </div>

          {/* Intervention Selectors to include in simulation */}
          <div className="glass-panel rounded-2xl p-5 border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block mb-2">
              Toggle Interventions in Simulation
            </span>

            <div className="flex flex-wrap gap-2">
              {candidateOptions.map((opt) => {
                const isSelected = selectedInterventions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Mandatory Specification Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-sky-400 shrink-0" />
        <span>
          “Simulation based on this user's historical context and intervention feedback. Not a medical probability.”
        </span>
      </div>

    </div>
  );
};

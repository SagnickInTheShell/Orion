import React from 'react';
import { ContextIndicators } from '../components/dashboard/ContextIndicators';
import { SupportRequirementCard } from '../components/dashboard/SupportRequirementCard';
import { RecommendationList } from '../components/dashboard/RecommendationList';
import { ExplainabilitySection } from '../components/dashboard/ExplainabilitySection';
import { LiveSimulationSliders } from '../components/dashboard/LiveSimulationSliders';
import { ContextData, PredictionResponse, RecommendationItem, ContextResponse } from '../types';
import { Sparkles, History as HistoryIcon, ArrowUpRight } from 'lucide-react';

interface DashboardPageProps {
  context: ContextData;
  setContext: (ctx: ContextData) => void;
  prediction: PredictionResponse | null;
  recommendations: RecommendationItem[];
  explanation: string;
  onOpenWhatIf: () => void;
  onOpenFeedback: (item: RecommendationItem) => void;
  recentHistory: ContextResponse[];
  onSelectHistoryContext: (histCtx: ContextResponse) => void;
  isLoading?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  context,
  setContext,
  prediction,
  recommendations,
  explanation,
  onOpenWhatIf,
  onOpenFeedback,
  recentHistory,
  onSelectHistoryContext,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Context Telemetry Strip */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Layer 1 & 2: Active Environmental Context
          </h2>
          <span className="text-[11px] text-sky-400/80">Continuous Normalized Feed</span>
        </div>
        <ContextIndicators context={context} />
      </section>

      {/* 2. Interactive Simulation Sliders */}
      <section>
        <LiveSimulationSliders context={context} onChange={setContext} />
      </section>

      {/* 3. Central Intelligence Grid (Layers 3 & 4) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Support Requirement Prediction Card */}
        <div className="lg:col-span-7 space-y-6">
          <SupportRequirementCard
            prediction={prediction}
            onOpenWhatIf={onOpenWhatIf}
            isLoading={isLoading}
          />

          {/* Traceable Explainability ('Why?') */}
          <ExplainabilitySection
            explanation={explanation}
            recommendations={recommendations}
          />
        </div>

        {/* Recommended Proactive Interventions */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-sky-400" />
              Recommended Proactive Support
            </h3>
            <span className="text-[10px] text-slate-400">Ranked by Personal Efficacy</span>
          </div>

          <RecommendationList
            recommendations={recommendations}
            onProvideFeedback={onOpenFeedback}
            isLoading={isLoading}
          />
        </div>

      </section>

      {/* 4. Recent Historical Contexts & Outcomes */}
      <section className="glass-panel rounded-2xl p-5 border-slate-800">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <HistoryIcon className="h-4 w-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Recent Contexts & Past Situations
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click any past situation to simulate and compare</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentHistory.slice(0, 4).map((hist) => (
            <div
              key={hist.id}
              onClick={() => onSelectHistoryContext(hist)}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-sky-500/30 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                <span className="truncate group-hover:text-sky-300 transition-colors">
                  {hist.event_type || 'General Context'}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-sky-400 shrink-0" />
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-2">
                <span>Noise: {Math.round(hist.noise_level * 100)}%</span>
                <span>•</span>
                <span>Crowd: {Math.round(hist.crowd_level * 100)}%</span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {hist.routine_change && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">
                    Routine Shift
                  </span>
                )}
                {hist.unfamiliar_location && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                    Unfamiliar Space
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

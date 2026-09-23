import React from 'react';
import { HelpCircle, History, Sparkles, Check, ArrowRight } from 'lucide-react';
import { RecommendationItem } from '../../types';

interface ExplainabilitySectionProps {
  explanation: string;
  recommendations: RecommendationItem[];
}

export const ExplainabilitySection: React.FC<ExplainabilitySectionProps> = ({
  explanation,
  recommendations
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border-sky-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
      
      <div className="flex items-center space-x-2 text-sky-400 mb-3">
        <HelpCircle className="h-4 w-4" />
        <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
          WHY THIS RECOMMENDATION?
        </h3>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        {explanation}
      </p>

      {/* Traceable Evidence Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
        {recommendations.slice(0, 2).map((rec) => (
          <div key={rec.intervention_id} className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-medium text-slate-200 mb-1">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-sky-400" />
                {rec.intervention}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {Math.round(rec.score * 100)}% match
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              {rec.reason}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>No black-box guesses. Scores derive transparently from Alex's past feedback.</span>
        <span className="text-sky-400 font-medium">Closed-Loop Learning</span>
      </div>

    </div>
  );
};

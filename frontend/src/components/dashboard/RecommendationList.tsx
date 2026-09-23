import React from 'react';
import { RecommendationItem } from '../../types';
import { CheckCircle2, MessageSquarePlus, Sparkles, Tag } from 'lucide-react';

interface RecommendationListProps {
  recommendations: RecommendationItem[];
  onProvideFeedback: (item: RecommendationItem) => void;
  isLoading?: boolean;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  onProvideFeedback,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel rounded-xl p-4 animate-pulse h-24"></div>
        ))}
      </div>
    );
  }

  const getCategoryBadge = (cat: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      sensory: { bg: 'bg-cyan-500/10 border-cyan-500/20', text: 'text-cyan-400' },
      routine: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' },
      preparation: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
      social: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' }
    };
    const c = map[cat] || { bg: 'bg-slate-800 border-slate-700', text: 'text-slate-300' };
    return (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${c.bg} ${c.text} capitalize`}>
        {cat}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {recommendations.map((item, index) => {
        const scorePct = Math.round(item.score * 100);

        return (
          <div
            key={item.intervention_id}
            className="glass-panel hover:border-sky-500/40 rounded-xl p-4 transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Left: Rank, Name, Description & Reason */}
            <div className="flex items-start space-x-3.5">
              <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 font-bold font-mono text-sm shrink-0">
                #{item.rank}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                    {item.intervention}
                  </h4>
                  {getCategoryBadge(item.category)}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center space-x-1.5 text-[11px] text-sky-400/90 font-medium pt-0.5">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>{item.reason}</span>
                </div>
              </div>
            </div>

            {/* Right: Recommendation Score & Feedback Button */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 shrink-0 gap-2">
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400">Recommendation score:</div>
                <div className="text-base font-bold font-mono text-sky-400">
                  {scorePct}%
                </div>
              </div>

              <button
                onClick={() => onProvideFeedback(item)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 hover:border-sky-500/30 text-xs font-medium transition-all"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>Provide Feedback</span>
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
};

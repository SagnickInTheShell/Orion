import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import { RecommendationItem, FeedbackResponse } from '../../types';
import { api } from '../../services/api';

interface FeedbackModalProps {
  item: RecommendationItem | null;
  onClose: () => void;
  onFeedbackRecorded: (response: FeedbackResponse) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  item,
  onClose,
  onFeedbackRecorded
}) => {
  if (!item) return null;

  const [rating, setRating] = useState<number>(4); // default Very Helpful for demo
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<FeedbackResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ratingOptions = [
    { val: 1, label: 'Not helpful', desc: 'Score adjusts downward', icon: ThumbsDown, color: 'hover:border-rose-500/50 hover:bg-rose-500/10' },
    { val: 2, label: 'Slightly helpful', desc: 'Minimal score change', icon: HelpCircle, color: 'hover:border-amber-500/50 hover:bg-amber-500/10' },
    { val: 3, label: 'Helpful', desc: 'Positive calibration', icon: Check, color: 'hover:border-sky-500/50 hover:bg-sky-500/10' },
    { val: 4, label: 'Very helpful', desc: 'Boosts priority in similar contexts', icon: ThumbsUp, color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.recommendation_id) {
      setError("No persisted recommendation ID found. Please try again.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const resp = await api.submitFeedback({
        recommendation_id: item.recommendation_id,
        rating,
        comment: comment || undefined
      });
      setResult(resp);
      onFeedbackRecorded(resp);
    } catch (err: any) {
      setError(err.message || "Failed to record feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel-glow w-full max-w-lg rounded-2xl p-6 border-slate-700 bg-slate-900 shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Closed-Loop Learning</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            Strategy Feedback: {item.intervention}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Your feedback updates Alex's Personal Digital Twin weights and recalibrates future intervention rankings.
          </p>
        </div>

        {result ? (
          /* Success Screen displaying learning update */
          <div className="space-y-4 py-3">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <div className="flex items-center space-x-2 font-bold text-sm mb-1">
                <Check className="h-5 w-5 text-emerald-400" />
                <span>Personal Model Calibrated</span>
              </div>
              <p className="text-xs text-slate-300">
                {result.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Previous Score</span>
                <span className="font-mono text-base font-bold text-slate-300">
                  {Math.round(result.previous_score * 100)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Updated Score</span>
                <span className="font-mono text-base font-bold text-sky-400">
                  {Math.round(result.updated_score * 100)}%
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all"
              >
                Close & View Updated Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                How helpful was this support strategy in this context?
              </label>

              <div className="grid grid-cols-2 gap-2">
                {ratingOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = rating === opt.val;
                  return (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setRating(opt.val)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-sky-400 bg-sky-500/15 shadow-sm'
                          : 'border-slate-800 bg-slate-950/50 ' + opt.color
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-sky-200' : 'text-slate-200'}`}>
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Contextual Observation (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Taking 5 mins in the side hallway helped reduce acoustic fatigue before the presentation..."
                className="w-full h-20 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500">
                Uses transparent formula: score = old × 0.8 + rating × 0.2
              </span>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Updating...' : 'Submit & Update Model'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

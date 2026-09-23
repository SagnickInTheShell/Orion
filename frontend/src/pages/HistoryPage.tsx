import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Volume2, Users, Sun, CheckCircle2, RefreshCw } from 'lucide-react';
import { ContextResponse } from '../types';
import { api } from '../services/api';

interface HistoryPageProps {
  userId: number;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ userId }) => {
  const [history, setHistory] = useState<ContextResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContextHistory(userId);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load context history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400" />
            Historical Contexts & Learning Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit of environmental contexts, accommodations provided, and recorded feedback outcomes.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 animate-pulse">
          Loading historical context records...
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
          No historical contexts recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-xl p-4 border-slate-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200">
                    {item.event_type || 'General Context'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID #{item.id}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-sky-400" />
                  <span>
                    {new Date(item.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Environmental Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Volume2 className="h-3 w-3 text-sky-400" />
                    Noise:
                  </span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(item.noise_level * 100)}%</span>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="h-3 w-3 text-indigo-400" />
                    Crowd:
                  </span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(item.crowd_level * 100)}%</span>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sun className="h-3 w-3 text-amber-400" />
                    Lighting:
                  </span>
                  <span className="font-mono font-bold text-slate-200">{Math.round(item.brightness * 100)}%</span>
                </div>

                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 flex items-center justify-between">
                  <span className="text-slate-400">Routine:</span>
                  <span className={`font-bold ${item.routine_change ? 'text-rose-400' : 'text-slate-400'}`}>
                    {item.routine_change ? 'Shifted' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Human-readable tags */}
              {item.human_description && item.human_description.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.human_description.map((desc, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {desc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

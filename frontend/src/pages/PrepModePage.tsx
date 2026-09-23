import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Check, ArrowRight, ShieldCheck, Plus, AlertCircle } from 'lucide-react';
import { EventItem, PrepPlanResponse } from '../types';
import { api } from '../services/api';

interface PrepModePageProps {
  userId: number;
}

export const PrepModePage: React.FC<PrepModePageProps> = ({ userId }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PrepPlanResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showNewEventForm, setShowNewEventForm] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('College Capstone Presentation');
  const [eventType, setEventType] = useState<string>('presentation');
  const [dateTime, setDateTime] = useState<string>('2026-09-25T10:00');
  const [location, setLocation] = useState<string>('Auditorium Hall B');
  const [notes, setNotes] = useState<string>('Large crowd expected, presentation with slide deck, schedule moved up 30m.');
  const [expectedCrowd, setExpectedCrowd] = useState<number>(0.85);
  const [expectedNoise, setExpectedNoise] = useState<number>(0.75);
  const [routineChange, setRoutineChange] = useState<boolean>(true);
  const [unfamiliarLocation, setUnfamiliarLocation] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents(userId);
      setEvents(data);
      if (data.length > 0 && !selectedPlan) {
        // Generate plan for the first event automatically
        handleGeneratePlanForEvent(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId]);

  const handleGeneratePlanForEvent = async (evt: EventItem) => {
    setIsGenerating(true);
    try {
      const plan = await api.generatePrepPlan(evt);
      setSelectedPlan(plan);
    } catch (err) {
      console.error("Failed to generate prep plan", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAndPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newEvt: EventItem = {
        user_id: userId,
        title,
        event_type: eventType,
        scheduled_time: new Date(dateTime).toISOString(),
        location,
        notes,
        expected_crowd: expectedCrowd,
        expected_noise: expectedNoise,
        routine_change: routineChange,
        unfamiliar_location: unfamiliarLocation
      };

      const savedEvt = await api.createEvent(newEvt);
      const plan = await api.generatePrepPlan(newEvt);
      setSelectedPlan(plan);
      setShowNewEventForm(false);
      fetchEvents();
    } catch (err) {
      console.error("Failed to create event and plan", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-400" />
            Prep Mode — Proactive Event Accommodations
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze upcoming presentations, appointments, or transitions in advance to prepare personalized sensory accommodations.
          </p>
        </div>

        <button
          onClick={() => setShowNewEventForm(!showNewEventForm)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{showNewEventForm ? 'Cancel New Event' : 'Plan New Event'}</span>
        </button>
      </div>

      {/* New Event Form (collapsible) */}
      {showNewEventForm && (
        <form onSubmit={handleCreateAndPlan} className="glass-panel-glow rounded-2xl p-5 border-slate-700 bg-slate-900/90 space-y-4">
          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
            Enter Upcoming Event Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Event Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Physical Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Expected Noise</span>
                <span className="font-mono text-sky-400">{Math.round(expectedNoise * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={expectedNoise}
                onChange={(e) => setExpectedNoise(parseFloat(e.target.value))}
                className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Expected Crowd</span>
                <span className="font-mono text-indigo-400">{Math.round(expectedCrowd * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={expectedCrowd}
                onChange={(e) => setExpectedCrowd(parseFloat(e.target.value))}
                className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-300">Routine Change</span>
              <button
                type="button"
                onClick={() => setRoutineChange(!routineChange)}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  routineChange ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {routineChange ? 'YES' : 'NO'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-300">Unfamiliar Location</span>
              <button
                type="button"
                onClick={() => setUnfamiliarLocation(!unfamiliarLocation)}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  unfamiliarLocation ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {unfamiliarLocation ? 'YES' : 'NO'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Contextual Factors</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Schedule moved earlier, auditorium lighting may be bright"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Analyzing History...' : 'Generate Proactive Prep Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Upcoming Events List */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Upcoming Scheduled Events
          </h3>

          <div className="space-y-2.5">
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleGeneratePlanForEvent(evt)}
                className="glass-panel p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/40 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                    {evt.title}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                    {evt.event_type}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-sky-400" />
                    {new Date(evt.scheduled_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-indigo-400" />
                    {evt.location}
                  </span>
                </div>

                {evt.notes && (
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {evt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Proactive Prep Plan Result */}
        <div className="lg:col-span-8">
          {selectedPlan ? (
            <div className="glass-panel-glow rounded-2xl p-6 border-slate-800 space-y-6">
              
              {/* Plan Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <div className="flex items-center space-x-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>ORION PROACTIVE PREP PLAN</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">
                    {selectedPlan.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Projected Support Demand</span>
                    <span className={`text-base font-bold font-mono ${
                      selectedPlan.estimated_support_requirement === 'HIGH' ? 'text-rose-400' :
                      selectedPlan.estimated_support_requirement === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {selectedPlan.estimated_support_requirement}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actionable Preparation Checklist */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
                  Actionable Preparation Steps
                </h3>
                <div className="space-y-2">
                  {selectedPlan.actionable_prep_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      <span className="text-xs text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Strategies */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-3">
                  Recommended Strategy Accommodations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedPlan.recommended_interventions.map((rec) => (
                    <div key={rec.intervention_id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-200 mb-1">
                        <span>{rec.intervention}</span>
                        <span className="font-mono text-sky-400 font-bold">{Math.round(rec.score * 100)}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traceable Why Explanation */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider font-mono block mb-1">
                  WHY THIS PLAN?
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPlan.why_explanation}
                </p>
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 border-slate-800">
              Select an upcoming event or plan a new event to view proactive accommodations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

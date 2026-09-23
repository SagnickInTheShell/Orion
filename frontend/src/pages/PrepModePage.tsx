import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Check, Plus, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import { EventItem, PrepPlanResponse } from '../types';
import { api } from '../services/api';

interface PrepModePageProps {
  userId: number;
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

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

      await api.createEvent(newEvt);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* ── Page Header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: '#EEF2FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Calendar size={18} color="#4361EE" strokeWidth={2.2} />
            </div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.3px',
              margin: 0,
            }}>
              Plan Ahead & Accommodations
            </h1>
          </div>
          <p style={{
            fontSize: 13.5,
            color: '#64748B',
            marginTop: 5,
            marginBottom: 0,
          }}>
            Prepare for upcoming lectures, meetings, or transitions in advance with tailored sensory strategies.
          </p>
        </div>

        <button
          onClick={() => setShowNewEventForm(!showNewEventForm)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            borderRadius: 12,
            border: 'none',
            background: showNewEventForm ? '#F1F5F9' : '#4361EE',
            color: showNewEventForm ? '#475569' : '#FFFFFF',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{showNewEventForm ? 'Close Form' : 'Plan New Event'}</span>
        </button>
      </div>

      {/* ── New Event Form (collapsible) ── */}
      {showNewEventForm && (
        <form onSubmit={handleCreateAndPlan} style={{ ...cardStyle, background: '#F8FAFC' }}>
          <h3 style={{
            fontSize: 15.5,
            fontWeight: 700,
            color: '#1E293B',
            marginBottom: 16,
          }}>
            Event Details & Sensory Expectations
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 16,
          }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Event Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: 13,
                  color: '#1E293B',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: 13,
                  color: '#1E293B',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  fontSize: 13,
                  color: '#1E293B',
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 16,
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                <span>Expected Noise</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>{Math.round(expectedNoise * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={expectedNoise}
                onChange={(e) => setExpectedNoise(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#10B981' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                <span>Expected Crowd</span>
                <span style={{ color: '#3B82F6', fontWeight: 700 }}>{Math.round(expectedCrowd * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={expectedCrowd}
                onChange={(e) => setExpectedCrowd(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#3B82F6' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Routine Change</span>
              <button
                type="button"
                onClick={() => setRoutineChange(!routineChange)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  background: routineChange ? '#EA580C' : '#E2E8F0',
                  color: routineChange ? 'white' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                {routineChange ? 'YES' : 'NO'}
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 10,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>Unfamiliar Location</span>
              <button
                type="button"
                onClick={() => setUnfamiliarLocation(!unfamiliarLocation)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  background: unfamiliarLocation ? '#D97706' : '#E2E8F0',
                  color: unfamiliarLocation ? 'white' : '#64748B',
                  cursor: 'pointer',
                }}
              >
                {unfamiliarLocation ? 'YES' : 'NO'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Notes or Contextual Sensitivities
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Schedule moved earlier, auditorium lighting may be bright"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                fontSize: 13,
                color: '#1E293B',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={isGenerating}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: 'none',
                background: '#4361EE',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                opacity: isGenerating ? 0.6 : 1,
              }}
            >
              {isGenerating ? 'Generating Strategy...' : 'Generate Proactive Plan'}
            </button>
          </div>
        </form>
      )}

      {/* ── Main Two-Column Layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.6fr',
        gap: 20,
      }}>
        
        {/* Left: Upcoming Events List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#1E293B',
            margin: 0,
          }}>
            Upcoming Events
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => handleGeneratePlanForEvent(evt)}
                style={{
                  ...cardStyle,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  border: selectedPlan?.title === evt.title ? '2px solid #4361EE' : '1px solid #ECEEF1',
                  background: selectedPlan?.title === evt.title ? '#F8FAFC' : '#FFFFFF',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1E293B' }}>
                    {evt.title}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 50,
                    background: '#EEF2FF',
                    color: '#4361EE',
                    textTransform: 'capitalize',
                  }}>
                    {evt.event_type}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={13} color="#4361EE" />
                    {new Date(evt.scheduled_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={13} color="#F59E0B" />
                    {evt.location}
                  </span>
                </div>

                {evt.notes && (
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.35 }}>
                    {evt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Proactive Prep Plan Result */}
        <div>
          {selectedPlan ? (
            <div style={cardStyle}>
              {/* Plan Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 16,
                marginBottom: 18,
                borderBottom: '1px solid #F1F5F9',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4361EE', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    <Sparkles size={14} />
                    <span>PROACTIVE PREPARATION PLAN</span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {selectedPlan.title}
                  </h2>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 11, color: '#64748B', display: 'block' }}>Expected Sensory Load</span>
                  <span style={{
                    fontSize: 14,
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 50,
                    display: 'inline-block',
                    marginTop: 3,
                    ...(selectedPlan.estimated_support_requirement === 'HIGH'
                      ? { background: '#FEE2E2', color: '#991B1B' }
                      : selectedPlan.estimated_support_requirement === 'MEDIUM'
                      ? { background: '#FEF3C7', color: '#92400E' }
                      : { background: '#D1FAE5', color: '#065F46' }),
                  }}>
                    {selectedPlan.estimated_support_requirement}
                  </span>
                </div>
              </div>

              {/* Actionable Preparation Checklist */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>
                  Actionable Steps Before You Go
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedPlan.actionable_prep_steps.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#D1FAE5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}>
                        <Check size={12} color="#065F46" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.45 }}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Strategies */}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 10 }}>
                  Recommended Support Accommodations
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 10,
                }}>
                  {selectedPlan.recommended_interventions.map((rec) => (
                    <div
                      key={rec.intervention_id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                          {rec.intervention}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>
                          {Math.round(rec.score * 100)}%
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traceable Why Explanation */}
              <div style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: '#EEF2FF',
                borderLeft: '4px solid #4361EE',
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#312E81', display: 'block', marginBottom: 2 }}>
                  Why this plan?
                </span>
                <p style={{ fontSize: 12.5, color: '#3730A3', margin: 0, lineHeight: 1.5 }}>
                  {selectedPlan.why_explanation}
                </p>
              </div>

            </div>
          ) : (
            <div style={{
              ...cardStyle,
              padding: '40px',
              textAlign: 'center',
              color: '#64748B',
              fontSize: 13.5,
            }}>
              Select an upcoming event on the left to see proactive sensory accommodations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

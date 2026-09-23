import React, { useState } from 'react';
import {
  Headphones, Wind, Coffee, Heart as LucideHeart,
  CalendarDays, ChevronRight, Building2, SlidersHorizontal,
  Sparkles, CheckCircle2, X
} from 'lucide-react';
import {
  ContextData,
  PredictionResponse,
  RecommendationItem,
  ContextResponse
} from '../types';

interface HomePageProps {
  userName: string;
  context: ContextData;
  setContext: (ctx: ContextData) => void;
  prediction: PredictionResponse | null;
  recommendations: RecommendationItem[];
  explanation: string;
  onOpenWhatIf: () => void;
  onOpenFeedback: (item: RecommendationItem) => void;
  recentHistory: ContextResponse[];
  onSelectHistoryContext: (hist: ContextResponse) => void;
  isLoading: boolean;
  selectedMood: string | null;
  setSelectedMood: (mood: string | null) => void;
  onNavigate: (tab: string) => void;
}

/* ── SVG Mood Faces matching exact reference ── */
const MoodFace: React.FC<{ type: string; size?: number }> = ({ type, size = 48 }) => {
  switch (type) {
    case 'calm':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#52C49A" />
          {/* Eyes - gentle closed smiling curves */}
          <path d="M16 21 C17 19, 20 19, 21 21" stroke="#1A5336" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M27 21 C28 19, 31 19, 32 21" stroke="#1A5336" strokeWidth="2.4" strokeLinecap="round" />
          {/* Smile */}
          <path d="M18 28 Q24 34 30 28" stroke="#1A5336" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'good':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#60A5FA" />
          {/* Open happy eyes */}
          <circle cx="18" cy="20" r="2.4" fill="#1E3A8A" />
          <circle cx="30" cy="20" r="2.4" fill="#1E3A8A" />
          {/* Broad smile */}
          <path d="M17 27 Q24 35 31 27" stroke="#1E3A8A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'okay':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#FBBF24" />
          {/* Neutral dot eyes */}
          <circle cx="18" cy="21" r="2.4" fill="#78350F" />
          <circle cx="30" cy="21" r="2.4" fill="#78350F" />
          {/* Straight line mouth */}
          <line x1="18" y1="29" x2="30" y2="29" stroke="#78350F" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'stressed':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#F97316" />
          {/* Angled worried eyebrows */}
          <path d="M15 16 L20 18" stroke="#7C2D12" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M33 16 L28 18" stroke="#7C2D12" strokeWidth="2.2" strokeLinecap="round" />
          {/* Eyes */}
          <circle cx="18" cy="22" r="2.2" fill="#7C2D12" />
          <circle cx="30" cy="22" r="2.2" fill="#7C2D12" />
          {/* Slight frown */}
          <path d="M18 31 Q24 26 30 31" stroke="#7C2D12" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'overwhelmed':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="22" fill="#F43F5E" />
          {/* Worried raised eyebrows */}
          <path d="M15 17 L21 16" stroke="#881337" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M33 17 L27 16" stroke="#881337" strokeWidth="2.2" strokeLinecap="round" />
          {/* Concerned eyes */}
          <circle cx="18" cy="22" r="2.2" fill="#881337" />
          <circle cx="30" cy="22" r="2.2" fill="#881337" />
          {/* Trembling / wavy mouth */}
          <path d="M18 31 Q21 28 24 31 Q27 34 30 31" stroke="#881337" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return null;
  }
};

const moods = [
  {
    id: 'calm',
    label: 'Calm',
    bg: '#E6F7F0',
    activeBorder: '#10B981',
    textColor: '#15803D',
    noiseCtx: 0.10,
    crowdCtx: 0.10,
    brightness: 0.40,
    activity: 0.15,
  },
  {
    id: 'good',
    label: 'Good',
    bg: '#EBF5FF',
    activeBorder: '#3B82F6',
    textColor: '#1D4ED8',
    noiseCtx: 0.20,
    crowdCtx: 0.20,
    brightness: 0.50,
    activity: 0.25,
  },
  {
    id: 'okay',
    label: 'Okay',
    bg: '#FEF9E7',
    activeBorder: '#F59E0B',
    textColor: '#B45309',
    noiseCtx: 0.45,
    crowdCtx: 0.40,
    brightness: 0.55,
    activity: 0.40,
  },
  {
    id: 'stressed',
    label: 'Stressed',
    bg: '#FFF0E6',
    activeBorder: '#F97316',
    textColor: '#C2410C',
    noiseCtx: 0.70,
    crowdCtx: 0.65,
    brightness: 0.75,
    activity: 0.65,
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    bg: '#FFEBEF',
    activeBorder: '#F43F5E',
    textColor: '#BE123C',
    noiseCtx: 0.88,
    crowdCtx: 0.85,
    brightness: 0.85,
    activity: 0.80,
  },
];

const supportCards = [
  {
    id: 'quiet',
    title: 'Find a Quiet Space',
    sub: 'Suggestions around you',
    Icon: Headphones,
    iconColor: '#6366F1',
    cardBg: '#F0F1FF',
    action: 'quiet',
  },
  {
    id: 'breathe',
    title: 'Breathing Exercise',
    sub: '1–3 minutes',
    Icon: Wind,
    iconColor: '#0D9488',
    cardBg: '#E6F7F2',
    action: 'breathe',
  },
  {
    id: 'break',
    title: 'Take a Break',
    sub: 'Gentle activities',
    Icon: Coffee,
    iconColor: '#EA580C',
    cardBg: '#FFF5EB',
    action: 'break',
  },
  {
    id: 'social',
    title: 'Talk to Someone',
    sub: 'Trusted contacts',
    Icon: LucideHeart,
    iconColor: '#E11D48',
    cardBg: '#FFF0F3',
    action: 'social',
  },
];

/* ── Container Card Style matching reference ── */
const cardContainerStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

export const HomePage: React.FC<HomePageProps> = ({
  context,
  setContext,
  prediction,
  recommendations,
  explanation,
  onOpenFeedback,
  isLoading,
  selectedMood,
  setSelectedMood,
  onNavigate,
}) => {
  // Modal states for interactive Quick Support actions
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [showSimSliders, setShowSimSliders] = useState<boolean>(false);

  const handleMoodClick = (mood: typeof moods[0]) => {
    const next = selectedMood === mood.id ? null : mood.id;
    setSelectedMood(next);
    if (next) {
      setContext({
        ...context,
        noise_level: mood.noiseCtx,
        crowd_level: mood.crowdCtx,
        brightness: mood.brightness,
        activity_level: mood.activity,
        routine_change: mood.id === 'overwhelmed' || mood.id === 'stressed',
      });
    }
  };

  const handleSupportClick = (action: string) => {
    if (action === 'breathe') {
      setActiveModal('breathe');
      let step = 0;
      const interval = setInterval(() => {
        step = (step + 1) % 3;
        setBreathingPhase(step === 0 ? 'Inhale' : step === 1 ? 'Hold' : 'Exhale');
      }, 3500);
      setTimeout(() => clearInterval(interval), 35000);
    } else if (action === 'quiet') {
      setActiveModal('quiet');
    } else if (action === 'break') {
      setActiveModal('break');
    } else if (action === 'social') {
      setActiveModal('social');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── 1. "How are you feeling right now?" Section ── */}
      <div style={cardContainerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}>
          <div>
            <h2 style={{
              fontSize: 17,
              fontWeight: 700,
              color: '#1E293B',
              margin: '0 0 4px 0',
              letterSpacing: '-0.2px',
            }}>
              How are you feeling right now?
            </h2>
            <p style={{
              fontSize: 13,
              color: '#64748B',
              margin: 0,
            }}>
              This helps ORION support you better.
            </p>
          </div>

          {/* Right pill badge matching reference */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 50,
            background: '#FDF2F8',
            flexShrink: 0,
          }}>
            <LucideHeart size={14} fill="#F43F5E" color="#F43F5E" />
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#9F1239',
              lineHeight: 1.25,
            }}>
              It's okay to feel<br />any of these
            </span>
          </div>
        </div>

        {/* 5 Mood Columns across */}
        <div style={{ display: 'flex', gap: 12 }}>
          {moods.map(m => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMoodClick(m)}
                title={`Select ${m.label}`}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: '20px 8px 16px',
                  borderRadius: 18,
                  border: isSelected ? `2.5px solid ${m.activeBorder}` : '2px solid transparent',
                  background: m.bg,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  }
                }}
              >
                <MoodFace type={m.id} size={50} />
                <span style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: m.textColor,
                }}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. "Quick Support" Section ── */}
      <div style={cardContainerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
              {/* Support stopwatch/alarm icon in purple container */}
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="13" r="8" />
                  <path d="M12 9v4l2.5 2.5" />
                  <path d="M5 3L2 6" />
                  <path d="M22 6L19 3" />
                </svg>
              </div>
              <h2 style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#1E293B',
                margin: 0,
                letterSpacing: '-0.2px',
              }}>
                Quick Support
              </h2>
            </div>
            <p style={{
              fontSize: 13,
              color: '#64748B',
              margin: 0,
              paddingLeft: 35,
            }}>
              Choose what you need right now.
            </p>
          </div>

          <button
            onClick={() => onNavigate('whatif')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 600,
              color: '#4361EE',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'gap 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.gap = '7px')}
            onMouseLeave={e => (e.currentTarget.style.gap = '4px')}
          >
            See All <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* 2x2 Grid of support cards matching reference */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          {supportCards.map(item => (
            <button
              key={item.id}
              onClick={() => handleSupportClick(item.action)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '18px 22px',
                borderRadius: 18,
                background: item.cardBg,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <item.Icon
                size={28}
                color={item.iconColor}
                strokeWidth={2}
                fill={item.id === 'social' ? item.iconColor : 'none'}
                style={{ flexShrink: 0 }}
              />
              <div>
                <div style={{
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: 3,
                  lineHeight: 1.25,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 12.5,
                  color: '#64748B',
                }}>
                  {item.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. "Plan Ahead" Section ── */}
      <div style={cardContainerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CalendarDays size={15} color="#4361EE" strokeWidth={2.2} />
              </div>
              <h2 style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#1E293B',
                margin: 0,
                letterSpacing: '-0.2px',
              }}>
                Plan Ahead
              </h2>
            </div>
            <p style={{
              fontSize: 13,
              color: '#64748B',
              margin: 0,
              paddingLeft: 35,
            }}>
              Prepare for upcoming events.
            </p>
          </div>

          <button
            onClick={() => onNavigate('prep')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              fontWeight: 600,
              color: '#4361EE',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'gap 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.gap = '7px')}
            onMouseLeave={e => (e.currentTarget.style.gap = '4px')}
          >
            View Schedule <ChevronRight size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Event Row + Add Event Button matching reference */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}>
          {/* Lecture Event Pill */}
          <div
            onClick={() => onNavigate('prep')}
            role="button"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 18px',
              borderRadius: 14,
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F1F5F9')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F8FAFC')}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Building2 size={20} color="#64748B" strokeWidth={1.8} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#1E293B',
                lineHeight: 1.25,
              }}>
                DS Lecture
              </div>
              <div style={{
                fontSize: 12.5,
                color: '#64748B',
                marginTop: 2,
              }}>
                Tomorrow, 10:00 AM
              </div>
            </div>

            <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
          </div>

          {/* Add Event Button */}
          <button
            onClick={() => onNavigate('prep')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '16px 24px',
              borderRadius: 14,
              border: 'none',
              background: '#EEF2FF',
              color: '#4361EE',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#E0E7FF';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#EEF2FF';
              (e.currentTarget as HTMLButtonElement).style.transform = 'none';
            }}
          >
            Add Event +
          </button>
        </div>
      </div>

      {/* ── 4. AI Recommendations & Sensory Pipeline (Interactive Feature Section) ── */}
      {(recommendations.length > 0 || isLoading) && (
        <div style={cardContainerStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: '#F0EDF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={14} color="#7C3AED" strokeWidth={2.2} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  Personalized AI Recommendations
                </h3>
                <p style={{ fontSize: 12.5, color: '#64748B', margin: 0 }}>
                  Tailored based on your current sensory state.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowSimSliders(!showSimSliders)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#4361EE',
                background: '#EEF2FF',
                border: 'none',
                borderRadius: 20,
                padding: '6px 14px',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={13} />
              {showSimSliders ? 'Hide Sliders' : 'Simulate Sensory'}
            </button>
          </div>

          {/* Interactive Sliders when expanded */}
          {showSimSliders && (
            <div style={{
              background: '#F8FAFC',
              borderRadius: 14,
              padding: '16px 20px',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              border: '1px solid #E2E8F0',
            }}>
              <SliderRow
                label="Noise Level"
                value={context.noise_level}
                onChange={v => setContext({ ...context, noise_level: v })}
              />
              <SliderRow
                label="Crowd Density"
                value={context.crowd_level}
                onChange={v => setContext({ ...context, crowd_level: v })}
              />
              <SliderRow
                label="Brightness"
                value={context.brightness}
                onChange={v => setContext({ ...context, brightness: v })}
              />
              <SliderRow
                label="Activity Level"
                value={context.activity_level}
                onChange={v => setContext({ ...context, activity_level: v })}
              />
            </div>
          )}

          {/* Recommendations cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recommendations.slice(0, 3).map(rec => (
              <div
                key={rec.intervention_id}
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                      {rec.intervention}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#065F46',
                      background: '#D1FAE5',
                      padding: '2px 8px',
                      borderRadius: 50,
                    }}>
                      {Math.round(rec.score * 100)}% Match
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                    {rec.description}
                  </p>
                </div>

                <button
                  onClick={() => onOpenFeedback(rec)}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#2563EB',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: 50,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#2563EB';
                    (e.currentTarget as HTMLButtonElement).style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#EFF6FF';
                    (e.currentTarget as HTMLButtonElement).style.color = '#2563EB';
                  }}
                >
                  Rate this ★
                </button>
              </div>
            ))}
          </div>

          {explanation && (
            <div style={{
              marginTop: 12,
              padding: '12px 16px',
              background: '#F8FAFC',
              borderRadius: 10,
              fontSize: 12.5,
              color: '#475569',
              lineHeight: 1.5,
              borderLeft: '3px solid #6366F1',
            }}>
              <span style={{ fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: 2 }}>
                Reasoning:
              </span>
              {explanation}
            </div>
          )}
        </div>
      )}

      {/* ── Interactive Modals for Quick Support ── */}
      {activeModal === 'breathe' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: '36px 40px',
            width: 380,
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative',
          }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#64748B" />
            </button>

            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', margin: '0 0 8px 0' }}>
              Gentle Breathing
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 28px 0' }}>
              Follow the rhythm to center your nervous system.
            </p>

            <div style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              margin: '0 auto 28px',
              background: breathingPhase === 'Inhale' ? '#D1FAE5' : breathingPhase === 'Hold' ? '#FEF3C7' : '#E0E7FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 3s ease-in-out',
              transform: breathingPhase === 'Inhale' ? 'scale(1.25)' : breathingPhase === 'Hold' ? 'scale(1.25)' : 'scale(0.95)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            }}>
              <span style={{
                fontSize: 18,
                fontWeight: 700,
                color: breathingPhase === 'Inhale' ? '#065F46' : breathingPhase === 'Hold' ? '#92400E' : '#3730A3',
              }}>
                {breathingPhase}
              </span>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                padding: '10px 24px',
                borderRadius: 50,
                background: '#10B981',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Done & Relaxed
            </button>
          </div>
        </div>
      )}

      {activeModal === 'quiet' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: '32px 36px',
            width: 440,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative',
          }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#64748B" />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
              Quiet Spaces Nearby
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px 0' }}>
              Identified low-stimulation spots in your vicinity:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { name: 'Library Silent Study Room 3B', dist: '50m away', noise: 'Very Low (24 dB)' },
                { name: 'North Courtyard Benches', dist: '120m away', noise: 'Low (32 dB)' },
                { name: 'Campus Meditation Corner', dist: '200m away', noise: 'Silent (18 dB)' },
              ].map(spot => (
                <div key={spot.name} style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>{spot.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{spot.dist} · {spot.noise}</div>
                  </div>
                  <CheckCircle2 size={18} color="#10B981" />
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 12,
                background: '#4361EE',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {activeModal === 'break' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: '32px 36px',
            width: 420,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative',
          }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#64748B" />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
              Gentle Break Ideas
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 18px 0' }}>
              Small, non-demanding ways to rest:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { title: 'Sip cold water slowly', time: '1 min' },
                { title: 'Look 20 feet away to rest your eyes', time: '20 sec' },
                { title: 'Put on noise-cancelling headphones', time: '5 min' },
              ].map(b => (
                <div key={b.title} style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#FFF5EB',
                  border: '1px solid #FED7AA',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#9A3412' }}>{b.title}</span>
                  <span style={{ fontSize: 12, color: '#EA580C', fontWeight: 600 }}>{b.time}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 12,
                background: '#EA580C',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {activeModal === 'social' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white',
            borderRadius: 24,
            padding: '32px 36px',
            width: 420,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative',
          }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="#64748B" />
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', margin: '0 0 6px 0' }}>
              Trusted Contacts
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 18px 0' }}>
              Reach out to people who understand your space:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { name: 'Dr. Sarah (Support Advisor)', status: 'Available' },
                { name: 'Mom (Family)', status: 'Fast responder' },
                { name: 'Peer Mentor Lucas', status: 'Available' },
              ].map(c => (
                <div key={c.name} style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: '#FFF0F3',
                  border: '1px solid #FECDD3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#9F1239' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#E11D48' }}>{c.status}</div>
                  </div>
                  <button style={{
                    padding: '6px 12px',
                    borderRadius: 50,
                    background: '#E11D48',
                    color: 'white',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    Message
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 12,
                background: '#F1F5F9',
                color: '#475569',
                border: 'none',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

/* ── Slider Row ── */
const SliderRow: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => {
  const pct = Math.round(value * 100);
  const color = pct < 35 ? '#10B981' : pct < 65 ? '#F59E0B' : '#EF4444';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{label}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <input
        type="range" min={0} max={100} value={pct}
        onChange={e => onChange(Number(e.target.value) / 100)}
        style={{ width: '100%', accentColor: color }}
      />
    </div>
  );
};

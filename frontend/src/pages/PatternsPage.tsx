import React, { useState, useEffect } from 'react';
import {
  BarChart3, RefreshCw, Volume2, Users, Sun,
  Compass, Sparkles, CheckCircle2, Shield
} from 'lucide-react';
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

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

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
      <div style={{
        ...cardStyle,
        padding: '60px 40px',
        textAlign: 'center',
        color: '#64748B',
        fontSize: 14,
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#EEF2FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <RefreshCw className="animate-spin" size={20} color="#4361EE" />
        </div>
        Gathering your personal patterns and strategy insights...
      </div>
    );
  }

  const effectivenessChartData = patterns.effectiveness.map((item) => ({
    name: item.name,
    effectiveness: item.effectiveness_percentage,
    category: item.category,
    samples: item.sample_count,
  }));

  const sensitivityConfigs: Record<string, { label: string; bg: string; text: string; bar: string; icon: any }> = {
    noise: {
      label: 'Sound & Noise',
      bg: '#E6F7F0',
      text: '#15803D',
      bar: '#10B981',
      icon: Volume2,
    },
    crowd: {
      label: 'Crowd Density',
      bg: '#EBF5FF',
      text: '#1D4ED8',
      bar: '#3B82F6',
      icon: Users,
    },
    brightness: {
      label: 'Light & Glare',
      bg: '#FEF9E7',
      text: '#B45309',
      bar: '#F59E0B',
      icon: Sun,
    },
    routine_change: {
      label: 'Schedule Changes',
      bg: '#FFF0E6',
      text: '#C2410C',
      bar: '#F97316',
      icon: Sparkles,
    },
    unfamiliar_location: {
      label: 'New Locations',
      bg: '#F0F1FF',
      text: '#4338CA',
      bar: '#6366F1',
      icon: Compass,
    },
  };

  const barColors = [
    '#10B981', // emerald
    '#3B82F6', // blue
    '#6366F1', // indigo
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#F59E0B', // amber
    '#14B8A6', // teal
  ];

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
              <BarChart3 size={18} color="#4361EE" strokeWidth={2.2} />
            </div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.3px',
              margin: 0,
            }}>
              My Patterns & Strategy Insights
            </h1>
            {patterns.is_demo_profile && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 50,
                background: '#FEF3C7',
                color: '#B45309',
                border: '1px solid #FDE68A',
              }}>
                Demo Profile
              </span>
            )}
          </div>
          <p style={{
            fontSize: 13.5,
            color: '#64748B',
            marginTop: 5,
            marginBottom: 0,
          }}>
            Personalized insights based on what accommodations have worked best across {patterns.total_recorded_situations} recorded situations.
          </p>
        </div>

        <button
          onClick={fetchPatterns}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            borderRadius: 12,
            border: 'none',
            background: '#EEF2FF',
            color: '#4361EE',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#E0E7FF')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#EEF2FF')}
        >
          <RefreshCw size={14} strokeWidth={2.2} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── 1. Sensory Sensitivity Profile Cards ── */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div>
            <h2 style={{
              fontSize: 16.5,
              fontWeight: 700,
              color: '#1E293B',
              margin: '0 0 3px 0',
              letterSpacing: '-0.2px',
            }}>
              Your Sensory Sensitivity Profile
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              Learned preferences that help ORION recommend timely sensory accommodations.
            </p>
          </div>
          <span style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: '#64748B',
            background: '#F1F5F9',
            padding: '4px 10px',
            borderRadius: 50,
          }}>
            v{patterns.profile_version} Model
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}>
          {Object.entries(patterns.sensitivities).map(([key, val]) => {
            const conf = sensitivityConfigs[key] || {
              label: key,
              bg: '#F8FAFC',
              text: '#334155',
              bar: '#3B82F6',
              icon: Sparkles,
            };
            const Icon = conf.icon;
            const pct = Math.round(val * 100);

            return (
              <div
                key={key}
                style={{
                  background: conf.bg,
                  borderRadius: 16,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#334155',
                  }}>
                    {conf.label}
                  </span>
                  <Icon size={16} color={conf.bar} strokeWidth={2.2} />
                </div>

                <div style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: conf.text,
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                }}>
                  {pct}%
                </div>

                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 50,
                  background: 'rgba(255,255,255,0.7)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: 50,
                    background: conf.bar,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. Strategy Effectiveness & Triggers Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 1fr',
        gap: 20,
      }}>
        
        {/* Left: Strategy Effectiveness Chart */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{
              fontSize: 16.5,
              fontWeight: 700,
              color: '#1E293B',
              margin: '0 0 3px 0',
              letterSpacing: '-0.2px',
            }}>
              Support Strategy Effectiveness
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              Percentage of times each support strategy was rated helpful by you.
            </p>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={effectivenessChartData}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  unit="%"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#334155"
                  fontSize={12}
                  fontWeight={600}
                  width={150}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: 12,
                          padding: '10px 14px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                            {data.name}
                          </div>
                          <div style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: '#10B981',
                            marginTop: 3,
                          }}>
                            {data.effectiveness}% Helpful
                          </div>
                          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                            Based on {data.samples} recorded feedback entries
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="effectiveness" radius={[0, 8, 8, 0]}>
                  {effectivenessChartData.map((_, index) => (
                    <Cell
                      key={`eff-cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick summary chips */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid #F1F5F9',
          }}>
            {patterns.effectiveness.slice(0, 3).map((eff) => (
              <div
                key={eff.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                    {eff.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11.5, color: '#64748B' }}>
                    {eff.sample_count} uses
                  </span>
                  <span style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#065F46',
                    background: '#D1FAE5',
                    padding: '2px 8px',
                    borderRadius: 50,
                  }}>
                    {eff.effectiveness_percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Common Context Triggers */}
        <div style={cardStyle}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{
              fontSize: 16.5,
              fontWeight: 700,
              color: '#1E293B',
              margin: '0 0 3px 0',
              letterSpacing: '-0.2px',
            }}>
              Frequent Context Triggers
            </h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              Environmental factors present during past elevated support needs.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {patterns.context_distribution.map((ctx, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 14,
                  padding: '14px 16px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1E293B' }}>
                    {ctx.factor}
                  </span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#4361EE',
                    background: '#EEF2FF',
                    padding: '2px 8px',
                    borderRadius: 50,
                  }}>
                    {ctx.pct}% ({ctx.occurrences} events)
                  </span>
                </div>

                <div style={{
                  width: '100%',
                  height: 7,
                  borderRadius: 50,
                  background: '#E2E8F0',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${ctx.pct}%`,
                    height: '100%',
                    borderRadius: 50,
                    background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 100%)',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Note */}
          <div style={{
            marginTop: 18,
            padding: '12px 14px',
            borderRadius: 12,
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Shield size={16} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{
              fontSize: 12,
              color: '#64748B',
              margin: 0,
              lineHeight: 1.45,
            }}>
              Your data stays local and personal. Patterns adapt with each check-in to reflect your authentic preferences.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

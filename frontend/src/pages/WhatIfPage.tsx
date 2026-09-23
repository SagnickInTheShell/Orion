import React, { useState, useEffect } from 'react';
import { Sliders, BarChart2, Shield, ArrowDownRight, Check, Sparkles } from 'lucide-react';
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

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* ── Page Header ── */}
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
            <Sliders size={18} color="#4361EE" strokeWidth={2.2} />
          </div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#1E293B',
            letterSpacing: '-0.3px',
            margin: 0,
          }}>
            What-If Scenario Simulator
          </h1>
        </div>
        <p style={{
          fontSize: 13.5,
          color: '#64748B',
          marginTop: 5,
          marginBottom: 0,
        }}>
          Explore how different accommodations and quiet strategies can reduce sensory load before stepping into challenging situations.
        </p>
      </div>

      {/* ── Current Baseline Context Strip ── */}
      <div style={cardStyle}>
        <div style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 12,
        }}>
          Current Baseline Context
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
        }}>
          <div style={{
            background: '#E6F7F0',
            borderRadius: 14,
            padding: '14px 16px',
            border: '1px solid #D1FAE5',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#166534', display: 'block' }}>
              Sound Level
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#15803D', display: 'block', marginTop: 2 }}>
              {Math.round(currentContext.noise_level * 100)}%
            </span>
          </div>

          <div style={{
            background: '#EBF5FF',
            borderRadius: 14,
            padding: '14px 16px',
            border: '1px solid #DBEAFE',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', display: 'block' }}>
              Crowd Density
            </span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#1D4ED8', display: 'block', marginTop: 2 }}>
              {Math.round(currentContext.crowd_level * 100)}%
            </span>
          </div>

          <div style={{
            background: currentContext.routine_change ? '#FFF0E6' : '#F8FAFC',
            borderRadius: 14,
            padding: '14px 16px',
            border: currentContext.routine_change ? '1px solid #FED7AA' : '1px solid #E2E8F0',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: currentContext.routine_change ? '#C2410C' : '#64748B', display: 'block' }}>
              Routine Status
            </span>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              color: currentContext.routine_change ? '#EA580C' : '#1E293B',
              display: 'block',
              marginTop: 3,
            }}>
              {currentContext.routine_change ? 'Changed' : 'Normal'}
            </span>
          </div>

          <div style={{
            background: currentContext.unfamiliar_location ? '#FEF9E7' : '#F8FAFC',
            borderRadius: 14,
            padding: '14px 16px',
            border: currentContext.unfamiliar_location ? '1px solid #FDE68A' : '1px solid #E2E8F0',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: currentContext.unfamiliar_location ? '#B45309' : '#64748B', display: 'block' }}>
              Environment Space
            </span>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              color: currentContext.unfamiliar_location ? '#D97706' : '#1E293B',
              display: 'block',
              marginTop: 3,
            }}>
              {currentContext.unfamiliar_location ? 'Unfamiliar' : 'Familiar'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Simulation Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 1fr',
        gap: 20,
      }}>
        
        {/* Left: Scenarios Comparison Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{
              fontSize: 16.5,
              fontWeight: 700,
              color: '#1E293B',
              margin: 0,
            }}>
              Simulated Support Load
            </h2>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#64748B',
              background: '#F1F5F9',
              padding: '4px 12px',
              borderRadius: 50,
            }}>
              Baseline: {simulation?.baseline_level || 'EVAL'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {simulation?.scenarios.map((sc, i) => {
              const isBase = sc.intervention_keys.includes('none');
              const levelBadge = {
                LOW: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
                MEDIUM: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
                HIGH: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
              }[sc.level] || { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };

              return (
                <div
                  key={i}
                  style={{
                    ...cardStyle,
                    padding: '18px 20px',
                    border: isBase ? '1.5px solid #CBD5E1' : '1px solid #ECEEF1',
                    background: isBase ? '#F8FAFC' : '#FFFFFF',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1E293B' }}>
                          {sc.name}
                        </span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 50,
                          background: levelBadge.bg,
                          color: levelBadge.text,
                          border: `1px solid ${levelBadge.border}`,
                        }}>
                          {sc.level}
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                        {sc.explanation}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#1E293B' }}>
                        {Math.round(sc.support_score * 100)}%
                      </div>
                      {!isBase && (
                        <div style={{
                          fontSize: 12,
                          color: '#10B981',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 2,
                          marginTop: 2,
                        }}>
                          <ArrowDownRight size={14} />
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

        {/* Right: Comparative Impact Chart & Selectors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Visual Chart */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BarChart2 size={16} color="#4361EE" />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                Comparative Load Visualizer
              </h3>
            </div>

            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94A3B8" fontSize={10} domain={[0, 100]} />
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
                              {data.fullName}
                            </div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4361EE', marginTop: 3 }}>
                              Support Load: {data.score}% ({data.level})
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => {
                      const color = entry.level === 'HIGH' ? '#F43F5E' : entry.level === 'MEDIUM' ? '#F59E0B' : '#10B981';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
              Lower scores indicate a calmer, more manageable sensory state.
            </div>
          </div>

          {/* Intervention Selectors to include in simulation */}
          <div style={cardStyle}>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1E293B',
              display: 'block',
              marginBottom: 10,
            }}>
              Select Accommodations to Compare
            </span>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {candidateOptions.map((opt) => {
                const isSelected = selectedInterventions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: '7px 13px',
                      borderRadius: 10,
                      border: isSelected ? '1.5px solid #4361EE' : '1px solid #E2E8F0',
                      background: isSelected ? '#EEF2FF' : '#FFFFFF',
                      color: isSelected ? '#4361EE' : '#64748B',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected && '✓ '}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ── Reassurance Banner ── */}
      <div style={{
        ...cardStyle,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#F8FAFC',
      }}>
        <Shield size={18} color="#10B981" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: '#64748B' }}>
          Simulations project potential relief based on your past feedback to help you plan proactive strategies.
        </span>
      </div>

    </div>
  );
};

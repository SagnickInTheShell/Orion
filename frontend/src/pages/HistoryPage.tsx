import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Volume2, Users, Sun, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ContextResponse } from '../types';
import { api } from '../services/api';

interface HistoryPageProps {
  userId: number;
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

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
              <Clock size={18} color="#4361EE" strokeWidth={2.2} />
            </div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#1E293B',
              letterSpacing: '-0.3px',
              margin: 0,
            }}>
              Past Situations & Activity Log
            </h1>
          </div>
          <p style={{
            fontSize: 13.5,
            color: '#64748B',
            marginTop: 5,
            marginBottom: 0,
          }}>
            A chronological timeline of your environments, sensory context, and accommodations.
          </p>
        </div>

        <button
          onClick={fetchHistory}
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
          <span>Refresh History</span>
        </button>
      </div>

      {isLoading ? (
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
          Loading past situations...
        </div>
      ) : history.length === 0 ? (
        <div style={{
          ...cardStyle,
          padding: '40px',
          textAlign: 'center',
          color: '#64748B',
          fontSize: 14,
        }}>
          No past situations recorded yet. As you check in, your history will appear here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((item) => (
            <div
              key={item.id}
              style={{
                ...cardStyle,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
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
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                paddingBottom: 10,
                borderBottom: '1px solid #F1F5F9',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
                    {item.event_type || 'Recorded Context'}
                  </span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#64748B',
                    background: '#F1F5F9',
                    padding: '2px 8px',
                    borderRadius: 50,
                  }}>
                    #{item.id}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748B' }}>
                  <Calendar size={14} color="#4361EE" />
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

              {/* Environmental Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10,
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: '#E6F7F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#065F46', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Volume2 size={14} color="#10B981" />
                    Noise
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                    {Math.round(item.noise_level * 100)}%
                  </span>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: '#EBF5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} color="#3B82F6" />
                    Crowd
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>
                    {Math.round(item.crowd_level * 100)}%
                  </span>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: '#FEF9E7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sun size={14} color="#F59E0B" />
                    Light
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>
                    {Math.round(item.brightness * 100)}%
                  </span>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: item.routine_change ? '#FFF0E6' : '#F8FAFC',
                  border: item.routine_change ? '1px solid #FED7AA' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: item.routine_change ? '#9A3412' : '#64748B' }}>
                    Routine
                  </span>
                  <span style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: item.routine_change ? '#EA580C' : '#334155',
                  }}>
                    {item.routine_change ? 'Shifted' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {item.human_description && item.human_description.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.human_description.map((desc, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 50,
                        background: '#EEF2FF',
                        color: '#4361EE',
                      }}
                    >
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

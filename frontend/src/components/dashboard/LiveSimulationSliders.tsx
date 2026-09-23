import React from 'react';
import { Sliders, Volume2, Users, Sun, Zap, CalendarClock, Compass } from 'lucide-react';
import { ContextData } from '../../types';

interface LiveSimulationSlidersProps {
  context: ContextData;
  onChange: (updated: ContextData) => void;
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

export const LiveSimulationSliders: React.FC<LiveSimulationSlidersProps> = ({
  context,
  onChange
}) => {
  const updateField = (field: keyof ContextData, value: any) => {
    onChange({
      ...context,
      [field]: value
    });
  };

  const applyPreset = (preset: Partial<ContextData>) => {
    onChange({
      ...context,
      ...preset
    });
  };

  return (
    <div style={cardStyle}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 18,
        paddingBottom: 16,
        borderBottom: '1px solid #F1F5F9',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={18} color="#4361EE" />
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1E293B',
              margin: 0,
            }}>
              Interactive Sensory Controls
            </h3>
          </div>
          <p style={{
            fontSize: 12.5,
            color: '#64748B',
            marginTop: 4,
            marginBottom: 0,
          }}>
            Adjust environmental parameters to test how recommendations adapt in real time.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => applyPreset({ noise_level: 0.15, crowd_level: 0.10, brightness: 0.40, routine_change: false, unfamiliar_location: false })}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Quiet Space
          </button>
          <button
            onClick={() => applyPreset({ noise_level: 0.75, crowd_level: 0.70, brightness: 0.65, routine_change: false, unfamiliar_location: false })}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Busy Cafe
          </button>
          <button
            onClick={() => applyPreset({ noise_level: 0.50, crowd_level: 0.45, brightness: 0.50, routine_change: true, unfamiliar_location: true })}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            New Location
          </button>
          <button
            onClick={() => applyPreset({ noise_level: 0.90, crowd_level: 0.85, brightness: 0.80, routine_change: true, unfamiliar_location: true })}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid #FECACA',
              background: '#FEE2E2',
              color: '#991B1B',
              cursor: 'pointer',
            }}
          >
            High Sensory Load
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
      }}>
        
        {/* Noise */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Volume2 size={16} color="#10B981" />
              Noise Level
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
              {Math.round(context.noise_level * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.noise_level}
            onChange={(e) => updateField('noise_level', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer' }}
          />
        </div>

        {/* Crowd */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={16} color="#3B82F6" />
              Crowd Density
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>
              {Math.round(context.crowd_level * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.crowd_level}
            onChange={(e) => updateField('crowd_level', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }}
          />
        </div>

        {/* Brightness */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sun size={16} color="#F59E0B" />
              Lighting / Glare
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>
              {Math.round(context.brightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.brightness}
            onChange={(e) => updateField('brightness', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#F59E0B', cursor: 'pointer' }}
          />
        </div>

        {/* Activity */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={16} color="#8B5CF6" />
              Activity Level
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6' }}>
              {Math.round(context.activity_level * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={context.activity_level}
            onChange={(e) => updateField('activity_level', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#8B5CF6', cursor: 'pointer' }}
          />
        </div>

      </div>

      {/* Discrete State Toggles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid #F1F5F9',
      }}>
        
        {/* Routine Change */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 14,
          background: context.routine_change ? '#FFF0E6' : '#F8FAFC',
          border: context.routine_change ? '1px solid #FED7AA' : '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarClock size={18} color="#EA580C" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>Routine Change</div>
              <div style={{ fontSize: 11.5, color: '#64748B' }}>Schedule or plan shifted</div>
            </div>
          </div>
          <button
            onClick={() => updateField('routine_change', !context.routine_change)}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 50,
              border: 'none',
              background: context.routine_change ? '#EA580C' : '#E2E8F0',
              color: context.routine_change ? 'white' : '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {context.routine_change ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Unfamiliar Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: 14,
          background: context.unfamiliar_location ? '#FEF9E7' : '#F8FAFC',
          border: context.unfamiliar_location ? '1px solid #FDE68A' : '1px solid #E2E8F0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Compass size={18} color="#D97706" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>Unfamiliar Space</div>
              <div style={{ fontSize: 11.5, color: '#64748B' }}>New room or venue</div>
            </div>
          </div>
          <button
            onClick={() => updateField('unfamiliar_location', !context.unfamiliar_location)}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 50,
              border: 'none',
              background: context.unfamiliar_location ? '#D97706' : '#E2E8F0',
              color: context.unfamiliar_location ? 'white' : '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {context.unfamiliar_location ? 'ON' : 'OFF'}
          </button>
        </div>

      </div>

    </div>
  );
};

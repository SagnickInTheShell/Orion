import React, { useState } from 'react';
import { ShieldCheck, Check, Lock, Sliders, RotateCcw, EyeOff, MicOff, Settings, AlertTriangle } from 'lucide-react';
import { PersonalProfile } from '../types';
import { api } from '../services/api';

interface PrivacyPageProps {
  userId: number;
  profile: PersonalProfile | null;
  onProfileUpdated: (updated: PersonalProfile) => void;
  onResetDemo: () => void;
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

export const PrivacyPage: React.FC<PrivacyPageProps> = ({
  userId,
  profile,
  onProfileUpdated,
  onResetDemo
}) => {
  const [noiseSens, setNoiseSens] = useState<number>(profile?.noise_sensitivity ?? 0.86);
  const [crowdSens, setCrowdSens] = useState<number>(profile?.crowd_sensitivity ?? 0.78);
  const [brightSens, setBrightSens] = useState<number>(profile?.brightness_sensitivity ?? 0.65);
  const [routineSens, setRoutineSens] = useState<number>(profile?.routine_change_sensitivity ?? 0.90);
  const [locationSens, setLocationSens] = useState<number>(profile?.unfamiliar_location_sensitivity ?? 0.72);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedMsg(null);
    try {
      const updated = await api.updateProfile(userId, {
        noise_sensitivity: noiseSens,
        crowd_sensitivity: crowdSens,
        brightness_sensitivity: brightSens,
        routine_change_sensitivity: routineSens,
        unfamiliar_location_sensitivity: locationSens
      });
      onProfileUpdated(updated);
      setSavedMsg("Sensory sensitivity preferences updated successfully.");
    } catch (err: any) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const privacyGuarantees = [
    { title: "No Raw Camera Frames Stored", desc: "Only lightweight brightness and motion estimates are computed in ephemeral local memory.", icon: EyeOff, color: '#10B981', bg: '#E6F7F0' },
    { title: "No Raw Audio Recorded", desc: "Acoustic signals convert directly to numerical sound volume levels and are immediately discarded.", icon: MicOff, color: '#3B82F6', bg: '#EBF5FF' },
    { title: "Sensors Are Always Optional", desc: "ORION functions seamlessly using manual sliders. Camera and mic access are never required.", icon: Sliders, color: '#F59E0B', bg: '#FEF9E7' },
    { title: "Your Model Stays In Your Control", desc: "Sensitivity weights and accommodation feedback can be adjusted or reseeded whenever you want.", icon: Lock, color: '#8B5CF6', bg: '#F0EDF9' },
  ];

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
            <Settings size={18} color="#4361EE" strokeWidth={2.2} />
          </div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#1E293B',
            letterSpacing: '-0.3px',
            margin: 0,
          }}>
            Privacy & Sensory Settings
          </h1>
        </div>
        <p style={{
          fontSize: 13.5,
          color: '#64748B',
          marginTop: 5,
          marginBottom: 0,
        }}>
          Customize your sensory thresholds and review our privacy commitments.
        </p>
      </div>

      {/* ── Privacy Commitments Grid ── */}
      <div style={cardStyle}>
        <h2 style={{
          fontSize: 16.5,
          fontWeight: 700,
          color: '#1E293B',
          margin: '0 0 4px 0',
          letterSpacing: '-0.2px',
        }}>
          Your Data & Privacy Guarantees
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px 0' }}>
          Built with a privacy-first, on-device design.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14,
        }}>
          {privacyGuarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: '#F8FAFC',
                  borderRadius: 14,
                  padding: '16px 18px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                    {item.title}
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Personal Sensitivity Thresholds Tuning ── */}
      <form onSubmit={handleSaveProfile} style={cardStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          paddingBottom: 16,
          marginBottom: 18,
          borderBottom: '1px solid #F1F5F9',
        }}>
          <div>
            <h2 style={{ fontSize: 16.5, fontWeight: 700, color: '#1E293B', margin: '0 0 3px 0' }}>
              Sensory Sensitivity Thresholds (v{profile?.profile_version ?? 1})
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              Adjust individual sensory sensitivities to tailor how quickly accommodations trigger.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            style={{
              padding: '9px 18px',
              borderRadius: 12,
              border: 'none',
              background: '#4361EE',
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {savedMsg && (
          <div style={{
            padding: '10px 16px',
            borderRadius: 12,
            background: '#D1FAE5',
            color: '#065F46',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18,
          }}>
            <Check size={16} />
            <span>{savedMsg}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          
          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              <span>Noise Sensitivity</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>{Math.round(noiseSens * 100)}%</span>
            </div>
            <input
              type="range" min="0.1" max="1.0" step="0.01" value={noiseSens}
              onChange={(e) => setNoiseSens(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#10B981' }}
            />
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              <span>Crowd Density Sensitivity</span>
              <span style={{ color: '#3B82F6', fontWeight: 700 }}>{Math.round(crowdSens * 100)}%</span>
            </div>
            <input
              type="range" min="0.1" max="1.0" step="0.01" value={crowdSens}
              onChange={(e) => setCrowdSens(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#3B82F6' }}
            />
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              <span>Lighting Sensitivity</span>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>{Math.round(brightSens * 100)}%</span>
            </div>
            <input
              type="range" min="0.1" max="1.0" step="0.01" value={brightSens}
              onChange={(e) => setBrightSens(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#F59E0B' }}
            />
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              <span>Routine Shift Sensitivity</span>
              <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{Math.round(routineSens * 100)}%</span>
            </div>
            <input
              type="range" min="0.1" max="1.0" step="0.01" value={routineSens}
              onChange={(e) => setRoutineSens(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#8B5CF6' }}
            />
          </div>

          <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: 14, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
              <span>New Location Sensitivity</span>
              <span style={{ color: '#06B6D4', fontWeight: 700 }}>{Math.round(locationSens * 100)}%</span>
            </div>
            <input
              type="range" min="0.1" max="1.0" step="0.01" value={locationSens}
              onChange={(e) => setLocationSens(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#06B6D4' }}
            />
          </div>

        </div>
      </form>

      {/* ── Demo Data Reseed ── */}
      <div style={{
        ...cardStyle,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        background: '#FFF5F5',
        border: '1px solid #FED7D7',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#FEE2E2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertTriangle size={18} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#991B1B' }}>
              Reset & Reseed Demo Data
            </div>
            <p style={{ fontSize: 12, color: '#B91C1C', margin: '2px 0 0 0' }}>
              Resets all recorded situations back to default sample records.
            </p>
          </div>
        </div>

        <button
          onClick={onResetDemo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            borderRadius: 12,
            border: '1px solid #FCA5A5',
            background: '#FFFFFF',
            color: '#DC2626',
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} />
          <span>Reseed Demo Data</span>
        </button>
      </div>

    </div>
  );
};

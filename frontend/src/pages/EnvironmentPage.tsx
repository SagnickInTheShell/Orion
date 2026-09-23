import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Camera, ShieldCheck, AlertCircle, CheckCircle2, Radio } from 'lucide-react';
import { ContextData } from '../types';
import { AudioSensor } from '../utils/audio';
import { CameraSensor } from '../utils/camera';
import { LiveSimulationSliders } from '../components/dashboard/LiveSimulationSliders';

interface EnvironmentPageProps {
  context: ContextData;
  setContext: (ctx: ContextData) => void;
  isMicActive: boolean;
  setIsMicActive: (active: boolean) => void;
  isCamActive: boolean;
  setIsCamActive: (active: boolean) => void;
}

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: 20,
  border: '1px solid #ECEEF1',
  padding: '24px 28px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
};

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({
  context,
  setContext,
  isMicActive,
  setIsMicActive,
  isCamActive,
  setIsCamActive
}) => {
  const [micStatus, setMicStatus] = useState<string>('idle');
  const [camStatus, setCamStatus] = useState<string>('idle');
  const [soundVariation, setSoundVariation] = useState<number>(0.12);
  const [crowdEstimate, setCrowdEstimate] = useState<number>(0.45);

  const audioSensorRef = useRef<AudioSensor | null>(null);
  const cameraSensorRef = useRef<CameraSensor | null>(null);
  const prevNoiseRef = useRef<number>(context.noise_level);

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (isMicActive) {
      if (audioSensorRef.current) {
        audioSensorRef.current.stop();
        audioSensorRef.current = null;
      }
      setIsMicActive(false);
      setMicStatus('inactive');
    } else {
      setMicStatus('connecting');
      const sensor = new AudioSensor((noiseLevel) => {
        const delta = Math.abs(noiseLevel - prevNoiseRef.current);
        setSoundVariation(Number(delta.toFixed(2)));
        prevNoiseRef.current = noiseLevel;

        setContext({
          ...context,
          noise_level: noiseLevel
        });
      });

      const started = await sensor.start();
      if (started) {
        audioSensorRef.current = sensor;
        setIsMicActive(true);
        setMicStatus('active');
      } else {
        setMicStatus('denied');
      }
    }
  };

  // Toggle Camera
  const handleToggleCam = async () => {
    if (isCamActive) {
      if (cameraSensorRef.current) {
        cameraSensorRef.current.stop();
        cameraSensorRef.current = null;
      }
      setIsCamActive(false);
      setCamStatus('inactive');
    } else {
      setCamStatus('connecting');
      const sensor = new CameraSensor(({ brightness, activity }) => {
        const estCrowd = Math.min(1.0, Math.max(0.1, activity * 0.9));
        setCrowdEstimate(Number(estCrowd.toFixed(2)));

        setContext({
          ...context,
          brightness,
          activity_level: activity,
          crowd_level: estCrowd
        });
      });

      const started = await sensor.start();
      if (started) {
        cameraSensorRef.current = sensor;
        setIsCamActive(true);
        setCamStatus('active');
      } else {
        setCamStatus('denied');
      }
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioSensorRef.current) {
        audioSensorRef.current.stop();
      }
      if (cameraSensorRef.current) {
        cameraSensorRef.current.stop();
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* ── Page Header ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#E6F7F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Radio size={18} color="#10B981" strokeWidth={2.2} />
          </div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#1E293B',
            letterSpacing: '-0.3px',
            margin: 0,
          }}>
            Live Environment & Sensors
          </h1>
        </div>
        <p style={{
          fontSize: 13.5,
          color: '#64748B',
          marginTop: 5,
          marginBottom: 0,
        }}>
          Real-time ambient sound and visual sensing. Sensors run entirely locally in your browser and are 100% optional.
        </p>
      </div>

      {/* ── Privacy Guarantee Banner ── */}
      <div style={{
        ...cardStyle,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        background: '#E6F7F0',
        border: '1px solid #A7F3D0',
      }}>
        <ShieldCheck size={22} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#065F46' }}>
            Strict On-Device Privacy Architecture
          </div>
          <p style={{ fontSize: 12.5, color: '#047857', margin: '4px 0 0 0', lineHeight: 1.45 }}>
            Only non-identifying numeric measurements (noise decibel level, brightness, motion delta) are processed. Raw audio or video streams are never transmitted, never saved, and never inspected for speech or faces.
          </p>
        </div>
      </div>

      {/* ── Active Sensor Panels Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
      }}>
        
        {/* Microphone Sensor Panel */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            marginBottom: 16,
            borderBottom: '1px solid #F1F5F9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#E6F7F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Volume2 size={20} color="#10B981" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  Microphone Context
                </h3>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>Web Audio Analyser</span>
              </div>
            </div>

            <button
              onClick={handleToggleMic}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                background: isMicActive ? '#FEE2E2' : '#E6F7F0',
                color: isMicActive ? '#DC2626' : '#065F46',
                transition: 'all 0.15s ease',
              }}
            >
              {isMicActive ? 'Turn Mic OFF' : 'Enable Microphone'}
            </button>
          </div>

          {micStatus === 'denied' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}>
              <AlertCircle size={16} />
              <span>Microphone permission denied. ORION uses manual sensory sliders below.</span>
            </div>
          )}

          {/* Metric Readouts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Ambient Noise Level
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                  {Math.round(context.noise_level * 100)}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 50, background: '#F1F5F9', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 50,
                  width: `${context.noise_level * 100}%`,
                  background: '#10B981',
                  transition: 'width 0.15s ease',
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Sound Spikes / Dynamics
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>
                  {Math.round(soundVariation * 100)}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 50, background: '#F1F5F9', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 50,
                  width: `${soundVariation * 100}%`,
                  background: '#3B82F6',
                  transition: 'width 0.15s ease',
                }} />
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 12,
            color: '#64748B',
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid #F1F5F9',
          }}>
            {isMicActive ? (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <CheckCircle2 size={15} />
                Live acoustic processing active locally in browser memory.
              </span>
            ) : (
              <span>Microphone sensor is offline. You can adjust noise load manually with the sliders below.</span>
            )}
          </div>
        </div>

        {/* Camera Sensor Panel */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            marginBottom: 16,
            borderBottom: '1px solid #F1F5F9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#FEF9E7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Camera size={20} color="#F59E0B" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1E293B', margin: 0 }}>
                  Camera Context
                </h3>
                <span style={{ fontSize: 11.5, color: '#64748B' }}>Low-res Motion & Luminance</span>
              </div>
            </div>

            <button
              onClick={handleToggleCam}
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                background: isCamActive ? '#FEE2E2' : '#FEF3C7',
                color: isCamActive ? '#DC2626' : '#B45309',
                transition: 'all 0.15s ease',
              }}
            >
              {isCamActive ? 'Turn Cam OFF' : 'Enable Camera'}
            </button>
          </div>

          {camStatus === 'denied' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: '#FEF3C7',
              color: '#92400E',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
            }}>
              <AlertCircle size={16} />
              <span>Camera permission denied. ORION uses manual sensory sliders below.</span>
            </div>
          )}

          {/* Metric Readouts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Ambient Luminance
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>
                  {Math.round(context.brightness * 100)}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 50, background: '#F1F5F9', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 50,
                  width: `${context.brightness * 100}%`,
                  background: '#F59E0B',
                  transition: 'width 0.15s ease',
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Motion & Activity
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#8B5CF6' }}>
                  {Math.round(context.activity_level * 100)}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 50, background: '#F1F5F9', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 50,
                  width: `${context.activity_level * 100}%`,
                  background: '#8B5CF6',
                  transition: 'width 0.15s ease',
                }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  Crowd Density Approximation
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6' }}>
                  {Math.round(crowdEstimate * 100)}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 50, background: '#F1F5F9', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 50,
                  width: `${crowdEstimate * 100}%`,
                  background: '#3B82F6',
                  transition: 'width 0.15s ease',
                }} />
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 12,
            color: '#64748B',
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid #F1F5F9',
          }}>
            {isCamActive ? (
              <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                <CheckCircle2 size={15} />
                Optical sampling active (downscaled 48x36 px, 2Hz sampling). No frames saved.
              </span>
            ) : (
              <span>Camera is offline. Light and crowd levels can be adjusted manually below.</span>
            )}
          </div>
        </div>

      </div>

      {/* ── Manual Simulation Sliders ── */}
      <LiveSimulationSliders context={context} onChange={setContext} />

    </div>
  );
};

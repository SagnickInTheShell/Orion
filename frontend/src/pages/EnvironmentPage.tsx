import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Camera, ShieldCheck, Sliders, AlertCircle, CheckCircle2 } from 'lucide-react';
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
        // Calculate sudden variation delta
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
        // Approximate crowd density estimate from activity motion
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
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">
          Environment & Sensor Telemetry
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Layer 1 sensing derives non-invasive ambient acoustic and visual features. Sensors are 100% optional.
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-start space-x-3 text-sky-200">
        <ShieldCheck className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold">Strict Privacy Architecture</div>
          <p className="text-slate-300">
            Only derived numeric environmental features (noise volume, brightness level, activity delta) are sent to the server.
            Raw audio/video is never stored, never transmitted, and never analyzed for facial or speech recognition.
          </p>
        </div>
      </div>

      {/* Active Sensor Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Microphone Sensor Panel */}
        <div className="glass-panel rounded-2xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Microphone Context</h3>
                <span className="text-[10px] text-slate-400">Web Audio API Analyser</span>
              </div>
            </div>

            <button
              onClick={handleToggleMic}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isMicActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-sky-500 text-slate-950 hover:bg-sky-400'
              }`}
            >
              {isMicActive ? 'Turn Microphone OFF' : 'Enable Microphone'}
            </button>
          </div>

          {micStatus === 'denied' && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Microphone unavailable. ORION continues with manual simulation controls.</span>
            </div>
          )}

          {/* Metric Readouts */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Ambient Volume (RMS)</span>
                <span className="font-mono text-sky-400 font-bold">{Math.round(context.noise_level * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-sky-400 h-2 rounded-full transition-all duration-150"
                  style={{ width: `${context.noise_level * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Sound Variation / Spikes</span>
                <span className="font-mono text-indigo-400 font-bold">{Math.round(soundVariation * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-400 h-2 rounded-full transition-all duration-150"
                  style={{ width: `${soundVariation * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            {isMicActive ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Live audio processing active locally in browser memory.
              </span>
            ) : (
              <span>Sensor is offline. You can manually adjust acoustic load using the sliders below.</span>
            )}
          </div>
        </div>

        {/* Camera Sensor Panel */}
        <div className="glass-panel rounded-2xl p-5 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Camera Context</h3>
                <span className="text-[10px] text-slate-400">Low-res Canvas Luminance & Motion</span>
              </div>
            </div>

            <button
              onClick={handleToggleCam}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isCamActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
              }`}
            >
              {isCamActive ? 'Turn Camera OFF' : 'Enable Camera'}
            </button>
          </div>

          {camStatus === 'denied' && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Camera unavailable. ORION continues with manual simulation controls.</span>
            </div>
          )}

          {/* Metric Readouts */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Environmental Lighting (Luminance)</span>
                <span className="font-mono text-amber-400 font-bold">{Math.round(context.brightness * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${context.brightness * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Movement Activity Delta</span>
                <span className="font-mono text-teal-400 font-bold">{Math.round(context.activity_level * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-teal-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${context.activity_level * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Approximate Crowd Estimate</span>
                <span className="font-mono text-indigo-400 font-bold">{Math.round(crowdEstimate * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${crowdEstimate * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            {isCamActive ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Optical sampling active (48x36 px, 2Hz sampling). No frames stored.
              </span>
            ) : (
              <span>Camera is offline. Lighting and crowd levels can be adjusted manually.</span>
            )}
          </div>
        </div>

      </div>

      {/* Manual Simulation Controls */}
      <section>
        <div className="mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Interactive Override Sliders
          </h3>
        </div>
        <LiveSimulationSliders context={context} onChange={setContext} />
      </section>

    </div>
  );
};

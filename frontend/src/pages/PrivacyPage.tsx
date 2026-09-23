import React, { useState } from 'react';
import { ShieldCheck, Check, Lock, Sliders, RotateCcw, AlertTriangle, EyeOff, MicOff } from 'lucide-react';
import { PersonalProfile } from '../types';
import { api } from '../services/api';

interface PrivacyPageProps {
  userId: number;
  profile: PersonalProfile | null;
  onProfileUpdated: (updated: PersonalProfile) => void;
  onResetDemo: () => void;
}

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
      setSavedMsg("Personal sensitivity profile updated successfully.");
    } catch (err: any) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const privacyGuarantees = [
    { title: "Raw camera frames are not stored", desc: "Only lightweight brightness and motion metrics are computed locally in ephemeral browser memory.", icon: EyeOff },
    { title: "Raw microphone audio is not stored", desc: "Acoustic signals are converted immediately to numeric RMS volume levels via the browser Web Audio API.", icon: MicOff },
    { title: "Sensor access is strictly optional", desc: "ORION functions fully using manual context sliders. No microphone or camera permission is ever mandatory.", icon: Sliders },
    { title: "You control your personal model", desc: "Sensitivity weights and strategy feedback can be fine-tuned or reset at any time.", icon: Lock },
    { title: "Never a medical or autism diagnostic tool", desc: "ORION estimates personal support demand rather than making clinical assertions or emotion guesses.", icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-400" />
          Privacy, Ethics & Personal Digital Twin Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Full transparency over your data, environmental telemetry handling, and personal trigger sensitivities.
        </p>
      </div>

      {/* Privacy Commitments Grid */}
      <div className="glass-panel-glow rounded-2xl p-6 border-slate-800 space-y-4">
        <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
          YOUR DATA & PRIVACY GUARANTEES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {privacyGuarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-3">
                <div className="h-7 w-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 text-sky-400 mt-0.5">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Digital Twin Sensitivity Tuning */}
      <form onSubmit={handleSaveProfile} className="glass-panel rounded-2xl p-6 border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Personal Sensitivity Profile (Digital Twin v{profile?.profile_version ?? 1})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust your individual trigger thresholds. These weights calibrate ORION's support requirement predictions.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{savedMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Acoustic Noise Sensitivity</span>
              <span className="font-mono font-bold text-sky-400">{Math.round(noiseSens * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={noiseSens}
              onChange={(e) => setNoiseSens(parseFloat(e.target.value))}
              className="w-full accent-sky-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Crowd Density Sensitivity</span>
              <span className="font-mono font-bold text-indigo-400">{Math.round(crowdSens * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={crowdSens}
              onChange={(e) => setCrowdSens(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Lighting Glare Sensitivity</span>
              <span className="font-mono font-bold text-amber-400">{Math.round(brightSens * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={brightSens}
              onChange={(e) => setBrightSens(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Routine Change Sensitivity</span>
              <span className="font-mono font-bold text-purple-400">{Math.round(routineSens * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={routineSens}
              onChange={(e) => setRoutineSens(parseFloat(e.target.value))}
              className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Unfamiliar Location Sensitivity</span>
              <span className="font-mono font-bold text-emerald-400">{Math.round(locationSens * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.01"
              value={locationSens}
              onChange={(e) => setLocationSens(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>
      </form>

      {/* Demo Reset / Reseed Danger Zone */}
      <div className="glass-panel rounded-2xl p-5 border-rose-500/20 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
            <AlertTriangle className="h-4 w-4" />
            <span>Judge Demo Reset</span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Resets all recorded contexts and reseeds the baseline demo dataset for Alex (25+ scenarios, 8 interventions).
          </p>
        </div>

        <button
          onClick={onResetDemo}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reseed Demo Dataset</span>
        </button>
      </div>

    </div>
  );
};

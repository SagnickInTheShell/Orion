import React, { useState, useRef, useEffect } from "react";
import {
  Camera, Edit3, Save, X, User, Star, Zap, Shield,
  Volume2, Eye, Users, RefreshCw, MapPin, Upload, CheckCircle
} from "lucide-react";
import { PersonalProfile } from "../types";

interface SpacePageProps {
  userId: number;
  userName: string;
  profile: PersonalProfile | null;
  onProfileUpdated: (p: PersonalProfile) => void;
  onNameChange: (name: string) => void;
}

const AVATAR_KEY = "orion_avatar_dataurl";

export const SpacePage: React.FC<SpacePageProps> = ({
  userId, userName, profile, onProfileUpdated, onNameChange
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem(AVATAR_KEY));
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setNameInput(userName); }, [userName]);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setAvatarUrl(url);
      localStorage.setItem(AVATAR_KEY, url);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onNameChange(trimmed);
    setEditingName(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const sensitivityItems = profile ? [
    { label: "Noise", value: profile.noise_sensitivity, Icon: Volume2, color: "#6366F1" },
    { label: "Crowds", value: profile.crowd_sensitivity, Icon: Users, color: "#EC4899" },
    { label: "Brightness", value: profile.brightness_sensitivity, Icon: Eye, color: "#F59E0B" },
    { label: "Routine Change", value: profile.routine_change_sensitivity, Icon: RefreshCw, color: "#10B981" },
    { label: "New Places", value: profile.unfamiliar_location_sensitivity, Icon: MapPin, color: "#3B82F6" },
  ] : [];

  const levelLabel = (v: number) => v < 0.4 ? "Low" : v < 0.7 ? "Medium" : "High";
  const levelColor = (v: number) => v < 0.4 ? "#10B981" : v < 0.7 ? "#F59E0B" : "#EF4444";

  const stats = [
    { label: "Profile Version", value: profile?.profile_version ?? "—", Icon: Star, bg: "#EEF2FF", ic: "#6366F1" },
    { label: "Privacy Mode", value: "On-device", Icon: Shield, bg: "#DCFCE7", ic: "#10B981" },
    { label: "AI Adapts to", value: "You", Icon: Zap, bg: "#FEF3C7", ic: "#F59E0B" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Hero Card */}
      <div style={{
        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)",
        borderRadius: 24,
        padding: "36px 40px",
        display: "flex",
        alignItems: "center",
        gap: 32,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(99,102,241,0.25)",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 80, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: dragOver ? "3px dashed #fff" : "3px solid rgba(255,255,255,0.5)",
              background: dragOver ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={40} color="rgba(255,255,255,0.85)" strokeWidth={1.5} />
            )}
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: "absolute", bottom: 2, right: 2,
              width: 30, height: 30, borderRadius: "50%",
              background: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <Camera size={14} color="#6366F1" strokeWidth={2.2} />
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
        </div>

        {/* Name */}
        <div style={{ flex: 1, zIndex: 1 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: "0 0 6px", fontWeight: 500 }}>Welcome back 👋</p>
          {editingName ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
                style={{
                  fontSize: 26, fontWeight: 800, color: "#fff",
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: 10, padding: "4px 12px", outline: "none", width: 200, letterSpacing: "-0.5px",
                }}
              />
              <button onClick={handleSaveName} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}>
                <Save size={17} color="#fff" />
              </button>
              <button onClick={() => { setEditingName(false); setNameInput(userName); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer" }}>
                <X size={17} color="rgba(255,255,255,0.7)" />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>{userName}</h1>
              <button onClick={() => setEditingName(true)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Edit3 size={15} color="rgba(255,255,255,0.85)" />
              </button>
            </div>
          )}
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", margin: "8px 0 0", fontWeight: 400 }}>Your personal autism support companion</p>
          {saved && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <CheckCircle size={14} color="#A7F3D0" />
              <span style={{ fontSize: 12.5, color: "#A7F3D0", fontWeight: 600 }}>Name saved!</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 18, border: "1px solid #ECEEF1",
            padding: "20px 22px", display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.Icon size={20} color={s.ic} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B", lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sensitivity Profile */}
      <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #ECEEF1", padding: "26px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", margin: 0 }}>My Sensitivity Profile</h2>
            <p style={{ fontSize: 12.5, color: "#64748B", margin: "4px 0 0" }}>Orion learns and adapts these automatically over time</p>
          </div>
          {profile && (
            <span style={{ background: "#EEF2FF", color: "#4F46E5", fontSize: 11.5, fontWeight: 700, padding: "5px 12px", borderRadius: 50 }}>
              v{profile.profile_version}
            </span>
          )}
        </div>
        {sensitivityItems.length === 0 ? (
          <p style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Loading sensitivity data...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {sensitivityItems.map(item => {
              const pct = Math.round(item.value * 100);
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <item.Icon size={16} color={item.color} strokeWidth={2.2} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{item.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: levelColor(item.value) }}>{levelLabel(item.value)}</span>
                      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{pct}%</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${item.color}88, ${item.color})`, transition: "width 0.6s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload CTA */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? "#6366F1" : "#CBD5E1"}`,
          borderRadius: 20, padding: "28px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          cursor: "pointer", background: dragOver ? "#EEF2FF" : "#FAFBFF",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 16, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Upload size={24} color="#6366F1" strokeWidth={2} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{avatarUrl ? "Change Profile Photo" : "Upload Profile Photo"}</div>
          <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 4 }}>Click or drag & drop · JPG, PNG, GIF, WEBP · Stored only on this device</div>
        </div>
      </div>

    </div>
  );
};

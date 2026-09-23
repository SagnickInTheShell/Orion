import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck, AudioLines, Users, Sun, Footprints,
  ChevronRight
} from 'lucide-react';
import { HomePage } from './pages/HomePage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { PrepModePage } from './pages/PrepModePage';
import { PatternsPage } from './pages/PatternsPage';
import { HistoryPage } from './pages/HistoryPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SpacePage } from './pages/SpacePage';
import { FeedbackModal } from './components/dashboard/FeedbackModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import {
  ContextData,
  PredictionResponse,
  RecommendationItem,
  PersonalProfile,
  ContextResponse
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [userId, setUserId] = useState<number>(1);
  const [userName, setUserName] = useState<string>('Sagnick');
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [profileVersion, setProfileVersion] = useState<number>(1);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [calmMode, setCalmMode] = useState<boolean>(false);

  const [context, setContext] = useState<ContextData>({
    noise_level: 0.15,
    crowd_level: 0.12,
    brightness: 0.50,
    activity_level: 0.18,
    routine_change: false,
    unfamiliar_location: false
  });

  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [explanation, setExplanation] = useState<string>('Sensory and environmental signals are optimal.');
  const [recentHistory, setRecentHistory] = useState<ContextResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<RecommendationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>('calm');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadUserData = useCallback(async () => {
    try {
      const users = await api.getUsers();
      if (users.length > 0) {
        const u = users[0];
        setUserId(u.id);
        const cleanedName = u.name.replace(' (Demo)', '').replace(' (Demo Profile v1)', '');
        if (cleanedName && cleanedName !== 'Alex' && cleanedName !== 'Demo User') {
          setUserName(cleanedName);
        } else {
          setUserName('Sagnick');
        }
        const p = await api.getProfile(u.id);
        setProfile(p);
        setProfileVersion(p.profile_version);
      }
      const historyData = await api.getContextHistory(userId);
      setRecentHistory(historyData);
    } catch (err) {
      console.warn('Backend connection note:', err);
    }
  }, [userId]);

  useEffect(() => { loadUserData(); }, []);

  const debounceTimerRef = useRef<any>(null);

  const runPipeline = async (ctx: ContextData) => {
    setIsLoading(true);
    try {
      const [predResp, recResp, histResp] = await Promise.all([
        api.predictSupport(userId, ctx),
        api.getRecommendations(userId, ctx),
        api.getContextHistory(userId)
      ]);
      setPrediction(predResp);
      setRecommendations(recResp.recommendations);
      setExplanation(recResp.explanation);
      setRecentHistory(histResp);
    } catch (err) {
      console.error('Pipeline error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => runPipeline(context), 150);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [context, userId, profileVersion]);

  const handleResetDemo = async () => {
    if (window.confirm('Reset all recorded situations?')) {
      try {
        await api.resetDemoData();
        showToast('Demo data reseeded.');
        loadUserData();
        setContext({
          noise_level: 0.15,
          crowd_level: 0.12,
          brightness: 0.50,
          activity_level: 0.18,
          routine_change: false,
          unfamiliar_location: false
        });
      } catch (err: any) {
        alert('Failed to reset: ' + err.message);
      }
    }
  };

  const handleSelectHistoryContext = (hist: ContextResponse) => {
    setContext({
      noise_level: hist.noise_level,
      crowd_level: hist.crowd_level,
      brightness: hist.brightness,
      activity_level: hist.activity_level,
      routine_change: hist.routine_change,
      unfamiliar_location: hist.unfamiliar_location
    });
    showToast('Context loaded from history.');
  };

  const handleFeedbackRecorded = (fbResp: any) => {
    setProfileVersion(prev => prev + 1);
    showToast(fbResp.message);
    runPipeline(context);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      background: '#F8F9FA',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onShowOnboarding={() => setShowOnboarding(true)}
      />

      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        <TopBar
          userName={userName}
          profileVersion={profileVersion}
          calmMode={calmMode}
          setCalmMode={setCalmMode}
          onResetDemo={handleResetDemo}
        />

        <div style={{
          padding: '6px 36px 36px',
          display: 'flex',
          gap: 24,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeTab === 'home' && (
              <HomePage
                userName={userName}
                context={context}
                setContext={setContext}
                prediction={prediction}
                recommendations={recommendations}
                explanation={explanation}
                onOpenWhatIf={() => setActiveTab('whatif')}
                onOpenFeedback={(item) => setSelectedFeedbackItem(item)}
                recentHistory={recentHistory}
                onSelectHistoryContext={handleSelectHistoryContext}
                isLoading={isLoading}
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'environment' && (
              <EnvironmentPage
                context={context}
                setContext={setContext}
                isMicActive={isMicActive}
                setIsMicActive={setIsMicActive}
                isCamActive={isCamActive}
                setIsCamActive={setIsCamActive}
              />
            )}
            {activeTab === 'whatif' && <WhatIfPage userId={userId} currentContext={context} />}
            {activeTab === 'prep' && <PrepModePage userId={userId} />}
            {activeTab === 'patterns' && <PatternsPage userId={userId} />}
            {activeTab === 'history' && <HistoryPage userId={userId} />}
            {activeTab === 'space' && (
              <SpacePage
                userId={userId}
                userName={userName}
                profile={profile}
                onProfileUpdated={(p) => {
                  setProfile(p);
                  setProfileVersion(p.profile_version);
                }}
                onNameChange={(name) => setUserName(name)}
              />
            )}
            {activeTab === 'privacy' && (
              <PrivacyPage
                userId={userId}
                profile={profile}
                onProfileUpdated={(p) => {
                  setProfile(p);
                  setProfileVersion(p.profile_version);
                  showToast('Profile saved.');
                }}
                onResetDemo={handleResetDemo}
              />
            )}
          </div>

          {activeTab === 'home' && (
            <RightPanel
              context={context}
              prediction={prediction}
              onNavigate={setActiveTab}
            />
          )}
        </div>
      </div>

      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 60, pointerEvents: 'none' }}>
          <div style={{
            background: '#1E293B',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 12,
            fontSize: 13.5,
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }}>
            {toastMessage}
          </div>
        </div>
      )}

      <FeedbackModal
        item={selectedFeedbackItem}
        onClose={() => setSelectedFeedbackItem(null)}
        onFeedbackRecorded={handleFeedbackRecorded}
      />
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(name, sens) => {
          setUserName(name);
          api.updateProfile(userId, sens).then(p => {
            setProfile(p);
            setProfileVersion(p.profile_version);
            showToast('Profile setup complete!');
          });
        }}
      />
    </div>
  );
};

/* ─── Right Panel matching reference image ────────────────────────────────── */
interface RightPanelProps {
  context: ContextData;
  prediction: PredictionResponse | null;
  onNavigate: (tab: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ context, onNavigate }) => {
  const envMetrics = [
    {
      label: 'Noise',
      status: context.noise_level < 0.35 ? 'Low' : context.noise_level < 0.65 ? 'Moderate' : 'High',
      color: context.noise_level < 0.35 ? '#10B981' : context.noise_level < 0.65 ? '#F59E0B' : '#EF4444',
      Icon: AudioLines,
    },
    {
      label: 'Crowd',
      status: context.crowd_level < 0.35 ? 'Low' : context.crowd_level < 0.65 ? 'Moderate' : 'High',
      color: context.crowd_level < 0.35 ? '#10B981' : context.crowd_level < 0.65 ? '#F59E0B' : '#EF4444',
      Icon: Users,
    },
    {
      label: 'Brightness',
      status: context.brightness < 0.35 ? 'Low' : context.brightness < 0.65 ? 'Moderate' : 'High',
      color: context.brightness < 0.35 ? '#10B981' : context.brightness < 0.65 ? '#F59E0B' : '#EF4444',
      Icon: Sun,
    },
    {
      label: 'Activity',
      status: context.activity_level < 0.35 ? 'Low' : context.activity_level < 0.65 ? 'Moderate' : 'High',
      color: context.activity_level < 0.35 ? '#10B981' : context.activity_level < 0.65 ? '#F59E0B' : '#EF4444',
      Icon: Footprints,
    },
  ];

  return (
    <div style={{
      width: 320,
      minWidth: 320,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
    }}>

      {/* ── Card 1: "Your Environment" matching reference ── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #ECEEF1',
        padding: '22px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            {/* Green environment icon in circle */}
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#E6F7F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldCheck size={16} color="#10B981" strokeWidth={2.2} />
            </div>
            <h3 style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1E293B',
              margin: 0,
              letterSpacing: '-0.2px',
            }}>
              Your Environment
            </h3>
          </div>

          {/* ● Live pill badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            background: '#DCFCE7',
            borderRadius: 50,
            fontSize: 11.5,
            fontWeight: 700,
            color: '#15803D',
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#10B981',
              boxShadow: '0 0 0 2px rgba(16,185,129,0.2)',
            }} />
            Live
          </div>
        </div>

        {/* 4 Metric Rows matching reference */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          {envMetrics.map(m => (
            <div
              key={m.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <m.Icon size={18} color="#10B981" strokeWidth={2} />
                <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 500 }}>
                  {m.label}
                </span>
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 600,
                color: m.color,
              }}>
                {m.status}
              </span>
            </div>
          ))}
        </div>

        {/* View Details → Pill button matching reference */}
        <button
          onClick={() => onNavigate('environment')}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 12,
            border: 'none',
            background: '#E6F7F0',
            color: '#065F46',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#D1FAE5')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#E6F7F0')}
        >
          View Details <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Card 2: Sunset Mountain Quote Card matching reference ── */}
      <div style={{
        borderRadius: 20,
        overflow: 'hidden',
        height: 190,
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Layered mountain sunset SVG art matching reference */}
        <svg
          viewBox="0 0 320 190"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="35%" stopColor="#FDA4AF" />
              <stop offset="70%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
            <linearGradient id="mountGradFar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6D28D9" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#312E81" />
            </linearGradient>
            <linearGradient id="mountGradMid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3730A3" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
            <linearGradient id="mountGradFore" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="320" height="190" fill="url(#skyGrad)" />

          {/* Distant mountains */}
          <path d="M0 135 L40 105 L80 120 L130 90 L180 115 L230 85 L280 110 L320 95 L320 190 L0 190 Z" fill="url(#mountGradFar)" />

          {/* Mid mountains */}
          <path d="M0 150 L55 125 L105 140 L160 110 L210 135 L270 115 L320 130 L320 190 L0 190 Z" fill="url(#mountGradMid)" />

          {/* Foreground mountain silhouette */}
          <path d="M0 165 L70 140 L140 160 L210 130 L275 155 L320 145 L320 190 L0 190 Z" fill="url(#mountGradFore)" />
        </svg>

        {/* Text Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          zIndex: 1,
        }}>
          <p style={{
            fontSize: 16.5,
            fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1.45,
            margin: '0 0 14px 0',
            letterSpacing: '-0.2px',
            textShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}>
            "A calmer mind leads to a brighter tomorrow."
          </p>
          <div style={{
            width: 32,
            height: 2.5,
            background: 'rgba(255,255,255,0.75)',
            borderRadius: 2,
          }} />
        </div>
      </div>

      {/* ── Card 3: "You're Not Alone" Community Card matching reference ── */}
      <div
        onClick={() => onNavigate('patterns')}
        role="button"
        style={{
          background: '#FFFFFF',
          borderRadius: 20,
          border: '1px solid #ECEEF1',
          padding: '20px 22px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 18px rgba(0,0,0,0.06)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
          (e.currentTarget as HTMLDivElement).style.transform = 'none';
        }}
      >
        {/* Yellow/amber community icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: '#FEF3C7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Users size={22} color="#D97706" strokeWidth={2} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 14.5,
            fontWeight: 700,
            color: '#1E293B',
            lineHeight: 1.25,
          }}>
            You're Not Alone
          </div>
          <div style={{
            fontSize: 12,
            color: '#64748B',
            marginTop: 3,
            lineHeight: 1.35,
          }}>
            Helpful resources, tips and stories from the community.
          </div>
        </div>

        <ChevronRight size={18} color="#94A3B8" strokeWidth={2} />
      </div>

    </div>
  );
};

export default App;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { PrepModePage } from './pages/PrepModePage';
import { PatternsPage } from './pages/PatternsPage';
import { HistoryPage } from './pages/HistoryPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { FeedbackModal } from './components/dashboard/FeedbackModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import {
  ContextData,
  PredictionResponse,
  RecommendationItem,
  PersonalProfile,
  ContextResponse
} from './types';
import { api } from './services/api';

function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('orion-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem('orion-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userId, setUserId] = useState<number>(1);
  const [userName, setUserName] = useState<string>('Alex (Demo)');
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [profileVersion, setProfileVersion] = useState<number>(1);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const [context, setContext] = useState<ContextData>({
    noise_level: 0.82,
    crowd_level: 0.76,
    brightness: 0.70,
    activity_level: 0.55,
    routine_change: false,
    unfamiliar_location: false
  });

  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isCamActive, setIsCamActive] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [explanation, setExplanation] = useState<string>('Initializing personal intelligence pipeline...');
  const [recentHistory, setRecentHistory] = useState<ContextResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<RecommendationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        setUserName(u.name);
        const p = await api.getProfile(u.id);
        setProfile(p);
        setProfileVersion(p.profile_version);
      }
      const historyData = await api.getContextHistory(userId);
      setRecentHistory(historyData);
    } catch (err) {
      console.warn('Backend not yet ready:', err);
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
    if (window.confirm("Reset all recorded situations?")) {
      try {
        await api.resetDemoData();
        showToast('Demo data reseeded.');
        loadUserData();
        setContext({ noise_level: 0.82, crowd_level: 0.76, brightness: 0.70, activity_level: 0.55, routine_change: false, unfamiliar_location: false });
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
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profileVersion={profileVersion}
        userName={userName}
        onResetDemo={handleResetDemo}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50" style={{ pointerEvents: 'none' }}>
          <div className="toast">{toastMessage}</div>
        </div>
      )}

      <main className="content-shell" style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardPage
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
      </main>

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

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ORION - Personalized AI for Proactive Autism Support</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>"It doesn't learn autism. It learns the individual."</span>
          <button className="ghost-link" onClick={() => setShowOnboarding(true)} style={{ fontSize: 11 }}>Re-run Setup Wizard</button>
        </div>
      </footer>
    </div>
  );
};

export default App;

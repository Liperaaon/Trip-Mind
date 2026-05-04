import React, { useState } from 'react';

import { AppProvider, useApp } from './context/AppContext';
import BottomNav       from './components/BottomNav';
import AuthScreen      from './screens/AuthScreen';
import CreateTripModal from './components/CreateTripModal';

import HomeTab      from './tabs/HomeTab';
import LocationTab  from './tabs/LocationTab';
import ItineraryTab from './tabs/ItineraryTab';
import HistoryTab   from './tabs/HistoryTab';
import ProfileTab   from './tabs/ProfileTab';

const TABS = {
  home:      HomeTab,
  location:  LocationTab,
  itinerary: ItineraryTab,
  history:   HistoryTab,
  profile:   ProfileTab,
};

// ─── Shell interno (só renderiza com user logado) ─────────────

function AppShell() {
  const { user, authLoading } = useApp();
  const [activeTab, setActiveTab]     = useState('home');
  const [showCreate, setShowCreate]   = useState(false);

  // Splashscreen enquanto verifica auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl">✈️</span>
        </div>
        <div className="w-6 h-6 border-2 border-slate-200 border-t-[#0F172A] rounded-full animate-spin" />
      </div>
    );
  }

  // Não autenticado → tela de login
  if (!user) return <AuthScreen />;

  const ActiveScreen = TABS[activeTab] ?? HomeTab;
  const needsBottomPadding = activeTab !== 'location';

  const handleTabChange = (tab) => {
    if (tab === 'add') { setShowCreate(true); return; }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] selection:bg-blue-100">
      <div className={needsBottomPadding ? 'pb-36' : ''}>
        <ActiveScreen />
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)} />}

      <style>{`
        body { -webkit-tap-highlight-color: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

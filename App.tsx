
import React, { useState, createContext, useEffect, Dispatch, SetStateAction, useMemo } from 'react';
import { UserData, Screen, UserProfile } from './types';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';

import Onboarding from './components/Onboarding';
import HomeScreen from './screens/HomeScreen';
import JournalScreen from './screens/JournalScreen';
import AIChatScreen from './screens/AIChatScreen';
import ProgramsScreen from './screens/ProgramsScreen';
import LearnScreen from './screens/LearnScreen';
import MoreScreen from './screens/MoreScreen';
import SOSScreen from './screens/SOSScreen';
import CommunityChatScreen from './screens/CommunityChatScreen';
import CommunityStoriesScreen from './screens/CommunityStoriesScreen';
import MyStoriesScreen from './screens/MyStoriesScreen';
import StoryEditorScreen from './screens/StoryEditorScreen';
import AuthScreen from './screens/AuthScreen';
import LoadingScreen from './components/Loading';
import { HomeIcon, JournalIcon, ChatIcon, ProgramsIcon, MoreIcon, SOSIcon, ChevronLeftIcon } from './components/Icons';

export const initialUserProfile: Omit<UserProfile, 'id'> = {
  name: '',
  role: 'user',
  onboardingComplete: false,
  anonymous_display_name: null,
  breakupContext: { role: '', initiator: '', reason: '', redFlags: '', feelings: [] },
  exName: '',
  shieldList: ['', '', '', '', ''],
  baseline: { mood: 5, sleep: 8, anxiety: 5, urge: 5 },
  program: null,
  programDay: 1,
  lastTaskCompletedDate: null,
  streaks: { noContact: 0, journaling: 0, selfCare: 0 },
  emergencyContact: { name: '', phone: '' },
};

export interface AppContextType {
    session: Session | null;
    user: User | null;
    userData: UserData | null;
    setUserData: Dispatch<SetStateAction<UserData | null>>;
    activeScreen: Screen;
    navigationStack: Screen[];
    navigateTo: (screen: Screen) => void;
    goBack: () => void;
    resetToScreen: (screen: Screen) => void;
    showSOS: boolean;
    setShowSOS: Dispatch<SetStateAction<boolean>>;
    activeStoryId: number | null;
    setActiveStoryId: Dispatch<SetStateAction<number | null>>;
}

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [navigationStack, setNavigationStack] = useState<Screen[]>(['home']);
  const [showSOS, setShowSOS] = useState<boolean>(false);
  const [activeStoryId, setActiveStoryId] = useState<number | null>(null);
  const [theme, setTheme] = useState('theme-dusk');

  useEffect(() => {
    const hour = new Date().getHours();
    const currentTheme = hour >= 6 && hour < 18 ? 'theme-dawn' : 'theme-dusk';
    setTheme(currentTheme);
    document.documentElement.className = currentTheme;
  }, []);

  const handleUserSession = async (user: User) => {
    setLoading(true);
    try {
        // --- 1. Fetch Profile (Critical) ---
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError && !profileError.message.includes('fetch')) {
            throw profileError;
        }
        
        // --- 2. Create Profile if missing ---
        if (!profile) {
            const { role, ...profileDefaults } = initialUserProfile;
            const newProfileData = {
                id: user.id,
                ...profileDefaults,
                name: user.email?.split('@')[0] || 'Friend',
            };

            const { data: insertedProfile, error: insertError } = await supabase
                .from('profiles')
                .insert(newProfileData)
                .select()
                .single();

            if (insertError) {
              profile = { ...newProfileData, id: user.id } as any;
            } else {
              profile = insertedProfile;
            }
        }

        // --- 3. Safe Loading for other data ---
        const safeFetch = async (query: any) => {
            try {
                const { data, error } = await query;
                if (error) return [];
                return data || [];
            } catch (e) {
                return [];
            }
        };

        const [journal, moods, stories, chats] = await Promise.all([
            safeFetch(supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false })),
            safeFetch(supabase.from('moods').select('*').eq('user_id', user.id).order('date', { ascending: false })),
            safeFetch(supabase.from('my_stories').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })),
            safeFetch(supabase.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true }))
        ]);

        setUserData({
            ...(profile as any),
            journalEntries: journal,
            moods: moods,
            myStories: stories,
            chatHistory: chats,
        });

    } catch (error: any) {
        console.error("Session Setup Error:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) await handleUserSession(currentSession.user);
        else setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        setSession(currentSession);
        if (event === 'SIGNED_IN' && currentSession?.user) {
            await handleUserSession(currentSession.user);
        } else if (event === 'SIGNED_OUT') {
            setUserData(null);
            setNavigationStack(['home']);
            setLoading(false);
        }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const contextValue: AppContextType = useMemo(() => ({
      session,
      user: session?.user || null,
      userData,
      setUserData,
      activeScreen: navigationStack[navigationStack.length - 1],
      navigationStack,
      navigateTo: (screen: Screen) => setNavigationStack(s => [...s, screen]),
      goBack: () => setNavigationStack(s => (s.length > 1 ? s.slice(0, -1) : s)),
      resetToScreen: (screen: Screen) => setNavigationStack([screen]),
      showSOS,
      setShowSOS,
      activeStoryId,
      setActiveStoryId
  }), [session, userData, navigationStack, showSOS, activeStoryId]);

  if (loading) return <LoadingScreen />;
  if (!session) return <AuthScreen />;

  if (userData && !userData.onboardingComplete) {
    return (
      <AppContext.Provider value={contextValue}>
        <Onboarding 
          initialData={userData} 
          onComplete={async (p) => {
            const updated = {...p, onboardingComplete: true};
            setUserData(prev => prev ? ({...prev, ...updated}) : null);
            await supabase.from('profiles').upsert({ id: userData.id, ...updated });
          }} 
        />
      </AppContext.Provider>
    );
  }

  const backgroundClass = theme === 'theme-dawn'
    ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
    : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';

  const renderScreen = () => {
    const screen = navigationStack[navigationStack.length - 1];
    switch (screen) {
      case 'home': return <HomeScreen />;
      case 'journal': return <JournalScreen />;
      case 'chat': return <AIChatScreen />;
      case 'programs': return <ProgramsScreen />;
      case 'learn': return <LearnScreen />;
      case 'more': return <MoreScreen />;
      case 'community-group-simulation': return <CommunityChatScreen />;
      case 'community-stories': return <CommunityStoriesScreen />;
      case 'my-stories': return <MyStoriesScreen />;
      case 'story-editor': return <StoryEditorScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen font-sans flex flex-col h-screen transition-colors duration-500 ${backgroundClass} ${theme}`}>
        {showSOS && <SOSScreen />}
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-20">
          {renderScreen()}
        </main>
        <BottomNav />
      </div>
    </AppContext.Provider>
  );
};

const Header: React.FC = () => {
  const context = React.useContext(AppContext);
  if (!context) return null;
  const { setShowSOS, goBack, activeScreen } = context;
  const isTabScreen = ['home', 'journal', 'chat', 'programs', 'learn', 'more'].includes(activeScreen);
  const isDawn = document.documentElement.classList.contains('theme-dawn');
  const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';

  return (
    <header className="grid grid-cols-3 items-center p-4 bg-transparent sticky top-0 z-10 backdrop-blur-sm">
      <div className="justify-self-start">
        {!isTabScreen && (
          <button onClick={goBack} className="p-2 rounded-full hover:bg-black/5" aria-label="Go back">
            <ChevronLeftIcon className={`w-6 h-6 ${textColor}`} />
          </button>
        )}
      </div>
      <div className="justify-self-center">
        <h1 className={`text-2xl font-thin tracking-widest uppercase ${textColor}`}>Venti</h1>
      </div>
      <div className="justify-self-end">
        <button onClick={() => setShowSOS(true)} className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold shadow-lg hover:bg-red-600 transition-all flex items-center space-x-1">
          <SOSIcon className="w-4 h-4" />
          <span>SOS</span>
        </button>
      </div>
    </header>
  );
};

const BottomNav: React.FC = () => {
  const context = React.useContext(AppContext);
  if (!context) return null;
  const { activeScreen, resetToScreen } = context;
  const isDawn = document.documentElement.classList.contains('theme-dawn');

  const navItems = [
    { screen: 'home' as Screen, label: 'Home', icon: HomeIcon },
    { screen: 'journal' as Screen, label: 'Journal', icon: JournalIcon },
    { screen: 'chat' as Screen, label: 'AI Chat', icon: ChatIcon },
    { screen: 'programs' as Screen, label: 'Program', icon: ProgramsIcon },
    { screen: 'more' as Screen, label: 'More', icon: MoreIcon },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-md flex justify-around p-2 z-10 ${isDawn ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-700'}`}>
      {navItems.map((item) => (
        <button
          key={item.screen}
          onClick={() => resetToScreen(item.screen)}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
            activeScreen === item.screen 
              ? (isDawn ? 'bg-dawn-primary/10 text-dawn-primary' : 'bg-dusk-primary/20 text-dusk-primary') 
              : (isDawn ? 'text-slate-400' : 'text-slate-500')
          }`}
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default App;

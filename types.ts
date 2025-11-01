// Fix: Import types from React to resolve namespace errors.
import type { Dispatch, SetStateAction } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type Screen = 'home' | 'journal' | 'chat' | 'programs' | 'sos' | 'more' | 'community-group-simulation' | 'community-stories' | 'my-stories' | 'story-editor' | 'learn' | 'admin-dashboard';
export type Program = 'healing' | 'glow-up' | 'no-contact';

// This represents the data stored in the 'profiles' table
export interface UserProfile {
  id: string; // Corresponds to auth.users.id
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  onboardingComplete: boolean;
  anonymous_display_name: string | null;
  breakupContext: {
    role: 'dumpee' | 'dumper' | 'mutual' | '';
    initiator: 'me' | 'them' | 'mutual' | '';
    reason: string;
    redFlags: 'yes' | 'no' | 'unsure' | '';
    feelings: string[];
  };
  exName: string;
  shieldList: string[];
  baseline: {
    mood: number;
    sleep: number;
    anxiety: number;
    urge: number;
  };
  program: Program | null;
  programDay: number;
  lastTaskCompletedDate: string | null;
  streaks: {
    noContact: number;
    journaling: number;
    selfCare: number;
  };
  emergencyContact: {
    name: string;
    phone: string;
  };
}

// This is the composite object used in the React context, assembled from multiple tables
export interface UserData extends UserProfile {
  journalEntries: JournalEntry[];
  myStories: MyStory[];
  moods: MoodEntry[];
  chatHistory: ChatMessage[];
}


export interface JournalEntry {
  id: number; // Primary key from DB
  user_id: string;
  created_at: string;
  prompt?: string;
  content: string;
  mood: number;
}

export interface MyStory {
  id: number; // Primary key from DB
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
}

export interface MoodEntry {
  id: number; // Primary key from DB
  user_id: string;
  created_at: string; 
  date: string; // YYYY-MM-DD
  mood: number;
}

export interface ChatMessage {
  id?: number; // Primary key from DB
  user_id: string;
  created_at?: string;
  role: 'user' | 'model';
  text: string;
}

export interface CommunityGroupSimulationMessage {
  id: number;
  name: string; // 'Liam', 'Chloe', 'Maya', etc.
  text: string;
}

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
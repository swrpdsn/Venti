
// This file contains only shared types with no external dependencies
export type Screen = 'home' | 'journal' | 'chat' | 'programs' | 'sos' | 'more' | 'community-group-simulation' | 'community-stories' | 'my-stories' | 'story-editor' | 'learn' | 'admin-dashboard';
export type Program = 'healing' | 'glow-up' | 'no-contact';

export interface UserProfile {
  id: string;
  name: string; // This will be the "Display Name"
  anonymous_name: string; // The system-generated random name
  is_premium: boolean;
  role: 'user' | 'admin' | 'superadmin';
  onboardingComplete: boolean;
  
  // Sensitive demographic data (Hidden by default for non-premium)
  age?: number;
  sex?: string;
  location?: string;

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

export interface UserData extends UserProfile {
  journalEntries: JournalEntry[];
  myStories: MyStory[];
  moods: MoodEntry[];
  chatHistory: ChatMessage[];
}

export interface JournalEntry {
  id: number;
  user_id: string;
  created_at: string;
  prompt?: string;
  content: string;
  mood: number;
}

export interface MyStory {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
}

export interface MoodEntry {
  id: number;
  user_id: string;
  created_at: string; 
  date: string;
  mood: number;
}

export interface ChatMessage {
  id?: number;
  user_id: string;
  created_at?: string;
  role: 'user' | 'model';
  text: string;
}

export interface CommunityGroupSimulationMessage {
  id: number;
  name: string;
  text: string;
}

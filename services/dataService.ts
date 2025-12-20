
import { supabase } from './supabaseClient';
import { UserProfile, JournalEntry, MoodEntry, MyStory, ChatMessage } from '../types';

// Admin user view includes email from auth table
export interface AdminUserView extends UserProfile {
    email: string;
}

// Update a user's profile data
export const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        console.error('Error updating profile:', error.message);
        return { data: null, error };
    }
};

// --- Journal ---
export const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'created_at'>) => {
    try {
        const { data, error } = await supabase
            .from('journal_entries')
            .insert(entry)
            .select()
            .single();
        if (error) throw error;
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error };
    }
}

export const deleteJournalEntry = async (id: number) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    return { error };
}

// --- Moods ---
export const addOrUpdateMood = async (moodEntry: Omit<MoodEntry, 'id' | 'created_at'>) => {
    try {
        const { data, error } = await supabase
            .from('moods')
            .upsert(moodEntry, { onConflict: 'user_id, date' })
            .select()
            .single();
        return { data, error };
    } catch (error: any) {
        return { data: null, error };
    }
}

// --- Stories ---
export const addStory = async (story: Omit<MyStory, 'id' | 'created_at' | 'updated_at'>) => {
    try {
        const { data, error } = await supabase
            .from('my_stories')
            .insert(story)
            .select()
            .single();
        return { data, error };
    } catch (error: any) {
        return { data: null, error };
    }
}

export const updateStory = async (id: number, updates: Partial<MyStory>) => {
    try {
        const { data, error } = await supabase
            .from('my_stories')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        return { data, error };
    } catch (error: any) {
        return { data: null, error };
    }
}

export const deleteStory = async (id: number) => {
    const { error } = await supabase.from('my_stories').delete().eq('id', id);
    return { error };
}

// --- Chat History ---
export const addChatMessage = async (message: Omit<ChatMessage, 'id' | 'created_at'>) => {
    try {
        const { data, error } = await supabase
            .from('chat_history')
            .insert(message)
            .select()
            .single();
        return { data, error };
    } catch (error: any) {
        return { data: null, error };
    }
}

// --- Admin ---

// Fetch all users using Edge Function to join Profile with Auth Email
export const adminGetAllUsers = async (): Promise<AdminUserView[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('admin-get-users');
        if (error) throw error;
        return data.users;
    } catch (error: any) {
        console.error('Error in adminGetAllUsers:', error.message);
        throw error;
    }
};

// Update user role using Service Role via Edge Function
export const adminUpdateUserRole = async (targetUserId: string, newRole: 'user' | 'admin'): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data, error } = await supabase.functions.invoke('admin-update-role', {
            body: { targetUserId, newRole },
        });
        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('Error in adminUpdateUserRole:', error.message);
        return { success: false, error: error.message };
    }
};

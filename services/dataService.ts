import { supabase } from './supabaseClient';
import { UserData, UserProfile, JournalEntry, MoodEntry, MyStory, ChatMessage } from '../types';

// This function securely fetches all user data via an Edge Function,
// bypassing the recursive RLS policy on the 'profiles' table.
export const fetchUserDataBundle = async (): Promise<UserData | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('get-user-data-bundle');
        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error("Error invoking get-user-data-bundle:", error.message);
        return null;
    }
}

// Update a user's profile data
export const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    if (error) console.error('Error updating profile:', error.message);
    return { data, error };
};

// --- Journal ---
export const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('journal_entries')
        .insert(entry)
        .select()
        .single();
    if (error) console.error('Error adding journal entry:', error.message);
    return { data, error };
}

export const deleteJournalEntry = async (id: number) => {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    if (error) console.error('Error deleting journal entry:', error.message);
    return { error };
}

// --- Moods ---
export const addOrUpdateMood = async (moodEntry: Omit<MoodEntry, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('moods')
        .upsert(moodEntry, { onConflict: 'user_id, date' })
        .select()
        .single();
    if (error) console.error('Error adding/updating mood:', error.message);
    return { data, error };
}

// --- Stories ---
export const addStory = async (story: Omit<MyStory, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
        .from('my_stories')
        .insert(story)
        .select()
        .single();
    if (error) console.error('Error adding story:', error.message);
    return { data, error };
}

export const updateStory = async (id: number, updates: Partial<MyStory>) => {
    const { data, error } = await supabase
        .from('my_stories')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) console.error('Error updating story:', error.message);
    return { data, error };
}

export const deleteStory = async (id: number) => {
    const { error } = await supabase.from('my_stories').delete().eq('id', id);
    if (error) console.error('Error deleting story:', error.message);
    return { error };
}

// --- Chat History ---
export const addChatMessage = async (message: Omit<ChatMessage, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('chat_history')
        .insert(message)
        .select()
        .single();
    if (error) console.error('Error adding chat message:', error.message);
    return { data, error };
}

// --- Admin Functions ---
export type AdminUserView = Omit<UserProfile, 'journalEntries' | 'moods' | 'myStories' | 'chatHistory'> & { email: string };

export const adminGetAllUsers = async (): Promise<AdminUserView[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('admin-get-users');
        if (error) throw error;
        return data.users;
    } catch (error) {
        console.error("Error invoking admin-get-users function:", error);
        return [];
    }
}

export const adminUpdateUserRole = async (targetUserId: string, newRole: 'user' | 'admin'): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data, error } = await supabase.functions.invoke('admin-update-role', {
            body: { targetUserId, newRole },
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        return { success: true };
    } catch (error: any) {
        console.error("Error invoking admin-update-role function:", error.message);
        return { success: false, error: error.message };
    }
}
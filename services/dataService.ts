import { supabase } from './supabaseClient';
import { UserData, UserProfile, JournalEntry, MoodEntry, MyStory, ChatMessage, AdminUserView } from '../types';
import { initialUserProfile } from '../App';
import { User } from '@supabase/supabase-js';

// This function now fetches all data directly from the client, bypassing Edge Functions.
export const fetchUserDataBundle = async (user: User): Promise<UserData | null> => {
    try {
        // Step 1: Get or create profile
        let { data: profile, error: selectError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // This specific error means no row was found, which is expected for new users.
        if (selectError && selectError.code !== 'PGRST116') {
            throw selectError;
        }

        if (!profile) {
            // No profile found, let's create one.
            const newProfileData = {
                ...initialUserProfile,
                id: user.id,
                name: user.email?.split('@')[0] || 'Friend',
            };

            const { data: insertedProfile, error: insertError } = await supabase
                .from('profiles')
                .insert(newProfileData)
                .select()
                .single();

            if (insertError) throw insertError;
            profile = insertedProfile;
        }

        // Step 2: Get all other data related to the user
        const [
            { data: journalEntries, error: journalError },
            { data: moods, error: moodsError },
            { data: myStories, error: storiesError },
            { data: chatHistory, error: chatError }
        ] = await Promise.all([
            supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('moods').select('*').eq('user_id', user.id).order('date', { ascending: false }),
            supabase.from('my_stories').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
            supabase.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
        ]);

        if (journalError || moodsError || storiesError || chatError) {
            console.error('Error fetching user data parts:', { journalError, moodsError, storiesError, chatError });
            throw new Error("One or more data components failed to load.");
        }

        // Step 3: Assemble and return the full UserData object
        const fullUserData: UserData = {
            ...(profile as UserProfile),
            journalEntries: journalEntries || [],
            moods: moods || [],
            myStories: myStories || [],
            chatHistory: chatHistory || [],
        };

        return fullUserData;

    } catch (error: any) {
        console.error("Error in fetchUserDataBundle:", error.message);
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

// Fix: Add admin functions to invoke Supabase Edge Functions.
// --- Admin ---
export const adminGetAllUsers = async (): Promise<AdminUserView[]> => {
    const { data, error } = await supabase.functions.invoke('admin-get-users');
    if (error) {
        console.error('Error fetching all users:', error.message);
        throw error;
    }
    if (data.error) {
        throw new Error(data.error);
    }
    return data.users;
};

export const adminUpdateUserRole = async (targetUserId: string, newRole: 'user' | 'admin'): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.functions.invoke('admin-update-role', {
        body: { targetUserId, newRole },
    });

    if (error) {
        console.error('Error updating user role:', error.message);
        return { success: false, error: error.message };
    }
    
    if (data.error) {
        return { success: false, error: data.error };
    }

    return data;
};

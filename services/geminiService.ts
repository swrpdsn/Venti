import { supabase } from './supabaseClient';
import { ChatMessage, JournalEntry, MoodEntry, UserData } from '../types';

export const getAIResponse = async (
    newMessage: string, 
    history: ChatMessage[], 
    userData: UserData
): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('get-ai-response', {
            body: { newMessage, history, userData },
        });

        if (error) throw error;
        
        // The 'text' property is returned from our Edge Function
        return data.text; 
    } catch (error) {
        console.error("Error invoking get-ai-response function:", error);
        return "I'm having a little trouble connecting right now. Please try again in a moment.";
    }
};

export const getAIWeeklySummary = async (entries: JournalEntry[], moods: MoodEntry[]): Promise<string> => {
    try {
         const { data, error } = await supabase.functions.invoke('get-ai-weekly-summary', {
            body: { entries, moods },
        });
        
        if (error) throw error;

        return data.text;
    } catch (error) {
        console.error("Error invoking get-ai-weekly-summary function:", error);
        return "I'm having a little trouble generating your summary right now. Please try again in a moment.";
    }
};

export const getAICommunityChatResponse = async (history: {name: string, text: string}[]): Promise<{name: string, text: string}[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('get-ai-community-chat', {
            body: { history },
        });

        if (error) throw error;

        // The function returns the JSON array directly
        return data;
    } catch (error) {
        console.error("Error invoking get-ai-community-chat function:", error);
        return [{ name: "Venti", text: "It seems our group is a little quiet right now. Please try again in a moment." }];
    }
};

export const getAICommunityStory = async (topic: string): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('get-ai-community-story', {
            body: { topic },
        });
        
        if (error) throw error;

        return data.text;
    } catch (error) {
        console.error("Error invoking get-ai-community-story function:", error);
        return "I'm having trouble recalling a story right now. Please try again in a moment.";
    }
};

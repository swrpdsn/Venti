

import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { AppContextType, JournalEntry, MoodEntry } from '../types';
import { TrashIcon, SparklesIcon } from '../components/Icons';
import { getAIWeeklySummary } from '../services/geminiService';

// NOTE: Recharts is loaded from CDN and accessed via window.Recharts

type JournalTab = 'guided' | 'free' | 'mood';

const JournalScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<JournalTab>('guided');
    
    const tabs: {id: JournalTab, label: string}[] = [
        { id: 'guided', label: 'Guided' },
        { id: 'free', label: 'Free Write' },
        { id: 'mood', label: 'Mood Tracker' },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'guided': return <GuidedJournal setActiveTab={setActiveTab} />;
            case 'free': return <FreeJournal />;
            case 'mood': return <MoodTracker />;
            default: return null;
        }
    };

    return (
        <div>
            <div className="flex space-x-2 border-b-2 border-slate-200 mb-4">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-4 font-semibold text-lg transition-colors ${activeTab === tab.id ? 'border-b-4 border-brand-purple text-brand-purple' : 'text-slate-500 hover:text-brand-deep-purple'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {renderContent()}
        </div>
    );
};

const GuidedJournal: React.FC<{ setActiveTab: (tab: JournalTab) => void }> = ({ setActiveTab }) => {
    const context = useContext(AppContext) as AppContextType;
    const { setUserData } = context;
    const [content, setContent] = useState('');
    const prompt = "What’s one lesson you’ve learned from this pain?";

    const saveEntry = () => {
        if (!content.trim()) return;
        const newEntry: JournalEntry = {
            id: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            prompt,
            content,
            mood: 5, // Default mood
        };
        setUserData(prev => ({ ...prev, journalEntries: [newEntry, ...prev.journalEntries] }));
        setContent('');
        alert('Entry Saved!');
        setActiveTab('free');
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <p className="font-semibold text-brand-deep-purple mb-2">{prompt}</p>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-48 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                placeholder="Write your thoughts here..."
            />
            <button onClick={saveEntry} className="mt-2 bg-brand-purple text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-deep-purple transition-colors w-full">
                Save Entry
            </button>
        </div>
    );
};

const FreeJournal: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData } = context;

    const deleteEntry = (id: string) => {
        setUserData(prev => ({
            ...prev,
            journalEntries: prev.journalEntries.filter(entry => entry.id !== id)
        }));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Past Entries</h3>
            {userData?.journalEntries.length === 0 ? (
                <p className="text-slate-500">No entries yet. Start writing!</p>
            ) : (
                userData?.journalEntries.map(entry => (
                    <div key={entry.id} className="bg-white p-4 rounded-lg shadow relative">
                        <p className="text-sm text-slate-500">{entry.date}</p>
                        {entry.prompt && <p className="font-semibold mt-1">"{entry.prompt}"</p>}
                        <p className="mt-2 whitespace-pre-wrap">{entry.content}</p>
                        <button onClick={() => deleteEntry(entry.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

const MoodTracker: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData } = context;
    const [mood, setMood] = useState(5);
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    // @ts-ignore - Recharts is loaded from CDN
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = window.Recharts || {};

    const addMoodEntry = () => {
        const today = new Date().toISOString().split('T')[0];
        const newEntry: MoodEntry = { date: today, mood };

        setUserData(prev => {
            const existingEntryIndex = prev.moods.findIndex(m => m.date === today);
            const newMoods = [...prev.moods];
            if (existingEntryIndex > -1) {
                newMoods[existingEntryIndex] = newEntry;
            } else {
                newMoods.push(newEntry);
            }
            return { ...prev, moods: newMoods };
        });
    };

    const handleGetSummary = async () => {
        if (!userData) return;
        setIsSummaryLoading(true);
        setSummary(null);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recentEntries = userData.journalEntries.filter(entry => new Date(entry.id) >= oneWeekAgo);
        const recentMoods = userData.moods.filter(mood => new Date(mood.date) >= oneWeekAgo);

        if (recentEntries.length < 2 && recentMoods.length < 2) {
            setSummary("Keep tracking your mood and writing in your journal for a few more days to unlock your first weekly summary!");
            setIsSummaryLoading(false);
            return;
        }

        const generatedSummary = await getAIWeeklySummary(recentEntries, recentMoods);
        setSummary(generatedSummary);
        setIsSummaryLoading(false);
    };
    
    const chartData = useMemo(() => {
        if (!userData) return [];
        // Get last 7 days
        return userData.moods.slice(-7).map(m => ({
            name: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: m.mood
        }));
    }, [userData]);


    return (
        <div className="space-y-4">
             <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-2">How are you feeling today?</h3>
                <div className="flex items-center space-x-4">
                    <span className="text-2xl">😔</span>
                    <input type="range" min="1" max="10" value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full"/>
                    <span className="text-2xl">🙂</span>
                </div>
                <button onClick={addMoodEntry} className="mt-4 bg-brand-teal text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors w-full">
                    Log Mood
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-bold mb-4">Weekly Mood Trend</h3>
                <div style={{ width: '100%', height: 200 }}>
                    {BarChart ? (
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 10]} />
                                <Tooltip />
                                <Bar dataKey="mood" fill="#4c1d95" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-slate-500">Loading chart...</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-6 h-6 text-brand-purple" />
                    <h3 className="font-bold text-brand-deep-purple">AI Weekly Summary</h3>
                </div>
                <p className="text-sm text-slate-600 my-2">Get personalized insights based on your journal entries and mood trends from the last 7 days.</p>
                <button 
                    onClick={handleGetSummary} 
                    disabled={isSummaryLoading} 
                    className="w-full bg-brand-purple text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-deep-purple transition-colors disabled:bg-slate-400"
                >
                    {isSummaryLoading ? 'Analyzing...' : 'Generate My Summary'}
                </button>
                {(summary || isSummaryLoading) && (
                    <div className="mt-4 p-3 bg-brand-light-gray rounded-lg">
                        {isSummaryLoading ? (
                             <div className="flex items-center space-x-1">
                                <p>Thinking...</p>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                        ) : (
                             <p className="text-brand-text whitespace-pre-wrap">{summary}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JournalScreen;
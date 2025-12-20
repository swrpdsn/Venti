import React, { useState, useContext, useMemo } from 'react';
import { AppContext, AppContextType } from '../App';
import { JournalEntry } from '../types';
import { TrashIcon, SparklesIcon, CloseIcon } from '../components/Icons';
import { getAIWeeklySummary, getReframeInsight } from '../services/geminiService';
import Card from '../components/Card';
import { addJournalEntry, deleteJournalEntry } from '../services/dataService';

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
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const baseBorder = isDawn ? 'border-slate-200' : 'border-slate-700';
    const activeBorder = isDawn ? 'border-dawn-primary' : 'border-dusk-primary';
    const activeText = isDawn ? 'text-dawn-primary' : 'text-dusk-primary';
    const baseText = isDawn ? 'text-slate-500' : 'text-slate-400';
    const hoverText = isDawn ? 'hover:text-dawn-text' : 'hover:text-dusk-text';

    return (
        <div className="h-full flex flex-col">
            <div className={`flex space-x-1 border-b-2 ${baseBorder} mb-4 shrink-0`}>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-3 sm:px-4 font-semibold text-base sm:text-lg transition-colors ${activeTab === tab.id ? `${activeBorder} ${activeText} border-b-4` : `${baseText} ${hoverText} border-b-4 border-transparent`}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto animate-fade-in pb-20">{renderContent()}</div>
        </div>
    );
};

const GuidedJournal: React.FC<{ setActiveTab: (tab: JournalTab) => void }> = ({ setActiveTab }) => {
    const context = useContext(AppContext) as AppContextType;
    const { user, setUserData } = context;
    const [content, setContent] = useState('');
    const prompt = "What’s one lesson you’ve learned from this pain?";

    const saveEntry = async () => {
        if (!content.trim() || !user) return;
        
        const newEntryData: Omit<JournalEntry, 'id' | 'created_at'> = {
            user_id: user.id,
            prompt,
            content,
            mood: 5,
        };

        const { data: newEntry, error } = await addJournalEntry(newEntryData);

        if (error || !newEntry) {
            alert('Could not save entry.');
        } else {
            setUserData(prev => prev ? ({ ...prev, journalEntries: [newEntry, ...prev.journalEntries] }) : null);
            setContent('');
            setActiveTab('free');
        }
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');

    return (
        <Card className="m-1">
            <p className={`font-semibold ${isDawn ? 'text-dawn-text' : 'text-dusk-text'} mb-2`}>{prompt}</p>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full h-48 p-3 border rounded-2xl focus:ring-2 resize-none outline-none transition-all
                    ${isDawn 
                        ? 'bg-white border-slate-200 focus:ring-dawn-primary focus:border-transparent' 
                        : 'bg-slate-900/50 border-slate-700 text-dusk-text focus:ring-dusk-primary focus:border-transparent'}`}
                placeholder="Pour your heart out..."
            />
            <button onClick={saveEntry} className={`mt-4 w-full font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95
                 ${isDawn ? 'bg-dawn-primary text-white' : 'bg-dusk-primary text-dusk-bg-start'}`}>
                Save Reflection
            </button>
        </Card>
    );
};

const FreeJournal: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData } = context;
    const [reframeInsight, setReframeInsight] = useState<string | null>(null);
    const [isReframing, setIsReframing] = useState(false);

    const deleteEntry = async (id: number) => {
        if (!window.confirm("Permanently delete this entry?")) return;
        const { error } = await deleteJournalEntry(id);
        if (error) alert("Error deleting entry.");
        else setUserData(prev => prev ? ({ ...prev, journalEntries: prev.journalEntries.filter(e => e.id !== id) }) : null);
    };

    const handleReframe = async (text: string) => {
        setIsReframing(true);
        const insight = await getReframeInsight(text);
        setReframeInsight(insight);
        setIsReframing(false);
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-500' : 'text-slate-400';

    return (
        <div className="space-y-4 px-1">
            {reframeInsight && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-fade-in">
                    <Card className="max-w-sm w-full relative">
                        <button onClick={() => setReframeInsight(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-2 mb-4">
                            <SparklesIcon className="w-6 h-6 text-brand-teal" />
                            <h4 className="font-black text-brand-teal uppercase tracking-widest text-xs">Venti's Reframe</h4>
                        </div>
                        <p className={`italic font-serif text-lg leading-relaxed ${textColor}`}>"{reframeInsight}"</p>
                    </Card>
                </div>
            )}

            {userData?.journalEntries.length === 0 ? (
                <Card className="text-center py-10 opacity-60">
                    <p className={subTextColor}>Your journal is empty. Start your first reflection above.</p>
                </Card>
            ) : (
                userData?.journalEntries.map(entry => (
                    <Card key={entry.id} className="relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                           <p className={`text-[10px] font-black uppercase tracking-tighter ${subTextColor}`}>
                                {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </p>
                           <div className="flex items-center space-x-1">
                               <button 
                                    onClick={() => handleReframe(entry.content)} 
                                    disabled={isReframing}
                                    title="Reframe this thought with Venti"
                                    className={`p-2 rounded-full transition-all ${isReframing ? 'animate-spin' : ''} ${isDawn ? 'text-brand-teal hover:bg-brand-teal/10' : 'text-brand-teal hover:bg-brand-teal/20'}`}
                                >
                                    <SparklesIcon className="w-4 h-4" />
                               </button>
                               <button onClick={() => deleteEntry(entry.id)} className={`p-2 rounded-full transition-all ${isDawn ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-600 hover:text-red-400 hover:bg-red-900/20'}`}>
                                   <TrashIcon className="w-4 h-4"/>
                               </button>
                           </div>
                        </div>
                        {entry.prompt && <p className={`font-black text-xs mb-2 ${isDawn ? 'text-brand-purple' : 'text-brand-light-purple'}`}>{entry.prompt}</p>}
                        <p className={`whitespace-pre-wrap leading-relaxed ${textColor}`}>{entry.content}</p>
                    </Card>
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
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const subTextColor = isDawn ? 'text-slate-600' : 'text-slate-400';

    // @ts-ignore
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = window.Recharts || {};

    const handleGetSummary = async () => {
        if (!userData) return;
        setIsSummaryLoading(true);
        const generatedSummary = await getAIWeeklySummary(userData.journalEntries, userData.moods);
        setSummary(generatedSummary);
        setIsSummaryLoading(false);
    };
    
    const chartData = useMemo(() => {
        if (!userData) return [];
        return [...userData.moods].reverse().slice(-7).map(m => ({
            name: new Date(m.date).toLocaleDateString('en-US', { weekday: 'short' }),
            mood: m.mood
        }));
    }, [userData]);

    return (
        <div className="space-y-4 px-1 pb-10">
            <Card>
                <h3 className={`font-bold mb-4 ${textColor}`}>Weekly Trend</h3>
                <div style={{ width: '100%', height: 200 }}>
                    {BarChart ? (
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDawn ? '#e2e8f0' : '#475569'} vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: isDawn ? '#475569' : '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 10]} hide />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: isDawn ? 'white' : '#1e293b',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Bar dataKey="mood" radius={[4, 4, 0, 0]} fill={isDawn ? '#dd6b20' : '#a78bfa'} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full opacity-40">Loading chart...</div>
                    )}
                </div>
            </Card>

            <Card className="bg-gradient-to-br from-brand-teal/10 to-transparent">
                <div className="flex items-center space-x-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-brand-teal" />
                    <h3 className={`font-black text-xs uppercase tracking-widest ${textColor}`}>Personalized Insight</h3>
                </div>
                <p className={`text-sm ${subTextColor} mb-4`}>Analyze your recent entries to find patterns in your healing journey.</p>
                <button 
                    onClick={handleGetSummary} 
                    disabled={isSummaryLoading || !userData?.journalEntries.length} 
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-40
                        ${isDawn ? 'bg-dawn-primary text-white' : 'bg-dusk-primary text-dusk-bg-start'}`}
                >
                    {isSummaryLoading ? 'Consulting Venti...' : 'Generate Weekly Summary'}
                </button>
                {summary && (
                    <div className={`mt-6 p-4 rounded-2xl border ${isDawn ? 'bg-white/50 border-slate-100' : 'bg-slate-900/50 border-slate-700'} animate-fade-in`}>
                         <p className={`${textColor} whitespace-pre-wrap leading-relaxed italic font-serif`}>{summary}</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default JournalScreen;
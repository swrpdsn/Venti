import React, { useState } from 'react';
import { getAICommunityStory } from '../services/geminiService';
import { SparklesIcon } from '../components/Icons';

const storyTopics = [
    "Feeling lonely after the breakup",
    "Struggling with the urge to contact my ex",
    "Finding my own strength again",
    "Dealing with memories",
    "Am I good enough?",
    "Letting go of anger",
];

const CommunityStoriesScreen: React.FC = () => {
    const [story, setStory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    const handleGetStory = async (topic: string) => {
        setIsLoading(true);
        setStory(null);
        setSelectedTopic(topic);
        const generatedStory = await getAICommunityStory(topic);
        setStory(generatedStory);
        setIsLoading(false);
    };
    
    const reset = () => {
        setStory(null);
        setSelectedTopic(null);
    }

    return (
        <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl shadow text-center">
                <h2 className="text-xl font-bold text-brand-deep-purple">Community Stories</h2>
                <p className="text-slate-600 mt-1">Anonymous stories of healing and hope.</p>
            </div>

            {isLoading && (
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <h3 className="font-semibold text-brand-deep-purple mb-2">Generating a story about...</h3>
                    <p className="italic text-slate-500 mb-4">"{selectedTopic}"</p>
                     <div className="flex justify-center items-center space-x-2">
                        <SparklesIcon className="w-6 h-6 text-brand-purple animate-pulse" />
                        <p className="text-brand-text">Finding the right words...</p>
                    </div>
                </div>
            )}

            {story && !isLoading && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="font-bold text-brand-deep-purple text-lg mb-2">A Story About: <span className="font-medium">{selectedTopic}</span></h3>
                    <p className="text-brand-text whitespace-pre-wrap leading-relaxed">{story}</p>
                     <button onClick={reset} className="mt-4 w-full bg-brand-purple text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-deep-purple transition-colors">
                        Read Another Story
                    </button>
                </div>
            )}
            
            {!story && !isLoading && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                    <h3 className="font-semibold text-brand-deep-purple mb-3">What do you want to read about today?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {storyTopics.map(topic => (
                             <button 
                                key={topic}
                                onClick={() => handleGetStory(topic)}
                                className="w-full text-left p-3 bg-slate-100 text-brand-text rounded-lg hover:bg-brand-light-purple hover:text-brand-purple transition-colors font-medium"
                            >
                                {topic}
                             </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityStoriesScreen;

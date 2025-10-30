import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';
import { ChevronRightIcon, PencilIcon } from '../components/Icons';

const MyStoriesScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, navigateTo, setActiveStoryId } = context;

    const handleNewStory = () => {
        setActiveStoryId(null);
        navigateTo('story-editor');
    };

    const handleSelectStory = (id: string) => {
        setActiveStoryId(id);
        navigateTo('story-editor');
    };

    return (
        <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl shadow text-center">
                <h2 className="text-xl font-bold text-brand-deep-purple">My Story</h2>
                <p className="text-slate-600 mt-1">Your private space to write, reflect, and heal.</p>
            </div>
            
            <button
                onClick={handleNewStory}
                className="w-full bg-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-deep-purple transition-colors flex items-center justify-center space-x-2 shadow-md"
            >
                <PencilIcon className="w-5 h-5" />
                <span>Write a New Story</span>
            </button>

            <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="font-bold text-brand-deep-purple mb-3">Your Saved Stories</h3>
                {userData?.myStories && userData.myStories.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {userData.myStories.map(story => (
                            <button 
                                key={story.id} 
                                onClick={() => handleSelectStory(story.id)}
                                className="w-full text-left p-3 flex justify-between items-center hover:bg-slate-50 rounded-md"
                            >
                                <div>
                                    <p className="font-semibold text-brand-text">{story.title}</p>
                                    <p className="text-sm text-slate-500">Last updated: {new Date(story.date).toLocaleDateString()}</p>
                                </div>
                                <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">You haven't written any stories yet. Start your first chapter today.</p>
                )}
            </div>
        </div>
    );
};

export default MyStoriesScreen;

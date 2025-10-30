import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { AppContextType, MyStory } from '../types';
import { TrashIcon, ShareIcon } from '../components/Icons';

const StoryEditorScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData, activeStoryId, goBack } = context;

    const [story, setStory] = useState<Partial<MyStory>>({ title: '', content: '' });

    useEffect(() => {
        if (activeStoryId) {
            const existingStory = userData?.myStories.find(s => s.id === activeStoryId);
            if (existingStory) {
                setStory(existingStory);
            }
        }
    }, [activeStoryId, userData?.myStories]);

    const handleSave = () => {
        if (!story.title?.trim() || !story.content?.trim()) {
            alert("Please provide a title and content for your story.");
            return;
        }

        setUserData(prev => {
            const newStories = [...(prev.myStories || [])];
            const storyData = {
                ...story,
                date: new Date().toISOString(),
                title: story.title as string,
                content: story.content as string,
            };

            if (activeStoryId) {
                const index = newStories.findIndex(s => s.id === activeStoryId);
                if (index > -1) {
                    newStories[index] = { ...newStories[index], ...storyData };
                }
            } else {
                newStories.unshift({ ...storyData, id: new Date().toISOString() });
            }
            return { ...prev, myStories: newStories };
        });
        goBack();
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to permanently delete this story?")) {
            setUserData(prev => ({
                ...prev,
                myStories: prev.myStories.filter(s => s.id !== activeStoryId)
            }));
            goBack();
        }
    };
    
    const handleShare = () => {
        const subject = `My Venti Story: ${story.title}`;
        const body = story.content;
        const mailtoLink = `mailto:stories@venti-app.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body || '')}`;
        window.location.href = mailtoLink;
    }

    const title = activeStoryId ? "Edit Story" : "New Story";

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-brand-deep-purple">{title}</h2>
            <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
                <input
                    type="text"
                    value={story.title}
                    onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your story a title..."
                    className="w-full p-3 border border-slate-300 rounded-md text-lg font-semibold focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                />
                <textarea
                    value={story.content}
                    onChange={(e) => setStory(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write what's on your heart..."
                    className="w-full h-64 p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
                />
                <button
                    onClick={handleSave}
                    className="w-full bg-brand-purple text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-deep-purple transition-colors"
                >
                    Save Story
                </button>
                {activeStoryId && (
                    <div className="flex items-center justify-center space-x-4 pt-2">
                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 text-brand-purple font-semibold hover:underline"
                        >
                            <ShareIcon className="w-5 h-5"/>
                            <span>Share via Email</span>
                        </button>
                         <button
                            onClick={handleDelete}
                            className="flex items-center space-x-2 text-red-600 font-semibold hover:underline"
                        >
                            <TrashIcon className="w-5 h-5"/>
                            <span>Delete</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryEditorScreen;

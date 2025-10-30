import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AppContextType } from '../types';

const programTasks = {
    'healing': {
        title: 'Calm Healing',
        emoji: '🧘',
        day1: {
            title: 'Mindful Moment',
            task: 'Find a quiet space for 5 minutes. Close your eyes and focus only on your breath. Don\'t try to change it, just observe. Acknowledge any thoughts that come, then gently guide your focus back to your breathing.',
        }
    },
    'glow-up': {
        title: 'Glow-Up Challenge',
        emoji: '✨',
        day1: {
            title: 'Hydration Station',
            task: 'Your body needs water to heal and feel good. Your goal today is to drink a large glass of water as soon as you wake up, and one with every meal. Feel the revitalizing energy.',
        }
    },
    'no-contact': {
        title: 'No Contact Bootcamp',
        emoji: '🔥',
        day1: {
            title: 'The Digital Purge',
            task: 'Open your social media. Mute or block your ex on every platform. This isn\'t about anger, it\'s about creating a peaceful space for your mind to heal. You can do this.',
        }
    },
};


const ProgramsScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData } = context;

    const currentProgramKey = userData?.program || 'healing';
    const currentProgram = programTasks[currentProgramKey];
    const day1Task = currentProgram.day1;


    return (
        <div className="space-y-6">
            <div className="text-center p-4">
                <h2 className="text-2xl font-bold text-brand-deep-purple mb-4">Your Program</h2>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p className="text-5xl mb-4">{currentProgram.emoji}</p>
                    <h3 className="text-xl font-bold">{currentProgram.title}</h3>
                    <p className="text-slate-600 mt-2">Day 1 of 30</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md text-left">
                <h4 className="font-bold text-brand-text mb-2 text-lg">Today's Task: {day1Task.title}</h4>
                <p className="text-slate-600">{day1Task.task}</p>
                 <button className="mt-4 w-full bg-brand-teal text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors">
                    Mark as Complete
                </button>
            </div>
            
            <p className="text-xs text-slate-400 mt-6 text-center">
                Want to try a different path? You can change your program in the 'More' tab.
            </p>
        </div>
    );
};

export default ProgramsScreen;
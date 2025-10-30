

import React, { useContext, useState } from 'react';
import { AppContext, initialUserData } from '../App';
import { AppContextType, UserData } from '../types';
import { UsersIcon, BookOpenIcon, ChevronRightIcon, PencilIcon } from '../components/Icons';


const MoreScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData, navigateTo, setActiveStoryId } = context;
    const [isChangingProgram, setIsChangingProgram] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const programDetails = {
        'healing': { title: 'Calm Healing', desc: 'Meditations and journaling to process emotions.' },
        'glow-up': { title: 'Glow-Up Challenge', desc: 'Fitness, hydration, and self-care tasks.' },
        'no-contact': { title: 'No Contact Bootcamp', desc: 'Tools and streaks to manage urges.' },
    };

    const currentProgram = userData?.program ? programDetails[userData.program] : null;

    const handleProgramSelect = (program: UserData['program']) => {
        setUserData(prev => ({ ...prev, program }));
        setIsChangingProgram(false);
    }
    
    const handleResetAccount = () => {
        if (window.confirm("Are you sure you want to delete your account? All your data will be permanently erased. This action cannot be undone.")) {
            setUserData(initialUserData);
        }
    };
    
    const showFeedback = (message: string) => {
        setFeedbackMessage(message);
        setTimeout(() => {
            setFeedbackMessage('');
        }, 3000);
    };

    return (
        <div className="space-y-6">
            {feedbackMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-deep-purple text-white px-4 py-2 rounded-full shadow-lg z-20 animate-toast-in-out">
                    {feedbackMessage}
                </div>
            )}
            <div className="text-center">
                <div className="w-24 h-24 bg-brand-light-purple rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-brand-purple">
                    {userData?.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="mt-4 text-2xl font-bold">{userData?.name}</h2>
                <p className="text-slate-500">Healing one day at a time</p>
            </div>
            
            <SettingsCard>
                <h3 className="font-bold text-brand-deep-purple mb-3">My Program</h3>
                {isChangingProgram ? (
                     <ProgramChanger currentProgram={userData?.program} onSelect={handleProgramSelect} onCancel={() => setIsChangingProgram(false)}/>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{currentProgram?.title || 'None Selected'}</p>
                            <p className="text-sm text-slate-500">{currentProgram?.desc}</p>
                        </div>
                        <button onClick={() => setIsChangingProgram(true)} className="text-sm font-bold text-brand-purple hover:underline">
                            Change
                        </button>
                    </div>
                )}
            </SettingsCard>

            <SettingsCard>
                <h3 className="font-bold text-brand-deep-purple mb-3">Personal</h3>
                 <div className="divide-y divide-slate-200">
                    <SettingsItem label="My Story" Icon={PencilIcon} onClick={() => navigateTo('my-stories')} />
                    <EmergencyContact />
                </div>
            </SettingsCard>

            <SettingsCard>
                <h3 className="font-bold text-brand-deep-purple mb-3">Community</h3>
                 <div className="divide-y divide-slate-200">
                    <SettingsItem label="AI Community Chat" Icon={UsersIcon} onClick={() => navigateTo('community-chat')} />
                    <SettingsItem label="Community Stories" Icon={BookOpenIcon} onClick={() => navigateTo('community-stories')} />
                </div>
            </SettingsCard>

            <SettingsCard>
                <h3 className="font-bold text-brand-deep-purple mb-3">Settings</h3>
                <div className="divide-y divide-slate-200">
                    <SettingsItem label="Notifications & Reminders" onClick={() => showFeedback('Feature coming soon!')} />
                    <SettingsItem label="App Lock (PIN/Biometric)" onClick={() => showFeedback('Feature coming soon!')} />
                    <SettingsItem label="Language" onClick={() => showFeedback('Feature coming soon!')} />
                    <SettingsItem label="Export My Data" onClick={() => showFeedback('Feature coming soon!')} />
                    <SettingsItem label="Delete My Account" isDestructive={true} onClick={handleResetAccount} />
                </div>
            </SettingsCard>
        </div>
    );
};

const EmergencyContact: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData } = context;
    const [isEditing, setIsEditing] = useState(false);
    const [contact, setContact] = useState(userData?.emergencyContact || { name: '', phone: '' });

    const handleSave = () => {
        setUserData(prev => ({...prev, emergencyContact: contact }));
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="p-3">
                <h4 className="font-semibold text-brand-deep-purple mb-2">Edit Emergency Contact</h4>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        placeholder="Contact Name" 
                        value={contact.name} 
                        onChange={(e) => setContact({...contact, name: e.target.value})} 
                        className="w-full p-2 border border-slate-300 rounded-md"
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone Number" 
                        value={contact.phone} 
                        onChange={(e) => setContact({...contact, phone: e.target.value})} 
                        className="w-full p-2 border border-slate-300 rounded-md"
                    />
                    <div className="flex space-x-2">
                        <button onClick={handleSave} className="flex-1 bg-brand-purple text-white font-bold py-2 px-4 rounded-lg">Save</button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-200 text-brand-text font-bold py-2 px-4 rounded-lg">Cancel</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-3 flex justify-between items-center">
            <div>
                <h4 className="font-semibold text-brand-deep-purple">Emergency Contact</h4>
                <p className="text-sm text-slate-500">{userData?.emergencyContact?.name || "Not set"}</p>
            </div>
            <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-brand-purple hover:underline">
                {userData?.emergencyContact?.name ? "Edit" : "Set"}
            </button>
        </div>
    );
};

const ProgramChanger: React.FC<{currentProgram: UserData['program'], onSelect: (p: UserData['program']) => void, onCancel: () => void}> = ({ currentProgram, onSelect, onCancel }) => {
    const programs = [
        { id: 'healing', title: 'Calm Healing', desc: 'Meditations and journaling.' },
        { id: 'glow-up', title: 'Glow-Up Challenge', desc: 'Fitness and self-care tasks.' },
        { id: 'no-contact', title: 'No Contact Bootcamp', desc: 'Manage urges and build streaks.' },
    ];

    return (
        <div className="space-y-3">
             {programs.map(p => (
                <button 
                    key={p.id} 
                    onClick={() => onSelect(p.id as UserData['program'])} 
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${currentProgram === p.id ? 'bg-brand-light-purple border-brand-purple' : 'bg-slate-50 border-slate-200 hover:border-brand-light-purple'}`}
                >
                    <h4 className="font-bold text-brand-deep-purple">{p.title}</h4>
                    <p className="text-sm text-slate-600">{p.desc}</p>
                </button>
            ))}
            <button onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:underline mt-2">
                Cancel
            </button>
        </div>
    );
};

const SettingsCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white p-4 rounded-xl shadow-md">{children}</div>
);

const SettingsItem: React.FC<{ label: string, isDestructive?: boolean, onClick?: () => void, Icon?: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ label, isDestructive = false, onClick, Icon }) => (
    <button onClick={onClick} className={`w-full text-left p-3 flex justify-between items-center hover:bg-slate-50 rounded-md ${isDestructive ? 'text-red-600' : 'text-brand-text'}`}>
        <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-6 h-6 text-brand-purple"/>}
            <span className="font-semibold">{label}</span>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-slate-400" />
    </button>
);


export default MoreScreen;
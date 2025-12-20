
import React, { useState } from 'react';
import { UserData, UserProfile } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, ShieldIcon, SparklesIcon } from './Icons';

interface OnboardingProps {
  onComplete: (data: UserProfile) => void;
  initialData: UserData;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, initialData }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<UserData>(initialData);

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
        const [section, field] = name.split('.');
        setData(prev => ({
            ...prev,
            [section]: { ...(prev[section as keyof UserData] as object), [field]: value }
        }));
    } else {
        setData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleFeeling = (feeling: string) => {
    const current = data.breakupContext.feelings || [];
    const updated = current.includes(feeling) 
        ? current.filter(f => f !== feeling) 
        : [...current, feeling];
    
    setData(prev => ({
        ...prev,
        breakupContext: { ...prev.breakupContext, feelings: updated }
    }));
  };

  const handleFinish = () => {
    if (data.program) {
        const { journalEntries, moods, myStories, chatHistory, ...profileData } = data;
        onComplete(profileData);
    } else {
        alert("Please select a program to start your journey.");
    }
  }

  const renderStep = () => {
    switch(step) {
      case 1: return <ConsentScreen />;
      case 2: return <IdentityRevealScreen anonymousName={data.anonymous_name} />;
      case 3: return <ProfileScreen age={data.age} sex={data.sex} location={data.location} isPremium={data.is_premium} onChange={handleInputChange} />;
      case 4: return <BreakupContextScreen data={data.breakupContext} onChange={handleInputChange} onFeelingToggle={toggleFeeling} />;
      case 5: return <ExNameScreen exName={data.exName} onChange={handleInputChange} />;
      case 6: return <ShieldListScreen list={data.shieldList} onChange={(i, v) => {
          const newList = [...data.shieldList];
          newList[i] = v;
          setData(prev => ({ ...prev, shieldList: newList }));
      }} />;
      case 7: return <BaselineScreen data={data.baseline} onChange={(name, value) => {
          setData(prev => ({ ...prev, baseline: { ...prev.baseline, [name]: Number(value) } }));
      }} />;
      case 8: return <ProgramChoiceScreen onSelect={(p) => setData(prev => ({...prev, program: p}))} selected={data.program} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1e1b4b] overflow-y-auto flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col min-h-[600px] relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full bg-brand-teal transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex-1 flex flex-col animate-fade-in">
            {renderStep()}
        </div>

        <div className="flex items-center justify-between mt-8">
          <button 
            onClick={prevStep} 
            disabled={step === 1} 
            className="p-3 rounded-full hover:bg-white/10 disabled:opacity-0 transition-all"
          >
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex space-x-1.5">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${step === i + 1 ? 'bg-brand-teal w-4' : 'bg-white/30'}`}></div>
            ))}
          </div>

          {step < totalSteps ? (
            <button 
                onClick={nextStep} 
                className="p-3 rounded-full hover:bg-white/10 transition-all"
            >
              <ChevronRightIcon className="w-6 h-6 text-white" />
            </button>
          ) : (
            <button 
                onClick={handleFinish} 
                className="bg-brand-teal text-[#1e1b4b] font-black px-8 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              BEGIN HEALING
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ConsentScreen: React.FC = () => (
    <div className="py-4 text-center">
        <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-brand-teal/20 rounded-full flex items-center justify-center animate-pulse">
                <ShieldIcon className="w-10 h-10 text-brand-teal" />
            </div>
        </div>
        <h2 className="text-3xl font-thin text-white mb-6 uppercase tracking-widest">Privacy First</h2>
        <div className="space-y-4 text-left">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h3 className="text-brand-teal font-black text-[10px] uppercase tracking-widest mb-1">Anonymity by Default</h3>
                <p className="text-brand-light-purple text-sm">You are assigned a random poetic identity. Your real name, age, and location remain hidden unless you choose to reveal them (Premium feature).</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h3 className="text-brand-teal font-black text-[10px] uppercase tracking-widest mb-1">Encrypted Space</h3>
                <p className="text-brand-light-purple text-sm">Your reflections are yours. We do not sell data or show ads. Venti is your sacred vault for healing.</p>
            </div>
        </div>
        <p className="mt-8 text-xs text-white/40 italic">By continuing, you agree to our Terms of Healing and Privacy Policy.</p>
    </div>
);

const IdentityRevealScreen: React.FC<{ anonymousName: string }> = ({ anonymousName }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <SparklesIcon className="w-16 h-16 text-brand-teal animate-bounce" />
        <div>
            <h2 className="text-sm font-black text-brand-teal uppercase tracking-[0.3em] mb-2">Your Venti Identity</h2>
            <h1 className="text-5xl font-thin text-white italic tracking-tight">"{anonymousName}"</h1>
        </div>
        <p className="text-brand-light-purple max-w-sm">
            This is how you will be known in our community. Poetic, anonymous, and free from the weight of your past labels.
        </p>
    </div>
);

const ProfileScreen: React.FC<{ age?: number, sex?: string, location?: string, isPremium: boolean, onChange: any }> = ({ age, sex, location, isPremium, onChange }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-thin text-white">Your Profile</h2>
        <p className="text-brand-light-purple text-sm">These details help us tailor your healing path. They are <span className="text-brand-teal font-bold underline">hidden</span> for non-premium users.</p>
        
        <div className="grid grid-cols-2 gap-4">
            <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 ml-1">Age</label>
                <input 
                    type="number" 
                    name="age" 
                    value={age || ''} 
                    onChange={onChange} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none"
                    placeholder="Enter age..."
                />
            </div>
            <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 ml-1">Sex</label>
                <select name="sex" value={sex || ''} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Private">Prefer not to say</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 ml-1">Location</label>
            <input 
                type="text" 
                name="location" 
                value={location || ''} 
                onChange={onChange} 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none"
                placeholder="City or Region..."
            />
        </div>

        {!isPremium && (
            <div className="bg-brand-purple/20 border border-brand-purple/40 p-4 rounded-2xl flex items-center space-x-3">
                <ShieldIcon className="w-5 h-5 text-brand-light-purple" />
                <p className="text-[10px] text-brand-light-purple uppercase tracking-widest">Visibility is currently locked to <span className="font-bold">Private</span>. Upgrade to reveal these in the community.</p>
            </div>
        )}
    </div>
);

const BreakupContextScreen: React.FC<{ data: any, onChange: any, onFeelingToggle: any }> = ({ data, onChange, onFeelingToggle }) => {
    const feelings = ['Heartbroken', 'Angry', 'Relieved', 'Lost', 'Numb', 'Hopeful', 'Anxious', 'Regretful'];
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-thin text-white">The Context</h2>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 ml-1">Your Role</label>
                    <select name="breakupContext.role" value={data.role} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Select...</option>
                        <option value="dumpee">Dumpee</option>
                        <option value="dumper">Dumper</option>
                        <option value="mutual">Mutual</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 ml-1">Who Initiated?</label>
                    <select name="breakupContext.initiator" value={data.initiator} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none">
                        <option value="">Select...</option>
                        <option value="me">Me</option>
                        <option value="them">Them</option>
                        <option value="mutual">Mutual</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1.5 ml-1">The Story (Briefly)</label>
                <textarea
                    name="breakupContext.reason"
                    value={data.reason}
                    onChange={onChange}
                    placeholder="In your words, why did it end?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/20 h-24 outline-none focus:border-brand-teal transition-all"
                />
            </div>

            <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 ml-1">Current Feelings</label>
                <div className="flex flex-wrap gap-2">
                    {feelings.map(f => (
                        <button
                            key={f}
                            onClick={() => onFeelingToggle(f)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                data.feelings?.includes(f) 
                                ? 'bg-brand-teal border-brand-teal text-[#1e1b4b]' 
                                : 'bg-white/5 border-white/10 text-white hover:border-white/30'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ExNameScreen: React.FC<{exName: string, onChange: any}> = ({exName, onChange}) => (
    <div className="text-center py-4 flex flex-col items-center justify-center flex-1">
        <h2 className="text-3xl font-thin text-white mb-4">Name This Chapter</h2>
        <p className="text-brand-light-purple mb-8 px-6">
            To heal from something, we must name it. 
            Use their name, a nickname, or a word that represents this time (e.g., "The Lesson").
        </p>
        <input 
            type="text" 
            name="exName" 
            value={exName} 
            onChange={onChange} 
            placeholder="Ex: Alexander or 'The Ghost'" 
            className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl text-white outline-none focus:border-brand-teal transition-all"
        />
        <p className="mt-4 text-xs text-white/30 italic">This is for your eyes only.</p>
    </div>
);

const ShieldListScreen: React.FC<{ list: string[], onChange: (i: number, v: string) => void }> = ({ list, onChange }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-thin text-white">Your Shield List</h2>
        <p className="text-brand-light-purple text-sm">List 5 cold, hard truths about why this had to end. We'll remind you of these when you're tempted to reach out.</p>
        <div className="space-y-2">
            {list.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-xl border border-white/10 p-1">
                    <span className="w-8 h-8 flex items-center justify-center font-black text-brand-teal text-xs">{index + 1}</span>
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => onChange(index, e.target.value)}
                        placeholder="A painful truth..."
                        className="flex-1 bg-transparent p-2 text-white text-sm outline-none placeholder-white/10"
                    />
                </div>
            ))}
        </div>
    </div>
);

const BaselineScreen: React.FC<{ data: any, onChange: any }> = ({ data, onChange }) => (
    <div className="space-y-8 py-4">
        <h2 className="text-3xl font-thin text-white text-center">The Baseline</h2>
        <p className="text-brand-light-purple text-center text-sm px-8">Be honest with yourself. Where are you standing today?</p>
        <div className="space-y-10 px-4">
            {[
                { label: 'Overall Mood', name: 'mood', left: '😔', right: '🙂' },
                { label: 'Anxiety Level', name: 'anxiety', left: '🧘', right: '🌪️' },
                { label: 'Urge to Contact', name: 'urge', left: '🚫', right: '📲' }
            ].map(item => (
                <div key={item.name} className="relative">
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-4 text-center">{item.label}</label>
                    <div className="flex items-center space-x-4">
                        <span className="text-xl opacity-50">{item.left}</span>
                        <input 
                            type="range" 
                            name={item.name} 
                            min="1" max="10" 
                            value={data[item.name]} 
                            onChange={(e) => onChange(item.name, e.target.value)} 
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-brand-teal"
                        />
                        <span className="text-xl opacity-50">{item.right}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ProgramChoiceScreen: React.FC<{onSelect: (p: any) => void, selected: string | null}> = ({ onSelect, selected }) => {
    const programs = [
        { id: 'healing', title: 'Calm Healing', desc: 'Processing emotions through soft introspection.', emoji: '🧘' },
        { id: 'glow-up', title: 'Glow-Up Challenge', desc: 'Rebuilding your life with energy and self-care.', emoji: '✨' },
        { id: 'no-contact', title: 'No Contact Bootcamp', desc: 'Rigid discipline to break the habit of them.', emoji: '🔥' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-thin text-white text-center">Choose Your Path</h2>
            <div className="space-y-3">
                {programs.map(p => (
                    <button 
                        key={p.id} 
                        onClick={() => onSelect(p.id)} 
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center space-x-4 group ${
                            selected === p.id 
                            ? 'bg-brand-teal border-brand-teal shadow-[0_0_30px_rgba(20,184,166,0.3)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                    >
                        <span className="text-3xl">{p.emoji}</span>
                        <div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${selected === p.id ? 'text-[#1e1b4b]' : 'text-white'}`}>{p.title}</h3>
                            <p className={`text-xs ${selected === p.id ? 'text-[#1e1b4b]/70' : 'text-brand-light-purple/60'}`}>{p.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
            <p className="text-center text-[10px] text-white/30 uppercase tracking-tighter">You can change your path later in settings.</p>
        </div>
    );
};

export default Onboarding;

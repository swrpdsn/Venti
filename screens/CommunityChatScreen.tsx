import React, { useState, useRef, useEffect, useContext } from 'react';
import { CommunityChatMessage } from '../types';
import { getAICommunityChatResponse } from '../services/geminiService';
import { SendIcon } from '../components/Icons';
import { AppContext } from '../App';
import { AppContextType } from '../types';

const personaColors: { [key: string]: string } = {
    'Liam': 'bg-blue-500',
    'Chloe': 'bg-teal-500',
    'Maya': 'bg-amber-500',
    'Venti': 'bg-brand-purple',
};

const CommunityChatScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData } = context;

    const [messages, setMessages] = useState<CommunityChatMessage[]>([
        { id: 0, name: 'Venti', text: `Welcome to the community chat, ${userData?.name}. This is a safe space to share what's on your mind. Liam, Chloe, and Maya are here to listen.` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: CommunityChatMessage = { id: Date.now(), name: 'You', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const historyForAI = newMessages.slice(-5).map(({name, text}) => ({name, text})); // Send last 5 messages for context
        const aiResponses = await getAICommunityChatResponse(historyForAI);
        
        setIsLoading(false);
        
        let delay = 0;
        for (const response of aiResponses) {
            setTimeout(() => {
                setMessages(prev => [...prev, {id: Date.now() + Math.random(), ...response}]);
            }, delay);
            delay += Math.random() * 1000 + 500; // Stagger responses
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-lg">
            <div className="p-2 bg-white border-b border-slate-200 text-center rounded-t-lg">
                <h2 className="font-bold text-brand-deep-purple">Community Chat (Beta)</h2>
                <p className="text-xs text-slate-500">Anonymous AI-powered support group</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.name === 'You' ? 'justify-end' : 'justify-start'}`}>
                       {msg.name !== 'You' && 
                        <div className={`w-8 h-8 rounded-full ${personaColors[msg.name] || 'bg-gray-400'} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                            {msg.name.charAt(0)}
                        </div>
                       }
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.name === 'You' ? 'bg-brand-purple text-white rounded-br-none' : 'bg-white text-brand-text rounded-bl-none'}`}>
                           <p className="font-bold text-sm">{msg.name}</p>
                           <p className="mt-1">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                         <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-lg">...</div>
                         <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-white text-brand-text rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                            </div>
                         </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 bg-white border-t border-slate-200 mt-auto">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Share something with the group..."
                        className="flex-1 p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-brand-purple text-white rounded-full p-3 hover:bg-brand-deep-purple disabled:bg-slate-400 transition-colors">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommunityChatScreen;

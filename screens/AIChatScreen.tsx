


import React, { useState, useRef, useEffect, useContext } from 'react';
import { ChatMessage } from '../types';
import { getAIResponse } from '../services/geminiService';
import { SendIcon } from '../components/Icons';
import { AppContext } from '../App';
import { AppContextType } from '../types';

const AIChatScreen: React.FC = () => {
    const context = useContext(AppContext) as AppContextType;
    const { userData, setUserData, setShowSOS } = context;

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (userData && userData.chatHistory.length === 0) {
            setUserData(prev => ({
                ...prev,
                chatHistory: [{ role: 'model', text: `Hi ${userData?.name || 'there'}, I'm here to listen. What's on your mind today?` }]
            }));
        }
    }, [userData, setUserData]);

    useEffect(() => {
        scrollToBottom();
    }, [userData?.chatHistory]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !userData) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const updatedHistory = [...userData.chatHistory, userMessage];
        setUserData(prev => ({ ...prev, chatHistory: updatedHistory }));
        
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const aiResponseText = await getAIResponse(currentInput, updatedHistory, userData);
        
        const sosTrigger = '[TRIGGER_SOS]';
        let cleanResponse = aiResponseText;

        if (aiResponseText.includes(sosTrigger)) {
            setShowSOS(true);
            cleanResponse = aiResponseText.replace(sosTrigger, '').trim();
        }

        const aiMessage: ChatMessage = { role: 'model', text: cleanResponse };
        setUserData(prev => ({
            ...prev,
            chatHistory: [...prev.chatHistory, aiMessage]
        }));
        setIsLoading(false);
    };
    
    const messages = userData?.chatHistory || [];

    return (
        <div className="flex flex-col h-full bg-slate-100 rounded-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold text-lg shrink-0">V</div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-brand-purple text-white rounded-br-none' : 'bg-white text-brand-text rounded-bl-none'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                         <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white font-bold text-lg shrink-0">V</div>
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
            <div className="p-2 bg-white border-t border-slate-200">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Vent, reflect, ask anything..."
                        className="flex-1 p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading} className="bg-brand-purple text-white rounded-full p-3 hover:bg-brand-deep-purple disabled:bg-slate-400 transition-colors">
                        <SendIcon className="w-6 h-6" />
                    </button>
                </div>
                 <p className="text-xs text-slate-400 text-center mt-2 px-4">
                    Venti is an AI, not a therapist. For crisis support, please use the SOS feature.
                </p>
            </div>
        </div>
    );
};

export default AIChatScreen;
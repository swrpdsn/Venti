
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('signup'); // Default to signup for new users

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { error: signUpError } = await supabase.auth.signUp({ 
                    email, 
                    password,
                });
                if (signUpError) throw signUpError;
                setError("Account created! You can now Log In.");
                setMode('login');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                    if (signInError.message === 'Invalid login credentials') {
                        throw new Error("Credentials invalid. If you haven't created an account, switch to 'Sign Up' above.");
                    }
                    throw signInError;
                }
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const accentColor = isDawn ? 'bg-dawn-primary' : 'bg-dusk-primary';
    const accentText = isDawn ? 'text-white' : 'text-dusk-bg-start';
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const cardBg = isDawn ? 'bg-white/80' : 'bg-slate-800/60';
    const tabActive = isDawn ? 'bg-white text-dawn-primary' : 'bg-slate-700 text-dusk-primary';
    const tabInactive = 'text-slate-500 hover:text-slate-300';

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl animate-breathe-in"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl animate-breathe-out"></div>
            </div>

            <div className={`w-full max-w-md p-1 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl z-10 ${cardBg}`}>
                <div className="flex p-1 space-x-1">
                    <button 
                        onClick={() => { setMode('login'); setError(null); }}
                        className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${mode === 'login' ? tabActive : tabInactive}`}
                    >
                        Log In
                    </button>
                    <button 
                        onClick={() => { setMode('signup'); setError(null); }}
                        className={`flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${mode === 'signup' ? tabActive : tabInactive}`}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="px-8 pb-8 pt-6">
                    <div className="text-center mb-8">
                        <h1 className={`text-5xl font-thin tracking-widest uppercase ${textColor} mb-2`}>Venti</h1>
                        <p className="text-slate-500 text-sm italic">
                            {mode === 'login' ? 'Welcome back. Take a deep breath.' : 'Begin your anonymous healing journey.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 ml-2 font-bold">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-600 focus:border-brand-teal outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 ml-2 font-bold">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-600 focus:border-brand-teal outline-none transition-all"
                                required
                            />
                        </div>

                        {error && (
                            <div className={`p-4 rounded-xl text-sm leading-relaxed ${error.includes('Success') || error.includes('created') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${accentColor} ${accentText} font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest mt-4`}
                        >
                            {loading ? 'Processing...' : mode === 'login' ? 'Enter Space' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;


import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'signup') {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                if (signUpError) throw signUpError;
                alert("Check your email for a confirmation link!");
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const accentColor = isDawn ? 'bg-dawn-primary' : 'bg-dusk-primary';
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const cardBg = isDawn ? 'bg-white/70' : 'bg-slate-800/40';

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
            <div className={`w-full max-w-md p-8 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl ${cardBg} animate-fade-in`}>
                <div className="text-center mb-10">
                    <h1 className={`text-5xl font-thin tracking-widest uppercase ${textColor} mb-2`}>Venti</h1>
                    <p className="text-slate-400 italic text-sm">Just breathe. We're here for you.</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/10 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-brand-teal transition-all"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/10 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-brand-teal transition-all"
                        required
                    />

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full ${accentColor} ${isDawn ? 'text-white' : 'text-black'} font-black py-4 rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 uppercase tracking-widest text-sm`}
                    >
                        {loading ? 'Entering...' : mode === 'login' ? 'Continue' : 'Start Journey'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        className="text-brand-light-purple text-xs hover:underline opacity-80"
                    >
                        {mode === 'login' ? "New here? Begin a journey." : "Already have a path? Log in."}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;

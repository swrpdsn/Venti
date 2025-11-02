import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

type AuthMode = 'login' | 'signup';

const AuthScreen: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('dasanswarup@gmail.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let authError;
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                authError = error;
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                authError = error;
            }
            if (authError) {
                throw authError;
            }
            // On successful login/signup, the onAuthStateChange listener in App.tsx will take over.
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const backgroundClass = isDawn
      ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
      : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const cardClass = isDawn ? 'bg-white/70' : 'bg-slate-800/40';
    const inputClass = `w-full p-3 border rounded-md focus:ring-2 focus:border-transparent ${isDawn ? 'bg-white border-slate-300 text-slate-800 focus:ring-dawn-primary' : 'bg-slate-900/50 border-slate-700 text-dusk-text focus:ring-dusk-primary'}`;
    const buttonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const toggleButtonColor = isDawn ? 'text-dawn-secondary' : 'text-dusk-secondary';

    return (
        <div className={`min-h-screen font-sans flex flex-col items-center justify-center p-4 transition-colors duration-500 ${backgroundClass}`}>
             <div className="text-center mb-8">
                <h1 className={`text-6xl font-thin tracking-[0.2em] uppercase ${isDawn ? 'text-dawn-text/80' : 'text-dusk-text/80'}`}>
                  VENTI
                </h1>
                <p className={`mt-2 text-lg tracking-wider italic ${isDawn ? 'text-dawn-text/80' : 'text-dusk-text/80'}`}>
                  Your healing journey starts here.
                </p>
            </div>

            <div className={`w-full max-w-sm p-8 rounded-xl shadow-md backdrop-blur-sm border border-white/10 ${cardClass}`}>
                <h2 className={`text-2xl font-bold text-center mb-4 ${textColor}`}>
                    {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                </h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        required
                    />
                    <button type="submit" disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${buttonClass}`}>
                        {loading ? 'Loading...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
                    </button>
                    {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                </form>
                 <div className="text-center mt-4">
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError(null);
                        }}
                        className={`text-sm font-semibold hover:underline ${toggleButtonColor}`}
                    >
                        {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;

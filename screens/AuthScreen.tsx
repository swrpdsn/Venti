import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthScreen: React.FC = () => {
    const [email, setEmail] = useState('dasanswarup@gmail.com');
    const [password, setPassword] = useState('Afstro@123');
    const [loading, setLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<'login' | 'signup' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (action: 'login' | 'signup') => {
        setLoading(true);
        setCurrentAction(action);
        setError(null);
        setMessage(null);

        try {
            let authError;
            if (action === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password });
                authError = error;
                if (!authError) {
                    setMessage("Sign-up successful! Please check your email to confirm your account before logging in.");
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                authError = error;
            }
            if (authError) {
                throw authError;
            }
        } catch (error: any) {
            setError(error.error_description || error.message);
        } finally {
            setLoading(false);
            // Let currentAction persist to show which button was pressed
        }
    };
    
    const isDawn = document.documentElement.classList.contains('theme-dawn');
    const backgroundClass = isDawn
      ? 'bg-gradient-to-br from-dawn-bg-start to-dawn-bg-end'
      : 'bg-gradient-to-br from-dusk-bg-start to-dusk-bg-end';
    const textColor = isDawn ? 'text-dawn-text' : 'text-dusk-text';
    const cardClass = isDawn ? 'bg-white/70' : 'bg-slate-800/40';
    const inputClass = `w-full p-3 border rounded-md focus:ring-2 focus:border-transparent ${isDawn ? 'bg-white border-slate-300 text-slate-800 focus:ring-dawn-primary' : 'bg-slate-900/50 border-slate-700 text-dusk-text focus:ring-dusk-primary'}`;
    const loginButtonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const signupButtonClass = isDawn ? 'bg-dawn-secondary text-white hover:bg-dawn-secondary/90' : 'bg-dusk-secondary text-dusk-bg-start hover:bg-dusk-secondary/90';

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
                <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>
                    Welcome to Venti
                </h2>
                <div className="space-y-4">
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
                    <div className="space-y-3 pt-2">
                        <button onClick={() => handleAuth('login')} disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${loginButtonClass}`}>
                             {loading && currentAction === 'login' ? 'Logging in...' : 'Log In'}
                        </button>
                        <button onClick={() => handleAuth('signup')} disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${signupButtonClass}`}>
                             {loading && currentAction === 'signup' ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                    {message && <p className="text-green-500 text-sm text-center mt-2">{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
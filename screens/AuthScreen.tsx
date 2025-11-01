import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthScreen: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup'>('signup'); // Default to signup
    const [email, setEmail] = useState('dasanswarup@gmail.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // On successful login, the onAuthStateChange listener in App.tsx will handle the rest.
            } else { // Sign up
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) {
                     if (error.message.includes('User already registered')) {
                        setError('This email is already registered. Please try logging in.');
                        setView('login');
                        return;
                    }
                    throw error;
                }
                setSuccessMessage('Account created! You can now log in with these credentials.');
                setView('login'); // Switch to login view after successful signup
            }
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
    const secondaryButtonClass = isDawn ? 'text-dawn-secondary hover:underline' : 'text-dusk-secondary hover:underline';

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
                <h2 className={`text-2xl font-bold text-center mb-2 ${textColor}`}>{view === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
                 <p className={`text-center text-sm mb-4 ${isDawn ? 'text-slate-500' : 'text-slate-400'}`}>
                    <strong className="font-bold">Important:</strong> Please use the account below.
                    <br />
                    <strong className="font-bold">First, SIGN UP.</strong> Then, you can LOG IN.
                </p>
                {successMessage && <p className="text-green-400 text-sm text-center font-bold mb-4">{successMessage}</p>}
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
                        {loading ? 'Loading...' : (view === 'login' ? 'Log In' : 'Sign Up')}
                    </button>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                </form>
                <button 
                  onClick={() => {
                    setView(view === 'login' ? 'signup' : 'login');
                    setError(null);
                  }} 
                  className={`w-full mt-4 text-sm font-semibold ${secondaryButtonClass}`}
                >
                    {view === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
                </button>
            </div>
        </div>
    );
};

export default AuthScreen;

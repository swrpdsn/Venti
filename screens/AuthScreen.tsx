import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthScreen: React.FC = () => {
    const [view, setView] = useState<'login' | 'forgot_password'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<'login' | 'signup' | 'reset' | null>(null);
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
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setCurrentAction('reset');
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.href.split('?')[0], // Redirect to the app's base URL
            });
            if (error) throw error;
            setMessage("Password reset link sent! Please check your email.");
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
    const loginButtonClass = isDawn ? 'bg-dawn-primary text-white hover:bg-dawn-primary/90' : 'bg-dusk-primary text-dusk-bg-start hover:bg-dusk-primary/90';
    const signupButtonClass = isDawn ? 'bg-dawn-secondary text-white hover:bg-dawn-secondary/90' : 'bg-dusk-secondary text-dusk-bg-start hover:bg-dusk-secondary/90';


    const renderContent = () => {
        if (view === 'forgot_password') {
            return (
                <div className={`w-full max-w-sm p-8 rounded-xl shadow-md backdrop-blur-sm border border-white/10 ${cardClass}`}>
                    <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>
                        Reset Password
                    </h2>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                        <p className={`text-sm text-center ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}>
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            required
                        />
                        <div className="pt-2">
                             <button type="submit" disabled={loading} className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 ${loginButtonClass}`}>
                                {loading && currentAction === 'reset' ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center mt-2">{error}</p>}
                        {message && <p className="text-green-500 text-sm text-center mt-2">{message}</p>}
                    </form>
                    <div className="text-center mt-4">
                        <button
                            onClick={() => { setView('login'); setError(null); setMessage(null); }}
                            className={`text-sm hover:underline ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}
                        >
                            Back to Log In
                        </button>
                    </div>
                </div>
            );
        }

        return (
             <div className={`w-full max-w-sm p-8 rounded-xl shadow-md backdrop-blur-sm border border-white/10 ${cardClass}`}>
                <h2 className={`text-2xl font-bold text-center mb-6 ${textColor}`}>
                    Welcome Back
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
                <div className="text-center mt-4">
                    <button
                        onClick={() => { setView('forgot_password'); setError(null); setMessage(null); }}
                        className={`text-sm hover:underline ${isDawn ? 'text-slate-600' : 'text-slate-400'}`}
                    >
                        Forgot your password?
                    </button>
                </div>
            </div>
        );
    };

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
            {renderContent()}
        </div>
    );
};

export default AuthScreen;
import React, { useState, useEffect, createContext } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import { UserProfile } from './types';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AuthScreen from './screens/AuthScreen';
import LoadingScreen from './components/Loading';

// A simplified context for the admin app
interface AdminAppContextType {
    session: Session | null;
    user: User | null;
    userData: UserProfile | null;
}
export const AppContext = createContext<AdminAppContextType | null>(null);


const AdminApp: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    const checkUserRole = async (user: User) => {
        setLoading(true);
        setAuthError(null);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                     throw new Error("Profile not found.");
                }
                throw error;
            };

            if (data.role === 'admin' || data.role === 'superadmin') {
                setUserProfile(data);
            } else {
                setAuthError("Access Denied. You must be an admin to view this page.");
                await supabase.auth.signOut();
            }
        } catch (error: any) {
             setAuthError(`Could not verify your admin status: ${error.message}. Please try logging in again.`);
             await supabase.auth.signOut();
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const initializeSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session?.user) {
                await checkUserRole(session.user);
            } else {
                setLoading(false);
            }
        };
        initializeSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (_event === 'SIGNED_IN' && session?.user) {
                 await checkUserRole(session.user);
            } else if (_event === 'SIGNED_OUT') {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (!session || !userProfile) {
        return (
             <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
                {authError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-sm w-full rounded-md" role="alert">
                        <p className="font-bold">Authorization Error</p>
                        <p>{authError}</p>
                    </div>
                )}
                <AuthScreen />
            </div>
        );
    }

    // User is an admin, show the dashboard
    const contextValue: AdminAppContextType = {
        session,
        user: session.user,
        userData: userProfile,
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
                <header className="max-w-7xl mx-auto flex justify-between items-center mb-6 pb-4 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-text">Venti Admin Panel</h1>
                        <p className="text-slate-500">Welcome, {userProfile.name}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Log Out
                    </button>
                </header>
                <main className="max-w-7xl mx-auto">
                    <AdminDashboardScreen />
                </main>
            </div>
        </AppContext.Provider>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);


import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, ShieldCheck, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '../src/supabaseClient';

interface Props {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<Props> = ({ onLogin }) => {
  const [asyncError, setAsyncError] = useState<Error | null>(null);
  if (asyncError) throw asyncError;

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const normalizedEmail = email.toLowerCase().trim();

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (authError) {
          console.error('Login error:', authError);
          if (authError.message.includes('Email not confirmed')) {
            setError('Email non confermata. Per favore, controlla la tua casella di posta per il link di verifica.');
          } else if (authError.message.includes('Invalid login credentials')) {
            setError('Credenziali non valide. Controlla email e password.');
          } else {
            setError(`Errore di accesso: ${authError.message}`);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          // Fetch full name from our custom table or metadata
          const { data: userData } = await supabase
            .from('users')
            .select('fullName')
            .eq('email', normalizedEmail)
            .single();

          onLogin({
            email: data.user.email!,
            fullName: userData?.fullName || data.user.user_metadata?.fullName || normalizedEmail.split('@')[0]
          });
        }
      } else {
        // Registration
        if (password.length < 6) {
          setError('La password deve essere di almeno 6 caratteri.');
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              fullName: fullName
            }
          }
        });

        if (signUpError) {
          console.error('Registration error:', signUpError);
          if (signUpError.message.includes('User already registered')) {
            setError('Questa email è già registrata. Prova ad accedere.');
          } else {
            setError(`Errore registrazione: ${signUpError.message}`);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          // Check if identities is empty - this often means the user already exists 
          // but Supabase is configured to not reveal it for security (User Enumeration Protection)
          if (data.user.identities && data.user.identities.length === 0) {
            setError('Questa email è già registrata. Prova ad accedere.');
            setLoading(false);
            return;
          }

          // Also insert into our custom users table for the "People" list sync
          const { error: insertError } = await supabase
            .from('users')
            .upsert([{ email: normalizedEmail, fullName, password: 'AUTH_MANAGED' }]);

          if (insertError) {
            console.error('Profile sync error:', insertError);
          }

          setSuccessMessage('Registrazione completata! Per favore, controlla la tua email per confermare l\'account prima di accedere.');
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setFullName('');
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      if (err.message?.includes('Supabase client used before valid configuration')) {
        // Re-throw to be caught by a potential state-based error trigger or just let it be handled
        // Since this is an async handler, we need to trigger a render-time throw
        setAsyncError(err);
        return;
      }
      setError(`Si è verificato un errore: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 text-center bg-indigo-50 border-b border-indigo-100">
          <div className="inline-flex p-4 bg-indigo-600 text-white rounded-2xl shadow-lg mb-4">
            <ShieldCheck size={48} />
          </div>
          <h1 className="text-2xl font-black text-indigo-900 uppercase tracking-tight">Mondimpianti Magazzino</h1>
          <p className="text-indigo-600 font-medium text-sm mt-1">Sistema di Gestione Inventario</p>
        </div>

        <div className="p-8">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Accedi
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Registrati
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Mario Rossi"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Email (per l'accesso)</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="mario.rossi@esempio.it"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100 animate-in fade-in slide-in-from-top-2">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{isLogin ? 'Accedi al Sistema' : 'Crea Account'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">
            © 2026 Mondimpianti S.r.l. · Tutti i diritti riservati
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;

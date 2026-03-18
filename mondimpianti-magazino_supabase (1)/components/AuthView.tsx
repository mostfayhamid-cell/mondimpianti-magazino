
import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, UserPlus, ShieldCheck, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '../src/supabaseClient';

interface Props {
  onLogin: (user: User) => void;
}

const AuthView: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error: supabaseError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (supabaseError) {
          setError(`Errore di accesso: ${supabaseError.message}`);
        } else if (!data) {
          setError('Email o password errati.');
        } else {
          onLogin(data);
        }
      } else {
        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        if (checkError) {
          setError(`Errore verifica utente: ${checkError.message}`);
          setLoading(false);
          return;
        }

        if (existingUser) {
          setError('Questa email è già in uso.');
          setLoading(false);
          return;
        }

        const newUser: User = { email, password, fullName };
        const { error: insertError } = await supabase
          .from('users')
          .insert([newUser]);

        if (insertError) {
          setError(`Errore registrazione: ${insertError.message}`);
        } else {
          onLogin(newUser);
        }
      }
    } catch (err: any) {
      console.error(err);
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
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Accedi
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
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
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Email</label>
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

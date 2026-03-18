
import React, { useState, useEffect, useMemo } from 'react';
import { View, Part, Person, Transaction, PartWithStock, AppNotification, User } from './types';
import { INITIAL_PARTS } from './mockData';
import { PlusCircle, MinusCircle, Package, Users, History, Bell, AlertTriangle, X, FileImage, LogOut } from 'lucide-react';
import ReceiveForm from './components/ReceiveForm';
import WithdrawForm from './components/WithdrawForm';
import PartsView from './components/PartsView';
import PeopleView from './components/PeopleView';
import TransactionHistory from './components/TransactionHistory';
import NotificationCenter from './components/NotificationCenter';
import DocumentArchive from './components/DocumentArchive';
import AuthView from './components/AuthView';
import { supabase } from './src/supabaseClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('magazino_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState<View>(View.PARTS);
  const [parts, setParts] = useState<Part[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase on mount
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Parts
        const { data: partsData } = await supabase.from('parts').select('*');
        if (partsData && partsData.length > 0) {
          setParts(partsData);
        } else {
          // Initial migration if empty
          const initial = INITIAL_PARTS.filter(p => !p.description.toLowerCase().includes('tubo'));
          await supabase.from('parts').insert(initial);
          setParts(initial);
        }

        // Fetch People (Synced with Users)
        const { data: usersData } = await supabase.from('users').select('*');
        if (usersData) {
          const syncedPeople = usersData.map(u => ({
            personId: u.email,
            fullName: u.fullName,
            active: true
          }));
          setPeople(syncedPeople);
        }

        // Fetch Transactions
        const { data: txData } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
        if (txData) setTransactions(txData);

        // Fetch Notifications
        const { data: notifData } = await supabase.from('notifications').select('*').order('timestamp', { ascending: false });
        if (notifData) setNotifications(notifData);

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Real-Time Stock Calculation
  const partsWithStock = useMemo(() => {
    return parts.map(part => {
      const partTx = transactions.filter(t => t.pn === part.pn);
      const stock = partTx.reduce((acc, t) => {
        return t.type === 'IN' ? acc + t.qty : acc - t.qty;
      }, 0);
      return { ...part, stock };
    });
  }, [parts, transactions]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const checkLowStock = async (pn: string, currentTransactions: Transaction[]) => {
    const part = parts.find(p => p.pn === pn);
    if (!part || part.minStock === undefined) return;

    const stock = currentTransactions
      .filter(t => t.pn === pn)
      .reduce((acc, t) => (t.type === 'IN' ? acc + t.qty : acc - t.qty), 0);

    if (stock <= part.minStock) {
      const newNotification: AppNotification = {
        id: `NOTIF-${Date.now()}`,
        timestamp: new Date().toISOString(),
        title: 'Allerta Sottoscorta',
        message: `L'articolo ${part.pn} (${part.description}) è sottoscorta: ${stock} unità (Min: ${part.minStock}).`,
        type: 'LOW_STOCK',
        pn: part.pn,
        read: false,
      };
      
      console.log(`[MOCK EMAIL] A: Magazziniere, Oggetto: Allerta Sottoscorta - ${part.pn}`);
      await supabase.from('notifications').insert([newNotification]);
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const addTransaction = async (tx: Transaction) => {
    const { error } = await supabase.from('transactions').insert([tx]);
    if (error) {
      console.error('Error adding transaction:', error);
      return;
    }
    const newTransactions = [tx, ...transactions];
    setTransactions(newTransactions);
    checkLowStock(tx.pn, newTransactions);
  };

  const addPart = async (part: Part) => {
    const { error } = await supabase.from('parts').insert([part]);
    if (error) {
      console.error('Error adding part:', error);
      return;
    }
    setParts(prev => [...prev, part]);
  };

  const deletePart = async (pn: string) => {
    const { error } = await supabase.from('parts').delete().eq('pn', pn);
    if (error) {
      console.error('Error deleting part:', error);
      return;
    }
    setParts(prev => prev.filter(p => p.pn !== pn));
  };

  const updatePart = async (updatedPart: Part) => {
    const { error } = await supabase.from('parts').update(updatedPart).eq('pn', updatedPart.pn);
    if (error) {
      console.error('Error updating part:', error);
      return;
    }
    setParts(prev => prev.map(p => p.pn === updatedPart.pn ? updatedPart : p));
  };

  const markAllRead = async () => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
    if (error) {
      console.error('Error marking notifications as read:', error);
      return;
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = async () => {
    const { error } = await supabase.from('notifications').delete().neq('id', '');
    if (error) {
      console.error('Error clearing notifications:', error);
      return;
    }
    setNotifications([]);
  };

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('magazino_current_user', JSON.stringify(user));
    
    // Sync people with users on login
    const { data: usersData } = await supabase.from('users').select('*');
    if (usersData) {
      const syncedPeople = usersData.map(u => ({
        personId: u.email,
        fullName: u.fullName,
        active: true
      }));
      setPeople(syncedPeople);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('magazino_current_user');
  };

  const renderView = () => {
    switch (currentView) {
      case View.RECEIVE:
        return <ReceiveForm parts={parts} onSubmit={addTransaction} onRepeat={() => setCurrentView(View.RECEIVE)} />;
      case View.WITHDRAW:
        return <WithdrawForm partsWithStock={partsWithStock} people={people} onSubmit={addTransaction} onRepeat={() => setCurrentView(View.WITHDRAW)} />;
      case View.PARTS:
        return (
          <PartsView 
            parts={partsWithStock} 
            transactions={transactions} 
            onAddPart={addPart} 
            onDeletePart={deletePart} 
            onUpdatePart={updatePart}
          />
        );
      case View.PEOPLE:
        return (
          <PeopleView 
            people={people} 
            transactions={transactions} 
          />
        );
      case View.HISTORY:
        return <TransactionHistory transactions={transactions} people={people} />;
      case View.NOTIFICATIONS:
        return <NotificationCenter notifications={notifications} onMarkRead={markAllRead} onClear={clearNotifications} />;
      case View.DOCUMENTS:
        return <DocumentArchive transactions={transactions} />;
      default:
        return <PartsView parts={partsWithStock} transactions={transactions} onAddPart={addPart} onDeletePart={deletePart} />;
    }
  };

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView(View.PARTS)} className="flex items-center space-x-2 text-left">
            <div className="bg-white text-indigo-700 p-1.5 rounded-lg">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">Mondimpianti</h1>
              <p className="text-[10px] text-indigo-100 opacity-80 uppercase tracking-widest mt-1">Gestione Magazzino</p>
            </div>
          </button>
        </div>
        <div className="flex items-center space-x-1">
          <div className="flex flex-col items-end mr-3 text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Utente</span>
            <span className="text-xs font-bold">{currentUser.fullName}</span>
          </div>
          <button 
            onClick={() => setCurrentView(View.DOCUMENTS)}
            title="Archivio DDT"
            className={`p-2 rounded-full hover:bg-indigo-600 transition-colors relative ${currentView === View.DOCUMENTS ? 'bg-indigo-800' : ''}`}
          >
            <FileImage size={20} />
          </button>
          <button 
            onClick={() => setCurrentView(View.NOTIFICATIONS)}
            title="Notifiche"
            className={`p-2 rounded-full hover:bg-indigo-600 transition-colors relative ${currentView === View.NOTIFICATIONS ? 'bg-indigo-800' : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-indigo-700 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setCurrentView(View.HISTORY)}
            title="Storico Movimenti"
            className={`p-2 rounded-full hover:bg-indigo-600 transition-colors ${currentView === View.HISTORY ? 'bg-indigo-800' : ''}`}
          >
            <History size={20} />
          </button>
          <button 
            onClick={handleLogout}
            title="Esci"
            className="p-2 rounded-full hover:bg-red-600 transition-colors text-red-100"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 hide-scrollbar">
        {renderView()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto bg-white border-t border-gray-200 z-30 flex justify-around items-center h-20 shadow-2xl">
        <NavButton 
          active={currentView === View.RECEIVE} 
          onClick={() => setCurrentView(View.RECEIVE)} 
          icon={<PlusCircle size={24} />} 
          label="Carico"
        />
        <NavButton 
          active={currentView === View.PARTS} 
          onClick={() => setCurrentView(View.PARTS)} 
          icon={<Package size={24} />} 
          label="Inventario"
        />
        <NavButton 
          active={currentView === View.PEOPLE} 
          onClick={() => setCurrentView(View.PEOPLE)} 
          icon={<Users size={24} />} 
          label="Personale"
        />
        <NavButton 
          active={currentView === View.WITHDRAW} 
          onClick={() => setCurrentView(View.WITHDRAW)} 
          icon={<MinusCircle size={24} />} 
          label="Scarico"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center space-y-1 w-1/4 transition-colors duration-200 ${active ? 'text-indigo-600' : 'text-gray-400'}`}
  >
    <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

export default App;

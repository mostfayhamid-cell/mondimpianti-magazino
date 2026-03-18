
import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCheck, Trash2, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  notifications: AppNotification[];
  onMarkRead: () => void;
  onClear: () => void;
}

const NotificationCenter: React.FC<Props> = ({ notifications, onMarkRead, onClear }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Centro Notifiche</h2>
          <p className="text-sm text-gray-500">Avvisi di scorta e messaggi di sistema.</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onMarkRead}
            title="Segna tutto come letto"
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <CheckCheck size={20} />
          </button>
          <button 
            onClick={onClear}
            title="Svuota notifiche"
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-4 rounded-2xl border transition-all ${
                notif.read ? 'bg-white border-gray-100 opacity-60' : 'bg-indigo-50 border-indigo-100 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${notif.type === 'LOW_STOCK' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {notif.type === 'LOW_STOCK' ? <AlertTriangle size={18} /> : <Bell size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold ${notif.read ? 'text-gray-600' : 'text-indigo-900'}`}>{notif.title}</h3>
                    <div className="flex items-center text-[10px] text-gray-400 font-mono">
                      <Clock size={10} className="mr-1" />
                      {new Date(notif.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(notif.timestamp).toLocaleDateString('it-IT')}
                    </span>
                    {!notif.read && (
                      <span className="flex items-center text-[10px] text-indigo-600 font-bold bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                         Email Inviata
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Bell size={48} className="mx-auto mb-2 opacity-20" />
            <p className="font-medium">Nessun avviso presente.</p>
            <p className="text-xs">Verrai avvisato quando gli articoli scenderanno sotto la soglia minima.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;

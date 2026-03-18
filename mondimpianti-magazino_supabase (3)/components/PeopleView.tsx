
import React from 'react';
import { Person, Transaction } from '../types';
import { Briefcase } from 'lucide-react';

interface Props {
  people: Person[];
  transactions: Transaction[];
}

const PeopleView: React.FC<Props> = ({ people, transactions }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Personale Autorizzato</h2>
      </div>

      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
        <p className="text-sm text-indigo-700 font-medium">
          L'elenco del personale è gestito automaticamente tramite le registrazioni degli utenti al sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {people.map(person => {
          const personTxCount = transactions.filter(t => t.takenById === person.personId).length;

          return (
            <div key={person.personId} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">
                {person.fullName.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 truncate">{person.fullName}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center truncate">
                    <Briefcase size={10} className="mr-1 shrink-0" /> {person.department || 'Utente Registrato'}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded uppercase shrink-0">{person.personId}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right mr-2">
                  <div className="text-lg font-black text-gray-700">{personTxCount}</div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Prelievi</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeopleView;


import React from 'react';
import { Transaction, Person } from '../types';
import { History, ArrowUpRight, ArrowDownLeft, FileImage } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  people: Person[];
}

const TransactionHistory: React.FC<Props> = ({ transactions, people }) => {
  const getPersonName = (id?: string) => {
    if (!id) return 'Sconosciuto';
    return people.find(p => p.personId === id)?.fullName || id;
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Storico Movimenti</h2>
        <p className="text-sm text-gray-500">Registro cronologico di tutti i carichi e scarichi.</p>
      </div>

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map(tx => (
            <div key={tx.txId} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start space-x-3 hover:border-indigo-100 transition-colors">
              <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${tx.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {tx.type === 'IN' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-800 truncate">{tx.pn}</span>
                    {tx.dttFile && (
                      <span title="DDT Documento Allegato">
                        <FileImage size={14} className="text-indigo-500" />
                      </span>
                    )}
                  </div>
                  <span className={`font-black flex-shrink-0 ml-2 ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'IN' ? '+' : '-'}{tx.qty}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  {tx.type === 'IN' ? `Da: ${tx.receivedFrom}` : `A: ${getPersonName(tx.takenById)}`}
                </p>
                {tx.note && <p className="text-[10px] bg-gray-50 p-1.5 rounded italic text-gray-600 mt-1 border-l-2 border-indigo-300 line-clamp-2">"{tx.note}"</p>}
                <div className="text-[10px] text-gray-400 mt-2 font-mono flex justify-between items-center">
                  <span>{new Date(tx.timestamp).toLocaleString('it-IT')}</span>
                  <span className="bg-gray-50 px-1 rounded">ID: {tx.txId.slice(-8)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">
            <History size={48} className="mx-auto mb-2 opacity-20" />
            <p>Nessun movimento registrato.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;


import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { FileImage, Search, Calendar, Maximize2, X, Clock, User, Package } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const DocumentArchive: React.FC<Props> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const documentTransactions = useMemo(() => {
    return transactions
      .filter(t => t.dttFile)
      .filter(t => 
        t.pn.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (t.receivedFrom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.note?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top duration-300">
      <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Archivio DDT Digitale</h2>
          <p className="text-sm text-gray-500">Visualizza i documenti di trasporto caricati durante i carichi.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cerca documenti..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {documentTransactions.length > 0 ? (
          documentTransactions.map(tx => (
            <div key={tx.txId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div 
                onClick={() => setSelectedImage(tx.dttFile || null)}
                className="relative h-48 bg-gray-100 cursor-pointer group"
              >
                <img 
                  src={tx.dttFile} 
                  alt={`DDT per ${tx.pn}`} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="text-white" size={32} />
                </div>
                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                  RICEVUTO
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{tx.pn}</span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">+{tx.qty} Unità</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{tx.note || 'Nessuna nota'}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-400 font-mono">
                    <div className="flex items-center justify-end"><Calendar size={10} className="mr-1" /> {new Date(tx.timestamp).toLocaleDateString('it-IT')}</div>
                    <div className="flex items-center justify-end"><Clock size={10} className="mr-1" /> {new Date(tx.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center font-medium"><User size={12} className="mr-1" /> Da: {tx.receivedFrom || 'Sconosciuto'}</span>
                  <span className="font-mono text-gray-300">#{tx.txId.slice(-6)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <FileImage size={64} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold text-gray-600">Nessun documento trovato</p>
            <p className="text-sm max-w-xs mx-auto mt-1">Carica le foto dei DDT durante la fase di carico per popolare questo archivio.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-end p-4">
            <button 
              onClick={() => setSelectedImage(null)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={32} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img 
              src={selectedImage} 
              alt="Visualizzazione DDT" 
              className="max-h-full max-w-full object-contain shadow-2xl rounded-sm" 
            />
          </div>
          <div className="p-8 text-center">
            <button 
              onClick={() => setSelectedImage(null)}
              className="px-10 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-xl active:scale-95 transition-all"
            >
              Chiudi Visualizzatore
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentArchive;

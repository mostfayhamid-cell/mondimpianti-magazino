
import React, { useState, useRef } from 'react';
import { Part, Transaction } from '../types';
import { Save, Camera, X, Maximize2, Trash2 } from 'lucide-react';

interface Props {
  parts: Part[];
  onSubmit: (tx: Transaction) => void;
  onRepeat: () => void;
}

const ReceiveForm: React.FC<Props> = ({ parts, onSubmit, onRepeat }) => {
  const [pn, setPn] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [receivedFrom, setReceivedFrom] = useState('');
  const [note, setNote] = useState('');
  const [dttFile, setDttFile] = useState<string>('');
  const [showFullImage, setShowFullImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDttFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pn || qty < 1) return;

    const newTx: Transaction = {
      txId: `TX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'IN',
      pn,
      qty: Math.floor(qty),
      receivedFrom,
      note,
      dttFile,
    };

    onSubmit(newTx);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setPn('');
      setQty(1);
      setReceivedFrom('');
      setNote('');
      setDttFile('');
      onRepeat();
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Carico Merce</h2>
        <p className="text-sm text-gray-500">Registra l'entrata di nuovi articoli e carica il DDT.</p>
      </div>

      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-8 rounded-2xl relative flex flex-col items-center justify-center space-y-2 animate-bounce">
          <Save size={32} />
          <span className="font-bold text-lg">Carico Salvato con Successo!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Codice Parte (PN)</label>
            <select
              value={pn}
              onChange={(e) => setPn(e.target.value)}
              required
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
            >
              <option value="">Seleziona articolo...</option>
              {parts.filter(p => p.active).map(part => (
                <option key={part.pn} value={part.pn}>{part.pn} - {part.description}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quantità (Intero)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                required
                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ricevuto Da</label>
              <input
                type="text"
                placeholder="Fornitore / Corriere"
                value={receivedFrom}
                onChange={(e) => setReceivedFrom(e.target.value)}
                required
                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nota / Riferimento</label>
            <input
              type="text"
              placeholder="Rif. Spedizione / N. Ordine"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Camera Upload for DDT */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Foto DDT / Documento</label>
            
            <div className="flex flex-wrap items-center gap-4">
              {!dttFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center space-y-2 bg-white border-2 border-indigo-100 w-32 h-32 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                >
                  <Camera size={32} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                  <span className="text-xs font-bold text-indigo-500">Scatta Foto</span>
                </button>
              ) : (
                <div className="relative group">
                  <div 
                    onClick={() => setShowFullImage(true)}
                    className="cursor-pointer relative overflow-hidden rounded-2xl border-4 border-white shadow-lg h-32 w-32"
                  >
                    <img 
                      src={dttFile} 
                      alt="Anteprima DDT" 
                      className="h-full w-full object-cover transition-transform group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Maximize2 className="text-white" size={24} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDttFile('')}
                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-xl transition-colors border-2 border-white"
                    title="Rimuovi Foto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleCapture}
              />

              <div className="flex-1 min-w-[150px]">
                <p className="text-sm font-medium text-gray-700">Caricamento Documento</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5 leading-tight">
                  Scatta una foto nitida del documento di trasporto per tracciabilità.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-700 active:transform active:scale-95 transition-all"
            >
              <Save size={20} />
              <span>Conferma Carico</span>
            </button>
          </div>
        </form>
      )}

      {/* Full Size Image Modal */}
      {showFullImage && dttFile && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-end p-2">
            <button 
              onClick={() => setShowFullImage(false)}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img 
              src={dttFile} 
              alt="Visualizzazione DDT" 
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" 
            />
          </div>
          <div className="text-center p-6">
            <button 
              onClick={() => setShowFullImage(false)}
              className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold shadow-lg"
            >
              Chiudi Anteprima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiveForm;

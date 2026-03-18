
import React, { useState } from 'react';
import { PartWithStock, Person, Transaction } from '../types';
import { Save, AlertCircle } from 'lucide-react';

interface Props {
  partsWithStock: PartWithStock[];
  people: Person[];
  onSubmit: (tx: Transaction) => void;
  onRepeat: () => void;
}

const WithdrawForm: React.FC<Props> = ({ partsWithStock, people, onSubmit, onRepeat }) => {
  const [pn, setPn] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [takenById, setTakenById] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedPart = partsWithStock.find(p => p.pn === pn);
  const availableStock = selectedPart?.stock || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pn || !takenById || qty < 1) {
      setError('Tutti i campi obbligatori devono essere compilati.');
      return;
    }

    if (qty > availableStock) {
      setError(`Giacenza insufficiente! Solo ${availableStock} unità disponibili.`);
      return;
    }

    const newTx: Transaction = {
      txId: `TX-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'OUT',
      pn,
      qty: Math.floor(qty),
      takenById,
      note,
    };

    onSubmit(newTx);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setPn('');
      setQty(1);
      setTakenById('');
      setNote('');
      onRepeat();
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Scarico Merce</h2>
        <p className="text-sm text-gray-500">Registra l'uscita di materiale per montaggio o manutenzione.</p>
      </div>

      {success ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex items-center justify-center space-x-2 animate-pulse">
          <Save size={20} />
          <span className="font-bold">Scarico Registrato!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Codice Parte (PN)</label>
            <select
              value={pn}
              onChange={(e) => {
                setPn(e.target.value);
                setError('');
              }}
              required
              className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
            >
              <option value="">Seleziona articolo...</option>
              {partsWithStock.filter(p => p.active).map(part => (
                <option key={part.pn} value={part.pn}>
                  {part.pn} ({part.stock} in giacenza)
                </option>
              ))}
            </select>
            {selectedPart && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs flex justify-between">
                <span className="text-gray-600">{selectedPart.description}</span>
                <span className={`font-bold ${selectedPart.stock <= (selectedPart.minStock || 0) ? 'text-red-600' : 'text-green-600'}`}>
                  STOCK: {selectedPart.stock}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quantità</label>
              <input
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => {
                  setQty(parseInt(e.target.value));
                  setError('');
                }}
                required
                className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prelevato Da</label>
              <select
                value={takenById}
                onChange={(e) => setTakenById(e.target.value)}
                required
                className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              >
                <option value="">Seleziona dipendente...</option>
                {people.filter(p => p.active).map(person => (
                  <option key={person.personId} value={person.personId}>{person.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ordine di Lavoro / Nota</label>
            <input
              type="text"
              placeholder="Rif. Interno / Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center space-x-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-red-700 active:transform active:scale-95 transition-all"
            >
              <Save size={20} />
              <span>Conferma Scarico</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WithdrawForm;

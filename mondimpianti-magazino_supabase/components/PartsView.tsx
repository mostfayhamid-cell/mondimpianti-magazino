
import React, { useState, useMemo } from 'react';
import { Part, PartWithStock, Transaction } from '../types';
import { Search, AlertTriangle, MapPin, ChevronRight, Package, History, Plus, X, Save, Trash2, Edit2, Check, ArrowUpDown } from 'lucide-react';

interface Props {
  parts: PartWithStock[];
  transactions: Transaction[];
  onAddPart: (part: Part) => void;
  onDeletePart: (pn: string) => void;
  onUpdatePart: (part: Part) => void;
}

const PartsView: React.FC<Props> = ({ parts, transactions, onAddPart, onDeletePart, onUpdatePart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [locationFilter, setLocationFilter] = useState('');
  const [maxStockFilter, setMaxStockFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedPart, setSelectedPart] = useState<PartWithStock | null>(null);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // New Part State
  const [newPn, setNewPn] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMin, setNewMin] = useState<number>(0);
  const [newLoc, setNewLoc] = useState('');
  const [error, setError] = useState('');

  // Edit State
  const [editMin, setEditMin] = useState<number>(0);
  const [editLoc, setEditLoc] = useState('');

  const locations = useMemo(() => {
    const locs = new Set(parts.map(p => p.location).filter(Boolean));
    return Array.from(locs).sort();
  }, [parts]);

  const filteredParts = useMemo(() => {
    let result = parts.filter(p => 
      p.pn.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showLowStockOnly) {
      result = result.filter(p => p.stock <= (p.minStock || 0));
    }

    if (locationFilter) {
      result = result.filter(p => p.location === locationFilter);
    }

    if (maxStockFilter !== '') {
      const maxStock = parseInt(maxStockFilter);
      if (!isNaN(maxStock)) {
        result = result.filter(p => p.stock <= maxStock);
      }
    }

    return result.sort((a, b) => {
      return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
    });
  }, [parts, searchTerm, showLowStockOnly, locationFilter, maxStockFilter, sortOrder]);

  const partHistory = useMemo(() => {
    if (!selectedPart) return [];
    return transactions
      .filter(t => t.pn === selectedPart.pn)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedPart, transactions]);

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedPn = newPn.trim().toUpperCase();
    if (!trimmedPn) {
      setError('Codice PN obbligatorio.');
      return;
    }

    if (parts.some(p => p.pn.toUpperCase() === trimmedPn)) {
      setError(`Il codice "${trimmedPn}" esiste già.`);
      return;
    }

    onAddPart({
      pn: trimmedPn,
      description: newDesc.trim() || 'Nessuna descrizione',
      minStock: newMin,
      location: newLoc.trim(),
      active: true,
    });

    setIsAddingPart(false);
    setNewPn('');
    setNewDesc('');
    setNewMin(0);
    setNewLoc('');
  };

  const startEditing = () => {
    if (!selectedPart) return;
    setEditMin(selectedPart.minStock || 0);
    setEditLoc(selectedPart.location || '');
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (!selectedPart) return;
    onUpdatePart({
      ...selectedPart,
      minStock: editMin,
      location: editLoc,
    });
    setIsEditing(false);
    // Update selected part locally to reflect changes in modal
    setSelectedPart({
      ...selectedPart,
      minStock: editMin,
      location: editLoc,
    });
  };

  const handleDelete = () => {
    if (!selectedPart) return;
    if (window.confirm(`CONFERMA ELIMINAZIONE: Sei sicuro di voler eliminare definitivamente l'articolo ${selectedPart.pn} dall'inventario?`)) {
      onDeletePart(selectedPart.pn);
      setSelectedPart(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-3 sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cerca PN o Descrizione..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAddingPart(true)}
            className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
            title="Aggiungi Nuovo Articolo"
          >
            <Plus size={24} />
          </button>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              showLowStockOnly ? 'bg-orange-500 text-white shadow-md' : 'bg-white border text-gray-600'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Sottoscorta</span>
          </button>

          <div className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1.5 shrink-0">
            <MapPin size={12} className="text-gray-400 mr-2" />
            <select 
              className="text-xs font-bold text-gray-600 bg-transparent outline-none border-none p-0"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">Tutte le Posizioni</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1.5 shrink-0">
            <Package size={12} className="text-gray-400 mr-2" />
            <span className="text-[10px] font-bold text-gray-400 mr-1 uppercase">Stock ≤</span>
            <input 
              type="number"
              placeholder="Q.tà"
              className="text-xs font-bold text-gray-600 bg-transparent outline-none border-none p-0 w-10"
              value={maxStockFilter}
              onChange={(e) => setMaxStockFilter(e.target.value)}
            />
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 bg-white border text-gray-600 hover:bg-gray-50"
          >
            <ArrowUpDown size={14} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            <span>{sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}</span>
          </button>
          
          {(locationFilter || maxStockFilter !== '' || searchTerm || sortOrder !== 'asc') && (
            <button 
              onClick={() => {
                setLocationFilter('');
                setMaxStockFilter('');
                setSearchTerm('');
                setShowLowStockOnly(false);
                setSortOrder('asc');
              }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 px-2 shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredParts.length > 0 ? (
          filteredParts.map(part => (
            <div 
              key={part.pn} 
              onClick={() => setSelectedPart(part)}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">{part.pn}</span>
                    {part.stock <= (part.minStock || 0) && (
                      <span className="flex items-center text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        <AlertTriangle size={10} className="mr-1" /> Da Ordinare
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{part.description}</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center"><MapPin size={12} className="mr-1" /> {part.location || 'N/D'}</span>
                    <span className="flex items-center"><AlertTriangle size={12} className="mr-1" /> Min: {part.minStock || 0}</span>
                  </div>
                </div>
                <div className="text-right mr-6">
                  <div className={`text-2xl font-black ${part.stock <= (part.minStock || 0) ? 'text-red-500' : 'text-green-600'}`}>
                    {part.stock}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unità</div>
                </div>
              </div>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-indigo-400" size={20} />
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300">
            <Package className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500 font-medium">Nessun articolo trovato</p>
          </div>
        )}
      </div>

      {/* Add New Part Modal */}
      {isAddingPart && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Nuova Anagrafica Articolo</h2>
                <p className="text-xs opacity-80">Inserisci un nuovo codice nel sistema.</p>
              </div>
              <button onClick={() => setIsAddingPart(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddPart} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Codice Parte (PN) *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newPn}
                  onChange={(e) => setNewPn(e.target.value)}
                  placeholder="es. BRK-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Descrizione</label>
                <input
                  type="text"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Descrizione tecnica..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Scorta Minima</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newMin}
                    onChange={(e) => setNewMin(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Posizione</label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newLoc}
                    onChange={(e) => setNewLoc(e.target.value)}
                    placeholder="Scaffale/Cesto..."
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
              >
                <Save size={20} />
                <span>Salva Articolo</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Part Details Modal */}
      {selectedPart && !isAddingPart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-gray-800">{selectedPart.pn}</h2>
                  {!isEditing && (
                    <button 
                      onClick={startEditing}
                      className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Modifica Articolo"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button 
                    onClick={handleDelete}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Elimina Articolo"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-sm text-gray-500">{selectedPart.description}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedPart(null);
                  setIsEditing(false);
                }} 
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isEditing ? (
                <div className="space-y-4 animate-in slide-in-from-top duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Scorta Minima</label>
                      <input
                        type="number"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editMin}
                        onChange={(e) => setEditMin(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Posizione</label>
                      <input
                        type="text"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editLoc}
                        onChange={(e) => setEditLoc(e.target.value)}
                        placeholder="Scaffale/Cesto..."
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleUpdate}
                      className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <Check size={18} />
                      <span>Salva Modifiche</span>
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Giacenza Attuale</p>
                    <p className={`text-4xl font-black ${selectedPart.stock <= (selectedPart.minStock || 0) ? 'text-red-500' : 'text-green-600'}`}>
                      {selectedPart.stock}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Posizione</p>
                    <p className="text-xl font-bold text-gray-700">{selectedPart.location || 'N/D'}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <History size={16} className="mr-2" />
                  Movimenti Recenti
                </h3>
                <div className="space-y-3">
                  {partHistory.length > 0 ? (
                    partHistory.slice(0, 10).map(t => (
                      <div key={t.txId} className="flex justify-between items-center p-3 rounded-lg border text-sm">
                        <div>
                          <span className={`font-bold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'IN' ? 'CARICO' : 'SCARICO'} {t.qty}
                          </span>
                          <p className="text-[10px] text-gray-400 uppercase">{new Date(t.timestamp).toLocaleDateString()} · {t.note || 'Nessuna nota'}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          {t.type === 'IN' ? t.receivedFrom : t.takenById}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-4 text-xs italic">Nessun movimento registrato</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsView;

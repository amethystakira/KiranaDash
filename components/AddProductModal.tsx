import React, { useState } from 'react';
import { X, CheckCircle, Package, DollarSign, Tag, Layers } from 'lucide-react';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'salesCount'>) => void;
  darkMode?: boolean;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, darkMode = true }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('General');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && price && stock) {
      onSave({
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category
      });
      // Reset
      setName('');
      setPrice('');
      setStock('');
      onClose();
    }
  };

  const categories = ['General', 'Beverage', 'Snacks', 'Grains', 'Spices', 'Oil', 'Household'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 animate-in zoom-in-95 ${darkMode ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <Package size={20} />
            </div>
            Add New Item
          </h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-800 hover:bg-slate-100'}`}>
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-blue-500 dark:text-blue-200 uppercase tracking-wider ml-1">Product Name</label>
            <div className="relative">
                <input 
                    autoFocus
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="e.g. Maggi Noodles"
                    className={`w-full border rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-gray-400'}`}
                />
                <Tag size={16} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Price Input */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-blue-500 dark:text-blue-200 uppercase tracking-wider ml-1">Price (₹)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        placeholder="0"
                        className={`w-full border rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-gray-400'}`}
                    />
                    <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-500" />
                </div>
            </div>

            {/* Stock Input */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-blue-500 dark:text-blue-200 uppercase tracking-wider ml-1">Stock Qty</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={stock} 
                        onChange={e => setStock(e.target.value)} 
                        placeholder="0"
                        className={`w-full border rounded-xl py-3 pl-10 pr-3 focus:outline-none focus:border-blue-500 focus:bg-blue-500/5 transition-all ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-gray-400'}`}
                    />
                    <Layers size={16} className="absolute left-3 top-3.5 text-gray-500" />
                </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2 pt-1">
             <label className="text-xs font-medium text-blue-500 dark:text-blue-200 uppercase tracking-wider ml-1">Category</label>
             <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${category === cat ? 'bg-blue-500 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : (darkMode ? 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10' : 'bg-slate-100 text-gray-500 border-slate-200 hover:bg-slate-200')}`}
                    >
                        {cat}
                    </button>
                ))}
             </div>
          </div>

          <button 
            type="submit"
            disabled={!name || !price || !stock}
            className="w-full py-3.5 mt-4 rounded-xl glossy-btn text-white font-bold shadow-lg transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
          >
              <CheckCircle size={18} /> Add to Inventory
          </button>
        </form>
      </div>
    </div>
  );
};
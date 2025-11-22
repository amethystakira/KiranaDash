import React, { useState } from 'react';
import { X, Share2, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import { GlassCard } from './ui/GlassCard';

interface QuickInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSave: (items: {product: Product, qty: number}[]) => void;
  darkMode?: boolean;
}

export const QuickInvoice: React.FC<QuickInvoiceProps> = ({ isOpen, onClose, products, onSave, darkMode = true }) => {
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (existing) {
        return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product: p, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const handleSave = () => {
    onSave(cart);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setCart([]);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md border-t sm:border rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl h-[85vh] flex flex-col transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${darkMode ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>New Sale</h2>
          <button onClick={onClose} className={`p-2 rounded-full ${darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-slate-100 text-gray-500 hover:text-gray-800'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Product List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
           <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tap to add</h3>
           <div className="grid grid-cols-2 gap-2">
             {products.map(p => (
               <button 
                key={p.id}
                onClick={() => addToCart(p)}
                className={`flex flex-col items-start p-3 rounded-xl border active:scale-95 transition-transform text-left ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
               >
                 <span className={`font-medium text-sm truncate w-full ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.name}</span>
                 <span className="text-xs text-blue-500 dark:text-blue-300 mt-1">₹{p.price}</span>
               </button>
             ))}
           </div>

           {/* Cart Summary */}
           {cart.length > 0 && (
             <div className="mt-6">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Bill</h3>
                <div className={`rounded-xl p-3 space-y-2 ${darkMode ? 'bg-white/5' : 'bg-slate-50 border border-slate-200'}`}>
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-xs font-bold text-white">{item.qty}</div>
                        <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{item.product.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={darkMode ? 'text-white' : 'text-slate-900'}>₹{item.product.price * item.qty}</span>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 dark:text-red-400 text-xs">
                          <X size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className={`border-t pt-2 mt-2 flex justify-between items-center font-bold text-lg ${darkMode ? 'border-white/10 text-white' : 'border-slate-200 text-slate-900'}`}>
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
             </div>
           )}
        </div>

        {/* Actions */}
        <div className={`mt-4 pt-2 border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
           {success ? (
             <button className="w-full py-4 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center gap-2 animate-in zoom-in">
               <CheckCircle size={20} /> Sale Recorded!
             </button>
           ) : (
             <div className="flex gap-3">
               <button className={`flex-1 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${darkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  <Share2 size={18} /> Share Bill
               </button>
               <button 
                disabled={cart.length === 0}
                onClick={handleSave}
                className="flex-[2] py-4 rounded-xl glossy-btn text-white font-bold disabled:opacity-50 disabled:grayscale"
               >
                 Complete Sale
               </button>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};
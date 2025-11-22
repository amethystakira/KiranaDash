import React, { useState } from 'react';
import { TrendingUp, Users, ShoppingBag, Plus, AlertTriangle, ArrowRight, X, Wallet, TrendingDown, Clock, Calculator, Minus, Trash2, Package, CheckCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Product, Transaction, DailyStats, Expense } from '../types';
import { TRANSLATIONS } from '../constants';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AddProductModal } from './AddProductModal';

interface DashboardProps {
  todaysSales: number;
  salesGrowth: number;
  expenses: number;
  profit: number;
  transactionCount: number;
  customerCount: number;
  topProducts: Product[];
  allProducts: Product[]; 
  lowStockProducts: Product[];
  onAddSale: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (id: string) => void;
  onAddExpense: () => void;
  salesHistory: DailyStats[];
  todayTransactions: Transaction[];
  todayExpenses: Expense[];
  lang: string;
  darkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  todaysSales,
  salesGrowth,
  expenses,
  profit,
  transactionCount,
  customerCount,
  topProducts,
  allProducts,
  lowStockProducts,
  onAddSale,
  onAddProduct,
  onDeleteProduct,
  onAddExpense,
  salesHistory,
  todayTransactions,
  todayExpenses,
  lang,
  darkMode = true
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [activeLog, setActiveLog] = useState<'orders' | 'visits' | 'expenses' | 'profit' | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); 
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS['English'];
  const avgBilling = transactionCount > 0 ? Math.round(todaysSales / transactionCount) : 0;
  // Fallback for empty chart
  const chartData = salesHistory.length > 0 
    ? salesHistory.slice(-7).map(d => ({ val: d.sales })) 
    : Array(7).fill(0).map(() => ({ val: 0 }));

  const isNeutral = salesGrowth === 0;
  const isPositiveGrowth = salesGrowth > 0;
  
  const GrowthIcon = isNeutral ? Minus : (isPositiveGrowth ? TrendingUp : TrendingDown);
  
  // Styled based on light/dark
  const growthColor = isNeutral 
     ? (darkMode ? 'text-gray-300 bg-white/10 border-white/10' : 'text-gray-500 bg-gray-100 border-gray-200')
     : (isPositiveGrowth 
        ? 'text-green-600 dark:text-green-300 bg-green-500/20 border-green-500/20' 
        : 'text-red-600 dark:text-red-300 bg-red-500/20 border-red-500/20');
     
  const growthValue = `${isPositiveGrowth ? '+' : ''}${salesGrowth.toFixed(1)}%`;


  const renderLogs = () => {
    if (activeLog === 'profit') {
        return (
            <div className="space-y-4 p-2">
                <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <span className="text-blue-600 dark:text-blue-200">Total Sales</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">₹{todaysSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <span className="text-red-600 dark:text-red-200">Expenses</span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-300">-₹{expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <span className="text-purple-600 dark:text-purple-200">Est. Cost of Goods (60%)</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-300">-₹{Math.round(todaysSales * 0.6).toLocaleString()}</span>
                </div>
                 <div className={`h-px my-2 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                 <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-xl border border-green-500/30 shadow-lg">
                    <span className="text-green-700 dark:text-green-200 font-bold">Net Profit</span>
                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">₹{profit.toLocaleString()}</span>
                </div>
                <p className="text-xs text-center text-gray-500 mt-4">Profit is estimated based on sales minus recorded expenses and an assumed 40% margin on goods.</p>
            </div>
        );
    }

    const listBg = darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200';
    
    if (activeLog === 'expenses') {
       return (
         <div className="space-y-3">
           {todayExpenses.length === 0 ? <div className="text-center text-gray-500 py-8">No expenses recorded today.</div> : null}
           {todayExpenses.map(e => (
             <div key={e.id} className={`flex items-center justify-between p-3 rounded-xl border ${listBg}`}>
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-full bg-red-500/20 text-red-500 dark:text-red-400"><TrendingDown size={16}/></div>
                 <div>
                   <p className="font-medium text-sm text-slate-900 dark:text-white">{e.title}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{e.category} • {new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
               </div>
               <p className="font-bold text-red-600 dark:text-red-300">-₹{e.amount}</p>
             </div>
           ))}
         </div>
       );
    }

    const logs = todayTransactions; 
    return (
      <div className="space-y-3">
         {logs.length === 0 ? <div className="text-center text-gray-500 py-8">No activity yet today.</div> : null}
         {logs.map(tx => (
           <div key={tx.id} className={`flex items-center justify-between p-3 rounded-xl border ${listBg}`}>
             <div className="flex items-center gap-3">
               <div className="p-2 rounded-full bg-blue-500/20 text-blue-500 dark:text-blue-400"><ShoppingBag size={16}/></div>
               <div>
                 <p className="font-medium text-sm text-slate-900 dark:text-white">{activeLog === 'visits' ? 'Customer Visit' : 'Order'} #{tx.id.slice(-4)}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {tx.items.length} items</p>
               </div>
             </div>
             <p className="font-bold text-blue-600 dark:text-blue-300">+₹{tx.totalAmount}</p>
           </div>
         ))}
      </div>
    );
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">DailyDash</h1>
          <p className="text-sm text-blue-600 dark:text-blue-200 opacity-80">{t.welcome}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white/20 shadow-lg"></div>
      </div>

      {/* Primary Sales Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-600/30 rounded-3xl blur-2xl opacity-50 transform group-hover:opacity-70 transition-opacity duration-500"></div>
        <GlassCard className="!bg-gradient-to-br from-[#0A4CFF] to-[#0630A0] dark:from-[#0A4CFF]/90 dark:to-[#0630A0]/90 !border-white/10 !p-6 relative overflow-hidden !text-white">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-blue-100 font-medium">{t.todaysSales}</span>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm flex items-center gap-1 border ${growthColor} !text-white !bg-white/20 !border-white/20`}>
                <GrowthIcon size={12} /> {growthValue}
              </span>
            </div>
            <h2 className="text-5xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
              ₹{todaysSales.toLocaleString()}
            </h2>
            
            <div className="h-16 w-full -ml-2 opacity-80">
               <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="val" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard onClick={() => setActiveLog('orders')} className="flex flex-col items-center justify-center py-4 dark:!bg-white/[0.03] dark:hover:!bg-white/[0.08] border border-slate-200 dark:border-white/5">
          <ShoppingBag className="text-blue-500 dark:text-blue-400 mb-2 drop-shadow-md" size={20} />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{transactionCount}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.orders}</span>
        </GlassCard>
        <GlassCard onClick={() => setActiveLog('visits')} className="flex flex-col items-center justify-center py-4 dark:!bg-white/[0.03] dark:hover:!bg-white/[0.08] border border-slate-200 dark:border-white/5">
          <Users className="text-purple-500 dark:text-purple-400 mb-2 drop-shadow-md" size={20} />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{customerCount}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.visits}</span>
        </GlassCard>
        <GlassCard className="flex flex-col items-center justify-center py-4 dark:!bg-white/[0.03] border border-slate-200 dark:border-white/5">
          <div className="text-emerald-500 dark:text-emerald-400 mb-2 font-bold text-lg drop-shadow-md">₹</div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{avgBilling}</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.avgBill}</span>
        </GlassCard>
      </div>

      {/* KPI Row 2: Expenses & Profit */}
      <div className="grid grid-cols-2 gap-3">
         <GlassCard onClick={() => setActiveLog('expenses')} className="flex flex-col items-center justify-center py-4 !bg-red-500/[0.05] !border-red-500/10 hover:!bg-red-500/[0.1]">
            <TrendingDown className="text-red-500 dark:text-red-400 mb-2" size={20} />
            <span className="text-2xl font-bold text-red-700 dark:text-red-100">₹{expenses.toLocaleString()}</span>
            <span className="text-[10px] text-red-600 dark:text-red-300 uppercase tracking-wider">{t.expenses}</span>
         </GlassCard>
         <GlassCard onClick={() => setActiveLog('profit')} className="flex flex-col items-center justify-center py-4 !bg-green-500/[0.05] !border-green-500/10 hover:!bg-green-500/[0.1]">
            <Wallet className="text-green-500 dark:text-green-400 mb-2" size={20} />
            <span className="text-2xl font-bold text-green-700 dark:text-green-100">₹{profit.toLocaleString()}</span>
            <span className="text-[10px] text-green-600 dark:text-green-300 uppercase tracking-wider">{t.profit}</span>
         </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onAddSale}
          className="glossy-btn col-span-2 rounded-xl py-4 px-4 flex items-center justify-center gap-2 text-white font-bold text-lg active:scale-95 transition-transform shadow-blue-900/50 relative overflow-hidden group"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
           <Plus size={24} /> {t.addSale}
        </button>

        <button 
          onClick={onAddExpense}
          className="glass-panel rounded-xl py-3 px-2 flex items-center justify-center text-red-500 dark:text-red-200 font-medium active:scale-95 transition-transform hover:bg-red-500/10 border border-red-500/20 gap-2"
        >
          <Minus size={18}/> {t.addExpense}
        </button>
        
        <button 
          onClick={() => setShowAddProductModal(true)}
          className="glass-panel rounded-xl py-3 px-2 flex items-center justify-center text-blue-500 dark:text-blue-200 font-medium active:scale-95 transition-transform hover:bg-blue-500/10 border border-blue-500/20 gap-2"
        >
          <Plus size={18}/> {t.newItem}
        </button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.needsAttention}</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
            {lowStockProducts.map(p => (
              <GlassCard key={p.id} className="min-w-[200px] snap-center !border-red-500/20 !bg-red-500/[0.05]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-full">
                    <AlertTriangle size={16} className="text-red-500 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate w-24 text-red-700 dark:text-red-100">{p.name}</p>
                    <p className="text-xs text-red-500 dark:text-red-300 mt-1">Only {p.stock} left</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Top Selling Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.topMovers}</h3>
          <button 
            onClick={() => setShowInventory(true)}
            className="text-xs text-blue-500 dark:text-blue-400 flex items-center hover:text-blue-400 dark:hover:text-blue-300 p-1"
          >
            {t.seeAll} <ArrowRight size={12} className="ml-1"/>
          </button>
        </div>
        <div className="space-y-3">
          {topProducts.filter(p => p.salesCount > 0).length === 0 ? (
            <GlassCard className="py-6 flex flex-col items-center justify-center text-center border-dashed !border-white/10 !bg-transparent">
                <div className="p-3 bg-white/5 rounded-full text-gray-400 mb-2"><ShoppingBag size={24}/></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No items sold yet today.</p>
                <p className="text-xs text-gray-500">Start adding sales to see top movers!</p>
            </GlassCard>
          ) : (
            topProducts.slice(0, 3).map((p, i) => (
              <GlassCard key={p.id} className="flex items-center justify-between py-3 dark:!bg-white/[0.03] active:bg-slate-100 dark:active:bg-white/[0.08] border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${i===0 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.salesCount} units sold</p>
                  </div>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-300">₹{p.price}</span>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* All Products / Inventory Manager Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className={`w-full max-w-md h-[80vh] rounded-2xl flex flex-col border shadow-2xl ${darkMode ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}>
             <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                    <Package className="text-blue-500 dark:text-blue-400" size={20} />
                    <div>
                        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Inventory</h2>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{allProducts.length} items available</p>
                    </div>
                </div>
                <button onClick={() => setShowInventory(false)} className={`p-2 rounded-full ${darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-slate-100 text-gray-500 hover:text-gray-800'}`}>
                  <X size={20} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {allProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No products in inventory. <br/> Click "Add New Item" to start.
                    </div>
                )}
                {allProducts.map((p, i) => (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${darkMode ? 'bg-white/10 text-gray-400' : 'bg-slate-200 text-gray-600'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{p.name}</p>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{p.category} • Stock: {p.stock}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-2">
                      <div className="text-right">
                        <p className="font-bold text-blue-600 dark:text-blue-300">₹{p.price}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (deleteId === p.id) {
                                onDeleteProduct(p.id);
                                setDeleteId(null);
                            } else {
                                setDeleteId(p.id);
                                setTimeout(() => setDeleteId(null), 3000);
                            }
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                            deleteId === p.id 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/50 scale-105' 
                            : 'bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 active:scale-95'
                        }`}
                      >
                          {deleteId === p.id ? <CheckCircle size={16} /> : <Trash2 size={16} />}
                          {deleteId === p.id && <span className="text-xs font-bold">Confirm</span>}
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                    onClick={() => { setShowInventory(false); setShowAddProductModal(true); }}
                    className={`w-full py-3 rounded-xl border border-dashed transition-colors flex items-center justify-center gap-2 ${darkMode ? 'border-white/20 text-gray-400 hover:text-white hover:border-white/40' : 'border-gray-300 text-gray-500 hover:text-slate-900 hover:border-gray-400'}`}
                >
                    <Plus size={16} /> Add Another Item
                </button>
             </div>
           </div>
        </div>
      )}

       {/* Log Viewer Modal */}
       {activeLog && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-md max-h-[70vh] rounded-2xl flex flex-col border shadow-2xl ${darkMode ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                 <div className="flex items-center gap-2">
                    {activeLog === 'expenses' ? <TrendingDown size={18} className="text-red-500 dark:text-red-400"/> : 
                     activeLog === 'profit' ? <Calculator size={18} className="text-green-500 dark:text-green-400"/> :
                     <Clock size={18} className="text-blue-500 dark:text-blue-400"/>}
                    <h2 className={`text-lg font-bold capitalize ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {activeLog === 'expenses' ? t.expenses : activeLog === 'profit' ? 'Profit Breakdown' : t.recentActivity}
                    </h2>
                 </div>
                 <button onClick={() => setActiveLog(null)} className={`p-2 rounded-full ${darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-slate-100 text-gray-500 hover:text-gray-800'}`}>
                   <X size={20} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                 {renderLogs()}
              </div>
            </div>
         </div>
       )}

       {/* Add Product Modal Component */}
       <AddProductModal 
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onSave={onAddProduct}
          darkMode={darkMode}
       />
    </div>
  );
};
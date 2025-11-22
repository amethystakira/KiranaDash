import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Trends } from './components/Trends';
import { Forecast } from './components/Forecast';
import { Settings } from './components/Settings';
import { Navigation } from './components/Navigation';
import { QuickInvoice } from './components/QuickInvoice';
import { AppView, Product, DailyStats, Transaction, AppSettings, Expense, BackupData } from './types';
import { MOCK_PRODUCTS, MOCK_HISTORY, TODAY_TRANSACTIONS, MOCK_EXPENSES } from './constants';
import { X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  
  // --- Application State ---
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [history, setHistory] = useState<DailyStats[]>(MOCK_HISTORY);
  const [todayTransactions, setTodayTransactions] = useState<Transaction[]>(TODAY_TRANSACTIONS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  
  // State for visits (Reset to 0 for fresh install)
  const [baseVisits, setBaseVisits] = useState(0);

  // --- Settings State ---
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'INR',
    language: 'English',
    darkMode: true,
    lowDataMode: false,
    offlineMode: false
  });

  // Apply Global Dark Mode to HTML tag for scrollbars
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Computed Daily Stats
  const todaysSales = todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  // Simple profit model: Sales - (0.6 * Sales [Cost of Goods]) - Expenses
  const profit = Math.round((todaysSales * 0.40) - totalExpenses);

  const transactionCount = todayTransactions.length;
  
  // Calculate visits: Unique transactions + base walk-ins
  const customerCount = new Set(todayTransactions.map(t => t.id)).size + baseVisits; 
  
  // Calculate Growth (Today vs Yesterday)
  const yesterdaySales = history.length > 0 ? history[history.length - 1].sales : 0;
  
  // Fix: Handle case where yesterday sales are 0 or history is empty
  let salesGrowth = 0;
  if (yesterdaySales > 0) {
      salesGrowth = ((todaysSales - yesterdaySales) / yesterdaySales) * 100;
  } else if (yesterdaySales === 0 && todaysSales > 0) {
      salesGrowth = 100; // 0 to something is 100% growth in simplified terms for UI
  } else {
      salesGrowth = 0;
  }

  // Derived State
  const topProducts = [...products].sort((a, b) => b.salesCount - a.salesCount);
  const lowStockProducts = products.filter(p => p.stock < 15);

  // Handlers
  const handleAddSale = (items: {product: Product, qty: number}[]) => {
    const total = items.reduce((sum, i) => sum + (i.product.price * i.qty), 0);
    const newTx: Transaction = {
      id: Date.now().toString(),
      timestamp: new Date(),
      totalAmount: total,
      items: items.map(i => ({
        productId: i.product.id,
        quantity: i.qty,
        name: i.product.name,
        price: i.product.price
      }))
    };
    setTodayTransactions(prev => [newTx, ...prev]);
    
    // Update stock and sales count
    setProducts(prev => prev.map(p => {
       const item = items.find(i => i.product.id === p.id);
       if (item) {
           return { ...p, stock: p.stock - item.qty, salesCount: p.salesCount + item.qty };
       }
       return p;
    }));
  };

  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'salesCount'>) => {
    const newProduct: Product = {
        id: Date.now().toString(),
        salesCount: 0,
        ...newProductData
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
  };

  const saveExpense = (title: string, amount: number, category: Expense['category']) => {
      const newExp: Expense = {
        id: Date.now().toString(),
        title,
        amount,
        timestamp: new Date(),
        category
      };
      setExpenses(prev => [newExp, ...prev]);
      setExpenseModalOpen(false);
  };

  const handleResetData = (mode: 'daily' | 'weekly' | 'monthly') => {
    if (mode === 'daily') {
      setTodayTransactions([]);
      setExpenses([]);
      setBaseVisits(0); 
    } else if (mode === 'monthly') {
      setHistory([]);
      setTodayTransactions([]);
      setExpenses([]);
      setBaseVisits(0); 
    }
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleRestoreData = (data: BackupData) => {
    if (data.products) setProducts(data.products);
    if (data.history) setHistory(data.history);
    // Restore dates correctly for transactions
    if (data.transactions) {
      const restoredTxs = data.transactions.map(t => ({
        ...t,
        timestamp: new Date(t.timestamp)
      }));
      setTodayTransactions(restoredTxs);
    }
    // Restore dates correctly for expenses
    if (data.expenses) {
      const restoredExp = data.expenses.map(e => ({
        ...e,
        timestamp: new Date(e.timestamp)
      }));
      setExpenses(restoredExp);
    }
    if (typeof data.baseVisits === 'number') setBaseVisits(data.baseVisits);
    if (data.settings) setSettings(data.settings);
  };

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Dashboard 
            todaysSales={todaysSales}
            salesGrowth={salesGrowth}
            expenses={totalExpenses}
            profit={profit}
            transactionCount={transactionCount}
            customerCount={customerCount}
            topProducts={topProducts}
            allProducts={products}
            lowStockProducts={lowStockProducts}
            onAddSale={() => setInvoiceOpen(true)}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddExpense={() => setExpenseModalOpen(true)}
            salesHistory={history}
            todayTransactions={todayTransactions}
            todayExpenses={expenses}
            lang={settings.language}
            darkMode={settings.darkMode}
          />
        );
      case 'trends':
        const todayStr = new Date().toISOString().split('T')[0];
        const trendsHistory = history.length > 0 ? [...history] : [];
        // Only add today if we have activity or if we want the chart to show at least today's zero point
        trendsHistory.push({ 
            date: todayStr, 
            sales: todaysSales, 
            transactions: transactionCount, 
            customers: customerCount 
        });
        
        return (
            <Trends 
                history={trendsHistory} 
                transactions={todayTransactions}
                products={products}
                salesGrowth={salesGrowth}
                lang={settings.language} 
                darkMode={settings.darkMode}
            />
        );
      case 'forecast':
        return <Forecast history={history} products={products} lang={settings.language} darkMode={settings.darkMode} />;
      case 'settings':
        return (
          <Settings 
            onResetData={handleResetData} 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            backupData={{
              products,
              history,
              transactions: todayTransactions,
              expenses,
              baseVisits
            }}
            onRestoreData={handleRestoreData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${settings.darkMode ? 'dark' : ''}`}>
      <div className={`min-h-screen font-sans transition-colors duration-300 selection:bg-blue-500 selection:text-white overflow-x-hidden ${settings.lowDataMode ? 'motion-reduce' : ''} bg-slate-50 dark:bg-[#000510] text-slate-900 dark:text-white`}>
        
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-[-1]">
          {settings.darkMode ? (
            <>
              {!settings.lowDataMode && (
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
              )}
              <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-800/5 rounded-full blur-[100px] pointer-events-none"></div>
            </>
          ) : (
             <div className="absolute inset-0 bg-slate-50"></div>
          )}
        </div>

        {/* Main Content Area */}
        <main className="pt-2 pb-20 max-w-md mx-auto min-h-screen relative">
          {renderView()}
        </main>

        {/* Navigation */}
        <Navigation currentView={currentView} onChange={setCurrentView} lang={settings.language} darkMode={settings.darkMode} />

        {/* Quick Invoice Modal */}
        <QuickInvoice 
          isOpen={invoiceOpen} 
          onClose={() => setInvoiceOpen(false)} 
          products={products}
          onSave={handleAddSale}
          darkMode={settings.darkMode}
        />

        {/* Add Expense Modal (Inline) */}
        {expenseModalOpen && (
          <AddExpenseModal 
             isOpen={expenseModalOpen} 
             onClose={() => setExpenseModalOpen(false)} 
             onSave={saveExpense} 
             darkMode={settings.darkMode}
          />
        )}

      </div>
    </div>
  );
};

// Internal helper component for adding expense
const AddExpenseModal = ({ isOpen, onClose, onSave, darkMode }: { isOpen: boolean, onClose: () => void, onSave: (t: string, a: number, c: Expense['category']) => void, darkMode: boolean }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Expense['category']>('Misc');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && amount) {
            onSave(title, parseFloat(amount), category);
            setTitle(''); setAmount('');
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className={`w-full max-w-sm rounded-2xl border shadow-2xl p-6 animate-in zoom-in-95 ${darkMode ? 'bg-[#0F172A] border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add Expense</h3>
                    <button onClick={onClose} className={`p-1 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}><X size={20}/></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Title</label>
                        <input 
                           autoFocus
                           type="text" 
                           value={title} 
                           onChange={e => setTitle(e.target.value)} 
                           placeholder="e.g. Tea, Repair, Bill"
                           className={`w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-gray-400'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount (₹)</label>
                        <input 
                           type="number" 
                           value={amount} 
                           onChange={e => setAmount(e.target.value)} 
                           placeholder="0.00"
                           className={`w-full border rounded-xl p-3 focus:outline-none focus:border-blue-500 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-gray-400'}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</label>
                        <div className="grid grid-cols-2 gap-2">
                           {['Utility', 'Rent', 'Salary', 'Misc'].map(c => (
                               <button 
                                 key={c}
                                 type="button"
                                 onClick={() => setCategory(c as any)}
                                 className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                                   category === c 
                                     ? 'bg-blue-600 text-white' 
                                     : darkMode 
                                       ? 'bg-white/5 text-gray-400 hover:bg-white/10' 
                                       : 'bg-slate-100 text-gray-500 hover:bg-slate-200'
                                 }`}
                               >
                                   {c}
                               </button>
                           ))}
                        </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={!title || !amount}
                      className="w-full py-3 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/50 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        Save Expense
                    </button>
                </form>
            </div>
        </div>
    )
}

export default App;
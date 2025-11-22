
import React, { useEffect, useState, useCallback } from 'react';
import { GlassCard } from './ui/GlassCard';
import { generateSalesForecast } from '../services/geminiService';
import { DailyStats, Product, ForecastData, StockAlert } from '../types';
import { Sparkles, AlertOctagon, ArrowUpRight, RefreshCw, AlertCircle } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { TRANSLATIONS } from '../constants';

interface ForecastProps {
  history: DailyStats[];
  products: Product[];
  lang: string;
  darkMode?: boolean;
}

export const Forecast: React.FC<ForecastProps> = ({ history, products, lang, darkMode = true }) => {
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang] || TRANSLATIONS['English'];

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Artificial delay to show loading state nicely if API is fast or mocked
      const [data] = await Promise.all([
        generateSalesForecast(history, products),
        new Promise(resolve => setTimeout(resolve, 800)) 
      ]);
      
      if (data.forecast && data.forecast.length > 0) {
        setForecast(data.forecast);
        setAlerts(data.stockAlerts || []);
      } else {
         setError("Could not generate forecast data.");
      }
    } catch (e) {
      console.error("Error fetching forecast", e);
      setError("AI Service temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [history, products]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-2 rounded-lg shadow-xl border ${darkMode ? 'bg-purple-900/90 backdrop-blur-md border-white/20' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full" style={{backgroundColor: p.color}}/>
               <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                 {p.name === 'predictedSales' ? 'Sales' : 'Profit'}: ₹{Math.round(p.value)}
               </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-in fade-in duration-700">
       <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-2">
           <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Sparkles size={20} className={darkMode ? "text-purple-300" : "text-purple-600"} />
           </div>
           <div>
             <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">{t.aiForecast}</h1>
             <p className={`text-xs ${darkMode ? 'text-purple-200/70' : 'text-purple-700/60'}`}>{t.poweredBy}</p>
           </div>
         </div>
         <button 
           onClick={fetchForecast} 
           disabled={loading}
           className={`p-2 rounded-full transition-all disabled:opacity-50 ${darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
         >
           <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
         </button>
       </div>

       {loading ? (
         <div className="flex flex-col items-center justify-center h-64 space-y-4">
           <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
           <p className={`text-sm animate-pulse ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Crunching daily numbers...</p>
         </div>
       ) : error ? (
         <div className="flex flex-col items-center justify-center h-64 text-center p-4 bg-red-500/5 rounded-2xl border border-red-500/20">
            <AlertCircle size={32} className="text-red-400 mb-2" />
            <p className="text-red-500 dark:text-red-200 mb-2">{error}</p>
            <button onClick={fetchForecast} className="px-4 py-2 bg-red-500/20 rounded-lg text-red-500 dark:text-red-200 text-sm font-bold hover:bg-red-500/30">Try Again</button>
         </div>
       ) : (
         <>
            {/* Forecast Chart */}
            <GlassCard className={`h-72 w-full relative overflow-hidden ${darkMode ? '!bg-gradient-to-br !from-purple-900/40 !to-blue-900/40 !border-purple-500/20' : 'bg-white !border-purple-100'}`}>
               <div className="relative z-10 p-2">
                 <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>7-Day Prediction</h3>
                 <p className={`text-xs mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Expected revenue & profit</p>
                 
                 <div className="h-48 w-full -ml-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast}>
                      <defs>
                        <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d8b4fe" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#d8b4fe" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip content={<CustomTooltip />} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', fontSize: 10}}
                        dy={10}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predictedSales" 
                        stroke="#c084fc" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorPredict)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predictedProfit" 
                        stroke="#4ade80" 
                        strokeWidth={2}
                        strokeDasharray="4 4" 
                        fillOpacity={1} 
                        fill="url(#colorProfit)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                 </div>
               </div>
            </GlassCard>

             {/* Quick Stats for Forecast */}
             <div className="grid grid-cols-2 gap-3">
                 <GlassCard className={`!py-3 flex flex-col items-center ${darkMode ? '!bg-purple-500/10' : '!bg-purple-50 border-purple-100'}`}>
                    <span className={`text-xs ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>Avg Daily Sales</span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-purple-100' : 'text-purple-900'}`}>₹{Math.round(forecast.reduce((a,b)=>a+b.predictedSales,0)/7)}</span>
                 </GlassCard>
                 <GlassCard className={`!py-3 flex flex-col items-center ${darkMode ? '!bg-green-500/10' : '!bg-green-50 border-green-100'}`}>
                    <span className={`text-xs ${darkMode ? 'text-green-200' : 'text-green-700'}`}>{t.predictedProfit}</span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-green-100' : 'text-green-900'}`}>₹{Math.round(forecast.reduce((a,b)=>a+b.predictedProfit || 0,0)/7)}</span>
                 </GlassCard>
             </div>

            {/* Smart Alerts */}
            <div className="space-y-3">
              <h3 className={`text-lg font-semibold ml-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t.smartAlerts}</h3>
              {alerts.map((alert, idx) => (
                <GlassCard key={idx} className={`flex items-start gap-3 !p-4 ${alert.severity === 'critical' ? (darkMode ? '!bg-red-500/10 !border-red-500/30' : '!bg-red-50 border-red-100') : (darkMode ? '!bg-yellow-500/10 !border-yellow-500/30' : '!bg-yellow-50 border-yellow-100')}`}>
                  <div className={`p-2 rounded-full ${alert.severity === 'critical' ? (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') : (darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600')}`}>
                    <AlertOctagon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{alert.productName}</p>
                    <p className={`text-xs mt-1 ${darkMode ? 'opacity-80 text-white' : 'text-gray-600'}`}>
                      Predicted to run out in <span className="font-bold">{alert.daysRemaining} days</span> based on current velocity.
                    </p>
                  </div>
                  <button className={`p-2 rounded-lg active:scale-95 ${darkMode ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    <ArrowUpRight size={16} />
                  </button>
                </GlassCard>
              ))}
              {alerts.length === 0 && (
                 <div className={`text-sm text-center py-8 rounded-xl border border-dashed ${darkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-slate-50 border-slate-300 text-gray-500'}`}>
                   No stock risks detected. <br/>Inventory looks healthy!
                 </div>
              )}
            </div>
         </>
       )}
    </div>
  );
};
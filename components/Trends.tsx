
import React, { useRef, useMemo, useState } from 'react';
import { DailyStats, Transaction, Product } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, Cell, PieChart, Pie, YAxis } from 'recharts';
import { GlassCard } from './ui/GlassCard';
import { Download, TrendingUp, Calendar, PieChart as PieChartIcon, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { TRANSLATIONS, THEME } from '../constants';

interface TrendsProps {
  history: DailyStats[];
  transactions: Transaction[];
  products: Product[];
  salesGrowth: number;
  lang: string;
  darkMode?: boolean;
}

export const Trends: React.FC<TrendsProps> = ({ history, transactions = [], products = [], salesGrowth, lang, darkMode = true }) => {
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS['English'];
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Calibrate Hourly Data based on actual logs
  const hourlyData = useMemo(() => {
      const hours = [
          { label: '8AM', start: 8, end: 10, sales: 0 },
          { label: '10AM', start: 10, end: 12, sales: 0 },
          { label: '12PM', start: 12, end: 14, sales: 0 },
          { label: '2PM', start: 14, end: 16, sales: 0 },
          { label: '4PM', start: 16, end: 18, sales: 0 },
          { label: '6PM', start: 18, end: 20, sales: 0 },
          { label: '8PM', start: 20, end: 24, sales: 0 },
      ];

      transactions.forEach(tx => {
          const h = new Date(tx.timestamp).getHours();
          const bucket = hours.find(b => h >= b.start && h < b.end);
          if (bucket) {
              bucket.sales += tx.totalAmount;
          }
      });

      return hours.map(h => ({ hour: h.label, sales: h.sales }));
  }, [transactions]);

  // Calculate Category Pie Data Dynamically
  const categoryData = useMemo(() => {
    const stats: Record<string, number> = {};
    
    if (transactions.length === 0) return [];

    transactions.forEach(tx => {
      tx.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        const category = product?.category || 'Other';
        stats[category] = (stats[category] || 0) + (item.price * item.quantity);
      });
    });

    // Colors for the chart
    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];

    return Object.entries(stats)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, products]);

  // Robust Download Function
  const handleDownload = async () => {
    if (!chartContainerRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
        const svgElement = chartContainerRef.current.querySelector('svg');
        if (!svgElement) throw new Error("Chart SVG not found");

        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);
        const width = svgElement.clientWidth || 600;
        const height = svgElement.clientHeight || 300;
        const scale = 2; 

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context failed");

        // Fill Background (Use actual theme color)
        ctx.fillStyle = darkMode ? THEME.darkBg : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add Title
        ctx.font = "bold 24px sans-serif";
        ctx.fillStyle = darkMode ? "#ffffff" : "#000000";
        ctx.fillText(`DailyDash Trend Report - ${new Date().toLocaleDateString()}`, 40, 50);

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width * scale, height * scale);
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.onerror = reject;
            img.src = url;
        });

        const link = document.createElement('a');
        link.download = `dailydash-trends-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

    } catch (err) {
        console.error("Download failed:", err);
        alert("Could not download report. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  // Growth Indicator Logic
  const isNeutral = salesGrowth === 0;
  const isPositive = salesGrowth > 0;
  const GrowthIcon = isNeutral ? Minus : (isPositive ? TrendingUp : TrendingDown);
  const growthColor = isNeutral 
     ? (darkMode ? 'text-gray-300' : 'text-gray-500')
     : (isPositive ? (darkMode ? 'text-green-400' : 'text-green-600') : (darkMode ? 'text-red-400' : 'text-red-600'));
  const growthText = `${isPositive ? '+' : ''}${salesGrowth.toFixed(1)}%`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl shadow-2xl border ${darkMode ? 'bg-[#0B1529]/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
          <p className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 pb-24 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
           <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
             <TrendingUp size={20} />
           </div>
           {t.trends}
        </h1>
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 border ${darkMode ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'}`}
        >
           {isDownloading ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}
           <span>Report</span>
        </button>
      </div>

      {/* Main Revenue Chart */}
      <div ref={chartContainerRef}>
          <GlassCard className="!p-0 overflow-hidden border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-transparent">
            <div className="p-5 pb-0 flex justify-between items-start">
                <div>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t.revenueHistory}</h2>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last 7 Days Performance</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${growthColor} ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                    <GrowthIcon size={14} />
                    <span className="text-xs font-bold">{growthText}</span>
                </div>
            </div>

            <div className="h-64 w-full mt-4 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10}} 
                        tickFormatter={(str) => {
                            const date = new Date(str);
                            return isNaN(date.getTime()) ? str : date.toLocaleDateString(undefined, {weekday: 'short'});
                        }}
                        dy={10}
                    />
                    <YAxis 
                        hide
                        domain={['dataMin - 1000', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{stroke: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 2}} />
                    <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#3B82F6" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        animationDuration={1500}
                    />
                </AreaChart>
                </ResponsiveContainer>
            </div>
          </GlassCard>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 gap-6">
          
          {/* Hourly Breakdown */}
          <div className="space-y-2">
            <h3 className={`text-sm font-bold uppercase tracking-wider ml-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
               <Calendar size={14}/> {t.peakHours} (Today)
            </h3>
            <GlassCard className={`h-48 flex items-end pb-0 px-2 !border-purple-500/10 ${darkMode ? '!bg-purple-500/5' : '!bg-purple-50'}`}>
                {hourlyData.every(d => d.sales === 0) ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No sales recorded yet today
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                            <Tooltip 
                                cursor={{fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                                contentStyle={{
                                    backgroundColor: darkMode ? '#0B1529' : '#ffffff', 
                                    borderRadius: '12px', 
                                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                    color: darkMode ? '#fff' : '#000'
                                }}
                            />
                            <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                                {hourlyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.sales > 0 ? '#A855F7' : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')} />
                                ))}
                            </Bar>
                            <XAxis dataKey="hour" tick={{fill: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 9}} tickLine={false} axisLine={false} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </GlassCard>
          </div>

          {/* Category Pie Chart */}
          <div className="space-y-2">
            <h3 className={`text-sm font-bold uppercase tracking-wider ml-1 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
               <PieChartIcon size={14}/> {t.categoryBreakdown}
            </h3>
            <GlassCard className={`min-h-[340px] flex flex-col !border-emerald-500/10 ${darkMode ? '!bg-emerald-500/5' : '!bg-emerald-50'}`}>
                {categoryData.length === 0 ? (
                     <div className="flex-1 flex items-center justify-center text-gray-500 text-xs">
                        No categorical data available
                     </div>
                ) : (
                    <>
                        <div className="h-64 w-full relative">
                             {/* Donut Center Text */}
                             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className={`text-xs block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Top</span>
                                    <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{categoryData[0]?.name}</span>
                                </div>
                             </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="55%"
                                        outerRadius="75%"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-3 mt-4 pb-2">
                            {categoryData.slice(0, 4).map((entry, index) => (
                                <div key={index} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></div>
                                    <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{entry.name}</span>
                                    <span className="text-[10px] text-gray-500">({Math.round((entry.value / categoryData.reduce((a,b)=>a+b.value,0))*100)}%)</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </GlassCard>
          </div>

      </div>
    </div>
  );
};
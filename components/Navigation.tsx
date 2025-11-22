import React from 'react';
import { Home, BarChart2, Sparkles, Settings } from 'lucide-react';
import { AppView } from '../types';
import { TRANSLATIONS } from '../constants';

interface NavigationProps {
  currentView: AppView;
  onChange: (view: AppView) => void;
  lang?: string;
  darkMode?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChange, lang = 'English', darkMode = true }) => {
  
  const t = TRANSLATIONS[lang] || TRANSLATIONS['English'];

  const navItems: { id: AppView; icon: React.ElementType; label: string }[] = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'trends', icon: BarChart2, label: t.trends },
    { id: 'forecast', icon: Sparkles, label: t.forecast },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-[#020A1C] via-[#020A1C] to-transparent dark:from-[#020A1C] dark:via-[#020A1C] from-white via-white">
      <div className={`backdrop-blur-xl border rounded-2xl shadow-2xl flex justify-around items-center h-16 relative overflow-hidden ${darkMode ? 'bg-[#0B1529]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
        
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="relative z-10 flex flex-col items-center justify-center w-full h-full group"
            >
              <div className={`transition-all duration-300 ${isActive ? 'text-blue-500 dark:text-blue-400 -translate-y-1' : 'text-gray-400 group-active:scale-90'}`}>
                <item.icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`text-[10px] mt-1 font-medium transition-all duration-300 ${isActive ? (darkMode ? 'text-white opacity-100' : 'text-slate-900 opacity-100') : 'text-gray-500 opacity-0 translate-y-2'}`}>
                {item.label}
              </span>

              {/* Active Glow Background */}
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-blue-500 rounded-t-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
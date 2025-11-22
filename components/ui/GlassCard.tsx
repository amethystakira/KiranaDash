import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        rounded-2xl p-4 relative overflow-hidden transition-all duration-300
        bg-white border border-slate-200 text-slate-900 shadow-sm
        dark:bg-white/[0.03] dark:border-white/10 dark:text-white dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
        backdrop-blur-xl
        ${onClick ? 'cursor-pointer active:scale-[0.98] hover:bg-slate-50 dark:hover:bg-white/[0.04]' : ''} 
        ${className}
      `}
    >
      {/* Glossy sheen effect - Removed in Dark Mode (dark:opacity-0) as requested */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none opacity-50 dark:opacity-0" />
      {children}
    </div>
  );
};
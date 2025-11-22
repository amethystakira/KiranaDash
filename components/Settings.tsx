import React, { useState, useRef } from 'react';
import { Settings as SettingsIcon, Globe, Database, Trash2, Shield, Smartphone, Moon, RefreshCw, CheckCircle, X, Loader2, Upload, Download } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AppSettings, BackupData } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsProps {
  onResetData: (mode: 'daily' | 'weekly' | 'monthly') => void;
  settings?: AppSettings;
  onUpdateSettings?: (settings: Partial<AppSettings>) => void;
  backupData: Omit<BackupData, 'version' | 'timestamp' | 'settings'>;
  onRestoreData: (data: BackupData) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onResetData, 
  settings = { language: 'English', lowDataMode: false, darkMode: true, currency: 'INR', offlineMode: false }, 
  onUpdateSettings = (_: Partial<AppSettings>) => {},
  backupData,
  onRestoreData
}) => {
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedResetMode, setSelectedResetMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // UI State for interactions
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'completed'>('idle');
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'restoring' | 'success' | 'error'>('idle');
  const [lastBackup, setLastBackup] = useState<string>('Never');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[settings.language] || TRANSLATIONS['English'];

  const handleResetClick = (mode: 'daily' | 'weekly' | 'monthly') => {
    setSelectedResetMode(mode);
    setResetModalOpen(true);
  };

  const confirmReset = () => {
    onResetData(selectedResetMode);
    setResetModalOpen(false);
  };

  const handleBackup = () => {
    if (backupStatus === 'backing_up') return;
    setBackupStatus('backing_up');
    
    try {
      const fullBackup: BackupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        settings: settings,
        ...backupData
      };

      // Create JSON blob and download
      const dataStr = JSON.stringify(fullBackup, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `dailydash_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setBackupStatus('completed');
        setLastBackup(new Date().toLocaleString());
        setTimeout(() => setBackupStatus('idle'), 3000);
      }, 1000);
    } catch (error) {
      console.error("Backup failed", error);
      setBackupStatus('idle');
      alert("Failed to generate backup file.");
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setRestoreStatus('restoring');
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Basic validation
        if (!json.products || !json.settings) {
          throw new Error("Invalid backup file format");
        }
        
        onRestoreData(json);
        setRestoreStatus('success');
        setTimeout(() => setRestoreStatus('idle'), 3000);
      } catch (error) {
        console.error("Restore failed", error);
        setRestoreStatus('error');
        alert("Invalid backup file. Please select a valid DailyDash backup.");
        setTimeout(() => setRestoreStatus('idle'), 3000);
      }
    };

    reader.onerror = () => {
      setRestoreStatus('error');
      setTimeout(() => setRestoreStatus('idle'), 3000);
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const languages = ['English', 'Hindi (हिंदी)', 'Gujarati (ગુજરાતી)', 'Hinglish'];

  return (
    <div className="p-4 pb-24 space-y-6 animate-in slide-in-from-right duration-300">
      <h1 className="text-2xl font-bold dark:text-white text-slate-900">{t.settings}</h1>

      <div className="space-y-4">
        {/* Preferences Section */}
        <section>
          <h2 className="text-xs text-blue-500 dark:text-blue-300 uppercase tracking-wider font-bold mb-3 ml-1 opacity-80">App Preferences</h2>
          <GlassCard className="space-y-0 !p-0">
            
            {/* Language Selector */}
            <div 
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer active:bg-slate-100 dark:active:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full text-blue-500 dark:text-blue-400">
                  <Globe size={18} />
                </div>
                <span>{t.language}</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                 {settings.language}
              </span>
            </div>

            {/* Dark Mode Toggle */}
            <div 
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-500/10 rounded-full text-purple-500 dark:text-purple-400">
                  <Moon size={18} />
                </div>
                <span>Dark Mode</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors shadow-inner ${settings.darkMode ? 'bg-blue-600 shadow-black/20' : 'bg-slate-300'}`}>
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>

             {/* Low Data Mode Toggle */}
             <div 
               onClick={() => onUpdateSettings({ lowDataMode: !settings.lowDataMode })}
               className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
             >
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-500/10 rounded-full text-green-500 dark:text-green-400">
                  <Smartphone size={18} />
                </div>
                <span>{t.lowDataMode}</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.lowDataMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all ${settings.lowDataMode ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Data Management */}
        <section>
          <h2 className="text-xs text-blue-500 dark:text-blue-300 uppercase tracking-wider font-bold mb-3 ml-1 opacity-80">Data Management</h2>
          <GlassCard className="space-y-0 !p-0">
            
            {/* Backup Action */}
            <div 
              onClick={handleBackup}
              className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-500 dark:text-indigo-400">
                  <Database size={18} />
                </div>
                <div className="flex flex-col">
                  <span>{t.backupData}</span>
                  <span className="text-[10px] text-gray-500">{lastBackup === 'Never' ? 'Tap to save device backup' : `Saved: ${lastBackup}`}</span>
                </div>
              </div>
              {backupStatus === 'idle' && <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1"><Download size={12}/> Download</span>}
              {backupStatus === 'backing_up' && <Loader2 size={16} className="animate-spin text-blue-500" />}
              {backupStatus === 'completed' && <CheckCircle size={16} className="text-green-500" />}
            </div>

            {/* Restore Action */}
            <div 
              onClick={handleRestoreClick}
              className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/10 rounded-full text-teal-500 dark:text-teal-400">
                  <Upload size={18} />
                </div>
                <div className="flex flex-col">
                  <span>Restore Data</span>
                  <span className="text-[10px] text-gray-500">Import from backup file</span>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              {restoreStatus === 'idle' && <span className="text-xs bg-teal-500/10 text-teal-600 dark:text-teal-300 px-3 py-1 rounded-full border border-teal-500/20">Select File</span>}
              {restoreStatus === 'restoring' && <Loader2 size={16} className="animate-spin text-teal-500" />}
              {restoreStatus === 'success' && <CheckCircle size={16} className="text-green-500" />}
              {restoreStatus === 'error' && <X size={16} className="text-red-500" />}
            </div>
            
            {/* Clear Data */}
            <div onClick={() => handleResetClick('daily')} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer group transition-colors">
              <div className="flex items-center gap-3 group-hover:text-red-500 dark:group-hover:text-red-300 transition-colors">
                <div className="p-2 bg-orange-500/10 rounded-full text-orange-500 dark:text-orange-400 group-hover:bg-red-500/20 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                  <RefreshCw size={18} />
                </div>
                <span>{t.clearData}</span>
              </div>
            </div>

            {/* Factory Reset */}
             <div onClick={() => handleResetClick('monthly')} className="flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer group transition-colors">
              <div className="flex items-center gap-3 group-hover:text-red-500 dark:group-hover:text-red-300 transition-colors">
                <div className="p-2 bg-red-500/10 rounded-full text-red-500 dark:text-red-400 group-hover:bg-red-500/20 transition-colors">
                  <Trash2 size={18} />
                </div>
                <span>{t.factoryReset}</span>
              </div>
            </div>
          </GlassCard>
        </section>

         <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-600 mt-8">
           <Shield size={14} />
           <span className="text-xs">DailyDash v1.3.0 • Secure & Local</span>
         </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 ${settings.darkMode ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-center mb-4">
               <div className="p-3 bg-red-500/20 rounded-full text-red-500">
                  <Trash2 size={32} />
               </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Are you sure?</h3>
            <p className={`text-sm mb-6 text-center ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              This will permanently delete {selectedResetMode === 'daily' ? "today's sales entries" : "all sales data for this month"}. 
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setResetModalOpen(false)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${settings.darkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmReset}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-900/50 transition-colors"
              >
                Yes, Clear It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Modal (Centered) */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl w-full max-w-xs shadow-2xl overflow-hidden animate-in zoom-in-95 ${settings.darkMode ? 'bg-[#0F172A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className={`flex justify-between items-center p-4 border-b ${settings.darkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Globe size={18} className="text-blue-500 dark:text-blue-400"/> Select Language
              </h3>
              <button onClick={() => setShowLanguageModal(false)} className={`p-1 rounded-full ${settings.darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-200 text-gray-500'}`}><X size={20}/></button>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => {
                    onUpdateSettings({ language: lang });
                    setShowLanguageModal(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-colors mb-1 flex items-center justify-between ${settings.language === lang ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20' : 'border border-transparent hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  <span>{lang}</span>
                  {settings.language === lang && <CheckCircle size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
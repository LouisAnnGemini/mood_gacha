import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { GachaScene } from './components/GachaScene';
import { Timeline } from './components/Timeline';
import { MoodManager } from './components/MoodManager';
import { StatisticsView } from './components/StatisticsView';
import { CalendarView } from './components/CalendarView';
import { Sparkles, Calendar, Settings, Download, Upload, BarChart2, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'gacha' | 'timeline' | 'stats' | 'calendar' | 'settings'>('gacha');
  const { exportData, importData } = useApp();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-gacha-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importData(json);
        alert('Data imported successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to import data. Invalid JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-slate-950/80 border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0 mr-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
              Mood Gacha
            </h1>
          </div>

          <nav className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 shrink-0">
            {[
              { id: 'gacha', icon: Sparkles, label: 'Summon' },
              { id: 'calendar', icon: CalendarDays, label: 'Calendar' },
              { id: 'timeline', icon: Calendar, label: 'Timeline' },
              { id: 'stats', icon: BarChart2, label: 'Stats' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-800 rounded-lg border border-slate-700"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'gacha' && <GachaScene />}
            {activeTab === 'timeline' && <Timeline />}
            {activeTab === 'stats' && <StatisticsView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <MoodManager />
                
                {/* Data Management Section */}
                <div className="w-full max-w-4xl mx-auto p-4 border-t border-slate-800 pt-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-400" />
                    Data Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                      <h4 className="font-semibold text-white mb-2">Backup Data</h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Download a copy of your mood history and custom tags.
                      </p>
                      <button
                        onClick={handleExport}
                        className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export JSON
                      </button>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                      <h4 className="font-semibold text-white mb-2">Restore Data</h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Import a previously exported backup file.
                      </p>
                      <label className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Import JSON
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

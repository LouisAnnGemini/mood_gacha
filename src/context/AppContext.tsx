import React, { createContext, useContext, ReactNode } from 'react';
import { Mood, MoodRecord, DEFAULT_MOODS } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  moods: Mood[];
  records: MoodRecord[];
  addMood: (mood: Mood) => void;
  updateMood: (mood: Mood) => void;
  deleteMood: (id: string) => void;
  addRecord: (record: MoodRecord) => void;
  updateRecord: (record: MoodRecord) => void;
  deleteRecord: (id: string) => void;
  importData: (data: { moods: Mood[]; records: MoodRecord[] }) => void;
  exportData: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [moods, setMoods] = useLocalStorage<Mood[]>('mood-gacha-moods', DEFAULT_MOODS);
  const [records, setRecords] = useLocalStorage<MoodRecord[]>('mood-gacha-records', []);

  const addMood = (mood: Mood) => {
    setMoods((prev) => [...prev, mood]);
  };

  const updateMood = (updatedMood: Mood) => {
    setMoods((prev) => prev.map((m) => (m.id === updatedMood.id ? updatedMood : m)));
  };

  const deleteMood = (id: string) => {
    setMoods((prev) => prev.filter((m) => m.id !== id));
  };

  const addRecord = (record: MoodRecord) => {
    setRecords((prev) => [record, ...prev]);
  };

  const updateRecord = (updatedRecord: MoodRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const importData = (data: { moods: Mood[]; records: MoodRecord[] }) => {
    if (data.moods && Array.isArray(data.moods)) setMoods(data.moods);
    if (data.records && Array.isArray(data.records)) setRecords(data.records);
  };

  const exportData = () => {
    return JSON.stringify({ moods, records }, null, 2);
  };

  return (
    <AppContext.Provider
      value={{
        moods,
        records,
        addMood,
        updateMood,
        deleteMood,
        addRecord,
        updateRecord,
        deleteRecord,
        importData,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

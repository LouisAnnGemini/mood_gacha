import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mood, MoodRecord, MOOD_SYMBOLS } from '../types';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const CalendarView = () => {
  const { records, moods, addRecord } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Quick Add Form State
  const [selectedMoodId, setSelectedMoodId] = useState<string>('');
  const [note, setNote] = useState('');
  const [time, setTime] = useState('12:00');
  const [score, setScore] = useState(0);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getDayRecords = (date: Date) => {
    return records.filter((r) => isSameDay(parseISO(r.timestamp), date));
  };

  const handleQuickAdd = () => {
    if (!selectedDate || !selectedMoodId) return;

    const [hours, minutes] = time.split(':').map(Number);
    const timestamp = new Date(selectedDate);
    timestamp.setHours(hours, minutes);

    const newRecord: MoodRecord = {
      id: crypto.randomUUID(),
      moodId: selectedMoodId,
      note,
      timestamp: timestamp.toISOString(),
      score: Number(score),
    };

    addRecord(newRecord);
    setIsQuickAddOpen(false);
    setNote('');
    setSelectedMoodId('');
    setScore(0);
  };

  const handleMoodSelect = (moodId: string) => {
    setSelectedMoodId(moodId);
    const mood = moods.find(m => m.id === moodId);
    if (mood) {
        if (mood.category === 'neutral') {
            setScore(0);
        } else {
            setScore(5);
        }
    }
  };

  const openQuickAdd = (date: Date) => {
    setSelectedDate(date);
    setIsQuickAddOpen(true);
    // Set time to current time if today, else 12:00
    if (isSameDay(date, new Date())) {
      setTime(format(new Date(), 'HH:mm'));
    } else {
      setTime('12:00');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
      {/* Calendar Section */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-slate-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for start of month */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {daysInMonth.map((date) => {
            const dayRecords = getDayRecords(date);
            const isToday = isSameDay(date, new Date());
            const hasRecords = dayRecords.length > 0;

            // Determine dominant mood color for the day
            let bgClass = 'bg-slate-800 hover:bg-slate-700';
            if (hasRecords) {
              const lastRecord = dayRecords[0]; // Most recent
              const mood = moods.find((m) => m.id === lastRecord.moodId);
              if (mood?.category === 'positive') bgClass = 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100';
              if (mood?.category === 'neutral') bgClass = 'bg-slate-500/20 border-slate-500/50 text-slate-100';
              if (mood?.category === 'negative') bgClass = 'bg-indigo-500/20 border-indigo-500/50 text-indigo-100';
            }

            return (
              <button
                key={date.toISOString()}
                onClick={() => openQuickAdd(date)}
                className={cn(
                  'aspect-square rounded-xl border border-transparent transition-all relative flex flex-col items-center justify-center gap-1 group',
                  bgClass,
                  isToday && 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900'
                )}
              >
                <span className={cn('text-sm font-medium', !hasRecords && 'text-slate-400')}>
                  {format(date, 'd')}
                </span>
                {hasRecords && (
                  <div className="flex -space-x-1">
                    {dayRecords.slice(0, 3).map((r, i) => {
                      const m = moods.find((mood) => mood.id === r.moodId);
                      return (
                        <div
                          key={r.id}
                          className="w-2 h-2 rounded-full ring-1 ring-slate-900"
                          style={{
                            backgroundColor:
                              m?.category === 'positive'
                                ? '#fbbf24'
                                : m?.category === 'negative'
                                ? '#6366f1'
                                : '#94a3b8',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
                
                {/* Hover Add Icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity backdrop-blur-[1px]">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Panel (Desktop: Side, Mobile: Modal) */}
      <AnimatePresence>
        {isQuickAddOpen && selectedDate && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-80 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl h-fit sticky top-24"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                Add Record
                <span className="block text-sm font-normal text-slate-400 mt-1">
                  {format(selectedDate, 'MMMM d, yyyy')}
                </span>
              </h3>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Mood</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {moods.map((mood) => (
                    <button
                      key={mood.id}
                      onClick={() => handleMoodSelect(mood.id)}
                      className={cn(
                        'p-2 rounded-lg text-sm border transition-all flex flex-col items-center gap-1',
                        selectedMoodId === mood.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      )}
                    >
                      <span className="text-xl font-black leading-none">
                        {MOOD_SYMBOLS[mood.category]}
                      </span>
                      <span className="truncate w-full text-center text-xs">{mood.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Intensity / Score
                  {selectedMoodId 
                    ? (moods.find(m => m.id === selectedMoodId)?.category === 'neutral' ? ' (-10 to 10)' : ' (1 to 10)')
                    : ' (Select mood first)'}
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  disabled={!selectedMoodId}
                  min={selectedMoodId && moods.find(m => m.id === selectedMoodId)?.category === 'neutral' ? -10 : 1}
                  max={10}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Optional note..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                />
              </div>

              <button
                onClick={handleQuickAdd}
                disabled={!selectedMoodId}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save Record
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

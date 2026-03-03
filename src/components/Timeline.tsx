import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from './Card';
import { format, startOfMonth, endOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Edit2, Trash2, Calendar, MessageSquare, Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MoodRecord, Mood, MOOD_SYMBOLS, MoodCategory } from '../types';

export const Timeline = () => {
  const { records, moods, deleteRecord, updateRecord } = useApp();
  const [editingRecord, setEditingRecord] = useState<MoodRecord | null>(null);

  // Filter States
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<MoodCategory[]>([]);
  const [selectedMoodId, setSelectedMoodId] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getMoodById = (id: string) => moods.find((m) => m.id === id);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteRecord(id);
    }
  };

  const handleUpdate = (record: MoodRecord) => {
    updateRecord(record);
    setEditingRecord(null);
  };

  const toggleCategory = (category: MoodCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const recordDate = parseISO(record.timestamp);
      const mood = getMoodById(record.moodId);

      // Date Range Filter
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      if (!isWithinInterval(recordDate, { start, end })) return false;

      // Search Query Filter (Note)
      if (searchQuery && !record.note.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category Filter
      if (selectedCategories.length > 0 && mood && !selectedCategories.includes(mood.category)) {
        return false;
      }

      // Specific Mood Filter
      if (selectedMoodId && record.moodId !== selectedMoodId) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [records, startDate, endDate, searchQuery, selectedCategories, selectedMoodId, moods]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-400" />
          Timeline
        </h2>
        
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            isFilterOpen
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-4">
              {/* Date Range & Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Search Notes</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mood Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-medium">Filter by Category</label>
                  <div className="flex gap-2">
                    {(['positive', 'neutral', 'negative'] as MoodCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all flex items-center justify-center gap-2 ${
                          selectedCategories.includes(cat)
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-lg leading-none">{MOOD_SYMBOLS[cat]}</span>
                        <span className="capitalize">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-500 font-medium">Filter by Specific Mood</label>
                  <select
                    value={selectedMoodId}
                    onChange={(e) => setSelectedMoodId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">All Moods</option>
                    {moods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {MOOD_SYMBOLS[m.category]} {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                 <button
                    onClick={() => {
                        setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
                        setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
                        setSearchQuery('');
                        setSelectedCategories([]);
                        setSelectedMoodId('');
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                 >
                    <X className="w-3 h-3" /> Clear Filters
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
        <AnimatePresence>
          {filteredRecords.map((record, index) => {
            const mood = getMoodById(record.moodId);
            if (!mood) return null;

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
              >
                {/* Timeline Dot */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 group-[.is-active]:bg-indigo-500 text-slate-500 group-[.is-active]:text-indigo-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 translate-x-1/2 md:translate-x-0 z-10">
                  <div className="w-3 h-3 bg-current rounded-full" />
                </div>

                {/* Card Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg hover:border-indigo-500/50 transition-colors">
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <Card mood={mood} size="sm" isRevealed={true} className="shadow-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <time className="text-xs font-medium text-slate-400">
                          {format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm')}
                        </time>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingRecord(record)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-1">{mood.name}</h3>
                      
                      {record.note && (
                        <div className="flex gap-2 items-start text-slate-300 text-sm bg-slate-900/50 p-2 rounded-lg">
                          <MessageSquare className="w-3 h-3 mt-1 shrink-0 text-slate-500" />
                          <p className="line-clamp-3">{record.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>{records.length === 0 ? "No memories recorded yet. Summon your first mood!" : "No memories found matching your filters."}</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingRecord && (
          <EditRecordModal
            record={editingRecord}
            moods={moods}
            onClose={() => setEditingRecord(null)}
            onSave={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EditRecordModal = ({
  record,
  moods,
  onClose,
  onSave,
}: {
  record: MoodRecord;
  moods: Mood[];
  onClose: () => void;
  onSave: (r: MoodRecord) => void;
}) => {
  const [note, setNote] = useState(record.note);
  const [moodId, setMoodId] = useState(record.moodId);
  const [timestamp, setTimestamp] = useState(record.timestamp);
  const [score, setScore] = useState(record.score || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...record, note, moodId, timestamp, score: Number(score) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700 shadow-2xl"
      >
        <h3 className="text-xl font-bold text-white mb-4">Edit Memory</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Mood</label>
            <select
              value={moodId}
              onChange={(e) => setMoodId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {moods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {MOOD_SYMBOLS[m.category]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Intensity / Score
              {moods.find(m => m.id === moodId)?.category === 'neutral' ? ' (-10 to 10)' : ' (1 to 10)'}
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              min={moods.find(m => m.id === moodId)?.category === 'neutral' ? -10 : 1}
              max={10}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Time</label>
            <input
              type="datetime-local"
              value={format(new Date(timestamp), "yyyy-MM-dd'T'HH:mm")}
              onChange={(e) => setTimestamp(new Date(e.target.value).toISOString())}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

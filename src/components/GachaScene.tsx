import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Card } from './Card';
import { Mood, MoodRecord, MoodCategory } from '../types';
import { Sparkles, RefreshCw, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export const GachaScene = () => {
  const { moods, addRecord } = useApp();
  const [gameState, setGameState] = useState<'idle' | 'summoning' | 'revealed' | 'selecting'>('idle');
  const [drawnMoods, setDrawnMoods] = useState<Mood[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [score, setScore] = useState(0);

  const drawMoods = () => {
    if (moods.length === 0) return;
    
    // Group moods by category
    const positiveMoods = moods.filter(m => m.category === 'positive');
    const neutralMoods = moods.filter(m => m.category === 'neutral');
    const negativeMoods = moods.filter(m => m.category === 'negative');

    const selected: Mood[] = [];

    // Try to pick one from each category
    if (positiveMoods.length > 0) {
      selected.push(positiveMoods[Math.floor(Math.random() * positiveMoods.length)]);
    }
    if (neutralMoods.length > 0) {
      selected.push(neutralMoods[Math.floor(Math.random() * neutralMoods.length)]);
    }
    if (negativeMoods.length > 0) {
      selected.push(negativeMoods[Math.floor(Math.random() * negativeMoods.length)]);
    }

    // If we don't have 3 moods (e.g. some categories are empty), fill with random unique moods
    if (selected.length < 3) {
      const remaining = moods.filter(m => !selected.find(s => s.id === m.id));
      const shuffledRemaining = [...remaining].sort(() => 0.5 - Math.random());
      selected.push(...shuffledRemaining.slice(0, 3 - selected.length));
    }

    // Sort the final selection: Positive -> Neutral -> Negative
    const categoryOrder: { [key in MoodCategory]: number } = {
      positive: 0,
      neutral: 1,
      negative: 2,
    };
    
    const finalSelection = selected.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);
    setDrawnMoods(finalSelection);
  };

  const handleSummon = () => {
    drawMoods();
    setGameState('revealed');
  };

  const handleSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setGameState('selecting');
    // Set default score based on category
    if (mood.category === 'neutral') {
      setScore(0);
    } else {
      setScore(5); // Default intensity for positive/negative
    }
  };

  const handleConfirm = () => {
    if (!selectedMood) return;

    const newRecord: MoodRecord = {
      id: crypto.randomUUID(),
      moodId: selectedMood.id,
      note,
      timestamp: new Date().toISOString(),
      score: Number(score),
    };

    addRecord(newRecord);
    resetGame();
  };

  const handleReroll = () => {
    setSelectedMood(null);
    setNote('');
    setScore(0);
    drawMoods();
    setGameState('revealed');
  };

  const resetGame = () => {
    setGameState('idle');
    setDrawnMoods([]);
    setSelectedMood(null);
    setNote('');
    setScore(0);
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            initial={{
              x: Math.random() * 1000,
              y: Math.random() * 1000,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -100],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
            }}
          />
        ))}
      </div>

      {/* Idle State */}
      {gameState === 'idle' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="z-10 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-8 tracking-wider drop-shadow-lg">
            What is your mood today?
          </h2>
          
          {moods.length > 0 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSummon}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full text-white font-bold text-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Summon Mood
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </motion.button>
          ) : (
            <div className="text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <p className="mb-2">No mood cards found in the deck.</p>
              <p className="text-sm">Please go to Settings to create new moods.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Summoning/Revealed State */}
      {(gameState === 'summoning' || gameState === 'revealed') && (
        <div className="z-10 flex flex-col items-center gap-8">
          <div className="flex gap-4 md:gap-8 items-center justify-center perspective-1000">
            {drawnMoods.map((mood, index) => (
              <motion.div
                key={mood.id}
                initial={{
                  opacity: 0,
                  y: 50,
                  scale: 0.8,
                  rotateZ: Math.random() * 10 - 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateZ: 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 200,
                  delay: index * 0.1,
                }}
              >
                <Card
                  mood={mood}
                  isRevealed={true}
                  onClick={() => handleSelect(mood)}
                  className="hover:z-20"
                />
              </motion.div>
            ))}
          </div>
          
          {gameState === 'revealed' && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleReroll}
              className="px-6 py-3 rounded-full bg-slate-800/80 text-white font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2 border border-slate-600 backdrop-blur-sm"
            >
              <RefreshCw className="w-5 h-5" />
              Reroll
            </motion.button>
          )}
        </div>
      )}

      {/* Selection Modal Overlay */}
      <AnimatePresence>
        {gameState === 'selecting' && selectedMood && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-600 shadow-2xl flex flex-col items-center gap-6"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Confirm Selection</h3>
                <p className="text-slate-400">Is this how you feel right now?</p>
              </div>

              <Card mood={selectedMood} isRevealed={true} size="md" className="shadow-none" />

              <div className="w-full space-y-2">
                <label className="text-sm text-slate-400 ml-1">
                  Intensity / Score 
                  {selectedMood.category === 'neutral' ? ' (-10 to 10)' : ' (1 to 10)'}
                </label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  min={selectedMood.category === 'neutral' ? -10 : 1}
                  max={10}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm text-slate-400 ml-1">Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Why do you feel this way?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Check className="w-5 h-5" />
                  Confirm Record
                </button>
              </div>
              
              <button 
                onClick={() => setGameState('revealed')}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

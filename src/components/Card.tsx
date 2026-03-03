import React from 'react';
import { motion } from 'motion/react';
import { Mood, MOOD_SYMBOLS } from '../types';
import { cn } from '../lib/utils';

interface CardProps {
  mood?: Mood;
  isRevealed?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
}

export const Card = ({
  mood,
  isRevealed = true,
  onClick,
  className,
  size = 'md',
  selected = false,
}: CardProps) => {
  const sizeClasses = {
    sm: 'w-24 h-36 text-xs',
    md: 'w-40 h-60 text-sm',
    lg: 'w-64 h-96 text-base',
  };

  const baseClasses =
    'relative rounded-xl shadow-xl cursor-pointer transform transition-all duration-300 preserve-3d';
  
  // Card Back Design (Cosmic/Magical)
  const cardBack = (
    <div className="absolute inset-0 w-full h-full bg-indigo-900 rounded-xl border-2 border-indigo-400 flex items-center justify-center overflow-hidden backface-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-200 via-indigo-900 to-black"></div>
      <div className="w-12 h-12 border-2 border-indigo-300 rounded-full flex items-center justify-center rotate-45">
        <div className="w-8 h-8 border border-indigo-300 rounded-sm"></div>
      </div>
    </div>
  );

  // Card Front Design
  const cardFront = mood ? (
    <div
      className={cn(
        'absolute inset-0 w-full h-full rounded-xl border-4 border-white/20 flex flex-col items-center justify-between p-4 overflow-hidden backface-hidden bg-gradient-to-br',
        mood.color,
        selected ? 'ring-4 ring-yellow-400 scale-105' : ''
      )}
    >
      {/* Flash Effect on Reveal */}
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 bg-white pointer-events-none z-20"
      />

      {/* Large Decorative Symbol */}
      <div className="absolute -right-4 -bottom-12 text-[180px] leading-none font-black text-white/10 select-none pointer-events-none rotate-12 z-0">
        {MOOD_SYMBOLS[mood.category]}
      </div>
      
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <h3 className="text-2xl font-bold text-white drop-shadow-md text-center">
          {mood.name}
        </h3>
      </div>

      <div className="relative z-10 w-full h-1/3 bg-black/10 rounded-lg backdrop-blur-sm flex items-center justify-center border border-white/10">
        <div className="text-white/80 text-center px-2">
           <span className="text-4xl font-black text-white/20">
             {MOOD_SYMBOLS[mood.category]}
           </span>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <motion.div
      className={cn(baseClasses, sizeClasses[size], className)}
      onClick={onClick}
      initial={false}
      animate={{ rotateY: isRevealed ? 0 : 180 }}
      transition={{ duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.05, y: -5 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
        {cardBack}
      </div>
      <div className="absolute inset-0 backface-hidden">
        {cardFront}
      </div>
    </motion.div>
  );
};

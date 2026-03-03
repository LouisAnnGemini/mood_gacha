export type MoodCategory = 'positive' | 'negative' | 'neutral';

export interface Mood {
  id: string;
  name: string;
  category: MoodCategory;
  color: string; // Hex code or tailwind class suffix
}

export interface MoodRecord {
  id: string;
  moodId: string;
  note: string;
  timestamp: string; // ISO string
  score: number;
}

export const MOOD_SYMBOLS: Record<MoodCategory, string> = {
  positive: '+',
  neutral: '·',
  negative: '-',
};

export const DEFAULT_MOODS: Mood[] = [
  { id: '1', name: '开心', category: 'positive', color: 'from-yellow-400 to-orange-500' },
  { id: '2', name: '兴奋', category: 'positive', color: 'from-red-400 to-pink-500' },
  { id: '3', name: '感激', category: 'positive', color: 'from-green-400 to-emerald-500' },
  { id: '4', name: '自信', category: 'positive', color: 'from-blue-400 to-cyan-500' },
  { id: '5', name: '平静', category: 'neutral', color: 'from-teal-400 to-blue-500' },
  { id: '6', name: '疲惫', category: 'neutral', color: 'from-gray-400 to-slate-500' },
  { id: '7', name: '无聊', category: 'neutral', color: 'from-indigo-300 to-purple-400' },
  { id: '8', name: '难过', category: 'negative', color: 'from-blue-600 to-indigo-800' },
  { id: '9', name: '焦虑', category: 'negative', color: 'from-orange-600 to-red-700' },
  { id: '10', name: '生气', category: 'negative', color: 'from-red-600 to-rose-900' },
];

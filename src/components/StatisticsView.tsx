import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MoodRecord, MoodCategory } from '../types';
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Calendar as CalendarIcon, BarChart2, Clock } from 'lucide-react';
import { motion } from 'motion/react';

type TimeRange = 'day' | 'week' | 'month' | 'year';

export const StatisticsView = () => {
  const { records, moods } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getMoodScore = (category: MoodCategory) => {
    switch (category) {
      case 'positive':
        return 10;
      case 'neutral':
        return 0;
      case 'negative':
        return -10;
      default:
        return 0;
    }
  };

  const chartData = useMemo(() => {
    let start: Date, end: Date;

    switch (timeRange) {
      case 'day':
        start = startOfDay(selectedDate);
        end = endOfDay(selectedDate);
        break;
      case 'week':
        start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
        break;
      case 'year':
        start = startOfYear(selectedDate);
        end = endOfYear(selectedDate);
        break;
    }

    const filteredRecords = records.filter((r) => {
      const date = parseISO(r.timestamp);
      return date >= start && date <= end;
    });

    // Sort by time
    filteredRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return filteredRecords.map((r) => {
      const mood = moods.find((m) => m.id === r.moodId);
      let score = r.score || 0;
      
      if (mood) {
        if (mood.category === 'negative') {
            score = -Math.abs(score);
        } else if (mood.category === 'positive') {
            score = Math.abs(score);
        }
        // Neutral keeps the sign
      }

      return {
        timestamp: r.timestamp,
        score: score,
        name: mood?.name || 'Unknown',
        note: r.note,
      };
    });
  }, [records, moods, timeRange, selectedDate]);

  const formatXAxis = (tickItem: string) => {
    const date = parseISO(tickItem);
    switch (timeRange) {
      case 'day':
        return format(date, 'HH:mm');
      case 'week':
        return format(date, 'EEE');
      case 'month':
        return format(date, 'dd');
      case 'year':
        return format(date, 'MMM');
      default:
        return '';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-indigo-400" />
          Mood Statistics
        </h2>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              domain={[-15, 15]}
              ticks={[-10, 0, 10]}
              tickFormatter={(val) => (val === 10 ? '+' : val === -10 ? '-' : '·')}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 18, fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
              labelFormatter={(label) => format(parseISO(label as string), 'PPpp')}
            />
            <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#818cf8"
              strokeWidth={3}
              dot={{ r: 4, fill: '#818cf8', strokeWidth: 2, stroke: '#1e293b' }}
              activeDot={{ r: 6, fill: '#c7d2fe' }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400">
            <span className="text-2xl font-black">+</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Positive</p>
            <p className="text-2xl font-bold text-white">
              {chartData.filter((d) => d.score > 0).length}
            </p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-slate-500/20 rounded-lg text-slate-400">
            <span className="text-2xl font-black">·</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Neutral</p>
            <p className="text-2xl font-bold text-white">
              {chartData.filter((d) => d.score === 0).length}
            </p>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
            <span className="text-2xl font-black">-</span>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Negative</p>
            <p className="text-2xl font-bold text-white">
              {chartData.filter((d) => d.score < 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

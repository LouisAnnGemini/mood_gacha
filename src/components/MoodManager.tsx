import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mood, MoodCategory, MOOD_SYMBOLS } from '../types';
import { Plus, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';

const SortableMoodItem: React.FC<{
  mood: Mood;
  onDelete: (id: string) => void;
}> = ({
  mood,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mood.id, data: { type: 'Mood', mood } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 p-3 bg-slate-800/50 border-2 border-indigo-500/50 rounded-xl opacity-50"
      >
        <div className="p-2 rounded-lg bg-slate-800 text-slate-500 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${mood.color}`} />
        <span className="font-medium text-slate-300">{mood.name}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl group hover:border-slate-700 transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="p-2 rounded-lg hover:bg-slate-800 text-slate-600 hover:text-slate-400 cursor-grab touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${mood.color} shadow-sm`} />
      <span className="font-medium text-slate-300 flex-1">{mood.name}</span>
      <button
        onClick={() => onDelete(mood.id)}
        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const CategoryColumn: React.FC<{
  category: MoodCategory;
  moods: Mood[];
  onDelete: (id: string) => void;
}> = ({
  category,
  moods,
  onDelete,
}) => {
  const { setNodeRef } = useSortable({
    id: category,
    data: { type: 'Category', category },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-slate-400 uppercase text-sm tracking-wider flex items-center gap-2">
          <span className="text-lg">{MOOD_SYMBOLS[category]}</span>
          {category}
        </h3>
        <span className="text-xs font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
          {moods.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-3 min-h-[150px] space-y-2"
      >
        <SortableContext
          items={moods.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          {moods.map((mood) => (
            <SortableMoodItem key={mood.id} mood={mood} onDelete={onDelete} />
          ))}
        </SortableContext>
        {moods.length === 0 && (
          <div className="h-full flex items-center justify-center text-slate-600 text-sm italic py-8">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
};

export const MoodManager = () => {
  const { moods, addMood, deleteMood, updateMood } = useApp();
  const [newMoodName, setNewMoodName] = useState('');
  const [newMoodCategory, setNewMoodCategory] = useState<MoodCategory>('neutral');
  const [activeDragItem, setActiveDragItem] = useState<Mood | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddMood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMoodName.trim()) return;

    const colors = {
      positive: 'from-orange-400 to-pink-500',
      neutral: 'from-slate-400 to-slate-500',
      negative: 'from-indigo-500 to-purple-600',
    };

    addMood({
      id: crypto.randomUUID(),
      name: newMoodName,
      category: newMoodCategory,
      color: colors[newMoodCategory],
    });
    setNewMoodName('');
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Mood') {
      setActiveDragItem(event.active.data.current.mood);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveMood = active.data.current?.type === 'Mood';
    const isOverMood = over.data.current?.type === 'Mood';
    const isOverCategory = over.data.current?.type === 'Category';

    if (!isActiveMood) return;

    // Dragging a mood over another mood
    if (isActiveMood && isOverMood) {
      const activeMood = moods.find((m) => m.id === activeId);
      const overMood = moods.find((m) => m.id === overId);

      if (activeMood && overMood && activeMood.category !== overMood.category) {
        // Optimistic update for category change during drag
        updateMood({ ...activeMood, category: overMood.category });
      }
    }

    // Dragging a mood over a category container
    if (isActiveMood && isOverCategory) {
      const activeMood = moods.find((m) => m.id === activeId);
      const overCategory = over.data.current?.category as MoodCategory;

      if (activeMood && activeMood.category !== overCategory) {
        updateMood({ ...activeMood, category: overCategory });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragItem(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-white mb-6">Mood Settings</h2>

      {/* Add New Mood Form */}
      <form onSubmit={handleAddMood} className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 flex gap-4 items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-500">Mood Name</label>
          <input
            type="text"
            value={newMoodName}
            onChange={(e) => setNewMoodName(e.target.value)}
            placeholder="e.g., Excited"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="w-40 space-y-1">
          <label className="text-xs font-medium text-slate-500">Category</label>
          <select
            value={newMoodCategory}
            onChange={(e) => setNewMoodCategory(e.target.value as MoodCategory)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="positive">Positive (+)</option>
            <option value="neutral">Neutral (·)</option>
            <option value="negative">Negative (-)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={!newMoodName.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Drag and Drop Area */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['positive', 'neutral', 'negative'] as MoodCategory[]).map((category) => (
            <CategoryColumn
              key={category}
              category={category}
              moods={moods.filter((m) => m.category === category)}
              onDelete={deleteMood}
            />
          ))}
        </div>

        {createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.5',
                  },
                },
              }),
            }}
          >
            {activeDragItem && (
              <div className="flex items-center gap-3 p-3 bg-slate-800 border border-indigo-500 rounded-xl shadow-2xl cursor-grabbing w-[300px]">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-500">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${activeDragItem.color}`} />
                <span className="font-medium text-slate-300">{activeDragItem.name}</span>
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

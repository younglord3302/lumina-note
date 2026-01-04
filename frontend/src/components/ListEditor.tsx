import React, { useState, useEffect } from 'react';
import type { Note } from '../types';

interface ListEditorProps {
  note: Note;
  onChange: (changes: Partial<Note>) => void;
}

export const ListEditor: React.FC<ListEditorProps> = ({ note, onChange }) => {
  const [items, setItems] = useState<{ id: string; text: string; checked: boolean }[]>(
    note.checklistItems || []
  );
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    setItems(note.checklistItems || []);
  }, [note.id, note.checklistItems]);

  const updateItems = (newItems: typeof items) => {
    setItems(newItems);
    onChange({ checklistItems: newItems });
  };

  const handleAddItem = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItemText.trim()) {
      const newItem = {
        id: Date.now().toString(),
        text: newItemText.trim(),
        checked: false,
      };
      updateItems([...items, newItem]);
      setNewItemText('');
    }
  };

  const toggleItem = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    updateItems(newItems);
  };

  const deleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    updateItems(newItems);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleAddItem}
          placeholder="Add a new item (Press Enter)"
          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder-slate-400"
        />
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
             <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>No items in list</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                item.checked 
                  ? 'bg-slate-50 border-slate-100' 
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border transition-colors duration-200 flex items-center justify-center ${
                  item.checked
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-slate-300 hover:border-blue-400 text-transparent'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <span className={`flex-1 font-medium transition-all duration-200 ${
                item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}>
                {item.text}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

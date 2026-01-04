import React, { useState } from 'react';
import type { Note } from '../types';

interface NotesListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
  filter: 'all' | 'drafts' | 'published';
  onFilterChange: (filter: 'all' | 'drafts' | 'published') => void;
  user: { username: string } | null;
  onLogout: () => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  filter,
  onFilterChange,
  user,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes
    .filter(note => {
      // Exclude deleted notes
      if (note.deletedAt) return false;
      if (filter === 'drafts' && !note.isDraft) return false;
      if (filter === 'published' && note.isDraft) return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by pinned status first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by update date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 border-r border-slate-200 flex flex-col h-full bg-white/80 backdrop-blur-sm shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <img src="/logo.png" alt="Lumina" className="w-7 h-7 object-contain" />
            Lumina
          </h1>
          <button
            onClick={onNewNote}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {(['all', 'drafts', 'published'] as const).map(f => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 text-xs rounded-lg capitalize font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-auto bg-gradient-to-b from-white to-slate-50/50">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-slate-500 text-lg font-medium mb-2">No notes found</p>
            <p className="text-slate-400 text-sm">Create your first note to get started!</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm group relative ${
                selectedNoteId === note.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-sm'
                  : 'hover:translate-x-1'
              }`}
            >
              {note.isPinned && (
                <div className="absolute top-2 right-2 text-blue-500 transform rotate-45">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zM4.5 19v2h15v-2h-15z" />
                    <path fill="none" d="M0 0h24v24H0z" />
                  </svg>
                </div>
              )}
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className={`font-semibold truncate transition-colors duration-200 ${
                    selectedNoteId === note.id ? 'text-blue-900' : 'text-slate-800 group-hover:text-slate-900'
                  }`}>
                    {note.title || 'Untitled'}
                  </h3>
                  <p className={`text-sm mt-1 line-clamp-2 transition-colors duration-200 ${
                    selectedNoteId === note.id ? 'text-slate-600' : 'text-slate-500 group-hover:text-slate-600'
                  }`}>
                    {note.content.slice(0, 100)}...
                  </p>
                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded-md border border-slate-200">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className={`text-xs transition-colors duration-200 ${
                  selectedNoteId === note.id ? 'text-blue-600 font-medium' : 'text-slate-400 group-hover:text-slate-500'
                }`}>
                  {formatDate(note.updatedAt)}
                </div>
                {note.isDraft && (
                  <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full border border-yellow-200 font-medium shadow-sm">
                    Draft
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* User Actions - Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700">{user?.username || 'Guest'}</span>
              <span className="text-[10px] text-slate-500">Free Plan</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

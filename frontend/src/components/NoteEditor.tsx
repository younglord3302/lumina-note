import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ListEditor } from './ListEditor';
import type { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
  onChange: (note: Partial<Note>) => void;
  syncStatus: { isOnline: boolean; syncInProgress: boolean };
  onManualSync: () => void;
  onPublish: () => void;
  onDelete: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onChange, syncStatus, onManualSync, onPublish, onDelete }) => {
  // Initialize state based on note prop, but only update when note actually changes
  const [title, setTitle] = useState(() => note?.title || '');
  const [content, setContent] = useState(() => note?.content || '');
  const [tagInput, setTagInput] = useState('');

  // Update state when note prop changes
  React.useLayoutEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setTagInput('');
  }, [note?.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onChange({ title: newTitle });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange({ content: newContent });
  };
  
  const handleQuillChange = (value: string) => {
    setContent(value);
    onChange({ content: value });
  };

  const handleSave = () => {
    onSave({ title, content });
  };
  
  const togglePin = () => {
    onChange({ isPinned: !note?.isPinned });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTag = tagInput.trim();
      const currentTags = note?.tags || [];
      if (!currentTags.includes(newTag)) {
        onChange({ tags: [...currentTags, newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = note?.tags || [];
    onChange({ tags: currentTags.filter(tag => tag !== tagToRemove) });
  };
  
  const handleEditorTypeChange = (type: 'markdown' | 'rich_text' | 'list') => {
    onChange({ editorType: type });
  };

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center max-w-md">
          <svg className="w-24 h-24 text-slate-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h2 className="text-3xl font-bold text-slate-700 mb-3">No note selected</h2>
          <p className="text-slate-500 text-lg mb-6">Select a note from the sidebar or create a new one to get started.</p>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-600">💡 Tip: Use the "New" button to create your first note!</p>
          </div>
        </div>
      </div>
    );
  }

  const editorType = note.editorType || 'markdown';

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-6 bg-gradient-to-r from-slate-50 to-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3 flex-1">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Note title..."
              className="text-2xl font-bold border-none outline-none bg-transparent flex-1 text-slate-800 placeholder-slate-400 focus:placeholder-slate-300"
            />
            <button 
              onClick={togglePin}
              className={`p-1.5 rounded-full transition-colors ${note.isPinned ? 'text-blue-500 bg-blue-50' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50'}`}
              title={note.isPinned ? "Unpin note" : "Pin note"}
            >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zM4.5 19v2h15v-2h-15z" />
                 <path fill="none" d="M0 0h24v24H0z" />
               </svg>
            </button>
            {note.isDraft && (
              <span className="px-3 py-1 text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full border border-yellow-200 font-medium shadow-sm">
                Draft
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
             {/* Editor Type Selector */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => handleEditorTypeChange('markdown')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  editorType === 'markdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Markdown
              </button>
              <button
                onClick={() => handleEditorTypeChange('list')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  editorType === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                List
              </button>
              <button
                onClick={() => handleEditorTypeChange('rich_text')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  editorType === 'rich_text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Rich Text (Quill)"
              >
                Rich Text
              </button>
            </div>
            
            {/* Sync Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${syncStatus.isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></span>
                <span className="text-sm font-medium text-slate-600">
                  {syncStatus.syncInProgress ? 'Syncing...' : syncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <button
                onClick={onManualSync}
                disabled={syncStatus.syncInProgress}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Manual sync"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8 8 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onPublish}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {note.isDraft ? 'Publish' : 'Make Draft'}
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>
        
        {/* Tags functionality */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-slate-500">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tags:
          </div>
          {note.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-md border border-slate-200 flex items-center gap-1">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tag (Enter)"
            className="px-2 py-1 text-xs bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-300 rounded-md outline-none transition-all placeholder-slate-400"
          />
        </div>
      </div>

      {/* Editor Content Based on Type */}
      <div className="flex flex-1 overflow-hidden">
        {editorType === 'list' && (
           <div className="flex-1 bg-white">
             <ListEditor note={note} onChange={onChange} />
           </div>
        )}

        {editorType === 'rich_text' && (
          <div className="flex-1 flex flex-col bg-white p-4">
             {/* @ts-ignore - ReactQuill types issue with React 18+ */}
             <ReactQuill value={content} onChange={handleQuillChange} className="h-full flex flex-col" theme="snow" />
          </div>
        )}

        {editorType === 'markdown' && (
          <>
            {/* Editor */}
            <div className="flex-1 border-r border-slate-200 bg-gradient-to-br from-slate-50/50 to-white">
              <div className="h-full flex flex-col">
                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Markdown Editor
                  </h3>
                </div>
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Write your note in Markdown...&#10;&#10;**Bold text**&#10;*Italic text*&#10;`code`&#10;&#10;## Headers&#10;&#10;- Lists&#10;1. Numbered lists&#10;&#10;[Links](url)&#10;&#10;> Blockquotes"
                  className="flex-1 w-full p-6 border-none outline-none resize-none font-mono text-sm leading-relaxed text-slate-800 placeholder-slate-400 focus:bg-white/50 transition-colors duration-200"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100/50">
              <div className="h-full flex flex-col">
                <div className="px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Live Preview
                  </h3>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                  <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-slate-300 prose-blockquote:text-slate-600">
                    {content ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <div className="text-center text-slate-400 py-12">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <p className="text-lg font-medium">Preview will appear here</p>
                        <p className="text-sm">Start typing in the editor to see your markdown rendered</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

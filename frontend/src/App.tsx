import React, { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useLocalStorageNotes } from './hooks/useLocalStorageNotes';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { syncService } from './services/sync';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage, LoginPage, RegisterPage } from './pages/LandingPage';
import type { Note } from './types';

function NotesApp() {
  const { notes, lastSync, setLastSync, updateNote, addNote, setNotes } = useLocalStorageNotes();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'drafts' | 'published'>('all');
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [syncStatus, setSyncStatus] = useState(syncService.getSyncStatus());
  const { logout, user } = useAuth();
  
  const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) || null : null;

  // Auto-save debounced
  useEffect(() => {
    if (selectedNoteId && Object.keys(currentNote).length > 0) {
      const timeoutId = setTimeout(() => {
        const updatedNote = {
          ...selectedNote,
          ...currentNote,
          syncStatus: 'dirty' as const,
        } as Note;
        updateNote(updatedNote);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [currentNote, selectedNoteId, selectedNote, updateNote]);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNoteId(note.id);
    setCurrentNote({});
  }, []);

  const handleNewNote = useCallback(() => {
    const newNote: Note = {
      id: uuidv4(),
      title: '',
      content: '',
      isDraft: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addNote(newNote);
    setSelectedNoteId(newNote.id);
    setCurrentNote({});
  }, [addNote]);

  const handleNoteChange = useCallback((changes: Partial<Note>) => {
    setCurrentNote(prev => ({ ...prev, ...changes }));
  }, []);

  const handleSave = useCallback((changes: Partial<Note>) => {
    if (selectedNoteId) {
      const updatedNote = {
        ...selectedNote,
        ...changes,
        syncStatus: 'dirty' as const,
      } as Note;
      updateNote(updatedNote);
      setCurrentNote({});
    }
  }, [selectedNoteId, selectedNote, updateNote]);

  // Initial sync on mount
  useEffect(() => {
    // Clear notes when user changes or on mount (to avoid showing previous user notes)
    // Note: In real app, consider improved syncing strategy
    syncService.manualSync(notes, lastSync, setNotes, setLastSync);
  }, []); 

  // Manual sync
  const handleManualSync = useCallback(() => {
    syncService.manualSync(notes, lastSync, setNotes, setLastSync);
    setSyncStatus(syncService.getSyncStatus());
  }, [notes, lastSync, setNotes, setLastSync]);

  // Update sync status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(syncService.getSyncStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePublish = useCallback(() => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        isDraft: !selectedNote.isDraft,
        syncStatus: 'dirty' as const,
        updatedAt: new Date().toISOString(),
      };
      updateNote(updatedNote);
    }
  }, [selectedNote, updateNote]);

  const handleDelete = useCallback(() => {
    if (selectedNote && window.confirm('Are you sure you want to delete this note?')) {
      const updatedNote = {
        ...selectedNote,
        deletedAt: new Date().toISOString(),
        syncStatus: 'dirty' as const,
      };
      updateNote(updatedNote);
      setSelectedNoteId(null);
    }
  }, [selectedNote, updateNote]);

  return (
    <div className="h-screen flex bg-slate-50 relative">
      <NotesList
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        filter={filter}
        onFilterChange={setFilter}
        user={user}
        onLogout={logout}
      />
      <NoteEditor
        note={selectedNote}
        onSave={handleSave}
        onChange={handleNoteChange}
        syncStatus={syncStatus}
        onManualSync={handleManualSync}
        onPublish={handlePublish}
        onDelete={handleDelete}
      />
    </div>
  );
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <NotesApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

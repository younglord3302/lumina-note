import { useState, useEffect } from 'react';
import type { Note } from '../types';

const NOTES_STORAGE_KEY = 'notesApp:notes';
const LAST_SYNC_KEY = 'notesApp:lastSync';

export const useLocalStorageNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      const storedLastSync = localStorage.getItem(LAST_SYNC_KEY);

      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes);
        setNotes(parsedNotes);
      }

      if (storedLastSync) {
        setLastSync(storedLastSync);
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
    }
  }, [notes]);

  // Save lastSync to localStorage
  useEffect(() => {
    if (lastSync) {
      try {
        localStorage.setItem(LAST_SYNC_KEY, lastSync);
      } catch (error) {
        console.error('Error saving lastSync to localStorage:', error);
      }
    }
  }, [lastSync]);

  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  const addNote = (newNote: Note) => {
    setNotes(prevNotes => [newNote, ...prevNotes]);
  };

  const deleteNote = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  return {
    notes,
    lastSync,
    setLastSync,
    updateNote,
    addNote,
    deleteNote,
    setNotes
  };
};

import { notesApi } from './api';
import type { Note } from '../types';

export class SyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      // Sync will be triggered from App component
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async syncNotes(localNotes: Note[], lastSync: string | null, onNotesUpdate: (notes: Note[]) => void, onLastSyncUpdate: (sync: string) => void) {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      // Push dirty notes to server
      const dirtyNotes = localNotes.filter(note => note.syncStatus === 'dirty');

      for (const note of dirtyNotes) {
        try {
          let serverNote: Note;

            const payload = {
              title: note.title,
              content: note.content,
              isDraft: note.isDraft,
              isPinned: note.isPinned,
              tags: note.tags,
              editorType: note.editorType,
              checklistItems: note.checklistItems,
              deletedAt: note.deletedAt,
              updatedAt: note.updatedAt,
              createdAt: note.createdAt,
            };

            if (note.serverId) {
              // Update existing
              serverNote = await notesApi.updateNote(note.serverId, payload);
            } else {
              // Create new
              serverNote = await notesApi.createNote(payload);
            }

          // Update local note with server data
          const updatedLocalNotes = localNotes.map(n =>
            n.id === note.id
              ? { ...n, serverId: serverNote._id || serverNote.id, syncStatus: 'synced' as const }
              : n
          );
          onNotesUpdate(updatedLocalNotes);
          localNotes = updatedLocalNotes; // Update reference
        } catch (error) {
          console.error('Error syncing note:', error);
          // Mark as error
          const updatedLocalNotes = localNotes.map(n =>
            n.id === note.id ? { ...n, syncStatus: 'error' as const } : n
          );
          onNotesUpdate(updatedLocalNotes);
          localNotes = updatedLocalNotes;
        }
      }

      // Pull latest from server
      const serverNotes = await notesApi.getNotes(lastSync || undefined);

      // Merge server notes into local
      let mergedNotes = [...localNotes];

      for (const serverNote of serverNotes) {
        const localNote = mergedNotes.find(n => n.serverId === serverNote.id || n.id === serverNote.id);

        if (!localNote) {
          // New note from server
          mergedNotes.push({
            id: serverNote.id, // Use server id as local id for simplicity, or generate new
            title: serverNote.title,
            content: serverNote.content,
            isDraft: serverNote.isDraft,
            createdAt: serverNote.createdAt,
            updatedAt: serverNote.updatedAt,
            serverId: serverNote.id,
            syncStatus: 'synced',
          });
        } else {
          // Existing note - conflict resolution
          const serverTime = new Date(serverNote.updatedAt).getTime();
          const localTime = new Date(localNote.updatedAt).getTime();

          if (serverTime > localTime && localNote.syncStatus !== 'dirty') {
            // Server is newer and local is not dirty - update local
            mergedNotes = mergedNotes.map(n =>
              n.id === localNote.id
                ? { ...n, ...serverNote, syncStatus: 'synced' as const }
                : n
            );
          }
          // If local is dirty, keep local (last local edit wins)
        }
      }

      onNotesUpdate(mergedNotes);
      onLastSyncUpdate(new Date().toISOString());

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async manualSync(localNotes: Note[], lastSync: string | null, onNotesUpdate: (notes: Note[]) => void, onLastSyncUpdate: (sync: string) => void) {
    await this.syncNotes(localNotes, lastSync, onNotesUpdate, onLastSyncUpdate);
  }

  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
    };
  }
}

export const syncService = new SyncService();

export interface Note {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  content: string;
  isDraft: boolean;
  isPinned?: boolean;
  tags?: string[];
  editorType?: 'markdown' | 'rich_text' | 'list';
  checklistItems?: { id: string; text: string; checked: boolean }[]; // For list editor
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  syncStatus?: 'synced' | 'dirty' | 'pending' | 'error';
  serverId?: string;
}

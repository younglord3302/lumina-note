import axios from 'axios';
import type { Note } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const notesApi = {
  // Get all notes, optionally since a timestamp
  getNotes: async (updatedSince?: string): Promise<Note[]> => {
    const params = updatedSince ? { updatedSince } : {};
    const response = await api.get('/notes', { params });
    return response.data;
  },

  // Create a new note
  createNote: async (note: Partial<Note>): Promise<Note> => {
    const response = await api.post('/notes', note);
    return response.data;
  },

  // Update a note
  updateNote: async (id: string, note: Partial<Note>): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  },

  // Delete a note
  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  register: async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  }
};

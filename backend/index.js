const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Models
const User = require('./models/User');
const Note = require('./models/Note');

const app = express();
const PORT = process.env.PORT || 5000;
const NOTES_FILE = path.join(__dirname, 'notes.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
let useMongoDB = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB Atlas');
      useMongoDB = true;
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGODB_URI found. Using local filesystem storage.');
}

// --- HELPER FUNCTIONS (File System) ---
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(filePath, '[]');
      return [];
    }
    return [];
  }
}

async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (useMongoDB) {
      // MongoDB
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ error: 'Username already exists' });

      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();
    } else {
      // File System
      const users = await readJsonFile(USERS_FILE);
      if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      const newUser = {
        id: Date.now().toString(),
        username,
        password: hashedPassword
      };
      users.push(newUser);
      await writeJsonFile(USERS_FILE, users);
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user;

    if (useMongoDB) {
      user = await User.findOne({ username });
    } else {
      const users = await readJsonFile(USERS_FILE);
      user = users.find(u => u.username === username);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const userId = useMongoDB ? user._id.toString() : user.id;
    const token = jwt.sign({ id: userId, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, user: { id: userId, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- NOTES ROUTES (PROTECTED) ---

app.get('/api/notes', authenticateToken, async (req, res) => {
  try {
    const { updatedSince } = req.query;
    let notes = [];

    if (useMongoDB) {
      const query = { userId: req.user.id, deletedAt: null };
      if (updatedSince) {
        query.updatedAt = { $gt: new Date(updatedSince) };
      }
      notes = await Note.find(query).sort({ updatedAt: -1 });
    } else {
      const allNotes = await readJsonFile(NOTES_FILE);
      notes = allNotes.filter(note => note.userId === req.user.id && !note.deletedAt);
      
      if (updatedSince) {
        const since = new Date(updatedSince);
        notes = notes.filter(note => new Date(note.updatedAt) > since);
      }
      notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  try {
    const noteData = {
      ...req.body,
      userId: req.user.id,
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: req.body.updatedAt || new Date().toISOString(),
    };

    if (useMongoDB) {
      const newNote = new Note(noteData);
      await newNote.save();
      res.status(201).json(newNote);
    } else {
      const notes = await readJsonFile(NOTES_FILE);
      const newNote = { ...noteData, _id: Date.now().toString() };
      notes.push(newNote);
      await writeJsonFile(NOTES_FILE, notes);
      res.status(201).json(newNote);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    
    if (req.body.isDraft === false) {
      updates.updatedAt = new Date().toISOString();
    }

    if (useMongoDB) {
      const updatedNote = await Note.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        updates,
        { new: true }
      );
      if (!updatedNote) return res.status(404).json({ error: 'Note not found' });
      res.json(updatedNote);
    } else {
      const notes = await readJsonFile(NOTES_FILE);
      const index = notes.findIndex(n => (n._id === id || n.id === id) && n.userId === req.user.id);
      
      if (index === -1) return res.status(404).json({ error: 'Note not found' });
      
      const updatedNote = { ...notes[index], ...updates };
      notes[index] = updatedNote;
      await writeJsonFile(NOTES_FILE, notes);
      res.json(updatedNote);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useMongoDB) {
      const updatedNote = await Note.findOneAndUpdate(
        { _id: id, userId: req.user.id },
        { deletedAt: new Date() },
        { new: true }
      );
      if (!updatedNote) return res.status(404).json({ error: 'Note not found' });
    } else {
      const notes = await readJsonFile(NOTES_FILE);
      const index = notes.findIndex(n => (n._id === id || n.id === id) && n.userId === req.user.id);
      
      if (index === -1) return res.status(404).json({ error: 'Note not found' });
      
      notes[index].deletedAt = new Date().toISOString();
      await writeJsonFile(NOTES_FILE, notes);
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    storage: useMongoDB ? 'MongoDB' : 'FileSystem',
    message: 'Notes App Backend is running' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

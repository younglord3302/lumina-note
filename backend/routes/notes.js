const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// GET /api/notes - Get all notes (optionally filter by updatedSince)
router.get('/', async (req, res) => {
  try {
    const { updatedSince } = req.query;
    let query = { deletedAt: null };

    if (updatedSince) {
      query.updatedAt = { $gt: new Date(updatedSince) };
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content, isDraft, createdAt, updatedAt } = req.body;
    const note = new Note({
      title,
      content,
      isDraft,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', async (req, res) => {
  try {
    const { title, content, isDraft } = req.body;
    const updateData = { title, content, isDraft };

    // If isDraft is false, it's published, so update timestamp
    if (isDraft === false) {
      updateData.updatedAt = new Date();
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/notes/:id - Soft delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

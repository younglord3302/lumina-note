const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  isDraft: { type: Boolean, default: true },
  isPinned: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  editorType: { type: String, default: 'markdown' }, // 'markdown', 'rich-text', 'list'
  checklistItems: [{
    id: String,
    text: String,
    isChecked: Boolean
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deletedAt: { type: Date, default: null },
  syncStatus: { type: String, default: 'synced' },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);

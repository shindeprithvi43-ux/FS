const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true
  },
  timing: {
    type: String,
    required: [true, 'Timing is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'],
    default: 'Mixed'
  },
  maxPlayers: {
    type: Number,
    default: 20
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Batch', batchSchema);

const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  batting: {
    runs: {
      type: Number,
      default: 0
    },
    balls: {
      type: Number,
      default: 0
    },
    strikeRate: {
      type: Number,
      default: 0
    }
  },
  bowling: {
    overs: {
      type: Number,
      default: 0
    },
    wickets: {
      type: Number,
      default: 0
    },
    economy: {
      type: Number,
      default: 0
    }
  },
  fielding: {
    catches: {
      type: Number,
      default: 0
    },
    runOuts: {
      type: Number,
      default: 0
    }
  },
  strengths: {
    type: String,
    default: ''
  },
  weaknesses: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionType: {
    type: String,
    enum: ['Practice', 'Match', 'Batting', 'Bowling', 'Fitness', 'Assessment'],
    default: 'Practice'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Performance', performanceSchema);

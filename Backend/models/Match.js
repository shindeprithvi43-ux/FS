const mongoose = require('mongoose');

const playerStatSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batting: {
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 }
  },
  bowling: {
    overs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    economy: { type: Number, default: 0 }
  },
  fielding: {
    catches: { type: Number, default: 0 },
    runOuts: { type: Number, default: 0 }
  }
}, { _id: false });

const matchSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Match title is required'],
    trim: true
  },
  opponent: {
    type: String,
    required: [true, 'Opponent is required'],
    trim: true
  },
  tournament: {
    type: String,
    default: '',
    trim: true
  },
  format: {
    type: String,
    default: '',
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  selectedPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  playerStats: [playerStatSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);

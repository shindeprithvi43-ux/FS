const express = require('express');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, async (req, res) => {
  try {
    const matches = await Match.find({ selectedPlayers: req.user._id })
      .populate('selectedPlayers', 'name loginId')
      .populate('playerStats.player', 'name loginId')
      .sort({ date: -1 });

    const data = matches.map((match) => {
      const playerStats = match.playerStats.find((entry) => String(entry.player?._id || entry.player) === String(req.user._id));
      return {
        ...match.toObject(),
        myStats: playerStats || null
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

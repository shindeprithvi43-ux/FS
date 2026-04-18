const express = require('express');
const Session = require('../models/Session');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, async (req, res) => {
  try {
    // Get user with populated batch since protect middleware doesn't populate it
    const user = await User.findById(req.user._id).select('batch');
    if (!user || !user.batch) {
      return res.json([]);
    }

    const sessions = await Session.find({ batch: user.batch })
      .populate('batch', 'name timing')
      .sort({ date: 1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

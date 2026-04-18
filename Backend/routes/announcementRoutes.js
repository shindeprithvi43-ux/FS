const express = require('express');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, async (req, res) => {
  try {
    // Get user with populated batch since protect middleware doesn't populate it
    const user = await User.findById(req.user._id).select('batch');
    const userBatch = user?.batch || null;

    const announcements = await Announcement.find({
      $or: [
        { batch: null },
        { batch: userBatch }
      ]
    })
      .populate('batch', 'name')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

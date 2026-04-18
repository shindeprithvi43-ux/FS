const express = require('express');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/attendance/my
// @desc    Get logged-in user's attendance history
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const { month, year } = req.query;

    let filter = { userId: req.user._id };

    // If month and year are provided, filter by them
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('markedBy', 'name');

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my/summary
// @desc    Get monthly attendance percentage
// @access  Private
router.get('/my/summary', protect, async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();

    // Get monthly summary for the year
    const monthlySummary = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const records = await Attendance.find({
        userId: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      });

      const total = records.length;
      const present = records.filter(r => r.status === 'Present').length;

      monthlySummary.push({
        month: month + 1,
        monthName: startDate.toLocaleString('default', { month: 'long' }),
        total,
        present,
        absent: total - present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      });
    }

    res.json({
      year,
      summary: monthlySummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

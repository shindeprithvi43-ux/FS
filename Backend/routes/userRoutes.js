const express = require('express');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Session = require('../models/Session');
const Announcement = require('../models/Announcement');
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get logged-in user's profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('batch');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/user/profile
// @desc    Update logged-in user's profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    // Use findOneAndUpdate to avoid triggering pre-save password hash hook
    const allowedUpdates = ['name', 'phone', 'guardianName', 'guardianContact'];
    const updatePayload = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updatePayload[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select('-password').populate('batch');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get dashboard summary data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('batch');

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const userBatchId = user.batch?._id || null;

    // Build session query — only if user has a batch, otherwise return empty
    const sessionQuery = userBatchId
      ? Session.find({ batch: userBatchId, date: { $gte: new Date() } }).sort({ date: 1 }).limit(3)
      : Promise.resolve([]);

    const [
      monthlyAttendance,
      latestPerformance,
      totalAttendance,
      upcomingSessions,
      announcements,
      matches
    ] = await Promise.all([
      Attendance.find({
        userId: req.user._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      Performance.findOne({ userId: req.user._id }).sort({ date: -1 }),
      Attendance.find({ userId: req.user._id }),
      sessionQuery,
      Announcement.find({
        $or: [{ batch: null }, { batch: userBatchId }]
      }).sort({ createdAt: -1 }).limit(4),
      Match.find({ selectedPlayers: req.user._id }).sort({ date: -1 }).limit(3)
    ]);

    const totalDays = monthlyAttendance.length;
    const presentDays = monthlyAttendance.filter((a) => a.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    const totalPresent = totalAttendance.filter((a) => a.status === 'Present').length;
    const overallAttendancePercentage = totalAttendance.length > 0
      ? Math.round((totalPresent / totalAttendance.length) * 100)
      : 0;

    res.json({
      user,
      attendance: {
        monthly: {
          total: totalDays,
          present: presentDays,
          absent: totalDays - presentDays,
          percentage: attendancePercentage
        },
        overall: {
          total: totalAttendance.length,
          present: totalPresent,
          percentage: overallAttendancePercentage
        }
      },
      latestPerformance,
      upcomingSessions,
      announcements,
      recentMatches: matches
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

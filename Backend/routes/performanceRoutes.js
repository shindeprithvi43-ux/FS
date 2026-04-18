const express = require('express');
const Performance = require('../models/Performance');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/performance/my
// @desc    Get all performance records for logged-in user
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const { limit } = req.query;

    let query = Performance.find({ userId: req.user._id })
      .sort({ date: 1 })
      .populate('recordedBy', 'name');

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const performances = await query;
    res.json(performances);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/performance/my/latest
// @desc    Get latest performance entry
// @access  Private
router.get('/my/latest', protect, async (req, res) => {
  try {
    const latestPerformance = await Performance.findOne({ userId: req.user._id })
      .sort({ date: -1 })
      .populate('recordedBy', 'name');

    if (!latestPerformance) {
      return res.status(404).json({ message: 'No performance records found' });
    }

    res.json(latestPerformance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/performance/my/stats
// @desc    Get aggregated performance statistics
// @access  Private
router.get('/my/stats', protect, async (req, res) => {
  try {
    const performances = await Performance.find({ userId: req.user._id }).sort({ date: 1 });

    if (performances.length === 0) {
      return res.json({
        totalSessions: 0,
        batting: { avgRuns: 0, avgBalls: 0, avgStrikeRate: 0, bestRuns: 0, bestStrikeRate: 0 },
        bowling: { avgOvers: 0, avgWickets: 0, avgEconomy: 0, bestWickets: 0, bestEconomy: 0 },
        fielding: { totalCatches: 0, totalRunOuts: 0 }
      });
    }

    const totalSessions = performances.length;

    const totalRuns = performances.reduce((sum, p) => sum + (p.batting?.runs || 0), 0);
    const totalBalls = performances.reduce((sum, p) => sum + (p.batting?.balls || 0), 0);
    const totalStrikeRate = performances.reduce((sum, p) => sum + (p.batting?.strikeRate || 0), 0);
    const bestRuns = Math.max(...performances.map(p => p.batting?.runs || 0));
    const bestStrikeRate = Math.max(...performances.map(p => p.batting?.strikeRate || 0));

    const totalOvers = performances.reduce((sum, p) => sum + (p.bowling?.overs || 0), 0);
    const totalWickets = performances.reduce((sum, p) => sum + (p.bowling?.wickets || 0), 0);
    const totalEconomy = performances.reduce((sum, p) => sum + (p.bowling?.economy || 0), 0);
    const bestWickets = Math.max(...performances.map(p => p.bowling?.wickets || 0));
    const bestEconomy = Math.min(...performances.filter(p => p.bowling?.economy > 0).map(p => p.bowling.economy));

    const totalCatches = performances.reduce((sum, p) => sum + (p.fielding?.catches || 0), 0);
    const totalRunOuts = performances.reduce((sum, p) => sum + (p.fielding?.runOuts || 0), 0);

    res.json({
      totalSessions,
      batting: {
        avgRuns: Math.round(totalRuns / totalSessions),
        avgBalls: Math.round(totalBalls / totalSessions),
        avgStrikeRate: Math.round((totalStrikeRate / totalSessions) * 100) / 100,
        bestRuns,
        bestStrikeRate
      },
      bowling: {
        avgOvers: Math.round((totalOvers / totalSessions) * 100) / 100,
        avgWickets: Math.round((totalWickets / totalSessions) * 100) / 100,
        avgEconomy: Math.round((totalEconomy / totalSessions) * 100) / 100,
        bestWickets,
        bestEconomy: bestEconomy === Infinity ? 0 : bestEconomy
      },
      fielding: {
        totalCatches,
        totalRunOuts
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

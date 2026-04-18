const express = require('express');
const Batch = require('../models/Batch');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Session = require('../models/Session');
const Announcement = require('../models/Announcement');
const Match = require('../models/Match');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const normalizeLoginId = (value) => String(value || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const generatePlayerLoginId = async (name) => {
  const initials = normalizeLoginId(name).slice(0, 4) || 'PLYR';
  let counter = 1;

  while (counter < 10000) {
    const candidate = `${initials}${String(counter).padStart(3, '0')}`;
    const exists = await User.findOne({ loginId: candidate });
    if (!exists) {
      return candidate;
    }
    counter += 1;
  }

  throw new Error('Could not generate unique login ID');
};

const generatePassword = () => `KCA${Math.random().toString(36).slice(-6).toUpperCase()}`;

router.use(protect, adminOnly);

// ─── OVERVIEW ───────────────────────────────────────────────────────────────
router.get('/overview', async (req, res) => {
  try {
    const [batches, players, sessions, announcements, matches] = await Promise.all([
      Batch.find({ isActive: true }).sort({ name: 1 }),
      User.find({ role: 'player', isActive: true }).select('-password').populate('batch').sort({ createdAt: -1 }),
      Session.find().populate('batch', 'name timing').sort({ date: 1 }),
      Announcement.find().populate('batch', 'name').sort({ createdAt: -1 }),
      Match.find().populate('selectedPlayers', 'name loginId').sort({ date: -1 })
    ]);

    res.json({ batches, players, sessions, announcements, matches });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load overview', error: error.message });
  }
});

// ─── BATCHES CRUD ───────────────────────────────────────────────────────────
router.post('/batches', async (req, res) => {
  try {
    const batch = await Batch.create(req.body);
    res.status(201).json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create batch', error: error.message });
  }
});

router.get('/batches', async (req, res) => {
  try {
    const batches = await Batch.find({ isActive: true }).sort({ name: 1 });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch batches', error: error.message });
  }
});

router.put('/batches/:id', async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update batch', error: error.message });
  }
});

router.delete('/batches/:id', async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!batch) return res.status(404).json({ message: 'Batch not found' });
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete batch', error: error.message });
  }
});

// ─── PLAYERS CRUD ───────────────────────────────────────────────────────────
router.post('/players', async (req, res) => {
  try {
    const {
      name,
      age,
      phone,
      email,
      password,
      guardianName,
      guardianContact,
      skillLevel,
      batch,
      position
    } = req.body;

    if (!name || !age || !phone || !batch || !email || !password) {
      return res.status(400).json({ message: 'Name, age, phone, email, password, and batch are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if email already in use
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'A player with this email already exists' });
    }

    const loginId = await generatePlayerLoginId(name);

    const player = await User.create({
      loginId,
      password,
      name,
      age: Number(age),
      phone,
      email: email.trim(),
      guardianName: guardianName || undefined,
      guardianContact: guardianContact || undefined,
      skillLevel: skillLevel || 'Beginner',
      batch,
      position: position || 'Batsman',
      role: 'player'
    });

    const createdPlayer = await User.findById(player._id).select('-password').populate('batch');

    res.status(201).json({
      message: 'Player created successfully',
      credentials: { email: email.trim(), password },
      player: createdPlayer
    });
  } catch (error) {
    console.error('Create player error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A player with this ${field} already exists` });
    }
    res.status(500).json({ message: 'Failed to create player', error: error.message });
  }
});

router.get('/players', async (req, res) => {
  try {
    const players = await User.find({ role: 'player', isActive: true }).select('-password').populate('batch').sort({ createdAt: -1 });
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch players', error: error.message });
  }
});

router.put('/players/:id', async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'email', 'age', 'guardianName', 'guardianContact', 'skillLevel', 'batch', 'position', 'isActive'];
    const updatePayload = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        // Convert empty email to null so the sparse unique index works
        if (field === 'email') {
          updatePayload[field] = req.body[field]?.trim() || null;
        } else {
          updatePayload[field] = req.body[field];
        }
      }
    });

    const updatedPlayer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'player' },
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select('-password').populate('batch');

    if (!updatedPlayer) return res.status(404).json({ message: 'Player not found' });
    res.json(updatedPlayer);
  } catch (error) {
    console.error('Update player error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A player with this ${field} already exists` });
    }
    res.status(500).json({ message: 'Failed to update player', error: error.message });
  }
});

router.delete('/players/:id', async (req, res) => {
  try {
    const player = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'player' },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json({ message: 'Player deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete player', error: error.message });
  }
});

// ─── ATTENDANCE ─────────────────────────────────────────────────────────────
router.post('/attendance/mark', async (req, res) => {
  try {
    const { batchId, date, records } = req.body;

    if (!batchId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Batch, date, and attendance records are required' });
    }

    const attendanceDate = new Date(date);
    const normalizedDate = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate());

    await Promise.all(records.map(({ userId, status, notes }) =>
      Attendance.findOneAndUpdate(
        { userId, date: normalizedDate },
        {
          userId,
          batch: batchId,
          date: normalizedDate,
          status,
          notes: notes || '',
          markedBy: req.user._id
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    ));

    res.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save attendance', error: error.message });
  }
});

router.get('/attendance/batch/:batchId', async (req, res) => {
  try {
    const players = await User.find({ role: 'player', batch: req.params.batchId, isActive: true })
      .select('-password')
      .sort({ name: 1 });

    const queryDate = req.query.date ? new Date(req.query.date) : new Date();
    const date = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());

    const attendance = await Attendance.find({ batch: req.params.batchId, date });
    res.json({ players, attendance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance', error: error.message });
  }
});

// ─── PERFORMANCE CRUD ───────────────────────────────────────────────────────
router.post('/performance', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      recordedBy: req.user._id
    };

    const performance = await Performance.create(payload);
    const record = await Performance.findById(performance._id)
      .populate('userId', 'name loginId')
      .populate('recordedBy', 'name');

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create performance record', error: error.message });
  }
});

router.get('/performance', async (req, res) => {
  try {
    const records = await Performance.find()
      .populate('userId', 'name loginId')
      .populate('recordedBy', 'name')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch performance records', error: error.message });
  }
});

router.put('/performance/:id', async (req, res) => {
  try {
    const record = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('userId', 'name loginId')
      .populate('recordedBy', 'name');
    if (!record) return res.status(404).json({ message: 'Performance record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update performance record', error: error.message });
  }
});

router.delete('/performance/:id', async (req, res) => {
  try {
    const record = await Performance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Performance record not found' });
    res.json({ message: 'Performance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete performance record', error: error.message });
  }
});

// ─── SESSIONS CRUD ──────────────────────────────────────────────────────────
router.post('/sessions', async (req, res) => {
  try {
    const session = await Session.create({ ...req.body, createdBy: req.user._id });
    const record = await Session.findById(session._id).populate('batch', 'name timing');
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error: error.message });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.find().populate('batch', 'name timing').sort({ date: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
});

router.put('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('batch', 'name timing');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update session', error: error.message });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete session', error: error.message });
  }
});

// ─── ANNOUNCEMENTS CRUD ────────────────────────────────────────────────────
router.post('/announcements', async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, createdBy: req.user._id });
    const record = await Announcement.findById(announcement._id).populate('batch', 'name');
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
});

router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('batch', 'name').sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
});

router.put('/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('batch', 'name');
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update announcement', error: error.message });
  }
});

router.delete('/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete announcement', error: error.message });
  }
});

// ─── MATCHES CRUD ───────────────────────────────────────────────────────────
router.post('/matches', async (req, res) => {
  try {
    const match = await Match.create({ ...req.body, createdBy: req.user._id });
    const record = await Match.findById(match._id)
      .populate('selectedPlayers', 'name loginId')
      .populate('playerStats.player', 'name loginId');
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create match', error: error.message });
  }
});

router.get('/matches', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('selectedPlayers', 'name loginId')
      .populate('playerStats.player', 'name loginId')
      .sort({ date: -1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch matches', error: error.message });
  }
});

router.put('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('selectedPlayers', 'name loginId')
      .populate('playerStats.player', 'name loginId');
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update match', error: error.message });
  }
});

router.delete('/matches/:id', async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete match', error: error.message });
  }
});

// ─── ANALYTICS ──────────────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [totalPlayers, totalBatches, attendanceRecords, performances] = await Promise.all([
      User.countDocuments({ role: 'player', isActive: true }),
      Batch.countDocuments({ isActive: true }),
      Attendance.find().populate('userId', 'name'),
      Performance.find().populate('userId', 'name')
    ]);

    const presentCount = attendanceRecords.filter((item) => item.status === 'Present').length;
    const attendanceRate = attendanceRecords.length ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

    const performerMap = new Map();
    performances.forEach((item) => {
      const key = String(item.userId?._id || item.userId);
      const current = performerMap.get(key) || {
        playerId: key,
        name: item.userId?.name || 'Unknown',
        runs: 0,
        wickets: 0,
        catches: 0
      };

      current.runs += item.batting?.runs || 0;
      current.wickets += item.bowling?.wickets || 0;
      current.catches += item.fielding?.catches || 0;
      performerMap.set(key, current);
    });

    const bestPerformers = [...performerMap.values()]
      .map((item) => ({
        ...item,
        score: item.runs + item.wickets * 20 + item.catches * 10
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const attendanceTrends = {};
    attendanceRecords.forEach((item) => {
      const dateKey = new Date(item.date).toISOString().slice(0, 10);
      if (!attendanceTrends[dateKey]) {
        attendanceTrends[dateKey] = { date: dateKey, total: 0, present: 0 };
      }
      attendanceTrends[dateKey].total += 1;
      if (item.status === 'Present') {
        attendanceTrends[dateKey].present += 1;
      }
    });

    const revenueStats = {
      estimatedMonthlyRevenue: totalPlayers * 2500,
      activePlayers: totalPlayers,
      activeBatches: totalBatches
    };

    res.json({
      totalPlayers,
      attendanceRate,
      bestPerformers,
      attendanceTrends: Object.values(attendanceTrends).sort((a, b) => a.date.localeCompare(b.date)).slice(-10),
      revenueStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load analytics', error: error.message });
  }
});

module.exports = router;

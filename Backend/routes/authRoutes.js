const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const serializeUser = (user) => ({
  _id: user._id,
  loginId: user.loginId,
  name: user.name,
  email: user.email,
  phone: user.phone,
  age: user.age,
  skillLevel: user.skillLevel,
  role: user.role,
  batch: user.batch
});

router.post('/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ message: 'Please provide login ID/email and password' });
    }

    const identifier = String(loginId).trim();
    const isEmailLogin = identifier.includes('@');
    const user = await User.findOne(
      isEmailLogin
        ? { email: identifier.toLowerCase() }
        : { loginId: identifier.toUpperCase() }
    ).populate('batch');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid login ID/email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        ...serializeUser(user),
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('batch');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(serializeUser(user));
});

module.exports = router;

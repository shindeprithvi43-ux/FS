const User = require('../models/User');

const normalizeLoginId = (value) =>
  value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

const ensureAdminUser = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return;
    }

    const loginId = normalizeLoginId(process.env.ADMIN_LOGIN_ID || process.env.ADMIN_NAME || 'ADMIN') || 'ADMIN001';
    let rawPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Safety check for minlength
    if (rawPassword.length < 6) {
      console.warn('⚠️ Warning: ADMIN_PASSWORD in environment is too short (min 6). Using default fallback.');
      rawPassword = 'admin123';
    }

    await User.create({
      loginId,
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || '',
      password: rawPassword,
      phone: process.env.ADMIN_PHONE || '9999999999',
      age: 30,
      skillLevel: 'Advanced',
      role: 'admin'
    });

    console.log(`✅ Seeded admin user with Login ID: ${loginId}`);
  } catch (error) {
    console.error('❌ Failed to bootstrap admin user. Continuing server startup without crashing. Error:', error.message);
  }
};

module.exports = ensureAdminUser;

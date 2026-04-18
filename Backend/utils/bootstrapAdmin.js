const User = require('../models/User');

const normalizeLoginId = (value) =>
  value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

const ensureAdminUser = async () => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) {
    return;
  }

  const loginId = normalizeLoginId(process.env.ADMIN_LOGIN_ID || process.env.ADMIN_NAME || 'ADMIN') || 'ADMIN001';

  await User.create({
    loginId,
    name: process.env.ADMIN_NAME || 'Admin',
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    phone: process.env.ADMIN_PHONE || '9999999999',
    age: 30,
    skillLevel: 'Advanced',
    role: 'admin'
  });

  console.log(`Seeded admin user with Login ID: ${loginId}`);
};

module.exports = ensureAdminUser;

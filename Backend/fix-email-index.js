const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Step 1: Fix users with null/missing loginId by generating one
  const usersWithNoLoginId = await db.collection('users').find({
    $or: [{ loginId: null }, { loginId: { $exists: false } }]
  }).toArray();

  console.log(`Found ${usersWithNoLoginId.length} users without loginId`);

  for (const user of usersWithNoLoginId) {
    const name = user.name || 'PLYR';
    const initials = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'PLYR';
    let counter = 1;
    let loginId;

    while (counter < 10000) {
      const candidate = `${initials}${String(counter).padStart(3, '0')}`;
      const exists = await db.collection('users').findOne({ loginId: candidate });
      if (!exists) {
        loginId = candidate;
        break;
      }
      counter++;
    }

    if (loginId) {
      await db.collection('users').updateOne({ _id: user._id }, { $set: { loginId } });
      console.log(`  Set loginId for ${user.name || user._id}: ${loginId}`);
    }
  }

  // Step 2: Drop and recreate loginId index
  try {
    await db.collection('users').dropIndex('loginId_1');
    console.log('Dropped old loginId index');
  } catch (e) {
    console.log('No loginId index to drop');
  }

  await db.collection('users').createIndex({ loginId: 1 }, { unique: true });
  console.log('Created loginId unique index');

  // Verify
  const indexes = await db.collection('users').indexes();
  console.log('All indexes:', JSON.stringify(indexes, null, 2));

  const allUsers = await db.collection('users').find().project({ loginId: 1, name: 1, email: 1, role: 1, isActive: 1 }).toArray();
  console.log('All users:', JSON.stringify(allUsers, null, 2));

  await mongoose.disconnect();
  console.log('Done!');
}

fixAllIndexes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

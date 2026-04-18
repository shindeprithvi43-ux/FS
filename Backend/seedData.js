const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Performance = require('./models/Performance');
const Batch = require('./models/Batch');
const Session = require('./models/Session');
const Announcement = require('./models/Announcement');
const Match = require('./models/Match');
const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      Match.deleteMany({}),
      Announcement.deleteMany({}),
      Session.deleteMany({}),
      Performance.deleteMany({}),
      Attendance.deleteMany({}),
      User.deleteMany({}),
      Batch.deleteMany({})
    ]);

    const morningBatch = await Batch.create({
      name: 'Morning Elite',
      timing: '06:00 AM - 08:00 AM',
      category: 'Advanced',
      maxPlayers: 24,
      description: 'Advanced skill training batch'
    });

    const eveningBatch = await Batch.create({
      name: 'Evening Rising Stars',
      timing: '05:00 PM - 07:00 PM',
      category: 'Beginner',
      maxPlayers: 30,
      description: 'Beginner and intermediate foundation batch'
    });

    const admin = await User.create({
      loginId: process.env.ADMIN_LOGIN_ID || 'ADMIN001',
      name: process.env.ADMIN_NAME || 'Admin',
      email: process.env.ADMIN_EMAIL || '',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      phone: process.env.ADMIN_PHONE || '9999999999',
      age: 30,
      skillLevel: 'Advanced',
      role: 'admin'
    });

    const rahul = await User.create({
      loginId: 'RAHU001',
      name: 'Rahul Sharma',
      password: 'password123',
      phone: '+91 9876543210',
      email: 'rahul@example.com',
      age: 17,
      skillLevel: 'Advanced',
      batch: morningBatch._id,
      guardianName: 'Ajay Sharma',
      guardianContact: '+91 9876543201',
      role: 'player'
    });

    const priya = await User.create({
      loginId: 'PRIY001',
      name: 'Priya Patel',
      password: 'password123',
      phone: '+91 8765432100',
      email: 'priya@example.com',
      age: 15,
      skillLevel: 'Intermediate',
      batch: eveningBatch._id,
      guardianName: 'Suresh Patel',
      guardianContact: '+91 8765432101',
      role: 'player'
    });

    const attendanceRecords = [];
    for (let i = 20; i >= 1; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (date.getDay() === 0) continue;

      attendanceRecords.push({
        userId: rahul._id,
        batch: morningBatch._id,
        date,
        status: Math.random() > 0.15 ? 'Present' : 'Absent',
        markedBy: admin._id
      });

      attendanceRecords.push({
        userId: priya._id,
        batch: eveningBatch._id,
        date,
        status: Math.random() > 0.2 ? 'Present' : 'Absent',
        markedBy: admin._id
      });
    }
    await Attendance.insertMany(attendanceRecords);

    await Performance.insertMany([
      {
        userId: rahul._id,
        date: new Date(),
        sessionType: 'Practice',
        batting: { runs: 62, balls: 39, strikeRate: 158.97 },
        bowling: { overs: 4, wickets: 2, economy: 5.5 },
        fielding: { catches: 1, runOuts: 0 },
        strengths: 'Confident front-foot play and strong off-side timing',
        weaknesses: 'Needs tighter control in the last over',
        remarks: 'Very good net session overall.',
        recordedBy: admin._id
      },
      {
        userId: priya._id,
        date: new Date(Date.now() - 86400000 * 3),
        sessionType: 'Batting',
        batting: { runs: 34, balls: 30, strikeRate: 113.33 },
        bowling: { overs: 2, wickets: 1, economy: 6.5 },
        fielding: { catches: 0, runOuts: 1 },
        strengths: 'Good balance at the crease',
        weaknesses: 'Needs more confidence against pace',
        remarks: 'Positive progress this week.',
        recordedBy: admin._id
      }
    ]);

    await Session.insertMany([
      {
        title: 'Powerplay Batting Drills',
        date: new Date(Date.now() + 86400000),
        type: 'Batting',
        batch: morningBatch._id,
        notes: 'Bring match kit and focus on intent in the first six overs.',
        createdBy: admin._id
      },
      {
        title: 'Mobility and Conditioning',
        date: new Date(Date.now() + 86400000 * 2),
        type: 'Fitness',
        batch: eveningBatch._id,
        notes: 'Hydration required. Report 10 minutes early.',
        createdBy: admin._id
      }
    ]);

    await Announcement.insertMany([
      {
        title: 'Saturday Practice Timing Change',
        message: 'Saturday practice will begin 30 minutes earlier due to ground availability.',
        batch: null,
        createdBy: admin._id
      },
      {
        title: 'Morning Elite Match Prep',
        message: 'Morning Elite players should carry full whites for tomorrow\'s intra-squad match.',
        batch: morningBatch._id,
        createdBy: admin._id
      }
    ]);

    await Match.create({
      title: 'Intra-Squad Match 1',
      opponent: 'Academy XI',
      tournament: 'Internal Tournament',
      format: 'T20',
      date: new Date(Date.now() + 86400000 * 5),
      selectedPlayers: [rahul._id, priya._id],
      playerStats: [
        {
          player: rahul._id,
          batting: { runs: 45, balls: 29, strikeRate: 155.17 },
          bowling: { overs: 3, wickets: 2, economy: 6 },
          fielding: { catches: 1, runOuts: 0 }
        },
        {
          player: priya._id,
          batting: { runs: 22, balls: 20, strikeRate: 110 },
          bowling: { overs: 2, wickets: 1, economy: 7.5 },
          fielding: { catches: 0, runOuts: 1 }
        }
      ],
      createdBy: admin._id
    });

    console.log('Seed data created successfully.');
    console.log(`Admin login: ${(process.env.ADMIN_LOGIN_ID || 'ADMIN001')} / ${(process.env.ADMIN_PASSWORD || 'admin123')}`);
    console.log('Player login: RAHU001 / password123');
    console.log('Player login: PRIY001 / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/User';
import { KanbanBoard } from '../src/models/KanbanBoard';
import { KanbanCard } from '../src/models/KanbanCard';
import { connectMongoDB } from '../src/config/mongodb';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectMongoDB();

    // Clear existing data
    await User.deleteMany({});
    await KanbanBoard.deleteMany({});
    await KanbanCard.deleteMany({});

    console.log('🗑️  Database cleared');

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      verified: true,
      profile: {
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        phone: '+1234567890',
      },
    });

    await admin.save();
    console.log('✅ Admin user created:', admin.email);

    // Create regular users (20 users)
    const users = [];
    const userEmails = [
      'john.doe@example.com',
      'sarah.connor@example.com',
      'mike.johnson@example.com',
      'emily.davis@example.com',
      'alex.martinez@example.com',
      'jessica.brown@example.com',
      'david.wilson@example.com',
      'lisa.anderson@example.com',
      'james.taylor@example.com',
      'maria.garcia@example.com',
      'robert.miller@example.com',
      'jennifer.moore@example.com',
      'william.jackson@example.com',
      'linda.white@example.com',
      'richard.harris@example.com',
      'susan.martin@example.com',
      'joseph.thompson@example.com',
      'karen.robinson@example.com',
      'thomas.clark@example.com',
      'nancy.lewis@example.com',
    ];

    for (let i = 0; i < userEmails.length; i++) {
      const user = new User({
        name: userEmails[i].split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' '),
        email: userEmails[i],
        password: 'password123',
        role: i % 5 === 0 ? 'admin' : 'user',
        verified: i % 3 !== 0,
        gender: i % 2 === 0 ? 'male' : 'female',
        profile: {
          avatarUrl: `https://i.pravatar.cc/150?img=${i + 2}`,
          phone: `+123456789${i}`,
        },
      });

      await user.save();
      users.push(user);
    }

    console.log(`✅ ${users.length} regular users created`);

    // Create Kanban boards
    const board1 = new KanbanBoard({
      title: 'Product Development',
      description: 'Main product development board',
      owner: admin._id,
    });

    const board2 = new KanbanBoard({
      title: 'Marketing Campaign',
      description: 'Marketing team tasks',
      owner: admin._id,
    });

    await board1.save();
    await board2.save();

    console.log('✅ Kanban boards created');

    // Create Kanban cards
    const card1 = new KanbanCard({
      title: 'Design dashboard UI',
      description: 'Create mockups for the admin dashboard',
      column: 'inprogress',
      boardId: board1._id,
      priority: 'high',
      assignees: [users[0]._id, users[1]._id],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const card2 = new KanbanCard({
      title: 'Implement authentication',
      description: 'JWT-based auth with refresh tokens',
      column: 'inprogress',
      boardId: board1._id,
      priority: 'high',
      assignees: [users[2]._id],
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    });

    const card3 = new KanbanCard({
      title: 'Create landing page',
      description: 'Landing page with hero section',
      column: 'todo',
      boardId: board1._id,
      priority: 'medium',
      assignees: [users[3]._id],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    const card4 = new KanbanCard({
      title: 'Social media graphics',
      description: 'Design social media posts for campaign',
      column: 'todo',
      boardId: board2._id,
      priority: 'medium',
      assignees: [users[4]._id],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    const card5 = new KanbanCard({
      title: 'Email campaign setup',
      description: 'Setup email automation',
      column: 'completed',
      boardId: board2._id,
      priority: 'low',
      assignees: [users[0]._id],
    });

    await KanbanCard.insertMany([card1, card2, card3, card4, card5]);

    console.log('✅ Kanban cards created');

    console.log('\n✨ Database seeding completed!');
    console.log('\nTest Credentials:');
    console.log('  Admin - admin@example.com / admin123');
    console.log('  User  - john@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();

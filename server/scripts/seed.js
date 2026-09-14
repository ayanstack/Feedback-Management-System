import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { Feedback } from '../models/Feedback.js';

dotenv.config();

const sampleEvents = [
  {
    title: 'Sysslan Tech Summit 2025',
    description: 'Annual technology conference exploring cloud computing, AI integrations, microservices, and modern web architectures.',
    date: new Date('2025-11-20T09:30:00Z'),
    location: 'Bangalore International Exhibition Centre / Hybrid',
    category: 'Conference',
    speaker: 'Dr. Ramesh Sharma & Team Sysslan',
    status: 'Upcoming',
    capacity: 350,
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'FullStack Web Dev Bootcamp',
    description: 'Hands-on intensive workshop building real-world MERN stack applications, RESTful APIs, and responsive React interfaces.',
    date: new Date('2025-10-15T10:00:00Z'),
    location: 'Sysslan IT Solutions Tech Hub, Virtual Room 4',
    category: 'Workshop',
    speaker: 'Priya Patel (Senior FullStack Engineer)',
    status: 'Completed',
    capacity: 120,
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Global AI & ML Hackathon 2025',
    description: '48-hour collaborative hackathon where developers, data scientists, and designers build generative AI applications.',
    date: new Date('2025-12-05T08:00:00Z'),
    location: 'Innovation Hall, Hyderabad & Discord Live',
    category: 'Hackathon',
    speaker: 'Ananya Verma (AI Research Lead)',
    status: 'Upcoming',
    capacity: 500,
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'UI/UX Design Systems Masterclass',
    description: 'Deep dive into crafting scalable design tokens, accessible component libraries, and engaging micro-interactions.',
    date: new Date('2025-09-28T14:00:00Z'),
    location: 'Design Studio & Zoom Webinar',
    category: 'Design',
    speaker: 'Vikram Mehta (Principal Product Designer)',
    status: 'Completed',
    capacity: 200,
    bannerUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60',
  },
];

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany();
    await Event.deleteMany();
    await Feedback.deleteMany();

    console.log('👤 Creating default Admin user...');
    const adminUser = await User.create({
      name: 'Sysslan Admin',
      email: 'admin@sysslan.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`✅ Admin created: ${adminUser.email} / admin123`);

    console.log('📅 Creating sample events...');
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`✅ ${createdEvents.length} events created`);

    console.log('💬 Creating initial feedback records...');
    const sampleFeedbacks = [
      {
        name: 'Aarav Patel',
        email: 'aarav.patel@example.com',
        event: createdEvents[1]._id,
        rating: 5,
        category: 'Content',
        message: 'The MERN stack explanations were crystal clear! The live coding sessions helped me understand JWT auth deeply.',
        recommend: true,
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@example.com',
        event: createdEvents[1]._id,
        rating: 5,
        category: 'Speaker',
        message: 'Priya was an outstanding mentor throughout the bootcamp. Would love an advanced part 2 on Next.js and Redis!',
        recommend: true,
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.g@example.com',
        event: createdEvents[3]._id,
        rating: 4,
        category: 'Design',
        message: 'Great masterclass on design systems and Figma tokens. The session was very engaging and practical.',
        recommend: true,
      },
      {
        name: 'Meera Iyer',
        email: 'meera.iyer@example.com',
        event: createdEvents[0]._id,
        rating: 5,
        category: 'Organization',
        message: 'Super excited for the upcoming Tech Summit! The agenda looks phenomenal and well-structured.',
        recommend: true,
      },
    ];

    await Feedback.insertMany(sampleFeedbacks);
    console.log(`✅ ${sampleFeedbacks.length} feedback items seeded`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
};

// If run directly via node
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

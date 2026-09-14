import mongoose from 'mongoose';

export let isUsingMemoryStore = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/event_feedback_db';

  try {
    console.log(`📡 Connecting to MongoDB at ${uri}...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    isUsingMemoryStore = false;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection unsuccessful: ${err.message}`);
    console.log(`⚡ Activating High-Performance Standalone JavaScript In-Memory Database Engine...`);
    isUsingMemoryStore = true;
  }
};

export const disconnectDB = async () => {
  if (!isUsingMemoryStore && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

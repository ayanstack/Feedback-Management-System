import mongoose from 'mongoose';

export let isUsingMemoryStore = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MONGO_URI not set — falling back to in-memory store (data will not persist)');
    isUsingMemoryStore = true;
    return;
  }

  try {
    console.log(`📡 Connecting to MongoDB...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s for Atlas cold starts
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    isUsingMemoryStore = false;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection unsuccessful: ${err.message}`);
    console.log(`⚡ Activating In-Memory Database Engine (data will not persist on restart)...`);
    isUsingMemoryStore = true;
  }
};

export const disconnectDB = async () => {
  if (!isUsingMemoryStore && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

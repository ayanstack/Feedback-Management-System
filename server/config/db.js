import mongoose from 'mongoose';

export let isUsingMemoryStore = false;

/**
 * Safely diagnose MongoDB URI without exposing any password
 */
const getSafeDbDiagnostics = (rawUri) => {
  if (!rawUri) return { exists: false };
  const trimmed = rawUri.trim().replace(/^["']|["']$/g, '');
  const hasAngleBrackets = trimmed.includes('<') || trimmed.includes('>');
  const startsWithMongo = trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://');
  
  // Safe extraction of host/database/user without password
  let user = 'unknown';
  let host = 'unknown';
  let dbName = 'default';
  try {
    const match = trimmed.match(/^mongodb(?:\+srv)?:\/\/([^:]+):([^@]+)@([^/?]+)(?:\/([^?]*))?/);
    if (match) {
      user = match[1];
      host = match[3];
      dbName = match[4] || 'default';
    }
  } catch {
    // ignore parse error
  }

  return {
    exists: true,
    startsWithProtocol: startsWithMongo,
    hasAngleBrackets,
    user,
    host,
    dbName,
    hasWhitespace: /\s/.test(rawUri),
  };
};

export const connectDB = async () => {
  let uri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');

  if (!uri) {
    console.warn('⚠️  MONGO_URI / MONGODB_URI not set — activating in-memory store');
    isUsingMemoryStore = true;
    return;
  }

  const diag = getSafeDbDiagnostics(uri);
  console.log(`📡 MongoDB Diagnostics:`);
  console.log(`   - MONGO_URI detected: ✅ Yes`);
  console.log(`   - Protocol valid: ${diag.startsWithProtocol ? '✅' : '❌'}`);
  console.log(`   - Target Host: ${diag.host}`);
  console.log(`   - Target DB: ${diag.dbName}`);
  console.log(`   - DB User: ${diag.user}`);
  
  if (diag.hasAngleBrackets) {
    console.warn(`   ⚠️ CRITICAL WARNING: MONGO_URI contains angle brackets '<' or '>'.`);
    console.warn(`      Make sure you replaced <password> with your actual password (without the '<' and '>').`);
  }
  if (diag.hasWhitespace) {
    console.warn(`   ⚠️ WARNING: MONGO_URI contains leading, trailing or internal whitespace.`);
  }

  try {
    console.log(`📡 Connecting to MongoDB Atlas...`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });
    console.log(`✅ MongoDB Atlas Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    isUsingMemoryStore = false;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection unsuccessful: ${err.message}`);
    if (err.message && err.message.includes('auth')) {
      console.warn(`   💡 Tip for "authentication failed":`);
      console.warn(`      1. Verify the database user exists in MongoDB Atlas -> "Database Access".`);
      console.warn(`      2. Verify the password has NO angle brackets: use 'myPassword', NOT '<myPassword>'.`);
      console.warn(`      3. If your password has special characters like @, #, %, URL-encode them (e.g., @ becomes %40).`);
      console.warn(`      4. In Atlas -> "Network Access", ensure IP 0.0.0.0/0 (Allow from anywhere) is active.`);
    }
    console.log(`⚡ Activating In-Memory Database Engine (data will not persist on restart)...`);
    isUsingMemoryStore = true;
  }
};

export const disconnectDB = async () => {
  if (!isUsingMemoryStore && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const testConnection = async () => {
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  console.log('--- MongoDB Diagnostic Report ---');
  console.log('MONGO_URI exists:', Boolean(rawUri));
  
  if (!rawUri) {
    console.log('Status: MONGO_URI is missing');
    process.exit(1);
  }

  const cleanUri = rawUri.trim().replace(/^["']|["']$/g, '');
  const hasBrackets = cleanUri.includes('<') || cleanUri.includes('>');
  const startsWithProto = cleanUri.startsWith('mongodb+srv://') || cleanUri.startsWith('mongodb://');
  const hasWhitespace = /\s/.test(rawUri);

  console.log('Starts with valid protocol (mongodb+srv://):', startsWithProto);
  console.log('Contains angle brackets (< or >):', hasBrackets ? 'YES (CRITICAL ISSUE)' : 'No (Good)');
  console.log('Contains accidental whitespace/quotes:', hasWhitespace ? 'YES (Warning)' : 'No (Good)');

  if (hasBrackets) {
    console.log('\n❌ DIAGNOSIS: The URI contains angle brackets "<" or ">".');
    console.log('In MongoDB Atlas URIs, <password> is a placeholder. You must replace <password> with your actual password without the angle brackets.');
  }

  console.log('\nTesting connection to Atlas...');
  try {
    await mongoose.connect(cleanUri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connection Result: SUCCESS! Connected to MongoDB Atlas.');
    await mongoose.disconnect();
  } catch (err) {
    console.log('❌ Connection Result: FAILED');
    console.log('Error Message:', err.message);
  }
};

testConnection();

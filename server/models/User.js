import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isUsingMemoryStore } from '../config/db.js';
import { MemoryCollection } from '../utils/memoryStore.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);
const memoryUsers = new MemoryCollection('users');

export const User = new Proxy(MongooseUser, {
  get(target, prop) {
    if (isUsingMemoryStore || mongoose.connection.readyState !== 1) {
      if (typeof memoryUsers[prop] === 'function') {
        return (...args) => memoryUsers[prop](...args);
      }
      return memoryUsers[prop];
    }
    return target[prop];
  },
});

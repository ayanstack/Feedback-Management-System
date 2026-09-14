import mongoose from 'mongoose';
import { isUsingMemoryStore } from '../config/db.js';
import { MemoryCollection } from '../utils/memoryStore.js';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Event venue or location is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: ['Technology', 'Workshop', 'Conference', 'Hackathon', 'Design', 'Webinar', 'Corporate', 'Other'],
      default: 'Technology',
    },
    speaker: {
      type: String,
      trim: true,
      default: 'Keynote Presenter',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed'],
      default: 'Upcoming',
    },
    capacity: {
      type: Number,
      default: 100,
    },
    bannerUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.virtual('feedbacks', {
  ref: 'Feedback',
  localField: '_id',
  foreignField: 'event',
  justOne: false,
});

const MongooseEvent = mongoose.models.Event || mongoose.model('Event', eventSchema);
const memoryEvents = new MemoryCollection('events');

export const Event = new Proxy(MongooseEvent, {
  get(target, prop) {
    if (isUsingMemoryStore || mongoose.connection.readyState !== 1) {
      if (typeof memoryEvents[prop] === 'function') {
        return (...args) => memoryEvents[prop](...args);
      }
      return memoryEvents[prop];
    }
    return target[prop];
  },
});

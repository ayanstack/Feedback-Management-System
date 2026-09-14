import mongoose from 'mongoose';
import { isUsingMemoryStore } from '../config/db.js';
import { MemoryCollection } from '../utils/memoryStore.js';
import { Event } from './Event.js';

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Your name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Your email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Please select an event for your feedback'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating (1 to 5)'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    message: {
      type: String,
      required: [true, 'Feedback message cannot be empty'],
      trim: true,
      minlength: [5, 'Feedback message must be at least 5 characters long'],
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['General', 'Content', 'Speaker', 'Organization', 'Venue/Tech'],
      default: 'General',
    },
    recommend: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseFeedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
const memoryFeedbacks = new MemoryCollection('feedbacks');

// Helper to populate event
const populateEvent = async (feedbackDoc) => {
  if (!feedbackDoc) return null;
  if (typeof feedbackDoc.event === 'object' && feedbackDoc.event?.title) {
    return feedbackDoc;
  }
  const eventId = feedbackDoc.event?._id || feedbackDoc.event;
  const event = await Event.findById(eventId);
  return {
    ...feedbackDoc,
    event: event ? { _id: event._id, title: event.title, location: event.location, date: event.date, category: event.category } : null,
  };
};

export const Feedback = new Proxy(MongooseFeedback, {
  get(target, prop) {
    if (isUsingMemoryStore || mongoose.connection.readyState !== 1) {
      if (prop === 'find') {
        return (query = {}) => {
          const queryResult = memoryFeedbacks.find(query);
          const originalThen = queryResult.then.bind(queryResult);
          queryResult.then = (resolve, reject) => {
            originalThen(async (items) => {
              try {
                const populated = await Promise.all(items.map(populateEvent));
                resolve(populated);
              } catch (err) {
                reject(err);
              }
            }, reject);
          };
          return queryResult;
        };
      }

      if (prop === 'findById') {
        return (id) => {
          const queryResult = memoryFeedbacks.findById(id);
          const originalThen = queryResult.then.bind(queryResult);
          queryResult.then = (resolve, reject) => {
            originalThen(async (item) => {
              try {
                const populated = await populateEvent(item);
                resolve(populated);
              } catch (err) {
                reject(err);
              }
            }, reject);
          };
          return queryResult;
        };
      }

      if (typeof memoryFeedbacks[prop] === 'function') {
        return (...args) => memoryFeedbacks[prop](...args);
      }
      return memoryFeedbacks[prop];
    }
    return target[prop];
  },
});

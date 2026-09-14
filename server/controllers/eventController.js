import { Event } from '../models/Event.js';
import { Feedback } from '../models/Feedback.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { speaker: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query).sort({ date: 1 });

    // Attach feedback statistics to each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const feedbackCount = await Feedback.countDocuments({ event: event._id });
        const feedbacks = await Feedback.find({ event: event._id }).select('rating');
        const avgRating =
          feedbacks.length > 0
            ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

        return {
          ...event.toObject(),
          feedbackCount,
          avgRating: Number(avgRating),
        };
      })
    );

    res.status(200).json({
      success: true,
      count: eventsWithStats.length,
      events: eventsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id ${req.params.id}`,
      });
    }

    const feedbacks = await Feedback.find({ event: event._id }).sort({ createdAt: -1 });
    const feedbackCount = feedbacks.length;
    const avgRating =
      feedbackCount > 0
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbackCount).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      event: {
        ...event.toObject(),
        feedbackCount,
        avgRating: Number(avgRating),
        feedbacks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin)
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location, category, speaker, status, capacity, bannerUrl } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, date, and location',
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category: category || 'Technology',
      speaker: speaker || 'Keynote Speaker',
      status: status || 'Upcoming',
      capacity: capacity || 100,
      bannerUrl: bannerUrl || '',
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Admin)
export const updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id ${req.params.id}`,
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id ${req.params.id}`,
      });
    }

    // Delete all feedback associated with this event
    await Feedback.deleteMany({ event: event._id });
    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event and associated feedback deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

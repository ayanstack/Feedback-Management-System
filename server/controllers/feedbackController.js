import { Feedback } from '../models/Feedback.js';
import { Event } from '../models/Event.js';

// @desc    Submit new feedback
// @route   POST /api/feedback
// @access  Public
export const submitFeedback = async (req, res, next) => {
  try {
    const { name, email, event, rating, message, category, recommend } = req.body;

    // Validation
    if (!name || !email || !event || !rating || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Name, Email, Event, Rating, and Feedback Message.',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    // Check if event exists
    const eventExists = await Event.findById(event);
    if (!eventExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected event does not exist in the database.',
      });
    }

    const feedback = await Feedback.create({
      name,
      email: email.toLowerCase(),
      event,
      rating: Number(rating),
      message,
      category: category || 'General',
      recommend: recommend !== undefined ? recommend : true,
    });

    const populatedFeedback = await Feedback.findById(feedback._id).populate(
      'event',
      'title location date'
    );

    res.status(201).json({
      success: true,
      message: '🎉 Feedback submitted successfully! Thank you for your review.',
      feedback: populatedFeedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback (with filtering by event, rating, or search)
// @route   GET /api/feedback
// @access  Public / Admin
export const getAllFeedback = async (req, res, next) => {
  try {
    const { eventId, rating, limit, search } = req.query;
    let query = {};

    if (eventId && eventId !== 'All') {
      query.event = eventId;
    }

    if (rating && rating !== 'All') {
      query.rating = Number(rating);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    let feedbackQuery = Feedback.find(query)
      .populate('event', 'title location date category')
      .sort({ createdAt: -1 });

    if (limit) {
      feedbackQuery = feedbackQuery.limit(Number(limit));
    }

    const feedbacks = await feedbackQuery;

    // Calculate aggregated statistics
    const totalCount = await Feedback.countDocuments(query);
    const allRatings = feedbacks.map((f) => f.rating);
    const avgRating =
      allRatings.length > 0
        ? (allRatings.reduce((acc, r) => acc + r, 0) / allRatings.length).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      totalCount,
      avgRating: Number(avgRating),
      feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedback/:id
// @access  Private (Admin)
export const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id).populate(
      'event',
      'title location date category speaker'
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback by ID
// @route   DELETE /api/feedback/:id
// @access  Private (Admin)
export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: `Feedback not found with id ${req.params.id}`,
      });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Feedback entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

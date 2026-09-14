import { Event } from '../models/Event.js';
import { Feedback } from '../models/Feedback.js';

// @desc    Get system-wide dashboard statistics
// @route   GET /api/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'Upcoming' });

    const feedbacks = await Feedback.find().select('rating category recommend createdAt');
    
    const avgRating =
      feedbacks.length > 0
        ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
        : 0;

    const recommendCount = feedbacks.filter((f) => f.recommend).length;
    const recommendRate =
      feedbacks.length > 0 ? Math.round((recommendCount / feedbacks.length) * 100) : 100;

    // Rating distribution (1 to 5 stars)
    const ratingDistribution = {
      5: feedbacks.filter((f) => f.rating === 5).length,
      4: feedbacks.filter((f) => f.rating === 4).length,
      3: feedbacks.filter((f) => f.rating === 3).length,
      2: feedbacks.filter((f) => f.rating === 2).length,
      1: feedbacks.filter((f) => f.rating === 1).length,
    };

    // Category distribution
    const categoryCounts = {};
    feedbacks.forEach((f) => {
      categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
    });

    // Recent 5 feedback items
    const recentFeedback = await Feedback.find()
      .populate('event', 'title location')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        totalFeedback,
        upcomingEvents,
        avgRating: Number(avgRating),
        recommendRate,
        ratingDistribution,
        categoryCounts,
        recentFeedback,
      },
    });
  } catch (error) {
    next(error);
  }
};

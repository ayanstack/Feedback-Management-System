import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  MessageSquareHeart, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Calendar, 
  User, 
  Mail, 
  Tag, 
  ThumbsUp, 
  Loader2, 
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import { feedbackAPI, eventsAPI } from '../services/api';
import StarRating from '../components/StarRating';

const CATEGORIES = ['General', 'Content', 'Speaker', 'Organization', 'Venue/Tech'];

const RATING_EMOJIS = [
  { stars: 1, label: 'Poor', emoji: '😞' },
  { stars: 2, label: 'Fair', emoji: '😐' },
  { stars: 3, label: 'Good', emoji: '🙂' },
  { stars: 4, label: 'Very Good', emoji: '😄' },
  { stars: 5, label: 'Exceptional', emoji: '🤩' },
];

const Feedback = () => {
  const [searchParams] = useSearchParams();
  const preSelectedEventId = searchParams.get('eventId') || '';

  const [events, setEvents] = useState([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingRecent, setFetchingRecent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    event: preSelectedEventId,
    rating: 5,
    category: 'General',
    message: '',
    recommend: true,
  });

  // Validation & Feedback Alerts
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Events and Submitted Feedbacks
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingEvents(true);
      try {
        const [eventsRes, feedbackRes] = await Promise.all([
          eventsAPI.getAll(),
          feedbackAPI.getAll({ limit: 6 }),
        ]);

        if (eventsRes.success) {
          setEvents(eventsRes.events || []);
          if (!preSelectedEventId && eventsRes.events.length > 0) {
            setFormData((prev) => ({ ...prev, event: eventsRes.events[0]._id }));
          }
        }

        if (feedbackRes.success) {
          setRecentFeedbacks(feedbackRes.feedbacks || []);
        }
      } catch (err) {
        console.error('Error loading feedback page data:', err);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadInitialData();
  }, [preSelectedEventId]);

  useEffect(() => {
    if (preSelectedEventId) {
      setFormData((prev) => ({ ...prev, event: preSelectedEventId }));
    }
  }, [preSelectedEventId]);

  const fetchRecentReviews = async () => {
    setFetchingRecent(true);
    try {
      const data = await feedbackAPI.getAll({ limit: 6 });
      if (data.success) {
        setRecentFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.warn('Could not refresh feedbacks:', err.message);
    } finally {
      setFetchingRecent(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.event) {
      errors.event = 'Please choose an event';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Please provide a star rating';
    }

    if (!formData.message.trim()) {
      errors.message = 'Feedback message cannot be empty';
    } else if (formData.message.trim().length < 5) {
      errors.message = 'Please provide at least 5 characters of feedback';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await feedbackAPI.submit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        event: formData.event,
        rating: Number(formData.rating),
        category: formData.category,
        message: formData.message.trim(),
        recommend: Boolean(formData.recommend),
      });

      if (response.success) {
        setSuccessMessage(
          response.message || '🎉 Thank you! Your review has been saved into MongoDB.'
        );

        setFormData({
          name: '',
          email: '',
          event: events.length > 0 ? events[0]._id : '',
          rating: 5,
          category: 'General',
          message: '',
          recommend: true,
        });
        setFormErrors({});
        fetchRecentReviews();
      } else {
        setErrorMessage(response.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      const apiErrMsg =
        err.response?.data?.message ||
        'Unable to submit feedback. Ensure backend server is active.';
      setErrorMessage(apiErrMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEventDetails = events.find((e) => e._id === formData.event);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Community Feedback Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Submit Event Feedback
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Your feedback is saved directly to MongoDB and instantly helps organizers elevate future sessions.
        </p>
      </div>

      {/* Main Form + Info Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Attendee Review Form</h2>
              <p className="text-xs text-slate-400">Takes less than 60 seconds to complete</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-start gap-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs sm:text-sm">{successMessage}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Your review is now stored in MongoDB and displayed in the live feed below.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-xs">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Session *
              </label>
              <select
                name="event"
                value={formData.event}
                onChange={handleChange}
                disabled={loadingEvents}
                className={`w-full px-4 py-2.5 bg-slate-50 border ${
                  formErrors.event ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all`}
              >
                <option value="">-- Choose an Event --</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({new Date(ev.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              {formErrors.event && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.event}</p>
              )}
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    } rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all`}
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    name="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${
                      formErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    } rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all`}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.email}</p>
                )}
              </div>
            </div>

            {/* Rating Selector Chips */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Overall Rating *
                </label>
                <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{formData.rating} of 5 Stars</span>
                </span>
              </div>

              {/* Emoji Rating Bar */}
              <div className="grid grid-cols-5 gap-2">
                {RATING_EMOJIS.map((item) => (
                  <button
                    key={item.stars}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rating: item.stars }))}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      formData.rating === item.stars
                        ? 'bg-white border-brand-500 shadow-sm ring-2 ring-brand-500/20 text-slate-900'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="text-xl">{item.emoji}</div>
                    <div className="text-[10px] font-bold mt-1 tracking-tight">{item.stars}★ {item.label}</div>
                  </button>
                ))}
              </div>

              {/* Focus Category */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Feedback Focus Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Feedback Message */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Detailed Review *
                </label>
                <span className="text-[10px] text-slate-400">
                  {formData.message.length} / 1000 chars
                </span>
              </div>
              <textarea
                name="message"
                rows="4"
                placeholder="What did you learn? How was the speaker delivery and session pace?"
                value={formData.message}
                onChange={handleChange}
                className={`w-full p-3.5 bg-slate-50 border ${
                  formErrors.message ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all`}
              />
              {formErrors.message && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">{formErrors.message}</p>
              )}
            </div>

            {/* Recommendation Checkbox */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="recommend"
                name="recommend"
                checked={formData.recommend}
                onChange={handleChange}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 cursor-pointer"
              />
              <label htmlFor="recommend" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                I would recommend this event series to other developers and teammates
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-brand py-3 text-xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Database...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Verified Feedback</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Event Detail & Guidelines Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          {selectedEventDetails ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                Selected Event Session
              </span>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                {selectedEventDetails.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {selectedEventDetails.description}
              </p>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  <span>{new Date(selectedEventDetails.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">📍</span>
                  <span className="truncate">{selectedEventDetails.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">🎤</span>
                  <span className="truncate">{selectedEventDetails.speaker || 'Host'}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-300 text-center">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Choose an event from the form dropdown to view session details here.
              </p>
            </div>
          )}

          {/* Guidelines Box */}
          <div className="bg-brand-50/70 p-5 rounded-3xl border border-brand-100 text-xs text-brand-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-brand-900">
              <Sparkles className="w-4 h-4 text-brand-600" /> Constructive Feedback Tips
            </h4>
            <ul className="space-y-1.5 text-brand-800/90 text-[11px] list-disc list-inside">
              <li>Highlight specific topics or coding demos that were helpful.</li>
              <li>Ratings directly update the live public event score.</li>
              <li>Your feedback guides speaker selection for future workshops.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live Stream Section */}
      <section className="pt-8 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Live Feedback Stream</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                MongoDB Synced
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Real-time attendee feedback records stored in MongoDB and served via REST API
            </p>
          </div>

          <button
            onClick={fetchRecentReviews}
            disabled={fetchingRecent}
            className="btn-secondary text-xs px-3.5 py-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingRecent ? 'animate-spin' : ''}`} />
            <span>Refresh Stream</span>
          </button>
        </div>

        {recentFeedbacks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <MessageSquareHeart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No reviews submitted yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">Be the first to submit a review above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentFeedbacks.map((fb) => (
              <div
                key={fb._id}
                className="card-crafted p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <StarRating rating={fb.rating} editable={false} size="sm" showLabel={false} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {fb.category}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs italic mb-4 leading-relaxed line-clamp-3 font-normal">
                    "{fb.message}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {fb.name ? fb.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs truncate max-w-[120px]">{fb.name}</span>
                      <span className="text-slate-400 text-[10px] block truncate max-w-[120px]">
                        {fb.event?.title || 'Workshop'}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-400 text-[10px] shrink-0">
                    {new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Feedback;

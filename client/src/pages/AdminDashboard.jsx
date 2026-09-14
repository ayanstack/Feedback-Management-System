import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  eventsAPI, 
  feedbackAPI, 
  statsAPI 
} from '../services/api';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquareHeart, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  TrendingUp, 
  Filter, 
  Search, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Sparkles,
  BarChart3,
  MapPin,
  Clock,
  User,
  LogOut,
  ChevronRight
} from 'lucide-react';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';

const CATEGORIES = ['Technology', 'Workshop', 'Conference', 'Hackathon', 'Design', 'Webinar', 'Corporate', 'Other'];
const STATUSES = ['Upcoming', 'Ongoing', 'Completed'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('events');

  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [bannerAlert, setBannerAlert] = useState({ type: '', message: '' });

  // Filtering for Feedback Tab
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('All');
  const [feedbackSearch, setFeedbackSearch] = useState('');

  // Filtering for Events Tab
  const [eventSearch, setEventSearch] = useState('');

  // Event Modal State
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: 'Technology',
    speaker: '',
    status: 'Upcoming',
    capacity: 100,
    bannerUrl: '',
  });

  // View Feedback Detail Modal
  const [viewFeedbackModalOpen, setViewFeedbackModalOpen] = useState(false);
  const [selectedFeedbackDetail, setSelectedFeedbackDetail] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, eventsRes, feedbackRes] = await Promise.all([
        statsAPI.getDashboardStats().catch(() => ({ success: false })),
        eventsAPI.getAll(),
        feedbackAPI.getAll(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (eventsRes.success) setEvents(eventsRes.events || []);
      if (feedbackRes.success) setFeedbacks(feedbackRes.feedbacks || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showAlert('error', 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showAlert = (type, message) => {
    setBannerAlert({ type, message });
    setTimeout(() => {
      setBannerAlert({ type: '', message: '' });
    }, 4500);
  };

  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventFormData({
      title: '',
      description: '',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      location: '',
      category: 'Technology',
      speaker: '',
      status: 'Upcoming',
      capacity: 150,
      bannerUrl: '',
    });
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev) => {
    setEditingEventId(ev._id);
    setEventFormData({
      title: ev.title,
      description: ev.description,
      date: ev.date ? new Date(ev.date).toISOString().split('T')[0] : '',
      location: ev.location,
      category: ev.category || 'Technology',
      speaker: ev.speaker || '',
      status: ev.status || 'Upcoming',
      capacity: ev.capacity || 100,
      bannerUrl: ev.bannerUrl || '',
    });
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.title.trim() || !eventFormData.description.trim() || !eventFormData.location.trim()) {
      showAlert('error', 'Please fill in Title, Description, and Location');
      return;
    }

    setActionLoading(true);
    try {
      if (editingEventId) {
        const res = await eventsAPI.update(editingEventId, eventFormData);
        if (res.success) {
          showAlert('success', 'Event updated successfully');
          setEventModalOpen(false);
          loadDashboardData();
        }
      } else {
        const res = await eventsAPI.create(eventFormData);
        if (res.success) {
          showAlert('success', 'New event created successfully');
          setEventModalOpen(false);
          loadDashboardData();
        }
      }
    } catch (err) {
      console.error('Event save error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to save event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}" and all its submitted reviews?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await eventsAPI.delete(id);
      if (res.success) {
        showAlert('success', `Event "${title}" and associated feedback deleted.`);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Delete event error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to delete event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this feedback review?')) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await feedbackAPI.delete(id);
      if (res.success) {
        showAlert('success', 'Feedback entry removed successfully');
        loadDashboardData();
      }
    } catch (err) {
      console.error('Delete feedback error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to delete feedback');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenFeedbackDetail = (fb) => {
    setSelectedFeedbackDetail(fb);
    setViewFeedbackModalOpen(true);
  };

  const filteredEvents = events.filter((ev) => {
    if (!eventSearch) return true;
    const q = eventSearch.toLowerCase();
    return (
      ev.title?.toLowerCase().includes(q) ||
      ev.location?.toLowerCase().includes(q) ||
      ev.speaker?.toLowerCase().includes(q)
    );
  });

  const filteredFeedback = feedbacks.filter((fb) => {
    const matchEvent = selectedEventFilter === 'All' || fb.event?._id === selectedEventFilter || fb.event === selectedEventFilter;
    const matchRating = selectedRatingFilter === 'All' || fb.rating === Number(selectedRatingFilter);
    const matchSearch =
      !feedbackSearch ||
      fb.name?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      fb.email?.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
      fb.message?.toLowerCase().includes(feedbackSearch.toLowerCase());

    return matchEvent && matchRating && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admin Control Center (JWT Bearer Protected)</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Organizer Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Logged in as <span className="font-bold text-slate-800">{user?.name || 'Admin'}</span> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="btn-secondary text-xs px-3.5 py-2.5 inline-flex items-center gap-2"
            title="Reload Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleOpenCreateEvent}
            className="btn-brand text-xs px-4 py-2.5 inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {bannerAlert.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-fade-in ${
            bannerAlert.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {bannerAlert.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span>{bannerAlert.message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-crafted p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{events.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Total Events</div>
          </div>
        </div>

        <div className="card-crafted p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{feedbacks.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Total Feedbacks</div>
          </div>
        </div>

        <div className="card-crafted p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.avgRating || (feedbacks.length ? (feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length).toFixed(1) : '5.0')}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Average Rating (1-5)</div>
          </div>
        </div>

        <div className="card-crafted p-5 sm:p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats?.recommendRate !== undefined ? `${stats.recommendRate}%` : '96%'}
            </div>
            <div className="text-xs text-slate-500 font-semibold">Recommend Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'events'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events Management ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'feedback'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquareHeart className="w-4 h-4" />
          <span>Submitted Feedback ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Insights</span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Fetching database records...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search events by title, location or speaker..."
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  onClick={handleOpenCreateEvent}
                  className="btn-brand text-xs px-4 py-2 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> Add New Event
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-6">Event Title</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-center">Reviews</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-10 text-slate-400 font-medium">
                            No events found matching your search.
                          </td>
                        </tr>
                      ) : (
                        filteredEvents.map((ev) => (
                          <tr key={ev._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">{ev.title}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{ev.speaker}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px]">
                                {ev.category}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600 font-medium">
                              {new Date(ev.date).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-slate-600 truncate max-w-[140px]">
                              {ev.location}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ev.status === 'Upcoming'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : ev.status === 'Ongoing'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {ev.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                {ev.feedbackCount || 0}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenEditEvent(ev)}
                                title="Edit Event"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(ev._id, ev.title)}
                                title="Delete Event"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Event Filter:
                  </label>
                  <select
                    value={selectedEventFilter}
                    onChange={(e) => setSelectedEventFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="All">All Events ({events.length})</option>
                    {events.map((ev) => (
                      <option key={ev._id} value={ev._id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Rating Filter:
                  </label>
                  <select
                    value={selectedRatingFilter}
                    onChange={(e) => setSelectedRatingFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="All">All Ratings (1-5★)</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Search Keyword:
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Name, email, or content..."
                      value={feedbackSearch}
                      onChange={(e) => setFeedbackSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback Table */}
              <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3.5 px-6">Attendee</th>
                        <th className="py-3.5 px-4">Event</th>
                        <th className="py-3.5 px-4">Rating</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Feedback Snippet</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredFeedback.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-10 text-slate-400 font-medium">
                            No feedback entries match your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredFeedback.map((fb) => (
                          <tr key={fb._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-6">
                              <div className="font-bold text-slate-900">{fb.name}</div>
                              <div className="text-[11px] text-slate-400">{fb.email}</div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-700 max-w-[150px] truncate">
                              {fb.event?.title || 'Event'}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1">
                                <StarRating rating={fb.rating} editable={false} size="sm" showLabel={false} />
                                <span className="font-bold text-slate-700 ml-1">({fb.rating})</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold">
                                {fb.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate italic">
                              "{fb.message}"
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {new Date(fb.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-6 text-right space-x-1.5">
                              <button
                                onClick={() => handleOpenFeedbackDetail(fb)}
                                title="View Details"
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFeedback(fb._id)}
                                title="Delete Feedback"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating Chart */}
              <div className="card-crafted p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Star Rating Distribution</span>
                </h3>

                <div className="space-y-3 pt-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = feedbacks.filter((f) => f.rating === star).length;
                    const percent = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-14 font-bold text-slate-700">{star} Stars</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-semibold text-slate-500">
                          {count} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Chart */}
              <div className="card-crafted p-6 space-y-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-600" />
                  <span>Feedback Categories Distribution</span>
                </h3>

                <div className="space-y-3 pt-2">
                  {CATEGORIES.filter(c => c !== 'All').map((cat) => {
                    const count = feedbacks.filter((f) => f.category === cat).length;
                    const percent = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center gap-3 text-xs">
                        <span className="w-24 font-bold text-slate-700 truncate">{cat}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-brand-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-semibold text-slate-500">
                          {count} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      <Modal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title={editingEventId ? 'Edit Event Details' : 'Create New Event'}
      >
        <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Title *</label>
            <input
              type="text"
              placeholder="e.g. NextGen Cloud & AI Summit"
              value={eventFormData.title}
              onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
              <select
                value={eventFormData.category}
                onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {CATEGORIES.filter(c => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={eventFormData.status}
                onChange={(e) => setEventFormData({ ...eventFormData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Event Date *</label>
              <input
                type="date"
                value={eventFormData.date}
                onChange={(e) => setEventFormData({ ...eventFormData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Speaker / Host</label>
              <input
                type="text"
                placeholder="e.g. Priya Patel"
                value={eventFormData.speaker}
                onChange={(e) => setEventFormData({ ...eventFormData, speaker: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Location / Venue *</label>
            <input
              type="text"
              placeholder="e.g. Bangalore Tech Hub / Hybrid"
              value={eventFormData.location}
              onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Banner Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={eventFormData.bannerUrl}
              onChange={(e) => setEventFormData({ ...eventFormData, bannerUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Description *</label>
            <textarea
              rows="3"
              placeholder="Overview of session goals and takeaways..."
              value={eventFormData.description}
              onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEventModalOpen(false)}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-brand text-xs px-5 py-2"
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingEventId ? 'Update Event' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* FEEDBACK DETAIL MODAL */}
      {selectedFeedbackDetail && (
        <Modal
          isOpen={viewFeedbackModalOpen}
          onClose={() => setViewFeedbackModalOpen(false)}
          title="Feedback Submission Details"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Attendee:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedFeedbackDetail.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Email:</span>
                <span className="font-semibold text-slate-700">{selectedFeedbackDetail.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Event:</span>
                <span className="font-bold text-slate-900">
                  {selectedFeedbackDetail.event?.title || 'Event'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Category:</span>
                <span className="font-bold text-brand-700">{selectedFeedbackDetail.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Rating:</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={selectedFeedbackDetail.rating} editable={false} size="sm" showLabel={false} />
                  <span className="font-bold">({selectedFeedbackDetail.rating} / 5)</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Would Recommend:</span>
                <span className={`font-bold ${selectedFeedbackDetail.recommend ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {selectedFeedbackDetail.recommend ? 'Yes ✅' : 'No ❌'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Submitted At:</span>
                <span className="text-slate-500">
                  {new Date(selectedFeedbackDetail.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-400 uppercase mb-1">
                Full Review Message:
              </label>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-800 text-xs sm:text-sm leading-relaxed italic">
                "{selectedFeedbackDetail.message}"
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setViewFeedbackModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDeleteFeedback(selectedFeedbackDetail._id);
                  setViewFeedbackModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Feedback</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  User, 
  Search, 
  Filter, 
  MessageSquareHeart, 
  Star, 
  Clock, 
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { eventsAPI } from '../services/api';
import Modal from '../components/Modal';

const CATEGORIES = ['All', 'Technology', 'Workshop', 'Conference', 'Hackathon', 'Design', 'Webinar'];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventsAPI.getAll({
        search: searchTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });

      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.message || 'Failed to load events');
      }
    } catch (err) {
      console.error('Fetch events error:', err);
      setError('Unable to fetch events. Please verify backend server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory]);

  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
    setDetailModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Events & Sessions
          </h1>
          <p className="text-slate-600 text-sm max-w-xl">
            Explore technical conferences, hands-on masterclasses, and hackathons. Share your review for any session.
          </p>
        </div>

        <Link
          to="/feedback"
          className="btn-brand text-xs px-5 py-2.5 self-start md:self-auto"
        >
          <MessageSquareHeart className="w-4 h-4" />
          <span>General Feedback Form</span>
        </Link>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, location, or speaker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse"
            >
              <div className="h-44 bg-slate-100 rounded-xl" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-9 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Events Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="btn-secondary text-xs px-4 py-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Event Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={event._id}
                className="card-crafted overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image */}
                  <div className="h-48 relative overflow-hidden bg-slate-100">
                    <img
                      src={
                        event.bannerUrl ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
                      }
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {event.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-subtle">
                      {event.status}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
                      {event.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.speaker || 'Keynote Host'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between py-2.5 border-t border-slate-100 mb-3 text-xs">
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{event.avgRating || '5.0'}</span>
                      <span className="text-slate-400 font-normal">
                        ({event.feedbackCount || 0} reviews)
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenDetail(event)}
                      className="text-slate-500 hover:text-slate-900 font-semibold text-[11px] inline-flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" /> Details
                    </button>
                  </div>

                  <Link
                    to={`/feedback?eventId=${event._id}`}
                    className="w-full btn-brand text-xs py-2.5"
                  >
                    <MessageSquareHeart className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={selectedEvent.title}
        >
          <div className="space-y-4 text-xs">
            <div className="h-44 rounded-xl overflow-hidden relative">
              <img
                src={
                  selectedEvent.bannerUrl ||
                  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'
                }
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-md text-[11px] font-bold">
                {selectedEvent.category}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">
                Overview
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed">{selectedEvent.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 block font-semibold">Date & Time:</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Venue / Platform:</span>
                <span className="font-bold text-slate-800">{selectedEvent.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Keynote Presenter:</span>
                <span className="font-bold text-slate-800">{selectedEvent.speaker || 'Host'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Capacity:</span>
                <span className="font-bold text-slate-800">{selectedEvent.capacity || 100} Attendees</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Close
              </button>
              <Link
                to={`/feedback?eventId=${selectedEvent._id}`}
                className="btn-brand text-xs px-5 py-2"
              >
                <MessageSquareHeart className="w-3.5 h-3.5" />
                <span>Give Feedback</span>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Events;

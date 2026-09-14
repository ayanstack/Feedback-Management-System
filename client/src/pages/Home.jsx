import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquareHeart, 
  Sparkles, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Layers,
  MapPin,
  Clock,
  Quote,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { eventsAPI, feedbackAPI } from '../services/api';
import StarRating from '../components/StarRating';

const Home = () => {
  const [stats, setStats] = useState({ eventsCount: 4, feedbackCount: 4, avgRating: 4.8 });
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [eventsRes, feedbackRes] = await Promise.all([
          eventsAPI.getAll(),
          feedbackAPI.getAll({ limit: 4 }),
        ]);

        if (eventsRes.success) {
          setFeaturedEvents(eventsRes.events.slice(0, 3));
          setStats((prev) => ({
            ...prev,
            eventsCount: eventsRes.count || prev.eventsCount,
          }));
        }

        if (feedbackRes.success) {
          setRecentFeedbacks(feedbackRes.feedbacks || []);
          setStats((prev) => ({
            ...prev,
            feedbackCount: feedbackRes.totalCount || prev.feedbackCount,
            avgRating: feedbackRes.avgRating || prev.avgRating,
          }));
        }
      } catch (err) {
        console.warn('Could not load dynamic home stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 bg-hero-glow bg-grid-subtle border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            {/* Top Live Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-subtle text-slate-700 text-xs font-semibold">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-800 font-bold">Sysslan IT Solutions</span>
              <span className="text-slate-300">|</span>
              <span className="text-brand-600 font-medium">Internship Assessment</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Event Feedback <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              A comprehensive platform designed to collect verified attendee reviews, evaluate speaker impact, and provide organizers with real-time actionable analytics.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Link
                to="/events"
                className="w-full sm:w-auto btn-brand text-sm px-6 py-3.5 shadow-md hover:shadow-lg transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Browse Sessions</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/feedback"
                className="w-full sm:w-auto btn-secondary text-sm px-6 py-3.5"
              >
                <MessageSquareHeart className="w-4 h-4 text-pink-500" />
                <span>Submit Feedback</span>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>RESTful Express API</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>MongoDB Stored Records</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>JWT Admin Authentication</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Stats Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card-crafted p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Database</span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.eventsCount}</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Active Events Tracked</div>
            </div>
          </div>

          <div className="card-crafted p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Submissions</span>
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <MessageSquareHeart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.feedbackCount}+</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Attendee Reviews Recorded</div>
            </div>
          </div>

          <div className="card-crafted p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                {stats.avgRating || 4.8} <span className="text-sm text-slate-400 font-medium">/ 5.0</span>
              </div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Average Experience Rating</div>
            </div>
          </div>

          <div className="card-crafted p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Satisfaction</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">98%</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">Recommendation Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Featured Sessions & Workshops
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50/70 hover:bg-brand-50 px-4 py-2 rounded-xl transition-all"
          >
            <span>View all events</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <div
              key={event._id}
              className="card-crafted overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Banner */}
                <div className="h-44 relative overflow-hidden bg-slate-100">
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
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-subtle">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-normal">
                    {event.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.speaker || 'Keynote Host'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100/80 mt-2">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{event.avgRating || '5.0'}</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    ({event.feedbackCount || 0})
                  </span>
                </div>

                <Link
                  to={`/feedback?eventId=${event._id}`}
                  className="btn-brand text-xs px-3.5 py-1.5"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5" />
                  <span>Review</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Step Lifecycle Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              Structured Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              The Sysslan Feedback Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              How attendee reviews transform into actionable insights for future technical conferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 font-black flex items-center justify-center text-sm mb-4 border border-brand-500/30">
                01
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">Select Your Session</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter the workshop or conference you attended and launch the verified feedback module.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 font-black flex items-center justify-center text-sm mb-4 border border-pink-500/30">
                02
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">Submit 5-Star Review</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Grade speaker delivery, technical depth, and logistical execution with specific feedback notes.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm mb-4 border border-emerald-500/30">
                03
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">Actionable Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organizers track satisfaction distributions and aggregate ratings to continually refine event quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Feedback Feed */}
      {recentFeedbacks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-pink-600">Community Voices</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Recent Attendee Feedback
              </h2>
            </div>
            <Link
              to="/feedback"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>See live feed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentFeedbacks.map((item) => (
              <div
                key={item._id}
                className="card-crafted p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <StarRating rating={item.rating} editable={false} size="sm" showLabel={false} />
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs sm:text-sm italic leading-relaxed mb-4">
                    "{item.message}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px]">
                      {item.name ? item.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{item.name}</span>
                      <span className="text-slate-400 text-[10px] block truncate max-w-[140px]">
                        {item.event?.title || 'Workshop'}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;

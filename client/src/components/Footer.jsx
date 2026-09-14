import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Event Feedback System
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              A full-stack feedback management platform designed for Sysslan IT Solutions.
              Empowers event organizers to collect, analyze, and act on attendee insights seamlessly.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-full w-fit border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>All 5 Internship Levels Fully Implemented</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-slate-400 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-slate-400 hover:text-white transition-colors">
                  Submit Feedback
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Internship Project Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Project Stack
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• React.js 19 & Vite</li>
              <li>• Tailwind CSS & Lucide Icons</li>
              <li>• Node.js & Express.js REST API</li>
              <li>• MongoDB & Mongoose ODM</li>
              <li>• JWT Auth & bcryptjs Security</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Sysslan IT Solutions Internship Project. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for FullStack Development Assessment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

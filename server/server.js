import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { User } from './models/User.js';
import { seedDatabase } from './scripts/seed.js';

// Load environment variables
dotenv.config();

// __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — only needed for dev (Vite dev server on :5173)
// In production both are on same origin so CORS isn't needed,
// but keeping it doesn't hurt.
// CORS: allow same-origin (production) or all (dev)
// CLIENT_URL env var on Render should be the deployed Render URL
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : true; // true = allow all (dev)

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Backend Welcome Route (Level 2 Requirement) ────────────────────────────
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Event Feedback Management System API – Sysslan IT Solutions Internship Project',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      events: '/api/events',
      feedback: '/api/feedback',
      stats: '/api/stats',
    },
    status: 'Server is healthy and active ✅',
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/stats', statsRoutes);

// ─── Serve React Frontend (Production) ──────────────────────────────────────
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// All non-API routes → serve React index.html (for client-side routing)
app.get('*', (req, res, next) => {
  // Skip if it's an API request
  if (req.path.startsWith('/api')) return next();

  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // dist not built yet — show friendly message
      res.status(200).send(`
        <html>
          <body style="font-family:sans-serif;padding:48px;text-align:center">
            <h2>🚀 Sysslan Feedback API is running on port ${PORT}</h2>
            <p>Frontend not built yet. Run <code>npm run build</code> inside <code>client/</code></p>
            <p>Or visit <a href="/api">/api</a> to confirm the backend is live.</p>
          </body>
        </html>
      `);
    }
  });
});

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  // Auto-seed on first run if DB is empty
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Empty database detected — auto-seeding initial data...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('Auto-seed check note:', err.message);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log(`║  🚀 Server running at  →  http://localhost:${PORT}          ║`);
    console.log(`║  📡 API endpoint       →  http://localhost:${PORT}/api       ║`);
    console.log(`║  🌐 Frontend served    →  http://localhost:${PORT}           ║`);
    console.log(`║  🛡️  Admin portal      →  http://localhost:${PORT}/admin      ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
  });
};

startServer();

export default app;

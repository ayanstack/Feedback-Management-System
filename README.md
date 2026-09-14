# FullStack Event Feedback Management System

An end-to-end, production-ready Event Feedback Management System developed for the **Sysslan IT Solutions** Full Stack Development Internship assessment.

The application allows event organizers to list events, collect structured attendee reviews with star ratings and categorized comments, and provides administrators with a secure JWT-authenticated analytics dashboard to manage events and evaluate audience satisfaction in real time.

---

## 🚀 Key Features

### 🌟 Public User Experience
- **Interactive Homepage**: Modern hero section, real-time platform statistics, featured events showcase, and 3-step feedback lifecycle workflow.
- **Events Directory**: Explore upcoming and completed events with live search, category filtering (Technology, Workshop, Hackathon, Design, Conference, Webinar), and detailed event modals.
- **Dynamic Feedback Form**: Submit verified attendee reviews with interactive 5-star ratings, category focus, detailed messages, and recommendation toggles.
- **Live Feedback Stream**: Instant display of submitted community feedback fetched directly from the database without page refresh.
- **Real-Time Client & Server Validation**: Robust validation preventing empty fields, invalid emails, or out-of-range ratings.

### 🛡️ Admin Experience & Security
- **JWT Authentication**: Secure login flow with bcrypt password hashing and token expiration.
- **Executive Dashboard Metrics**: Live KPI cards showing Total Events, Total Feedbacks, Average Star Rating, and Recommendation Percentage.
- **Event Management (CRUD)**: Create new events, update existing event details, and delete events with cascading feedback cleanup.
- **Feedback Management**: Filter reviews by specific event, filter by star ratings (1 to 5), search by attendee name or email, and view full modal reviews.
- **Analytics & Visualizations**: Star rating distribution bars and feedback category breakdown charts.
- **Protected Routing**: Unauthorized attempts to access `/admin/dashboard` automatically redirect to `/admin/login`.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React.js 19, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js, RESTful API architecture |
| **Database & ODM** | MongoDB, Mongoose, Standalone In-Memory Database Fallback |
| **Authentication & Security** | JSON Web Tokens (JWT), bcryptjs, CORS, dotenv |
| **Tooling & Build** | Postman-ready REST APIs, ESLint/Vite Build Pipeline |

---

## 📁 Project Structure

```text
Feedback Management System/
├── client/                     # Frontend React + Vite + Tailwind application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Modal, StarRating, ProtectedRoute)
│   │   ├── context/            # AuthContext for global JWT session state
│   │   ├── pages/              # Primary route pages (Home, Events, Feedback, AdminLogin, AdminDashboard)
│   │   ├── services/           # Central Axios HTTP service & API helper modules
│   │   ├── App.jsx             # React Router routing setup
│   │   ├── main.jsx            # Application root wrapper
│   │   └── index.css           # Tailwind CSS base and theme styles
│   ├── .env.example            # Client environment template
│   ├── index.html              # HTML entrypoint with metadata
│   ├── package.json            # Client dependencies
│   ├── tailwind.config.js      # Tailwind theme configuration
│   └── vite.config.js          # Vite build configuration
│
├── server/                     # Backend Express.js API
│   ├── config/
│   │   └── db.js               # Database connection manager with automatic fallback
│   ├── controllers/            # Request handlers (auth, events, feedback, stats)
│   ├── middleware/             # JWT auth guard and error handling middleware
│   ├── models/                 # Mongoose schemas (User, Event, Feedback)
│   ├── routes/                 # REST route endpoints (/api/auth, /api/events, /api/feedback, /api/stats)
│   ├── scripts/
│   │   └── seed.js             # Initial database seeder (admin user, sample events, reviews)
│   ├── utils/
│   │   └── memoryStore.js      # Resilient fallback storage adapter
│   ├── .env.example            # Server environment template
│   ├── package.json            # Server dependencies
│   └── server.js               # Express server entrypoint & route registration
│
├── .gitignore                  # Git ignore configuration
├── package.json                # Root convenience scripts
├── README.md                   # Comprehensive documentation
├── PROJECT_DEMO_SCRIPT.md      # 60-90s video presentation script
└── LINKEDIN_POST.md            # Professional LinkedIn submission draft
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/event_feedback_db
JWT_SECRET=sysslan_event_feedback_jwt_secret_key_2025
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔑 Admin Credentials (Pre-seeded)

The database automatically seeds an administrative user upon initial boot:

- **Email**: `admin@sysslan.com`
- **Password**: `admin123`
- *Note*: An **"Auto-Fill"** button is also built into the Admin Login page for fast testing and demonstration.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- *(Optional)* MongoDB running locally or a MongoDB Atlas URI in `server/.env`. If MongoDB is not active locally, the system runs automatically on its built-in in-memory database engine!

### Step 1: Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### Step 2: Start the Backend Server

```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### Step 3: Start the Frontend Client

```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 📡 API Endpoints

### 1. General & Welcome
- `GET /api` - Backend welcome route (Returns server status and available endpoints)

### 2. Authentication
- `POST /api/auth/login` - Authenticate admin credentials and receive JWT Bearer token
- `GET /api/auth/me` - *(Protected)* Retrieve current logged-in admin profile

### 3. Events
- `GET /api/events` - Retrieve all events with search (`?search=`), category filter (`?category=`), and rating stats
- `GET /api/events/:id` - Retrieve single event with full populated reviews
- `POST /api/events` - *(Protected Admin)* Create new event
- `PUT /api/events/:id` - *(Protected Admin)* Update existing event
- `DELETE /api/events/:id` - *(Protected Admin)* Delete event and associated reviews

### 4. Feedback
- `POST /api/feedback` - Submit new attendee feedback (validated)
- `GET /api/feedback` - Retrieve feedbacks with filtering by `?eventId=`, `?rating=`, or `?search=`
- `GET /api/feedback/:id` - *(Protected Admin)* Retrieve single feedback details
- `DELETE /api/feedback/:id` - *(Protected Admin)* Delete feedback entry

### 5. Analytics & Stats
- `GET /api/stats` - *(Protected Admin)* Aggregated counts, star distribution, and category statistics

---

## 🧪 Testing & Verification

All 5 Internship Levels have been verified end-to-end:

```bash
# Run production build test on frontend
cd client
npm run build
```

- ✅ **Level 1**: Homepage, navigation links, sample events directory, and feedback form.
- ✅ **Level 2**: Express server, welcome route (`GET /api`), POST feedback route, and feedback display on page.
- ✅ **Level 3**: MongoDB / Mongoose models, data storage, and data retrieval.
- ✅ **Level 4**: React frontend connected to Express API via central Axios service, success alerts, empty-field validation.
- ✅ **Level 5**: Responsive Tailwind UI, error handling, JWT auth admin dashboard, and production build check.

---

## 💡 Future Enhancements
- Export feedback reports to downloadable PDF / Excel spreadsheets.
- QR Code generation for physical event banners to direct attendees straight to pre-filled feedback forms.
- Sentiment analysis on attendee feedback messages using NLP.

---

## 👨‍💻 Author
Developed for the **Sysslan IT Solutions** Full Stack Development Internship Assessment.

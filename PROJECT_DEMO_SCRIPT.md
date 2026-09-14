# Project Demo Video Script (60–90 Seconds)

**Project Title**: FullStack Event Feedback Management System  
**Organization**: Sysslan IT Solutions Internship Assessment  
**Format**: Screen recording with voiceover (60 to 90 seconds)

---

## ⏱️ Video Breakdown & Walkthrough

### 1. Introduction (0:00 – 0:15)
- **Screen**: Start on the Homepage (`http://localhost:5173/`).
- **Voiceover**: 
  > *"Hello everyone! Today I am presenting my FullStack Event Feedback Management System developed for the Sysslan IT Solutions internship project. This platform bridges event organizers and attendees by allowing seamless review submissions and real-time administrative analytics."*
- **Action**: Highlight the clean hero banner, platform metric counters (Registered Events, Submitted Reviews), and responsive navigation bar.

---

### 2. Events Directory & Live Search (0:15 – 0:30)
- **Screen**: Click `"Events"` to open the Events directory (`http://localhost:5173/events`).
- **Voiceover**: 
  > *"The public frontend is built with React 19, Vite, and styled with Tailwind CSS. On the Events page, users can explore workshops, conferences, and hackathons fetched dynamically from our Express backend. Attendees can filter by category or search by speaker and location."*
- **Action**: Type a keyword in the search bar or filter by "Workshop", then click `"Give Feedback"` on an event card.

---

### 3. Feedback Submission & Live MongoDB Stream (0:30 – 0:50)
- **Screen**: Feedback Page (`http://localhost:5173/feedback?eventId=...`).
- **Voiceover**: 
  > *"Clicking 'Give Feedback' pre-selects the event in our feedback form. We enforce client and server-side validation for email format, required fields, and 1-to-5 star ratings. When submitted, an Axios request sends the review to our Node.js and Express REST API, saving it into MongoDB with full Mongoose schema relationships."*
- **Action**: 
  - Fill out: Name: *Aarav Sharma*, Email: *aarav@example.com*, Rating: *5 Stars*, Message: *"Outstanding masterclass with high-value takeaways!"*.
  - Click `"Submit Feedback"`.
  - Point out the instant green success alert and scroll down to highlight the newly submitted review appearing immediately in the **Live MongoDB Feed**.

---

### 4. JWT Admin Portal & Analytics Dashboard (0:50 – 1:15)
- **Screen**: Click `"Admin Login"` (`http://localhost:5173/admin/login`), auto-fill credentials, and log into the **Admin Dashboard** (`http://localhost:5173/admin/dashboard`).
- **Voiceover**: 
  > *"For organizers, we implemented secure JWT authentication using bcryptjs password hashing. The protected Admin Dashboard displays high-level KPIs including total events, total reviews, and average satisfaction ratings."*
- **Action**:
  - Show the **Events Management Tab** (demonstrate creating/editing an event).
  - Switch to the **Submitted Feedback Tab** (demonstrate filtering reviews by event and rating).
  - Switch to the **Analytics & Insights Tab** (highlight the star rating distribution and category breakdown bars).

---

### 5. Conclusion & Wrap-up (1:15 – 1:30)
- **Screen**: Click `"Logout"` to show session revocation, returning cleanly to the login screen.
- **Voiceover**: 
  > *"This concludes the demonstration of all 5 levels of the Sysslan Full Stack Development internship task. Thank you Sysslan IT Solutions for this wonderful learning opportunity!"*

---

## 🎯 Key Architectural Points to Emphasize in Interview
1. **Frontend**: Modular React 19 architecture, React Router DOM 7, Tailwind CSS design system, and central Axios service with JWT interceptors.
2. **Backend**: Express.js REST API with modular controllers, custom error middleware, and JWT protection.
3. **Database**: MongoDB with Mongoose referencing schemas (`Event`, `Feedback`, `User`).
4. **Resilience**: Zero-crash startup with automatic database fallback and seed engine.

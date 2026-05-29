# Coursify Web

## Project Description
Coursify Web is the browser-based frontend of the Coursify platform — a Senior High School course recommendation system. It provides students with a full psychometric assessment experience and personalized ML-powered course recommendations, while also offering dedicated dashboards for admins and superadmins to manage users and monitor platform analytics.

The web version supports all three user roles: **student**, **admin**, and **superadmin**. It communicates with the shared Coursify FastAPI backend via REST API.

## Features

### Student
- **User Authentication** — Registration with email OTP verification, login, forgot password with reset code flow, and JWT-based session management
- **RIASEC Assessment** — Holland Interest Inventory with 36 questions across 6 personality types (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
- **Big Five Personality Assessment** — OCEAN model profiling with 25 questions across 5 traits including reverse-scored items
- **Aptitude Assessment** — 12-question subject tests across Math, Science, English, and Abstract Reasoning with easy / medium / hard difficulty tiers
- **ML-Powered Course Recommendations** — Top 5 ranked college course suggestions with confidence scores
- **AI Profile Summary** — Google Gemini generates a personalized counselor-style summary based on assessment results
- **Dashboard** — Full assessment profile with RIASEC bar chart, Big Five trait cards, aptitude scores, top recommended courses, and quick stats panel
- **Assessment History** — All past attempts with expandable score breakdowns per attempt (courses, RIASEC, Big Five, aptitude tabs)
- **Course Explorer** — Browse and filter college courses by strand and category
- **Profile Management** — Edit username, email, grade level, and academic strand

### Admin
- **Analytics Dashboard** — Platform statistics including total users, new registrations, active/inactive accounts, registration trend chart, strand breakdown, grade level breakdown, and role distribution; filterable by 7-day, 30-day, or all-time range

### Superadmin
- **User Management** — Paginated, searchable, and filterable user table with role assignment and account activation/deactivation
- **Audit Log** — Timestamped record of all admin-initiated role and status changes
- **CSV Export** — Download all user data as a CSV file
- **Role-Based Access Control** — Three-tier access enforced via protected routes on the frontend

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React.js (Create React App) |
| Routing | React Router v6 |
| Charts | Recharts |
| Icons | React Icons |
| Local Storage | localStorage |
| Styling | Plain CSS (Nunito + Sora fonts via Google Fonts) |
| Environment | .env via REACT_APP_* variables |

## System Architecture

````
Coursify Web (React.js)
        │
        │  localStorage
        │  ┌─────────────────────────────────┐
        │  │  token, coursify_user,           │
        │  │  coursify_role, coursify_        │
        │  │  assessment_progress             │
        │  └─────────────────────────────────┘
        │
        │  Protected Routes
        │  ┌──────────────────────────────────────────┐
        │  │  / (Login)                               │
        │  │  /register                               │
        │  │  /dashboard              → role: user    │
        │  │  /assessment             → role: user    │
        │  │  /courses                → role: user    │
        │  │  /profile                → role: user    │
        │  │  /admin/dashboard        → role: admin+  │
        │  │  /superadmin/dashboard   → role: superadmin│
        │  └──────────────────────────────────────────┘
        │
        │  REST API calls (JWT Bearer token)
        ▼
Coursify FastAPI Backend
````

The `ProtectedRoute` component runs an auth check via `useEffect` after mount — it reads `token` and `coursify_role` from localStorage, sets an `allowed` flag, then either renders the child component or redirects. Unauthenticated users are sent to `/` and authenticated users accessing a restricted role are sent to `/dashboard`.

## Installation & Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn
- Coursify backend running locally or deployed (see backend README)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/coursify-web.git
cd coursify-web
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure the API
Create a `.env` file in the project root:
```env
REACT_APP_API_URL=http://localhost:8000
```
Replace the value with your deployed backend URL if not running locally.

### 4. Start the development server
```bash
npm start
```
The app will be available at `http://localhost:3000/coursify-web`

### 5. Build for production
```bash
npm run build
```
The optimized build output will be in the `build/` folder, ready for static hosting.

> **Note:** The `basename` is set to `/coursify-web` in the router. If you deploy to a different path or domain root, update the `basename` prop in `App.js` accordingly.

## Test Accounts

**User**
| Email | Password |
|---|---|
| yunasilva01@gmail.com | Genesis1:1 |
| anyachan.maki@gmail.com | Genesis1:1 |

**Superadmin**
| Email | Password |
|---|---|
| seanfinn830@gmail.com | Genesis1:1 |

## Team Members
• Pailanan, Joana Mae B.

•Lao, Dwight Ashley

## Known Limitations
- **Admin and superadmin roles are web-only** — The mobile version of Coursify only supports the student role. Logging in with admin or superadmin credentials on the mobile app will not grant access to any admin features
- **Email delivery in deployment** — OTP verification and password reset emails use Gmail SMTP which requires outbound ports 465 or 587. Most cloud hosting providers block these ports, causing connection timeouts in production. Locally this works fine since the machine can connect directly. The proper solution for production is to replace Gmail SMTP with a dedicated email API service such as SendGrid or Mailgun
- **Assessment results not editable** — Once an assessment is submitted it is permanently stored; there is no way to retake or delete a specific attempt from the UI
- **No real-time updates** — The analytics dashboard and user management table require a manual page refresh to reflect the latest data

## Deployment Link
https://coursify-web-mzls.onrender.com/

## Screenshots

### Student
<img width="1920" height="1080" alt="Screenshot (7)" src="https://github.com/user-attachments/assets/b21e9f65-5a63-4a73-bfbb-339b59f64523" />
<img width="1920" height="1080" alt="Screenshot (6)" src="https://github.com/user-attachments/assets/1da1ab12-2308-42f9-94b4-b8821600c9d3" />
<img width="1920" height="1080" alt="Screenshot (5)" src="https://github.com/user-attachments/assets/4d3c3480-0587-4ae8-95a1-89856206c461" />
<img width="1920" height="1080" alt="Screenshot (4)" src="https://github.com/user-attachments/assets/0edc5e9a-8be6-42f4-a644-98e45e9d30ce" />
<img width="1920" height="1080" alt="Screenshot (3)" src="https://github.com/user-attachments/assets/3beff505-58bd-4821-bcbc-85fa8f32edda" />
<img width="1920" height="1080" alt="Screenshot (10)" src="https://github.com/user-attachments/assets/aa1a410f-4b2c-4512-a0fb-f6b64a318009" />
<img width="1920" height="1080" alt="Screenshot (9)" src="https://github.com/user-attachments/assets/6911caa8-3be4-42f6-a70b-097692d8d401" />
<img width="1920" height="1080" alt="Screenshot (8)" src="https://github.com/user-attachments/assets/66894455-8c8c-4ffb-8c96-21920c85707e" />

### Admin & Superadmin
<img width="1920" height="1080" alt="Screenshot (11)" src="https://github.com/user-attachments/assets/0ef782e3-292d-47d7-a508-41c82f1d6efa" />
<img width="1920" height="1080" alt="Screenshot (14)" src="https://github.com/user-attachments/assets/c94969d8-b3c6-4c95-b301-f4b696deefd6" />
<img width="1920" height="1080" alt="Screenshot (13)" src="https://github.com/user-attachments/assets/79861b3c-2342-4710-9849-9a6f0b08b51d" />
<img width="1920" height="1080" alt="Screenshot (12)" src="https://github.com/user-attachments/assets/5c498384-ef2c-40a1-bd7e-7055efad6118" />

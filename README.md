# Coursify Web

## Project Description
Coursify Web is the browser-based frontend of the Coursify platform — a Senior High School career course recommendation system. It provides students with a full psychometric assessment experience and personalized ML-powered course recommendations, while also offering dedicated dashboards for superadmins to manage users and monitor platform analytics.

The web version supports all three user roles: **student**, and **superadmin**. It communicates with the shared Coursify FastAPI backend via REST API.

## Features

### Student
- **User Authentication** — Registration with email OTP verification, login, forgot password with reset code flow, and JWT-based session management
- **RIASEC Assessment** — Holland Interest Inventory with 36 questions across 6 personality types (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
- **Aptitude Assessment** — 12-question subject tests across Math, Science, English, Programming and Abstract Reasoning with easy / medium / hard difficulty tiers
- **ML-Powered Course Recommendations** — Top 5 ranked college course suggestions with confidence scores
- **AI Profile Summary** — Google Gemini generates a personalized counselor-style summary based on assessment results
- **Dashboard** — Full assessment profile with RIASEC bar chart, aptitude scores, top recommended courses, and quick stats panel
- **Assessment History** — All past attempts with expandable score breakdowns per attempt (courses, RIASEC, Big Five, aptitude tabs)
- **About Model** — Explains what the model used based from
- **Profile Management** — Edit username, email, grade level, and academic strand


### Superadmin
- **Analytics Dashboard** — Platform statistics including total users, new registrations, active/inactive accounts, registration trend chart, strand breakdown, grade level breakdown, and role distribution; filterable by 7-day, 30-day, or all-time range
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
        │  │  /model                → role: user    │
        │  │  /profile                → role: user    │
        │  │  /superadmin/dashboard   → role: superadmin │
        │  │ 
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

**Superadmin**
| Email | Password |
|---|---|
| seanfinn830@gmail.com | Genesis1:1 |


## Known Limitations
- **Registration OTP** — OTP verification and password reset emails are suspended due to the limitation that requires outbound ports 465 or 587 on render when deployed.
- **Recommneded Career Courses** — Following the dataset we've used, the recommended career course labels only has 6:
💼 Accountant
📊 Data Scientist
🩺 Doctor
🚀 Entrepreneur
💻 Software Engineer
📚 Teacher

## Deployment Link
https://coursify-elective.onrender.com/

## Lab Activity
**Lab Activity 2** extended the recommendation system by introducing advanced supervised learning techniques capable of improving prediction quality and deployment readiness.
Among all evaluated models, **Random Forest** emerged as the optimal solution because it:


-achieved high accuracy


-handled complex student data effectively


-remained interpretable


-produced stable predictions


-supported efficient real-time deployment


For these reasons, **Random Forest** became the final machine learning model integrated into the course recommendation system.



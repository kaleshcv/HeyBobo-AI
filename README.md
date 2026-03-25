# HeyBobo AI — Intelligent Life Management Platform

> AI-powered super app for education, health, fitness, nutrition, shopping, grooming, and more — all orchestrated by a central AI Brain.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + MUI v5 + Zustand |
| Backend | NestJS + TypeScript |
| Database | MongoDB (Mongoose) |
| Cache / Queues | Redis + BullMQ |
| AI Engine | Google Gemini 1.5 Flash |
| Video | Mux |
| Auth | JWT (access + refresh) + Google OAuth |
| Docs | Swagger at `/api/v1/docs` |
| Deployment | Docker · Nginx · Linode VPS |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- MongoDB running locally (or MongoDB Atlas URI)
- Redis running locally (or Redis Cloud)
- API keys: Gemini, Mux, Google OAuth

### 1. Clone & configure

```bash
# Copy env template and fill in values
cp .env.example .env
# Edit .env with your keys

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env (pre-filled from root .env)

# Frontend env
cp frontend/.env.example frontend/.env
```

### 2. Start Backend

```bash
cd backend
npm install
npm run start:dev
# API runs at http://localhost:3001
# Swagger docs at http://localhost:3001/api/v1/docs
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## Docker (Full Stack)

```bash
# Copy and fill env
cp .env.example .env

# Start everything (MongoDB + Redis + Backend + Frontend)
docker-compose up -d

# App at http://localhost:80
# API at http://localhost:3001
```

---

## Project Structure

```
HeyBobo-AI/
├── backend/                        # NestJS API
│   └── src/
│       ├── main.ts                 # App bootstrap, CORS, rate limiting
│       ├── app.module.ts           # Root module (Mongo, Redis, Bull, all features)
│       ├── config/
│       │   └── configuration.ts    # Env-based config (DB, JWT, Redis, AWS, etc.)
│       ├── common/
│       │   ├── decorators/         # @Public, @Roles, @CurrentUser
│       │   ├── filters/            # Global exception filters
│       │   ├── guards/             # JWT auth, refresh token, roles
│       │   ├── interceptors/       # Logging, response transform
│       │   └── pipes/              # ObjectId validation
│       └── modules/
│           ├── auth/               # JWT + OAuth + refresh tokens
│           ├── users/              # Profiles, dashboard, preferences
│           ├── education/          # Courses, sections, lessons, quizzes, assignments, reviews, enrollments, categories
│           ├── media/              # Mux video integration
│           ├── ai/                 # Gemini AI tutor + document generation
│           ├── notifications/      # In-app + push + email
│           ├── certificates/       # PDF generation + verify
│           ├── analytics/          # Event tracking + platform stats
│           ├── admin/              # User & course management
│           ├── fitness/            # Workout sessions, daily metrics, goals
│           ├── dietary/            # Meals, nutrition, supplements, meal plans, grocery
│           └── grooming/           # Recommendations, visual analysis, profiles
│
├── frontend/                       # React 18 + Vite SPA
│   └── src/
│       ├── main.tsx                # App entry
│       ├── App.tsx                 # Root component with providers
│       ├── pages/
│       │   ├── public/             # Landing, course catalog, about
│       │   ├── auth/               # Login, register, OAuth, password reset
│       │   ├── student/            # Dashboard, player, quiz, certificates
│       │   ├── teacher/            # Course builder, analytics, students
│       │   ├── admin/              # Users, courses, analytics management
│       │   └── app/                # Main app pages
│       │       ├── AIBrainPage     # Central AI dashboard + Life View toggle
│       │       ├── SimpleLifeDashboard  # Life View — unified dashboard from all stores
│       │       ├── ai-tutor/       # Textbooks, Study Plans, Quizzes, Progress, Chat
│       │       ├── dietary/        # Dashboard, Meal Log, Nutrition, Meal Planner, Grocery
│       │       ├── grooming/       # Dashboard, Recommendations, Visual Analysis
│       │       └── shopping/       # Lists, Campus Marketplace, Budget, Orders
│       ├── components/
│       │   ├── common/             # BrainChatbot, ErrorBoundary, CourseCard, etc.
│       │   ├── layout/             # AppShell (dual sidebar), Header, Footer
│       │   └── ui/                 # Shared UI components
│       ├── hooks/                  # React Query hooks (courses, AI, quiz, enrollment, etc.)
│       ├── store/                  # 20 Zustand stores (persisted)
│       │   ├── aiBrainStore        # AI dashboard data: schedule, insights, alerts, recommendations
│       │   ├── wearablesStore      # BLE devices, health readings (28 metric types)
│       │   ├── activityTrackingStore # Daily metrics, goals, workouts
│       │   ├── workoutSystemStore  # Exercise library, workout plans, logs
│       │   ├── liveWorkoutStore    # Real-time workout sessions
│       │   ├── courseStore          # Courses, video progress, quiz progress
│       │   ├── shoppingListStore   # Smart shopping lists from all modules
│       │   ├── injuryStore         # Injury tracking, rehab programs, pain logs
│       │   ├── dietaryProfileStore # Calorie/macro targets, diet type, allergies
│       │   ├── fitnessProfileStore # Fitness onboarding profile
│       │   ├── budgetStore         # Budget tracking, expense categories
│       │   ├── groupStore          # Study groups, discussions
│       │   ├── meetingStore        # Virtual meetings
│       │   ├── campusMarketplaceStore # Marketplace listings
│       │   ├── ordersReviewsStore  # Order tracking, reviews
│       │   ├── aiTutorStore        # AI tutor conversations, study plans
│       │   ├── authStore           # Auth state
│       │   └── uiStore             # UI preferences (sidebar, chat toggle)
│       ├── lib/
│       │   ├── api.ts              # Axios client + interceptors + all API modules
│       │   ├── gemini.ts           # Gemini AI functions (tutor, dietary, grooming, brain)
│       │   └── validators.ts       # Input validation helpers
│       ├── router/                 # React Router + protected/role routes
│       └── types/                  # TypeScript type definitions
│
└── docker-compose.yml              # Full stack: MongoDB + Redis + Backend + Frontend
```

---

## Architecture

The app uses a **dual-sidebar layout** (AppShell):

- **Left sidebar** — 7 main modules (AI Brain, Education, Health, Fitness, Dietary, Shopping, Grooming)
- **Right sidebar** — Context-aware sub-modules that change based on the active module
- **BrainChatbot** — Floating AI chat assistant (toggleable from left sidebar)
- Both sidebars start collapsed by default and expand on click

### State Management

All client-side state is managed through **20 Zustand stores** with localStorage persistence. The `useBrainData()` hook aggregates data from every store into a single `AIBrainInput` object for AI analysis.

### AI Brain & Life View

The AI Brain page (`/app/ai-brain`) is the central hub:

- **AI Brain mode** — AI-generated dashboard with priorities, schedule, alerts, module insights, cross-module insights, and smart recommendations
- **Life View mode** (default) — Real-time dashboard pulling live data from all Zustand stores:
  - Header: streak days, XP/level (computed from lectures, quizzes, workouts, live sessions), Life Score
  - Vitals: wearable readings (sleep, stress, recovery) + activity metrics
  - Needs Attention: highest-severity undismissed brain alert
  - Today's Plan: AI-generated schedule
  - Suggested for You: unified suggestions from health, fitness, injury, education, shopping, and AI recommendations
  - Daily Missions: AI recommendations as gamified tasks
  - Bobo Says: cross-module AI insights
  - Module Scores: per-module score circles from AI analysis

---

## Modules & Features

### 0. AI Brain (Central Hub)
| Feature | Description |
|---------|-------------|
| **AI Brain Dashboard** | AI-analyzed priorities, schedule, alerts, module insights, recommendations |
| **Life View Dashboard** | Real-time data aggregation from all 20 stores — zero static data |
| **Cross-Module Insights** | AI-detected patterns across education, fitness, health, dietary |
| **Smart Recommendations** | Typed: do-now, recover, learn, buy, plan, monitor — with navigation |
| **BrainChatbot** | Floating AI assistant with module-aware context |

### 1. Education

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Enrolled courses, progress, and recommendations |
| **Courses** | Browse, enroll, and learn from structured courses |
| **AI Tutor** | 5 tabs: **Textbooks**, **Study Plans**, **Quizzes**, **Progress**, **Chat** |
| **Groups** | Study groups with discussions, assignments, meetings |
| **Meetings** | Virtual meetings and live sessions |
| **Course Player** | Video player with progress tracking and bookmarks |

### 2. Health

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Health overview with metrics summary and trends |
| **Health Profile** | Personal health profile, vitals, medical info |
| **Activity Tracking** | Manual entry + auto-sync (2 tabs) |
| **Wearables** | BLE device pairing + simulated devices (28 health metric types) |
| **Injury Tracker** | Injury logging, rehab programs, pain logs, recovery milestones |

### 3. Fitness

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Workout stats, goals progress, streak tracking |
| **Workouts** | 4 tabs: **Exercise Library** (26 exercises), **Workout Plans** (4 presets), **Custom Workouts**, **Live Workout** (pose detection) |

### 4. Dietary

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Daily nutrition, calorie tracking, macro breakdown |
| **Meal Log** | Log meals with AI photo analysis (filter by meal type) |
| **Nutrition Tracker** | 3 tabs: **Dashboard**, **Food Diary**, **Supplements** |
| **Meal Planner** | AI meal plans: **Meal Schedule**, **Prep Guide**, **Shopping List**, **AI Insights** |
| **Grocery & Food** | Smart grocery lists: **My Lists**, **Shopping View**, **Nutrition Summary** |

### 5. Shopping

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Shopping overview with pending items across all lists |
| **Shopping Lists** | Smart lists auto-populated from dietary, fitness, injury modules |
| **Campus Marketplace** | Buy/sell within your campus community |
| **Budget & Expenses** | Budget tracking with spending by category |
| **Orders & Reviews** | Order history and product reviews |

### 6. Grooming & Lifestyle

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Overview with recent recommendations and analysis |
| **Recommendations** | AI advice: **Skincare**, **Haircare**, **Outfit Styling** |
| **Visual Analysis** | Photo AI: **Skin**, **Hair & Face**, **Body & Style**, **Progress**, **Virtual Try-On** |

---

## API Overview

### Auth
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/google
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

### Courses & Learning
```
GET    /api/v1/courses              # Browse with filters
GET    /api/v1/courses/:slug        # Course detail
POST   /api/v1/courses              # Create (teacher)
PATCH  /api/v1/courses/:id          # Update (teacher)
POST   /api/v1/courses/:id/enroll   # Enroll (student)
GET    /api/v1/courses/:id/learn    # Full course content
POST   /api/v1/lessons/:id/progress # Update progress
POST   /api/v1/lessons/:id/bookmark # Add bookmark
```

### AI Tutor
```
POST /api/v1/ai/tutor/chat            # Chat message
POST /api/v1/ai/lesson/summarize      # Summarize lesson
POST /api/v1/ai/lesson/revision-notes # Generate notes
```

### Quizzes
```
GET  /api/v1/quizzes/:id         # Quiz info
POST /api/v1/quizzes/:id/start   # Start attempt
POST /api/v1/quizzes/:id/submit  # Submit answers
```

### Fitness
```
GET    /api/v1/fitness/sessions          # List workout sessions
POST   /api/v1/fitness/sessions          # Create workout session
POST   /api/v1/fitness/sessions/bulk     # Bulk sync sessions
GET    /api/v1/fitness/daily-metrics     # Get daily metrics
POST   /api/v1/fitness/daily-metrics     # Log daily metrics
GET    /api/v1/fitness/profile           # Get fitness profile
PUT    /api/v1/fitness/profile           # Update fitness profile
GET    /api/v1/fitness/goals             # List goals
POST   /api/v1/fitness/goals             # Create goal
GET    /api/v1/fitness/goals/:id/progress # Goal progress
GET    /api/v1/fitness/stats             # Fitness statistics
```

### Dietary
```
GET    /api/v1/dietary/meals             # List meals
POST   /api/v1/dietary/meals             # Log a meal
POST   /api/v1/dietary/meals/:id/photo   # Upload meal photo
DELETE /api/v1/dietary/meals/:id         # Delete meal
GET    /api/v1/dietary/daily-nutrition    # Daily nutrition summary
GET    /api/v1/dietary/profile           # Get dietary profile
PUT    /api/v1/dietary/profile           # Update dietary profile
GET    /api/v1/dietary/goals             # List dietary goals
POST   /api/v1/dietary/goals             # Create dietary goal
GET    /api/v1/dietary/supplements       # List supplements
POST   /api/v1/dietary/supplements       # Add supplement
PATCH  /api/v1/dietary/supplements/:id/toggle  # Toggle supplement
GET    /api/v1/dietary/meal-plans        # List meal plans
POST   /api/v1/dietary/meal-plans        # Create meal plan
PATCH  /api/v1/dietary/meal-plans/:id/activate # Activate plan
GET    /api/v1/dietary/grocery-lists      # List grocery lists
POST   /api/v1/dietary/grocery-lists      # Create grocery list
PATCH  /api/v1/dietary/grocery-lists/:id/items/:itemId/toggle # Toggle item
GET    /api/v1/dietary/stats             # Dietary statistics
```

### Grooming & Lifestyle
```
GET    /api/v1/grooming/profile              # Get grooming profile
PUT    /api/v1/grooming/profile              # Update grooming profile
GET    /api/v1/grooming/recommendations      # List recommendations
POST   /api/v1/grooming/recommendations      # Generate recommendation
GET    /api/v1/grooming/recommendations/latest/:type # Latest by type
PATCH  /api/v1/grooming/recommendations/:id/toggle-save # Toggle save
GET    /api/v1/grooming/visual-analysis      # List analyses
POST   /api/v1/grooming/visual-analysis      # Create analysis
POST   /api/v1/grooming/analyze/upload       # Upload photo for analysis
GET    /api/v1/grooming/visual-analysis/progress/:type # Progress by type
```

> Full docs at `/api/v1/docs` (Swagger UI)

---

## User Roles

| Role | Description |
|------|-------------|
| `student` | Default. Can enroll, learn, take quizzes |
| `teacher` | Can create and manage courses |
| `creator` | Like teacher with additional content privileges |
| `moderator` | Can moderate content and reviews |
| `college_admin` | Admin for a specific college/institution |
| `admin` | Full platform access |

---

## Environment Variables

See `.env.example` for all required variables with comments.

**Required for core functionality:**
- `MONGODB_URI` — MongoDB connection string
- `REDIS_HOST` / `REDIS_PORT` — Redis connection
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — Generate with `crypto.randomBytes(64).toString('hex')`
- `GEMINI_API_KEY` — From [Google AI Studio](https://aistudio.google.com)

**Required for video:**
- `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` — From [Mux Dashboard](https://dashboard.mux.com)

**Required for Google login:**
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — From [Google Cloud Console](https://console.cloud.google.com)

---

## Roadmap

### Completed
- [x] AI Brain — central intelligence hub with Life View dashboard
- [x] Life View — real-time unified dashboard synced from all 20 Zustand stores
- [x] Cross-module suggestions (health, fitness, injury, education, shopping, AI)
- [x] Education module (courses, lessons, quizzes, assignments, certificates)
- [x] AI Tutor (chat, study plans, quiz generation, textbooks)
- [x] Health module (vitals, activity tracking, wearable sync, injury tracker)
- [x] Fitness module (workout plans, exercise library, live workouts with pose detection)
- [x] Dietary module (meal logging, AI photo analysis, nutrition tracking, meal planner, grocery)
- [x] Shopping module (smart lists, campus marketplace, budget tracking, orders)
- [x] Grooming & Lifestyle module (AI recommendations, visual analysis, virtual try-on)
- [x] BrainChatbot — floating AI assistant with module-aware context
- [x] Dual collapsible sidebar layout (left modules + right sub-modules)
- [x] 20 persisted Zustand stores with cross-module data aggregation
- [x] Client-side error logging

### Planned
- [ ] Community (feeds, mentors)
- [ ] Competitions & leaderboards
- [ ] Live classes (video conferencing)
- [ ] Mobile app (Flutter)
- [ ] Push notifications
- [ ] Microservices migration (AI, Notifications, Media)

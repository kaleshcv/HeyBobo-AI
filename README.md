# EduPlatform — Full-Stack Education Super App

> Phase 1: Education Module · Built for scale · Modular monolith architecture

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| Backend | NestJS + TypeScript |
| Database | MongoDB (Mongoose) |
| Cache / Queues | Redis + BullMQ |
| AI | Google Gemini 1.5 Flash |
| Video | Mux |
| Auth | JWT (access + refresh) + Google OAuth |
| Docs | Swagger at `/api/v1/docs` |

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
eduplatform/
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
│       │   ├── logger/             # Winston logger config
│       │   ├── pipes/              # ObjectId validation
│       │   └── storage/            # Multer config for uploads
│       └── modules/
│           ├── auth/               # JWT + OAuth + refresh tokens
│           ├── users/              # Profiles, dashboard, preferences
│           ├── education/          # Core education module
│           │   ├── categories/
│           │   ├── courses/
│           │   ├── sections/
│           │   ├── lessons/
│           │   ├── enrollments/
│           │   ├── quizzes/
│           │   ├── assignments/
│           │   └── reviews/
│           ├── media/              # Mux video integration
│           ├── ai/                 # Gemini AI tutor + documents
│           ├── notifications/      # In-app + push + email
│           ├── certificates/       # PDF generation + verify
│           ├── analytics/          # Event tracking + platform stats
│           ├── admin/              # User & course management
│           ├── fitness/            # Workout sessions, daily metrics, goals
│           ├── dietary/            # Meal logs, nutrition, supplements, meal plans, grocery lists
│           └── grooming/           # Recommendations, visual analysis, profiles
│
├── frontend/                       # React 18 + Vite SPA
│   └── src/
│       ├── main.tsx                # App entry + error logger init
│       ├── App.tsx                 # Root component with providers
│       ├── theme.ts                # MUI theme configuration
│       ├── pages/
│       │   ├── public/             # Landing, course catalog, about
│       │   ├── auth/               # Login, register, OAuth, password reset
│       │   ├── student/            # Dashboard, player, quiz, certificates
│       │   ├── teacher/            # Course builder, analytics, students
│       │   ├── admin/              # Users, courses, analytics management
│       │   └── app/                # Main app pages
│       │       ├── ai-tutor/       # Chat, quiz gen, study plans, textbooks
│       │       ├── dietary/        # Meal log, nutrition tracker, meal planner, grocery
│       │       └── grooming/       # Dashboard, recommendations, visual analysis
│       ├── components/
│       │   ├── common/             # ErrorBoundary, CourseCard, VideoPlayer, SearchBar
│       │   ├── layout/             # AppShell, Header, Sidebar, Footer, role layouts
│       │   └── ui/                 # Button, Card, Modal, Input, etc.
│       ├── hooks/                  # React Query hooks (courses, AI, quiz, enrollment, etc.)
│       ├── store/                  # Zustand stores (auth, courses, fitness, dietary, AI tutor)
│       ├── lib/
│       │   ├── api.ts              # Axios client + interceptors + all API modules
│       │   ├── gemini.ts           # Google Gemini AI functions (tutor, dietary, grooming)
│       │   ├── errorLogger.ts      # Client-side error logging (localStorage + console)
│       │   ├── bleService.ts       # Bluetooth LE wearable service
│       │   ├── queryClient.ts      # React Query client config
│       │   ├── utils.ts            # Shared utilities
│       │   └── validators.ts       # Input validation helpers
│       ├── router/                 # React Router config + protected/role routes
│       └── types/                  # TypeScript type definitions
│
└── docker-compose.yml              # Full stack: MongoDB + Redis + Backend + Frontend
```

---

## Modules & Features

The app is organized into **5 main modules**, each accessible from the left sidebar. Each module has its own sub-pages accessible from a right-side contextual menu.

### 1. Education

Core learning management system with courses, lessons, quizzes, and AI-powered tutoring.

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Overview of enrolled courses, progress, and recommendations |
| **Courses** | Browse, enroll, and learn from structured courses |
| **AI Tutor** | AI-powered learning assistant with 5 tabs: **Textbooks**, **Study Plans**, **Quizzes**, **Progress**, **Chat** |
| **Groups** | Study groups and collaborative learning |
| **Meetings** | Virtual meetings and live sessions |
| **Course Player** | Full lesson player with video, progress tracking, bookmarks |

### 2. Health

Health monitoring, vitals tracking, and wearable device integration.

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Health overview with metrics summary and trends |
| **Health Profile** | Personal health profile, vitals, and medical info |
| **Activity Tracking** | Manual entry and auto-sync activity data (2 tabs: **Manual Entry**, **Auto Sync**) |
| **Wearables** | Connect fitness devices (2 tabs: **Bluetooth Real Device**, **Simulated Device**) |

### 3. Fitness

Workout planning, exercise tracking, and live workout sessions.

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Fitness overview with workout stats and goals progress |
| **Workouts** | Full workout system with 4 tabs: **Exercise Library**, **Workout Plans**, **Custom Workouts**, **Live Workout** |

### 4. Dietary

Complete nutrition management with AI-powered meal planning and grocery list generation.

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Daily nutrition summary, calorie tracking, macro breakdown |
| **Meal Log** | Log meals with AI photo analysis (filter by: All, Breakfast, Lunch, Dinner, Snack) |
| **Nutrition Tracker** | Detailed tracking with 3 tabs: **Dashboard**, **Food Diary**, **Supplements** |
| **Meal Planner** | AI-generated meal plans with tabs: **Meal Schedule**, **Prep Guide**, **Shopping List**, **AI Insights** |
| **Dietary Profile** | Allergies, preferences, dietary restrictions |
| **Goals** | Calorie, macro, and micronutrient goal management |
| **Grocery & Food** | Smart grocery lists with tabs: **My Lists**, **Shopping View**, **Nutrition Summary** |

### 5. Grooming & Lifestyle

AI-powered personal styling, skincare analysis, and visual recommendations.

| Sub-Module | Description |
|------------|-------------|
| **Dashboard** | Grooming overview with recent recommendations and analysis results |
| **Recommendations** | AI-generated advice with 3 tabs: **Skincare**, **Haircare**, **Outfit Styling** |
| **Visual Analysis** | Photo-based AI analysis with 5 tabs: **Skin Analysis**, **Hair & Face**, **Body & Style**, **Progress Tracking**, **Virtual Try-On** |

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
- [x] Education module (courses, lessons, quizzes, assignments, certificates)
- [x] AI Tutor (chat, study plans, quiz generation, textbooks)
- [x] Health module (vitals, activity tracking, wearable sync)
- [x] Fitness module (workout plans, exercise library, live workouts)
- [x] Dietary module (meal logging, AI photo analysis, nutrition tracking, meal planner, grocery lists)
- [x] Grooming & Lifestyle module (AI recommendations, visual analysis, virtual try-on)
- [x] Client-side error logging across all API/AI calls

### Planned
- [ ] Community (groups, feeds, mentors)
- [ ] Competitions & leaderboards
- [ ] Live classes (video conferencing)
- [ ] Mobile app (Flutter)
- [ ] NFT certificates
- [ ] Microservices migration (AI, Notifications, Media)

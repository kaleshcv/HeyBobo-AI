# HeyBobo AI — Software Testing Agent & Functionality Test Plan

> **Platform:** HeyBobo AI (EduPlatform)  
> **Backend:** NestJS + MongoDB  
> **Test Frameworks:** Jest + Supertest (E2E) · Axios (Standalone Runner)  
> **Date:** 30 March 2026  

---

## Overview

This document defines the complete functionality test plan for every API module.  
Tests run in two modes:

| Mode | Command | Description |
|------|---------|-------------|
| **E2E (Jest)** | `npm run test:e2e` | Full integration against live NestJS app |
| **Standalone** | `npm run test:agent` | HTTP runner against `localhost:3001` |
| **Functionality** | `npm run test:functionality` | Focused per-module functionality specs |

---

## Test Modules & Coverage

### §1 — Authentication & Login
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 1.1 | Register new student | POST | `/auth/register` | 201 + tokens |
| 1.2 | Register second student | POST | `/auth/register` | 201 + tokens |
| 1.3 | Register teacher | POST | `/auth/register` | 201 + tokens |
| 1.4 | Reject wrong password login | POST | `/auth/login` | 401 |
| 1.5 | Login with correct credentials | POST | `/auth/login` | 201 + tokens |
| 1.6 | JWT tokens format validation | — | — | Starts with `eyJ` |
| 1.7 | Refresh token → new access token | POST | `/auth/refresh` | 201 + new token |
| 1.8 | Logout invalidates refresh token | POST | `/auth/logout` | 201; refresh fails 401 |
| 1.9 | Rate limiting on excessive attempts | POST | `/auth/login` × 10 | 429 |
| 1.10 | Reject weak password registration | POST | `/auth/register` | 400 |
| 1.11 | Reject duplicate email | POST | `/auth/register` | 400 or 409 |
| 1.12 | Forgot password endpoint | POST | `/auth/forgot-password` | 200 or 201 |

---

### §2 — User Profile
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 2.1 | Get own profile | GET | `/users/me` | 200 + user data |
| 2.2 | Update own profile | PATCH | `/users/me` | 200 |
| 2.3 | Get dashboard stats | GET | `/users/me/dashboard` | 200 + stats |
| 2.4 | Get learning stats | GET | `/users/me/learning-stats` | 200 |
| 2.5 | Update notification preferences | PATCH | `/users/me/notification-preferences` | 200 |

---

### §3 — Education: Courses
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 3.1 | Browse public courses | GET | `/courses` | 200 + array |
| 3.2 | Filter courses by category | GET | `/courses?category=programming` | 200 |
| 3.3 | Filter courses by level | GET | `/courses?level=beginner` | 200 |
| 3.4 | Search courses by keyword | GET | `/courses?search=python` | 200 |
| 3.5 | Get featured courses | GET | `/courses/featured` | 200 |
| 3.6 | Get recommended courses (auth) | GET | `/courses/recommended` | 200 |
| 3.7 | Get course by ID | GET | `/courses/:id` | 200 |
| 3.8 | Get invalid course ID | GET | `/courses/invalid-id` | 400 |
| 3.9 | Create course (teacher) | POST | `/courses` | 201 + courseId |
| 3.10 | Create course (student) → forbidden | POST | `/courses` | 403 |
| 3.11 | Update course (owner) | PATCH | `/courses/:id` | 200 |
| 3.12 | Publish course for review | POST | `/courses/:id/publish` | 200 |
| 3.13 | Delete course (teacher) | DELETE | `/courses/:id` | 200 |
| 3.14 | Get teacher courses | GET | `/courses/teacher/courses` | 200 |

---

### §4 — Education: Sections
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 4.1 | Create section on course (teacher) | POST | `/courses/:id/sections` | 201 |
| 4.2 | Create section (student) → forbidden | POST | `/courses/:id/sections` | 403 |
| 4.3 | Get sections for course | GET | `/courses/:id/sections` | 200 + array |
| 4.4 | Update section title | PATCH | `/courses/:id/sections/:sId` | 200 |
| 4.5 | Delete section | DELETE | `/courses/:id/sections/:sId` | 200 |

---

### §5 — Education: Lessons
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 5.1 | Create lesson (teacher) | POST | `/lessons` | 201 + lessonId |
| 5.2 | Create lesson (student) → forbidden | POST | `/lessons` | 403 |
| 5.3 | Get lesson by ID | GET | `/lessons/:id` | 200 |
| 5.4 | Update lesson (teacher) | PATCH | `/lessons/:id` | 200 |
| 5.5 | Track lesson progress | POST | `/lessons/:id/progress` | 200 |
| 5.6 | Get lesson progress | GET | `/lessons/:id/progress` | 200 |
| 5.7 | Delete lesson (teacher) | DELETE | `/lessons/:id` | 200 |

---

### §6 — Education: Enrollments
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 6.1 | Enroll student in course | POST | `/enrollments/courses/:id` | 201 |
| 6.2 | Prevent duplicate enrollment | POST | `/enrollments/courses/:id` | 400 or 409 |
| 6.3 | Get student enrollments | GET | `/enrollments` | 200 + array |
| 6.4 | Get enrollment details | GET | `/enrollments/courses/:id` | 200 |
| 6.5 | Dashboard reflects enrollment count | GET | `/users/me/dashboard` | stats.enrolledCourses ≥ 1 |

---

### §7 — Education: Quizzes
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 7.1 | Create quiz (teacher) | POST | `/quizzes` | 201 + quizId |
| 7.2 | Create quiz (student) → forbidden | POST | `/quizzes` | 403 |
| 7.3 | Get quiz info | GET | `/quizzes/:id` | 200 |
| 7.4 | Get quiz with questions | GET | `/quizzes/:id/questions` | 200 |
| 7.5 | Start quiz attempt | POST | `/quizzes/:id/start` | 200 or 201 |
| 7.6 | Submit quiz answers | POST | `/quizzes/:id/submit` | 200 + score |
| 7.7 | Get quiz attempts history | GET | `/quizzes/:id/attempts` | 200 + array |

---

### §8 — Education: Reviews
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 8.1 | Get reviews for course (public) | GET | `/reviews/courses/:id` | 200 |
| 8.2 | Get single review (public) | GET | `/reviews/:id` | 200 |
| 8.3 | Create review (enrolled student) | POST | `/reviews/courses/:id` | 201 |
| 8.4 | Update own review | PATCH | `/reviews/:id` | 200 |
| 8.5 | Mark review as helpful | POST | `/reviews/:id/helpful` | 200 |
| 8.6 | Delete own review | DELETE | `/reviews/:id` | 200 |

---

### §9 — Education: Assignments
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 9.1 | Create assignment (teacher) | POST | `/assignments` | 201 |
| 9.2 | Get assignments for course | GET | `/assignments/courses/:id` | 200 |
| 9.3 | Submit assignment (student) | POST | `/assignments/:id/submit` | 201 |

---

### §10 — Fitness Module
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 10.1 | Create workout session | POST | `/fitness/sessions` | 201 |
| 10.2 | Bulk create sessions | POST | `/fitness/sessions/bulk` | 201 |
| 10.3 | Get workout sessions | GET | `/fitness/sessions` | 200 + array |
| 10.4 | Get single session | GET | `/fitness/sessions/:id` | 200 |
| 10.5 | Delete workout session | DELETE | `/fitness/sessions/:id` | 200 |
| 10.6 | Get daily metrics by date | GET | `/fitness/daily-metrics/:date` | 200 |
| 10.7 | Update daily metrics | PUT | `/fitness/daily-metrics` | 200 or 201 |
| 10.8 | Get metrics date range | GET | `/fitness/daily-metrics?startDate&endDate` | 200 |
| 10.9 | Save fitness profile | PUT | `/fitness/profile` | 200 |
| 10.10 | Get fitness profile | GET | `/fitness/profile` | 200 |
| 10.11 | Create fitness goal | POST | `/fitness/goals` | 201 |
| 10.12 | Get fitness goals | GET | `/fitness/goals` | 200 + array |
| 10.13 | Get goal progress | GET | `/fitness/goals/:id/progress` | 200 |
| 10.14 | Update goal progress | PATCH | `/fitness/goals/:id/progress` | 200 |
| 10.15 | Get fitness stats | GET | `/fitness/stats` | 200 |
| 10.16 | Fitness data isolated per user | GET | `/fitness/sessions` | user2 sees no user1 data |

---

### §11 — Dietary Module
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 11.1 | Log a meal | POST | `/dietary/meals` | 201 |
| 11.2 | Get meal logs | GET | `/dietary/meals` | 200 + array |
| 11.3 | Get single meal | GET | `/dietary/meals/:id` | 200 |
| 11.4 | Update meal log | PUT | `/dietary/meals/:id` | 200 |
| 11.5 | Delete meal | DELETE | `/dietary/meals/:id` | 200 |
| 11.6 | Get daily nutrition summary | GET | `/dietary/daily-nutrition/:date` | 200 |
| 11.7 | Save dietary profile | PUT | `/dietary/profile` | 200 |
| 11.8 | Get dietary profile | GET | `/dietary/profile` | 200 |
| 11.9 | Create dietary goal | POST | `/dietary/goals` | 201 |
| 11.10 | Get dietary goals | GET | `/dietary/goals` | 200 + array |
| 11.11 | Add supplement log | POST | `/dietary/supplements` | 201 |
| 11.12 | Get supplement logs | GET | `/dietary/supplements` | 200 |
| 11.13 | Toggle supplement | PATCH | `/dietary/supplements/:id/toggle` | 200 |
| 11.14 | Create meal plan | POST | `/dietary/meal-plans` | 201 |
| 11.15 | Get meal plans | GET | `/dietary/meal-plans` | 200 |
| 11.16 | Activate meal plan | PATCH | `/dietary/meal-plans/:id/activate` | 200 |
| 11.17 | Create grocery list | POST | `/dietary/grocery-lists` | 201 |
| 11.18 | Get grocery lists | GET | `/dietary/grocery-lists` | 200 |
| 11.19 | Toggle grocery item | PATCH | `/dietary/grocery-lists/:id/items/:itemId/toggle` | 200 |
| 11.20 | Get dietary stats | GET | `/dietary/stats` | 200 |
| 11.21 | Meal filter by type | GET | `/dietary/meals?type=breakfast` | 200 |

---

### §12 — Grooming & Lifestyle Module
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 12.1 | Save grooming profile | PUT | `/grooming/profile` | 200 |
| 12.2 | Get grooming profile | GET | `/grooming/profile` | 200 |
| 12.3 | Save AI recommendation | POST | `/grooming/recommendations` | 201 |
| 12.4 | Get recommendations (all) | GET | `/grooming/recommendations` | 200 |
| 12.5 | Filter by type (skincare) | GET | `/grooming/recommendations?type=skincare` | 200 |
| 12.6 | Filter by type (haircare) | GET | `/grooming/recommendations?type=haircare` | 200 |
| 12.7 | Filter by type (outfit) | GET | `/grooming/recommendations?type=outfit` | 200 |
| 12.8 | Get latest by type | GET | `/grooming/recommendations/latest/:type` | 200 |
| 12.9 | Get single recommendation | GET | `/grooming/recommendations/:id` | 200 |
| 12.10 | Toggle save recommendation | PATCH | `/grooming/recommendations/:id/toggle-save` | 200 |
| 12.11 | Save visual analysis | POST | `/grooming/visual-analysis` | 201 |
| 12.12 | Get visual analyses | GET | `/grooming/visual-analysis` | 200 |
| 12.13 | Get progress by type | GET | `/grooming/visual-analysis/progress/:type` | 200 |
| 12.14 | Get latest analysis | GET | `/grooming/visual-analysis/latest/:type` | 200 |
| 12.15 | Grooming data per-user isolation | — | — | user2 ≠ user1 data |

---

### §13 — AI Module
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 13.1 | AI chat requires auth | POST | `/ai/chat` | 401 without token |
| 13.2 | AI chat authenticated | POST | `/ai/chat` | 200/201 or 5xx (API key) |
| 13.3 | Get AI conversations | GET | `/ai/conversations` | 200 |
| 13.4 | Summarize lesson | POST | `/ai/lesson/summarize` | 200/201 or 5xx |
| 13.5 | Generate revision notes | POST | `/ai/lesson/revision-notes` | 200/201 or 5xx |
| 13.6 | Prompt injection doesn't leak system prompt | POST | `/ai/chat` | no "system prompt" in response |

---

### §14 — Notifications
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 14.1 | Get notifications (auth) | GET | `/notifications` | 200 + array |
| 14.2 | Get notifications (no auth) → 401 | GET | `/notifications` | 401 |
| 14.3 | Register device token | POST | `/notifications/device-token` | 200 or 201 |
| 14.4 | Mark notification as read | PATCH | `/notifications/:id/read` | 200 |
| 14.5 | Mark all as read | PATCH | `/notifications/read-all` | 200 |

---

### §15 — Certificates
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 15.1 | Get student certificates | GET | `/certificates` | 200 |
| 15.2 | Verify certificate by ID (public) | GET | `/certificates/verify/:id` | 200 |

---

### §16 — Admin Module
| ID | Test Case | Method | Endpoint | Expected |
|----|-----------|--------|----------|----------|
| 16.1 | Admin user list requires ADMIN | GET | `/admin/users` | 403 for student |
| 16.2 | Admin course approve requires ADMIN | PATCH | `/admin/courses/:id/approve` | 403 for student |
| 16.3 | Admin course reject requires ADMIN | PATCH | `/admin/courses/:id/reject` | 403 for student |
| 16.4 | Admin pending reviews requires ADMIN | GET | `/admin/courses/pending-review` | 403 for student |
| 16.5 | Unauthenticated admin blocked | GET | `/admin/users` | 401 |

---

### §17 — Authorization & Security
| ID | Test Case | Scenario | Expected |
|----|-----------|----------|----------|
| 17.1 | JWT auth gate | No token on `/users/me` | 401 |
| 17.2 | Role gate | Student on admin endpoint | 403 |
| 17.3 | NoSQL injection | `{ $gt: "" }` as email | 400 |
| 17.4 | API version enforcement | `/users/me` without `/api/v1/` | 404 |
| 17.5 | Unknown field stripping | Register with `role: admin` | role not applied |
| 17.6 | Invalid MongoDB ObjectId | `/courses/not-a-valid-id` | 400 |
| 17.7 | Empty body rejection | POST `/auth/register` `{}` | 400 |
| 17.8 | Data isolation (multi-user) | User2 reads User1 fitness data | empty / user2's own |
| 17.9 | Error responses hide internals | 401 response body | no bcrypt/mongoose |

---

### §18 — Dashboard Cross-Module Sync
| ID | Test Case | What's Verified |
|----|-----------|-----------------|
| S-1 | Enrollment count in dashboard | `stats.enrolledCourses ≥ 1` after enroll |
| S-2 | Fitness stats after session | `stats.totalSessions > 0` |
| S-3 | Daily nutrition after meal log | calories > 0 |
| S-4 | Fitness profile persists | `level === "intermediate"` |
| S-5 | Dietary profile persists | `dailyCalorieTarget === 2000` |
| S-6 | Fitness goals accessible | array length ≥ 1 |
| S-7 | Dietary goals accessible | array length ≥ 1 |
| S-8 | Learning stats ↔ dashboard consistent | streak values match |
| S-9 | Notifications count accurate | data defined |
| S-10 | Multi-user data isolation | user2 data does not contain user1 IDs |

---

## Test Environment Setup

```bash
# Prerequisites
#   MongoDB: localhost:27017
#   Redis:   localhost:6379
#   Backend .env configured with MONGODB_URI, REDIS_HOST, JWT_SECRET, etc.

# Install dependencies
cd backend && npm install

# Run E2E tests (all modules, security + functionality)
npm run test:e2e

# Run standalone HTTP agent (against live server at :3001)
npm run test:agent

# Run focused functionality tests
npm run test:functionality

# Run with coverage
npm run test:cov
```

---

## Test Data Strategy

- **Isolated test users** — unique email per test run (`testuser-<timestamp>-<rand>@test.com`)
- **Cleanup** — no cleanup phase; MongoDB test data is ephemeral
- **Teacher role** — tests document that teacher role promotion requires admin intervention; course creation tests verify the 403 for students
- **AI endpoints** — accept 5xx if Gemini API key is missing; functionality is still tested

---

## Known Architecture Gaps (Documented, Not Tested)

| Missing Backend Module | Frontend Store | Status |
|------------------------|---------------|--------|
| Groups & Meetings | `groupStore`, `meetingStore` | Frontend-only |
| Shopping & Orders | `campusMarketplaceStore`, `ordersReviewsStore` | Frontend-only |
| Injury tracking | `injuryStore` | Frontend-only |
| Health vitals | `wearablesStore` | Frontend-only BLE |
| Budget tracking | `budgetStore` | Frontend-only |

---

## Files Generated by This Testing System

| File | Purpose |
|------|---------|
| `backend/test/testing-agent.e2e-spec.ts` | Security + integration E2E tests |
| `backend/test/functionality-tests.e2e-spec.ts` | Full functionality tests (all modules) |
| `backend/test/run-testing-agent.ts` | Standalone HTTP runner |
| `backend/test/run-functionality-agent.ts` | Standalone functionality runner |
| `API_DOCUMENTATION.md` | Full API reference documentation |
| `TEST_PLAN.md` | This document |

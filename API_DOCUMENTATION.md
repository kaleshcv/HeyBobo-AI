# HeyBobo AI — API Documentation

> **Base URL (local):** `http://localhost:3001/api/v1`  
> **Base URL (Docker):** `http://localhost:3001/api/v1`  
> **Interactive Docs:** `http://localhost:3001/api/v1/docs` (Swagger UI)  
> **Auth:** Bearer JWT token in `Authorization` header unless marked **[PUBLIC]**

---

## Authentication

All endpoints except those marked **[PUBLIC]** require:

```
Authorization: Bearer <access_token>
```

---

## §1 · Auth

### POST `/auth/register`  **[PUBLIC]**
Register a new user (default role: `student`).

**Body:**
```json
{
  "name": "string (required)",
  "email": "string, valid email (required)",
  "password": "string, min 8 chars, must contain uppercase + number + special char (required)"
}
```

**Response 201:**
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "user": {
      "id": "objectId",
      "name": "string",
      "email": "string",
      "role": "student"
    }
  }
}
```

**Errors:** `400` — Validation failed · `409` — Email already registered

---

### POST `/auth/login`  **[PUBLIC]**
Authenticate user with email and password.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Response 201:** Same as `/auth/register`  
**Errors:** `401` — Invalid credentials · `429` — Rate limited

---

### POST `/auth/refresh`  **[PUBLIC]**
Exchange refresh token for a new access+refresh token pair.

**Body:**
```json
{ "refreshToken": "string" }
```

**Response 201:**
```json
{ "data": { "accessToken": "eyJ...", "refreshToken": "..." } }
```

**Errors:** `401` — Token invalid or revoked

---

### POST `/auth/logout`  🔐
Revoke refresh token.

**Body:**
```json
{ "refreshToken": "string" }
```

**Response 201:** `{ "message": "Logged out" }`

---

### POST `/auth/forgot-password`  **[PUBLIC]**
Trigger password reset email.

**Body:**
```json
{ "email": "string" }
```

**Response 200/201:** `{ "message": "If the email is registered, a reset link was sent." }`

---

### POST `/auth/reset-password`  **[PUBLIC]**
Reset password using token from email.

**Body:**
```json
{ "token": "string", "password": "string" }
```

**Response 200:** `{ "message": "Password reset successfully" }`

---

### POST `/auth/google`  **[PUBLIC]**
Exchange Google OAuth token.

**Body:**
```json
{ "token": "google_id_token" }
```

**Response 201:** Same shape as register

---

## §2 · Users

### GET `/users/me`  🔐
Get the authenticated user's profile.

**Response 200:**
```json
{
  "data": {
    "id": "objectId",
    "name": "string",
    "email": "string",
    "role": "student | teacher | admin | ...",
    "bio": "string",
    "avatar": "string (url)",
    "createdAt": "ISO8601"
  }
}
```

---

### PATCH `/users/me`  🔐
Update own profile.

**Body (any of these fields):**
```json
{
  "name": "string",
  "bio": "string",
  "avatar": "string (url)"
}
```

**Response 200:** Updated user object

---

### GET `/users/me/dashboard`  🔐
Aggregated dashboard statistics.

**Response 200:**
```json
{
  "data": {
    "stats": {
      "enrolledCourses": 3,
      "completedCourses": 1,
      "totalWatchTime": 1240,
      "currentStreak": 5,
      "quizzesTaken": 8,
      "certificatesEarned": 1
    },
    "recentCourses": [...],
    "recentActivity": [...]
  }
}
```

---

### GET `/users/me/learning-stats`  🔐
Detailed learning statistics.

**Response 200:**
```json
{
  "data": {
    "currentStreak": 5,
    "longestStreak": 12,
    "totalLessonsCompleted": 24,
    "totalWatchTime": 1240,
    "weeklyProgress": [...]
  }
}
```

---

### PATCH `/users/me/notification-preferences`  🔐
Update notification settings.

**Body:**
```json
{
  "email": true,
  "push": false,
  "inApp": true
}
```

---

## §3 · Courses

### GET `/courses`  **[PUBLIC]**
Browse all approved courses with filters and pagination.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Keyword search |
| `category` | string | Filter by category |
| `level` | `beginner\|intermediate\|advanced` | Filter by level |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |
| `sort` | `newest\|popular\|rating` | Sort order |

**Response 200:**
```json
{
  "data": {
    "courses": [...],
    "total": 42,
    "page": 1,
    "pages": 4
  }
}
```

---

### GET `/courses/featured`  **[PUBLIC]**
Get featured/highlighted courses.

**Response 200:** `{ "data": [ ...courses ] }`

---

### GET `/courses/recommended`  🔐
Get AI-recommended courses for the authenticated user.

**Response 200:** `{ "data": [ ...courses ] }`

---

### GET `/courses/teacher/courses`  🔐 **[TEACHER+ only]**
Get courses created by the authenticated teacher.

**Response 200:** `{ "data": [ ...courses ] }`

---

### GET `/courses/:id`  **[PUBLIC]**
Get course detail by ID or slug.

**Path:** `:id` — MongoDB ObjectId or slug  
**Response 200:** Full course object including sections, instructor info, rating  
**Errors:** `400` — Invalid ID · `404` — Not found

---

### POST `/courses`  🔐 **[TEACHER | CREATOR | ADMIN]**
Create a new course.

**Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "category": "string (required)",
  "level": "beginner | intermediate | advanced (required)",
  "price": 0,
  "thumbnail": "string (url)",
  "tags": ["string"]
}
```

**Response 201:** Created course object with generated `id`

---

### PATCH `/courses/:id`  🔐 **[TEACHER+ — must own course]**
Update course details.

**Body:** Partial of create body  
**Response 200:** Updated course

---

### POST `/courses/:id/publish`  🔐 **[TEACHER+ — must own course]**
Submit course for admin review/publication.

**Response 200:** `{ "message": "Course submitted for review" }`

---

### DELETE `/courses/:id`  🔐 **[TEACHER+ — must own course]**
Delete a course.

**Response 200:** `{ "message": "Course deleted successfully" }`

---

## §4 · Sections

### GET `/courses/:courseId/sections`  **[PUBLIC]**
Get all sections for a course.

**Response 200:** `{ "data": [ ...sections ] }`

---

### POST `/courses/:courseId/sections`  🔐 **[TEACHER+ — must own course]**
Create a new section.

**Body:**
```json
{ "title": "string (required)", "order": 1 }
```

**Response 201:** Created section

---

### PATCH `/courses/:courseId/sections/:id`  🔐 **[TEACHER+]**
Update section title or order.

---

### DELETE `/courses/:courseId/sections/:id`  🔐 **[TEACHER+]**
Delete a section (also deletes child lessons).

---

## §5 · Lessons

### GET `/lessons/:id`  🔐
Get lesson details.

**Response 200:** Lesson object (includes content, video URL for enrolled students)

---

### POST `/lessons`  🔐 **[TEACHER | CREATOR | ADMIN]**
Create a lesson.

**Body:**
```json
{
  "courseId": "objectId (required)",
  "sectionId": "objectId",
  "title": "string (required)",
  "type": "video | text | pdf (required)",
  "content": "string",
  "videoUrl": "string",
  "duration": 0,
  "order": 1,
  "isFree": false
}
```

---

### PATCH `/lessons/:id`  🔐 **[TEACHER+]**
Update lesson.

---

### DELETE `/lessons/:id`  🔐 **[TEACHER+]**
Delete a lesson.

---

### POST `/lessons/:id/progress`  🔐
Track lesson progress.

**Body:**
```json
{
  "watchedSeconds": 120,
  "completed": false,
  "lastPosition": 120
}
```

**Response 200:** Updated progress record

---

### GET `/lessons/:id/progress`  🔐
Get lesson progress for the authenticated user.

**Response 200:**
```json
{
  "data": {
    "lessonId": "...",
    "watchedSeconds": 120,
    "completed": false,
    "completionPercentage": 45
  }
}
```

---

## §6 · Enrollments

### POST `/enrollments/courses/:courseId`  🔐
Enroll in a course.

**Response 201:**
```json
{
  "data": {
    "id": "objectId",
    "courseId": "objectId",
    "userId": "objectId",
    "enrolledAt": "ISO8601",
    "progress": 0
  }
}
```

**Errors:** `400` — Already enrolled · `404` — Course not found

---

### GET `/enrollments`  🔐
Get all enrollments for the authenticated student.

**Response 200:** `{ "data": [ ...enrollments ] }`

---

### GET `/enrollments/courses/:courseId`  🔐
Get enrollment details for a specific course.

**Response 200:** Single enrollment with progress

---

## §7 · Quizzes

### GET `/quizzes/:id`  🔐
Get quiz metadata.

---

### GET `/quizzes/:id/questions`  🔐
Get quiz with all questions.

**Response 200:** Quiz with questions array (answers not included)

---

### POST `/quizzes`  🔐 **[TEACHER+]**
Create a quiz.

**Body:**
```json
{
  "courseId": "objectId (required)",
  "title": "string (required)",
  "description": "string",
  "timeLimit": 30,
  "passingScore": 70,
  "questions": [
    {
      "question": "string",
      "type": "multiple-choice | true-false | short-answer",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "string",
      "points": 1
    }
  ]
}
```

---

### POST `/quizzes/:id/start`  🔐
Start a quiz attempt.

**Response 200/201:** `{ "data": { "attemptId": "...", "startedAt": "ISO8601" } }`

---

### POST `/quizzes/:id/submit`  🔐
Submit quiz answers.

**Body:**
```json
{
  "answers": { "questionId": "selectedAnswer" },
  "startedAt": "ISO8601"
}
```

**Response 200:**
```json
{
  "data": {
    "score": 85,
    "passed": true,
    "correctAnswers": 17,
    "totalQuestions": 20,
    "timeSpent": 1240,
    "feedback": [...]
  }
}
```

---

### GET `/quizzes/:id/attempts`  🔐
Get student's previous attempts for this quiz.

**Response 200:** `{ "data": [ ...attempts ] }`

---

## §8 · Reviews

### GET `/reviews/courses/:courseId`  **[PUBLIC]**
Get reviews for a course (paginated).

**Query:** `page`, `limit`  
**Response 200:** `{ "data": { "reviews": [...], "total": 12, "avgRating": 4.3 } }`

---

### GET `/reviews/:id`  **[PUBLIC]**
Get a single review.

---

### POST `/reviews/courses/:courseId`  🔐
Create a review for a course (must be enrolled and completed ≥1 lesson).

**Body:**
```json
{ "rating": 5, "comment": "Excellent course!" }
```

**Response 201:** Created review  
**Errors:** `400` — Not enrolled or already reviewed

---

### PATCH `/reviews/:id`  🔐 **[review owner]**
Update own review.

---

### DELETE `/reviews/:id`  🔐 **[review owner | ADMIN]**
Delete review.

---

### POST `/reviews/:id/helpful`  🔐
Mark review as helpful.

---

## §9 · Fitness

### POST `/fitness/sessions`  🔐
Create a workout session.

**Body:**
```json
{
  "type": "strength | cardio | yoga | hiit | sports | other (required)",
  "name": "string",
  "duration": 60,
  "exercises": [
    {
      "name": "string",
      "sets": 4,
      "reps": 10,
      "weight": 60,
      "duration": 0,
      "distance": 0,
      "notes": "string"
    }
  ],
  "caloriesBurned": 520,
  "date": "ISO8601 (required)",
  "notes": "string"
}
```

**Response 201:** Created session

---

### POST `/fitness/sessions/bulk`  🔐
Bulk create workout sessions (sync from wearable/offline).

**Body:**
```json
{ "sessions": [ ...session objects ] }
```

---

### GET `/fitness/sessions`  🔐
List workout sessions with optional filters.

**Query:** `type`, `startDate`, `endDate`, `page`, `limit`  
**Response 200:** `{ "data": { "sessions": [...], "total": 10 } }`

---

### GET `/fitness/sessions/:id`  🔐
Get a single workout session.

---

### DELETE `/fitness/sessions/:id`  🔐
Delete a workout session.

---

### GET `/fitness/daily-metrics/:date`  🔐
Get daily activity metrics for a specific date (YYYY-MM-DD).

**Response 200:**
```json
{
  "data": {
    "date": "2026-03-30",
    "workoutsCompleted": 2,
    "totalDuration": 90,
    "totalCalories": 820,
    "activeMinutes": 90,
    "steps": 8500,
    "heartRateAvg": 72
  }
}
```

---

### GET `/fitness/daily-metrics`  🔐
Get metrics range.

**Query:** `startDate`, `endDate` (YYYY-MM-DD)  
**Response 200:** `{ "data": [ ...daily metrics ] }`

---

### PUT `/fitness/daily-metrics`  🔐
Create or update daily metrics.

**Body:**
```json
{
  "date": "YYYY-MM-DD (required)",
  "workoutsCompleted": 2,
  "totalDuration": 90,
  "totalCalories": 820,
  "activeMinutes": 90,
  "steps": 8500,
  "heartRateAvg": 72
}
```

---

### GET `/fitness/profile`  🔐
Get the user's fitness profile.

---

### PUT `/fitness/profile`  🔐
Save/update fitness profile.

**Body:**
```json
{
  "level": "beginner | intermediate | advanced",
  "goals": ["weight-loss", "endurance", "muscle-gain"],
  "height": 178,
  "weight": 75,
  "activityLevel": "sedentary | light | moderate | active | very-active",
  "preferredWorkoutTypes": ["strength", "cardio"],
  "availableDays": ["monday", "wednesday", "friday"],
  "workoutDuration": 60
}
```

---

### POST `/fitness/goals`  🔐
Create a fitness goal.

**Body:**
```json
{
  "title": "string (required)",
  "type": "distance | weight | frequency | duration | custom (required)",
  "target": 5,
  "unit": "km | kg | sessions | minutes",
  "deadline": "ISO8601",
  "description": "string"
}
```

**Response 201:** Created goal

---

### GET `/fitness/goals`  🔐
List all fitness goals.

**Response 200:** `{ "data": [ ...goals ] }`

---

### GET `/fitness/goals/:id/progress`  🔐
Get progress toward a specific goal.

**Response 200:**
```json
{
  "data": {
    "goalId": "...",
    "currentValue": 3.2,
    "targetValue": 5,
    "percentageComplete": 64,
    "daysRemaining": 18
  }
}
```

---

### PATCH `/fitness/goals/:id/progress`  🔐
Update goal progress.

**Body:**
```json
{ "currentValue": 3.5 }
```

---

### GET `/fitness/stats`  🔐
Get aggregated fitness statistics.

**Response 200:**
```json
{
  "data": {
    "totalSessions": 12,
    "totalDuration": 640,
    "totalCalories": 5200,
    "currentStreak": 4,
    "longestStreak": 10,
    "weeklyAvgSessions": 3.2,
    "favoriteWorkoutType": "strength"
  }
}
```

---

## §10 · Dietary

### POST `/dietary/meals`  🔐
Log a meal.

**Body:**
```json
{
  "name": "string (required)",
  "type": "breakfast | lunch | dinner | snack (required)",
  "calories": 380,
  "protein": 12,
  "carbs": 65,
  "fat": 8,
  "fiber": 6,
  "sugar": 15,
  "date": "ISO8601 (required)",
  "notes": "string",
  "items": [
    { "name": "Oats", "quantity": 80, "unit": "g", "calories": 280 }
  ]
}
```

**Response 201:** Created meal log

---

### GET `/dietary/meals`  🔐
Get meal logs with filters.

**Query:** `type`, `date`, `startDate`, `endDate`, `page`, `limit`  
**Response 200:** `{ "data": [ ...meals ] }`

---

### GET `/dietary/meals/:id`  🔐
Get single meal log.

---

### PUT `/dietary/meals/:id`  🔐
Update a meal log.

---

### POST `/dietary/meals/:id/photo`  🔐
Upload a meal photo (for AI analysis).

**Content-Type:** `multipart/form-data`  
**Form field:** `photo` (image file)  
**Response 200:** `{ "data": { "photoUrl": "..." } }`

---

### DELETE `/dietary/meals/:id`  🔐
Delete a meal log.

---

### GET `/dietary/daily-nutrition/:date`  🔐
Get daily nutrition summary for a date (YYYY-MM-DD).

**Response 200:**
```json
{
  "data": {
    "date": "2026-03-30",
    "totalCalories": 1550,
    "totalProtein": 99,
    "totalCarbs": 150,
    "totalFat": 48,
    "mealsLogged": 3,
    "calorieTarget": 2100,
    "calorieRemaining": 550
  }
}
```

---

### GET `/dietary/profile`  🔐
Get dietary profile.

---

### PUT `/dietary/profile`  🔐
Save/update dietary profile.

**Body:**
```json
{
  "dietType": "standard | vegetarian | vegan | keto | paleo | balanced",
  "goal": "lose | maintain | gain",
  "dailyCalorieTarget": 2100,
  "proteinTarget": 160,
  "carbTarget": 250,
  "fatTarget": 70,
  "restrictions": ["gluten-free"],
  "allergies": ["peanuts"],
  "mealsPerDay": 3
}
```

---

### POST `/dietary/goals`  🔐
Create a dietary goal.

**Body:**
```json
{
  "title": "string (required)",
  "type": "calorie | protein | hydration | custom (required)",
  "target": 2000,
  "unit": "kcal | g | ml",
  "deadline": "ISO8601",
  "description": "string"
}
```

---

### GET `/dietary/goals`  🔐
List dietary goals.

---

### POST `/dietary/supplements`  🔐
Add a supplement.

**Body:**
```json
{
  "name": "string (required)",
  "dosage": "string",
  "unit": "mg | IU | g | ml",
  "frequency": "daily | weekly | as-needed",
  "time": "morning | afternoon | evening | with-meal | before-workout | after-workout",
  "notes": "string"
}
```

---

### GET `/dietary/supplements`  🔐
List supplement logs.

**Query:** `active` (boolean filter)

---

### PATCH `/dietary/supplements/:id/toggle`  🔐
Toggle supplement active state on/off.

---

### POST `/dietary/meal-plans`  🔐
Create a meal plan.

**Body:**
```json
{
  "name": "string (required)",
  "description": "string",
  "dailyCalories": 2100,
  "days": [
    {
      "day": "monday | tuesday | ... | sunday",
      "meals": [
        { "type": "breakfast", "name": "string", "calories": 400 }
      ]
    }
  ]
}
```

---

### GET `/dietary/meal-plans`  🔐
List meal plans.

---

### PATCH `/dietary/meal-plans/:id/activate`  🔐
Set a meal plan as active.

---

### POST `/dietary/grocery-lists`  🔐
Create a grocery list.

**Body:**
```json
{
  "name": "string (required)",
  "items": [
    {
      "name": "string",
      "quantity": 1,
      "unit": "kg | g | ml | l | pieces",
      "category": "string",
      "checked": false
    }
  ]
}
```

---

### GET `/dietary/grocery-lists`  🔐
List grocery lists.

---

### PATCH `/dietary/grocery-lists/:listId/items/:itemId/toggle`  🔐
Toggle grocery item checked state.

---

### GET `/dietary/stats`  🔐
Get dietary statistics summary.

**Response 200:**
```json
{
  "data": {
    "avgDailyCalories": 1890,
    "avgProtein": 135,
    "mealsLoggedThisWeek": 18,
    "activeMealPlan": "...",
    "topFoods": [...]
  }
}
```

---

## §11 · Grooming & Lifestyle

> **Note:** These endpoints are decorated `@Public()` and use `x-user-id` header for user identification rather than JWT.

### GET `/grooming/profile`
Get grooming profile.

**Header:** `x-user-id: <userId>`

---

### PUT `/grooming/profile`
Save/update grooming profile.

**Header:** `x-user-id: <userId>`  
**Body:**
```json
{
  "skinType": "oily | dry | combination | normal | sensitive",
  "skinConcerns": ["acne", "dark-spots", "wrinkles"],
  "hairType": "straight | wavy | curly | coily",
  "hairConcerns": ["frizz", "dryness", "oiliness"],
  "stylePreference": "casual | smart-casual | formal | sporty",
  "budget": "low | moderate | high",
  "productPreferences": ["cruelty-free", "natural", "vegan"]
}
```

---

### POST `/grooming/recommendations`
Save an AI-generated recommendation.

**Header:** `x-user-id: <userId>`  
**Body:**
```json
{
  "type": "skincare | haircare | outfit (required)",
  "title": "string (required)",
  "content": "string (required)",
  "products": [
    { "name": "string", "price": 12.99, "url": "string" }
  ],
  "aiModel": "gemini-1.5-flash",
  "prompt": "string"
}
```

---

### GET `/grooming/recommendations`
List recommendations.

**Header:** `x-user-id: <userId>`  
**Query:** `type` (skincare | haircare | outfit), `saved` (boolean), `page`, `limit`

---

### GET `/grooming/recommendations/latest/:type`
Get the most recent recommendation by type.

---

### GET `/grooming/recommendations/:id`
Get a single recommendation.

---

### PATCH `/grooming/recommendations/:id/toggle-save`
Toggle saved/unsaved state.

---

### POST `/grooming/visual-analysis`
Save a visual analysis result.

**Header:** `x-user-id: <userId>`  
**Body:**
```json
{
  "type": "skin | hair | body | style (required)",
  "imageUrl": "string",
  "analysis": {
    "overallScore": 76,
    "concerns": ["string"],
    "recommendations": ["string"]
  },
  "aiModel": "gemini-1.5-flash"
}
```

---

### GET `/grooming/visual-analysis`
List visual analyses.

**Query:** `type`, `page`, `limit`

---

### GET `/grooming/visual-analysis/progress/:type`
Get analysis progress over time for a given type.

---

### GET `/grooming/visual-analysis/latest/:type`
Get the most recent analysis for a type.

---

### POST `/grooming/analyze/upload`
Upload an image for AI visual analysis.

**Content-Type:** `multipart/form-data`  
**Form field:** `photo` (image file)  
**Response 200:** `{ "data": { "analysisResult": { ... } } }`

---

## §12 · AI Module

### POST `/ai/chat`  🔐
Send a message to the AI tutor.

**Body:**
```json
{
  "message": "string (required)",
  "conversationId": "string (optional — continues existing conversation)",
  "context": "education | fitness | dietary | grooming | general"
}
```

**Response 201:**
```json
{
  "data": {
    "reply": "string",
    "conversationId": "string"
  }
}
```

---

### GET `/ai/conversations`  🔐
Get all AI conversations for the user.

**Response 200:** `{ "data": [ ...conversations ] }`

---

### GET `/ai/conversations/:id`  🔐
Get a conversation with full message history.

---

### DELETE `/ai/conversations/:id`  🔐
Delete a conversation.

---

### POST `/ai/lesson/summarize`  🔐
Generate an AI summary of lesson content.

**Body:**
```json
{ "content": "string (required)", "lessonId": "string (optional)" }
```

**Response 201:** `{ "data": { "summary": "string" } }`

---

### POST `/ai/lesson/revision-notes`  🔐
Generate revision notes from lesson content.

**Body:**
```json
{ "content": "string (required)", "lessonId": "string (optional)" }
```

**Response 201:** `{ "data": { "notes": "string" } }`

---

### GET `/ai/documents`
List AI-generated documents.

**Header:** `x-user-id: <userId>`

---

## §13 · Notifications

### GET `/notifications`  🔐
Get notifications for the authenticated user.

**Query:** `unread` (boolean), `page`, `limit`  
**Response 200:**
```json
{
  "data": {
    "notifications": [...],
    "total": 12,
    "unreadCount": 3
  }
}
```

---

### PATCH `/notifications/:id/read`  🔐
Mark a notification as read.

---

### PATCH `/notifications/read-all`  🔐
Mark all notifications as read.

---

### POST `/notifications/device-token`  🔐
Register a device token for push notifications.

**Body:**
```json
{
  "token": "string (required)",
  "platform": "ios | android | web (required)"
}
```

---

## §14 · Certificates

### GET `/certificates`  🔐
List certificates earned by the authenticated student.

**Response 200:**
```json
{
  "data": [
    {
      "id": "objectId",
      "courseTitle": "string",
      "issuedAt": "ISO8601",
      "verificationUrl": "https://..."
    }
  ]
}
```

---

### GET `/certificates/verify/:id`  **[PUBLIC]**
Verify a certificate by ID.

**Response 200:**
```json
{
  "data": {
    "valid": true,
    "studentName": "string",
    "courseTitle": "string",
    "issuedAt": "ISO8601"
  }
}
```

**Error:** `404` — Certificate not found

---

## §15 · Admin

> All endpoints require `ADMIN` role. Students/teachers get `403`.

### GET `/admin/users`  🔐 **[ADMIN]**
List all platform users with filters.

**Query:** `role`, `status`, `search`, `page`, `limit`

---

### PATCH `/admin/users/:id/role`  🔐 **[ADMIN]**
Change a user's role.

**Body:**
```json
{ "role": "student | teacher | creator | moderator | college_admin | admin" }
```

---

### PATCH `/admin/users/:id/status`  🔐 **[ADMIN]**
Change user account status.

**Body:**
```json
{ "status": "active | suspended | banned" }
```

---

### GET `/admin/courses/pending-review`  🔐 **[ADMIN]**
Get courses awaiting admin approval.

---

### PATCH `/admin/courses/:id/approve`  🔐 **[ADMIN]**
Approve a course for publication.

---

### PATCH `/admin/courses/:id/reject`  🔐 **[ADMIN]**
Reject a course with a reason.

**Body:**
```json
{ "rejectionReason": "string (required)" }
```

---

## §16 · Media

### POST `/media/upload`  🔐 **[TEACHER+]**
Upload video to Mux.

**Content-Type:** `multipart/form-data`  
**Form field:** `video` (video file)

**Response 201:**
```json
{
  "data": {
    "uploadId": "mux-upload-id",
    "assetId": "mux-asset-id",
    "playbackId": "mux-playback-id"
  }
}
```

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation error description",
  "error": "Bad Request"
}
```

> Stack traces are never exposed in error responses.

---

## Rate Limits

| Endpoint Group | Limit |
|---------------|-------|
| Auth endpoints | 5 req / 15 min |
| API (general) | 100 req / min |
| File uploads | 10 req / min |

---

## User Roles

| Role | Permissions |
|------|------------|
| `student` | Default. Enroll, learn, take quizzes, reviews |
| `teacher` | Create/manage courses, sections, lessons, quizzes |
| `creator` | Teacher + additional content privileges |
| `moderator` | Moderate content and reviews |
| `college_admin` | Admin for specific institution |
| `admin` | Full platform access |

# EduPlatform Backend

A production-grade NestJS backend for a comprehensive education platform with courses, quizzes, assignments, AI tutoring, and certificate generation.

## Features

### Core Education Features
- **Course Management**: Create, publish, and manage courses with sections and lessons
- **Student Enrollments**: Free and paid course enrollment system
- **Progress Tracking**: Lesson progress, course completion tracking, and analytics
- **Quizzes & Assignments**: Create quizzes with auto-grading, assignments with submissions
- **Reviews & Ratings**: Student reviews, course ratings, and helpful marking
- **Certificates**: Automatic certificate generation with verification codes

### Advanced Features
- **AI Tutoring**: Google Gemini integration for intelligent tutoring assistance
- **Video Hosting**: Mux integration for professional video streaming
- **Media Management**: Upload and manage course media assets
- **Notifications**: Multi-channel notifications (in-app, email, push)
- **Analytics**: Student activity tracking, course analytics, platform statistics
- **User Roles**: Student, Teacher, Creator, Moderator, Admin, College Admin

### Technical Features
- **JWT Authentication**: Access tokens + Refresh tokens with rotation
- **OAuth2**: Google OAuth login support
- **Security**: Rate limiting, helmet headers, input validation
- **Caching**: Redis-based caching for performance
- **Background Jobs**: BullMQ for async email, certificate, and notification jobs
- **Logging**: Winston logging for monitoring
- **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS 10 with TypeScript (strict mode)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (JWT + Google OAuth)
- **Caching**: Redis with ioredis
- **Background Jobs**: BullMQ
- **Video Hosting**: Mux API
- **AI**: Google Generative AI (Gemini)
- **PDF Generation**: PDFKit
- **Validation**: class-validator, class-transformer
- **Logging**: Winston
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
├── config/
│   └── configuration.ts    # Configuration loading
├── common/
│   ├── decorators/         # @CurrentUser, @Roles, @Public
│   ├── filters/            # Global exception filters
│   ├── guards/             # JWT, Roles guards
│   ├── interceptors/       # Transform, Logging interceptors
│   └── pipes/              # ObjectId validation pipe
└── modules/
    ├── auth/               # Authentication module
    ├── users/              # User profiles & management
    ├── education/          # Courses, lessons, quizzes
    ├── media/              # Media uploads via Mux
    ├── notifications/      # Notifications system
    ├── certificates/       # Certificate generation
    ├── ai/                 # AI tutoring with Gemini
    ├── analytics/          # Analytics & activity logging
    └── admin/              # Admin management
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
# Update .env with your credentials:
# - MongoDB URI
# - Redis host/port
# - JWT secrets
# - Google OAuth credentials
# - Mux API keys
# - Gemini API key
```

## Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production build
npm run build

# Production start
npm start
```

The application will be available at `http://localhost:3001`
API documentation at `http://localhost:3001/api/v1/docs`

## Configuration

All configuration is managed via environment variables. See `.env.example` for the complete list:

### Essential Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: Refresh token secret
- `REDIS_HOST` / `REDIS_PORT`: Redis configuration
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET`: Mux API credentials
- `GEMINI_API_KEY`: Google Gemini API key
- `EMAIL_*`: SMTP configuration for emails

## Authentication

### JWT Flow
1. User registers or logs in
2. Backend returns `accessToken` (15 min) and `refreshToken` (7 days)
3. Client stores both tokens securely
4. Requests use Bearer token in Authorization header
5. When access token expires, use refresh token to get new pair
6. Refresh tokens are stored in DB and can be revoked

### Google OAuth
1. User clicks "Login with Google"
2. Redirected to Google OAuth flow
3. Backend receives authorization code
4. Exchange for user profile info
5. Create or update user in system
6. Return JWT tokens

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke refresh token)
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/google` - Google OAuth initiation
- `GET /auth/google/callback` - Google OAuth callback

### Users
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update profile
- `GET /users/me/dashboard` - User dashboard
- `GET /users/me/learning-stats` - Learning statistics
- `PATCH /users/me/preferences` - Update notification preferences
- `PATCH /users/me/avatar` - Upload avatar

### Courses
- `GET /courses` - List courses (with filters)
- `GET /courses/featured` - Featured courses
- `GET /courses/recommended` - Recommended for student
- `GET /courses/:id` - Course details
- `POST /courses` - Create course (teacher only)
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `POST /courses/:id/publish` - Submit for review

### Lessons
- `GET /lessons/:id` - Get lesson
- `POST /lessons/:id/progress` - Update lesson progress
- `PATCH /lessons/:id` - Update lesson (teacher only)

### Quizzes
- `GET /quizzes/:id` - Get quiz
- `POST /quizzes/:id/start` - Start quiz attempt
- `POST /quizzes/:id/submit` - Submit quiz answers
- `GET /quizzes/:id/attempts` - Get student attempts

### Assignments
- `GET /assignments/:id` - Get assignment
- `POST /assignments/:id/submit` - Submit assignment
- `PATCH /assignments/:id/grade` - Grade submission (teacher only)

### Enrollments
- `POST /enrollments/courses/:courseId` - Enroll in course
- `GET /enrollments` - Get student enrollments

### Certificates
- `GET /certificates` - Get user certificates
- `GET /certificates/verify/:code` - Verify certificate

### AI Tutoring
- `POST /ai/chat` - Chat with AI tutor
- `GET /ai/conversations` - Get conversations
- `POST /ai/lesson/:id/summarize` - Generate lesson summary

### Media
- `POST /media/upload-url` - Get direct upload URL
- `GET /media/:id` - Get media asset

### Notifications
- `GET /notifications` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/device-token` - Register device token

### Analytics
- `POST /analytics/events` - Track event
- `GET /analytics/user-activity` - User activity
- `GET /analytics/platform` - Platform stats (admin only)

### Admin
- `GET /admin/users` - List users
- `PATCH /admin/users/:id/status` - Update user status
- `PATCH /admin/users/:id/role` - Change user role
- `GET /admin/courses/pending-review` - Pending review courses
- `PATCH /admin/courses/:id/approve` - Approve course
- `PATCH /admin/courses/:id/reject` - Reject course

## Database Schemas

### User Collections
- **users**: User accounts with authentication
- **user-profiles**: Extended user profiles with preferences
- **colleges**: College/institution management

### Education Collections
- **categories**: Course categories
- **courses**: Course definitions
- **sections**: Course sections
- **lessons**: Individual lessons with video/content
- **lesson-progress**: Student lesson progress
- **enrollments**: Student enrollments
- **quizzes**: Quiz definitions
- **quiz-questions**: Quiz questions
- **quiz-attempts**: Student quiz attempts
- **assignments**: Assignment definitions
- **assignment-submissions**: Student submissions
- **reviews**: Student course reviews

### Support Collections
- **media-assets**: Uploaded media with Mux references
- **notifications**: User notifications
- **device-tokens**: Push notification device tokens
- **certificates**: Generated certificates
- **ai-conversations**: AI tutor conversations
- **activity-logs**: User activity tracking
- **refresh-tokens**: Refresh token DB for revocation

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Deployment

### Docker Build
```bash
docker build -t eduplatform-backend .
docker run -p 3001:3001 --env-file .env eduplatform-backend
```

### Environment Setup for Production
1. Use strong JWT secrets (32+ characters)
2. Configure proper MongoDB replica set for transactions
3. Set up Redis with authentication and persistence
4. Configure email service for password resets
5. Set up Mux webhook endpoint
6. Configure CORS for frontend domain
7. Enable HTTPS in production
8. Set up monitoring and logging
9. Configure backup strategy for MongoDB

## Monitoring & Logging

- **Winston Logger**: All application logs go through Winston
- **Activity Logging**: User activities tracked in DB
- **Metrics**: Use analytics endpoints for insights
- **Error Tracking**: Global exception filter logs all errors

## Contributing

1. Follow NestJS best practices
2. Use strict TypeScript mode
3. Add validation DTOs for all inputs
4. Test all endpoints
5. Document complex logic
6. Keep services focused and single-responsibility

## Performance Considerations

- Redis caching for frequently accessed data
- MongoDB indexes on common queries
- Lazy loading of course content
- Pagination on list endpoints
- Rate limiting to prevent abuse
- Efficient aggregation pipelines for analytics

## Security

- HTTPS only in production
- Helmet for secure headers
- Rate limiting on auth endpoints
- Input validation on all endpoints
- MongoDB injection prevention via Mongoose
- JWT token rotation on refresh
- Password hashing with bcrypt
- CORS configured for frontend domain
- Sensitive fields excluded from responses

## Future Enhancements

- [ ] Payment integration (Stripe)
- [ ] Video conferencing (Zoom/Google Meet)
- [ ] Discussion forums
- [ ] Student groups/study circles
- [ ] Advanced recommendation engine
- [ ] Mobile app support
- [ ] Microservices architecture
- [ ] GraphQL API
- [ ] Advanced reporting & dashboards

## License

MIT

## Support

For issues and questions, please create an issue in the repository.

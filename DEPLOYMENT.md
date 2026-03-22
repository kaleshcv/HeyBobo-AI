# HeyBobo-AI — Deployment Guide

Complete deployment guide for local development, Docker, and production environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Reference](#environment-variables-reference)
3. [Local Development Setup](#local-development-setup)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Database Setup & Management](#database-setup--management)
7. [External Services Setup](#external-services-setup)
8. [Frontend Configuration](#frontend-configuration)
9. [Backend Configuration](#backend-configuration)
10. [Nginx & Reverse Proxy](#nginx--reverse-proxy)
11. [SSL/TLS Setup](#ssltls-setup)
12. [Monitoring & Logging](#monitoring--logging)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Runtime for backend and frontend build |
| npm | 10+ | Package manager |
| MongoDB | 7.0+ | Primary database |
| Redis | 7.0+ | Caching + job queues (BullMQ) |
| Docker | 24+ | Containerized deployment (optional) |
| Docker Compose | 2.20+ | Multi-service orchestration (optional) |
| Git | 2.40+ | Version control |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `PORT` | No | `3001` | Backend server port |
| `FRONTEND_URL` | **Yes** | `http://localhost:5173` | Frontend origin for CORS |
| `API_PREFIX` | No | `api/v1` | API route prefix |
| **Database** | | | |
| `MONGODB_URI` | **Yes** | `mongodb://localhost:27017/eduplatform` | MongoDB connection string |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_PASSWORD` | No | — | Redis password (required if using Redis Cloud/Auth) |
| **Authentication** | | | |
| `JWT_SECRET` | **Yes** | insecure default | Access token signing secret |
| `JWT_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_SECRET` | **Yes** | insecure default | Refresh token signing secret |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | `http://localhost:3001/api/v1/auth/google/callback` | OAuth callback URL |
| `FRONTEND_OAUTH_REDIRECT` | No | `http://localhost:5173/auth/callback` | Post-OAuth frontend redirect |
| **Video** | | | |
| `MUX_TOKEN_ID` | No | — | Mux API token ID |
| `MUX_TOKEN_SECRET` | No | — | Mux API token secret |
| `MUX_WEBHOOK_SECRET` | No | — | Mux webhook signing secret |
| **AI** | | | |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key |
| **Email** | | | |
| `EMAIL_HOST` | No | `smtp.gmail.com` | SMTP server host |
| `EMAIL_PORT` | No | `587` | SMTP server port |
| `EMAIL_USER` | No | — | SMTP username |
| `EMAIL_PASS` | No | — | SMTP password / app password |
| `EMAIL_FROM` | No | `noreply@eduplatform.com` | Sender email address |
| **Storage** | | | |
| `UPLOAD_DIR` | No | `uploads` | Local file upload directory |
| `MAX_FILE_SIZE` | No | `104857600` (100 MB) | Max upload size in bytes |
| `AWS_ACCESS_KEY_ID` | No | — | AWS S3 access key (production) |
| `AWS_SECRET_ACCESS_KEY` | No | — | AWS S3 secret key (production) |
| `AWS_REGION` | No | `us-east-1` | AWS region |
| `AWS_S3_BUCKET` | No | — | S3 bucket name |
| **Logging** | | | |
| `LOG_DIR` | No | `logs` | Log file directory |
| `LOG_LEVEL` | No | `info` | Winston log level |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | **Yes** | `http://localhost:3001/api/v1` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | No | — | Google OAuth client ID (same as backend) |
| `VITE_MUX_ENV_KEY` | No | — | Mux environment key for video player |
| `VITE_APP_NAME` | No | `EduPlatform` | Application display name |
| `VITE_APP_URL` | No | `http://localhost:5173` | Frontend public URL |

---

## Local Development Setup

### Step 1: Clone the repository

```bash
git clone https://github.com/kaleshcv/HeyBobo-AI.git
cd HeyBobo-AI
```

### Step 2: Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Or run via Docker
docker run -d --name mongo -p 27017:27017 mongo:7.0
```

### Step 3: Start Redis

```bash
# macOS (Homebrew)
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Or run via Docker
docker run -d --name redis -p 6379:6379 redis:7.2-alpine
```

### Step 4: Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` — minimum required:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/eduplatform
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=<generate-with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<generate-with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
GEMINI_API_KEY=<your-gemini-api-key>
```

### Step 5: Install and start backend

```bash
cd backend
npm install
npm run start:dev
# ✓ API running at http://localhost:3001
# ✓ Swagger docs at http://localhost:3001/api/v1/docs
```

### Step 6: Configure frontend environment

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_APP_NAME=HeyBobo-AI
VITE_APP_URL=http://localhost:5173
```

### Step 7: Install and start frontend

```bash
cd frontend
npm install
npm run dev
# ✓ App running at http://localhost:5173
```

### Verify

```bash
# Backend health check
curl http://localhost:3001/api/v1/auth/login -X POST -H "Content-Type: application/json" -d '{}' -s | head -1

# Frontend
open http://localhost:5173
```

---

## Docker Deployment

### Step 1: Configure root environment

```bash
cp .env.example .env
```

Edit `.env` with all required secrets (JWT, Google OAuth, Mux, Gemini keys).

### Step 2: Build and start all services

```bash
# Start everything (MongoDB + Redis + Backend + Frontend)
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Services

| Service | Internal Port | External Port | URL |
|---------|--------------|---------------|-----|
| MongoDB | 27017 | 27017 | `mongodb://admin:password@localhost:27017` |
| Redis | 6379 | 6379 | `redis://localhost:6379` |
| Backend | 3001 | 3001 | `http://localhost:3001` |
| Frontend | 80 | 80 | `http://localhost:80` |

### Docker Compose Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  eduplatform_network                      │
│                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │
│  │  Mongo  │  │  Redis  │  │ Backend │  │ Frontend  │  │
│  │  :27017 │  │  :6379  │  │  :3001  │  │    :80    │  │
│  └────┬────┘  └────┬────┘  └────┬────┘  └───────────┘  │
│       │            │            │                        │
│       └────────────┴────────────┘                        │
│              Backend depends on                          │
└──────────────────────────────────────────────────────────┘
```

### Persistent Volumes

| Volume | Purpose |
|--------|---------|
| `mongodb_data` | Database files |
| `redis_data` | Redis persistence |
| `backend_uploads` | User uploaded files |
| `backend_logs` | Application logs |

### Common Docker Commands

```bash
# Rebuild only backend
docker-compose up -d --build backend

# Restart a service
docker-compose restart backend

# Stop everything
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# View backend logs
docker-compose logs -f --tail=100 backend

# Shell into backend container
docker-compose exec backend sh

# Shell into MongoDB
docker-compose exec mongodb mongosh -u admin -p password eduplatform
```

---

## Production Deployment

### Option A: VPS / Cloud VM (Recommended for small-medium scale)

#### 1. Server requirements

- **OS:** Ubuntu 22.04+ / Debian 12+
- **RAM:** 2 GB minimum, 4 GB recommended
- **CPU:** 2 cores minimum
- **Storage:** 20 GB+ (depends on media uploads)
- **Ports:** 80 (HTTP), 443 (HTTPS), 22 (SSH)

#### 2. Install dependencies on server

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MongoDB 7.0
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod

# Redis
sudo apt install -y redis-server
sudo systemctl enable --now redis-server

# Nginx
sudo apt install -y nginx certbot python3-certbot-nginx

# PM2 (process manager)
sudo npm install -g pm2
```

#### 3. Clone and configure

```bash
cd /opt
sudo git clone https://github.com/kaleshcv/HeyBobo-AI.git
cd HeyBobo-AI

# Configure backend
cp backend/.env.example backend/.env
nano backend/.env
```

Critical production values in `backend/.env`:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com

MONGODB_URI=mongodb://localhost:27017/eduplatform
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=<64-byte-hex-secret>
JWT_REFRESH_SECRET=<different-64-byte-hex-secret>

GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_OAUTH_REDIRECT=https://yourdomain.com/auth/callback

GEMINI_API_KEY=<your-key>
```

#### 4. Build and deploy backend

```bash
cd /opt/HeyBobo-AI/backend
npm ci --production=false
npm run build

# Start with PM2
pm2 start dist/main.js --name heybobo-backend -i max
pm2 save
pm2 startup
```

#### 5. Build and deploy frontend

```bash
cd /opt/HeyBobo-AI/frontend

# Set production API URL
echo "VITE_API_URL=https://yourdomain.com/api/v1" > .env
echo "VITE_APP_NAME=HeyBobo-AI" >> .env
echo "VITE_APP_URL=https://yourdomain.com" >> .env

npm ci
npm run build
# Output: frontend/dist/
```

#### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/heybobo
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (static files)
    root /opt/HeyBobo-AI/frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API proxy to backend
    location /api/v1/ {
        proxy_pass http://127.0.0.1:3001/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        client_max_body_size 100M;
    }

    # Uploaded files
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # SPA fallback — all other routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/heybobo /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

#### 7. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
# Auto-renew is configured by default
```

### Option B: Docker on VPS

```bash
# On server
git clone https://github.com/kaleshcv/HeyBobo-AI.git
cd HeyBobo-AI
cp .env.example .env
nano .env   # Fill in all production secrets

# Update FRONTEND_URL and VITE_API_URL for your domain
docker-compose up -d --build
```

Then set up Nginx + SSL as a reverse proxy in front of the Docker containers.

### Option C: Platform-as-a-Service

| Component | Platform | Notes |
|-----------|----------|-------|
| Backend | Railway / Render / Fly.io | Set all env vars in dashboard |
| Frontend | Vercel / Netlify / Cloudflare Pages | Set `VITE_API_URL` to backend URL |
| Database | MongoDB Atlas (free tier available) | Get connection string for `MONGODB_URI` |
| Redis | Upstash / Redis Cloud | Get host/port/password |

---

## Database Setup & Management

### MongoDB Collections (26 schemas)

| Module | Collections |
|--------|-------------|
| **Auth** | `users`, `user-profiles`, `colleges`, `refresh-tokens` |
| **Education** | `courses`, `sections`, `lessons`, `lesson-progresses`, `enrollments`, `quizzes`, `quiz-attempts`, `quiz-questions`, `assignments`, `assignment-submissions`, `reviews`, `categories` |
| **AI** | `ai-conversations`, `ai-documents` |
| **Media** | `media-assets` |
| **Notifications** | `notifications`, `device-tokens` |
| **Certificates** | `certificates` |
| **Analytics** | `activity-logs` |
| **Fitness** | `fitness-sessions`, `fitness-daily-metrics`, `fitness-profiles`, `fitness-goals` |
| **Dietary** | `dietary-meals`, `dietary-daily-nutrition`, `dietary-profiles`, `dietary-goals`, `dietary-supplements`, `dietary-meal-plans`, `dietary-grocery-lists` |
| **Grooming** | `grooming-profiles`, `grooming-recommendations`, `grooming-visual-analyses` |

### MongoDB Security (Production)

```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "STRONG_PASSWORD_HERE",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

# Create app user
use eduplatform
db.createUser({
  user: "heybobo_app",
  pwd: "APP_PASSWORD_HERE",
  roles: [{ role: "readWrite", db: "eduplatform" }]
})
```

Update `MONGODB_URI`:
```
mongodb://heybobo_app:APP_PASSWORD_HERE@localhost:27017/eduplatform
```

Enable auth in `/etc/mongod.conf`:
```yaml
security:
  authorization: enabled
```

### MongoDB Indexes (Recommended)

```javascript
// Performance indexes — run in mongosh
use eduplatform

db.users.createIndex({ email: 1 }, { unique: true })
db.courses.createIndex({ slug: 1 }, { unique: true })
db.courses.createIndex({ instructor: 1, status: 1 })
db.enrollments.createIndex({ userId: 1, courseId: 1 }, { unique: true })
db['lesson-progresses'].createIndex({ userId: 1, lessonId: 1 })
db['fitness-sessions'].createIndex({ userId: 1, startTime: -1 })
db['dietary-meals'].createIndex({ userId: 1, date: -1 })
db['grooming-recommendations'].createIndex({ userId: 1, type: 1 })
db['grooming-visual-analyses'].createIndex({ userId: 1, analysisType: 1 })
```

### Backup & Restore

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/eduplatform" --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/eduplatform" /backups/20260323/eduplatform

# Automated daily backup (add to crontab)
# crontab -e
0 2 * * * mongodump --uri="mongodb://localhost:27017/eduplatform" --out=/backups/$(date +\%Y\%m\%d) --gzip && find /backups -mtime +7 -delete
```

### Redis Configuration (Production)

Edit `/etc/redis/redis.conf`:
```
maxmemory 256mb
maxmemory-policy allkeys-lru
requirepass YOUR_REDIS_PASSWORD
```

---

## External Services Setup

### Google Gemini AI (Required)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key
3. Set `GEMINI_API_KEY` in backend `.env`
4. Used for: AI Tutor chat, meal plan generation, food photo analysis, grooming recommendations, visual analysis

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs:
   - Dev: `http://localhost:3001/api/v1/auth/google/callback`
   - Prod: `https://yourdomain.com/api/v1/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`

### Mux Video (Optional)

1. Sign up at [Mux](https://dashboard.mux.com)
2. Create an API Access Token (Settings → API Access Tokens)
3. Set `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`
4. For webhooks: create a webhook endpoint → `https://yourdomain.com/api/v1/media/mux/webhook`
5. Set `MUX_WEBHOOK_SECRET`

### Email / SMTP (Optional)

For Gmail:
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Set `EMAIL_USER=your-email@gmail.com`, `EMAIL_PASS=your-app-password`

For production, consider: SendGrid, Mailgun, Amazon SES.

### AWS S3 (Optional — Production file storage)

1. Create an S3 bucket
2. Create an IAM user with `AmazonS3FullAccess` (or scoped policy)
3. Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`

---

## Frontend Configuration

### Build Configuration (`vite.config.ts`)

| Feature | Details |
|---------|---------|
| **Path alias** | `@/` → `./src/` |
| **Dev proxy** | `/api/v1` proxied to `http://localhost:3001` |
| **Code splitting** | `vendor-react`, `vendor-query`, `vendor-charts`, `vendor-ui` chunks |
| **Build output** | `frontend/dist/` |

### Build for production

```bash
cd frontend
VITE_API_URL=https://yourdomain.com/api/v1 npm run build
```

### Key frontend dependencies

| Package | Purpose |
|---------|---------|
| React 18 + React Router | UI framework + routing |
| MUI (Material UI) | Component library |
| TailwindCSS | Utility-first CSS |
| Zustand | State management |
| React Query (TanStack) | Server state + caching |
| @google/generative-ai | Gemini AI (client-side) |
| Recharts | Charts and graphs |
| @tensorflow/tfjs + @tensorflow-models/pose-detection | Live workout pose detection |
| Axios | HTTP client |

---

## Backend Configuration

### Server Configuration (`main.ts`)

| Feature | Details |
|---------|---------|
| **Port** | `PORT` env, default `3001`, binds `0.0.0.0` |
| **CORS** | Origin = `FRONTEND_URL`, credentials enabled |
| **Helmet** | Security headers middleware |
| **Rate limiting** | General: 1000 req/15min; Auth: 5 req/15min |
| **Validation** | Whitelist + forbidNonWhitelisted + transform |
| **Swagger** | `/api/v1/docs` with bearer auth |
| **Trust proxy** | Level 1 (for reverse proxy) |
| **Graceful shutdown** | `SIGTERM` + `SIGINT` handlers |

### Backend Modules (12 feature modules)

| Module | Endpoints Prefix |
|--------|-----------------|
| AuthModule | `/api/v1/auth/` |
| UsersModule | `/api/v1/users/` |
| EducationModule | `/api/v1/courses/`, `/api/v1/lessons/`, `/api/v1/quizzes/`, etc. |
| MediaModule | `/api/v1/media/` |
| AIModule | `/api/v1/ai/` |
| NotificationsModule | `/api/v1/notifications/` |
| CertificatesModule | `/api/v1/certificates/` |
| AnalyticsModule | `/api/v1/analytics/` |
| AdminModule | `/api/v1/admin/` |
| FitnessModule | `/api/v1/fitness/` |
| DietaryModule | `/api/v1/dietary/` |
| GroomingModule | `/api/v1/grooming/` |

### Infrastructure Modules

| Module | Purpose |
|--------|---------|
| BullModule | Job queues via Redis (email, notifications) |
| CacheModule | Redis-based caching |
| ThrottlerModule | Rate limiting (60s window, 10 requests) |
| EventEmitterModule | Internal event bus |
| ScheduleModule | Cron jobs |
| ConfigModule | Environment variable management |

### PM2 Ecosystem (Production)

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [{
    name: 'heybobo-backend',
    cwd: './backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    max_memory_restart: '500M',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
  }]
};
```

```bash
pm2 start ecosystem.config.js --env production
```

---

## Nginx & Reverse Proxy

See the full Nginx configuration in [Production Deployment > Step 6](#option-a-vps--cloud-vm-recommended-for-small-medium-scale).

Key routing rules:

| Path | Target |
|------|--------|
| `/api/v1/*` | Backend (`127.0.0.1:3001`) |
| `/uploads/*` | Backend (`127.0.0.1:3001`) — cached 30 days |
| `*.js, *.css, *.png, ...` | Static files — cached 1 year |
| Everything else | `index.html` (SPA fallback) |

---

## SSL/TLS Setup

### Let's Encrypt (Free)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Verify SSL

```bash
curl -I https://yourdomain.com
# Should show: HTTP/2 200, strict-transport-security header
```

---

## Monitoring & Logging

### Backend Logging (Winston)

| Log File | Level | Format | Rotation |
|----------|-------|--------|----------|
| `logs/app.log` | All levels | JSON | 10 MB, 5 files |
| `logs/error.log` | Errors only | JSON | 10 MB, 10 files |
| Console | All levels | Colorized text | — |

### Frontend Error Logging

Client-side errors are captured by `errorLogger` (localStorage-based, 200 entry cap) with console output in dev mode. Errors include:
- All API call failures (hooks, pages, stores)
- Gemini AI call failures
- Background sync failures

### PM2 Monitoring

```bash
pm2 monit                  # Real-time dashboard
pm2 logs heybobo-backend   # Tail logs
pm2 status                 # Process status
```

### Health Checks

```bash
# Backend API
curl -s http://localhost:3001/api/v1/docs | head -5

# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Redis
redis-cli ping
```

---

## Troubleshooting

### Backend won't start

```bash
# Check if port is in use
lsof -i :3001

# Kill stale process
lsof -ti :3001 | xargs kill -9

# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check Redis is running
redis-cli ping

# Check logs
cat backend/logs/error.log | tail -20
```

### Frontend build fails

```bash
# Check TypeScript errors
cd frontend && npx tsc --noEmit

# Clear cache and rebuild
rm -rf node_modules/.vite dist
npm run build
```

### CORS errors

- Ensure `FRONTEND_URL` in `backend/.env` matches exactly (no trailing slash)
- For production: must be `https://yourdomain.com` (not `http://`)

### MongoDB connection fails

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
mongosh "mongodb://localhost:27017/eduplatform"

# If auth enabled, include credentials
mongosh "mongodb://user:pass@localhost:27017/eduplatform?authSource=admin"
```

### Redis connection fails

```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli -h localhost -p 6379 ping

# With password
redis-cli -h localhost -p 6379 -a YOUR_PASSWORD ping
```

### Docker issues

```bash
# View all container logs
docker-compose logs --tail=50

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build

# Check container health
docker-compose ps
docker stats
```

### Common fixes

| Issue | Fix |
|-------|-----|
| `EADDRINUSE :3001` | `lsof -ti :3001 \| xargs kill -9` |
| `MongoNetworkError` | Start MongoDB: `sudo systemctl start mongod` |
| `ECONNREFUSED :6379` | Start Redis: `sudo systemctl start redis-server` |
| Swagger not loading | Visit `http://localhost:3001/api/v1/docs` (note the `/api/v1` prefix) |
| Google OAuth 403 | Check redirect URI matches `GOOGLE_CALLBACK_URL` exactly |
| AI features broken | Verify `GEMINI_API_KEY` is set and valid |
| Upload fails | Check `uploads/` directory exists and has write permissions |

---

## Quick Reference

```bash
# Generate secure JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Start local dev (from project root)
cd backend && npm run start:dev &
cd frontend && npm run dev

# Docker full stack
docker-compose up -d --build

# Production deploy
cd backend && npm ci && npm run build
cd frontend && npm ci && npm run build
pm2 start dist/main.js --name heybobo-backend

# Git push
git add -A && git commit -m "update" && git push origin main
```

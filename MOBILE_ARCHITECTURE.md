# EduPlatform — React Native Mobile App Architecture

> **Scope:** Full mobile front-end for EduPlatform using React Native (Expo managed workflow). The existing NestJS backend, MongoDB database, and all REST APIs are reused unchanged. This document covers every feature module present in the web app.

---

## 1. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React Native 0.74 + Expo SDK 51 | Managed workflow; eject to bare when needed (BLE, TF) |
| Language | TypeScript 5 | Strict mode, same types as web |
| Navigation | React Navigation v6 | Stack + Bottom Tabs + Drawer |
| State — client | Zustand 4 | Port all existing stores (auth, course, fitness, dietary, etc.) |
| State — server | TanStack React Query v5 | Port all existing hooks; same query keys |
| HTTP client | Axios | Same interceptor pattern as web (JWT inject + auto-refresh) |
| Styling | NativeWind v4 (Tailwind for RN) + StyleSheet | Utility classes + custom StyleSheets for native perf |
| Animations | React Native Reanimated 3 + Moti | Smooth 60/120fps animations |
| Video | Mux — `mux-player-react-native` (or `expo-video`) | HLS streaming of Mux assets |
| AI (client-side) | `@google/generative-ai` | Same Gemini calls as web (dietary, grooming, tutor) |
| Push notifications | Expo Notifications | Firebase (Android) / APNs (iOS) |
| Storage | MMKV (`react-native-mmkv`) | Replaces localStorage; fast native key-value store |
| Auth persistence | MMKV + Keychain (`expo-secure-store`) | Secure token storage |
| BLE Wearables | `react-native-ble-plx` | Replaces Web Bluetooth API; same GATT profiles |
| Camera | `expo-camera` + `expo-image-picker` | For grooming visual analysis, profile photo |
| Pose Detection | TensorFlow.js RN (`@tensorflow/tfjs-react-native`) | Live workout pose tracking |
| PDF | `react-native-pdf` | View lesson PDFs and certificates |
| PDF Generation | Expo Print + `react-native-html-to-pdf` | Certificate generation |
| File system | `expo-file-system` | Upload attachments, cache files |
| Deep linking | Expo Linking + Universal Links | OAuth callbacks, shared course links |
| Offline | React Query persistence (`createAsyncStoragePersister`) | Cache-first offline reads |
| Build / CI | EAS Build (Expo Application Services) | Cloud builds for iOS and Android |
| OTA Updates | EAS Update | Push JS bundle updates without app store review |

---

## 2. Project Structure

```
eduplatform-mobile/
├── app.json                        # Expo config
├── eas.json                        # EAS Build profiles
├── babel.config.js
├── tailwind.config.js
├── tsconfig.json
│
├── src/
│   ├── api/                        # All Axios service modules (ported from web lib/api.ts)
│   │   ├── client.ts               # Axios instance + JWT interceptors
│   │   ├── auth.api.ts
│   │   ├── education.api.ts
│   │   ├── ai.api.ts
│   │   ├── fitness.api.ts
│   │   ├── dietary.api.ts
│   │   ├── grooming.api.ts
│   │   ├── notifications.api.ts
│   │   ├── certificates.api.ts
│   │   ├── analytics.api.ts
│   │   └── admin.api.ts
│   │
│   ├── store/                      # Zustand stores (ported from web)
│   │   ├── authStore.ts            # JWT tokens stored in expo-secure-store
│   │   ├── courseStore.ts
│   │   ├── aiTutorStore.ts
│   │   ├── fitnessProfileStore.ts
│   │   ├── liveWorkoutStore.ts
│   │   ├── dietaryProfileStore.ts
│   │   ├── activityTrackingStore.ts
│   │   ├── wearablesStore.ts
│   │   ├── meetingStore.ts
│   │   └── uiStore.ts
│   │
│   ├── hooks/                      # React Query hooks (ported from web)
│   │   ├── useAuth.ts
│   │   ├── useCourses.ts
│   │   ├── useEnrollment.ts
│   │   ├── useProgress.ts
│   │   ├── useQuiz.ts
│   │   ├── useAI.ts
│   │   ├── useNotifications.ts
│   │   ├── useFitness.ts
│   │   ├── useDietary.ts
│   │   └── useGrooming.ts
│   │
│   ├── navigation/                 # React Navigation setup
│   │   ├── RootNavigator.tsx       # Auth gate: show AuthStack or MainTabs
│   │   ├── AuthStack.tsx
│   │   ├── MainTabs.tsx            # Bottom tab bar (5 primary tabs)
│   │   ├── StudentStack.tsx
│   │   ├── TeacherStack.tsx
│   │   ├── AdminStack.tsx
│   │   ├── AppStack.tsx            # /app/* unified shell
│   │   ├── HealthStack.tsx
│   │   ├── DietaryStack.tsx
│   │   └── GroomingStack.tsx
│   │
│   ├── screens/                    # One folder per route group
│   │   ├── auth/
│   │   ├── student/
│   │   ├── teacher/
│   │   ├── admin/
│   │   ├── app/
│   │   │   ├── health/
│   │   │   ├── dietary/
│   │   │   └── grooming/
│   │   └── shared/                 # Profile, Settings, Notifications
│   │
│   ├── components/
│   │   ├── common/                 # Button, Input, Card, Modal, LoadingScreen, etc.
│   │   ├── layout/                 # AppHeader, BottomTabBar, DrawerMenu
│   │   ├── education/              # VideoPlayer, LessonCard, QuizRenderer, etc.
│   │   ├── fitness/                # WorkoutCard, PoseCamera, MetricsChart
│   │   ├── dietary/                # MacroChart, MealCard, NutritionRing
│   │   ├── grooming/               # VisualAnalysisCamera, RecommendationCard
│   │   └── ai/                     # AiTutorChat, MessageBubble, StreamingText
│   │
│   ├── lib/
│   │   ├── queryClient.ts          # React Query client + MMKV persister
│   │   ├── gemini.ts               # Gemini SDK (same as web)
│   │   ├── bleService.ts           # react-native-ble-plx (replaces Web Bluetooth)
│   │   ├── poseDetection.ts        # TF.js RN pose detection (replaces web canvas impl)
│   │   ├── storage.ts              # MMKV wrapper (replaces localStorage)
│   │   ├── notifications.ts        # Expo push notification setup
│   │   ├── deepLinking.ts          # Universal links + OAuth callback handling
│   │   └── errorLogger.ts
│   │
│   └── types/
│       └── index.ts                # Shared with backend (same User, Course, Fitness, etc. types)
```

---

## 3. Navigation Architecture

```
RootNavigator
├── (not authenticated)
│   └── AuthStack
│       ├── HomeScreen          (landing / marketing)
│       ├── LoginScreen
│       ├── RegisterScreen
│       ├── ForgotPasswordScreen
│       ├── ResetPasswordScreen
│       └── OAuthCallbackScreen  (deep link: eduplatform://auth/callback)
│
└── (authenticated)
    └── MainTabs  [Bottom Tab Bar]
        │
        ├── Tab: Home  →  AIBrainScreen  (default hub)
        │
        ├── Tab: Learn  →  EducationStack
        │   ├── CoursesListScreen
        │   ├── CoursePlayerScreen
        │   ├── LessonPlayerScreen       (Mux video + article)
        │   ├── QuizScreen
        │   ├── AssignmentScreen
        │   ├── CertificatesScreen
        │   └── SearchScreen
        │
        ├── Tab: AI Tutor  →  AITutorScreen
        │
        ├── Tab: Health  →  HealthStack
        │   ├── HealthFitnessScreen      (hub)
        │   ├── FitnessProfileScreen
        │   ├── WorkoutsScreen
        │   ├── LiveWorkoutScreen        (camera + pose detection)
        │   ├── ActivityTrackingScreen
        │   ├── WearablesScreen          (BLE pairing)
        │   ├── DietaryStack
        │   │   ├── DietaryDashboard
        │   │   ├── MealLogScreen
        │   │   ├── NutritionTrackerScreen
        │   │   ├── MealPlannerScreen
        │   │   ├── DietaryProfileScreen
        │   │   ├── DietaryGoalsScreen
        │   │   └── GroceryScreen
        │   └── GroomingStack
        │       ├── GroomingDashboard
        │       ├── VisualAnalysisScreen  (camera → Gemini Vision)
        │       └── RecommendationsScreen
        │
        └── Tab: Profile  →  ProfileStack
            ├── ProfileScreen
            ├── NotificationsScreen
            ├── SettingsScreen
            └── [Role-gated]
                ├── TeacherPortalDrawer  (TEACHER / CREATOR roles)
                │   ├── TeacherDashboard
                │   ├── CoursesScreen
                │   ├── CourseBuilderScreen
                │   ├── SectionManagerScreen
                │   ├── LessonEditorScreen
                │   ├── QuizBuilderScreen
                │   ├── AssignmentManagerScreen
                │   ├── StudentsScreen
                │   └── AnalyticsScreen
                └── AdminPortalDrawer   (ADMIN role)
                    ├── AdminDashboard
                    ├── UsersScreen
                    ├── TeachersScreen
                    ├── CoursesScreen
                    ├── CategoriesScreen
                    ├── AnalyticsScreen
                    └── CertificatesScreen
```

---

## 4. Authentication Flow

### JWT + Refresh (same as web)
```
App Launch
│
├─ Read secureStore("access_token") + secureStore("refresh_token")
├─ If tokens exist → hydrate authStore → navigate to MainTabs
├─ On any 401 → Axios interceptor auto-calls POST /auth/refresh
│     ├─ Success: store new tokens, retry original request
│     └─ Fail: logout, navigate to AuthStack
│
├─ Login (email/password) → POST /auth/login
├─ Register               → POST /auth/register
└─ Google OAuth
      ├─ Open in-app browser (expo-web-browser)
      ├─ Backend redirects to: eduplatform://auth/callback?token=...
      └─ Deep link handler → extract token → store in authStore
```

### Token Storage
- Access token: `expo-secure-store` (iOS Keychain / Android Keystore)
- Refresh token: `expo-secure-store`
- User profile: `MMKV` (fast, non-sensitive)

---

## 5. State Management

Identical pattern to the web app — **Zustand for client state, React Query for server state**.

### Key Zustand Stores (native adaptations)

| Store | Native change |
|---|---|
| `authStore` | `expo-secure-store` replaces `localStorage` for tokens |
| `fitnessProfileStore` | `MMKV` replaces `localStorage` for persistence |
| `dietaryProfileStore` | Zustand `persist` middleware with MMKV adapter |
| `wearablesStore` | Drives `react-native-ble-plx` (vs Web Bluetooth) |
| `liveWorkoutStore` | Feeds TF.js RN pose detector via camera frame processor |

### React Query Persistence (Offline Support)
```ts
// lib/queryClient.ts
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV({ id: 'rq-cache' })
const asyncStorage = {
  getItem: (key) => Promise.resolve(storage.getString(key) ?? null),
  setItem: (key, value) => { storage.set(key, value); return Promise.resolve() },
  removeItem: (key) => { storage.delete(key); return Promise.resolve() },
}
export const persister = createAsyncStoragePersister({ storage: asyncStorage })
```
Cached query data survives app restarts and supports full offline reads for previously fetched courses, health data, and AI conversations.

---

## 6. Feature Module Details

### 6.1 Education (LMS)

| Web feature | Mobile implementation |
|---|---|
| Video lessons (Mux HLS) | `expo-video` with Mux playback URL; supports PiP on iOS |
| Lesson progress sync | `POST /education/lessons/:id/progress` on every 5s seek event |
| Quiz renderer | Native question cards with animated progress bar (Reanimated) |
| Assignment submission | File picker via `expo-document-picker` + `expo-file-system` upload |
| PDF resources | `react-native-pdf` viewer in bottom sheet |
| Course search | Debounced search against `GET /education/courses` |
| Certificates | PDF viewed via `react-native-pdf`; share via `expo-sharing` |

### 6.2 AI Tutor

- Streaming chat UI using Gemini via `@google/generative-ai` (client-side) or backend `/ai/chat`
- `FlatList` with inverted scroll for chat messages
- Voice input via `expo-speech` + `expo-av` recording → send text to Gemini
- Markdown rendering via `react-native-markdown-display`
- Code blocks highlighted via `react-native-syntax-highlighter`
- Conversation history persisted in `aiTutorStore` (MMKV backed)

### 6.3 Fitness & Live Workout

| Feature | Implementation |
|---|---|
| Fitness profile onboarding | Multi-step modal stack with animated progress |
| Workout plans | Card list from `GET /fitness/workouts`; Zustand `workoutSystemStore` |
| Live workout (pose detection) | `react-native-vision-camera` + TF.js RN `@tensorflow-models/pose-detection`; MoveNet model |
| Real-time metrics overlay | Reanimated worklets for 60fps overlay on camera frame |
| Activity tracking | Step counter via `expo-sensors` (Pedometer) + manual log via backend |
| Wearables (BLE) | `react-native-ble-plx` scans same GATT UUIDs as web bleService; heart rate, SpO2, weight |
| Metrics charts | Victory Native XL or Recharts RN (line charts for activity history) |

### 6.4 Dietary

| Feature | Implementation |
|---|---|
| Meal log | `POST /dietary/meals` with MealType enum, macros |
| Barcode scanner | `expo-barcode-scanner` → lookup food item from backend or Open Food Facts |
| AI meal analysis | Photo capture → Gemini Vision API → auto-fill macros (same `lib/gemini.ts`) |
| Nutrition ring chart | `react-native-svg` doughnut chart (replaces web Recharts) |
| Meal planner | Weekly calendar grid built with `react-native-calendars` |
| Grocery list | Checklist with offline MMKV persistence |
| Water tracker | Native push notification reminders via `expo-notifications` |

### 6.5 Grooming

| Feature | Implementation |
|---|---|
| Visual analysis | `expo-camera` → capture → Gemini Vision → skin/hair recommendations |
| Dashboard | Routine cards, product recommendations from backend `/grooming` |
| AI recommendations | Same `lib/gemini.ts` with image-to-text model call |
| Progress photos | Stored in `expo-file-system`; upload via `POST /grooming/photos` |

### 6.6 Groups & Meetings

- Groups list and chat: `GET /groups`, real-time via Socket.io client (`socket.io-client`)
- Meeting scheduler: Calendar picker + `POST /meetings`; in-app video via WebRTC or Whereby embed in `expo-web-browser`
- Meeting notifications: Push notification from backend Bull queue via Expo push service

### 6.7 Notifications

```
Backend Bull Queue
      │
      └─ Expo Push Notification Service  (HTTPS)
              │
              ├─ APNs  (iOS)
              └─ FCM   (Android)
                      │
                      └─ Device: expo-notifications receives + displays
```
- Foreground: custom in-app toast overlay
- Background: OS notification; tapping deep-links to relevant screen
- Notification preferences synced to `PATCH /notifications/preferences`

### 6.8 Teacher Portal (role-gated)

All CRUD accessible from mobile:
- Course builder: multi-step form with image picker for thumbnail
- Section / lesson manager: drag-to-reorder via `react-native-drag-list`
- Lesson editor: Rich text via `react-native-pell-rich-editor`; video upload from camera roll via Mux direct upload URL
- Quiz builder: Dynamic question forms
- Analytics: Victory Native charts for enrollment and completion stats

### 6.9 Admin Portal (role-gated)

Accessible via dedicated drawer after role check:
- User management table with search + filter
- Teacher approval workflow
- Platform analytics dashboard (charts)
- Certificate management

---

## 7. API Client — Axios Setup (Native)

```ts
// src/api/client.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,  // same NestJS backend
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request — inject JWT
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response — auto-refresh on 401
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const refresh = await SecureStore.getItemAsync('refresh_token')
      const { data } = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken: refresh })
      await SecureStore.setItemAsync('access_token', data.accessToken)
      error.config.headers.Authorization = `Bearer ${data.accessToken}`
      return client(error.config)
    }
    return Promise.reject(error)
  }
)

export default client
```

---

## 8. BLE Wearables Service (Native Replacement)

```ts
// src/lib/bleService.ts  — replaces web bleService.ts
import { BleManager, Device } from 'react-native-ble-plx'

export const BLE_SERVICES = {
  heartRate:            '0000180d-0000-1000-8000-00805f9b34fb',
  battery:              '0000180f-0000-1000-8000-00805f9b34fb',
  bloodPressure:        '00001810-0000-1000-8000-00805f9b34fb',
  weightScale:          '0000181d-0000-1000-8000-00805f9b34fb',
  runningSpeedCadence:  '00001814-0000-1000-8000-00805f9b34fb',
} as const

const manager = new BleManager()

export async function scanAndConnect(onDevice: (d: Device) => void) {
  manager.startDeviceScan(null, null, (error, device) => {
    if (error) return
    if (device) onDevice(device)
  })
}

export async function subscribeHeartRate(device: Device, cb: (bpm: number) => void) {
  await device.connect()
  await device.discoverAllServicesAndCharacteristics()
  device.monitorCharacteristicForService(
    BLE_SERVICES.heartRate,
    '00002a37-0000-1000-8000-00805f9b34fb',
    (error, char) => {
      if (char?.value) {
        const bytes = Buffer.from(char.value, 'base64')
        cb(bytes[1])  // standard BLE heart rate measurement format
      }
    }
  )
}
```

Same GATT UUIDs and data parsing logic as the web service — only the transport layer changes.

---

## 9. Live Workout — Pose Detection (Native)

```ts
// Runs as a VisionCamera frame processor plugin
import { usePoseDetection } from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-react-native'

// Frame processor worklet (runs on camera thread at 30fps)
const frameProcessor = useFrameProcessor((frame) => {
  'worklet'
  const poses = detectPose(frame)        // TF.js worklet
  runOnJS(updateLiveWorkoutStore)(poses)  // sync to Zustand store
}, [])
```

Pose keypoints are rendered as an SVG overlay via `react-native-svg` on top of the camera preview — same logic as the web TensorFlow.js canvas implementation.

---

## 10. Performance Strategies

| Concern | Strategy |
|---|---|
| Large course lists | `FlashList` (Shopify) instead of FlatList — 10x faster for 100+ items |
| Image loading | `expo-image` with caching + blurhash placeholders |
| Animations | Reanimated worklets run on UI thread, avoid JS bridge bottleneck |
| Video buffering | Mux adaptive HLS; expo-video built-in buffer management |
| Offline | React Query MMKV persister caches all GET responses; mutations queue with `react-query-offline-manager` |
| Bundle size | Expo tree shaking + EAS build; lazy screens via `React.lazy` equivalent (React Navigation lazy) |
| Token reads | MMKV is synchronous — no async waterfall on startup for non-sensitive data |

---

## 11. Deep Linking & Universal Links

```
eduplatform://auth/callback         → OAuthCallbackScreen
eduplatform://course/:courseId      → CoursePlayerScreen
eduplatform://lesson/:courseId/:lessonId → LessonPlayerScreen
eduplatform://certificate/:id       → CertificatesScreen
eduplatform://reset-password/:token → ResetPasswordScreen
```

Configured in `app.json` under `expo.scheme: "eduplatform"` and registered with Apple (`.well-known/apple-app-site-association`) and Android (App Links) on the NestJS backend static files.

---

## 12. Push Notification Architecture

```
Backend sends:
  await expo.sendPushNotificationsAsync([{
    to: user.expoPushToken,          // stored on User model in MongoDB
    title: 'New lesson available',
    body: 'Your next lesson is ready',
    data: { route: '/app/education/courseId' },
  }])

Mobile receives:
  Notifications.addNotificationResponseReceivedListener(response => {
    const { route } = response.notification.request.content.data
    navigation.navigate(route)       // deep link into app
  })
```
Push tokens registered at login via `PATCH /users/push-token`.

---

## 13. Build & Release Pipeline

```
Developer  →  git push
                │
                └─ GitHub Actions
                      ├─ Lint + TypeScript check
                      ├─ Unit tests (Jest + React Native Testing Library)
                      └─ eas build --platform all --profile preview
                                    │
                                    ├─ iOS .ipa  → TestFlight
                                    └─ Android .aab → Play Store Internal Track

Production release:
  eas build --platform all --profile production
  eas submit --platform all                        # auto-submit to stores
  eas update                                       # OTA JS update (no store review)
```

### EAS Build Profiles (`eas.json`)
```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal" },
    "production":  { "autoIncrement": true }
  }
}
```

---

## 14. Environment Configuration

```env
# .env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
EXPO_PUBLIC_GEMINI_API_KEY=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
EXPO_PUBLIC_MUX_ENV_KEY=...
```
`EXPO_PUBLIC_*` vars are inlined at build time by Expo. Secrets (JWT secrets, MUX token) remain server-side only.

---

## 15. Backend Changes Required (Minimal)

The existing NestJS backend requires only these small additions:

| Change | Why |
|---|---|
| Add `expoPushToken` field to `User` schema | For push notification delivery |
| Add `PATCH /users/push-token` endpoint | Called on every app launch to update token |
| Register `eduplatform://` as allowed OAuth redirect | Google OAuth callback for mobile |
| Add Universal Link files to static serving | `/.well-known/apple-app-site-association` + `assetlinks.json` |

All existing REST APIs, MongoDB schemas, Redis queues, and Bull jobs work without any changes.

---

## 16. Key Library Versions

```json
{
  "expo": "~51.0.0",
  "react-native": "0.74.x",
  "@react-navigation/native": "^6.1",
  "@react-navigation/bottom-tabs": "^6.5",
  "@react-navigation/stack": "^6.3",
  "zustand": "^4.5",
  "@tanstack/react-query": "^5.0",
  "axios": "^1.6",
  "nativewind": "^4.0",
  "react-native-reanimated": "~3.10",
  "react-native-mmkv": "^2.12",
  "expo-secure-store": "~13.0",
  "react-native-ble-plx": "^3.1",
  "react-native-vision-camera": "^4.0",
  "@tensorflow/tfjs-react-native": "^0.8",
  "@tensorflow-models/pose-detection": "^2.1",
  "expo-notifications": "~0.28",
  "expo-video": "~1.2",
  "@google/generative-ai": "^0.3",
  "@shopify/flash-list": "^1.6",
  "react-native-svg": "15.x",
  "react-native-pdf": "^6.7",
  "expo-camera": "~15.0",
  "expo-document-picker": "~12.0",
  "expo-file-system": "~17.0",
  "react-native-markdown-display": "^7.0",
  "socket.io-client": "^4.7"
}
```

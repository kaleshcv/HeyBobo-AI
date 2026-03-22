# EduPlatform Frontend

A modern, production-ready React + Vite frontend for an education platform (like Coursera) with comprehensive features for students, teachers, and administrators.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router v6** - Client-side routing with lazy loading
- **TanStack Query v5** - Server state management
- **Zustand** - Client state management
- **React Hook Form + Zod** - Form handling and validation
- **Tailwind CSS** - Styling with custom design system
- **Lucide React** - Icon library
- **React Player** - Video playback (supports HLS/Mux)
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications
- **Axios** - HTTP client with interceptors
- **date-fns** - Date formatting utilities

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Base UI components (Button, Input, etc.)
│   ├── layout/            # Layout components (Header, Sidebar, etc.)
│   └── common/            # Reusable feature components
├── pages/
│   ├── public/           # Home, Courses, Course Detail, About, 404
│   ├── auth/             # Login, Register, Password Reset
│   ├── student/          # Student dashboard, learning, courses
│   ├── teacher/          # Teacher dashboard, course builder
│   └── admin/            # Admin dashboard, user management
├── hooks/                 # Custom React hooks (useAuth, useCourses, etc.)
├── store/                 # Zustand stores (auth, UI state)
├── lib/
│   ├── api.ts            # Axios instance + API functions
│   ├── validators.ts     # Zod schemas for form validation
│   ├── utils.ts          # Utility functions
│   └── queryClient.ts    # TanStack Query configuration
├── types/                 # TypeScript type definitions
├── router/               # React Router configuration
├── main.tsx              # Entry point
├── App.tsx               # Root component
└── index.css             # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your configuration
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

## Configuration

Create a `.env.local` file with the following variables:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_MUX_ENV_KEY=your-mux-env-key
VITE_APP_NAME=EduPlatform
VITE_APP_URL=http://localhost:5173
```

## Key Features

### Authentication
- Login/Register with email
- OAuth (Google) integration
- JWT token management with automatic refresh
- Protected routes with role-based access

### Student Features
- Course discovery and search
- Enrollment management
- Video lesson player with progress tracking
- Quiz attempts with instant feedback
- Assignment submissions
- AI tutor chatbot
- Certificate earning and verification
- Learning dashboard with stats
- Bookmark management

### Teacher Features
- Course creation and editing
- Curriculum management (sections & lessons)
- Quiz builder
- Assignment management
- Student progress analytics
- Revenue tracking
- Course publishing workflow

### Admin Features
- User management
- Teacher approval system
- Course moderation
- Platform analytics
- Category management
- Certificate management

## API Integration

The application uses a centralized API layer (`src/lib/api.ts`) with:

- Automatic request/response interceptors
- Token refresh on 401
- Typed API functions organized by module
- Error handling

Example API call:

```typescript
// In a component
import { useCourses } from '@/hooks/useCourses'

function MyComponent() {
  const { data: courses, isLoading } = useCourses({
    page: 1,
    pageSize: 12
  })
  // ...
}
```

## Forms & Validation

Forms use React Hook Form + Zod for validation:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validators'

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })
  // ...
}
```

## State Management

- **Auth State** (Zustand): User, tokens, authentication status
- **UI State** (Zustand): Sidebar state, theme, mobile menu
- **Server State** (TanStack Query): All API data with caching

## Styling

Uses Tailwind CSS with a custom design system:

- **Colors**: Primary (blue), Secondary (purple), Success, Warning, Error
- **Responsive**: Mobile-first approach
- **Components**: Pre-built UI components with consistent styling
- **Animations**: Smooth transitions and loading states

## Best Practices

1. **Type Safety**: All components and functions are fully typed
2. **Error Handling**: Comprehensive error states and user feedback
3. **Loading States**: Skeleton screens and spinners for better UX
4. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
5. **Code Organization**: Modular structure with clear separation of concerns
6. **Performance**: Code splitting, lazy loading, optimized queries

## Common Tasks

### Adding a New Page

1. Create file in `src/pages/{section}/PageName.tsx`
2. Add route in `src/router/index.tsx`
3. Import with lazy loading using `lazy()`

### Creating a New Hook

1. Create file in `src/hooks/useFeatureName.ts`
2. Use TanStack Query (queries) or zustand (state)
3. Export typed functions/hooks

### Adding API Endpoints

1. Add function in `src/lib/api.ts` with proper typing
2. Create custom hook in `src/hooks/` if needed
3. Use in components with TanStack Query

## Debugging

- Redux DevTools support via TanStack Query DevTools
- Console errors logged in development
- Type checking with TypeScript
- ESLint configuration for code quality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with lazy route loading
- Image optimization placeholders
- Query caching with TanStack Query
- CSS-in-JS with Tailwind
- Minified production builds

## Contributing

1. Follow the existing code structure
2. Write TypeScript with strict mode
3. Use the established UI components
4. Add proper error handling
5. Include loading and empty states

## License

Proprietary - EduPlatform

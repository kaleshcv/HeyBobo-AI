# Quick Start Guide

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Update API URL and other variables in .env.local
```

## Development

```bash
# Start development server
npm run dev

# Visit http://localhost:5173
# API calls proxied to http://localhost:3001/api/v1
```

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Features

### Authentication
- Email/password login
- Google OAuth (configured via .env)
- Automatic token refresh
- Role-based access control

### Student Features
- Course discovery (10,000+ courses)
- Video lesson player
- Progress tracking
- Quizzes and assignments
- AI tutor chatbot
- Certificates
- Learning dashboard

### Teacher Features
- Course creation and management
- Multi-step course builder
- Quiz builder
- Student management
- Analytics dashboard
- Revenue tracking

### Admin Features
- User management
- Course moderation
- Teacher approvals
- Platform analytics
- Category management

## Project Structure

```
src/
├── components/        # UI, Layout, and Feature components
├── pages/            # Page components (Public, Auth, Student, Teacher, Admin)
├── hooks/            # Custom React hooks
├── store/            # Zustand state stores
├── router/           # React Router configuration
├── lib/              # API, validators, utilities
└── types/            # TypeScript type definitions
```

## Key Technologies

- React 18 + TypeScript
- Vite (build tool)
- React Router v6 (routing)
- TanStack Query v5 (server state)
- Zustand (client state)
- React Hook Form + Zod (forms)
- Tailwind CSS (styling)
- Lucide React (icons)

## First Steps

1. **Start the backend**
   ```bash
   # Your backend should be running on http://localhost:3001
   ```

2. **Configure environment**
   - Edit `.env.local`
   - Set VITE_API_URL to your backend
   - Add Google OAuth credentials if needed

3. **Create a test account**
   - Register as a student or teacher
   - Explore the dashboard

4. **Test key flows**
   - Browse courses
   - Enroll in a course
   - Watch a video (if available)
   - Try the quiz
   - Check the AI tutor

## Useful Commands

```bash
# Type check
npx tsc --noEmit

# Lint code
npm run lint

# Format code
npx prettier --write src/

# Check build size
npm run build
```

## File Organization

- **UI Components** (`src/components/ui/`) - Base components like Button, Input, Card
- **Layouts** (`src/components/layout/`) - RootLayout, StudentLayout, TeacherLayout, AdminLayout
- **Pages** (`src/pages/`) - Full page components
- **Hooks** (`src/hooks/`) - Custom React hooks for data fetching
- **API** (`src/lib/api.ts`) - All API endpoints
- **Types** (`src/types/`) - TypeScript definitions

## Common Development Tasks

### Adding a new component
1. Create file in `src/components/` (appropriate subdirectory)
2. Export component as default or named export
3. Use in pages or other components

### Adding a new page
1. Create file in `src/pages/[section]/`
2. Add route in `src/router/index.tsx`
3. Use lazy loading with `lazy()`

### Adding an API call
1. Add function to appropriate module in `src/lib/api.ts`
2. Create custom hook in `src/hooks/` if needed
3. Use hook in component with `useQuery` or `useMutation`

### Form with validation
1. Define schema in `src/lib/validators.ts`
2. Use `useForm` with `zodResolver`
3. Display errors from `formState.errors`

## Troubleshooting

### API calls failing
- Check if backend is running on http://localhost:3001
- Verify VITE_API_URL in .env.local
- Check browser console for CORS errors

### Login not working
- Verify backend auth endpoints
- Check if JWT tokens are being set
- Look at Network tab in DevTools

### Pages not loading
- Check if route is added to router
- Verify page component exists
- Check browser console for errors

### Styling issues
- Tailwind CSS should be built automatically
- Restart dev server if CSS not updating
- Check tailwind.config.js for custom colors

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [TanStack Query](https://tanstack.com/query)
- [Zod Validation](https://zod.dev)

## Next Steps

1. Create test data in backend
2. Set up video hosting (Mux)
3. Configure email service (for password reset)
4. Set up Google OAuth
5. Deploy to production

---

**Happy coding! 🚀**

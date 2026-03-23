import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { asyncStorage } from './storage'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        1000 * 60 * 5,   // 5 minutes
      gcTime:           1000 * 60 * 60,  // 1 hour
      retry:            2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const persister = createAsyncStoragePersister({
  storage: asyncStorage,
  throttleTime: 1000,
})

// Query keys — centralised to avoid magic strings
export const queryKeys = {
  auth:          { profile: ['auth', 'profile'] },
  courses:       {
    list:          (filter?: object)  => ['courses', 'list', filter],
    detail:        (id: string)       => ['courses', 'detail', id],
    content:       (id: string)       => ['courses', 'content', id],
    reviews:       (id: string)       => ['courses', 'reviews', id],
    featured:      ['courses', 'featured'],
    categories:    ['courses', 'categories'],
  },
  enrollments:   {
    list:          ['enrollments', 'list'],
    detail:        (courseId: string) => ['enrollments', 'detail', courseId],
    stats:         ['enrollments', 'stats'],
  },
  lessons:       {
    detail:        (id: string)       => ['lessons', 'detail', id],
    progress:      (id: string)       => ['lessons', 'progress', id],
  },
  quiz:          {
    detail:        (id: string)       => ['quiz', 'detail', id],
    attempts:      (id: string)       => ['quiz', 'attempts', id],
  },
  ai:            {
    conversations: ['ai', 'conversations'],
    detail:        (id: string)       => ['ai', 'conversation', id],
  },
  fitness:       {
    profile:       ['fitness', 'profile'],
    plans:         ['fitness', 'plans'],
    sessions:      ['fitness', 'sessions'],
    activity:      (date?: string)    => ['fitness', 'activity', date],
    exercises:     (filter?: object)  => ['fitness', 'exercises', filter],
  },
  dietary:       {
    meals:         (date: string)     => ['dietary', 'meals', date],
    nutrition:     (date: string)     => ['dietary', 'nutrition', date],
    plans:         ['dietary', 'plans'],
    grocery:       ['dietary', 'grocery'],
  },
  grooming:      {
    profile:       ['grooming', 'profile'],
    recommendations: ['grooming', 'recommendations'],
    history:       ['grooming', 'history'],
  },
  notifications: {
    list:          ['notifications', 'list'],
  },
  admin:         {
    users:         (filter?: object)  => ['admin', 'users', filter],
    courses:       (filter?: object)  => ['admin', 'courses', filter],
    analytics:     ['admin', 'analytics'],
    certificates:  ['admin', 'certificates'],
    categories:    ['admin', 'categories'],
  },
  certificates:  { list: ['certificates', 'list'] },
  learningStats: ['learning', 'stats'],
}

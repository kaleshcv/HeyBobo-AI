import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low'
export type AlertSeverity = 'error' | 'warning' | 'info' | 'success'
export type RecommendationType = 'do-now' | 'recover' | 'learn' | 'buy' | 'plan' | 'monitor'
export type BrainMode = 'monitor' | 'priority' | 'safety' | 'coach' | 'planner' | 'sync' | 'insight'

export interface PriorityItem {
  id: string
  title: string
  description: string
  module: string
  level: PriorityLevel
  icon: string
  actionLabel?: string
  actionRoute?: string
  dueTime?: string
}

export interface BrainAlert {
  id: string
  title: string
  description: string
  module: string
  severity: AlertSeverity
  icon: string
  timestamp: string
  dismissed: boolean
}

export interface ScheduleEvent {
  id: string
  title: string
  time: string
  endTime?: string
  module: string
  icon: string
  color: string
  completed: boolean
}

export interface ModuleInsight {
  module: string
  label: string
  score: number
  trend: 'up' | 'down' | 'stable'
  summary: string
}

interface AIBrainState {
  mode: BrainMode
  priorityItems: PriorityItem[]
  alerts: BrainAlert[]
  scheduleEvents: ScheduleEvent[]
  moduleInsights: ModuleInsight[]
  syncInProgress: boolean

  setMode: (mode: BrainMode) => void
  addPriorityItem: (item: PriorityItem) => void
  removePriorityItem: (id: string) => void
  dismissAlert: (id: string) => void
  markEventComplete: (id: string) => void
  setInsights: (insights: ModuleInsight[]) => void
  setSyncInProgress: (inProgress: boolean) => void
}

export const useAIBrainStore = create<AIBrainState>()(
  persist(
    (set) => ({
      mode: 'monitor',
      priorityItems: [
        {
          id: '1',
          title: 'Complete Physics Assignment',
          description: 'Due in 2 days',
          module: 'Learning',
          level: 'high',
          icon: 'book',
          actionLabel: 'Start',
          actionRoute: 'CoursePlayer',
          dueTime: '2024-04-05',
        },
        {
          id: '2',
          title: 'Recovery Protocol',
          description: 'Back pain detected - stretching recommended',
          module: 'Health',
          level: 'critical',
          icon: 'heart',
          actionLabel: 'View Plan',
          actionRoute: 'InjuryTracking',
        },
        {
          id: '3',
          title: 'Budget Alert',
          description: 'Food category 80% spent',
          module: 'Budget',
          level: 'medium',
          icon: 'wallet',
          actionLabel: 'View',
          actionRoute: 'BudgetExpenses',
        },
      ],
      alerts: [
        {
          id: 'a1',
          title: 'Wearable Sync Success',
          description: 'Health data synced from smartwatch',
          module: 'Health',
          severity: 'success',
          icon: 'checkmark-circle',
          timestamp: new Date().toISOString(),
          dismissed: false,
        },
        {
          id: 'a2',
          title: 'Study Streak Active',
          description: '7 days of consistent learning',
          module: 'Learning',
          severity: 'info',
          icon: 'flame',
          timestamp: new Date().toISOString(),
          dismissed: false,
        },
      ],
      scheduleEvents: [
        {
          id: 'e1',
          title: 'Mathematics Lecture',
          time: '09:00',
          endTime: '10:30',
          module: 'Learning',
          icon: 'play-circle',
          color: '#6366F1',
          completed: false,
        },
        {
          id: 'e2',
          title: 'Gym Session',
          time: '17:00',
          endTime: '18:00',
          module: 'Health',
          icon: 'dumbbell',
          color: '#10B981',
          completed: false,
        },
        {
          id: 'e3',
          title: 'Meal Prep',
          time: '19:00',
          module: 'Dietary',
          icon: 'restaurant',
          color: '#F59E0B',
          completed: false,
        },
      ],
      moduleInsights: [
        {
          module: 'Learning',
          label: 'Academic Progress',
          score: 82,
          trend: 'up',
          summary: 'Strong performance in coursework',
        },
        {
          module: 'Health',
          label: 'Fitness Level',
          score: 68,
          trend: 'stable',
          summary: 'Consistent workout routine',
        },
        {
          module: 'Nutrition',
          label: 'Diet Quality',
          score: 75,
          trend: 'up',
          summary: 'Improved macro balance',
        },
        {
          module: 'Sleep',
          label: 'Sleep Quality',
          score: 72,
          trend: 'down',
          summary: 'Consider earlier bedtime',
        },
        {
          module: 'Wellbeing',
          label: 'Mental Health',
          score: 79,
          trend: 'stable',
          summary: 'Good overall wellbeing',
        },
      ],
      syncInProgress: false,

      setMode: (mode) => set({ mode }),

      addPriorityItem: (item) =>
        set((s) => ({
          priorityItems: [...s.priorityItems, item],
        })),

      removePriorityItem: (id) =>
        set((s) => ({
          priorityItems: s.priorityItems.filter((p) => p.id !== id),
        })),

      dismissAlert: (id) =>
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === id ? { ...a, dismissed: true } : a
          ),
        })),

      markEventComplete: (id) =>
        set((s) => ({
          scheduleEvents: s.scheduleEvents.map((e) =>
            e.id === id ? { ...e, completed: true } : e
          ),
        })),

      setInsights: (moduleInsights) => set({ moduleInsights }),

      setSyncInProgress: (syncInProgress) => set({ syncInProgress }),
    }),
    {
      name: 'ai-brain-store',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (s) => ({
        priorityItems: s.priorityItems,
        alerts: s.alerts,
        scheduleEvents: s.scheduleEvents,
        moduleInsights: s.moduleInsights,
      }),
    }
  )
)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';
export type RecommendationType = 'do-now' | 'recover' | 'learn' | 'buy' | 'plan' | 'monitor';
export type BrainMode = 'monitor' | 'priority' | 'safety' | 'coach' | 'planner' | 'sync' | 'insight';

export interface PriorityItem {
  id: string;
  title: string;
  description: string;
  module: string;
  level: PriorityLevel;
  icon: string;          // MUI icon name
  actionLabel?: string;
  actionPath?: string;
  dueTime?: string;
}

export interface BrainAlert {
  id: string;
  title: string;
  description: string;
  module: string;
  severity: AlertSeverity;
  icon: string;
  timestamp: string;
  dismissed: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;
  endTime?: string;
  module: string;
  icon: string;
  color: string;
  completed: boolean;
}

export interface ModuleInsight {
  module: string;
  label: string;
  score: number;       // 0-100
  trend: 'up' | 'down' | 'stable';
  summary: string;
  details: string[];
}

export interface CrossModuleInsight {
  id: string;
  title: string;
  description: string;
  modules: string[];
  type: 'pattern' | 'risk' | 'opportunity' | 'sync';
  timestamp: string;
}

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  type: RecommendationType;
  module: string;
  actionLabel?: string;
  actionPath?: string;
}

export interface WeeklySummary {
  wins: string[];
  risks: string[];
  missedItems: string[];
  adherence: Record<string, number>;  // module → percentage
  predictedPriorities: string[];
}

export interface TodayFocus {
  headline: string;          // e.g. "Low energy day — protect recovery"
  body: string;              // 2-3 sentence personal context
  energyLevel: 'low' | 'medium' | 'high';
  suggestedFocus: string[];  // 3-5 specific bullets for today
  weatherNote?: string;      // e.g. "Rainy outside — good indoor day"
  shoppingNudge?: string;    // specific item to buy based on needs
}

export interface AIBrainState {
  // Dashboard data
  priorities: PriorityItem[];
  alerts: BrainAlert[];
  schedule: ScheduleEvent[];
  moduleInsights: ModuleInsight[];
  crossInsights: CrossModuleInsight[];
  recommendations: SmartRecommendation[];
  weeklySummary: WeeklySummary | null;
  todayFocus: TodayFocus | null;
  nudge: string | null;  // single-line proactive push message

  // AI response
  brainAnalysis: string;
  lastRefresh: string | null;
  isLoading: boolean;
  activeMode: BrainMode;

  // Actions
  setLoading: (loading: boolean) => void;
  setActiveMode: (mode: BrainMode) => void;
  dismissAlert: (id: string) => void;
  toggleScheduleComplete: (id: string) => void;
  setBrainData: (data: Partial<AIBrainState>) => void;
  setBrainAnalysis: (analysis: string) => void;
  clearAll: () => void;
}

const initialState = {
  priorities: [],
  alerts: [],
  schedule: [],
  moduleInsights: [],
  crossInsights: [],
  recommendations: [],
  weeklySummary: null,
  todayFocus: null,
  nudge: null,
  brainAnalysis: '',
  lastRefresh: null,
  isLoading: false,
  activeMode: 'monitor' as BrainMode,
};

export const useAIBrainStore = create<AIBrainState>()(
  persist(
    (set) => ({
      ...initialState,

      setLoading: (loading) => set({ isLoading: loading }),

      setActiveMode: (mode) => set({ activeMode: mode }),

      dismissAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, dismissed: true } : a,
          ),
        })),

      toggleScheduleComplete: (id) =>
        set((state) => ({
          schedule: state.schedule.map((e) =>
            e.id === id ? { ...e, completed: !e.completed } : e,
          ),
        })),

      setBrainData: (data) =>
        set((state) => ({
          ...state,
          ...data,
          lastRefresh: new Date().toISOString(),
        })),

      setBrainAnalysis: (analysis) => set({ brainAnalysis: analysis }),

      clearAll: () => set(initialState),
    }),
    {
      name: 'heybobo-ai-brain',
      partialize: (state) => ({
        priorities: state.priorities,
        alerts: state.alerts,
        schedule: state.schedule,
        moduleInsights: state.moduleInsights,
        crossInsights: state.crossInsights,
        recommendations: state.recommendations,
        weeklySummary: state.weeklySummary,
        todayFocus: state.todayFocus,
        nudge: state.nudge,
        brainAnalysis: state.brainAnalysis,
        lastRefresh: state.lastRefresh,
        activeMode: state.activeMode,
      }),
    },
  ),
);

import { create } from 'zustand'
import type { Course, CourseSection, LessonProgress } from '@/types'

interface CourseState {
  activeCourse:     Course | null
  sections:         CourseSection[]
  activeLessonId:   string | null
  progressMap:      Record<string, LessonProgress>

  setActiveCourse:  (course: Course | null) => void
  setSections:      (sections: CourseSection[]) => void
  setActiveLesson:  (lessonId: string | null) => void
  updateProgress:   (lessonId: string, progress: LessonProgress) => void
  clearCourse:      () => void
}

export const useCourseStore = create<CourseState>((set) => ({
  activeCourse:   null,
  sections:       [],
  activeLessonId: null,
  progressMap:    {},

  setActiveCourse:  (activeCourse)   => set({ activeCourse }),
  setSections:      (sections)       => set({ sections }),
  setActiveLesson:  (activeLessonId) => set({ activeLessonId }),

  updateProgress: (lessonId, progress) =>
    set((s) => ({ progressMap: { ...s.progressMap, [lessonId]: progress } })),

  clearCourse: () => set({ activeCourse: null, sections: [], activeLessonId: null, progressMap: {} }),
}))

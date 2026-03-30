import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type GroupCategory = 'course-based' | 'subject-based' | 'college-based' | 'study-group' | 'project-group'
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member'

export interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: MemberRole
  joinedAt: string
  stats: {
    attendance: number
    assignmentsCompleted: number
    quizAvgScore: number
    participationScore: number
  }
}

export interface GroupPost {
  id: string
  authorId: string
  authorName: string
  content: string
  type: 'text' | 'resource' | 'announcement' | 'poll'
  pinned: boolean
  createdAt: string
  likes: number
  resourceUrl?: string
}

export interface GroupAssignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxScore: number
  submissions: {
    memberId: string
    status: 'pending' | 'submitted' | 'graded'
    score?: number
  }[]
}

export interface StudyGroup {
  id: string
  name: string
  description: string
  category: GroupCategory
  avatar?: string
  courseId?: string
  members: GroupMember[]
  posts: GroupPost[]
  assignments: GroupAssignment[]
  isPublic: boolean
  createdAt: string
}

interface GroupState {
  groups: StudyGroup[]
  activeGroupId: string | null

  addGroup: (group: StudyGroup) => void
  removeGroup: (id: string) => void
  setActiveGroup: (id: string | null) => void
  addPost: (groupId: string, post: GroupPost) => void
  addMember: (groupId: string, member: GroupMember) => void
  removeMember: (groupId: string, memberId: string) => void
  addAssignment: (groupId: string, assignment: GroupAssignment) => void
  likePost: (groupId: string, postId: string) => void
  pinPost: (groupId: string, postId: string) => void
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      groups: [
        {
          id: 'grp-1',
          name: 'CS101 Study Group',
          description: 'Group for Computer Science fundamentals course',
          category: 'course-based',
          avatar: '📚',
          courseId: 'cs101',
          members: [
            {
              id: 'mem1',
              name: 'Alice Johnson',
              email: 'alice@edu.com',
              role: 'owner',
              joinedAt: new Date().toISOString(),
              stats: { attendance: 95, assignmentsCompleted: 10, quizAvgScore: 88, participationScore: 92 },
            },
            {
              id: 'mem2',
              name: 'Bob Smith',
              email: 'bob@edu.com',
              role: 'member',
              joinedAt: new Date().toISOString(),
              stats: { attendance: 80, assignmentsCompleted: 9, quizAvgScore: 82, participationScore: 75 },
            },
          ],
          posts: [
            {
              id: 'post1',
              authorId: 'mem1',
              authorName: 'Alice Johnson',
              content: 'Anyone want to form a study group for the midterm?',
              type: 'text',
              pinned: true,
              createdAt: new Date().toISOString(),
              likes: 3,
            },
          ],
          assignments: [],
          isPublic: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'grp-2',
          name: 'Math Study Circle',
          description: 'Calculus and linear algebra discussion group',
          category: 'subject-based',
          avatar: '🧮',
          members: [
            {
              id: 'mem3',
              name: 'Charlie Davis',
              email: 'charlie@edu.com',
              role: 'owner',
              joinedAt: new Date().toISOString(),
              stats: { attendance: 100, assignmentsCompleted: 12, quizAvgScore: 95, participationScore: 98 },
            },
          ],
          posts: [],
          assignments: [],
          isPublic: false,
          createdAt: new Date().toISOString(),
        },
      ],
      activeGroupId: null,

      addGroup: (group) =>
        set((s) => ({
          groups: [...s.groups, group],
          activeGroupId: group.id,
        })),

      removeGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          activeGroupId: s.activeGroupId === id ? null : s.activeGroupId,
        })),

      setActiveGroup: (activeGroupId) => set({ activeGroupId }),

      addPost: (groupId, post) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, posts: [...g.posts, post] } : g
          ),
        })),

      addMember: (groupId, member) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, members: [...g.members, member] } : g
          ),
        })),

      removeMember: (groupId, memberId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, members: g.members.filter((m) => m.id !== memberId) }
              : g
          ),
        })),

      addAssignment: (groupId, assignment) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, assignments: [...g.assignments, assignment] } : g
          ),
        })),

      likePost: (groupId, postId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  posts: g.posts.map((p) =>
                    p.id === postId ? { ...p, likes: p.likes + 1 } : p
                  ),
                }
              : g
          ),
        })),

      pinPost: (groupId, postId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  posts: g.posts.map((p) =>
                    p.id === postId ? { ...p, pinned: !p.pinned } : p
                  ),
                }
              : g
          ),
        })),
    }),
    {
      name: 'group-store',
      storage: createJSONStorage(() => asyncStorage),
    }
  )
)

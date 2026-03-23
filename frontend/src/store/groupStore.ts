import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────

export type GroupCategory = 'course-based' | 'subject-based' | 'college-based' | 'study-group' | 'project-group';
export type GroupType = 'public' | 'private' | 'restricted';
export type PostPermission = 'everyone' | 'admins-only';
export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type ContentType = 'video' | 'pdf' | 'note' | 'link' | 'recording';
export type AssignmentStatus = 'pending' | 'submitted' | 'graded';
export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  joinedAt: string;
  lastActive?: string;
  stats: {
    attendance: number;
    assignmentsCompleted: number;
    quizAvgScore: number;
    participationScore: number;
  };
}

export interface JoinRequest {
  id: string;
  userId: string;
  name: string;
  email: string;
  message?: string;
  status: JoinRequestStatus;
  requestedAt: string;
  resolvedAt?: string;
}

export interface GroupContent {
  id: string;
  title: string;
  type: ContentType;
  url?: string;
  description?: string;
  folder?: string;
  pinned: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMeeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  duration: number; // minutes
  instructor: string;
  platform: 'jitsi' | 'zoom' | 'google-meet';
  meetingLink?: string;
  status: MeetingStatus;
  attendees: string[]; // member ids
  recording?: string;
  transcript?: string;
  summary?: string;
  createdAt: string;
}

export interface GroupDiscussion {
  id: string;
  type: 'general' | 'topic' | 'doubt';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  pinned: boolean;
  replies: DiscussionReply[];
  reactions: Record<string, string[]>; // emoji -> userId[]
  createdAt: string;
}

export interface DiscussionReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  reactions: Record<string, string[]>;
  createdAt: string;
}

export interface GroupAssignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  deadline: string;
  createdBy: string;
  submissions: AssignmentSubmission[];
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  memberId: string;
  memberName: string;
  content: string;
  files: string[];
  status: AssignmentStatus;
  grade?: number;
  maxGrade: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface GroupQuiz {
  id: string;
  title: string;
  questions: GroupQuizQuestion[];
  timeLimit?: number; // minutes
  isLive: boolean;
  attempts: QuizAttempt[];
  createdAt: string;
}

export interface GroupQuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export interface QuizAttempt {
  memberId: string;
  memberName: string;
  score: number;
  total: number;
  completedAt: string;
}

export interface GroupPoll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: string[] }[];
  createdBy: string;
  endsAt?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'lecture' | 'assignment' | 'exam' | 'meeting' | 'other';
  date: string;
  endDate?: string;
  description?: string;
}

export interface GroupResource {
  id: string;
  title: string;
  type: 'note' | 'video' | 'link' | 'document';
  url?: string;
  content?: string;
  tags: string[];
  uploadedBy: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  memberId: string;
  memberName: string;
  quizScore: number;
  participation: number;
  streak: number;
  badges: string[];
  totalPoints: number;
}

export interface GroupNotification {
  id: string;
  type: 'lecture' | 'meeting' | 'assignment' | 'reply' | 'content' | 'member' | 'quiz';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  category: GroupCategory;
  groupType: GroupType;
  postPermission: PostPermission;
  maxMembers: number;
  courseIds: string[];
  members: GroupMember[];
  joinRequests: JoinRequest[];
  content: GroupContent[];
  meetings: GroupMeeting[];
  discussions: GroupDiscussion[];
  assignments: GroupAssignment[];
  quizzes: GroupQuiz[];
  polls: GroupPoll[];
  calendar: CalendarEvent[];
  resources: GroupResource[];
  notifications: GroupNotification[];
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ────────────────────────────────────────────

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function genInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function now() {
  return new Date().toISOString();
}

function addNotification(group: Group, n: Omit<GroupNotification, 'id' | 'read' | 'createdAt'>): Group {
  return {
    ...group,
    notifications: [
      { ...n, id: genId(), read: false, createdAt: now() },
      ...group.notifications,
    ].slice(0, 100),
  };
}

// ─── Store ──────────────────────────────────────────────

interface GroupStore {
  groups: Group[];
  // CRUD
  createGroup: (data: Pick<Group, 'name' | 'description' | 'category' | 'groupType' | 'postPermission' | 'maxMembers' | 'courseIds' | 'coverImage'>) => Group;
  updateGroup: (id: string, updates: Partial<Pick<Group, 'name' | 'description' | 'category' | 'groupType' | 'postPermission' | 'maxMembers' | 'coverImage'>>) => void;
  deleteGroup: (id: string) => void;
  // Members
  addMember: (groupId: string, member: Pick<GroupMember, 'name' | 'email'> & { role?: MemberRole }) => void;
  removeMember: (groupId: string, memberId: string) => void;
  updateMemberRole: (groupId: string, memberId: string, role: MemberRole) => void;
  bulkAddMembers: (groupId: string, members: { name: string; email: string }[]) => void;
  // Join requests
  submitJoinRequest: (groupId: string, data: { name: string; email: string; message?: string }) => void;
  resolveJoinRequest: (groupId: string, requestId: string, approve: boolean) => void;
  // Content
  addContent: (groupId: string, content: Omit<GroupContent, 'id' | 'createdAt' | 'updatedAt' | 'pinned'>) => void;
  removeContent: (groupId: string, contentId: string) => void;
  togglePinContent: (groupId: string, contentId: string) => void;
  // Meetings
  scheduleMeeting: (groupId: string, meeting: Omit<GroupMeeting, 'id' | 'status' | 'attendees' | 'createdAt'>) => void;
  updateMeetingStatus: (groupId: string, meetingId: string, status: MeetingStatus) => void;
  recordAttendance: (groupId: string, meetingId: string, memberIds: string[]) => void;
  addMeetingSummary: (groupId: string, meetingId: string, summary: string) => void;
  // Discussions
  createDiscussion: (groupId: string, discussion: Pick<GroupDiscussion, 'type' | 'title' | 'content' | 'authorId' | 'authorName'>) => void;
  replyToDiscussion: (groupId: string, discussionId: string, reply: Pick<DiscussionReply, 'content' | 'authorId' | 'authorName'>) => void;
  togglePinDiscussion: (groupId: string, discussionId: string) => void;
  reactToDiscussion: (groupId: string, discussionId: string, emoji: string, userId: string) => void;
  // Assignments
  createAssignment: (groupId: string, assignment: Pick<GroupAssignment, 'title' | 'description' | 'instructions' | 'deadline' | 'createdBy'>) => void;
  submitAssignment: (groupId: string, assignmentId: string, submission: Pick<AssignmentSubmission, 'memberId' | 'memberName' | 'content' | 'files'>) => void;
  gradeSubmission: (groupId: string, assignmentId: string, submissionId: string, grade: number, maxGrade: number, feedback: string) => void;
  // Quizzes & Polls
  createQuiz: (groupId: string, quiz: Pick<GroupQuiz, 'title' | 'questions' | 'timeLimit' | 'isLive'>) => void;
  submitQuizAttempt: (groupId: string, quizId: string, attempt: Pick<QuizAttempt, 'memberId' | 'memberName' | 'score' | 'total'>) => void;
  createPoll: (groupId: string, poll: Pick<GroupPoll, 'question' | 'options' | 'createdBy' | 'endsAt'>) => void;
  votePoll: (groupId: string, pollId: string, optionId: string, userId: string) => void;
  // Calendar
  addCalendarEvent: (groupId: string, event: Omit<CalendarEvent, 'id'>) => void;
  removeCalendarEvent: (groupId: string, eventId: string) => void;
  // Resources
  addResource: (groupId: string, resource: Omit<GroupResource, 'id' | 'createdAt'>) => void;
  removeResource: (groupId: string, resourceId: string) => void;
  // Courses
  assignCourses: (groupId: string, courseIds: string[]) => void;
  removeCourse: (groupId: string, courseId: string) => void;
  // Notifications
  markNotificationRead: (groupId: string, notificationId: string) => void;
  markAllNotificationsRead: (groupId: string) => void;
  // Analytics helper
  getGroupAnalytics: (groupId: string) => {
    totalMembers: number;
    avgAttendance: number;
    avgQuizScore: number;
    completionRate: number;
    topPerformers: { name: string; score: number }[];
    engagementScore: number;
  } | null;
  // Leaderboard
  getLeaderboard: (groupId: string) => LeaderboardEntry[];
}

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      groups: [],

      // ── CRUD ───────────────────────────────────────
      createGroup: (data) => {
        const group: Group = {
          id: genId(),
          ...data,
          members: [],
          joinRequests: [],
          content: [],
          meetings: [],
          discussions: [],
          assignments: [],
          quizzes: [],
          polls: [],
          calendar: [],
          resources: [],
          notifications: [],
          inviteCode: genInviteCode(),
          createdBy: 'current-user',
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ groups: [group, ...s.groups] }));
        return group;
      },

      updateGroup: (id, updates) => {
        set((s) => ({
          groups: s.groups.map((g) => g.id === id ? { ...g, ...updates, updatedAt: now() } : g),
        }));
      },

      deleteGroup: (id) => {
        set((s) => ({ groups: s.groups.filter((g) => g.id !== id) }));
      },

      // ── Members ────────────────────────────────────
      addMember: (groupId, member) => {
        const m: GroupMember = {
          id: genId(),
          name: member.name,
          email: member.email,
          role: member.role || 'member',
          joinedAt: now(),
          stats: { attendance: 0, assignmentsCompleted: 0, quizAvgScore: 0, participationScore: 0 },
        };
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            if (g.members.length >= g.maxMembers) return g;
            if (g.members.some((em) => em.email === member.email)) return g;
            return addNotification(
              { ...g, members: [...g.members, m] },
              { type: 'member', title: 'New Member', message: `${m.name} joined the group` }
            );
          }),
        }));
      },

      removeMember: (groupId, memberId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, members: g.members.filter((m) => m.id !== memberId) } : g
          ),
        }));
      },

      updateMemberRole: (groupId, memberId, role) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, members: g.members.map((m) => m.id === memberId ? { ...m, role } : m) }
              : g
          ),
        }));
      },

      bulkAddMembers: (groupId, members) => {
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            const existing = new Set(g.members.map((m) => m.email));
            const newMembers: GroupMember[] = members
              .filter((m) => !existing.has(m.email))
              .slice(0, g.maxMembers - g.members.length)
              .map((m) => ({
                id: genId(),
                name: m.name,
                email: m.email,
                role: 'member' as MemberRole,
                joinedAt: now(),
                stats: { attendance: 0, assignmentsCompleted: 0, quizAvgScore: 0, participationScore: 0 },
              }));
            return addNotification(
              { ...g, members: [...g.members, ...newMembers] },
              { type: 'member', title: 'Bulk Members Added', message: `${newMembers.length} new members joined` }
            );
          }),
        }));
      },

      // ── Join Requests ──────────────────────────────
      submitJoinRequest: (groupId, data) => {
        const req: JoinRequest = {
          id: genId(),
          userId: genId(),
          name: data.name,
          email: data.email,
          message: data.message,
          status: 'pending',
          requestedAt: now(),
        };
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, joinRequests: [...g.joinRequests, req] } : g
          ),
        }));
      },

      resolveJoinRequest: (groupId, requestId, approve) => {
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            const req = g.joinRequests.find((r) => r.id === requestId);
            if (!req) return g;
            const updatedRequests = g.joinRequests.map((r) =>
              r.id === requestId
                ? { ...r, status: (approve ? 'approved' : 'rejected') as JoinRequestStatus, resolvedAt: now() }
                : r
            );
            let updatedGroup = { ...g, joinRequests: updatedRequests };
            if (approve) {
              const newMember: GroupMember = {
                id: genId(),
                name: req.name,
                email: req.email,
                role: 'member',
                joinedAt: now(),
                stats: { attendance: 0, assignmentsCompleted: 0, quizAvgScore: 0, participationScore: 0 },
              };
              updatedGroup.members = [...updatedGroup.members, newMember];
            }
            return updatedGroup;
          }),
        }));
      },

      // ── Content ────────────────────────────────────
      addContent: (groupId, content) => {
        const item: GroupContent = {
          ...content,
          id: genId(),
          pinned: false,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            return addNotification(
              { ...g, content: [item, ...g.content] },
              { type: 'content', title: 'New Content', message: `"${item.title}" was shared` }
            );
          }),
        }));
      },

      removeContent: (groupId, contentId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, content: g.content.filter((c) => c.id !== contentId) } : g
          ),
        }));
      },

      togglePinContent: (groupId, contentId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, content: g.content.map((c) => c.id === contentId ? { ...c, pinned: !c.pinned } : c) }
              : g
          ),
        }));
      },

      // ── Meetings ───────────────────────────────────
      scheduleMeeting: (groupId, meeting) => {
        const m: GroupMeeting = {
          ...meeting,
          id: genId(),
          status: 'scheduled',
          attendees: [],
          createdAt: now(),
        };
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            const cal: CalendarEvent = { id: genId(), title: m.title, type: 'meeting', date: m.date, description: m.description };
            return addNotification(
              { ...g, meetings: [m, ...g.meetings], calendar: [cal, ...g.calendar] },
              { type: 'meeting', title: 'Meeting Scheduled', message: `"${m.title}" on ${new Date(m.date).toLocaleDateString()}` }
            );
          }),
        }));
      },

      updateMeetingStatus: (groupId, meetingId, status) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, meetings: g.meetings.map((m) => m.id === meetingId ? { ...m, status } : m) }
              : g
          ),
        }));
      },

      recordAttendance: (groupId, meetingId, memberIds) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  meetings: g.meetings.map((m) => m.id === meetingId ? { ...m, attendees: memberIds } : m),
                  members: g.members.map((mem) => {
                    if (memberIds.includes(mem.id)) {
                      const totalMeetings = g.meetings.length || 1;
                      const attended = g.meetings.filter((mt) => mt.attendees.includes(mem.id)).length + 1;
                      return { ...mem, stats: { ...mem.stats, attendance: Math.round((attended / totalMeetings) * 100) }, lastActive: now() };
                    }
                    return mem;
                  }),
                }
              : g
          ),
        }));
      },

      addMeetingSummary: (groupId, meetingId, summary) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, meetings: g.meetings.map((m) => m.id === meetingId ? { ...m, summary } : m) }
              : g
          ),
        }));
      },

      // ── Discussions ────────────────────────────────
      createDiscussion: (groupId, discussion) => {
        const d: GroupDiscussion = {
          ...discussion,
          id: genId(),
          pinned: false,
          replies: [],
          reactions: {},
          createdAt: now(),
        };
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, discussions: [d, ...g.discussions] } : g
          ),
        }));
      },

      replyToDiscussion: (groupId, discussionId, reply) => {
        const r: DiscussionReply = { ...reply, id: genId(), reactions: {}, createdAt: now() };
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            return addNotification(
              {
                ...g,
                discussions: g.discussions.map((d) =>
                  d.id === discussionId ? { ...d, replies: [...d.replies, r] } : d
                ),
              },
              { type: 'reply', title: 'New Reply', message: `${r.authorName} replied to a discussion` }
            );
          }),
        }));
      },

      togglePinDiscussion: (groupId, discussionId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, discussions: g.discussions.map((d) => d.id === discussionId ? { ...d, pinned: !d.pinned } : d) }
              : g
          ),
        }));
      },

      reactToDiscussion: (groupId, discussionId, emoji, userId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  discussions: g.discussions.map((d) => {
                    if (d.id !== discussionId) return d;
                    const current = d.reactions[emoji] || [];
                    const updated = current.includes(userId)
                      ? current.filter((id) => id !== userId)
                      : [...current, userId];
                    return { ...d, reactions: { ...d.reactions, [emoji]: updated } };
                  }),
                }
              : g
          ),
        }));
      },

      // ── Assignments ────────────────────────────────
      createAssignment: (groupId, assignment) => {
        const a: GroupAssignment = {
          ...assignment,
          id: genId(),
          submissions: [],
          createdAt: now(),
        };
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            const cal: CalendarEvent = { id: genId(), title: `Due: ${a.title}`, type: 'assignment', date: a.deadline };
            return addNotification(
              { ...g, assignments: [a, ...g.assignments], calendar: [cal, ...g.calendar] },
              { type: 'assignment', title: 'New Assignment', message: `"${a.title}" due ${new Date(a.deadline).toLocaleDateString()}` }
            );
          }),
        }));
      },

      submitAssignment: (groupId, assignmentId, submission) => {
        const s_: AssignmentSubmission = {
          ...submission,
          id: genId(),
          status: 'submitted',
          maxGrade: 100,
          submittedAt: now(),
        };
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  assignments: g.assignments.map((a) =>
                    a.id === assignmentId ? { ...a, submissions: [...a.submissions, s_] } : a
                  ),
                }
              : g
          ),
        }));
      },

      gradeSubmission: (groupId, assignmentId, submissionId, grade, maxGrade, feedback) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  assignments: g.assignments.map((a) =>
                    a.id === assignmentId
                      ? {
                          ...a,
                          submissions: a.submissions.map((sub) =>
                            sub.id === submissionId
                              ? { ...sub, grade, maxGrade, feedback, status: 'graded' as AssignmentStatus, gradedAt: now() }
                              : sub
                          ),
                        }
                      : a
                  ),
                  members: g.members.map((m) => {
                    const sub = g.assignments.find((a) => a.id === assignmentId)?.submissions.find((s) => s.id === submissionId);
                    if (sub && sub.memberId === m.id) {
                      return { ...m, stats: { ...m.stats, assignmentsCompleted: m.stats.assignmentsCompleted + 1 } };
                    }
                    return m;
                  }),
                }
              : g
          ),
        }));
      },

      // ── Quizzes & Polls ────────────────────────────
      createQuiz: (groupId, quiz) => {
        const q: GroupQuiz = { ...quiz, id: genId(), attempts: [], createdAt: now() };
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            return addNotification(
              { ...g, quizzes: [q, ...g.quizzes] },
              { type: 'quiz', title: 'New Quiz', message: `"${q.title}" is available` }
            );
          }),
        }));
      },

      submitQuizAttempt: (groupId, quizId, attempt) => {
        const a: QuizAttempt = { ...attempt, completedAt: now() };
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  quizzes: g.quizzes.map((q) =>
                    q.id === quizId ? { ...q, attempts: [...q.attempts, a] } : q
                  ),
                  members: g.members.map((m) => {
                    if (m.id === attempt.memberId) {
                      const allAttempts = g.quizzes.flatMap((q) => q.attempts.filter((at) => at.memberId === m.id));
                      const totalScore = [...allAttempts, a].reduce((sum, at) => sum + (at.score / at.total) * 100, 0);
                      const avg = Math.round(totalScore / (allAttempts.length + 1));
                      return { ...m, stats: { ...m.stats, quizAvgScore: avg } };
                    }
                    return m;
                  }),
                }
              : g
          ),
        }));
      },

      createPoll: (groupId, poll) => {
        const p: GroupPoll = { ...poll, id: genId(), createdAt: now() };
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, polls: [p, ...g.polls] } : g
          ),
        }));
      },

      votePoll: (groupId, pollId, optionId, userId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  polls: g.polls.map((p) => {
                    if (p.id !== pollId) return p;
                    // Remove from all options, add to selected
                    return {
                      ...p,
                      options: p.options.map((o) => ({
                        ...o,
                        votes: o.id === optionId
                          ? [...o.votes.filter((v) => v !== userId), userId]
                          : o.votes.filter((v) => v !== userId),
                      })),
                    };
                  }),
                }
              : g
          ),
        }));
      },

      // ── Calendar ───────────────────────────────────
      addCalendarEvent: (groupId, event) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, calendar: [{ ...event, id: genId() }, ...g.calendar] } : g
          ),
        }));
      },

      removeCalendarEvent: (groupId, eventId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, calendar: g.calendar.filter((e) => e.id !== eventId) } : g
          ),
        }));
      },

      // ── Resources ──────────────────────────────────
      addResource: (groupId, resource) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, resources: [{ ...resource, id: genId(), createdAt: now() }, ...g.resources] } : g
          ),
        }));
      },

      removeResource: (groupId, resourceId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, resources: g.resources.filter((r) => r.id !== resourceId) } : g
          ),
        }));
      },

      // ── Courses ────────────────────────────────────
      assignCourses: (groupId, courseIds) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, courseIds: [...new Set([...g.courseIds, ...courseIds])] } : g
          ),
        }));
      },

      removeCourse: (groupId, courseId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId ? { ...g, courseIds: g.courseIds.filter((id) => id !== courseId) } : g
          ),
        }));
      },

      // ── Notifications ──────────────────────────────
      markNotificationRead: (groupId, notificationId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, notifications: g.notifications.map((n) => n.id === notificationId ? { ...n, read: true } : n) }
              : g
          ),
        }));
      },

      markAllNotificationsRead: (groupId) => {
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id === groupId
              ? { ...g, notifications: g.notifications.map((n) => ({ ...n, read: true })) }
              : g
          ),
        }));
      },

      // ── Analytics ──────────────────────────────────
      getGroupAnalytics: (groupId) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return null;

        const members = group.members;
        const totalMembers = members.length;
        if (totalMembers === 0) {
          return { totalMembers: 0, avgAttendance: 0, avgQuizScore: 0, completionRate: 0, topPerformers: [], engagementScore: 0 };
        }

        const avgAttendance = Math.round(members.reduce((s, m) => s + m.stats.attendance, 0) / totalMembers);
        const avgQuizScore = Math.round(members.reduce((s, m) => s + m.stats.quizAvgScore, 0) / totalMembers);

        const totalAssignments = group.assignments.length;
        const totalSubmissions = group.assignments.reduce((s, a) => s + a.submissions.length, 0);
        const completionRate = totalAssignments > 0
          ? Math.round((totalSubmissions / (totalAssignments * totalMembers)) * 100)
          : 0;

        const topPerformers = members
          .map((m) => ({
            name: m.name,
            score: m.stats.quizAvgScore + m.stats.attendance + m.stats.participationScore,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        const engagementScore = Math.round(
          (avgAttendance * 0.3 + avgQuizScore * 0.3 + completionRate * 0.2 +
            Math.min(group.discussions.reduce((s, d) => s + d.replies.length, 0) / totalMembers * 10, 20)) 
        );

        return { totalMembers, avgAttendance, avgQuizScore, completionRate, topPerformers, engagementScore };
      },

      // ── Leaderboard ────────────────────────────────
      getLeaderboard: (groupId) => {
        const group = get().groups.find((g) => g.id === groupId);
        if (!group) return [];

        return group.members
          .map((m) => {
            const quizAttempts = group.quizzes.flatMap((q) => q.attempts.filter((a) => a.memberId === m.id));
            const quizScore = quizAttempts.length > 0
              ? Math.round(quizAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / quizAttempts.length)
              : 0;
            const participation = m.stats.participationScore;
            const streak = Math.floor(Math.random() * 7) + 1; // simulated
            const badges: string[] = [];
            if (quizScore >= 90) badges.push('Quiz Master');
            if (m.stats.attendance >= 80) badges.push('Regular');
            if (m.stats.assignmentsCompleted >= 5) badges.push('Diligent');
            const totalPoints = quizScore + participation + m.stats.attendance + streak * 5;
            return { memberId: m.id, memberName: m.name, quizScore, participation, streak, badges, totalPoints };
          })
          .sort((a, b) => b.totalPoints - a.totalPoints);
      },
    }),
    {
      name: 'heybobo-groups',
    }
  )
);

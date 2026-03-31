import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'

export type MeetingStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

export interface MeetingParticipant {
  name: string
  email: string
  joinedAt?: string
  leftAt?: string
}

export interface MeetingInvite {
  id: string
  meetingId: string
  type: 'individual' | 'group'
  targetId: string
  targetName: string
  sentAt: string
  accepted: boolean
}

export interface ChatMessage {
  id: string
  senderName: string
  senderEmail: string
  text: string
  timestamp: string
}

export interface Meeting {
  id: string
  title: string
  description: string
  hostEmail: string
  hostName: string
  meetingCode: string
  scheduledAt: string
  duration: number // minutes
  status: MeetingStatus
  participants: MeetingParticipant[]
  invites: MeetingInvite[]
  chat: ChatMessage[]
  recording: boolean
  screenSharing: boolean
  createdAt: string
  startedAt?: string
  endedAt?: string
}

export interface MeetingRecording {
  id: string
  meetingId: string
  meetingTitle: string
  recordedAt: string
  duration: number // seconds
  sizeBytes: number
}

interface MeetingState {
  meetings: Meeting[]
  activeMeetingId: string | null
  recordings: MeetingRecording[]

  createMeeting: (data: {
    title: string
    description: string
    hostEmail: string
    hostName: string
    scheduledAt: string
    duration: number
  }) => Meeting

  updateMeeting: (id: string, updates: Partial<Pick<Meeting, 'title' | 'description' | 'scheduledAt' | 'duration'>>) => void
  deleteMeeting: (id: string) => void
  cancelMeeting: (id: string) => void

  sendInvite: (meetingId: string, invite: Omit<MeetingInvite, 'id' | 'meetingId' | 'sentAt' | 'accepted'>) => void
  removeInvite: (meetingId: string, inviteId: string) => void
  acceptInvite: (meetingId: string, inviteId: string) => void

  startMeeting: (meetingId: string) => void
  endMeeting: (meetingId: string) => void
  joinMeeting: (meetingId: string, participant: { name: string; email: string }) => void
  leaveMeeting: (meetingId: string, email: string) => void
  joinByCode: (code: string) => Meeting | null

  sendChat: (meetingId: string, msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  toggleRecording: (meetingId: string) => void
  toggleScreenSharing: (meetingId: string) => void
  setActiveMeeting: (id: string | null) => void

  saveRecording: (rec: Omit<MeetingRecording, 'id'>) => void
  deleteRecording: (id: string) => void
}

function generateCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const seg = () => Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${seg()}-${seg()}-${seg()}`
}

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set, get) => ({
      meetings: [],
      activeMeetingId: null,
      recordings: [],

      createMeeting: (data) => {
        const meeting: Meeting = {
          id: `meet-${Date.now()}`,
          ...data,
          meetingCode: generateCode(),
          status: 'scheduled',
          participants: [],
          invites: [],
          chat: [],
          recording: false,
          screenSharing: false,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ meetings: [...s.meetings, meeting] }))
        return meeting
      },

      updateMeeting: (id, updates) => {
        set((s) => ({
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }))
      },

      deleteMeeting: (id) => {
        set((s) => ({
          meetings: s.meetings.filter((m) => m.id !== id),
          activeMeetingId: s.activeMeetingId === id ? null : s.activeMeetingId,
        }))
      },

      cancelMeeting: (id) => {
        set((s) => ({
          meetings: s.meetings.map((m) => (m.id === id ? { ...m, status: 'cancelled' as const } : m)),
        }))
      },

      sendInvite: (meetingId, invite) => {
        const inv: MeetingInvite = {
          id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          meetingId,
          ...invite,
          sentAt: new Date().toISOString(),
          accepted: false,
        }
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId ? { ...m, invites: [...m.invites, inv] } : m,
          ),
        }))
      },

      removeInvite: (meetingId, inviteId) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId
              ? { ...m, invites: m.invites.filter((i) => i.id !== inviteId) }
              : m,
          ),
        }))
      },

      acceptInvite: (meetingId, inviteId) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId
              ? { ...m, invites: m.invites.map((i) => (i.id === inviteId ? { ...i, accepted: true } : i)) }
              : m,
          ),
        }))
      },

      startMeeting: (meetingId) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId ? { ...m, status: 'live' as const, startedAt: new Date().toISOString() } : m,
          ),
          activeMeetingId: meetingId,
        }))
      },

      endMeeting: (meetingId) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId ? { ...m, status: 'ended' as const, endedAt: new Date().toISOString() } : m,
          ),
          activeMeetingId: s.activeMeetingId === meetingId ? null : s.activeMeetingId,
        }))
      },

      joinMeeting: (meetingId, participant) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId && !m.participants.some((p) => p.email === participant.email)
              ? { ...m, participants: [...m.participants, { ...participant, joinedAt: new Date().toISOString() }] }
              : m,
          ),
        }))
      },

      leaveMeeting: (meetingId, email) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId
              ? {
                  ...m,
                  participants: m.participants.map((p) =>
                    p.email === email ? { ...p, leftAt: new Date().toISOString() } : p,
                  ),
                }
              : m,
          ),
        }))
      },

      joinByCode: (code) => {
        return (
          get().meetings.find(
            (m) => m.meetingCode === code && (m.status === 'scheduled' || m.status === 'live'),
          ) || null
        )
      },

      sendChat: (meetingId, msg) => {
        const chatMsg: ChatMessage = {
          id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...msg,
          timestamp: new Date().toISOString(),
        }
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId ? { ...m, chat: [...m.chat, chatMsg] } : m,
          ),
        }))
      },

      toggleRecording: (meetingId) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId ? { ...m, recording: !m.recording } : m,
          ),
        }))
      },

      toggleScreenSharing: (meetingId) => {
        set((s) => ({
          meetings: s.meetings.map((m) =>
            m.id === meetingId ? { ...m, screenSharing: !m.screenSharing } : m,
          ),
        }))
      },

      setActiveMeeting: (id) => {
        set({ activeMeetingId: id })
      },

      saveRecording: (rec) => {
        const recording: MeetingRecording = { id: `rec-${Date.now()}`, ...rec }
        set((s) => ({ recordings: [...s.recordings, recording] }))
      },

      deleteRecording: (id) => {
        set((s) => ({ recordings: s.recordings.filter((r) => r.id !== id) }))
      },
    }),
    {
      name: 'heybobo_meetings',
      storage: createJSONStorage(() => asyncStorage),
    },
  ),
)

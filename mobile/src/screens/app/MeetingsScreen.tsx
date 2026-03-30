import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { AppHeader } from '@/components/layout/AppHeader'
import {
  useMeetingStore,
  type Meeting,
  type MeetingStatus,
} from '@/store/meetingStore'
import { useAuthStore } from '@/store/authStore'

const COLORS = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  live: '#EF4444',
}

type Tab = 'upcoming' | 'live' | 'past' | 'recordings'

const statusColor = (s: MeetingStatus) => {
  switch (s) {
    case 'live': return COLORS.live
    case 'scheduled': return COLORS.primary
    case 'ended': return COLORS.secondaryText
    case 'cancelled': return COLORS.danger
  }
}

const statusLabel = (s: MeetingStatus) => {
  switch (s) {
    case 'live': return '● LIVE'
    case 'scheduled': return 'Scheduled'
    case 'ended': return 'Ended'
    case 'cancelled': return 'Cancelled'
  }
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ── Create Meeting Modal ───────────────────────────────────────────────
function CreateMeetingModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean
  onClose: () => void
  onSave: (data: { title: string; description: string; scheduledAt: string; duration: number }) => void
}) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setHours(d.getHours() + 1, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [duration, setDuration] = useState('60')

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a title'); return }
    onSave({ title: title.trim(), description: desc.trim(), scheduledAt: new Date(date).toISOString(), duration: parseInt(duration) || 60 })
    setTitle(''); setDesc(''); setDuration('60')
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Meeting</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Study Group Session"
              placeholderTextColor={COLORS.secondaryText}
            />
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={desc}
              onChangeText={setDesc}
              placeholder="What will you cover?"
              placeholderTextColor={COLORS.secondaryText}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.fieldLabel}>Date & Time (YYYY-MM-DDTHH:MM)</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2024-12-31T14:00"
              placeholderTextColor={COLORS.secondaryText}
            />
            <Text style={styles.fieldLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="60"
              placeholderTextColor={COLORS.secondaryText}
            />
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={onClose}>
              <Text style={styles.btnOutlineText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleSave}>
              <Text style={styles.btnPrimaryText}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ── Join by Code Modal ───────────────────────────────────────────────
function JoinByCodeModal({
  visible,
  onClose,
  onJoin,
}: {
  visible: boolean
  onClose: () => void
  onJoin: (code: string) => void
}) {
  const [code, setCode] = useState('')
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.joinModal}>
          <Text style={styles.joinModalTitle}>Join Meeting</Text>
          <Text style={styles.joinModalSub}>Enter the meeting code (e.g. abc-def-ghi)</Text>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            placeholder="abc-def-ghi"
            placeholderTextColor={COLORS.secondaryText}
            autoCapitalize="none"
          />
          <View style={styles.joinModalBtns}>
            <TouchableOpacity style={[styles.btn, styles.btnOutline, { flex: 1 }]} onPress={onClose}>
              <Text style={styles.btnOutlineText}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ width: 8 }} />
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
              onPress={() => { if (code.trim()) { onJoin(code.trim()); onClose(); setCode('') } }}
            >
              <Text style={styles.btnPrimaryText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Meeting Card ──────────────────────────────────────────────────────
function MeetingCard({ meeting, onPress }: { meeting: Meeting; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{meeting.title}</Text>
          {meeting.description ? (
            <Text style={styles.cardDesc} numberOfLines={2}>{meeting.description}</Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(meeting.status) + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor(meeting.status) }]}>
            {statusLabel(meeting.status)}
          </Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.secondaryText} />
          <Text style={styles.metaText}>{formatDate(meeting.scheduledAt)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={COLORS.secondaryText} />
          <Text style={styles.metaText}>{formatDuration(meeting.duration)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={13} color={COLORS.secondaryText} />
          <Text style={styles.metaText}>{meeting.participants.length} joined</Text>
        </View>
      </View>
      <View style={styles.codeRow}>
        <Ionicons name="key-outline" size={13} color={COLORS.primary} />
        <Text style={styles.codeText}>{meeting.meetingCode}</Text>
      </View>
    </TouchableOpacity>
  )
}

// ── Meeting Detail Modal ──────────────────────────────────────────────
function MeetingDetailModal({
  meeting,
  visible,
  onClose,
}: {
  meeting: Meeting | null
  visible: boolean
  onClose: () => void
}) {
  const { startMeeting, endMeeting, cancelMeeting, sendChat } = useMeetingStore()
  const user = useAuthStore((s) => s.user)
  const [chatText, setChatText] = useState('')
  const [detailTab, setDetailTab] = useState<'info' | 'chat' | 'participants'>('info')

  if (!meeting) return null

  const isHost = meeting.hostEmail === user?.email
  const isLive = meeting.status === 'live'
  const isScheduled = meeting.status === 'scheduled'

  const handleSendChat = () => {
    if (!chatText.trim() || !user) return
    sendChat(meeting.id, {
      senderName: `${user.firstName} ${user.lastName}`,
      senderEmail: user.email,
      text: chatText.trim(),
    })
    setChatText('')
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle} numberOfLines={1}>{meeting.title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Status + Actions */}
        <View style={styles.detailStatusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(meeting.status) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor(meeting.status) }]}>
              {statusLabel(meeting.status)}
            </Text>
          </View>
          {isHost && isScheduled && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
              onPress={() => startMeeting(meeting.id)}
            >
              <Ionicons name="videocam" size={14} color="#fff" />
              <Text style={styles.actionBtnText}>Start</Text>
            </TouchableOpacity>
          )}
          {isHost && isLive && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}
              onPress={() => { endMeeting(meeting.id); onClose() }}
            >
              <Ionicons name="call" size={14} color="#fff" />
              <Text style={styles.actionBtnText}>End</Text>
            </TouchableOpacity>
          )}
          {isHost && isScheduled && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.danger + 'CC' }]}
              onPress={() => { cancelMeeting(meeting.id); onClose() }}
            >
              <Text style={styles.actionBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.detailTabs}>
          {(['info', 'chat', 'participants'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.detailTab, detailTab === t && styles.detailTabActive]}
              onPress={() => setDetailTab(t)}
            >
              <Text style={[styles.detailTabText, detailTab === t && styles.detailTabTextActive]}>
                {t === 'info' ? 'Info' : t === 'chat' ? `Chat (${meeting.chat.length})` : `People (${meeting.participants.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {detailTab === 'info' && (
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {meeting.description ? (
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                <Text style={styles.infoText}>{meeting.description}</Text>
              </View>
            ) : null}
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{formatDate(meeting.scheduledAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{formatDuration(meeting.duration)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>Host: {meeting.hostName}</Text>
            </View>
            <View style={[styles.codeCard]}>
              <Text style={styles.codeLabel}>Meeting Code</Text>
              <Text style={styles.codeLarge}>{meeting.meetingCode}</Text>
              <Text style={styles.codeHint}>Share this code with others to let them join</Text>
            </View>
          </ScrollView>
        )}

        {detailTab === 'chat' && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <FlatList
              data={meeting.chat}
              keyExtractor={(item) => item.id}
              style={styles.chatList}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <View style={styles.chatMsg}>
                  <Text style={styles.chatSender}>{item.senderName}</Text>
                  <Text style={styles.chatText}>{item.text}</Text>
                  <Text style={styles.chatTime}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No messages yet</Text>}
            />
            {isLive && (
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  value={chatText}
                  onChangeText={setChatText}
                  placeholder="Type a message..."
                  placeholderTextColor={COLORS.secondaryText}
                  returnKeyType="send"
                  onSubmitEditing={handleSendChat}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat}>
                  <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        )}

        {detailTab === 'participants' && (
          <FlatList
            data={meeting.participants}
            keyExtractor={(item) => item.email}
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.participantRow}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.participantName}>{item.name}</Text>
                  <Text style={styles.participantEmail}>{item.email}</Text>
                </View>
                {item.leftAt ? (
                  <Text style={styles.leftBadge}>Left</Text>
                ) : (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No participants yet</Text>}
          />
        )}
      </View>
    </Modal>
  )
}

// ── Main Screen ───────────────────────────────────────────────────────
export function MeetingsScreen() {
  const insets = useSafeAreaInsets()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  const { meetings, recordings, createMeeting, joinByCode, joinMeeting, deleteRecording } = useMeetingStore()
  const user = useAuthStore((s) => s.user)

  const upcoming = meetings.filter((m) => m.status === 'scheduled')
  const live = meetings.filter((m) => m.status === 'live')
  const past = meetings.filter((m) => m.status === 'ended' || m.status === 'cancelled')

  const handleCreate = (data: {
    title: string; description: string; scheduledAt: string; duration: number
  }) => {
    if (!user) return
    createMeeting({
      ...data,
      hostEmail: user.email,
      hostName: `${user.firstName} ${user.lastName}`,
    })
  }

  const handleJoinByCode = (code: string) => {
    const meeting = joinByCode(code)
    if (!meeting) { Alert.alert('Not Found', 'No active meeting found with that code.'); return }
    if (user) {
      joinMeeting(meeting.id, { name: `${user.firstName} ${user.lastName}`, email: user.email })
    }
    setSelectedMeeting(meeting)
  }

  const tabData = tab === 'upcoming' ? upcoming : tab === 'live' ? live : tab === 'past' ? past : []

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <AppHeader title="Meetings" />

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: COLORS.primary }]} onPress={() => setShowCreate(true)}>
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.actionCardText}>Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: COLORS.success }]} onPress={() => setShowJoin(true)}>
          <Ionicons name="enter-outline" size={22} color="#fff" />
          <Text style={styles.actionCardText}>Join by Code</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([
          { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
          { key: 'live',     label: `Live (${live.length})` },
          { key: 'past',     label: `Past (${past.length})` },
          { key: 'recordings', label: `Recordings (${recordings.length})` },
        ] as const).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]} numberOfLines={1}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === 'recordings' ? (
        <FlatList
          data={recordings}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.meetingTitle}</Text>
                  <Text style={styles.cardDesc}>{new Date(item.recordedAt).toLocaleDateString()} · {Math.round(item.duration / 60)} min</Text>
                </View>
                <TouchableOpacity onPress={() => deleteRecording(item.id)}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="film-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyTitle}>No recordings</Text>
              <Text style={styles.emptyDesc}>Recorded meetings will appear here</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={tabData}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <MeetingCard
              meeting={item}
              onPress={() => setSelectedMeeting(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="videocam-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyTitle}>
                {tab === 'live' ? 'No live meetings' : tab === 'upcoming' ? 'No upcoming meetings' : 'No past meetings'}
              </Text>
              <Text style={styles.emptyDesc}>
                {tab === 'upcoming' ? 'Schedule a meeting to get started' : ''}
              </Text>
            </View>
          }
        />
      )}

      {/* Modals */}
      <CreateMeetingModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
      />
      <JoinByCodeModal
        visible={showJoin}
        onClose={() => setShowJoin(false)}
        onJoin={handleJoinByCode}
      />
      <MeetingDetailModal
        meeting={selectedMeeting}
        visible={!!selectedMeeting}
        onClose={() => setSelectedMeeting(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  actionCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 12,
  },
  actionCardText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 11, color: COLORS.secondaryText, fontWeight: '500' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardDesc: { fontSize: 13, color: COLORS.secondaryText, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.secondaryText },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  emptyDesc: { fontSize: 13, color: COLORS.secondaryText },
  // Modals
  modalContainer: { flex: 1, backgroundColor: COLORS.card },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 12 },
  modalBody: { flex: 1, padding: 20 },
  modalFooter: {
    flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: COLORS.background,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  btn: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: COLORS.primary },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnOutline: { borderWidth: 1.5, borderColor: COLORS.border },
  btnOutlineText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  // Join modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  joinModal: { backgroundColor: COLORS.card, borderRadius: 16, padding: 24, width: '85%' },
  joinModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  joinModalSub: { fontSize: 13, color: COLORS.secondaryText, marginBottom: 16 },
  codeInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 12, fontSize: 16, color: COLORS.text, textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2, marginBottom: 16, backgroundColor: COLORS.background,
  },
  joinModalBtns: { flexDirection: 'row' },
  // Detail modal
  detailStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  detailTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  detailTabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  detailTabText: { fontSize: 12, color: COLORS.secondaryText },
  detailTabTextActive: { color: COLORS.primary, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  infoText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  codeCard: {
    backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 16,
  },
  codeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.primary, marginBottom: 6 },
  codeLarge: {
    fontSize: 22, fontWeight: '800', color: COLORS.primary, letterSpacing: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeHint: { fontSize: 12, color: COLORS.secondaryText, marginTop: 6, textAlign: 'center' },
  chatList: { flex: 1, paddingHorizontal: 16 },
  chatMsg: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, marginBottom: 8 },
  chatSender: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  chatText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  chatTime: { fontSize: 11, color: COLORS.secondaryText, marginTop: 4, textAlign: 'right' },
  chatInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  chatInput: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  participantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center' },
  participantAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  participantName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  participantEmail: { fontSize: 12, color: COLORS.secondaryText },
  leftBadge: { fontSize: 11, color: COLORS.secondaryText },
  activeBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  activeBadgeText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: COLORS.secondaryText, marginTop: 40, fontSize: 14 },
})

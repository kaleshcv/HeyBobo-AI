import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import {
  useMeetingStore,
  type Meeting,
  type MeetingStatus,
} from '@/store/meetingStore'
import { useAuthStore } from '@/store/authStore'
import T from '@/theme'

// ─── Dark theme ───────────────────────────────────────────────────────────────
const C = {
  bg:      T.bg2,
  surface: T.text,
  surface2:T.border2,
  border:  T.border2,
  primary: T.primary2,
  primaryL:T.primary,
  yellow:  T.yellow,
  green:   T.green,
  red:     T.red,
  orange:  T.orange,
  white:   T.bg,
  muted:   T.muted2,
  muted2:  T.muted2,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColor = (s: MeetingStatus) => {
  switch (s) {
    case 'live':      return T.red
    case 'scheduled': return T.primary
    case 'ended':     return T.muted
    case 'cancelled': return T.orange
  }
}
const statusLabel = (s: MeetingStatus) => {
  switch (s) {
    case 'live':      return '● LIVE'
    case 'scheduled': return 'Scheduled'
    case 'ended':     return 'Completed'
    case 'cancelled': return 'Cancelled'
  }
}
const fmtDuration = (min: number) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60); const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ visible, onClose, onSave }: {
  visible: boolean; onClose: () => void
  onSave: (d: { title: string; description: string; scheduledAt: string; duration: number }) => void
}) {
  const [title, setTitle] = useState('')
  const [desc,  setDesc]  = useState('')
  const [date,  setDate]  = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0); return d.toISOString().slice(0, 16)
  })
  const [dur, setDur] = useState('60')

  const save = () => {
    if (!title.trim()) { Alert.alert('Error', 'Please enter a title'); return }
    onSave({ title: title.trim(), description: desc.trim(), scheduledAt: new Date(date).toISOString(), duration: parseInt(dur) || 60 })
    setTitle(''); setDesc(''); setDur('60'); onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Schedule Meeting</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={T.muted} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Study Group Session" placeholderTextColor={T.muted2} />
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput style={[styles.input, styles.textArea]} value={desc} onChangeText={setDesc} placeholder="What will you cover?" placeholderTextColor={T.muted2} multiline numberOfLines={3} />
            <Text style={styles.fieldLabel}>Date & Time (YYYY-MM-DDTHH:MM)</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2024-12-31T14:00" placeholderTextColor={T.muted2} />
            <Text style={styles.fieldLabel}>Duration (minutes)</Text>
            <TextInput style={styles.input} value={dur} onChangeText={setDur} keyboardType="numeric" placeholder="60" placeholderTextColor={T.muted2} />
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.outlineBtn} onPress={onClose}><Text style={styles.outlineBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.yellowBtn} onPress={save}><Text style={styles.yellowBtnText}>Schedule</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

// ─── Join by Code Modal ───────────────────────────────────────────────────────
function JoinCodeModal({ visible, onClose, onJoin }: {
  visible: boolean; onClose: () => void; onJoin: (code: string) => void
}) {
  const [code, setCode] = useState('')
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.joinModal}>
          <Text style={styles.joinTitle}>Join Meeting</Text>
          <Text style={styles.joinSub}>Enter the meeting code (e.g. abc-def-ghi)</Text>
          <TextInput style={styles.codeInput} value={code} onChangeText={setCode} placeholder="abc-def-ghi" placeholderTextColor={T.muted2} autoCapitalize="none" />
          <View style={styles.joinBtns}>
            <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]} onPress={onClose}><Text style={styles.outlineBtnText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.yellowBtn, { flex: 1 }, !code.trim() && { opacity: 0.5 }]}
              onPress={() => { if (code.trim()) { onJoin(code.trim()); onClose(); setCode('') } }}
              disabled={!code.trim()}
            >
              <Text style={styles.yellowBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({ meeting, onPress }: { meeting: Meeting; onPress: () => void }) {
  const isLive = meeting.status === 'live'
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{meeting.title}</Text>
          {meeting.description ? <Text style={styles.cardDesc} numberOfLines={1}>{meeting.description}</Text> : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor(meeting.status)}22` }]}>
          <Text style={[styles.statusText, { color: statusColor(meeting.status) }]}>{statusLabel(meeting.status)}</Text>
        </View>
      </View>
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}><Ionicons name="calendar-outline" size={12} color={T.muted} /><Text style={styles.metaText}>{fmtDate(meeting.scheduledAt)}</Text></View>
        <View style={styles.metaItem}><Ionicons name="time-outline" size={12} color={T.muted} /><Text style={styles.metaText}>{fmtDuration(meeting.duration)}</Text></View>
        <View style={styles.metaItem}><Ionicons name="people-outline" size={12} color={T.muted} /><Text style={styles.metaText}>{meeting.participants.length} joined</Text></View>
      </View>
      <View style={styles.codeRow}>
        <Ionicons name="key-outline" size={12} color={T.primary} />
        <Text style={styles.codeText}>{meeting.meetingCode}</Text>
        {isLive && <View style={styles.liveChip}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>}
      </View>
    </TouchableOpacity>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ meeting, visible, onClose }: {
  meeting: Meeting | null; visible: boolean; onClose: () => void
}) {
  const { startMeeting, endMeeting, cancelMeeting, sendChat } = useMeetingStore()
  const user = useAuthStore((s) => s.user)
  const [chatText, setChatText] = useState('')
  const [dTab, setDTab] = useState<'info' | 'chat' | 'people'>('info')

  if (!meeting) return null
  const isHost = meeting.hostEmail === user?.email
  const isLive = meeting.status === 'live'
  const isSched = meeting.status === 'scheduled'

  const sendMsg = () => {
    if (!chatText.trim() || !user) return
    sendChat(meeting.id, { senderName: `${user.firstName} ${user.lastName}`, senderEmail: user.email, text: chatText.trim() })
    setChatText('')
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle} numberOfLines={1}>{meeting.title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}><Ionicons name="close" size={22} color={T.muted} /></TouchableOpacity>
        </View>

        <View style={styles.detailActions}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor(meeting.status)}22` }]}>
            <Text style={[styles.statusText, { color: statusColor(meeting.status) }]}>{statusLabel(meeting.status)}</Text>
          </View>
          {isHost && isSched && <TouchableOpacity style={[styles.actionBtn, { backgroundColor: T.green }]} onPress={() => startMeeting(meeting.id)}><Ionicons name="videocam" size={13} color={T.white} /><Text style={styles.actionBtnText}>Start</Text></TouchableOpacity>}
          {isHost && isLive  && <TouchableOpacity style={[styles.actionBtn, { backgroundColor: T.red }]} onPress={() => { endMeeting(meeting.id); onClose() }}><Ionicons name="call" size={13} color={T.white} /><Text style={styles.actionBtnText}>End</Text></TouchableOpacity>}
          {isHost && isSched && <TouchableOpacity style={[styles.actionBtn, { backgroundColor: T.orange }]} onPress={() => { cancelMeeting(meeting.id); onClose() }}><Text style={styles.actionBtnText}>Cancel</Text></TouchableOpacity>}
        </View>

        <View style={styles.detailTabs}>
          {(['info', 'chat', 'people'] as const).map((t) => (
            <TouchableOpacity key={t} style={[styles.detailTab, dTab === t && styles.detailTabActive]} onPress={() => setDTab(t)}>
              <Text style={[styles.detailTabText, dTab === t && styles.detailTabTextActive]}>
                {t === 'info' ? 'Info' : t === 'chat' ? `Chat (${meeting.chat.length})` : `People (${meeting.participants.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {dTab === 'info' && (
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {meeting.description ? <View style={styles.infoRow}><Ionicons name="document-text-outline" size={15} color={T.primary} /><Text style={styles.infoText}>{meeting.description}</Text></View> : null}
            <View style={styles.infoRow}><Ionicons name="calendar-outline" size={15} color={T.primary} /><Text style={styles.infoText}>{fmtDate(meeting.scheduledAt)}</Text></View>
            <View style={styles.infoRow}><Ionicons name="time-outline" size={15} color={T.primary} /><Text style={styles.infoText}>{fmtDuration(meeting.duration)}</Text></View>
            <View style={styles.infoRow}><Ionicons name="person-outline" size={15} color={T.primary} /><Text style={styles.infoText}>Host: {meeting.hostName}</Text></View>
            <View style={styles.codeCard}>
              <Text style={styles.codeCardLabel}>Meeting Code</Text>
              <Text style={styles.codeLarge}>{meeting.meetingCode}</Text>
              <Text style={styles.codeHint}>Share this code to let others join</Text>
            </View>
          </ScrollView>
        )}

        {dTab === 'chat' && (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <FlatList data={meeting.chat} keyExtractor={(i) => i.id} style={styles.modalBody} contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => (
                <View style={styles.chatMsg}>
                  <Text style={styles.chatSender}>{item.senderName}</Text>
                  <Text style={styles.chatText}>{item.text}</Text>
                  <Text style={styles.chatTime}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyLabel}>No messages yet</Text>}
            />
            {isLive && (
              <View style={styles.chatInputRow}>
                <TextInput style={styles.chatInput} value={chatText} onChangeText={setChatText} placeholder="Type a message…" placeholderTextColor={T.muted2} returnKeyType="send" onSubmitEditing={sendMsg} />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMsg}><Ionicons name="send" size={17} color={T.white} /></TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        )}

        {dTab === 'people' && (
          <FlatList data={meeting.participants} keyExtractor={(p) => p.email} style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.personRow}>
                <View style={styles.personAvatar}><Text style={styles.personAvatarText}>{item.name.charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.personName}>{item.name}</Text><Text style={styles.personEmail}>{item.email}</Text></View>
                {item.leftAt ? <Text style={styles.leftText}>Left</Text> : <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyLabel}>No participants yet</Text>}
          />
        )}
      </View>
    </Modal>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
type Tab = 'upcoming' | 'live' | 'past' | 'invited' | 'recordings'

export function MeetingsScreen() {
  const insets = useSafeAreaInsets()
  const [tab,        setTab]        = useState<Tab>('upcoming')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin,   setShowJoin]   = useState(false)
  const [selected,   setSelected]   = useState<Meeting | null>(null)

  const { meetings, recordings, createMeeting, joinByCode, joinMeeting, deleteRecording } = useMeetingStore()
  const user = useAuthStore((s) => s.user)

  const upcoming  = meetings.filter((m) => m.status === 'scheduled')
  const live      = meetings.filter((m) => m.status === 'live')
  const past      = meetings.filter((m) => m.status === 'ended' || m.status === 'cancelled')
  const invited   = meetings.filter((m) => m.invites.some((i) => i.targetId === user?.email && !i.accepted))
  const completed = meetings.filter((m) => m.status === 'ended')

  const TABS: { key: Tab; label: string; dot?: boolean }[] = [
    { key: 'upcoming',   label: `Upcoming (${upcoming.length})` },
    { key: 'live',       label: 'Live' },
    { key: 'past',       label: `Past (${past.length})` },
    { key: 'invited',    label: `Invited (${invited.length})` },
    { key: 'recordings', label: `Recordings (${recordings.length})`, dot: recordings.length > 0 },
  ]

  const tabData = tab === 'upcoming' ? upcoming : tab === 'live' ? live : tab === 'past' ? past : tab === 'invited' ? invited : []

  const emptyMsg =
    tab === 'live'       ? 'No live meetings right now'
    : tab === 'upcoming' ? 'No upcoming meetings. Create one to get started!'
    : tab === 'past'     ? 'No past meetings yet'
    : tab === 'invited'  ? "You haven't been invited to any meetings"
    : 'No recordings yet'

  const handleCreate = (d: { title: string; description: string; scheduledAt: string; duration: number }) => {
    if (!user) return
    createMeeting({ ...d, hostEmail: user.email, hostName: `${user.firstName} ${user.lastName}` })
  }

  const handleJoinCode = (code: string) => {
    const m = joinByCode(code)
    if (!m) { Alert.alert('Not Found', 'No active meeting found with that code.'); return }
    if (user) joinMeeting(m.id, { name: `${user.firstName} ${user.lastName}`, email: user.email })
    setSelected(m)
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Top bar ─────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.topBarIcon}><Ionicons name="videocam" size={16} color={T.red} /></View>
          <View>
            <Text style={styles.topBarTitle}>Meetings</Text>
            <Text style={styles.topBarSub}>Create, schedule and join live meetings</Text>
          </View>
        </View>
        <View style={styles.topBarBtns}>
          <TouchableOpacity style={styles.joinCodeBtn} onPress={() => setShowJoin(true)} activeOpacity={0.8}>
            <Ionicons name="tv-outline" size={13} color={T.white} />
            <Text style={styles.joinCodeBtnText}>Join with Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newMeetingBtn} onPress={() => setShowCreate(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={15} color={T.black} />
            <Text style={styles.newMeetingBtnText}>New Meeting</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Stats row ────────────────────────────────────── */}
      <View style={styles.statsRow}>
        {[
          { label: 'Scheduled',   value: upcoming.length },
          { label: 'Live Now',    value: live.length },
          { label: 'Completed',   value: completed.length },
          { label: 'Invitations', value: invited.length },
        ].map((s, i) => (
          <View key={s.label} style={[styles.statCard, i < 3 && { borderRightWidth: 1, borderRightColor: T.border }]}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── Tab bar ──────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)} activeOpacity={0.7}>
            <View style={styles.tabRow}>
              {t.dot && <View style={styles.tabDot} />}
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Content ──────────────────────────────────────── */}
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
                <TouchableOpacity
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() => Alert.alert('Delete Recording', 'Remove this recording?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteRecording(item.id) },
                  ])}
                >
                  <Ionicons name="trash-outline" size={18} color={T.red} />
                </TouchableOpacity>
              </View>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}><Ionicons name="film-outline" size={12} color={T.muted} /><Text style={styles.metaText}>{(item.sizeBytes / 1024 / 1024).toFixed(1)} MB</Text></View>
              </View>
            </View>
          )}
          ListEmptyComponent={<View style={styles.emptyBlock}><Ionicons name="film-outline" size={52} color={T.muted2} /><Text style={styles.emptyTitle}>{emptyMsg}</Text></View>}
        />
      ) : (
        <FlatList
          data={tabData}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <MeetingCard meeting={item} onPress={() => setSelected(item)} />}
          ListEmptyComponent={<View style={styles.emptyBlock}><Ionicons name="videocam-outline" size={52} color={T.muted2} /><Text style={styles.emptyTitle}>{emptyMsg}</Text></View>}
        />
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      <CreateModal visible={showCreate} onClose={() => setShowCreate(false)} onSave={handleCreate} />
      <JoinCodeModal visible={showJoin} onClose={() => setShowJoin(false)} onJoin={handleJoinCode} />
      <DetailModal meeting={selected} visible={!!selected} onClose={() => setSelected(null)} />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  // Top bar
  topBar: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: T.border,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
  },
  topBarLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topBarIcon:  { width: 30, height: 30, borderRadius: 8, backgroundColor: `${T.red}33`, justifyContent: 'center', alignItems: 'center' },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: T.white },
  topBarSub:   { fontSize: 11, color: T.muted, marginTop: 1 },
  topBarBtns:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  joinCodeBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: T.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  joinCodeBtnText: { fontSize: 12, fontWeight: '600', color: T.white },
  newMeetingBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: T.yellow, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  newMeetingBtnText: { fontSize: 12, fontWeight: '700', color: T.black },

  // Stats
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border },
  statCard:  { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { fontSize: 22, fontWeight: '800', color: T.white, marginBottom: 3 },
  statLabel: { fontSize: 10, color: T.muted, textAlign: 'center' },

  // Tab bar
  tabBar: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBarContent: { paddingHorizontal: 8, gap: 2, alignItems: 'center' },
  tab: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: T.yellow },
  tabRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tabDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: T.red },
  tabText: { fontSize: 13, fontWeight: '600', color: T.muted },
  tabTextActive: { color: T.yellow },

  // Cards
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: T.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: T.border },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: T.white, marginBottom: 2 },
  cardDesc:  { fontSize: 12, color: T.muted, lineHeight: 17 },
  cardMeta:  { flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginBottom: 8 },
  metaItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:  { fontSize: 11, color: T.muted },
  codeRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeText:  { fontSize: 12, color: T.primary, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  liveChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  liveDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: T.red },
  liveText:  { fontSize: 10, fontWeight: '800', color: T.red, letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText:  { fontSize: 11, fontWeight: '700' },

  // Empty
  emptyBlock: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 14, color: T.muted, textAlign: 'center', paddingHorizontal: 32 },

  // Modal base
  modal: { flex: 1, backgroundColor: T.surface },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  modalTitle: { fontSize: 17, fontWeight: '700', color: T.white, flex: 1, marginRight: 12 },
  modalBody:  { flex: 1, padding: 20 },
  modalFooter:{ flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: T.border },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: T.muted, marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 12, fontSize: 14, color: T.white },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  // Buttons
  outlineBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  outlineBtnText: { color: T.white, fontWeight: '600', fontSize: 14 },
  yellowBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: T.yellow },
  yellowBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },

  // Join modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center' },
  joinModal: { backgroundColor: T.surface, borderRadius: 16, padding: 24, width: '85%', gap: 10 },
  joinTitle: { fontSize: 18, fontWeight: '700', color: T.white },
  joinSub:   { fontSize: 13, color: T.muted },
  codeInput: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 12, fontSize: 16, color: T.white, textAlign: 'center', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 2, marginVertical: 6 },
  joinBtns:  { flexDirection: 'row', gap: 10, marginTop: 4 },

  // Detail modal
  detailActions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { color: T.white, fontWeight: '600', fontSize: 13 },
  detailTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: T.border },
  detailTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  detailTabActive: { borderBottomWidth: 2, borderBottomColor: T.primary },
  detailTabText: { fontSize: 12, color: T.muted },
  detailTabTextActive: { color: T.primary, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  infoText: { flex: 1, fontSize: 14, color: T.white, lineHeight: 20 },
  codeCard: { backgroundColor: `${T.primary}18`, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  codeCardLabel: { fontSize: 12, fontWeight: '600', color: T.primary, marginBottom: 6 },
  codeLarge: { fontSize: 22, fontWeight: '800', color: T.primary, letterSpacing: 3, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  codeHint: { fontSize: 12, color: T.muted, marginTop: 6, textAlign: 'center' },
  chatMsg: { backgroundColor: T.surface2, borderRadius: 10, padding: 12, marginBottom: 8 },
  chatSender: { fontSize: 12, fontWeight: '700', color: T.primary, marginBottom: 2 },
  chatText: { fontSize: 14, color: T.white, lineHeight: 20 },
  chatTime: { fontSize: 11, color: T.muted, marginTop: 4, textAlign: 'right' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: T.border },
  chatInput: { flex: 1, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: T.white },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.primary, alignItems: 'center', justifyContent: 'center' },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  personAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${T.primary}33`, alignItems: 'center', justifyContent: 'center' },
  personAvatarText: { fontSize: 16, fontWeight: '700', color: T.primary },
  personName: { fontSize: 14, fontWeight: '600', color: T.white },
  personEmail: { fontSize: 12, color: T.muted },
  leftText: { fontSize: 11, color: T.muted },
  activeBadge: { backgroundColor: `${T.green}22`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  activeBadgeText: { fontSize: 11, color: T.green, fontWeight: '600' },
  emptyLabel: { textAlign: 'center', color: T.muted, marginTop: 40, fontSize: 14 },
})

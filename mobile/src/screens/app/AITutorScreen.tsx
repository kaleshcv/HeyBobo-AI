import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { useAiTutorStore } from '@/store/aiTutorStore'
import { useCreateConversation, useStreamMessage } from '@/hooks/useAI'
import { useLearningStats } from '@/hooks/useCourses'
import { useWorkoutSessions } from '@/hooks/useFitness'
import { useAuthStore } from '@/store/authStore'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { asyncStorage } from '@/lib/storage'
import T from '@/theme'

// ─── Local textbook store ────────────────────────────────────────────────────
interface Textbook {
  id: string
  name: string
  size: string
  uploadedAt: string
  color: string
}

interface StudyPlan {
  id: string
  textbookId: string
  textbookName: string
  title: string
  weeks: number
  topics: { week: number; title: string; done: boolean }[]
  createdAt: string
}

interface TutorQuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  topic: string
}

interface TextbookStoreState {
  textbooks: Textbook[]
  studyPlans: StudyPlan[]
  quizAnswers: Record<string, number>
  addTextbook: (tb: Omit<Textbook, 'id' | 'uploadedAt'>) => void
  removeTextbook: (id: string) => void
  addStudyPlan: (plan: StudyPlan) => void
  togglePlanTopic: (planId: string, topicIdx: number) => void
  setQuizAnswer: (qId: string, idx: number) => void
}

const BOOK_COLORS = [T.primary2, T.green, T.orange, T.cyan, T.primary, T.red]

const useTextbookStore = create<TextbookStoreState>()(
  persist(
    (set) => ({
      textbooks: [],
      studyPlans: [],
      quizAnswers: {},
      addTextbook: (tb) =>
        set((s) => ({
          textbooks: [
            { ...tb, id: `tb_${Date.now()}`, uploadedAt: new Date().toISOString() },
            ...s.textbooks,
          ],
        })),
      removeTextbook: (id) =>
        set((s) => ({
          textbooks: s.textbooks.filter((t) => t.id !== id),
          studyPlans: s.studyPlans.filter((p) => p.textbookId !== id),
        })),
      addStudyPlan: (plan) =>
        set((s) => ({ studyPlans: [plan, ...s.studyPlans] })),
      togglePlanTopic: (planId, idx) =>
        set((s) => ({
          studyPlans: s.studyPlans.map((p) =>
            p.id !== planId
              ? p
              : {
                  ...p,
                  topics: p.topics.map((t, i) => (i === idx ? { ...t, done: !t.done } : t)),
                }
          ),
        })),
      setQuizAnswer: (qId, idx) =>
        set((s) => ({ quizAnswers: { ...s.quizAnswers, [qId]: idx } })),
    }),
    { name: 'ai_tutor_textbooks', storage: createJSONStorage(() => asyncStorage) }
  )
)

// ─── Sample quiz questions ───────────────────────────────────────────────────
const SAMPLE_QUESTIONS: TutorQuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary function of mitochondria in a cell?',
    options: ['Protein synthesis', 'Energy production (ATP)', 'DNA replication', 'Cell division'],
    correctIndex: 1,
    topic: 'Biology',
  },
  {
    id: 'q2',
    question: "Which law states that force equals mass times acceleration?",
    options: ["Newton's 1st Law", "Newton's 2nd Law", "Newton's 3rd Law", "Hooke's Law"],
    correctIndex: 1,
    topic: 'Physics',
  },
  {
    id: 'q3',
    question: 'What is the derivative of sin(x)?',
    options: ['-cos(x)', 'cos(x)', '-sin(x)', 'tan(x)'],
    correctIndex: 1,
    topic: 'Calculus',
  },
  {
    id: 'q4',
    question: 'In Python, which keyword is used to define a function?',
    options: ['function', 'func', 'def', 'define'],
    correctIndex: 2,
    topic: 'Programming',
  },
]

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
  bg:      T.bg2,
  surface: T.text,
  surface2:T.border2,
  border:  T.border2,
  primary: T.primary2,
  primaryL:T.primary,
  green:   T.green,
  yellow:  T.yellow,
  red:     T.red,
  cyan:    T.cyan,
  orange:  T.orange,
  white:   T.bg,
  muted:   T.muted2,
  muted2:  T.muted2,
}

const TABS = ['Textbooks', 'Study Plans', 'Quizzes', 'Progress', 'Chat'] as const
type Tab = typeof TABS[number]

// ─── Root screen ─────────────────────────────────────────────────────────────
export function AITutorScreen() {
  const insets    = useSafeAreaInsets()
  const [active, setActive] = useState<Tab>('Textbooks')

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.tutorBadge}>
            <Ionicons name="sparkles" size={16} color={T.primary} />
          </View>
          <Text style={styles.topBarTitle}>AI Tutor</Text>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, active === tab && styles.tabActive]}
            onPress={() => setActive(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, active === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {active === 'Textbooks'   && <TextbooksTab />}
      {active === 'Study Plans' && <StudyPlansTab />}
      {active === 'Quizzes'     && <QuizzesTab />}
      {active === 'Progress'    && <ProgressTab />}
      {active === 'Chat'        && <ChatTab insets={insets} />}
    </View>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Textbooks tab
// ─────────────────────────────────────────────────────────────────────────────
function TextbooksTab() {
  const { textbooks, addTextbook, removeTextbook } = useTextbookStore()
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      })
      if (result.canceled) return
      const file = result.assets[0]
      setUploading(true)
      await new Promise((r) => setTimeout(r, 800))
      addTextbook({
        name:  file.name,
        size:  file.size ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
        color: BOOK_COLORS[textbooks.length % BOOK_COLORS.length],
      })
      setUploading(false)
    } catch {
      setUploading(false)
    }
  }

  const confirmRemove = (id: string, name: string) =>
    Alert.alert('Remove Textbook', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeTextbook(id) },
    ])

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionDesc}>
        Upload your university textbooks. The AI will study them and help you learn.
      </Text>

      <TouchableOpacity
        style={styles.uploadBox}
        onPress={handleUpload}
        disabled={uploading}
        activeOpacity={0.75}
      >
        {uploading ? (
          <>
            <ActivityIndicator color={T.orange} size="large" />
            <Text style={styles.uploadTitle}>Processing…</Text>
          </>
        ) : (
          <>
            <Ionicons name="document-attach-outline" size={40} color={T.orange} />
            <Text style={styles.uploadTitle}>Upload Textbook</Text>
            <Text style={styles.uploadSub}>PDF up to 50 MB</Text>
          </>
        )}
      </TouchableOpacity>

      {textbooks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={52} color={T.muted2} />
          <Text style={styles.emptyTitle}>No textbooks uploaded yet.</Text>
          <Text style={styles.emptySub}>Upload your first textbook to get started.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionLabel}>{textbooks.length} Textbook{textbooks.length !== 1 ? 's' : ''}</Text>
          {textbooks.map((tb) => (
            <View key={tb.id} style={styles.bookCard}>
              <View style={[styles.bookIcon, { backgroundColor: `${tb.color}22` }]}>
                <Ionicons name="document-text-outline" size={22} color={tb.color} />
              </View>
              <View style={styles.bookInfo}>
                <Text style={styles.bookName} numberOfLines={2}>{tb.name}</Text>
                <Text style={styles.bookMeta}>{tb.size} · {new Date(tb.uploadedAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.bookRight}>
                <View style={styles.readyBadge}>
                  <Text style={styles.readyText}>Ready</Text>
                </View>
                <TouchableOpacity onPress={() => confirmRemove(tb.id, tb.name)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={16} color={T.muted2} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Study Plans tab
// ─────────────────────────────────────────────────────────────────────────────
function StudyPlansTab() {
  const { textbooks, studyPlans, addStudyPlan, togglePlanTopic } = useTextbookStore()
  const [generating, setGenerating] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const targetBook = textbooks.find((t) => t.id === (selectedId ?? textbooks[0]?.id))

  const generate = async () => {
    if (!targetBook) {
      Alert.alert('No Textbook', 'Upload a textbook first to generate a study plan.')
      return
    }
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1200))
    addStudyPlan({
      id: `sp_${Date.now()}`,
      textbookId: targetBook.id,
      textbookName: targetBook.name,
      title: `4-Week Plan: ${targetBook.name.replace('.pdf', '')}`,
      weeks: 4,
      topics: [
        { week: 1, title: 'Chapter 1–3: Introduction & Foundations', done: false },
        { week: 1, title: 'Practice exercises & summaries', done: false },
        { week: 2, title: 'Chapter 4–6: Core Concepts', done: false },
        { week: 2, title: 'Mid-plan revision quiz', done: false },
        { week: 3, title: 'Chapter 7–9: Advanced Topics', done: false },
        { week: 3, title: 'Case studies & applications', done: false },
        { week: 4, title: 'Chapter 10–12: Final Sections', done: false },
        { week: 4, title: 'Full review & mock test', done: false },
      ],
      createdAt: new Date().toISOString(),
    })
    setGenerating(false)
  }

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionDesc}>
        AI generates a personalised study schedule from your uploaded textbooks.
      </Text>

      {textbooks.length > 0 && (
        <View style={styles.selectorRow}>
          <Text style={styles.selectorLabel}>Textbook:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {textbooks.map((tb) => {
              const isSelected = (selectedId ?? textbooks[0]?.id) === tb.id
              return (
                <TouchableOpacity
                  key={tb.id}
                  style={[styles.chip, isSelected && { borderColor: T.primary, backgroundColor: `${T.primary}22` }]}
                  onPress={() => setSelectedId(tb.id)}
                >
                  <Text style={[styles.chipText, isSelected && { color: T.primary }]} numberOfLines={1}>
                    {tb.name.replace('.pdf', '')}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, generating && { opacity: 0.6 }]}
        onPress={generate}
        disabled={generating}
        activeOpacity={0.8}
      >
        {generating
          ? <ActivityIndicator color={T.white} size="small" />
          : <Ionicons name="sparkles" size={17} color={T.white} />
        }
        <Text style={styles.primaryBtnText}>
          {generating ? 'Generating…' : 'Generate Study Plan'}
        </Text>
      </TouchableOpacity>

      {studyPlans.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={52} color={T.muted2} />
          <Text style={styles.emptyTitle}>No study plans yet.</Text>
          <Text style={styles.emptySub}>Generate one from your textbook above.</Text>
        </View>
      ) : (
        studyPlans.map((plan) => {
          const pct = Math.round((plan.topics.filter((t) => t.done).length / plan.topics.length) * 100)
          const weeks = [...new Set(plan.topics.map((t) => t.week))]
          return (
            <View key={plan.id} style={styles.planCard}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.pctRow}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: T.primary }]} />
                </View>
                <Text style={styles.pctText}>{pct}%</Text>
              </View>
              {weeks.map((wk) => (
                <View key={wk} style={styles.weekBlock}>
                  <Text style={styles.weekLabel}>Week {wk}</Text>
                  {plan.topics.filter((t) => t.week === wk).map((topic) => {
                    const ri = plan.topics.indexOf(topic)
                    return (
                      <TouchableOpacity key={ri} style={styles.topicRow} onPress={() => togglePlanTopic(plan.id, ri)}>
                        <Ionicons name={topic.done ? 'checkmark-circle' : 'ellipse-outline'} size={15} color={topic.done ? T.green : T.muted2} />
                        <Text style={[styles.topicText, topic.done && styles.strike]}>{topic.title}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              ))}
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quizzes tab
// ─────────────────────────────────────────────────────────────────────────────
function QuizzesTab() {
  const { quizAnswers, setQuizAnswer } = useTextbookStore()
  const [submitted, setSubmitted] = useState(false)

  const score = SAMPLE_QUESTIONS.filter((q) => quizAnswers[q.id] === q.correctIndex).length
  const allAnswered = SAMPLE_QUESTIONS.every((q) => (quizAnswers[q.id] ?? -1) >= 0)

  const reset = () => {
    SAMPLE_QUESTIONS.forEach((q) => setQuizAnswer(q.id, -1))
    setSubmitted(false)
  }

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionDesc}>Practice quizzes generated from your study materials.</Text>

      {submitted && (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Quiz Complete! 🎉</Text>
          <Text style={styles.scoreValue}>{score}/{SAMPLE_QUESTIONS.length}</Text>
          <Text style={styles.scoreSub}>{Math.round((score / SAMPLE_QUESTIONS.length) * 100)}% correct</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reset}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {SAMPLE_QUESTIONS.map((q, qi) => {
        const selected = quizAnswers[q.id] ?? -1
        return (
          <View key={q.id} style={styles.qCard}>
            <View style={styles.qHeader}>
              <View style={styles.qBadge}><Text style={styles.qBadgeText}>Q{qi + 1}</Text></View>
              <View style={styles.topicBadge}><Text style={styles.topicBadgeText}>{q.topic}</Text></View>
            </View>
            <Text style={styles.qText}>{q.question}</Text>
            {q.options.map((opt, oi) => {
              const isSelected   = selected === oi
              const isCorrectOpt = oi === q.correctIndex
              const showResult   = selected >= 0
              let bg: string = T.surface2
              let bc: string = T.border
              let tc: string = T.white
              if (showResult) {
                if (isCorrectOpt)            { bg = `${T.green}22`; bc = T.green; tc = T.green }
                else if (isSelected)         { bg = `${T.red}22`;   bc = T.red;   tc = T.red }
              } else if (isSelected) {
                bg = `${T.primary}22`; bc = T.primary; tc = T.primary
              }
              return (
                <TouchableOpacity
                  key={oi}
                  style={[styles.option, { backgroundColor: bg, borderColor: bc }]}
                  onPress={() => !submitted && selected < 0 && setQuizAnswer(q.id, oi)}
                  disabled={submitted || selected >= 0}
                  activeOpacity={0.75}
                >
                  <View style={styles.optLetter}><Text style={[styles.optLetterText, { color: tc }]}>{String.fromCharCode(65 + oi)}</Text></View>
                  <Text style={[styles.optText, { color: tc }]}>{opt}</Text>
                  {showResult && isCorrectOpt && <Ionicons name="checkmark-circle" size={15} color={T.green} />}
                  {showResult && isSelected && !isCorrectOpt && <Ionicons name="close-circle" size={15} color={T.red} />}
                </TouchableOpacity>
              )
            })}
          </View>
        )
      })}

      {!submitted && (
        <TouchableOpacity
          style={[styles.primaryBtn, !allAnswered && { opacity: 0.4 }]}
          onPress={() => setSubmitted(true)}
          disabled={!allAnswered}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Submit Quiz</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress tab
// ─────────────────────────────────────────────────────────────────────────────
function ProgressTab() {
  const { data: stats }    = useLearningStats()
  const { textbooks, studyPlans, quizAnswers } = useTextbookStore()

  const completedLessons = (stats as any)?.completedLessons ?? 0
  const enrolledCourses  = (stats as any)?.enrolledCourses  ?? 0

  const quizAttempted = SAMPLE_QUESTIONS.filter((q) => (quizAnswers[q.id] ?? -1) >= 0).length
  const quizCorrect   = SAMPLE_QUESTIONS.filter((q) => quizAnswers[q.id] === q.correctIndex).length
  const topicsDone    = studyPlans.reduce((s, p) => s + p.topics.filter((t) => t.done).length, 0)
  const topicsTotal   = studyPlans.reduce((s, p) => s + p.topics.length, 0)

  const metrics = [
    { label: 'Courses',          value: enrolledCourses,   icon: 'school-outline',          color: T.primary },
    { label: 'Lessons Done',     value: completedLessons,  icon: 'play-circle-outline',     color: T.green },
    { label: 'Textbooks',        value: textbooks.length,  icon: 'document-text-outline',   color: T.orange },
    { label: 'Topics Done',      value: `${topicsDone}/${topicsTotal || 0}`, icon: 'checkmark-done-outline', color: T.cyan },
    { label: 'Quiz Questions',   value: `${quizAttempted}/${SAMPLE_QUESTIONS.length}`, icon: 'help-circle-outline', color: T.yellow },
    { label: 'Quiz Accuracy',    value: quizAttempted ? `${Math.round((quizCorrect / quizAttempted) * 100)}%` : '—', icon: 'trophy-outline', color: T.primary },
  ]

  const achievements = [
    { label: 'First Upload',   icon: 'cloud-upload-outline', unlocked: textbooks.length > 0,   color: T.orange },
    { label: 'Study Starter',  icon: 'book-outline',         unlocked: studyPlans.length > 0,  color: T.primary },
    { label: 'Quiz Taker',     icon: 'help-circle-outline',  unlocked: quizAttempted > 0,      color: T.yellow },
    { label: 'Perfect Score',  icon: 'star-outline',         unlocked: quizCorrect === SAMPLE_QUESTIONS.length && quizAttempted === SAMPLE_QUESTIONS.length, color: T.green },
    { label: 'Course Learner', icon: 'school-outline',       unlocked: completedLessons > 0,   color: T.cyan },
    { label: 'Dedicated',      icon: 'flame-outline',        unlocked: completedLessons >= 5,  color: T.red },
  ]

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionDesc}>Track your learning progress across all AI Tutor activities.</Text>

      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <View key={m.label} style={[styles.metricCard, { borderColor: `${m.color}33` }]}>
            <Ionicons name={m.icon as any} size={22} color={m.color} />
            <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
            <Text style={styles.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {studyPlans.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Study Plan Progress</Text>
          {studyPlans.map((plan) => {
            const pct = Math.round((plan.topics.filter((t) => t.done).length / plan.topics.length) * 100)
            return (
              <View key={plan.id} style={styles.progressPlanCard}>
                <Text style={styles.progressPlanName} numberOfLines={1}>{plan.title}</Text>
                <Text style={styles.progressPlanSub}>{plan.topics.filter((t) => t.done).length}/{plan.topics.length} topics</Text>
                <View style={styles.pctRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: T.primary }]} />
                  </View>
                  <Text style={styles.pctText}>{pct}%</Text>
                </View>
              </View>
            )
          })}
        </>
      )}

      <Text style={styles.sectionLabel}>Achievements</Text>
      <View style={styles.achieveGrid}>
        {achievements.map((a) => (
          <View key={a.label} style={[styles.achieveCard, { opacity: a.unlocked ? 1 : 0.4 }]}>
            <View style={[styles.achieveIcon, { backgroundColor: `${a.color}22` }]}>
              <Ionicons name={a.icon as any} size={22} color={a.unlocked ? a.color : T.muted2} />
            </View>
            <Text style={[styles.achieveLabel, { color: a.unlocked ? T.white : T.muted }]}>{a.label}</Text>
            {a.unlocked && (
              <View style={styles.unlockedBadge}>
                <Text style={styles.unlockedText}>Unlocked</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat tab
// ─────────────────────────────────────────────────────────────────────────────
function ChatTab({ insets }: { insets: { bottom: number } }) {
  const [text, setText] = useState('')
  const listRef = useRef<FlatList>(null)

  const { streamingText, isStreaming } = useAiTutorStore()

  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([
    { id: '1', role: 'assistant', content: "Hello! I'm your AI Tutor 🎓 I can help you understand your textbooks, create study plans, and answer any questions. What would you like to learn today?" },
  ])

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true })
  }, [messages, streamingText])

  const send = () => {
    if (!text.trim()) return
    const msg = text.trim()
    setText('')
    setMessages((p) => [...p, { id: `${Date.now()}`, role: 'user', content: msg }])
    setTimeout(() => {
      setMessages((p) => [
        ...p,
        { id: `${Date.now() + 1}`, role: 'assistant', content: `That's a great question about "${msg}"! Let me break this down for you step by step based on your study materials.` },
      ])
    }, 1100)
  }

  const CHIPS = ['Explain Chapter 1', 'Create a quiz for me', 'Summarise my notes', 'What should I study today?']

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {CHIPS.map((c) => (
              <TouchableOpacity key={c} style={styles.suggChip} onPress={() => setText(c)}>
                <Text style={styles.suggChipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        }
        renderItem={({ item }) => {
          const isUser = item.role === 'user'
          return (
            <View style={[styles.msgRow, isUser && styles.msgRowR]}>
              {!isUser && (
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={13} color={T.primary} />
                </View>
              )}
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={[styles.bubbleText, isUser && { color: T.white }]}>{item.content}</Text>
              </View>
            </View>
          )
        }}
      />

      {/* Input row */}
      <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask your AI Tutor…"
            placeholderTextColor={T.muted2}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnOff]}
          onPress={send}
          disabled={!text.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={17} color={text.trim() ? T.white : T.muted2} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tutorBadge: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: `${T.primary}33`,
    justifyContent: 'center', alignItems: 'center',
  },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: T.white },

  tabBar: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: T.border },
  tabBarContent: { paddingHorizontal: 12, gap: 4, alignItems: 'center' },
  tab: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: T.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: T.muted },
  tabTextActive: { color: T.primary },

  content: { flex: 1 },
  contentInner: { padding: 16, paddingBottom: 40 },
  sectionDesc: { fontSize: 13, color: T.muted, marginBottom: 16, lineHeight: 19 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: T.muted, marginBottom: 10,
    textTransform: 'uppercase', letterSpacing: 0.6,
  },

  uploadBox: {
    backgroundColor: T.surface, borderRadius: 14,
    borderWidth: 2, borderColor: T.border, borderStyle: 'dashed',
    paddingVertical: 32, alignItems: 'center', gap: 8, marginBottom: 24,
  },
  uploadTitle: { fontSize: 15, fontWeight: '700', color: T.white },
  uploadSub:   { fontSize: 12, color: T.muted },

  empty: { alignItems: 'center', paddingTop: 32, gap: 8 },
  emptyTitle: { fontSize: 14, color: T.muted, fontWeight: '600' },
  emptySub:   { fontSize: 12, color: T.muted2 },

  bookCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: T.surface, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: T.border, gap: 12,
  },
  bookIcon:  { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bookInfo:  { flex: 1 },
  bookName:  { fontSize: 13, fontWeight: '600', color: T.white, marginBottom: 3 },
  bookMeta:  { fontSize: 11, color: T.muted },
  bookRight: { alignItems: 'flex-end', gap: 8 },
  readyBadge:{ backgroundColor: `${T.green}22`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  readyText: { fontSize: 10, fontWeight: '700', color: T.green },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: T.primary, borderRadius: 10, paddingVertical: 13,
    marginBottom: 20, gap: 8,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: T.white },

  selectorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  selectorLabel: { fontSize: 12, color: T.muted, fontWeight: '600' },
  chip: { borderRadius: 8, borderWidth: 1, borderColor: T.border, paddingHorizontal: 10, paddingVertical: 6, maxWidth: 140 },
  chipText: { fontSize: 11, color: T.muted, fontWeight: '500' },

  planCard: {
    backgroundColor: T.surface, borderRadius: 12,
    padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: T.border,
  },
  planTitle: { fontSize: 13, fontWeight: '700', color: T.white, marginBottom: 10 },
  pctRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  pctText: { fontSize: 11, color: T.muted, width: 32, textAlign: 'right' },
  progressTrack: { flex: 1, height: 6, backgroundColor: T.surface2, borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: 4 },
  weekBlock: { marginBottom: 10 },
  weekLabel: {
    fontSize: 10, fontWeight: '700', color: T.primary, marginBottom: 6,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  topicRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 7 },
  topicText: { flex: 1, fontSize: 12, color: T.white, lineHeight: 17 },
  strike: { textDecorationLine: 'line-through', color: T.muted2 },

  qCard: {
    backgroundColor: T.surface, borderRadius: 12,
    padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: T.border,
  },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  qBadge: { backgroundColor: `${T.primary}33`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  qBadgeText: { fontSize: 11, fontWeight: '700', color: T.primary },
  topicBadge: { backgroundColor: `${T.cyan}22`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  topicBadgeText: { fontSize: 11, fontWeight: '600', color: T.cyan },
  qText: { fontSize: 14, fontWeight: '600', color: T.white, marginBottom: 12, lineHeight: 20 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, padding: 10, marginBottom: 7,
    borderWidth: 1, gap: 10,
  },
  optLetter: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center',
  },
  optLetterText: { fontSize: 10, fontWeight: '700' },
  optText: { flex: 1, fontSize: 13 },

  scoreCard: {
    backgroundColor: T.surface, borderRadius: 14,
    padding: 20, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: `${T.green}44`, gap: 6,
  },
  scoreTitle: { fontSize: 16, fontWeight: '700', color: T.white },
  scoreValue: { fontSize: 36, fontWeight: '800', color: T.green },
  scoreSub:   { fontSize: 13, color: T.muted },
  retryBtn:   { marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: T.green },
  retryText:  { fontSize: 13, fontWeight: '600', color: T.green },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  metricCard:  {
    width: '30%', flexGrow: 1,
    backgroundColor: T.surface, borderRadius: 10,
    padding: 12, alignItems: 'center', borderWidth: 1, gap: 5,
  },
  metricValue: { fontSize: 18, fontWeight: '800' },
  metricLabel: { fontSize: 10, color: T.muted, textAlign: 'center', lineHeight: 14 },

  progressPlanCard: {
    backgroundColor: T.surface, borderRadius: 10,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: T.border,
  },
  progressPlanName: { fontSize: 12, fontWeight: '600', color: T.white, marginBottom: 2 },
  progressPlanSub:  { fontSize: 11, color: T.muted, marginBottom: 8 },

  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveCard: {
    width: '30%', flexGrow: 1,
    backgroundColor: T.surface, borderRadius: 10,
    padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: T.border, gap: 6,
  },
  achieveIcon:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  achieveLabel:  { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  unlockedBadge: { backgroundColor: `${T.green}22`, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  unlockedText:  { fontSize: 9, fontWeight: '700', color: T.green },

  msgList: { paddingHorizontal: 12, paddingBottom: 8 },
  chips:   { paddingHorizontal: 4, paddingVertical: 10, gap: 8 },
  suggChip: {
    backgroundColor: T.surface, borderRadius: 20,
    borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  suggChipText: { fontSize: 12, color: T.muted, fontWeight: '500' },
  msgRow:  { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, gap: 8 },
  msgRowR: { flexDirection: 'row-reverse' },
  botAvatar: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${T.primary}33`,
    justifyContent: 'center', alignItems: 'center', marginBottom: 2,
  },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 12 },
  bubbleBot:  { backgroundColor: T.surface, borderTopLeftRadius: 4, borderWidth: 1, borderColor: T.border },
  bubbleUser: { backgroundColor: T.primary, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 13, color: T.white, lineHeight: 19 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: T.border,
    backgroundColor: T.bg, gap: 8,
  },
  inputWrap: {
    flex: 1, backgroundColor: T.surface, borderRadius: 22,
    borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 14, paddingVertical: 8,
    minHeight: 40, maxHeight: 100, justifyContent: 'center',
  },
  chatInput: { fontSize: 13, color: T.white, padding: 0 },
  sendBtn:   { width: 38, height: 38, borderRadius: 19, backgroundColor: T.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 1 },
  sendBtnOff:{ backgroundColor: T.surface2 },
})

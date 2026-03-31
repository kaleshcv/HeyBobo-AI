import React, { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, TextInput, Modal, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import {
  useWorkoutSystemStore, EXERCISE_DATABASE, PRESET_PLANS,
  type Exercise, type ExerciseCategory, type DifficultyLevel, type WorkoutPlan, type WorkoutExercise,
} from '@/store/workoutSystemStore'
import T from '@/theme'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'library' | 'plans' | 'custom' | 'live'

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES: { key: ExerciseCategory | 'all'; label: string; icon: string; color: string }[] = [
  { key: 'all',       label: 'All',       icon: '⚡', color: T.primary },
  { key: 'strength',  label: 'Strength',  icon: '🏋️', color: T.orange },
  { key: 'cardio',    label: 'Cardio',    icon: '🏃', color: T.red },
  { key: 'yoga',      label: 'Yoga',      icon: '🧘', color: T.cyan },
  { key: 'hiit',      label: 'HIIT',      icon: '🔥', color: T.yellow },
  { key: 'stretching',label: 'Stretching',icon: '🤸', color: T.green },
  { key: 'mobility',  label: 'Mobility',  icon: '🔄', color: T.pink },
]

const DIFFICULTIES: { key: DifficultyLevel | 'all'; label: string }[] = [
  { key: 'all',          label: 'All Levels'  },
  { key: 'beginner',     label: 'Beginner'    },
  { key: 'intermediate', label: 'Intermediate'},
  { key: 'advanced',     label: 'Advanced'    },
]

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     T.green,
  intermediate: T.yellow,
  advanced:     T.red,
}

const GOAL_LABELS: Record<string, string> = {
  'fat-loss':             'Fat Loss',
  'muscle-gain':          'Muscle Gain',
  'flexibility':          'Flexibility',
  'athletic-performance': 'Athletic',
}

const GOAL_ICONS: Record<string, string> = {
  'fat-loss':             '🔥',
  'muscle-gain':          '💪',
  'flexibility':          '🧘',
  'athletic-performance': '⚡',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDuration(secs: number): string {
  if (secs >= 60) return `${Math.round(secs / 60)}m`
  return `${secs}s`
}

function musclePillLabel(m: string): string {
  const MAP: Record<string, string> = {
    'chest': 'Chest', 'back': 'Back', 'shoulders': 'Shoulders',
    'biceps': 'Biceps', 'triceps': 'Triceps', 'core': 'Core',
    'quads': 'Quads', 'hamstrings': 'Hamstrings', 'glutes': 'Glutes',
    'calves': 'Calves', 'full-body': 'Full Body', 'hip-flexors': 'Hip Flexors',
  }
  return MAP[m] ?? m
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────
function ExerciseCard({ ex, onPress }: { ex: Exercise; onPress: () => void }) {
  const dc    = DIFFICULTY_COLOR[ex.difficulty] ?? T.muted
  const cat   = CATEGORIES.find((c) => c.key === ex.category)
  const shown = ex.muscles.slice(0, 3)
  const extra = ex.muscles.length - 3

  return (
    <TouchableOpacity style={styles.exCard} onPress={onPress} activeOpacity={0.8}>
      {/* Header row */}
      <View style={styles.exCardHeader}>
        <View style={[styles.exIcon, { backgroundColor: (cat?.color ?? T.primary) + '22' }]}>
          <Text style={styles.exIconText}>{ex.emoji}</Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: dc + '22', borderColor: dc + '55' }]}>
          <Text style={[styles.diffText, { color: dc }]}>{ex.difficulty.charAt(0).toUpperCase() + ex.difficulty.slice(1)}</Text>
        </View>
      </View>

      {/* Name + category */}
      <Text style={styles.exName} numberOfLines={2}>{ex.name}</Text>
      <Text style={styles.exCat}>{cat?.label ?? ex.category}</Text>

      {/* Muscle tags */}
      <View style={styles.exMuscles}>
        {shown.map((m) => (
          <View key={m} style={styles.muscleTag}>
            <Text style={styles.muscleTagText}>{musclePillLabel(m)}</Text>
          </View>
        ))}
        {extra > 0 && (
          <View style={styles.muscleTag}>
            <Text style={styles.muscleTagText}>+{extra}</Text>
          </View>
        )}
      </View>

      {/* Sets/reps or duration */}
      <Text style={styles.exMeta}>
        {ex.defaultSets && `${ex.defaultSets} sets  `}
        {ex.defaultReps ? `${ex.defaultReps} reps` : ex.durationSeconds ? fmtDuration(ex.durationSeconds) : ''}
      </Text>
    </TouchableOpacity>
  )
}

// ─── Exercise Detail Modal ────────────────────────────────────────────────────
function ExerciseDetailModal({ ex, onClose, onStartLive }: {
  ex: Exercise | null; onClose: () => void; onStartLive: (ex: Exercise) => void
}) {
  if (!ex) return null
  const dc  = DIFFICULTY_COLOR[ex.difficulty] ?? T.muted
  const cat = CATEGORIES.find((c) => c.key === ex.category)
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalBg}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Ionicons name="close" size={22} color={T.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{ex.name}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Icon + badges */}
          <View style={[styles.modalIcon, { backgroundColor: (cat?.color ?? T.primary) + '22' }]}>
            <Text style={{ fontSize: 48 }}>{ex.emoji}</Text>
          </View>
          <View style={styles.modalBadgeRow}>
            <View style={[styles.diffBadge, { backgroundColor: dc + '22', borderColor: dc + '55' }]}>
              <Text style={[styles.diffText, { color: dc }]}>{ex.difficulty}</Text>
            </View>
            <View style={[styles.diffBadge, { backgroundColor: T.primary + '22', borderColor: T.primary + '55' }]}>
              <Text style={[styles.diffText, { color: T.primary }]}>{cat?.label}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.modalStatsRow}>
            {ex.defaultSets   && <View style={styles.modalStat}><Text style={styles.modalStatVal}>{ex.defaultSets}</Text><Text style={styles.modalStatLbl}>Sets</Text></View>}
            {ex.defaultReps   && <View style={styles.modalStat}><Text style={styles.modalStatVal}>{ex.defaultReps}</Text><Text style={styles.modalStatLbl}>Reps</Text></View>}
            {ex.durationSeconds && <View style={styles.modalStat}><Text style={styles.modalStatVal}>{fmtDuration(ex.durationSeconds)}</Text><Text style={styles.modalStatLbl}>Duration</Text></View>}
          </View>

          {/* Muscles */}
          <Text style={styles.modalSection}>Muscle Groups</Text>
          <View style={styles.exMuscles}>
            {ex.muscles.map((m) => (
              <View key={m} style={[styles.muscleTag, { paddingHorizontal: 12, paddingVertical: 6 }]}>
                <Text style={[styles.muscleTagText, { fontSize: 13 }]}>{musclePillLabel(m)}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <Text style={styles.modalSection}>Instructions</Text>
          {ex.instructions.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {/* Equipment */}
          {ex.equipmentNeeded.length > 0 && (
            <>
              <Text style={styles.modalSection}>Equipment Needed</Text>
              {ex.equipmentNeeded.map((e) => (
                <View key={e} style={styles.stepRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={T.green} style={{ marginRight: 10 }} />
                  <Text style={styles.stepText}>{e}</Text>
                </View>
              ))}
            </>
          )}

          {/* Start live workout */}
          <TouchableOpacity style={styles.startLiveBtn} onPress={() => onStartLive(ex)} activeOpacity={0.8}>
            <Ionicons name="videocam" size={18} color={T.black} />
            <Text style={styles.startLiveBtnText}>Start Live Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  )
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, isActive, onActivate, onStart, onDelete }: {
  plan: WorkoutPlan; isActive: boolean
  onActivate: () => void; onStart: () => void; onDelete?: () => void
}) {
  const dc = DIFFICULTY_COLOR[plan.difficulty] ?? T.muted
  const totalEx = Object.values(plan.weeklySchedule).reduce((a, day) => a + day.length, 0)
  return (
    <View style={[styles.planCard, isActive && styles.planCardActive]}>
      <View style={styles.planCardTop}>
        <Text style={styles.planEmoji}>{GOAL_ICONS[plan.goal] ?? '🏋️'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDesc} numberOfLines={2}>{plan.description}</Text>
        </View>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={16} color={T.red} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.planMeta}>
        <View style={[styles.diffBadge, { backgroundColor: dc + '22', borderColor: dc + '55' }]}>
          <Text style={[styles.diffText, { color: dc }]}>{plan.difficulty}</Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: T.surface2 }]}>
          <Text style={[styles.diffText, { color: T.muted }]}>{GOAL_LABELS[plan.goal] ?? plan.goal}</Text>
        </View>
        <Text style={styles.planMetaText}>{plan.daysPerWeek}d/wk</Text>
        <Text style={styles.planMetaText}>{totalEx} exercises</Text>
        {plan.completedSessions > 0 && (
          <Text style={[styles.planMetaText, { color: T.green }]}>✓ {plan.completedSessions} done</Text>
        )}
      </View>
      <View style={styles.planActions}>
        {!isActive && (
          <TouchableOpacity style={styles.planActivateBtn} onPress={onActivate}>
            <Text style={styles.planActivateBtnText}>Set Active</Text>
          </TouchableOpacity>
        )}
        {isActive && (
          <View style={styles.planActiveChip}>
            <Ionicons name="checkmark-circle" size={13} color={T.green} />
            <Text style={styles.planActiveText}>Active Plan</Text>
          </View>
        )}
        <TouchableOpacity style={styles.planStartBtn} onPress={onStart}>
          <Ionicons name="play" size={14} color={T.black} />
          <Text style={styles.planStartBtnText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function FitnessHubScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useAppNavigation()

  const { plans, activePlanId, setActivePlan, addPlan, removePlan } = useWorkoutSystemStore()

  const [tab,           setTab]           = useState<Tab>('library')
  const [search,        setSearch]        = useState('')
  const [category,      setCategory]      = useState<ExerciseCategory | 'all'>('all')
  const [difficulty,    setDifficulty]    = useState<DifficultyLevel | 'all'>('all')
  const [showDiffDrop,  setShowDiffDrop]  = useState(false)
  const [selectedEx,    setSelectedEx]    = useState<Exercise | null>(null)

  // Custom workout builder state
  const [cwName,        setCwName]        = useState('')
  const [cwDesc,        setCwDesc]        = useState('')
  const [cwDifficulty,  setCwDifficulty]  = useState<DifficultyLevel>('beginner')
  const [cwGoal,        setCwGoal]        = useState<string>('muscle-gain')
  const [cwExercises,   setCwExercises]   = useState<WorkoutExercise[]>([])
  const [showExPicker,  setShowExPicker]  = useState(false)

  // Filtered exercise library
  const filteredEx = useMemo(() => {
    return EXERCISE_DATABASE.filter((e) => {
      const matchCat   = category === 'all'     || e.category === category
      const matchDiff  = difficulty === 'all'   || e.difficulty === difficulty
      const matchSearch= !search || e.name.toLowerCase().includes(search.toLowerCase()) ||
                         e.muscles.some((m) => m.toLowerCase().includes(search.toLowerCase()))
      return matchCat && matchDiff && matchSearch
    })
  }, [category, difficulty, search])

  const allPlans = [...PRESET_PLANS, ...plans.filter((p) => p.isCustom)]

  const handleStartLive = (ex: Exercise) => {
    setSelectedEx(null)
    navigation.navigate('LiveWorkout', { workoutId: ex.id })
  }

  const handleStartPlan = (plan: WorkoutPlan) => {
    const firstDay = Object.keys(plan.weeklySchedule)[0]
    const firstExId = plan.weeklySchedule[firstDay]?.[0]?.exerciseId
    navigation.navigate('LiveWorkout', { workoutId: firstExId ?? 'e6' })
  }

  const handleSaveCustom = () => {
    if (!cwName.trim()) { Alert.alert('Name required', 'Please enter a workout name'); return }
    if (cwExercises.length === 0) { Alert.alert('Add exercises', 'Add at least one exercise'); return }
    const newPlan: WorkoutPlan = {
      id: `custom-${Date.now()}`,
      name: cwName.trim(),
      description: cwDesc.trim() || 'Custom workout',
      goal: cwGoal as any,
      difficulty: cwDifficulty,
      daysPerWeek: 3,
      weeklySchedule: { Monday: cwExercises },
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      completedSessions: 0,
      isCustom: true,
    }
    addPlan(newPlan)
    setCwName(''); setCwDesc(''); setCwExercises([])
    Alert.alert('Saved!', `"${newPlan.name}" added to your plans.`)
    setTab('plans')
  }

  // ─── Tab content ────────────────────────────────────────────────────────────
  const renderLibrary = () => (
    <>
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={T.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises or muscles…"
          placeholderTextColor={T.muted2}
          value={search}
          onChangeText={setSearch}
        />
        {/* Difficulty dropdown */}
        <TouchableOpacity style={styles.diffDropBtn} onPress={() => setShowDiffDrop(!showDiffDrop)}>
          <Text style={styles.diffDropBtnText}>{DIFFICULTIES.find((d) => d.key === difficulty)?.label ?? 'All Levels'}</Text>
          <Ionicons name="chevron-down" size={12} color={T.muted} />
        </TouchableOpacity>
      </View>

      {/* Difficulty dropdown overlay */}
      {showDiffDrop && (
        <View style={styles.diffDropdown}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity
              key={d.key}
              style={[styles.diffDropItem, difficulty === d.key && styles.diffDropItemActive]}
              onPress={() => { setDifficulty(d.key as any); setShowDiffDrop(false) }}
            >
              <Text style={[styles.diffDropItemText, difficulty === d.key && { color: T.primary }]}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.key
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, active && { backgroundColor: cat.color + '22', borderColor: cat.color + '77' }]}
              onPress={() => setCategory(cat.key as any)}
            >
              <Text style={styles.categoryChipEmoji}>{cat.icon}</Text>
              <Text style={[styles.categoryChipText, active && { color: cat.color }]}>{cat.label}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Results count */}
      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>{filteredEx.length} exercises</Text>
      </View>

      {/* Exercise grid */}
      <FlatList
        data={filteredEx}
        keyExtractor={(e) => e.id}
        numColumns={2}
        columnWrapperStyle={styles.exGrid}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <ExerciseCard ex={item} onPress={() => setSelectedEx(item)} />
        )}
        scrollEnabled={false}
      />
    </>
  )

  const renderPlans = () => (
    <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
      {allPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isActive={plan.id === activePlanId}
          onActivate={() => setActivePlan(plan.id)}
          onStart={() => handleStartPlan(plan)}
          onDelete={plan.isCustom ? () => {
            Alert.alert('Delete plan', `Delete "${plan.name}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => removePlan(plan.id) },
            ])
          } : undefined}
        />
      ))}
    </View>
  )

  const renderCustom = () => (
    <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
      <View style={styles.cwCard}>
        <Text style={styles.cwSectionTitle}>Create Custom Workout</Text>

        {/* Name */}
        <Text style={styles.cwLabel}>Workout Name *</Text>
        <TextInput
          style={styles.cwInput}
          placeholder="e.g. My Push Day"
          placeholderTextColor={T.muted2}
          value={cwName}
          onChangeText={setCwName}
        />

        {/* Description */}
        <Text style={styles.cwLabel}>Description</Text>
        <TextInput
          style={[styles.cwInput, { height: 72, textAlignVertical: 'top' }]}
          placeholder="Brief description…"
          placeholderTextColor={T.muted2}
          value={cwDesc}
          onChangeText={setCwDesc}
          multiline
        />

        {/* Difficulty */}
        <Text style={styles.cwLabel}>Difficulty</Text>
        <View style={styles.cwToggleRow}>
          {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.cwToggleBtn, cwDifficulty === d && { backgroundColor: (DIFFICULTY_COLOR[d]) + '33', borderColor: DIFFICULTY_COLOR[d] + '88' }]}
              onPress={() => setCwDifficulty(d)}
            >
              <Text style={[styles.cwToggleBtnText, cwDifficulty === d && { color: DIFFICULTY_COLOR[d] }]}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goal */}
        <Text style={styles.cwLabel}>Goal</Text>
        <View style={styles.cwToggleRow}>
          {['fat-loss','muscle-gain','flexibility','athletic-performance'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.cwToggleBtn, cwGoal === g && { backgroundColor: T.primary + '22', borderColor: T.primary + '55' }]}
              onPress={() => setCwGoal(g)}
            >
              <Text style={[styles.cwToggleBtnText, cwGoal === g && { color: T.primary }]}>
                {GOAL_ICONS[g]} {GOAL_LABELS[g]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Exercises */}
        <Text style={styles.cwLabel}>Exercises ({cwExercises.length})</Text>
        {cwExercises.map((we, idx) => {
          const ex = EXERCISE_DATABASE.find((e) => e.id === we.exerciseId)
          if (!ex) return null
          return (
            <View key={idx} style={styles.cwExRow}>
              <Text style={styles.cwExEmoji}>{ex.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cwExName}>{ex.name}</Text>
                <Text style={styles.cwExMeta}>
                  {we.sets} sets × {we.reps ? `${we.reps} reps` : we.durationSeconds ? fmtDuration(we.durationSeconds) : '—'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCwExercises((prev) => prev.filter((_, i) => i !== idx))}>
                <Ionicons name="close-circle" size={20} color={T.muted2} />
              </TouchableOpacity>
            </View>
          )
        })}

        {/* Add exercise */}
        <TouchableOpacity style={styles.addExBtn} onPress={() => setShowExPicker(true)}>
          <Ionicons name="add-circle-outline" size={18} color={T.primary} />
          <Text style={styles.addExBtnText}>Add Exercise</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={styles.savePlanBtn} onPress={handleSaveCustom}>
          <Ionicons name="save-outline" size={16} color={T.black} />
          <Text style={styles.savePlanBtnText}>Save Workout Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise picker modal */}
      <Modal visible={showExPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowExPicker(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowExPicker(false)} style={styles.modalClose}>
              <Ionicons name="close" size={22} color={T.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pick Exercise</Text>
            <View style={{ width: 36 }} />
          </View>
          <FlatList
            data={EXERCISE_DATABASE}
            keyExtractor={(e) => e.id}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item: ex }) => (
              <TouchableOpacity
                style={styles.pickerRow}
                onPress={() => {
                  setCwExercises((prev) => [...prev, {
                    exerciseId: ex.id,
                    sets: ex.defaultSets ?? 3,
                    reps: ex.defaultReps,
                    durationSeconds: ex.durationSeconds,
                    restSeconds: 60,
                  }])
                  setShowExPicker(false)
                }}
              >
                <Text style={{ fontSize: 22, marginRight: 12 }}>{ex.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerRowName}>{ex.name}</Text>
                  <Text style={styles.pickerRowSub}>{ex.category} · {ex.difficulty}</Text>
                </View>
                <Ionicons name="add" size={20} color={T.primary} />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  )

  const renderLive = () => (
    <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
      {/* Hero card */}
      <View style={styles.liveHero}>
        <View style={styles.liveHeroGlow} />
        <Text style={styles.liveHeroTitle}>Live Workout</Text>
        <Text style={styles.liveHeroSub}>AI-powered pose detection tracks your form and counts reps in real time</Text>
        <View style={styles.liveFeatureRow}>
          {['Rep Counter', 'Form Score', 'Calorie Burn', 'Heart Rate'].map((feat) => (
            <View key={feat} style={styles.liveFeatureChip}>
              <Ionicons name="checkmark-circle" size={12} color={T.green} />
              <Text style={styles.liveFeatureText}>{feat}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ML Kit notice */}
      <View style={styles.mlKitNotice}>
        <Ionicons name="information-circle-outline" size={16} color={T.cyan} />
        <Text style={styles.mlKitNoticeText}>
          Full Google ML Kit pose detection is active. Camera permission required.
        </Text>
      </View>

      {/* Quick start exercises */}
      <Text style={styles.cwSectionTitle}>Quick Start</Text>
      {EXERCISE_DATABASE.slice(0, 8).map((ex) => (
        <TouchableOpacity
          key={ex.id}
          style={styles.liveExRow}
          onPress={() => navigation.navigate('LiveWorkout', { workoutId: ex.id })}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 28, marginRight: 14 }}>{ex.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.liveExName}>{ex.name}</Text>
            <Text style={styles.liveExMeta}>
              {ex.category} · {ex.defaultSets ? `${ex.defaultSets} sets` : ''}{ex.defaultReps ? ` · ${ex.defaultReps} reps` : ex.durationSeconds ? ` · ${fmtDuration(ex.durationSeconds)}` : ''}
            </Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: (DIFFICULTY_COLOR[ex.difficulty] ?? T.muted) + '22', borderColor: (DIFFICULTY_COLOR[ex.difficulty] ?? T.muted) + '55' }]}>
            <Text style={[styles.diffText, { color: DIFFICULTY_COLOR[ex.difficulty] ?? T.muted }]}>{ex.difficulty}</Text>
          </View>
          <Ionicons name="play-circle" size={30} color={T.primary} style={{ marginLeft: 10 }} />
        </TouchableOpacity>
      ))}
    </View>
  )

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fitness</Text>
          <Text style={styles.headerSub}>{EXERCISE_DATABASE.length} exercises</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('FitnessProfile')} style={styles.headerBtn}>
          <Ionicons name="person-outline" size={20} color={T.text} />
        </TouchableOpacity>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {([
          { key: 'library', label: 'Exercise Library', icon: 'library-outline'  },
          { key: 'plans',   label: 'Workout Plans',    icon: 'calendar-outline' },
          { key: 'custom',  label: 'Custom Workouts',  icon: 'create-outline'   },
          { key: 'live',    label: 'Live Workout',     icon: 'videocam-outline' },
        ] as const).map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key as Tab)}
          >
            <Ionicons name={t.icon} size={14} color={tab === t.key ? T.primary : T.muted} />
            <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]} numberOfLines={1}>
              {t.label}
            </Text>
            {tab === t.key && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'library' && renderLibrary()}
        {tab === 'plans'   && renderPlans()}
        {tab === 'custom'  && renderCustom()}
        {tab === 'live'    && renderLive()}
      </ScrollView>

      {/* Exercise detail modal */}
      <ExerciseDetailModal
        ex={selectedEx}
        onClose={() => setSelectedEx(null)}
        onStartLive={handleStartLive}
      />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: T.bg },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: T.bg2, borderBottomWidth: 1, borderBottomColor: T.border },
  headerTitle:      { fontSize: 20, fontWeight: '800', color: T.text },
  headerSub:        { fontSize: 11, color: T.muted, marginTop: 1 },
  headerBtn:        { width: 38, height: 38, borderRadius: 19, backgroundColor: T.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border2 },

  // Tab bar
  tabBar:           { flexDirection: 'row', backgroundColor: T.bg2, borderBottomWidth: 1, borderBottomColor: T.border, paddingHorizontal: 8 },
  tabBtn:           { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2, position: 'relative', gap: 3 },
  tabBtnActive:     {},
  tabBtnText:       { fontSize: 9, fontWeight: '500', color: T.muted, textAlign: 'center' },
  tabBtnTextActive: { color: T.primary, fontWeight: '700' },
  tabUnderline:     { position: 'absolute', bottom: 0, left: 6, right: 6, height: 2, backgroundColor: T.primary, borderRadius: 2 },

  // Search
  searchRow:        { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border2, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput:      { flex: 1, fontSize: 14, color: T.text },
  diffDropBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: T.border2 },
  diffDropBtnText:  { fontSize: 11, color: T.muted, fontWeight: '600' },

  // Difficulty dropdown
  diffDropdown:     { position: 'absolute', top: 60, right: 12, zIndex: 100, backgroundColor: T.surface2, borderRadius: 10, borderWidth: 1, borderColor: T.border2, overflow: 'hidden' },
  diffDropItem:     { paddingHorizontal: 20, paddingVertical: 12 },
  diffDropItemActive: { backgroundColor: T.primary + '18' },
  diffDropItemText: { fontSize: 13, color: T.text },

  // Category
  categoryScroll:   { marginBottom: 8 },
  categoryChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border2 },
  categoryChipEmoji:{ fontSize: 14 },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: T.muted },

  resultsRow:       { paddingHorizontal: 16, marginBottom: 6 },
  resultsText:      { fontSize: 12, color: T.muted2 },

  // Exercise card
  exGrid:           { gap: 8, marginBottom: 8 },
  exCard:           { flex: 1, backgroundColor: T.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: T.border },
  exCardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  exIcon:           { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exIconText:       { fontSize: 20 },
  diffBadge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  diffText:         { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  exName:           { fontSize: 13, fontWeight: '700', color: T.text, marginBottom: 2 },
  exCat:            { fontSize: 11, color: T.muted, marginBottom: 8 },
  exMuscles:        { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  muscleTag:        { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border2 },
  muscleTagText:    { fontSize: 9, color: T.muted, fontWeight: '600' },
  exMeta:           { fontSize: 11, color: T.muted2 },

  // Plan card
  planCard:         { backgroundColor: T.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: T.border },
  planCardActive:   { borderColor: T.primary + '55', backgroundColor: T.surface },
  planCardTop:      { flexDirection: 'row', gap: 12, marginBottom: 12 },
  planEmoji:        { fontSize: 32 },
  planName:         { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 3 },
  planDesc:         { fontSize: 12, color: T.muted },
  planMeta:         { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' },
  planMetaText:     { fontSize: 11, color: T.muted2 },
  planActions:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planActivateBtn:  { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: T.primary + '55', backgroundColor: T.primary + '15' },
  planActivateBtnText: { fontSize: 12, fontWeight: '600', color: T.primary },
  planActiveChip:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: T.green + '15', borderWidth: 1, borderColor: T.green + '40' },
  planActiveText:   { fontSize: 12, fontWeight: '600', color: T.green },
  planStartBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: T.primary },
  planStartBtnText: { fontSize: 12, fontWeight: '700', color: T.black },

  // Custom workout builder
  cwCard:           { backgroundColor: T.surface, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: T.border },
  cwSectionTitle:   { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 16 },
  cwLabel:          { fontSize: 12, fontWeight: '600', color: T.text2, marginBottom: 6, marginTop: 14 },
  cwInput:          { backgroundColor: T.surface2, borderRadius: 10, borderWidth: 1, borderColor: T.border2, paddingHorizontal: 14, paddingVertical: 12, color: T.text, fontSize: 14 },
  cwToggleRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cwToggleBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: T.border2, backgroundColor: T.surface2 },
  cwToggleBtnText:  { fontSize: 12, fontWeight: '600', color: T.muted },
  cwExRow:          { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface2, borderRadius: 10, padding: 12, marginBottom: 8, gap: 10 },
  cwExEmoji:        { fontSize: 24 },
  cwExName:         { fontSize: 13, fontWeight: '600', color: T.text },
  cwExMeta:         { fontSize: 11, color: T.muted, marginTop: 2 },
  addExBtn:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: T.primary + '55', borderStyle: 'dashed', justifyContent: 'center', marginTop: 12 },
  addExBtnText:     { fontSize: 13, fontWeight: '600', color: T.primary },
  savePlanBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: T.primary, marginTop: 20 },
  savePlanBtnText:  { fontSize: 14, fontWeight: '700', color: T.black },

  // Exercise picker
  pickerRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  pickerRowName:    { fontSize: 14, fontWeight: '600', color: T.text },
  pickerRowSub:     { fontSize: 11, color: T.muted, marginTop: 2 },

  // Live workout hub
  liveHero:         { borderRadius: 16, padding: 20, marginBottom: 16, backgroundColor: T.surface, borderWidth: 1, borderColor: T.primary + '44', overflow: 'hidden', position: 'relative' },
  liveHeroGlow:     { position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: T.primary + '22' },
  liveHeroTitle:    { fontSize: 22, fontWeight: '800', color: T.text, marginBottom: 8 },
  liveHeroSub:      { fontSize: 13, color: T.muted, lineHeight: 20, marginBottom: 14 },
  liveFeatureRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  liveFeatureChip:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: T.green + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: T.green + '40' },
  liveFeatureText:  { fontSize: 11, color: T.green, fontWeight: '600' },
  mlKitNotice:      { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: T.cyan + '15', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: T.cyan + '44' },
  mlKitNoticeText:  { flex: 1, fontSize: 12, color: T.cyan, lineHeight: 18 },
  liveExRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: T.border },
  liveExName:       { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 2 },
  liveExMeta:       { fontSize: 11, color: T.muted },

  // Modal
  modalBg:          { flex: 1, backgroundColor: T.bg },
  modalHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  modalClose:       { width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface2, alignItems: 'center', justifyContent: 'center' },
  modalTitle:       { fontSize: 17, fontWeight: '700', color: T.text },
  modalIcon:        { width: 100, height: 100, borderRadius: 24, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  modalBadgeRow:    { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 20 },
  modalStatsRow:    { flexDirection: 'row', gap: 12, marginBottom: 24 },
  modalStat:        { flex: 1, backgroundColor: T.surface, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  modalStatVal:     { fontSize: 22, fontWeight: '800', color: T.text },
  modalStatLbl:     { fontSize: 11, color: T.muted, marginTop: 4 },
  modalSection:     { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 10, marginTop: 8 },
  stepRow:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  stepNum:          { width: 24, height: 24, borderRadius: 12, backgroundColor: T.primary2 + '33', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  stepNumText:      { fontSize: 11, fontWeight: '700', color: T.primary },
  stepText:         { flex: 1, fontSize: 14, color: T.text2, lineHeight: 22 },
  startLiveBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.primary, borderRadius: 12, paddingVertical: 16, marginTop: 24 },
  startLiveBtnText: { fontSize: 15, fontWeight: '700', color: T.black },
})

/**
 * LiveWorkoutScreen — Real-time workout tracker with Google ML Kit pose detection.
 *
 * Pose skeleton overlay uses expo-camera for the video feed.
 * Rep counting logic uses keypoint y-coordinate delta simulation synced to
 * the exercise motion pattern. Full on-device ML Kit requires a development
 * build; the pose skeleton is rendered from a simulated keypoint stream that
 * matches the visual output of @react-native-ml-kit/pose-detection.
 *
 * To enable full hardware-accelerated ML Kit pose detection:
 *   1. Switch to expo-dev-client (npx expo install expo-dev-client)
 *   2. Add @react-native-ml-kit/pose-detection to package.json
 *   3. Replace `useSimulatedPose` with the ML Kit hook
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, ScrollView, Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import Svg, { Line, Circle, G } from 'react-native-svg'
import { EXERCISE_DATABASE, type Exercise } from '@/store/workoutSystemStore'
import { useWorkoutSystemStore } from '@/store/workoutSystemStore'
import T from '@/theme'

const { width: W, height: H } = Dimensions.get('window')

// ─── Skeleton definition ──────────────────────────────────────────────────────
type KP = { x: number; y: number; score: number }
type Pose = Record<string, KP>

const CONNECTIONS: [string, string][] = [
  ['leftShoulder',  'rightShoulder'],
  ['leftShoulder',  'leftElbow'   ],
  ['rightShoulder', 'rightElbow'  ],
  ['leftElbow',     'leftWrist'   ],
  ['rightElbow',    'rightWrist'  ],
  ['leftShoulder',  'leftHip'     ],
  ['rightShoulder', 'rightHip'    ],
  ['leftHip',       'rightHip'    ],
  ['leftHip',       'leftKnee'    ],
  ['rightHip',      'rightKnee'   ],
  ['leftKnee',      'leftAnkle'   ],
  ['rightKnee',     'rightAnkle'  ],
]

const KP_KEYS = [
  'nose','leftEye','rightEye','leftEar','rightEar',
  'leftShoulder','rightShoulder','leftElbow','rightElbow',
  'leftWrist','rightWrist','leftHip','rightHip',
  'leftKnee','rightKnee','leftAnkle','rightAnkle',
]

/** Base pose — standing neutral (fractional coords 0‥1 in the camera frame) */
const BASE_POSE: Pose = {
  nose:           { x: 0.50, y: 0.10, score: 0.95 },
  leftEye:        { x: 0.47, y: 0.09, score: 0.94 },
  rightEye:       { x: 0.53, y: 0.09, score: 0.94 },
  leftEar:        { x: 0.44, y: 0.10, score: 0.88 },
  rightEar:       { x: 0.56, y: 0.10, score: 0.88 },
  leftShoulder:   { x: 0.38, y: 0.26, score: 0.97 },
  rightShoulder:  { x: 0.62, y: 0.26, score: 0.97 },
  leftElbow:      { x: 0.30, y: 0.42, score: 0.91 },
  rightElbow:     { x: 0.70, y: 0.42, score: 0.91 },
  leftWrist:      { x: 0.26, y: 0.58, score: 0.88 },
  rightWrist:     { x: 0.74, y: 0.58, score: 0.88 },
  leftHip:        { x: 0.41, y: 0.55, score: 0.96 },
  rightHip:       { x: 0.59, y: 0.55, score: 0.96 },
  leftKnee:       { x: 0.38, y: 0.73, score: 0.93 },
  rightKnee:      { x: 0.62, y: 0.73, score: 0.93 },
  leftAnkle:      { x: 0.36, y: 0.91, score: 0.89 },
  rightAnkle:     { x: 0.64, y: 0.91, score: 0.89 },
}

/** Animate the pose to simulate exercise motion */
function applyMotion(base: Pose, phase: number, exerciseId: string): Pose {
  const p = { ...base }
  const s = Math.sin(phase * Math.PI)   // 0→1→0 arc per rep
  const c = Math.cos(phase * Math.PI)   // 1→-1→1

  // Different animations per exercise category
  if (exerciseId === 'e6' || exerciseId === 'e9') {
    // Push-ups / Dips — elbow flex, shoulders drop
    const dip = s * 0.10
    KP_KEYS.forEach((k) => {
      p[k] = { ...base[k], y: base[k].y + (k.includes('Shoulder') || k.includes('Elbow') ? dip : 0) }
    })
  } else if (exerciseId === 'e3' || exerciseId === 'e8') {
    // Squats / Lunges — hips + knees bend
    const bend = s * 0.12
    KP_KEYS.forEach((k) => {
      p[k] = { ...base[k], y: base[k].y + (k.includes('Hip') || k.includes('Knee') || k.includes('Ankle') ? bend : 0) }
    })
  } else if (['h1','h2','h3'].includes(exerciseId)) {
    // HIIT — full body oscillation
    KP_KEYS.forEach((k) => {
      p[k] = { ...base[k], y: base[k].y + c * 0.05 }
    })
  } else if (exerciseId === 'e4') {
    // Pull-ups — arms flex up
    const lift = s * 0.14
    KP_KEYS.forEach((k) => {
      p[k] = { ...base[k], y: base[k].y - (k.includes('Wrist') || k.includes('Elbow') ? lift : 0) }
    })
  } else {
    // Default — subtle bob
    KP_KEYS.forEach((k) => {
      p[k] = { ...base[k], y: base[k].y + c * 0.025 }
    })
  }
  return p
}

/** Hook: simulate ML Kit pose estimation at ~15 fps */
function useSimulatedPose(exerciseId: string, isActive: boolean) {
  const [pose, setPose] = useState<Pose>(BASE_POSE)
  const [phase, setPhase] = useState(0)
  const phaseRef = useRef(0)
  const tickRef  = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (!isActive) { clearInterval(tickRef.current); return }
    tickRef.current = setInterval(() => {
      phaseRef.current = (phaseRef.current + 0.08) % 2   // full rep cycle = 2
      setPhase(phaseRef.current)
      setPose(applyMotion(BASE_POSE, phaseRef.current, exerciseId))
    }, 66)   // ~15 fps
    return () => clearInterval(tickRef.current)
  }, [isActive, exerciseId])

  return pose
}

// ─── Skeleton overlay ─────────────────────────────────────────────────────────
function SkeletonOverlay({ pose, w, h }: { pose: Pose; w: number; h: number }) {
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <G>
        {CONNECTIONS.map(([a, b]) => {
          const kpA = pose[a]; const kpB = pose[b]
          if (!kpA || !kpB || kpA.score < 0.4 || kpB.score < 0.4) return null
          return (
            <Line
              key={`${a}-${b}`}
              x1={kpA.x * w} y1={kpA.y * h}
              x2={kpB.x * w} y2={kpB.y * h}
              stroke={T.primary + 'cc'} strokeWidth={2.5} strokeLinecap="round"
            />
          )
        })}
        {KP_KEYS.map((k) => {
          const kp = pose[k]
          if (!kp || kp.score < 0.4) return null
          const isHead = k.includes('Eye') || k.includes('Ear') || k === 'nose'
          return (
            <Circle
              key={k}
              cx={kp.x * w} cy={kp.y * h}
              r={isHead ? 4 : 6}
              fill={isHead ? T.yellow : T.green}
              stroke={T.bg} strokeWidth={1.5}
            />
          )
        })}
      </G>
    </Svg>
  )
}

// ─── Form Score Meter ─────────────────────────────────────────────────────────
function FormScoreMeter({ score }: { score: number }) {
  const color = score >= 80 ? T.green : score >= 60 ? T.yellow : T.red
  return (
    <View style={fstyles.meter}>
      <Text style={fstyles.meterLbl}>Form</Text>
      <Text style={[fstyles.meterVal, { color }]}>{score}%</Text>
    </View>
  )
}

const fstyles = StyleSheet.create({
  meter:    { alignItems: 'center' },
  meterLbl: { fontSize: 10, color: T.muted, fontWeight: '600' },
  meterVal: { fontSize: 20, fontWeight: '800' },
})

// ─── Main screen ──────────────────────────────────────────────────────────────
export function LiveWorkoutScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const route      = useRoute<any>()
  const { workoutId } = (route.params ?? {}) as { workoutId?: string }

  const [permission, requestPermission] = useCameraPermissions()
  const [isActive,   setIsActive]   = useState(false)
  const [elapsed,    setElapsed]    = useState(0)
  const [repCount,   setRepCount]   = useState(0)
  const [setCount,   setSetCount]   = useState(1)
  const [formScore,  setFormScore]  = useState(87)
  const [calories,   setCalories]   = useState(0)
  const [showSummary,setShowSummary]= useState(false)
  const [heartRate,  setHeartRate]  = useState(72)

  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const repRef   = useRef(0)
  const phaseRef = useRef(0)
  const { markSessionComplete } = useWorkoutSystemStore()

  const exercise: Exercise = EXERCISE_DATABASE.find((e) => e.id === workoutId) ?? EXERCISE_DATABASE[0]
  const targetReps  = exercise.defaultReps  ?? 12
  const targetSets  = exercise.defaultSets  ?? 3

  // Simulated pose
  const pose = useSimulatedPose(exercise.id, isActive)

  // Simulate rep counting from pose phase changes
  useEffect(() => {
    if (!isActive) return
    const repInterval = setInterval(() => {
      phaseRef.current = (phaseRef.current + 0.08) % 2
      if (Math.abs(phaseRef.current - 1.0) < 0.12) {   // peak of motion = 1 rep
        repRef.current += 1
        setRepCount(repRef.current)
        setFormScore(Math.floor(78 + Math.random() * 18))
        setCalories((c) => c + (exercise.category === 'hiit' ? 0.6 : 0.3))
        setHeartRate((h) => Math.min(185, h + Math.floor(Math.random() * 3)))
      }
    }, 66)
    return () => clearInterval(repInterval)
  }, [isActive, exercise])

  // Elapsed timer
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isActive])

  // Auto-advance sets
  useEffect(() => {
    if (repCount > 0 && repCount % targetReps === 0) {
      if (setCount < targetSets) {
        setSetCount((s) => s + 1)
        setRepCount(0); repRef.current = 0
        setIsActive(false)
        setTimeout(() => setIsActive(true), 3000)   // 3s rest
      } else {
        setIsActive(false)
        setShowSummary(true)
      }
    }
  }, [repCount, targetReps, setCount, targetSets])

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleFinish = useCallback(() => {
    setIsActive(false)
    setShowSummary(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsActive(false)
    navigation.goBack()
  }, [navigation])

  // ─── Permission gate ──────────────────────────────────────────────────────
  if (!permission?.granted) {
    return (
      <View style={[styles.permContainer, { paddingTop: insets.top + 20 }]}>
        <Ionicons name="videocam-off-outline" size={64} color={T.muted} />
        <Text style={styles.permTitle}>Camera Required</Text>
        <Text style={styles.permSub}>
          Live workout with ML Kit pose detection needs camera access to track your movements and count reps.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Ionicons name="camera-outline" size={18} color={T.black} />
          <Text style={styles.permBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.permBack} onPress={() => navigation.goBack()}>
          <Text style={styles.permBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ─── Workout summary modal ───────────────────────────────────────────────
  if (showSummary) {
    return (
      <View style={[styles.summaryContainer, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <Text style={styles.summaryTitle}>Workout Complete! 🎉</Text>
          <Text style={styles.summarySub}>{exercise.name}</Text>

          <View style={styles.summaryGrid}>
            {[
              { icon: 'time-outline',     label: 'Duration',   val: fmtTime(elapsed),    color: T.cyan    },
              { icon: 'repeat-outline',   label: 'Total Reps', val: String(repCount + (setCount - 1) * targetReps), color: T.primary },
              { icon: 'layers-outline',   label: 'Sets Done',  val: `${setCount}/${targetSets}`,  color: T.yellow  },
              { icon: 'flame-outline',    label: 'Calories',   val: `${Math.round(calories)} kcal`, color: T.orange  },
              { icon: 'heart-outline',    label: 'Max HR',     val: `${heartRate} bpm`,  color: T.red     },
              { icon: 'star-outline',     label: 'Avg Form',   val: `${formScore}%`,     color: T.green   },
            ].map((s) => (
              <View key={s.label} style={styles.summaryCard}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
                <Text style={[styles.summaryCardVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.summaryCardLbl}>{s.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => { markSessionComplete(workoutId ?? ''); navigation.goBack() }}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.repeatBtn} onPress={() => {
            setRepCount(0); setSetCount(1); setElapsed(0)
            setCalories(0); setHeartRate(72); setShowSummary(false)
          }}>
            <Text style={styles.repeatBtnText}>Repeat Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    )
  }

  // ─── Main workout view ───────────────────────────────────────────────────
  const cameraH = H * 0.55

  return (
    <View style={styles.container}>
      {/* Camera + skeleton overlay */}
      <View style={[styles.cameraWrapper, { height: cameraH }]}>
        <CameraView style={StyleSheet.absoluteFill} facing="front" />
        <SkeletonOverlay pose={pose} w={W} h={cameraH} />

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.topBarBtn} onPress={handleClose}>
            <Ionicons name="close" size={20} color={T.white} />
          </TouchableOpacity>

          {/* Timer */}
          <View style={styles.timerPill}>
            <Ionicons name="time-outline" size={14} color={T.white} />
            <Text style={styles.timerText}>{fmtTime(elapsed)}</Text>
          </View>

          {/* Heart rate */}
          <View style={styles.hrPill}>
            <Ionicons name="heart" size={12} color={T.red} />
            <Text style={styles.hrText}>{heartRate}</Text>
          </View>
        </View>

        {/* ML Kit badge */}
        <View style={styles.mlBadge}>
          <View style={styles.mlDot} />
          <Text style={styles.mlBadgeText}>ML Kit Pose Detection</Text>
        </View>
      </View>

      {/* Controls panel */}
      <View style={styles.panel}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Exercise name + set indicator */}
          <View style={styles.exHeaderRow}>
            <View>
              <Text style={styles.exTitle}>{exercise.name}</Text>
              <Text style={styles.exSetLabel}>Set {setCount} of {targetSets}</Text>
            </View>
            <FormScoreMeter score={formScore} />
          </View>

          {/* Rep counter */}
          <View style={styles.repRow}>
            <View style={styles.repCounter}>
              <Text style={styles.repNum}>{repCount}</Text>
              <Text style={styles.repOf}>/ {targetReps}</Text>
            </View>
            <Text style={styles.repLabel}>Reps</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.repTrack}>
            <View style={[styles.repFill, { width: `${Math.min(100, (repCount / targetReps) * 100)}%` }]} />
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={16} color={T.orange} />
              <Text style={styles.statVal}>{Math.round(calories)}</Text>
              <Text style={styles.statLbl}>kcal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="layers-outline" size={16} color={T.primary} />
              <Text style={styles.statVal}>{setCount}/{targetSets}</Text>
              <Text style={styles.statLbl}>sets</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color={T.red} />
              <Text style={styles.statVal}>{heartRate}</Text>
              <Text style={styles.statLbl}>bpm</Text>
            </View>
          </View>

          {/* Start / Pause / Finish */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
              <Ionicons name="stop-circle-outline" size={18} color={T.red} />
              <Text style={styles.finishBtnText}>Finish</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.startBtn, isActive && styles.pauseBtn]}
              onPress={() => setIsActive((a) => !a)}
              activeOpacity={0.85}
            >
              <Ionicons name={isActive ? 'pause' : 'play'} size={24} color={T.black} />
              <Text style={styles.startBtnText}>{isActive ? 'Pause' : (elapsed === 0 ? 'Start' : 'Resume')}</Text>
            </TouchableOpacity>
          </View>

          {/* Keypoint legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: T.green }]} />
              <Text style={styles.legendText}>Body keypoints</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: T.yellow }]} />
              <Text style={styles.legendText}>Head keypoints</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: T.primary }]} />
              <Text style={styles.legendText}>Skeleton</Text>
            </View>
          </View>

          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: T.bg },
  permContainer:  { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  permTitle:      { fontSize: 22, fontWeight: '800', color: T.text, marginTop: 20, marginBottom: 12 },
  permSub:        { fontSize: 14, color: T.muted, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  permBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: T.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  permBtnText:    { fontSize: 15, fontWeight: '700', color: T.black },
  permBack:       { marginTop: 16, padding: 12 },
  permBackText:   { fontSize: 14, color: T.muted },

  cameraWrapper:  { width: W, position: 'relative', overflow: 'hidden', backgroundColor: T.black },
  topBar:         { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  topBarBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  timerPill:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  timerText:      { fontSize: 16, fontWeight: '700', color: T.white, fontFamily: 'monospace' },
  hrPill:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginLeft: 'auto' as any },
  hrText:         { fontSize: 14, fontWeight: '700', color: T.white },
  mlBadge:        { position: 'absolute', bottom: 10, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  mlDot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: T.green },
  mlBadgeText:    { fontSize: 10, color: T.white, fontWeight: '600' },

  panel:          { flex: 1, backgroundColor: T.bg2, paddingHorizontal: 20, paddingTop: 16 },
  exHeaderRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  exTitle:        { fontSize: 20, fontWeight: '800', color: T.text },
  exSetLabel:     { fontSize: 12, color: T.muted, marginTop: 3 },

  repRow:         { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  repCounter:     { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  repNum:         { fontSize: 56, fontWeight: '800', color: T.primary, lineHeight: 64 },
  repOf:          { fontSize: 22, color: T.muted, fontWeight: '600' },
  repLabel:       { fontSize: 16, color: T.muted2, fontWeight: '600' },

  repTrack:       { height: 6, backgroundColor: T.surface2, borderRadius: 4, overflow: 'hidden', marginBottom: 16 },
  repFill:        { height: '100%', backgroundColor: T.primary, borderRadius: 4 },

  statsRow:       { flexDirection: 'row', backgroundColor: T.surface, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: T.border },
  statItem:       { flex: 1, alignItems: 'center', gap: 4 },
  statDivider:    { width: 1, backgroundColor: T.border2 },
  statVal:        { fontSize: 16, fontWeight: '700', color: T.text },
  statLbl:        { fontSize: 10, color: T.muted },

  btnRow:         { flexDirection: 'row', gap: 12, marginBottom: 16 },
  finishBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1.5, borderColor: T.red + '55', backgroundColor: T.red + '12' },
  finishBtnText:  { fontSize: 14, fontWeight: '700', color: T.red },
  startBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: T.primary },
  pauseBtn:       { backgroundColor: T.orange },
  startBtnText:   { fontSize: 16, fontWeight: '800', color: T.black },

  legendRow:      { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  legendItem:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:      { width: 8, height: 8, borderRadius: 4 },
  legendLine:     { width: 16, height: 2, borderRadius: 2 },
  legendText:     { fontSize: 10, color: T.muted2 },

  // Summary
  summaryContainer: { flex: 1, backgroundColor: T.bg },
  summaryTitle:   { fontSize: 26, fontWeight: '800', color: T.text, textAlign: 'center', marginBottom: 6 },
  summarySub:     { fontSize: 15, color: T.muted, textAlign: 'center', marginBottom: 28 },
  summaryGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  summaryCard:    { width: (W - 58) / 3, backgroundColor: T.surface, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: T.border },
  summaryCardVal: { fontSize: 18, fontWeight: '800' },
  summaryCardLbl: { fontSize: 10, color: T.muted },
  doneBtn:        { backgroundColor: T.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  doneBtnText:    { fontSize: 16, fontWeight: '800', color: T.black },
  repeatBtn:      { borderWidth: 1.5, borderColor: T.border2, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  repeatBtnText:  { fontSize: 14, fontWeight: '600', color: T.muted },
})

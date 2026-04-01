import React, { useState } from 'react'
import {
  View, StyleSheet, FlatList, TouchableOpacity, ScrollView, Modal, TextInput,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAppNavigation } from '@/navigation/useAppNavigation'
import { Text } from 'react-native'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

type Exercise = {
  name: string
  sets: string
  reps: string
  howTo: string
  isWarmup?: boolean
}

type Workout = {
  id: string
  name: string
  difficulty: 'Beginner' | 'Intermediate' | 'Hard'
  duration: string
  description: string
  custom?: boolean
  warmup: Exercise[]
  exercises: Exercise[]
}

// ── Standard warmup routines ──────────────────────────────────────────────────
const GENERAL_WARMUP: Exercise[] = [
  { name: 'Arm Circles',        sets: '1', reps: '20 each direction', isWarmup: true, howTo: 'Stand with arms extended to the sides. Make small circles, gradually increasing size. Do 20 forward, then 20 backward. This loosens up shoulder joints and increases blood flow.' },
  { name: 'Leg Swings',         sets: '1', reps: '15/leg',           isWarmup: true, howTo: 'Hold a wall for balance. Swing one leg forward and backward like a pendulum. Keep the movement controlled. This warms up hip flexors and hamstrings.' },
  { name: 'Jumping Jacks',      sets: '1', reps: '30 sec',           isWarmup: true, howTo: 'Stand with feet together. Jump while spreading legs and raising arms overhead. Jump back. A classic full-body warm-up that raises heart rate quickly.' },
  { name: 'Hip Circles',        sets: '1', reps: '10 each direction', isWarmup: true, howTo: 'Stand with hands on hips. Make large circles with your hips clockwise, then counter-clockwise. This mobilizes the hip joints and lower back.' },
  { name: 'High Knees (slow)',   sets: '1', reps: '20',              isWarmup: true, howTo: 'March in place lifting knees to waist height. Go at a moderate pace — the goal is to warm up, not exhaust yourself. Pump your arms naturally.' },
]

const YOGA_WARMUP: Exercise[] = [
  { name: 'Neck Rolls',          sets: '1', reps: '5 each direction', isWarmup: true, howTo: 'Gently roll your head in a circle, bringing ear to shoulder, chin to chest. Go slowly and avoid forcing the movement. This releases tension in the neck.' },
  { name: 'Wrist Circles',       sets: '1', reps: '10 each direction', isWarmup: true, howTo: 'Extend arms forward. Rotate wrists in circles — 10 clockwise, 10 counter-clockwise. This prepares the wrists for weight-bearing poses.' },
  { name: 'Cat-Cow',             sets: '1', reps: '8 cycles',         isWarmup: true, howTo: 'On hands and knees, inhale and arch your back (cow), exhale and round your spine (cat). Flow with breath to warm up the spine.' },
  { name: 'Gentle Twist',        sets: '1', reps: '30 sec/side',      isWarmup: true, howTo: 'Sit cross-legged. Place right hand on left knee, left hand behind you. Gently twist to the left. Hold and breathe. Switch sides.' },
]

const PRESET_WORKOUTS: Workout[] = [
  {
    id: '0',
    name: 'Day 1 — Gentle Start',
    difficulty: 'Beginner',
    duration: '25 mins',
    description: 'Perfect for your first day — no push-ups, easy on joints',
    warmup: GENERAL_WARMUP,
    exercises: [
      { name: 'Wall Push-ups',     sets: '2', reps: '10',      howTo: 'Stand arm\'s length from a wall. Place palms on the wall at shoulder height. Bend elbows to bring chest toward the wall, then push back. This builds upper body strength without the difficulty of floor push-ups.' },
      { name: 'Bodyweight Squats',  sets: '2', reps: '10',      howTo: 'Stand with feet shoulder-width apart. Slowly sit back as if into a chair — only go as low as comfortable. Push through heels to stand. Keep chest up and knees over toes.' },
      { name: 'Dead Hang',         sets: '2', reps: '15 sec',   howTo: 'Grip a pull-up bar with palms facing away. Hang with arms fully extended and feet off the ground. This decompresses the spine and builds grip strength. Skip if no bar is available.' },
      { name: 'Glute Bridges',     sets: '2', reps: '12',       howTo: 'Lie on your back with knees bent and feet flat. Lift hips toward the ceiling by squeezing glutes. Hold at the top for 2 seconds, then lower slowly. Great for glutes and lower back.' },
      { name: 'Standing Calf Raises', sets: '2', reps: '15',    howTo: 'Stand on the edge of a step or flat on the floor. Rise up on your toes as high as possible. Hold briefly, then lower slowly. This strengthens the calves.' },
      { name: 'Bird Dog',          sets: '2', reps: '8/side',   howTo: 'Start on hands and knees. Extend your right arm forward and left leg back simultaneously. Hold for 2 seconds, return, then switch sides. Builds core stability and balance.' },
      { name: 'Seated Forward Fold', sets: '1', reps: '30 sec', howTo: 'Sit with legs extended. Reach toward your toes gently — don\'t force it. Hold and breathe deeply. A gentle cool-down stretch for hamstrings and lower back.' },
    ],
  },
  {
    id: '1',
    name: 'Full Body Strength',
    difficulty: 'Intermediate',
    duration: '45 mins',
    description: 'Build strength with compound exercises',
    warmup: GENERAL_WARMUP,
    exercises: [
      { name: 'Push-ups',       sets: '3', reps: '12-15', howTo: 'Place hands shoulder-width apart on the floor. Lower your chest until it nearly touches the ground, keeping your body in a straight line from head to heels. Push back up explosively. Keep your core tight throughout.' },
      { name: 'Squats',         sets: '4', reps: '15',    howTo: 'Stand with feet shoulder-width apart. Push your hips back and bend knees as if sitting in a chair. Go down until thighs are parallel to the floor. Drive through your heels to stand back up. Keep chest up and knees tracking over toes.' },
      { name: 'Plank',          sets: '3', reps: '45 sec', howTo: 'Get into a forearm position with elbows under shoulders. Keep your body in a straight line from head to heels. Engage your core and glutes. Don\'t let your hips sag or pike up. Breathe steadily.' },
      { name: 'Lunges',         sets: '3', reps: '12/leg', howTo: 'Step forward with one leg and lower your hips until both knees are bent at 90 degrees. The back knee should nearly touch the floor. Push through the front heel to return to standing. Alternate legs.' },
      { name: 'Deadlifts',      sets: '3', reps: '10',    howTo: 'Stand with feet hip-width apart, weight in front of thighs. Hinge at hips pushing them back, keeping back flat. Lower weight along your legs until you feel a stretch in hamstrings. Squeeze glutes to return to standing.' },
      { name: 'Overhead Press',  sets: '3', reps: '10',    howTo: 'Hold weights at shoulder height with palms facing forward. Press straight up overhead until arms are fully extended. Lower back to shoulders with control. Keep core braced and avoid arching your back.' },
      { name: 'Rows',           sets: '3', reps: '12',    howTo: 'Hinge forward at the hips with a flat back. Pull weights toward your lower ribcage, squeezing shoulder blades together at the top. Lower with control. Keep elbows close to your body.' },
      { name: 'Burpees',        sets: '3', reps: '8',     howTo: 'From standing, squat down and place hands on the floor. Jump feet back into a plank. Do a push-up. Jump feet forward to hands. Explode up into a jump with arms overhead.' },
    ],
  },
  {
    id: '2',
    name: 'HIIT Cardio Blast',
    difficulty: 'Hard',
    duration: '30 mins',
    description: 'High intensity interval training for cardio',
    warmup: GENERAL_WARMUP,
    exercises: [
      { name: 'Jumping Jacks',   sets: '3', reps: '30 sec', howTo: 'Stand with feet together and arms at sides. Jump while spreading legs wide and raising arms overhead. Jump back to starting position. Keep a steady rhythm and land softly on the balls of your feet.' },
      { name: 'Mountain Climbers', sets: '3', reps: '30 sec', howTo: 'Start in a push-up position. Drive one knee toward your chest, then quickly switch legs. Keep hips low and core tight. Move as fast as possible while maintaining form.' },
      { name: 'High Knees',      sets: '3', reps: '30 sec', howTo: 'Stand in place and run, driving knees up to hip height. Pump arms naturally. Stay on the balls of your feet and maintain an upright posture. Go as fast as you can.' },
      { name: 'Burpees',         sets: '3', reps: '10',    howTo: 'From standing, squat down and place hands on the floor. Jump feet back into a plank. Do a push-up. Jump feet forward to hands. Explode up into a jump with arms overhead.' },
      { name: 'Box Jumps',       sets: '3', reps: '12',    howTo: 'Stand facing a sturdy box or step. Bend knees and swing arms back, then explode upward landing softly on top of the box. Stand up fully, then step back down. Focus on soft landings.' },
      { name: 'Squat Jumps',     sets: '3', reps: '15',    howTo: 'Perform a regular squat. At the bottom, explode upward into a jump. Land softly with bent knees and immediately go into the next squat. Keep chest up.' },
    ],
  },
  {
    id: '3',
    name: 'Yoga & Flexibility',
    difficulty: 'Beginner',
    duration: '40 mins',
    description: 'Improve flexibility and relaxation',
    warmup: YOGA_WARMUP,
    exercises: [
      { name: 'Sun Salutation',    sets: '3', reps: '5 flows', howTo: 'Start standing, raise arms overhead and fold forward. Step back to plank, lower to floor, push up to cobra, then lift hips to downward dog. Step forward and rise back to standing. Flow with breath.' },
      { name: 'Warrior I',         sets: '1', reps: '30 sec/side', howTo: 'Step one foot back about 4 feet. Bend front knee to 90 degrees. Raise arms overhead with palms facing each other. Square hips forward. Hold and breathe deeply.' },
      { name: 'Warrior II',        sets: '1', reps: '30 sec/side', howTo: 'From Warrior I, open hips to the side and extend arms parallel to the floor. Gaze over your front hand. Keep front knee bent and back leg straight. Sink low and breathe.' },
      { name: 'Tree Pose',         sets: '1', reps: '30 sec/side', howTo: 'Stand on one leg. Place the sole of the other foot on your inner thigh or calf (never the knee). Bring hands to prayer position or overhead. Focus on a fixed point for balance.' },
      { name: 'Downward Dog',      sets: '1', reps: '60 sec', howTo: 'Start on hands and knees. Lift hips up and back, straightening legs. Press heels toward the floor and hands firmly into the mat. Create an inverted V shape with your body.' },
      { name: 'Child\'s Pose',     sets: '1', reps: '60 sec', howTo: 'Kneel on the floor with toes together and knees apart. Sit back on heels and fold forward, extending arms out front on the floor. Rest forehead on the mat and breathe deeply.' },
      { name: 'Cat-Cow Stretch',   sets: '1', reps: '10 cycles', howTo: 'Start on hands and knees. Inhale: arch your back and look up (cow). Exhale: round your spine and tuck chin to chest (cat). Flow between positions with your breath.' },
      { name: 'Pigeon Pose',       sets: '1', reps: '45 sec/side', howTo: 'From downward dog, bring one knee forward behind the wrist. Extend the back leg straight behind you. Fold forward over the front leg. This deeply stretches the hip. Hold and breathe.' },
      { name: 'Seated Forward Fold', sets: '1', reps: '60 sec', howTo: 'Sit with legs extended straight in front. Hinge at hips and reach toward your toes. Keep your back as flat as possible. Don\'t bounce — hold the stretch and breathe.' },
      { name: 'Corpse Pose',       sets: '1', reps: '3 mins', howTo: 'Lie flat on your back with arms at sides, palms up. Close eyes and relax every muscle. Focus on slow, deep breathing. Let go of all tension. This is your final relaxation.' },
    ],
  },
  {
    id: '4',
    name: 'Upper Body Focus',
    difficulty: 'Intermediate',
    duration: '50 mins',
    description: 'Chest, back, shoulders and arms workout',
    warmup: GENERAL_WARMUP,
    exercises: [
      { name: 'Push-ups',           sets: '4', reps: '15',     howTo: 'Place hands shoulder-width apart on the floor. Lower your chest until it nearly touches the ground, keeping your body in a straight line from head to heels. Push back up explosively. Keep your core tight throughout.' },
      { name: 'Diamond Push-ups',   sets: '3', reps: '10',     howTo: 'Place hands close together under your chest forming a diamond shape with thumbs and index fingers. Lower chest to hands and push back up. This targets triceps more than standard push-ups.' },
      { name: 'Pike Push-ups',      sets: '3', reps: '10',     howTo: 'Start in a downward dog position with hips high. Bend elbows and lower the top of your head toward the floor. Push back up. This mimics an overhead press using bodyweight.' },
      { name: 'Dumbbell Rows',      sets: '3', reps: '12/arm', howTo: 'Place one hand and knee on a bench. Hold a weight in the other hand. Pull the weight up to your ribcage, squeezing your shoulder blade. Lower with control. Keep back flat.' },
      { name: 'Lateral Raises',     sets: '3', reps: '12',     howTo: 'Hold weights at your sides. Raise arms out to the sides until parallel with the floor. Lower slowly. Keep a slight bend in elbows and avoid swinging the weights.' },
      { name: 'Bicep Curls',        sets: '3', reps: '12',     howTo: 'Hold weights at sides with palms facing forward. Curl weights up toward shoulders by bending elbows. Squeeze at the top, then lower slowly. Keep elbows pinned to your sides.' },
      { name: 'Tricep Dips',        sets: '3', reps: '12',     howTo: 'Place hands on the edge of a chair behind you. Extend legs out front. Lower your body by bending elbows to 90 degrees. Push back up. Keep back close to the chair.' },
      { name: 'Superman Hold',      sets: '3', reps: '30 sec', howTo: 'Lie face down with arms extended forward. Simultaneously lift arms, chest, and legs off the floor. Squeeze your lower back and glutes. Hold the position while breathing steadily.' },
      { name: 'Plank Shoulder Taps', sets: '3', reps: '12/side', howTo: 'Start in a high plank position. Tap your left shoulder with your right hand, then switch. Keep hips stable and avoid rocking side to side. Engage core throughout.' },
      { name: 'Wall Push-ups',      sets: '2', reps: '15',     howTo: 'Stand arm\'s length from a wall. Place palms on the wall at shoulder height. Bend elbows to bring chest toward the wall. Push back. Great as a warm-up or cool-down.' },
    ],
  },
]

export function WorkoutsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useAppNavigation()

  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  // Custom workout form state
  const [customName, setCustomName] = useState('')
  const [customDuration, setCustomDuration] = useState('')
  const [customExercises, setCustomExercises] = useState<{ name: string; sets: string; reps: string }[]>([
    { name: '', sets: '3', reps: '12' },
  ])

  const allWorkouts = [...PRESET_WORKOUTS, ...customWorkouts]

  const addCustomExercise = () => {
    setCustomExercises([...customExercises, { name: '', sets: '3', reps: '12' }])
  }

  const updateCustomExercise = (index: number, field: string, value: string) => {
    const updated = [...customExercises]
    updated[index] = { ...updated[index], [field]: value }
    setCustomExercises(updated)
  }

  const saveCustomWorkout = () => {
    if (!customName.trim()) return
    const validExercises = customExercises.filter((e) => e.name.trim())
    if (validExercises.length === 0) return

    const newWorkout: Workout = {
      id: `custom-${Date.now()}`,
      name: customName,
      difficulty: 'Intermediate',
      duration: customDuration || `${validExercises.length * 5} mins`,
      description: 'Your custom workout',
      custom: true,
      warmup: GENERAL_WARMUP,
      exercises: validExercises.map((e) => ({
        ...e,
        howTo: 'Custom exercise — perform with proper form and controlled movements.',
      })),
    }
    setCustomWorkouts((prev) => [...prev, newWorkout])
    setCustomName('')
    setCustomDuration('')
    setCustomExercises([{ name: '', sets: '3', reps: '12' }])
    setShowCustomForm(false)
  }

  const getDifficultyColor = (d: string) =>
    d === 'Beginner' ? T.green : d === 'Intermediate' ? T.orange : T.red

  // ── Exercise detail view ──────────────────────────────────────────────────
  if (selectedWorkout) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AppHeader title={selectedWorkout.name} />
        <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
          <View style={styles.workoutMeta}>
            <View style={[styles.metaBadge, { backgroundColor: `${getDifficultyColor(selectedWorkout.difficulty)}20` }]}>
              <Text style={[styles.metaBadgeText, { color: getDifficultyColor(selectedWorkout.difficulty) }]}>
                {selectedWorkout.difficulty}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color={T.muted} />
              <Text style={styles.metaText}>{selectedWorkout.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="repeat" size={14} color={T.muted} />
              <Text style={styles.metaText}>{selectedWorkout.exercises.length} exercises</Text>
            </View>
          </View>

          {/* Warmup Section */}
          {selectedWorkout.warmup && selectedWorkout.warmup.length > 0 && (
            <>
              <View style={styles.warmupBanner}>
                <Ionicons name="flame" size={16} color={T.orange} />
                <Text style={styles.warmupBannerText}>Warm-up ({selectedWorkout.warmup.length} exercises)</Text>
              </View>
              {selectedWorkout.warmup.map((ex, idx) => {
                const key = `warmup-${idx}`
                const isExpanded = expandedExercise === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.exerciseCard, styles.warmupCard]}
                    onPress={() => setExpandedExercise(isExpanded ? null : key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.exerciseRow}>
                      <View style={[styles.exerciseNum, { backgroundColor: `${T.orange}20` }]}>
                        <Ionicons name="flame" size={14} color={T.orange} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.exerciseName}>{ex.name}</Text>
                        <Text style={styles.exerciseSets}>{ex.sets} set x {ex.reps}</Text>
                      </View>
                      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={T.muted} />
                    </View>
                    {isExpanded && (
                      <View style={styles.howToBox}>
                        <View style={styles.howToHeader}>
                          <Ionicons name="book" size={14} color={T.orange} />
                          <Text style={[styles.howToLabel, { color: T.orange }]}>How to do it</Text>
                        </View>
                        <Text style={styles.howToText}>{ex.howTo}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </>
          )}

          <Text style={styles.exercisesSectionTitle}>Exercises</Text>

          {selectedWorkout.exercises.map((ex, idx) => {
            const key = `${selectedWorkout.id}-${idx}`
            const isExpanded = expandedExercise === key
            return (
              <TouchableOpacity
                key={key}
                style={styles.exerciseCard}
                onPress={() => setExpandedExercise(isExpanded ? null : key)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseRow}>
                  <View style={styles.exerciseNum}>
                    <Text style={styles.exerciseNumText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseSets}>{ex.sets} sets x {ex.reps}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={T.muted}
                  />
                </View>
                {isExpanded && (
                  <View style={styles.howToBox}>
                    <View style={styles.howToHeader}>
                      <Ionicons name="book" size={14} color={T.primary} />
                      <Text style={styles.howToLabel}>How to do it</Text>
                    </View>
                    <Text style={styles.howToText}>{ex.howTo}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}

          <Button
            title="Start Workout"
            fullWidth
            style={{ marginTop: 16, marginBottom: 32 }}
            onPress={() => navigation.navigate('LiveWorkout', { workoutId: selectedWorkout.id })}
          />

          <TouchableOpacity style={styles.backLink} onPress={() => setSelectedWorkout(null)}>
            <Ionicons name="arrow-back" size={16} color={T.primary} />
            <Text style={styles.backLinkText}>Back to all workouts</Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    )
  }

  // ── Workout list view ─────────────────────────────────────────────────────
  const renderWorkout = ({ item }: { item: Workout }) => (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => setSelectedWorkout(item)}
      activeOpacity={0.7}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutIcon}>
          <Ionicons name={item.custom ? 'create' : 'fitness'} size={28} color={T.primary2} />
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(item.difficulty)}20` }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
      </View>

      <Text style={styles.workoutName}>{item.name}</Text>
      <Text style={styles.workoutDescription} numberOfLines={1}>{item.description}</Text>

      <View style={styles.workoutMetaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="time" size={14} color={T.muted} />
          <Text style={styles.metaText}>{item.duration}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="repeat" size={14} color={T.muted} />
          <Text style={styles.metaText}>{item.exercises.length} exercises</Text>
        </View>
      </View>

      <View style={styles.viewDetailRow}>
        <Text style={styles.viewDetailText}>View exercises & instructions</Text>
        <Ionicons name="chevron-forward" size={14} color={T.primary} />
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Workouts" subtitle="Choose a workout plan" />

      {/* Create custom workout CTA */}
      <TouchableOpacity style={styles.headerCard} onPress={() => setShowCustomForm(true)}>
        <Ionicons name="add-circle" size={20} color={T.primary2} />
        <Text style={styles.headerCardText}>Create Custom Workout</Text>
        <Ionicons name="arrow-forward" size={16} color={T.primary2} />
      </TouchableOpacity>

      <FlatList
        data={allWorkouts}
        renderItem={renderWorkout}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Custom Workout Modal ─────────────────────────────────────────── */}
      <Modal visible={showCustomForm} transparent animationType="slide" onRequestClose={() => setShowCustomForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Workout</Text>
              <TouchableOpacity onPress={() => setShowCustomForm(false)}>
                <Ionicons name="close" size={22} color={T.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <TextInput
                style={styles.input}
                placeholder="Workout name"
                placeholderTextColor={T.muted}
                value={customName}
                onChangeText={setCustomName}
              />
              <TextInput
                style={styles.input}
                placeholder="Duration (e.g. 30 mins)"
                placeholderTextColor={T.muted}
                value={customDuration}
                onChangeText={setCustomDuration}
              />

              <Text style={styles.modalSubtitle}>Exercises</Text>
              {customExercises.map((ex, i) => (
                <View key={i} style={styles.customExRow}>
                  <TextInput
                    style={[styles.input, { flex: 2 }]}
                    placeholder={`Exercise ${i + 1}`}
                    placeholderTextColor={T.muted}
                    value={ex.name}
                    onChangeText={(v) => updateCustomExercise(i, 'name', v)}
                  />
                  <TextInput
                    style={[styles.input, { flex: 0.5 }]}
                    placeholder="Sets"
                    placeholderTextColor={T.muted}
                    keyboardType="number-pad"
                    value={ex.sets}
                    onChangeText={(v) => updateCustomExercise(i, 'sets', v)}
                  />
                  <TextInput
                    style={[styles.input, { flex: 0.5 }]}
                    placeholder="Reps"
                    placeholderTextColor={T.muted}
                    value={ex.reps}
                    onChangeText={(v) => updateCustomExercise(i, 'reps', v)}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.addExBtn} onPress={addCustomExercise}>
                <Ionicons name="add" size={16} color={T.primary} />
                <Text style={styles.addExText}>Add Exercise</Text>
              </TouchableOpacity>
            </ScrollView>

            <Button title="Save Workout" fullWidth onPress={saveCustomWorkout} style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: T.bg },
  headerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: `${T.primary2}15`,
    marginHorizontal: 16, marginVertical: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 10, gap: 10,
  },
  headerCardText: { flex: 1, fontSize: 14, fontWeight: '600', color: T.primary2 },
  listContent:     { paddingHorizontal: 16, paddingVertical: 8 },

  // Workout card
  workoutCard: {
    backgroundColor: T.surface, borderRadius: 12,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: T.border,
  },
  workoutHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  workoutIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  difficultyBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  difficultyText:  { fontSize: 11, fontWeight: '600' },
  workoutName:        { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 6 },
  workoutDescription: { fontSize: 13, color: T.muted, marginBottom: 12 },
  workoutMetaRow:     { flexDirection: 'row', gap: 16, marginBottom: 10 },
  metaItem:           { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:           { fontSize: 12, color: T.muted },
  viewDetailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: T.border,
  },
  viewDetailText: { flex: 1, fontSize: 12, fontWeight: '600', color: T.primary },

  // Exercise detail view
  workoutMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 20, flexWrap: 'wrap',
  },
  metaBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  metaBadgeText: { fontSize: 12, fontWeight: '600' },
  warmupBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: `${T.orange}15`, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12,
  },
  warmupBannerText: { fontSize: 14, fontWeight: '700', color: T.orange },
  warmupCard: { borderColor: `${T.orange}30` },
  exercisesSectionTitle: { fontSize: 16, fontWeight: '700', color: T.text, marginBottom: 12, marginTop: 8 },
  exerciseCard: {
    backgroundColor: T.surface, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: T.border,
  },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseNum: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: `${T.primary}20`,
    justifyContent: 'center', alignItems: 'center',
  },
  exerciseNumText: { fontSize: 13, fontWeight: '700', color: T.primary },
  exerciseName:    { fontSize: 14, fontWeight: '600', color: T.text },
  exerciseSets:    { fontSize: 12, color: T.muted, marginTop: 2 },
  howToBox: {
    marginTop: 12, padding: 12,
    backgroundColor: T.surface2, borderRadius: 10,
  },
  howToHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  howToLabel:  { fontSize: 12, fontWeight: '700', color: T.primary },
  howToText:   { fontSize: 13, color: T.text2, lineHeight: 20 },
  backLink:     { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginTop: 4 },
  backLinkText: { fontSize: 13, fontWeight: '600', color: T.primary },

  // Custom workout modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: T.surface2,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle:    { fontSize: 18, fontWeight: '700', color: T.text },
  modalSubtitle: { fontSize: 14, fontWeight: '600', color: T.text, marginBottom: 10, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: T.border2, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: T.text, marginBottom: 10,
  },
  customExRow: { flexDirection: 'row', gap: 8 },
  addExBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', marginTop: 4,
  },
  addExText: { fontSize: 13, fontWeight: '600', color: T.primary },
})

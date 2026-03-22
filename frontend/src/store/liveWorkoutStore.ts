import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncWorkoutSession } from './fitnessSyncService';

// ─── MoveNet Keypoint indices ───────────────────────────
// 0:nose 1:left_eye 2:right_eye 3:left_ear 4:right_ear
// 5:left_shoulder 6:right_shoulder 7:left_elbow 8:right_elbow
// 9:left_wrist 10:right_wrist 11:left_hip 12:right_hip
// 13:left_knee 14:right_knee 15:left_ankle 16:right_ankle
export const KP = {
  NOSE: 0, L_EYE: 1, R_EYE: 2, L_EAR: 3, R_EAR: 4,
  L_SHOULDER: 5, R_SHOULDER: 6, L_ELBOW: 7, R_ELBOW: 8,
  L_WRIST: 9, R_WRIST: 10, L_HIP: 11, R_HIP: 12,
  L_KNEE: 13, R_KNEE: 14, L_ANKLE: 15, R_ANKLE: 16,
} as const;

export type Keypoint = { x: number; y: number; score: number };

// ─── Angle helpers ──────────────────────────────────────
export function angle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs((radians * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

export function distance(a: Keypoint, b: Keypoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ─── Exercise phase detection ───────────────────────────
export type ExercisePhase = 'up' | 'down' | 'neutral';

export interface LiveExercise {
  id: string;
  name: string;
  emoji: string;
  category: 'upper' | 'lower' | 'core' | 'full-body' | 'cardio' | 'yoga' | 'stretch';
  muscles: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  cues: string[];   // form tips shown during exercise
  detect: (kps: Keypoint[], prev: ExercisePhase) => { phase: ExercisePhase; formScore: number; feedback: string };
}

// Threshold-based phase detection helper
function repDetect(
  kps: Keypoint[],
  prev: ExercisePhase,
  jointA: number, jointB: number, jointC: number,
  downBelow: number, upAbove: number,
): { phase: ExercisePhase; formScore: number; feedback: string } {
  const kpA = kps[jointA], kpB = kps[jointB], kpC = kps[jointC];
  if (!kpA || !kpB || !kpC || kpA.score < 0.3 || kpB.score < 0.3 || kpC.score < 0.3)
    return { phase: prev, formScore: 0, feedback: 'Position yourself so joints are visible' };
  const ang = angle(kpA, kpB, kpC);
  let phase: ExercisePhase = prev;
  if (ang < downBelow) phase = 'down';
  else if (ang > upAbove) phase = 'up';
  const formScore = Math.min(1, Math.max(0, kpA.score + kpB.score + kpC.score) / 3);
  return { phase, formScore, feedback: ang < downBelow ? 'Hold it!' : ang > upAbove ? 'Good extension!' : 'Keep going...' };
}

// ─── EXERCISE DATABASE (30 exercises) ───────────────────
export const LIVE_EXERCISES: LiveExercise[] = [
  // ── UPPER BODY ────────────────────────
  {
    id: 'pushup', name: 'Push-ups', emoji: '💪', category: 'upper', muscles: ['Chest', 'Triceps', 'Shoulders'], difficulty: 'beginner',
    description: 'Classic upper body push exercise',
    cues: ['Keep body straight', 'Elbows at 45°', 'Full range of motion'],
    detect: (kps, prev) => {
      const lElbow = angle(kps[KP.L_SHOULDER], kps[KP.L_ELBOW], kps[KP.L_WRIST]);
      const rElbow = angle(kps[KP.R_SHOULDER], kps[KP.R_ELBOW], kps[KP.R_WRIST]);
      const avg = (lElbow + rElbow) / 2;
      let phase: ExercisePhase = prev;
      if (avg < 90) phase = 'down';
      else if (avg > 155) phase = 'up';
      const hipAngle = angle(kps[KP.L_SHOULDER], kps[KP.L_HIP], kps[KP.L_KNEE]);
      const formScore = hipAngle > 160 ? 1 : hipAngle > 140 ? 0.7 : 0.4;
      const feedback = hipAngle < 140 ? 'Keep hips up — straight line!' : avg < 90 ? 'Great depth!' : 'Push up fully!';
      return { phase, formScore, feedback };
    },
  },
  {
    id: 'shoulder-press', name: 'Shoulder Press', emoji: '🙌', category: 'upper', muscles: ['Shoulders', 'Triceps'], difficulty: 'intermediate',
    description: 'Overhead pressing motion',
    cues: ['Press straight up', 'Don\'t arch back', 'Full lockout'],
    detect: (kps, prev) => {
      const lArm = angle(kps[KP.L_HIP], kps[KP.L_SHOULDER], kps[KP.L_ELBOW]);
      const rArm = angle(kps[KP.R_HIP], kps[KP.R_SHOULDER], kps[KP.R_ELBOW]);
      const avg = (lArm + rArm) / 2;
      let phase: ExercisePhase = prev;
      if (avg < 90) phase = 'down';
      else if (avg > 160) phase = 'up';
      const formScore = Math.min(kps[KP.L_SHOULDER].score, kps[KP.R_SHOULDER].score);
      return { phase, formScore, feedback: avg > 160 ? 'Full lockout!' : 'Press overhead!' };
    },
  },
  {
    id: 'bicep-curl', name: 'Bicep Curls', emoji: '💪', category: 'upper', muscles: ['Biceps', 'Forearms'], difficulty: 'beginner',
    description: 'Elbow flexion curling motion',
    cues: ['Keep elbows pinned', 'Squeeze at top', 'Control the descent'],
    detect: (kps, prev) => repDetect(kps, prev, KP.L_SHOULDER, KP.L_ELBOW, KP.L_WRIST, 60, 150),
  },
  {
    id: 'tricep-extension', name: 'Tricep Extensions', emoji: '🦾', category: 'upper', muscles: ['Triceps'], difficulty: 'beginner',
    description: 'Overhead tricep extension',
    cues: ['Keep elbows close to head', 'Full extension at top', 'Controlled lowering'],
    detect: (kps, prev) => {
      const lElbow = angle(kps[KP.L_SHOULDER], kps[KP.L_ELBOW], kps[KP.L_WRIST]);
      let phase: ExercisePhase = prev;
      if (lElbow < 70) phase = 'down';
      else if (lElbow > 150) phase = 'up';
      return { phase, formScore: kps[KP.L_ELBOW].score, feedback: lElbow > 150 ? 'Full extension!' : 'Extend arms!' };
    },
  },
  {
    id: 'lateral-raise', name: 'Lateral Raises', emoji: '🦅', category: 'upper', muscles: ['Shoulders', 'Traps'], difficulty: 'beginner',
    description: 'Raise arms to the sides',
    cues: ['Slight elbow bend', 'Raise to shoulder height', 'Control down'],
    detect: (kps, prev) => {
      const lArm = angle(kps[KP.L_HIP], kps[KP.L_SHOULDER], kps[KP.L_WRIST]);
      const rArm = angle(kps[KP.R_HIP], kps[KP.R_SHOULDER], kps[KP.R_WRIST]);
      const avg = (lArm + rArm) / 2;
      let phase: ExercisePhase = prev;
      if (avg < 30) phase = 'down';
      else if (avg > 75) phase = 'up';
      return { phase, formScore: 0.8, feedback: avg > 75 ? 'Good height!' : 'Raise arms out!' };
    },
  },
  {
    id: 'pike-pushup', name: 'Pike Push-ups', emoji: '⛰️', category: 'upper', muscles: ['Shoulders', 'Triceps', 'Upper Chest'], difficulty: 'intermediate',
    description: 'Inverted push-up targeting shoulders',
    cues: ['Hips high', 'Head between arms', 'Elbows out slightly'],
    detect: (kps, prev) => {
      const elbowAng = (angle(kps[KP.L_SHOULDER], kps[KP.L_ELBOW], kps[KP.L_WRIST]) + angle(kps[KP.R_SHOULDER], kps[KP.R_ELBOW], kps[KP.R_WRIST])) / 2;
      let phase: ExercisePhase = prev;
      if (elbowAng < 90) phase = 'down';
      else if (elbowAng > 155) phase = 'up';
      return { phase, formScore: 0.8, feedback: elbowAng < 90 ? 'Head to floor!' : 'Push up!' };
    },
  },
  {
    id: 'arm-circles', name: 'Arm Circles', emoji: '🔄', category: 'upper', muscles: ['Shoulders', 'Rotator Cuff'], difficulty: 'beginner',
    description: 'Circular arm rotation warmup',
    cues: ['Keep arms straight', 'Full circles', 'Steady pace'],
    detect: (kps, prev) => {
      const lArm = angle(kps[KP.L_HIP], kps[KP.L_SHOULDER], kps[KP.L_WRIST]);
      let phase: ExercisePhase = prev;
      if (lArm > 120) phase = 'up';
      else if (lArm < 50) phase = 'down';
      return { phase, formScore: 0.7, feedback: 'Keep circling!' };
    },
  },

  // ── LOWER BODY ────────────────────────
  {
    id: 'squat', name: 'Squats', emoji: '🦵', category: 'lower', muscles: ['Quads', 'Glutes', 'Hamstrings'], difficulty: 'beginner',
    description: 'Fundamental lower body exercise',
    cues: ['Knees over toes', 'Chest up', 'Hip crease below knee'],
    detect: (kps, prev) => {
      const lKnee = angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]);
      const rKnee = angle(kps[KP.R_HIP], kps[KP.R_KNEE], kps[KP.R_ANKLE]);
      const avg = (lKnee + rKnee) / 2;
      let phase: ExercisePhase = prev;
      if (avg < 100) phase = 'down';
      else if (avg > 160) phase = 'up';
      const torso = angle(kps[KP.L_SHOULDER], kps[KP.L_HIP], kps[KP.L_KNEE]);
      const formScore = torso > 60 ? 1 : torso > 40 ? 0.7 : 0.4;
      const feedback = avg < 100 ? 'Good depth!' : torso < 50 ? 'Keep chest up!' : 'Stand tall!';
      return { phase, formScore, feedback };
    },
  },
  {
    id: 'lunge', name: 'Lunges', emoji: '🚶', category: 'lower', muscles: ['Quads', 'Glutes', 'Hamstrings', 'Calves'], difficulty: 'beginner',
    description: 'Alternating forward lunge',
    cues: ['Front knee at 90°', 'Back knee near floor', 'Upright torso'],
    detect: (kps, prev) => {
      const lKnee = angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]);
      let phase: ExercisePhase = prev;
      if (lKnee < 100) phase = 'down';
      else if (lKnee > 160) phase = 'up';
      return { phase, formScore: 0.8, feedback: lKnee < 100 ? 'Deep lunge!' : 'Step forward!' };
    },
  },
  {
    id: 'sumo-squat', name: 'Sumo Squats', emoji: '🦵', category: 'lower', muscles: ['Inner Thighs', 'Quads', 'Glutes'], difficulty: 'beginner',
    description: 'Wide-stance squat',
    cues: ['Wide stance', 'Toes out 45°', 'Knees track over toes'],
    detect: (kps, prev) => {
      const lKnee = angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]);
      const rKnee = angle(kps[KP.R_HIP], kps[KP.R_KNEE], kps[KP.R_ANKLE]);
      const avg = (lKnee + rKnee) / 2;
      let phase: ExercisePhase = prev;
      if (avg < 110) phase = 'down';
      else if (avg > 160) phase = 'up';
      return { phase, formScore: 0.8, feedback: avg < 110 ? 'Low and wide!' : 'Rise up!' };
    },
  },
  {
    id: 'calf-raise', name: 'Calf Raises', emoji: '🦶', category: 'lower', muscles: ['Calves'], difficulty: 'beginner',
    description: 'Rise up on toes',
    cues: ['Full height', 'Squeeze at top', 'Slow descent'],
    detect: (kps, prev) => {
      const hipHeight = kps[KP.L_HIP].y;
      const ankleHeight = kps[KP.L_ANKLE].y;
      const kneeAngle = angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]);
      let phase: ExercisePhase = prev;
      // When on tip-toes the ankle-to-hip ratio changes & knees stay straight
      if (kneeAngle > 170 && (ankleHeight - hipHeight) < 0.42 * 480) phase = 'up';
      else if (kneeAngle > 165) phase = 'down';
      return { phase, formScore: 0.7, feedback: 'Rise on your toes!' };
    },
  },
  {
    id: 'wall-sit', name: 'Wall Sit', emoji: '🧱', category: 'lower', muscles: ['Quads', 'Glutes', 'Core'], difficulty: 'intermediate',
    description: 'Isometric hold against wall',
    cues: ['Back flat on wall', '90° knee angle', 'Hold as long as possible'],
    detect: (kps, _prev) => {
      const kneeAng = (angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]) + angle(kps[KP.R_HIP], kps[KP.R_KNEE], kps[KP.R_ANKLE])) / 2;
      const isHolding = kneeAng > 80 && kneeAng < 110;
      return { phase: isHolding ? 'down' : 'up', formScore: isHolding ? 1 : 0.4, feedback: isHolding ? 'Hold it! 🔥' : 'Sit lower, 90° knees!' };
    },
  },
  {
    id: 'glute-bridge', name: 'Glute Bridges', emoji: '🌉', category: 'lower', muscles: ['Glutes', 'Hamstrings', 'Core'], difficulty: 'beginner',
    description: 'Lying hip thrust',
    cues: ['Squeeze glutes at top', 'Feet flat', 'Straight line knee-to-shoulder'],
    detect: (kps, prev) => {
      const hipAngle = angle(kps[KP.L_SHOULDER], kps[KP.L_HIP], kps[KP.L_KNEE]);
      let phase: ExercisePhase = prev;
      if (hipAngle > 160) phase = 'up';
      else if (hipAngle < 110) phase = 'down';
      return { phase, formScore: 0.8, feedback: hipAngle > 160 ? 'Squeeze at top!' : 'Push hips up!' };
    },
  },
  {
    id: 'single-leg-squat', name: 'Pistol Squat', emoji: '🔫', category: 'lower', muscles: ['Quads', 'Glutes', 'Balance'], difficulty: 'advanced',
    description: 'Single leg squat',
    cues: ['Extend one leg forward', 'Sit back slowly', 'Arms for balance'],
    detect: (kps, prev) => {
      const lKnee = angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]);
      let phase: ExercisePhase = prev;
      if (lKnee < 80) phase = 'down';
      else if (lKnee > 160) phase = 'up';
      return { phase, formScore: lKnee < 80 ? 1 : 0.6, feedback: lKnee < 80 ? 'Incredible depth!' : 'Go deeper!' };
    },
  },

  // ── CORE ──────────────────────────────
  {
    id: 'crunch', name: 'Crunches', emoji: '🔥', category: 'core', muscles: ['Abs', 'Core'], difficulty: 'beginner',
    description: 'Basic abdominal crunch',
    cues: ['Hands behind head', 'Curl shoulders up', 'Don\'t pull neck'],
    detect: (kps, prev) => {
      const torso = angle(kps[KP.L_HIP], kps[KP.L_SHOULDER], kps[KP.L_ELBOW]);
      let phase: ExercisePhase = prev;
      if (torso < 60) phase = 'up';
      else if (torso > 100) phase = 'down';
      return { phase, formScore: 0.8, feedback: torso < 60 ? 'Squeeze the abs!' : 'Curl up!' };
    },
  },
  {
    id: 'plank', name: 'Plank', emoji: '🪵', category: 'core', muscles: ['Core', 'Shoulders', 'Glutes'], difficulty: 'beginner',
    description: 'Isometric core hold',
    cues: ['Straight line head to heels', 'Engage core', 'Don\'t sag hips'],
    detect: (kps, _prev) => {
      const bodyLine = angle(kps[KP.L_SHOULDER], kps[KP.L_HIP], kps[KP.L_ANKLE]);
      const isHolding = bodyLine > 155;
      return { phase: isHolding ? 'down' : 'neutral', formScore: isHolding ? 1 : 0.5, feedback: isHolding ? 'Great form! Hold it! 🔥' : 'Straighten your body line!' };
    },
  },
  {
    id: 'mountain-climber', name: 'Mountain Climbers', emoji: '⛰️', category: 'core', muscles: ['Core', 'Hip Flexors', 'Shoulders'], difficulty: 'intermediate',
    description: 'Alternating knee drives in plank',
    cues: ['Plank position', 'Drive knees to chest', 'Keep hips level'],
    detect: (kps, prev) => {
      const lKneeHip = distance(kps[KP.L_KNEE], kps[KP.L_HIP]);
      const rKneeHip = distance(kps[KP.R_KNEE], kps[KP.R_HIP]);
      const minDist = Math.min(lKneeHip, rKneeHip);
      let phase: ExercisePhase = prev;
      if (minDist < 50) phase = 'down';
      else if (minDist > 100) phase = 'up';
      return { phase, formScore: 0.8, feedback: 'Drive those knees! 🔥' };
    },
  },
  {
    id: 'leg-raise', name: 'Leg Raises', emoji: '🦵', category: 'core', muscles: ['Lower Abs', 'Hip Flexors'], difficulty: 'intermediate',
    description: 'Lying leg raise',
    cues: ['Keep legs straight', 'Lower back flat', 'Controlled movement'],
    detect: (kps, prev) => {
      const hipAngle = angle(kps[KP.L_SHOULDER], kps[KP.L_HIP], kps[KP.L_ANKLE]);
      let phase: ExercisePhase = prev;
      if (hipAngle < 90) phase = 'up';
      else if (hipAngle > 160) phase = 'down';
      return { phase, formScore: 0.8, feedback: hipAngle < 90 ? 'Hold at top!' : 'Raise legs up!' };
    },
  },
  {
    id: 'situp', name: 'Sit-ups', emoji: '🔥', category: 'core', muscles: ['Abs', 'Hip Flexors'], difficulty: 'beginner',
    description: 'Full sit-up from lying',
    cues: ['Feet anchored', 'Come all the way up', 'Control on the way down'],
    detect: (kps, prev) => {
      const torso = angle(kps[KP.L_KNEE], kps[KP.L_HIP], kps[KP.L_SHOULDER]);
      let phase: ExercisePhase = prev;
      if (torso < 70) phase = 'up';
      else if (torso > 140) phase = 'down';
      return { phase, formScore: 0.8, feedback: torso < 70 ? 'All the way up!' : 'Lower with control!' };
    },
  },
  {
    id: 'russian-twist', name: 'Russian Twists', emoji: '🌀', category: 'core', muscles: ['Obliques', 'Core'], difficulty: 'intermediate',
    description: 'Seated torso rotation',
    cues: ['Lean back 45°', 'Feet off floor', 'Touch floor each side'],
    detect: (kps, _prev) => {
      const shoulderDx = Math.abs(kps[KP.L_SHOULDER].x - kps[KP.R_SHOULDER].x);
      let phase: ExercisePhase = _prev;
      if (shoulderDx < 40) phase = 'down';    // twisted
      else if (shoulderDx > 80) phase = 'up';  // center
      return { phase, formScore: 0.7, feedback: 'Twist side to side!' };
    },
  },

  // ── FULL BODY ─────────────────────────
  {
    id: 'burpee', name: 'Burpees', emoji: '🏋️', category: 'full-body', muscles: ['Full Body'], difficulty: 'advanced',
    description: 'Squat thrust with jump',
    cues: ['Explode up', 'Chest to floor', 'Jump high'],
    detect: (kps, prev) => {
      const hipY = (kps[KP.L_HIP].y + kps[KP.R_HIP].y) / 2;
      const shoulderY = (kps[KP.L_SHOULDER].y + kps[KP.R_SHOULDER].y) / 2;
      const ankleY = (kps[KP.L_ANKLE].y + kps[KP.R_ANKLE].y) / 2;
      let phase: ExercisePhase = prev;
      if (shoulderY > hipY * 0.9) phase = 'down';   // on the floor
      else if (hipY < ankleY * 0.6) phase = 'up';    // jumping
      return { phase, formScore: 0.8, feedback: 'Full extension on the jump!' };
    },
  },
  {
    id: 'jumping-jack', name: 'Jumping Jacks', emoji: '⭐', category: 'full-body', muscles: ['Full Body', 'Shoulders', 'Calves'], difficulty: 'beginner',
    description: 'Classic cardio movement',
    cues: ['Arms overhead', 'Wide feet', 'Rhythmic tempo'],
    detect: (kps, prev) => {
      const armAngle = (angle(kps[KP.L_HIP], kps[KP.L_SHOULDER], kps[KP.L_WRIST]) + angle(kps[KP.R_HIP], kps[KP.R_SHOULDER], kps[KP.R_WRIST])) / 2;
      const feetDist = distance(kps[KP.L_ANKLE], kps[KP.R_ANKLE]);
      let phase: ExercisePhase = prev;
      if (armAngle > 140 && feetDist > 100) phase = 'up';
      else if (armAngle < 50 && feetDist < 60) phase = 'down';
      return { phase, formScore: 0.9, feedback: armAngle > 140 ? 'Arms up high!' : 'Jump!' };
    },
  },
  {
    id: 'star-jump', name: 'Star Jumps', emoji: '🌟', category: 'full-body', muscles: ['Full Body', 'Calves'], difficulty: 'intermediate',
    description: 'Explosive jump with arms and legs spread',
    cues: ['Squat down first', 'Explode upward', 'Spread arms and legs'],
    detect: (kps, prev) => {
      const armAngle = (angle(kps[KP.L_HIP], kps[KP.L_SHOULDER], kps[KP.L_WRIST]) + angle(kps[KP.R_HIP], kps[KP.R_SHOULDER], kps[KP.R_WRIST])) / 2;
      const feetDist = distance(kps[KP.L_ANKLE], kps[KP.R_ANKLE]);
      let phase: ExercisePhase = prev;
      if (armAngle > 150 && feetDist > 120) phase = 'up';
      else if (armAngle < 40) phase = 'down';
      return { phase, formScore: 0.8, feedback: 'Explode into a star!' };
    },
  },
  {
    id: 'squat-jump', name: 'Squat Jumps', emoji: '🚀', category: 'full-body', muscles: ['Quads', 'Glutes', 'Calves'], difficulty: 'intermediate',
    description: 'Explosive squat with jump',
    cues: ['Deep squat', 'Explode upward', 'Soft landing'],
    detect: (kps, prev) => {
      const kneeAng = (angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]) + angle(kps[KP.R_HIP], kps[KP.R_KNEE], kps[KP.R_ANKLE])) / 2;
      let phase: ExercisePhase = prev;
      if (kneeAng < 100) phase = 'down';
      else if (kneeAng > 165) phase = 'up';
      return { phase, formScore: 0.8, feedback: kneeAng < 100 ? 'Jump!' : 'Squat deep first!' };
    },
  },
  {
    id: 'inchworm', name: 'Inchworm Walk', emoji: '🐛', category: 'full-body', muscles: ['Core', 'Shoulders', 'Hamstrings'], difficulty: 'intermediate',
    description: 'Walk hands out to plank and back',
    cues: ['Start standing', 'Walk hands out', 'Walk feet to hands'],
    detect: (kps, prev) => {
      const hipAngle = angle(kps[KP.L_SHOULDER], kps[KP.L_HIP], kps[KP.L_KNEE]);
      let phase: ExercisePhase = prev;
      if (hipAngle > 155) phase = 'down'; // plank position
      else if (hipAngle < 80) phase = 'up'; // bent over, walking back
      return { phase, formScore: 0.7, feedback: 'Walk it out!' };
    },
  },

  // ── CARDIO ────────────────────────────
  {
    id: 'high-knees', name: 'High Knees', emoji: '🏃', category: 'cardio', muscles: ['Hip Flexors', 'Quads', 'Calves'], difficulty: 'beginner',
    description: 'Running in place with high knee lifts',
    cues: ['Knees to waist height', 'Pump arms', 'Stay on toes'],
    detect: (kps, prev) => {
      const lKneeAboveHip = kps[KP.L_KNEE].y < kps[KP.L_HIP].y;
      const rKneeAboveHip = kps[KP.R_KNEE].y < kps[KP.R_HIP].y;
      let phase: ExercisePhase = prev;
      if (lKneeAboveHip || rKneeAboveHip) phase = 'up';
      else phase = 'down';
      return { phase, formScore: 0.8, feedback: 'Knees higher! 🔥' };
    },
  },
  {
    id: 'butt-kicks', name: 'Butt Kicks', emoji: '🦶', category: 'cardio', muscles: ['Hamstrings', 'Calves'], difficulty: 'beginner',
    description: 'Running in place kicking heels to glutes',
    cues: ['Kick heels to glutes', 'Upright posture', 'Quick tempo'],
    detect: (kps, prev) => {
      const lAnkleToGlute = distance(kps[KP.L_ANKLE], kps[KP.L_HIP]);
      const rAnkleToGlute = distance(kps[KP.R_ANKLE], kps[KP.R_HIP]);
      const closeDist = Math.min(lAnkleToGlute, rAnkleToGlute);
      let phase: ExercisePhase = prev;
      if (closeDist < 60) phase = 'up';
      else if (closeDist > 120) phase = 'down';
      return { phase, formScore: 0.8, feedback: 'Kick higher!' };
    },
  },
  {
    id: 'skater-jump', name: 'Skater Jumps', emoji: '⛸️', category: 'cardio', muscles: ['Glutes', 'Quads', 'Balance'], difficulty: 'intermediate',
    description: 'Lateral jumping from leg to leg',
    cues: ['Jump side to side', 'Land softly', 'Cross behind'],
    detect: (kps, prev) => {
      const hipX = (kps[KP.L_HIP].x + kps[KP.R_HIP].x) / 2;
      const shoulderX = (kps[KP.L_SHOULDER].x + kps[KP.R_SHOULDER].x) / 2;
      const lean = hipX - shoulderX;
      let phase: ExercisePhase = prev;
      if (lean > 20) phase = 'up';
      else if (lean < -20) phase = 'down';
      return { phase, formScore: 0.8, feedback: 'Jump side to side!' };
    },
  },

  // ── YOGA / STRETCH ────────────────────
  {
    id: 'warrior-pose', name: 'Warrior II Pose', emoji: '🧘', category: 'yoga', muscles: ['Legs', 'Core', 'Shoulders'], difficulty: 'beginner',
    description: 'Classic standing yoga pose',
    cues: ['Front knee at 90°', 'Arms level', 'Gaze over front hand'],
    detect: (kps, _prev) => {
      const lKnee = angle(kps[KP.L_HIP], kps[KP.L_KNEE], kps[KP.L_ANKLE]);
      const armSpread = distance(kps[KP.L_WRIST], kps[KP.R_WRIST]);
      const isHolding = lKnee < 120 && armSpread > 200;
      return { phase: isHolding ? 'down' : 'neutral', formScore: isHolding ? 1 : 0.4, feedback: isHolding ? 'Beautiful pose! Hold it!' : 'Widen stance, spread arms!' };
    },
  },
  {
    id: 'tree-pose', name: 'Tree Pose', emoji: '🌳', category: 'yoga', muscles: ['Balance', 'Core', 'Legs'], difficulty: 'beginner',
    description: 'Single-leg balance pose',
    cues: ['Foot on inner thigh', 'Arms overhead', 'Fix gaze point'],
    detect: (kps, _prev) => {
      const armUp = (angle(kps[KP.L_HIP], kps[KP.L_SHOULDER], kps[KP.L_WRIST]) + angle(kps[KP.R_HIP], kps[KP.R_SHOULDER], kps[KP.R_WRIST])) / 2;
      const isHolding = armUp > 150;
      return { phase: isHolding ? 'down' : 'neutral', formScore: isHolding ? 1 : 0.5, feedback: isHolding ? 'Perfect balance! 🌳' : 'Arms overhead, one foot up!' };
    },
  },
  {
    id: 'downward-dog', name: 'Downward Dog', emoji: '🐕', category: 'yoga', muscles: ['Hamstrings', 'Shoulders', 'Calves'], difficulty: 'beginner',
    description: 'Inverted V yoga pose',
    cues: ['Hips high', 'Heels toward floor', 'Arms straight'],
    detect: (kps, _prev) => {
      const hipAngle = angle(kps[KP.L_WRIST], kps[KP.L_HIP], kps[KP.L_ANKLE]);
      const isHolding = hipAngle < 90;
      return { phase: isHolding ? 'down' : 'neutral', formScore: isHolding ? 1 : 0.4, feedback: isHolding ? 'Hold! Push hips up! 🐕' : 'Hips higher, inverted V!' };
    },
  },
  {
    id: 'standing-forward-fold', name: 'Forward Fold', emoji: '🙇', category: 'stretch', muscles: ['Hamstrings', 'Lower Back', 'Calves'], difficulty: 'beginner',
    description: 'Standing forward bend stretch',
    cues: ['Bend from hips', 'Straight legs', 'Relax head down'],
    detect: (kps, _prev) => {
      const hipAngle = angle(kps[KP.L_SHOULDER], kps[KP.L_HIP], kps[KP.L_KNEE]);
      const isHolding = hipAngle < 70;
      return { phase: isHolding ? 'down' : 'neutral', formScore: isHolding ? 1 : 0.5, feedback: isHolding ? 'Great flexibility! Hold!' : 'Fold forward from hips!' };
    },
  },
];

// ─── Categories ─────────────────────────────────────────
export const LIVE_CATEGORIES = {
  upper:      { label: 'Upper Body', emoji: '💪', color: '#e53935' },
  lower:      { label: 'Lower Body', emoji: '🦵', color: '#1e88e5' },
  core:       { label: 'Core', emoji: '🔥', color: '#fb8c00' },
  'full-body': { label: 'Full Body', emoji: '🏋️', color: '#7b1fa2' },
  cardio:     { label: 'Cardio', emoji: '🏃', color: '#00897b' },
  yoga:       { label: 'Yoga', emoji: '🧘', color: '#5c6bc0' },
  stretch:    { label: 'Stretch', emoji: '🙇', color: '#26a69a' },
} as const;

export type LiveCategory = keyof typeof LIVE_CATEGORIES;

// ─── Store ──────────────────────────────────────────────
export interface WorkoutSession {
  id: string;
  exerciseId: string;
  startedAt: string;
  endedAt: string | null;
  reps: number;
  durationSeconds: number;
  avgFormScore: number;
}

interface LiveWorkoutState {
  sessions: WorkoutSession[];
  totalReps: number;
  totalWorkoutSeconds: number;
  logSession: (session: Omit<WorkoutSession, 'id'>) => void;
}

export const useLiveWorkoutStore = create<LiveWorkoutState>()(
  persist(
    (set) => ({
      sessions: [],
      totalReps: 0,
      totalWorkoutSeconds: 0,
      logSession: (session) =>
        set((s) => {
          const newSession = { ...session, id: `s-${Date.now()}` };
          // Sync to backend
          syncWorkoutSession({
            name: session.exerciseId,
            startedAt: session.startedAt,
            endedAt: session.endedAt || undefined,
            reps: session.reps,
            durationSeconds: session.durationSeconds,
            avgFormScore: session.avgFormScore,
            source: 'live_camera',
            category: 'general',
          });
          return {
            sessions: [newSession, ...s.sessions].slice(0, 100),
            totalReps: s.totalReps + session.reps,
            totalWorkoutSeconds: s.totalWorkoutSeconds + session.durationSeconds,
          };
        }),
    }),
    { name: 'live-workout-store' },
  ),
);

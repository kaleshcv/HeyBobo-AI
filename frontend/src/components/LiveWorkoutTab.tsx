import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import toast from 'react-hot-toast';
import {
  LIVE_EXERCISES,
  LIVE_CATEGORIES,
  useLiveWorkoutStore,
  type LiveExercise,
  type LiveCategory,
  type ExercisePhase,
  type Keypoint,
  KP,
} from '@/store/liveWorkoutStore';

// ─── Skeleton drawing ───────────────────────────────────
const SKELETON_CONNECTIONS = [
  [KP.L_SHOULDER, KP.R_SHOULDER],
  [KP.L_SHOULDER, KP.L_ELBOW], [KP.L_ELBOW, KP.L_WRIST],
  [KP.R_SHOULDER, KP.R_ELBOW], [KP.R_ELBOW, KP.R_WRIST],
  [KP.L_SHOULDER, KP.L_HIP], [KP.R_SHOULDER, KP.R_HIP],
  [KP.L_HIP, KP.R_HIP],
  [KP.L_HIP, KP.L_KNEE], [KP.L_KNEE, KP.L_ANKLE],
  [KP.R_HIP, KP.R_KNEE], [KP.R_KNEE, KP.R_ANKLE],
];

function drawSkeleton(ctx: CanvasRenderingContext2D, keypoints: Keypoint[], width: number, height: number) {
  ctx.clearRect(0, 0, width, height);

  // Draw connections
  ctx.strokeStyle = '#00e676';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const [a, b] of SKELETON_CONNECTIONS) {
    const kpA = keypoints[a];
    const kpB = keypoints[b];
    if (kpA.score > 0.3 && kpB.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(kpA.x, kpA.y);
      ctx.lineTo(kpB.x, kpB.y);
      ctx.stroke();
    }
  }

  // Draw keypoints
  for (const kp of keypoints) {
    if (kp.score > 0.3) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = kp.score > 0.6 ? '#00e676' : '#ffab00';
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

// ─── Exercise Picker ────────────────────────────────────
function ExercisePicker({ onSelect }: { onSelect: (ex: LiveExercise) => void }) {
  const [filter, setFilter] = useState<LiveCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return LIVE_EXERCISES.filter((ex) => {
      if (filter !== 'all' && ex.category !== filter) return false;
      return true;
    });
  }, [filter]);

  const cats: (LiveCategory | 'all')[] = ['all', 'upper', 'lower', 'core', 'full-body', 'cardio', 'yoga', 'stretch'];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
        {cats.map((c) => {
          const isAll = c === 'all';
          const meta = isAll ? null : LIVE_CATEGORIES[c];
          const dk = useTheme().palette.mode === 'dark';
          return (
            <Chip
              key={c}
              label={isAll ? 'All' : `${meta!.emoji} ${meta!.label}`}
              size="small"
              onClick={() => setFilter(c)}
              variant={filter === c ? 'filled' : 'outlined'}
              sx={{
                fontWeight: filter === c ? 600 : 400,
                bgcolor: filter === c ? (isAll ? (dk ? '#1A2B3C' : '#424242') : `${meta!.color}18`) : 'transparent',
                color: filter === c ? (isAll ? '#fff' : meta!.color) : 'text.primary',
                borderColor: filter === c ? (isAll ? (dk ? '#1A2B3C' : '#424242') : meta!.color) : (dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd'),
                fontSize: 12,
              }}
            />
          );
        })}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 0.75 }}>
        {filtered.map((ex) => {
          const cat = LIVE_CATEGORIES[ex.category];
          return (
            <Paper
              key={ex.id}
              elevation={0}
              onClick={() => onSelect(ex)}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                transition: 'all 0.15s',
                '&:hover': { borderColor: cat.color, bgcolor: `${cat.color}06` },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: 20 }}>{ex.emoji}</Typography>
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: 13 }} noWrap>{ex.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.25, mt: 0.25 }}>
                    <Chip label={cat.label} size="small" sx={{ fontSize: 9, height: 16, bgcolor: `${cat.color}14`, color: cat.color, fontWeight: 600 }} />
                    <Chip label={ex.difficulty} size="small" sx={{ fontSize: 9, height: 16, textTransform: 'capitalize' }} />
                  </Box>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, mt: 0.5, display: 'block' }}>
                {ex.muscles.join(' · ')}
              </Typography>
            </Paper>
          );
        })}
      </Box>
      {filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2, fontSize: 13 }}>No exercises match your filter.</Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {filtered.length} of {LIVE_EXERCISES.length} exercises
      </Typography>
    </Box>
  );
}

// ─── Active Session View ────────────────────────────────
function ActiveSession({
  exercise,
  onEnd,
}: {
  exercise: LiveExercise;
  onEnd: (reps: number, duration: number, avgForm: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<ExercisePhase>('neutral');
  const [formScore, setFormScore] = useState(0);
  const [feedback, setFeedback] = useState('Get into position...');
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [formScores, setFormScores] = useState<number[]>([]);
  const prevPhaseRef = useRef<ExercisePhase>('neutral');

  // Timer
  useEffect(() => {
    if (paused || !cameraOn) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [paused, cameraOn]);

  const startCamera = useCallback(async () => {
    setLoading(true);
    try {
      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Load MoveNet
      const tf = await import('@tensorflow/tfjs');
      try {
        await import('@tensorflow/tfjs-backend-webgl');
        await tf.setBackend('webgl');
      } catch {
        // Fallback to CPU if WebGL unavailable
        await tf.setBackend('cpu');
      }
      await tf.ready();
      console.log('TF.js backend:', tf.getBackend());
      const poseDetection = await import('@tensorflow-models/pose-detection');
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        },
      );
      console.log('MoveNet detector created');
      detectorRef.current = detector;
      setCameraOn(true);
      startTimeRef.current = Date.now();
      setLoading(false);

      // Start detection loop
      const detectLoop = async () => {
        if (!videoRef.current || !canvasRef.current || !detectorRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx || video.readyState < 2) {
          animRef.current = requestAnimationFrame(detectLoop);
          return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const poses = await detectorRef.current.estimatePoses(video);
        if (poses.length > 0) {
          const keypoints: Keypoint[] = poses[0].keypoints.map((kp: any) => ({
            x: kp.x,
            y: kp.y,
            score: kp.score ?? 0,
          }));

          drawSkeleton(ctx, keypoints, canvas.width, canvas.height);

          // Detect exercise phase
          const result = exercise.detect(keypoints, prevPhaseRef.current);

          // Count reps on phase transition: down -> up
          if (prevPhaseRef.current === 'down' && result.phase === 'up') {
            setReps((r) => r + 1);
          }
          prevPhaseRef.current = result.phase;
          setPhase(result.phase);
          setFormScore(result.formScore);
          setFeedback(result.feedback);
          if (result.formScore > 0) {
            setFormScores((prev) => [...prev, result.formScore]);
          }
        } else {
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
          setFeedback('Move into camera view');
        }

        animRef.current = requestAnimationFrame(detectLoop);
      };

      detectLoop();
    } catch (err: any) {
      console.error('Camera/model error:', err);
      setLoading(false);
      toast.error(err?.message?.includes('permission') || err?.name === 'NotAllowedError'
        ? 'Camera access denied. Allow camera in browser settings.'
        : `Failed to load: ${err?.message || 'Unknown error'}`,
      );
    }
  }, [exercise]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (detectorRef.current) {
      detectorRef.current.dispose?.();
      detectorRef.current = null;
    }
    setCameraOn(false);
  }, []);

  const handleEnd = useCallback(() => {
    stopCamera();
    const avgForm = formScores.length > 0 ? formScores.reduce((a, b) => a + b, 0) / formScores.length : 0;
    onEnd(reps, elapsed, avgForm);
  }, [stopCamera, onEnd, reps, elapsed, formScores]);

  // Cleanup on unmount
  useEffect(() => () => { cancelAnimationFrame(animRef.current); stopCamera(); }, [stopCamera]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const cat = LIVE_CATEGORIES[exercise.category];

  const formColor = formScore > 0.7 ? '#4caf50' : formScore > 0.4 ? '#ff9800' : '#f44336';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography sx={{ fontSize: 24 }}>{exercise.emoji}</Typography>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{exercise.name}</Typography>
          <Typography variant="caption" color="text.secondary">{exercise.description}</Typography>
        </Box>
        <Chip label={cat.label} size="small" sx={{ bgcolor: `${cat.color}14`, color: cat.color, fontWeight: 600, fontSize: 11 }} />
      </Box>

      {/* Camera View */}
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: '#000', mb: 1, aspectRatio: '4/3', maxHeight: 420 }}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            pointerEvents: 'none',
          }}
        />

        {/* Overlay HUD */}
        {cameraOn && (
          <>
            {/* Rep counter - top left */}
            <Box sx={{
              position: 'absolute', top: 12, left: 12,
              bgcolor: 'rgba(0,0,0,0.7)', borderRadius: 2, px: 2, py: 0.75,
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 28, lineHeight: 1 }}>{reps}</Typography>
              <Typography sx={{ color: '#aaa', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Reps</Typography>
            </Box>

            {/* Timer - top right */}
            <Box sx={{
              position: 'absolute', top: 12, right: 12,
              bgcolor: 'rgba(0,0,0,0.7)', borderRadius: 2, px: 2, py: 0.75,
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: 'monospace' }}>{formatTime(elapsed)}</Typography>
            </Box>

            {/* Form score - bottom left */}
            <Box sx={{
              position: 'absolute', bottom: 12, left: 12,
              bgcolor: 'rgba(0,0,0,0.7)', borderRadius: 2, px: 1.5, py: 0.75, minWidth: 100,
            }}>
              <Typography sx={{ color: '#aaa', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>Form</Typography>
              <LinearProgress
                variant="determinate"
                value={formScore * 100}
                sx={{ mt: 0.25, height: 6, borderRadius: 3, bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: formColor } }}
              />
            </Box>

            {/* Feedback - bottom center */}
            <Box sx={{
              position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.75)', borderRadius: 2, px: 2, py: 0.5,
            }}>
              <Typography sx={{ color: '#00e676', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>{feedback}</Typography>
            </Box>

            {/* Phase indicator - bottom right */}
            <Box sx={{
              position: 'absolute', bottom: 12, right: 12,
              bgcolor: phase === 'down' ? 'rgba(255,152,0,0.8)' : phase === 'up' ? 'rgba(76,175,80,0.8)' : 'rgba(0,0,0,0.6)',
              borderRadius: 2, px: 1.5, py: 0.5,
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>{phase}</Typography>
            </Box>
          </>
        )}

        {/* Start overlay */}
        {!cameraOn && !loading && (
          <Box sx={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.85)',
          }}>
            <Typography sx={{ fontSize: 48, mb: 1 }}>{exercise.emoji}</Typography>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 18, mb: 0.5 }}>{exercise.name}</Typography>
            <Typography sx={{ color: '#aaa', fontSize: 12, mb: 2, maxWidth: 280, textAlign: 'center' }}>
              {exercise.cues.join(' • ')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<VideocamIcon />}
              onClick={startCamera}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#00e676', color: '#000', '&:hover': { bgcolor: '#00c853' }, px: 3 }}
            >
              Start Camera & Begin
            </Button>
          </Box>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.9)',
          }}>
            <Typography sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>Loading MoveNet model...</Typography>
            <LinearProgress sx={{ width: 200, borderRadius: 2, '& .MuiLinearProgress-bar': { bgcolor: '#00e676' } }} />
            <Typography sx={{ color: '#aaa', fontSize: 11, mt: 1 }}>This may take a few seconds on first load</Typography>
          </Box>
        )}
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {cameraOn && (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={paused ? <PlayArrowIcon /> : <PauseIcon />}
              onClick={() => setPaused(!paused)}
              sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 12 }}
            >
              {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={() => { setReps(0); setElapsed(0); setFormScores([]); startTimeRef.current = Date.now(); }}
              sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: 12 }}
            >
              Reset
            </Button>
          </>
        )}
        <Box sx={{ flex: 1 }} />
        {cameraOn && (
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleEnd}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600, fontSize: 12 }}
          >
            End Workout
          </Button>
        )}
      </Box>

      {/* Form cues */}
      {cameraOn && (
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {exercise.cues.map((cue, i) => (
            <Chip key={i} label={cue} size="small" variant="outlined" sx={{ fontSize: 10, height: 22 }} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Results Dialog ─────────────────────────────────────
function ResultsDialog({
  open,
  exercise,
  reps,
  duration,
  avgForm,
  onClose,
}: {
  open: boolean;
  exercise: LiveExercise | null;
  reps: number;
  duration: number;
  avgForm: number;
  onClose: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  if (!exercise) return null;
  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;
  const formPct = Math.round(avgForm * 100);
  const formColor = formPct > 70 ? '#4caf50' : formPct > 40 ? '#ff9800' : '#f44336';
  const formLabel = formPct > 70 ? 'Excellent' : formPct > 40 ? 'Good' : 'Needs work';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50', mb: 0.5, display: 'block', mx: 'auto' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Workout Complete!</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography sx={{ fontSize: 36 }}>{exercise.emoji}</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{exercise.name}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, my: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e88e5' }}>{reps}</Typography>
            <Typography variant="caption" color="text.secondary">Reps</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#7b1fa2' }}>{formatTime(duration)}</Typography>
            <Typography variant="caption" color="text.secondary">Duration</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: formColor }}>{formPct}%</Typography>
            <Typography variant="caption" color="text.secondary">Form ({formLabel})</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2.5 }}>
        <Button onClick={onClose} variant="contained" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: dk ? '#1A2B3C' : '#424242', '&:hover': { bgcolor: dk ? '#243B4F' : '#212121' }, px: 4 }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ═══════════════════ MAIN EXPORT ═════════════════════════
export default function LiveWorkoutTab() {
  const { logSession, sessions, totalReps } = useLiveWorkoutStore();
  const [selectedExercise, setSelectedExercise] = useState<LiveExercise | null>(null);
  const [result, setResult] = useState<{ exercise: LiveExercise; reps: number; duration: number; avgForm: number } | null>(null);

  const handleEnd = useCallback(
    (reps: number, duration: number, avgForm: number) => {
      if (selectedExercise) {
        logSession({
          exerciseId: selectedExercise.id,
          startedAt: new Date(Date.now() - duration * 1000).toISOString(),
          endedAt: new Date().toISOString(),
          reps,
          durationSeconds: duration,
          avgFormScore: avgForm,
        });
        setResult({ exercise: selectedExercise, reps, duration, avgForm });
        setSelectedExercise(null);
      }
    },
    [selectedExercise, logSession],
  );

  return (
    <Box>
      {!selectedExercise ? (
        <>
          {/* Stats bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap' }}>
            <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideocamIcon sx={{ fontSize: 18, color: '#00e676' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Sessions</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{sessions.length}</Typography>
              </Box>
            </Paper>
            <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <FitnessCenterIcon sx={{ fontSize: 18, color: '#1e88e5' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Total Reps</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{totalReps}</Typography>
              </Box>
            </Paper>
            <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1, minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block' }}>How it works</Typography>
              <Typography variant="caption" sx={{ fontSize: 11, color: 'text.primary' }}>
                Pick an exercise → turn on camera → MoveNet tracks your pose → reps are counted automatically
              </Typography>
            </Paper>
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Choose an Exercise</Typography>
          <ExercisePicker onSelect={(ex) => setSelectedExercise(ex)} />
        </>
      ) : (
        <>
          <Button
            size="small"
            onClick={() => setSelectedExercise(null)}
            sx={{ textTransform: 'none', mb: 1, fontSize: 12, color: 'text.secondary' }}
          >
            ← Back to exercises
          </Button>
          <ActiveSession exercise={selectedExercise} onEnd={handleEnd} />
        </>
      )}

      <ResultsDialog
        open={!!result}
        exercise={result?.exercise ?? null}
        reps={result?.reps ?? 0}
        duration={result?.duration ?? 0}
        avgForm={result?.avgForm ?? 0}
        onClose={() => setResult(null)}
      />
    </Box>
  );
}

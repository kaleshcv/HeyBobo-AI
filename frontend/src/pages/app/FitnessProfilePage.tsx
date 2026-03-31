import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Slider,
  TextField,
  Button,
  Avatar,
  LinearProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import SpeedIcon from '@mui/icons-material/Speed';
import HealingIcon from '@mui/icons-material/Healing';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HeightIcon from '@mui/icons-material/Height';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TimerIcon from '@mui/icons-material/Timer';
import {
  useFitnessProfileStore,
  calcBMI,
  bmiCategory,
  type FitnessGoal,
  type FitnessLevel,
  type ActivityLevel,
} from '@/store/fitnessProfileStore';

const GOALS: { id: FitnessGoal; label: string; icon: React.ReactElement; color: string }[] = [
  { id: 'weight-loss', label: 'Weight Loss', icon: <MonitorWeightIcon />, color: '#ef5350' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: <FitnessCenterIcon />, color: '#42a5f5' },
  { id: 'general-fitness', label: 'General Fitness', icon: <DirectionsRunIcon />, color: '#66bb6a' },
  { id: 'endurance', label: 'Endurance', icon: <SpeedIcon />, color: '#ffa726' },
  { id: 'rehab-mobility', label: 'Rehab / Mobility', icon: <HealingIcon />, color: '#ab47bc' },
];

const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; desc: string }[] = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { id: 'lightly-active', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { id: 'moderately-active', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  { id: 'very-active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { id: 'extremely-active', label: 'Extremely Active', desc: 'Intense daily exercise or physical job' },
];

const FITNESS_LEVELS: { id: FitnessLevel; label: string; desc: string; icon: React.ReactElement }[] = [
  { id: 'beginner', label: 'Beginner', desc: 'New to exercise or returning after a long break', icon: <AccessibilityNewIcon /> },
  { id: 'intermediate', label: 'Intermediate', desc: 'Regular exercise for 6+ months', icon: <SportsGymnasticsIcon /> },
  { id: 'advanced', label: 'Advanced', desc: 'Consistent training for 2+ years', icon: <FitnessCenterIcon /> },
];

// --- Onboarding Steps ---
const STEPS = ['Goals', 'Baseline', 'Level', 'Schedule'];

function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const { profile, setProfile, completeOnboarding } = useFitnessProfileStore();
  const [step, setStep] = useState(0);

  const bmi = useMemo(() => calcBMI(profile.heightCm, profile.weightKg), [profile.heightCm, profile.weightKg]);

  const canNext = () => {
    if (step === 0) return profile.goals.length > 0;
    if (step === 1) return profile.heightCm && profile.weightKg && profile.activityLevel;
    if (step === 2) return !!profile.fitnessLevel;
    return true;
  };

  const handleFinish = () => {
    completeOnboarding();
    onComplete();
  };

  const toggleGoal = (goal: FitnessGoal) => {
    const goals = profile.goals.includes(goal)
      ? profile.goals.filter((g) => g !== goal)
      : [...profile.goals, goal];
    setProfile({ goals });
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', py: 4, px: 2 }}>
      {/* Progress */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {STEPS.map((s, i) => (
            <Typography
              key={s}
              variant="caption"
              sx={{
                fontWeight: i <= step ? 700 : 400,
                color: i <= step ? 'text.primary' : 'text.disabled',
              }}
            >
              {s}
            </Typography>
          ))}
        </Box>
        <LinearProgress
          variant="determinate"
          value={((step + 1) / STEPS.length) * 100}
          sx={{ height: 6, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#e0e0e0', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: dk ? '#C9A84C' : '#424242' } }}
        />
      </Box>

      {/* Step 0: Goals */}
      {step === 0 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            What are your fitness goals?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select one or more goals to personalize your experience.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {GOALS.map((g) => {
              const selected = profile.goals.includes(g.id);
              return (
                <Chip
                  key={g.id}
                  icon={g.icon}
                  label={g.label}
                  clickable
                  onClick={() => toggleGoal(g.id)}
                  variant={selected ? 'filled' : 'outlined'}
                  sx={{
                    px: 1,
                    py: 2.5,
                    fontSize: 14,
                    fontWeight: selected ? 600 : 400,
                    borderColor: selected ? g.color : (dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd'),
                    bgcolor: selected ? `${g.color}14` : 'transparent',
                    color: selected ? g.color : 'text.primary',
                    '& .MuiChip-icon': { color: selected ? g.color : 'text.secondary' },
                    '&:hover': { bgcolor: `${g.color}0a` },
                  }}
                />
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Step 1: Baseline Data */}
      {step === 1 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Your baseline measurements
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This helps us calculate your BMI and tailor recommendations.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Height (cm)"
              type="number"
              value={profile.heightCm ?? ''}
              onChange={(e) => setProfile({ heightCm: e.target.value ? Number(e.target.value) : null })}
              size="small"
              fullWidth
              inputProps={{ min: 50, max: 300 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Weight (kg)"
              type="number"
              value={profile.weightKg ?? ''}
              onChange={(e) => setProfile({ weightKg: e.target.value ? Number(e.target.value) : null })}
              size="small"
              fullWidth
              inputProps={{ min: 20, max: 500 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          {/* BMI Display */}
          {bmi && (
            <Alert
              severity={bmi < 18.5 || bmi >= 30 ? 'warning' : bmi < 25 ? 'success' : 'info'}
              icon={<HeightIcon />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                BMI: {bmi} — {bmiCategory(bmi)}
              </Typography>
            </Alert>
          )}

          {/* Activity Level */}
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Activity Level
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            {ACTIVITY_LEVELS.map((al) => {
              const selected = profile.activityLevel === al.id;
              return (
                <Paper
                  key={al.id}
                  elevation={0}
                  onClick={() => setProfile({ activityLevel: al.id })}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: selected ? (dk ? '#C9A84C' : '#424242') : 'divider',
                    bgcolor: selected ? (dk ? 'rgba(255,255,255,0.03)' : '#fafafa') : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: dk ? 'rgba(255,255,255,0.3)' : '#9e9e9e' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: selected ? 600 : 400 }}>
                    {al.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {al.desc}
                  </Typography>
                </Paper>
              );
            })}
          </Box>

          {/* Injuries */}
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Injuries / Restrictions (optional)
          </Typography>
          <TextField
            placeholder="E.g., lower back pain, knee injury, shoulder impingement..."
            value={profile.injuries}
            onChange={(e) => setProfile({ injuries: e.target.value })}
            size="small"
            fullWidth
            multiline
            rows={2}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Paper>
      )}

      {/* Step 2: Fitness Level */}
      {step === 2 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            What's your fitness level?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Be honest — this helps us set the right intensity.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {FITNESS_LEVELS.map((fl) => {
              const selected = profile.fitnessLevel === fl.id;
              return (
                <Paper
                  key={fl.id}
                  elevation={0}
                  onClick={() => setProfile({ fitnessLevel: fl.id })}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: selected ? (dk ? '#C9A84C' : '#424242') : 'divider',
                    bgcolor: selected ? (dk ? 'rgba(255,255,255,0.03)' : '#fafafa') : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: dk ? 'rgba(255,255,255,0.3)' : '#9e9e9e' },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: selected ? (dk ? '#C9A84C' : '#424242') : (dk ? 'rgba(255,255,255,0.08)' : '#eeeeee'),
                      color: selected ? '#fff' : (dk ? '#aaa' : '#757575'),
                      width: 44,
                      height: 44,
                    }}
                  >
                    {fl.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {fl.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fl.desc}
                    </Typography>
                  </Box>
                  {selected && <CheckCircleIcon sx={{ ml: 'auto', color: dk ? '#C9A84C' : '#424242' }} />}
                </Paper>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Step 3: Time Availability */}
      {step === 3 && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            How much time can you commit?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            We'll build your plan around your schedule.
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarMonthIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Days per week
              </Typography>
              <Chip label={`${profile.daysPerWeek} days`} size="small" sx={{ ml: 'auto' }} />
            </Box>
            <Slider
              value={profile.daysPerWeek}
              onChange={(_, v) => setProfile({ daysPerWeek: v as number })}
              min={1}
              max={7}
              step={1}
              marks={[
                { value: 1, label: '1' },
                { value: 3, label: '3' },
                { value: 5, label: '5' },
                { value: 7, label: '7' },
              ]}
              sx={{
                color: dk ? '#C9A84C' : '#424242',
                '& .MuiSlider-markLabel': { fontSize: 12 },
              }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TimerIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Minutes per session
              </Typography>
              <Chip label={`${profile.minutesPerDay} min`} size="small" sx={{ ml: 'auto' }} />
            </Box>
            <Slider
              value={profile.minutesPerDay}
              onChange={(_, v) => setProfile({ minutesPerDay: v as number })}
              min={10}
              max={120}
              step={5}
              marks={[
                { value: 15, label: '15m' },
                { value: 30, label: '30m' },
                { value: 60, label: '60m' },
                { value: 90, label: '90m' },
                { value: 120, label: '120m' },
              ]}
              sx={{
                color: dk ? '#C9A84C' : '#424242',
                '& .MuiSlider-markLabel': { fontSize: 12 },
              }}
            />
          </Box>

          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>{profile.daysPerWeek} days × {profile.minutesPerDay} min</strong> ={' '}
              {profile.daysPerWeek * profile.minutesPerDay} minutes per week
            </Typography>
          </Alert>
        </Paper>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
          sx={{ borderRadius: 2, textTransform: 'none', borderColor: dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd', color: 'text.primary' }}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            variant="contained"
            disabled={!canNext()}
            onClick={() => setStep(step + 1)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: dk ? '#1A2B3C' : '#424242',
              '&:hover': { bgcolor: dk ? '#243B4F' : '#212121' },
            }}
          >
            Continue
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleFinish}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#2e7d32',
              '&:hover': { bgcolor: '#1b5e20' },
            }}
          >
            Complete Setup ✓
          </Button>
        )}
      </Box>
    </Box>
  );
}

// --- Profile Summary (shown after onboarding) ---
function ProfileSummary({ onEdit }: { onEdit: () => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const { profile, resetProfile } = useFitnessProfileStore();
  const bmi = useMemo(() => calcBMI(profile.heightCm, profile.weightKg), [profile.heightCm, profile.weightKg]);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 4, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#10b98120', color: '#10b981', width: 44, height: 44 }}>
            <SelfImprovementIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Health Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your personalized fitness setup
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit profile">
            <IconButton onClick={onEdit} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset profile">
            <IconButton onClick={resetProfile} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Goals */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
          Fitness Goals
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {profile.goals.map((gId) => {
            const g = GOALS.find((x) => x.id === gId)!;
            return (
              <Chip
                key={gId}
                icon={g.icon}
                label={g.label}
                sx={{
                  px: 0.5,
                  fontWeight: 600,
                  borderColor: g.color,
                  bgcolor: `${g.color}14`,
                  color: g.color,
                  '& .MuiChip-icon': { color: g.color },
                }}
                variant="outlined"
              />
            );
          })}
        </Box>
      </Paper>

      {/* Baseline & Level Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {/* Baseline */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', flex: 1, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
            Body Metrics
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Height</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile.heightCm} cm</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Weight</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile.weightKg} kg</Typography>
            </Box>
            {bmi && (
              <Box>
                <Typography variant="caption" color="text.secondary">BMI</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{bmi}</Typography>
                <Typography variant="caption" color="text.secondary">{bmiCategory(bmi)}</Typography>
              </Box>
            )}
          </Box>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" color="text.secondary">Activity Level</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {ACTIVITY_LEVELS.find((a) => a.id === profile.activityLevel)?.label ?? '—'}
          </Typography>
          {profile.injuries && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">Injuries / Restrictions</Typography>
              <Typography variant="body2">{profile.injuries}</Typography>
            </>
          )}
        </Paper>

        {/* Fitness Level + Schedule */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 200 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
              Fitness Level
            </Typography>
            {(() => {
              const fl = FITNESS_LEVELS.find((f) => f.id === profile.fitnessLevel);
              if (!fl) return <Typography color="text.secondary">—</Typography>;
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: dk ? '#C9A84C' : '#424242', width: 36, height: 36 }}>{fl.icon}</Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{fl.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{fl.desc}</Typography>
                  </Box>
                </Box>
              );
            })()}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
              Weekly Commitment
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Days/week</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile.daysPerWeek}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Min/session</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile.minutesPerDay}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total/week</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{profile.daysPerWeek * profile.minutesPerDay}m</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

// --- Main Page ---
export default function FitnessProfilePage() {
  const { isOnboarded } = useFitnessProfileStore();
  const [editing, setEditing] = useState(false);

  if (!isOnboarded || editing) {
    return <OnboardingWizard onComplete={() => setEditing(false)} />;
  }

  return <ProfileSummary onEdit={() => setEditing(true)} />;
}

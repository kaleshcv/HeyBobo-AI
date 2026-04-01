import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Avatar,
  Alert,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RouteIcon from '@mui/icons-material/Route';
import TimerIcon from '@mui/icons-material/Timer';
import StairsIcon from '@mui/icons-material/Stairs';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncIcon from '@mui/icons-material/Sync';
import WatchIcon from '@mui/icons-material/Watch';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  useActivityTrackingStore,
  WORKOUT_TYPES,
  type WorkoutType,
  type SyncDevice,
} from '@/store/activityTrackingStore';
import toast from 'react-hot-toast';

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDate(ds: string): string {
  const d = new Date(ds + 'T12:00:00');
  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));
  if (ds === today) return 'Today';
  if (ds === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function shortDay(ds: string): string {
  return new Date(ds + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}

// ─── Daily Metric Card ──────────────────────────────────
function MetricCard({
  icon,
  label,
  value,
  unit,
  goal,
  color,
  onEdit,
}: {
  icon: React.ReactElement;
  label: string;
  value: number;
  unit: string;
  goal: number;
  color: string;
  onEdit: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const achieved = pct >= 100;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: achieved ? `${color}40` : 'divider',
        bgcolor: achieved ? `${color}08` : 'background.paper',
        minWidth: 140,
        flex: 1,
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Avatar sx={{ bgcolor: `${color}18`, width: 32, height: 32 }}>
          {<Box sx={{ color, display: 'flex', fontSize: 18 }}>{icon}</Box>}
        </Avatar>
        {achieved && <CheckCircleIcon sx={{ fontSize: 16, color }} />}
        <Tooltip title={`Edit ${label.toLowerCase()}`}>
          <IconButton size="small" onClick={onEdit} sx={{ ml: 'auto' }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {value.toLocaleString()}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {unit} · {goal.toLocaleString()} goal
      </Typography>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          mt: 1,
          height: 4,
          borderRadius: 2,
          bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#e0e0e0',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
        }}
      />
    </Paper>
  );
}

// ─── Weekly Mini Bar Chart ──────────────────────────────
function WeeklyChart({ selectedDate }: { selectedDate: string }) {
  const dk = useTheme().palette.mode === 'dark';
  const { getWeeklyMetrics, goals } = useActivityTrackingStore();
  const week = useMemo(() => getWeeklyMetrics(selectedDate), [selectedDate, getWeeklyMetrics]);

  const maxSteps = Math.max(goals.steps, ...week.map((d) => d.steps));

  return (
    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        Weekly Steps
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 100 }}>
        {week.map((d) => {
          const h = maxSteps > 0 ? (d.steps / maxSteps) * 100 : 0;
          const isToday = d.date === toDateStr(new Date());
          const hitGoal = d.steps >= goals.steps;
          return (
            <Tooltip key={d.date} title={`${d.steps.toLocaleString()} steps`}>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 32,
                    height: `${Math.max(h, 4)}%`,
                    bgcolor: hitGoal ? '#4caf50' : isToday ? (dk ? '#C9A84C' : '#424242') : (dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd'),
                    borderRadius: 1,
                    transition: 'height 0.3s',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10,
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {shortDay(d.date)}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}

// ─── Edit Metric Dialog ─────────────────────────────────
function EditMetricDialog({
  open,
  label,
  value,
  onSave,
  onClose,
}: {
  open: boolean;
  label: string;
  value: number;
  onSave: (v: number) => void;
  onClose: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  const [val, setVal] = useState(String(value));

  const handleSave = () => {
    const n = Number(val);
    if (!isNaN(n) && n >= 0) {
      onSave(n);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Edit {label}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          fullWidth
          size="small"
          inputProps={{ min: 0 }}
          sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} sx={{ textTransform: 'none', bgcolor: dk ? '#1A2B3C' : '#424242', '&:hover': { bgcolor: dk ? '#243B4F' : '#212121' } }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Log Workout Dialog ─────────────────────────────────
function LogWorkoutDialog({
  open,
  date,
  onClose,
}: {
  open: boolean;
  date: string;
  onClose: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  const { addWorkout } = useActivityTrackingStore();
  const [type, setType] = useState<WorkoutType>('running');
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('200');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    const wt = WORKOUT_TYPES.find((w) => w.id === type);
    addWorkout({
      date,
      type,
      name: name || wt?.label || 'Workout',
      durationMinutes: Math.max(1, Number(duration) || 1),
      caloriesBurned: Math.max(0, Number(calories) || 0),
      notes,
    });
    toast.success('Workout logged!');
    onClose();
    // Reset
    setType('running');
    setName('');
    setDuration('30');
    setCalories('200');
    setNotes('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Log Workout</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Workout Type picker */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Workout Type
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {WORKOUT_TYPES.map((w) => (
                <Chip
                  key={w.id}
                  label={`${w.emoji} ${w.label}`}
                  clickable
                  onClick={() => setType(w.id)}
                  variant={type === w.id ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: type === w.id ? 600 : 400,
                    bgcolor: type === w.id ? (dk ? '#C9A84C' : '#424242') : 'transparent',
                    color: type === w.id ? (dk ? '#0D1B2A' : '#fff') : 'text.primary',
                    borderColor: type === w.id ? (dk ? '#C9A84C' : '#424242') : 'divider',
                    '&:hover': { bgcolor: type === w.id ? undefined : 'action.hover' },
                  }}
                />
              ))}
            </Box>
          </Box>
          <TextField
            label="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            fullWidth
            placeholder={WORKOUT_TYPES.find((w) => w.id === type)?.label}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Duration (min)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ min: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Calories burned"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="small"
            fullWidth
            multiline
            rows={2}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ textTransform: 'none', fontWeight: 600, bgcolor: dk ? '#1A2B3C' : '#424242', '&:hover': { bgcolor: dk ? '#243B4F' : '#212121' } }}
        >
          Log Workout
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Log Custom Activity Dialog ─────────────────────────
function LogCustomActivityDialog({
  open,
  date,
  onClose,
}: {
  open: boolean;
  date: string;
  onClose: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  const { addCustomActivity } = useActivityTrackingStore();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('15');
  const [calories, setCalories] = useState('50');

  const handleSave = () => {
    if (!name.trim()) return;
    addCustomActivity({
      date,
      name: name.trim(),
      durationMinutes: Math.max(1, Number(duration) || 1),
      caloriesBurned: Math.max(0, Number(calories) || 0),
    });
    toast.success('Activity logged!');
    onClose();
    setName('');
    setDuration('15');
    setCalories('50');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Log Custom Activity</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Activity name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            fullWidth
            placeholder="E.g., Gardening, House cleaning..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Duration (min)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ min: 1 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim()}
          sx={{ textTransform: 'none', fontWeight: 600, bgcolor: dk ? '#1A2B3C' : '#424242', '&:hover': { bgcolor: dk ? '#243B4F' : '#212121' } }}
        >
          Log Activity
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Device Card ────────────────────────────────────────
const DEVICE_META: Record<SyncDevice, { label: string; icon: React.ReactElement; desc: string }> = {
  'smart-watch': { label: 'Smart Watch', icon: <WatchIcon />, desc: 'Apple Watch, Garmin, Fitbit, etc.' },
  'smart-ring': { label: 'Smart Ring', icon: <BluetoothIcon />, desc: 'Oura Ring, RingConn, etc.' },
  'phone-sensors': { label: 'Phone Sensors', icon: <PhoneAndroidIcon />, desc: 'Built-in accelerometer & GPS' },
};

function DeviceCard({ deviceType }: { deviceType: SyncDevice }) {
  const dk = useTheme().palette.mode === 'dark';
  const { connectedDevices, connectDevice, disconnectDevice, syncDevice } = useActivityTrackingStore();
  const device = connectedDevices.find((d) => d.type === deviceType);
  const meta = DEVICE_META[deviceType];
  const connected = !!device?.isActive;

  const handleConnect = () => {
    connectDevice(deviceType, meta.label);
    toast.success(`${meta.label} connected!`);
  };

  const handleSync = () => {
    syncDevice(deviceType);
    toast.success(`Synced ${meta.label} data!`);
  };

  const handleDisconnect = () => {
    disconnectDevice(deviceType);
    toast.success(`${meta.label} disconnected`);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: connected ? '#4caf5040' : 'divider',
        bgcolor: connected ? '#4caf5008' : 'background.paper',
        flex: 1,
        minWidth: 180,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Avatar
          sx={{
            bgcolor: connected ? '#4caf5018' : (dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5'),
            color: connected ? '#4caf50' : '#757575',
            width: 36,
            height: 36,
          }}
        >
          {meta.icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {meta.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {connected ? 'Connected' : meta.desc}
          </Typography>
        </Box>
      </Box>
      {connected && device && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Last synced: {new Date(device.lastSyncedAt).toLocaleTimeString()}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {connected ? (
          <>
            <Button
              size="small"
              startIcon={<SyncIcon />}
              onClick={handleSync}
              sx={{ textTransform: 'none', fontSize: 12, borderRadius: 1.5, flex: 1, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }}
            >
              Sync
            </Button>
            <Tooltip title="Disconnect">
              <IconButton size="small" onClick={handleDisconnect} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <LinkOffIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Button
            size="small"
            variant="outlined"
            onClick={handleConnect}
            sx={{
              textTransform: 'none',
              fontSize: 12,
              borderRadius: 1.5,
              flex: 1,
              borderColor: 'divider',
            }}
          >
            Connect
          </Button>
        )}
      </Box>
    </Paper>
  );
}

// ═══════════════════ MAIN PAGE ═══════════════════════════
export default function ActivityTrackingPage() {
  const dk = useTheme().palette.mode === 'dark';
  const {
    getDailyMetrics,
    updateDailyMetrics,
    workouts,
    customActivities,
    removeWorkout,
    removeCustomActivity,
    goals,
  } = useActivityTrackingStore();

  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const metrics = useMemo(() => getDailyMetrics(selectedDate), [selectedDate, getDailyMetrics]);

  // Dialogs
  const [editMetric, setEditMetric] = useState<{ label: string; field: string; value: number } | null>(null);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  // Tab state
  const [tab, setTab] = useState(0);

  const navigateDay = (offset: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(toDateStr(d));
  };

  const handleMetricSave = (value: number) => {
    if (editMetric) {
      updateDailyMetrics(selectedDate, { [editMetric.field]: value });
    }
  };

  // Filtered logs for selected date
  const dayWorkouts = workouts.filter((w) => w.date === selectedDate);
  const dayActivities = customActivities.filter((a) => a.date === selectedDate);

  return (
    <Box sx={{ maxWidth: { xs: '100%', md: 1200, lg: 1440 }, mx: 'auto', px: { xs: 2.5, md: 4, lg: 5 }, py: 3 }}>
      {/* Header + Date Nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DirectionsWalkIcon sx={{ fontSize: 22, color: '#10b981' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Activity Tracking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={() => navigateDay(-1)}>
            <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
          </IconButton>
          <Chip label={formatDate(selectedDate)} sx={{ fontWeight: 600, minWidth: 100 }} />
          <IconButton
            size="small"
            onClick={() => navigateDay(1)}
            disabled={selectedDate >= toDateStr(new Date())}
          >
            <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <MetricCard
          icon={<DirectionsWalkIcon sx={{ fontSize: 18, color: '#10b981' }} />}
          label="Steps"
          value={metrics.steps}
          unit="steps"
          goal={goals.steps}
          color="#42a5f5"
          onEdit={() => setEditMetric({ label: 'Steps', field: 'steps', value: metrics.steps })}
        />
        <MetricCard
          icon={<RouteIcon sx={{ fontSize: 18, color: '#38bdf8' }} />}
          label="Distance"
          value={metrics.distanceKm}
          unit="km"
          goal={goals.distanceKm}
          color="#66bb6a"
          onEdit={() => setEditMetric({ label: 'Distance (km)', field: 'distanceKm', value: metrics.distanceKm })}
        />
        <MetricCard
          icon={<LocalFireDepartmentIcon sx={{ fontSize: 18, color: '#f43f5e' }} />}
          label="Calories"
          value={metrics.caloriesBurned}
          unit="kcal"
          goal={goals.caloriesBurned}
          color="#ef5350"
          onEdit={() => setEditMetric({ label: 'Calories Burned', field: 'caloriesBurned', value: metrics.caloriesBurned })}
        />
        <MetricCard
          icon={<TimerIcon sx={{ fontSize: 18, color: '#a78bfa' }} />}
          label="Active Min"
          value={metrics.activeMinutes}
          unit="min"
          goal={goals.activeMinutes}
          color="#ffa726"
          onEdit={() => setEditMetric({ label: 'Active Minutes', field: 'activeMinutes', value: metrics.activeMinutes })}
        />
        <MetricCard
          icon={<StairsIcon sx={{ fontSize: 18, color: '#ec4899' }} />}
          label="Floors"
          value={metrics.floorsClimbed}
          unit="floors"
          goal={goals.floorsClimbed}
          color="#ab47bc"
          onEdit={() => setEditMetric({ label: 'Floors Climbed', field: 'floorsClimbed', value: metrics.floorsClimbed })}
        />
      </Box>

      {/* Weekly Chart */}
      <Box sx={{ mb: 3 }}>
        <WeeklyChart selectedDate={selectedDate} />
      </Box>

      {/* Tabs: Manual Entry / Auto Sync */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 14 },
          }}
        >
          <Tab icon={<FitnessCenterIcon sx={{ fontSize: 16, color: '#10b981' }} />} iconPosition="start" label="Manual Entry" />
          <Tab icon={<SyncIcon sx={{ fontSize: 16, color: '#38bdf8' }} />} iconPosition="start" label="Auto Sync" />
        </Tabs>

        {/* ── Manual Entry Tab ──────────────────── */}
        {tab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<FitnessCenterIcon />}
                onClick={() => setWorkoutDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: dk ? '#1A2B3C' : '#424242',
                  '&:hover': { bgcolor: dk ? '#243B4F' : '#212121' },
                }}
              >
                Log Workout
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setCustomDialogOpen(true)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                  borderColor: 'divider',
                }}
              >
                Custom Activity
              </Button>
            </Box>

            {/* Workout Logs */}
            {dayWorkouts.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                  Workouts
                </Typography>
                {dayWorkouts.map((w) => {
                  const wt = WORKOUT_TYPES.find((x) => x.id === w.type);
                  return (
                    <Paper
                      key={w.id}
                      elevation={0}
                      sx={{ p: 1.5, mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Typography sx={{ fontSize: 22 }}>{wt?.emoji ?? '🎯'}</Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{w.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {w.durationMinutes} min · {w.caloriesBurned} kcal
                          {w.notes && ` · ${w.notes}`}
                        </Typography>
                      </Box>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => removeWorkout(w.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  );
                })}
              </Box>
            )}

            {/* Custom Activities */}
            {dayActivities.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                  Custom Activities
                </Typography>
                {dayActivities.map((a) => (
                  <Paper
                    key={a.id}
                    elevation={0}
                    sx={{ p: 1.5, mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}
                  >
                    <Typography sx={{ fontSize: 22 }}>🎯</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{a.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {a.durationMinutes} min · {a.caloriesBurned} kcal
                      </Typography>
                    </Box>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => removeCustomActivity(a.id)}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Box>
            )}

            {dayWorkouts.length === 0 && dayActivities.length === 0 && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No workouts or activities logged for {formatDate(selectedDate)}. Use the buttons above to log one!
              </Alert>
            )}
          </Box>
        )}

        {/* ── Auto Sync Tab ─────────────────────── */}
        {tab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Connect your devices to automatically sync activity data.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <DeviceCard deviceType="smart-watch" />
              <DeviceCard deviceType="smart-ring" />
              <DeviceCard deviceType="phone-sensors" />
            </Box>
          </Box>
        )}
      </Paper>

      {/* Dialogs */}
      {editMetric && (
        <EditMetricDialog
          open
          label={editMetric.label}
          value={editMetric.value}
          onSave={handleMetricSave}
          onClose={() => setEditMetric(null)}
        />
      )}
      <LogWorkoutDialog open={workoutDialogOpen} date={selectedDate} onClose={() => setWorkoutDialogOpen(false)} />
      <LogCustomActivityDialog open={customDialogOpen} date={selectedDate} onClose={() => setCustomDialogOpen(false)} />
    </Box>
  );
}

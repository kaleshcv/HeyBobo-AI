import { useState, useMemo, useRef } from 'react';
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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import HealingIcon from '@mui/icons-material/Healing';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ShieldIcon from '@mui/icons-material/Shield';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import SendIcon from '@mui/icons-material/Send';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  useInjuryStore,
  DIET_RECOMMENDATIONS,
  PREVENTION_TIPS,
  SYMPTOM_INJURY_MAP,
  WORKOUT_ADAPTATION_SUGGESTIONS,
  type Injury,
  type InjuryType,
  type BodyPart,
  type Severity,
  type InjuryStatus,
} from '@/store/injuryStore';
import { aiApi } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Helpers ────────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

const SEVERITY_COLOR: Record<Severity, string> = { mild: 'success', moderate: 'warning', severe: 'error' } as const;

const BODY_PARTS: BodyPart[] = [
  'head', 'neck', 'shoulder-left', 'shoulder-right', 'upper-back', 'lower-back', 'chest',
  'elbow-left', 'elbow-right', 'wrist-left', 'wrist-right', 'hip-left', 'hip-right',
  'knee-left', 'knee-right', 'ankle-left', 'ankle-right', 'foot-left', 'foot-right',
  'abdomen', 'hamstring-left', 'hamstring-right', 'calf-left', 'calf-right',
];

const INJURY_TYPES: InjuryType[] = [
  'muscle-strain', 'ligament-sprain', 'fracture', 'joint-pain', 'tendinitis',
  'bruise', 'nerve-pain', 'posture-related', 'overuse', 'other',
];

const fmt = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Body Map (SVG) ─────────────────────────────────────────────────────────────
const BODY_MAP_REGIONS: { id: BodyPart; label: string; cx: number; cy: number; r: number }[] = [
  { id: 'head', label: 'Head', cx: 100, cy: 30, r: 20 },
  { id: 'neck', label: 'Neck', cx: 100, cy: 58, r: 10 },
  { id: 'shoulder-left', label: 'L Shoulder', cx: 62, cy: 80, r: 14 },
  { id: 'shoulder-right', label: 'R Shoulder', cx: 138, cy: 80, r: 14 },
  { id: 'chest', label: 'Chest', cx: 100, cy: 100, r: 16 },
  { id: 'upper-back', label: 'Upper Back', cx: 100, cy: 115, r: 14 },
  { id: 'elbow-left', label: 'L Elbow', cx: 48, cy: 120, r: 11 },
  { id: 'elbow-right', label: 'R Elbow', cx: 152, cy: 120, r: 11 },
  { id: 'abdomen', label: 'Abdomen', cx: 100, cy: 140, r: 16 },
  { id: 'lower-back', label: 'Lower Back', cx: 100, cy: 160, r: 14 },
  { id: 'wrist-left', label: 'L Wrist', cx: 38, cy: 155, r: 10 },
  { id: 'wrist-right', label: 'R Wrist', cx: 162, cy: 155, r: 10 },
  { id: 'hip-left', label: 'L Hip', cx: 72, cy: 185, r: 14 },
  { id: 'hip-right', label: 'R Hip', cx: 128, cy: 185, r: 14 },
  { id: 'hamstring-left', label: 'L Hamstring', cx: 72, cy: 225, r: 14 },
  { id: 'hamstring-right', label: 'R Hamstring', cx: 128, cy: 225, r: 14 },
  { id: 'knee-left', label: 'L Knee', cx: 72, cy: 260, r: 14 },
  { id: 'knee-right', label: 'R Knee', cx: 128, cy: 260, r: 14 },
  { id: 'calf-left', label: 'L Calf', cx: 72, cy: 295, r: 12 },
  { id: 'calf-right', label: 'R Calf', cx: 128, cy: 295, r: 12 },
  { id: 'ankle-left', label: 'L Ankle', cx: 72, cy: 325, r: 10 },
  { id: 'ankle-right', label: 'R Ankle', cx: 128, cy: 325, r: 10 },
  { id: 'foot-left', label: 'L Foot', cx: 72, cy: 350, r: 10 },
  { id: 'foot-right', label: 'R Foot', cx: 128, cy: 350, r: 10 },
];

function BodyMap({ activeInjuries, onSelectPart }: { activeInjuries: Injury[]; onSelectPart: (part: BodyPart) => void }) {
  const injuredParts = new Set(activeInjuries.map((i) => i.bodyPart));
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="200" height="370" viewBox="0 0 200 370" style={{ maxWidth: '100%' }}>
        {/* Simple body outline */}
        <ellipse cx="100" cy="30" rx="18" ry="22" fill="none" stroke="#90caf9" strokeWidth="1.5" />
        <rect x="70" y="65" width="60" height="100" rx="8" fill="none" stroke="#90caf9" strokeWidth="1.5" />
        <rect x="70" y="175" width="60" height="60" rx="6" fill="none" stroke="#90caf9" strokeWidth="1.5" />
        {/* Arms */}
        <rect x="36" y="70" width="34" height="100" rx="12" fill="none" stroke="#90caf9" strokeWidth="1.5" />
        <rect x="130" y="70" width="34" height="100" rx="12" fill="none" stroke="#90caf9" strokeWidth="1.5" />
        {/* Legs */}
        <rect x="56" y="235" width="34" height="130" rx="12" fill="none" stroke="#90caf9" strokeWidth="1.5" />
        <rect x="110" y="235" width="34" height="130" rx="12" fill="none" stroke="#90caf9" strokeWidth="1.5" />

        {BODY_MAP_REGIONS.map((region) => {
          const isInjured = injuredParts.has(region.id);
          const isHovered = hovered === region.id;
          return (
            <g key={region.id} style={{ cursor: 'pointer' }}
              onClick={() => onSelectPart(region.id)}
              onMouseEnter={() => setHovered(region.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                cx={region.cx} cy={region.cy} r={region.r}
                fill={isInjured ? 'rgba(244,67,54,0.4)' : isHovered ? 'rgba(33,150,243,0.3)' : 'transparent'}
                stroke={isInjured ? '#f44336' : isHovered ? '#2196f3' : 'transparent'}
                strokeWidth="1.5"
              />
              {isInjured && (
                <text x={region.cx} y={region.cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10">⚠</text>
              )}
            </g>
          );
        })}
      </svg>
    </Box>
  );
}

// ─── Log Injury Dialog ─────────────────────────────────────────────────────────
function LogInjuryDialog({ open, onClose, defaultBodyPart }: { open: boolean; onClose: () => void; defaultBodyPart?: BodyPart }) {
  const logInjury = useInjuryStore((s) => s.logInjury);
  const [form, setForm] = useState({
    name: '',
    type: 'muscle-strain' as InjuryType,
    bodyPart: defaultBodyPart ?? 'lower-back' as BodyPart,
    severity: 'mild' as Severity,
    painScale: 3,
    dateOfOccurrence: new Date().toISOString().slice(0, 10),
    cause: '',
    status: 'active' as InjuryStatus,
    notes: '',
  });

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error('Injury name is required'); return; }
    logInjury(form);
    toast.success('Injury logged successfully');
    onClose();
    setForm({ name: '', type: 'muscle-strain', bodyPart: 'lower-back', severity: 'mild', painScale: 3, dateOfOccurrence: new Date().toISOString().slice(0, 10), cause: '', status: 'active', notes: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HealingIcon color="error" /> Log New Injury
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Injury Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as InjuryType })}>
                {INJURY_TYPES.map((t) => <MenuItem key={t} value={t}>{fmt(t)}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Body Part</InputLabel>
              <Select label="Body Part" value={form.bodyPart} onChange={(e) => setForm({ ...form, bodyPart: e.target.value as BodyPart })}>
                {BODY_PARTS.map((p) => <MenuItem key={p} value={p}>{fmt(p)}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}>
                <MenuItem value="mild">Mild</MenuItem>
                <MenuItem value="moderate">Moderate</MenuItem>
                <MenuItem value="severe">Severe</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Date of Occurrence" type="date" value={form.dateOfOccurrence}
              onChange={(e) => setForm({ ...form, dateOfOccurrence: e.target.value })}
              fullWidth InputLabelProps={{ shrink: true }} />
          </Box>

          <Box>
            <Typography variant="body2" gutterBottom>Pain Scale: <strong>{form.painScale}/10</strong></Typography>
            <Slider value={form.painScale} onChange={(_, v) => setForm({ ...form, painScale: v as number })}
              min={1} max={10} marks step={1}
              sx={{ color: form.painScale >= 7 ? 'error.main' : form.painScale >= 4 ? 'warning.main' : 'success.main' }}
            />
          </Box>

          <TextField label="What caused it?" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} fullWidth multiline rows={2} />
          <TextField label="Additional Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth multiline rows={2} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleSubmit}>Log Injury</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function InjuryPage() {
  const [tab, setTab] = useState(0);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [bodyMapSelected, setBodyMapSelected] = useState<BodyPart | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomResult, setSymptomResult] = useState<{ probable: string; caveat: string } | null>(null);
  const [docUploadOpen, setDocUploadOpen] = useState(false);
  const [consultDialogOpen, setConsultDialogOpen] = useState(false);
  const [painLogOpen, setPainLogOpen] = useState(false);
  const [painLogForm, setPainLogForm] = useState({ injuryId: '', date: new Date().toISOString().slice(0, 10), painLevel: 5, stiffness: 5, mobilityLevel: 5, mood: 3, notes: '' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const store = useInjuryStore();
  const {
    injuries, painLogs, rehabExercises, rehabPrograms, milestones,
    medicalDocs, wearableAlerts, coachMessages, notifications, badges,
    expertConsults, currentStreak, longestStreak,
  } = store;

  const activeInjuries = store.getActiveInjuries();
  const unreadCount = store.getUnreadNotificationsCount();

  // Tab 1: Dashboard stats
  const avgPain = useMemo(() => {
    if (painLogs.length === 0) return 0;
    return +(painLogs.slice(0, 7).reduce((s, l) => s + l.painLevel, 0) / Math.min(painLogs.length, 7)).toFixed(1);
  }, [painLogs]);

  // Tab 4: AI Detection
  const runSymptomCheck = () => {
    const key = Object.keys(SYMPTOM_INJURY_MAP).find((k) => symptomInput.toLowerCase().includes(k.split(' ')[0]));
    if (key) {
      setSymptomResult(SYMPTOM_INJURY_MAP[key]);
    } else {
      setSymptomResult({ probable: 'Could not classify — symptoms are too ambiguous.', caveat: 'Please consult a qualified medical professional for any pain or injury.' });
    }
  };

  // Tab 10: AI Coach — real AI API
  const [coachSending, setCoachSending] = useState(false);
  const [coachConvId, setCoachConvId] = useState<string | null>(null);

  const handleCoachSend = async () => {
    if (!chatInput.trim() || coachSending) return;
    const msg = chatInput.trim();
    store.sendCoachMessage(msg);
    setChatInput('');
    setCoachSending(true);
    try {
      const ctx = `Injury rehab AI coach. Active injuries: ${activeInjuries.map(i => `${i.name} (${i.bodyPart}, ${i.severity})`).join(', ') || 'none'}. Avg pain: ${avgPain}/10. Streak: ${currentStreak} days.`;
      const res = await aiApi.chat(coachConvId, `${ctx}\n\nUser: ${msg}`, undefined, undefined);
      const inner = res.data?.data;
      if (inner?.conversation?.id && !coachConvId) setCoachConvId(inner.conversation.id);
      const reply = inner?.message?.content ?? 'I could not generate a response right now.';
      store.receiveCoachMessage(reply);
    } catch {
      store.receiveCoachMessage('Sorry, I had trouble connecting. Please try again.');
    } finally {
      setCoachSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Tab 12: Posture analysis [*] — camera/CV not available; uses static guidance
  const [postureAnalysisDone, setPostureAnalysisDone] = useState(false);
  const [postureResult, setPostureResult] = useState<string | null>(null);

  const runPostureAnalysis = () => {
    // [*] Real-time computer vision is not available — showing general posture guidance
    setPostureResult('📷 Live CV analysis not available in this environment. General guidance: Stand tall with ears over shoulders, shoulders over hips. Engage core gently. Check with a physiotherapist for a personalised posture assessment.');
    setPostureAnalysisDone(true);
  };

  // Doc upload
  const [docForm, setDocForm] = useState({ injuryId: '', title: '', type: 'report' as 'prescription' | 'scan' | 'report' | 'referral' | 'other', fileName: '', notes: '' });
  const handleDocUpload = () => {
    if (!docForm.title.trim() || !docForm.injuryId) { toast.error('Select injury and enter document title'); return; }
    store.uploadMedicalDoc({ injuryId: docForm.injuryId, title: docForm.title, type: docForm.type, fileName: docForm.fileName || `${docForm.title}.pdf`, notes: docForm.notes });
    toast.success('Document uploaded');
    setDocUploadOpen(false);
    setDocForm({ injuryId: '', title: '', type: 'report', fileName: '', notes: '' });
  };

  // Consult dialog
  const [consultForm, setConsultForm] = useState({ injuryId: '', expertName: '', specialty: 'Physiotherapy', scheduledAt: '', notes: '', status: 'pending' as const, meetingLink: '' });
  const handleScheduleConsult = () => {
    if (!consultForm.expertName.trim() || !consultForm.scheduledAt) { toast.error('Fill in expert name and date'); return; }
    store.scheduleConsult(consultForm);
    toast.success('Consultation scheduled');
    setConsultDialogOpen(false);
    setConsultForm({ injuryId: '', expertName: '', specialty: 'Physiotherapy', scheduledAt: '', notes: '', status: 'pending', meetingLink: '' });
  };

  // Pain log
  const handleLogPain = () => {
    if (!painLogForm.injuryId) { toast.error('Select an injury'); return; }
    store.logDailyPain(painLogForm);
    toast.success('Pain log saved');
    setPainLogOpen(false);
  };

  // [*] Simulate wearable alert — demo only (no real BLE device connected)
  const simulateWearableAlert = () => {
    const alerts = [
      { type: 'abnormal-hr' as const, message: '[* Demo] Elevated heart rate (142 bpm) detected during rest — possible stress or pain response.' },
      { type: 'low-hrv' as const, message: '[* Demo] Low HRV detected. Your body may still be under significant recovery stress.' },
      { type: 'poor-sleep' as const, message: '[* Demo] Sleep quality score: 42/100. Poor sleep impairs injury recovery. Aim for 7-9 hours.' },
      { type: 'inactivity' as const, message: '[* Demo] 6+ hours of inactivity detected. Gentle movement is recommended for injury recovery.' },
    ];
    const alert = alerts[Math.floor(Date.now() / 1000) % alerts.length];
    store.addWearableAlert({ ...alert, detectedAt: new Date().toISOString() });
    toast('⌚ Demo alert added — connect a real wearable for live alerts', { icon: '⚠️' });
  };

  // Body map → open log dialog with pre-selected body part
  const handleBodyMapSelect = (part: BodyPart) => {
    setBodyMapSelected(part);
    setLogDialogOpen(true);
  };

  const TABS = [
    { label: 'Dashboard', icon: <HealingIcon /> },
    { label: 'Log Injury', icon: <AddIcon /> },
    { label: 'Body Map', icon: <PersonIcon /> },
    { label: 'AI Detection', icon: <SmartToyIcon /> },
    { label: 'Recovery', icon: <DirectionsRunIcon /> },
    { label: 'Workout Adapt', icon: <FitnessCenterIcon /> },
    { label: 'Diet', icon: <RestaurantIcon /> },
    { label: 'Prevention', icon: <ShieldIcon /> },
    { label: 'Rehab', icon: <HealingIcon /> },
    { label: 'AI Coach', icon: <SmartToyIcon /> },
    { label: 'Wearables', icon: <MonitorHeartIcon /> },
    { label: 'Posture AI', icon: <PhotoCameraIcon /> },
    { label: 'Documents', icon: <DescriptionIcon /> },
    { label: 'Notifications', icon: <Badge badgeContent={unreadCount} color="error"><NotificationsIcon /></Badge> },
    { label: 'Analytics', icon: <AnalyticsIcon /> },
    { label: 'Gamification', icon: <EmojiEventsIcon /> },
    { label: 'Expert Connect', icon: <VideoCallIcon /> },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'error.main' }}><HealingIcon /></Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>Injury Tracker</Typography>
            <Typography variant="body2" color="text.secondary">Monitor, rehabilitate and prevent injuries with AI-powered insights</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {currentStreak > 0 && (
            <Chip icon={<span style={{ fontSize: 16 }}>🔥</span>} label={`${currentStreak}d streak`} color="warning" size="small" />
          )}
          <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={() => { setBodyMapSelected(null); setLogDialogOpen(true); }}>
            Log Injury
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
        >
          {TABS.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
              sx={{ minHeight: 48, py: 1, fontSize: 12, textTransform: 'none', gap: 0.5 }} />
          ))}
        </Tabs>

        <Box sx={{ p: 2 }}>

          {/* ── Tab 0: Dashboard ─────────────────────────────────────────────── */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                { label: 'Active Injuries', value: activeInjuries.length, color: 'error.main', icon: '🤕' },
                { label: 'Avg Pain (7d)', value: `${avgPain}/10`, color: 'warning.main', icon: '📊' },
                { label: 'Log Streak', value: `${currentStreak} days`, color: 'success.main', icon: '🔥' },
                { label: 'Healed Total', value: injuries.filter((i) => i.status === 'healed').length, color: 'primary.main', icon: '✅' },
              ].map((stat) => (
                <Grid item xs={6} sm={3} key={stat.label}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography fontSize={28}>{stat.icon}</Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <SectionCard title="Active & Recovering Injuries">
              {activeInjuries.length === 0 ? (
                <Alert severity="success">No active injuries! Keep up the great preventive work.</Alert>
              ) : (
                activeInjuries.map((injury) => {
                  const score = store.getRecoveryScore(injury.id);
                  return (
                    <Paper key={injury.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                          <Typography fontWeight={600}>{injury.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip label={fmt(injury.bodyPart)} size="small" />
                            <Chip label={fmt(injury.type)} size="small" variant="outlined" />
                            <Chip label={injury.severity} size="small" color={SEVERITY_COLOR[injury.severity] as 'success' | 'warning' | 'error'} />
                            <Chip label={injury.status} size="small" variant="outlined" color={injury.status === 'recovering' ? 'info' : 'default'} />
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">Recovery</Typography>
                          <Typography fontWeight={700} color={score >= 70 ? 'success.main' : score >= 40 ? 'warning.main' : 'error.main'}>{score}%</Typography>
                        </Box>
                      </Box>
                      <LinearProgress variant="determinate" value={score}
                        sx={{ height: 6, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: score >= 70 ? 'success.main' : score >= 40 ? 'warning.main' : 'error.main' } }} />
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => { store.markInjuryHealed(injury.id); toast.success('Marked as healed! 🎉'); }}>Mark Healed</Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => { store.deleteInjury(injury.id); toast.success('Injury removed'); }}>Remove</Button>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </SectionCard>

            <SectionCard title="Recent Pain Logs">
              {painLogs.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No pain logs yet. Use the Recovery tab to log daily pain.</Typography>
              ) : (
                painLogs.slice(0, 5).map((log) => {
                  const injury = injuries.find((i) => i.id === log.injuryId);
                  return (
                    <Box key={log.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{injury?.name ?? 'Unknown Injury'}</Typography>
                        <Typography variant="caption" color="text.secondary">{log.date}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label={`Pain: ${log.painLevel}/10`} size="small" color={log.painLevel >= 7 ? 'error' : log.painLevel >= 4 ? 'warning' : 'success'} />
                        <Chip label={`Mobility: ${log.mobilityLevel}/10`} size="small" variant="outlined" />
                      </Box>
                    </Box>
                  );
                })
              )}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 1: Log Injury ────────────────────────────────────────────── */}
          <TabPanel value={tab} index={1}>
            <Alert severity="info" sx={{ mb: 2 }}>Use the form below to log a new injury manually, or let the <strong>AI Detection</strong> tab help classify your symptoms.</Alert>
            <SectionCard title="AI-Assisted Questionnaire" action={<Chip label="Beta" color="primary" size="small" />}>
              <Typography variant="body2" color="text.secondary" gutterBottom>Describe your symptoms in plain language and get a preliminary classification before logging.</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="e.g. Sharp knee pain when climbing stairs…" value={symptomInput} onChange={(e) => setSymptomInput(e.target.value)} />
                <Button variant="outlined" onClick={runSymptomCheck} startIcon={<SmartToyIcon />}>Analyse</Button>
              </Box>
              {symptomResult && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  <Typography variant="body2"><strong>Probable:</strong> {symptomResult.probable}</Typography>
                  <Typography variant="caption" color="text.secondary">⚠ {symptomResult.caveat}</Typography>
                </Alert>
              )}
            </SectionCard>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button variant="contained" color="error" size="large" startIcon={<AddIcon />} onClick={() => { setBodyMapSelected(null); setLogDialogOpen(true); }}>
                Open Injury Log Form
              </Button>
            </Box>
          </TabPanel>

          {/* ── Tab 2: Body Map ──────────────────────────────────────────────── */}
          <TabPanel value={tab} index={2}>
            <Alert severity="info" sx={{ mb: 2 }}>Tap any body region to log a new injury at that location. Red regions indicate current injuries.</Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={5}>
                <SectionCard title="Interactive Body Map">
                  <BodyMap activeInjuries={activeInjuries} onSelectPart={handleBodyMapSelect} />
                </SectionCard>
              </Grid>
              <Grid item xs={12} sm={7}>
                <SectionCard title="Injury Locations">
                  {activeInjuries.length === 0 ? (
                    <Alert severity="success">No active injuries on body map.</Alert>
                  ) : (
                    activeInjuries.map((injury) => (
                      <Box key={injury.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <WarningIcon color="error" fontSize="small" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{injury.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{fmt(injury.bodyPart)} · {fmt(injury.type)}</Typography>
                        </Box>
                        <Chip label={injury.severity} size="small" color={SEVERITY_COLOR[injury.severity] as 'success' | 'warning' | 'error'} />
                      </Box>
                    ))
                  )}
                </SectionCard>
                <SectionCard title="Legend">
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'rgba(244,67,54,0.4)', border: '1px solid #f44336' }} /><Typography variant="caption">Injured</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'rgba(33,150,243,0.3)', border: '1px solid #2196f3' }} /><Typography variant="caption">Hover</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'transparent', border: '1px solid #90caf9' }} /><Typography variant="caption">Healthy</Typography></Box>
                  </Box>
                </SectionCard>
              </Grid>
            </Grid>
          </TabPanel>

          {/* ── Tab 3: AI Detection ──────────────────────────────────────────── */}
          <TabPanel value={tab} index={3}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Medical Disclaimer:</strong> AI analysis is for informational purposes only and does not replace professional medical diagnosis. Always consult a qualified healthcare provider.
            </Alert>
            <SectionCard title="Symptom → Injury Classification" action={<Chip label="AI Powered" color="primary" size="small" icon={<SmartToyIcon />} />}>
              <Typography variant="body2" color="text.secondary" gutterBottom>Describe your symptoms in detail. The AI will suggest probable injury types based on your input.</Typography>
              <TextField fullWidth multiline rows={3} placeholder="e.g. I have sharp pain in my right knee that worsens when going down stairs. Started 3 days ago after running 10km. No swelling but clicking sound when bending."
                value={symptomInput} onChange={(e) => setSymptomInput(e.target.value)} sx={{ mb: 1.5 }} />
              <Button variant="contained" startIcon={<SmartToyIcon />} onClick={runSymptomCheck} disabled={!symptomInput.trim()}>Analyse Symptoms</Button>
              {symptomResult && (
                <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main', borderRadius: 1.5 }}>
                  <Typography variant="body1" fontWeight={600} gutterBottom>🤔 AI Assessment</Typography>
                  <Typography variant="body2" gutterBottom>{symptomResult.probable}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">⚠ {symptomResult.caveat}</Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <Button size="small" variant="outlined" color="error" onClick={() => { setBodyMapSelected(null); setLogDialogOpen(true); }}>Log This Injury</Button>
                  </Box>
                </Paper>
              )}
            </SectionCard>
            <SectionCard title="Common Injury Patterns">
              {Object.entries(SYMPTOM_INJURY_MAP).map(([symptom, result]) => (
                <Accordion key={symptom} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2" fontWeight={500}>{fmt(symptom)}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" gutterBottom><strong>Probable:</strong> {result.probable}</Typography>
                    <Alert severity="warning" sx={{ mt: 0.5 }}><Typography variant="caption">{result.caveat}</Typography></Alert>
                  </AccordionDetails>
                </Accordion>
              ))}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 4: Recovery Tracking ─────────────────────────────────────── */}
          <TabPanel value={tab} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPainLogOpen(true)}>Log Today's Pain</Button>
            </Box>
            {activeInjuries.map((injury) => {
              const logs = store.getPainLogsForInjury(injury.id);
              const score = store.getRecoveryScore(injury.id);
              const injMilestones = milestones.filter((m) => m.injuryId === injury.id);
              return (
                <SectionCard key={injury.id} title={`${injury.name} — Recovery`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" gutterBottom>Recovery Score: <strong>{score}%</strong></Typography>
                      <LinearProgress variant="determinate" value={score} sx={{ height: 8, borderRadius: 1 }} />
                    </Box>
                    <Chip label={`Pain: ${logs[logs.length - 1]?.painLevel ?? '—'}/10`} color={logs.length > 0 && logs[logs.length - 1].painLevel >= 7 ? 'error' : 'warning'} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>Pain Trend (last {Math.min(logs.length, 7)} logs):</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                    {logs.slice(-7).map((log) => (
                      <Tooltip key={log.id} title={`${log.date}: Pain ${log.painLevel}/10, Mobility ${log.mobilityLevel}/10`}>
                        <Box sx={{ width: 36, textAlign: 'center' }}>
                          <Box sx={{ height: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <Box sx={{ width: 20, height: `${log.painLevel * 6}px`, bgcolor: log.painLevel >= 7 ? 'error.main' : log.painLevel >= 4 ? 'warning.main' : 'success.main', borderRadius: '2px 2px 0 0' }} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">{log.date.slice(5)}</Typography>
                        </Box>
                      </Tooltip>
                    ))}
                    {logs.length === 0 && <Typography variant="body2" color="text.secondary">No logs yet for this injury.</Typography>}
                  </Box>
                  {injMilestones.length > 0 && (
                    <>
                      <Typography variant="body2" fontWeight={600} gutterBottom>Milestones:</Typography>
                      {injMilestones.map((m) => (
                        <Chip key={m.id} icon={<span>{m.icon}</span>} label={m.title} sx={{ mr: 0.5, mb: 0.5 }} color="success" size="small" />
                      ))}
                    </>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => store.addMilestone({ injuryId: injury.id, title: '🎯 Pain-Free Day', description: 'Experienced a full day with no significant pain!', achievedAt: new Date().toISOString(), icon: '🎯' })}>
                      + Add Milestone
                    </Button>
                  </Box>
                </SectionCard>
              );
            })}
            {activeInjuries.length === 0 && <Alert severity="success">No active injuries to track. Great job staying healthy!</Alert>}
          </TabPanel>

          {/* ── Tab 5: Workout Adaptation ────────────────────────────────────── */}
          <TabPanel value={tab} index={5}>
            <Alert severity="info" sx={{ mb: 2 }}>Exercise adaptations are suggested based on your active injuries. Always warm up and stop if pain increases.</Alert>
            {activeInjuries.length === 0 ? (
              <Alert severity="success">No active injuries — your full workout routine is safe!</Alert>
            ) : (
              activeInjuries.map((injury) => {
                const suggestions = WORKOUT_ADAPTATION_SUGGESTIONS[injury.bodyPart] ?? ['Consult your physiotherapist for specific adaptations for this injury location.'];
                return (
                  <SectionCard key={injury.id} title={`Adaptations for ${injury.name} (${fmt(injury.bodyPart)})`}>
                    <List dense>
                      {suggestions.map((s, i) => (
                        <ListItem key={i} disableGutters>
                          <ListItemIcon sx={{ minWidth: 28 }}><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
                          <ListItemText primary={s} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                      ))}
                    </List>
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Stop any exercise that increases pain beyond your baseline. Rest is a valid training choice during injury recovery.
                    </Alert>
                  </SectionCard>
                );
              })
            )}
            <SectionCard title="General Injury-Safe Exercise Principles">
              {['Maintain cardiovascular fitness with low-impact alternatives (swimming, cycling, walking)', 'Focus on the uninjured side — contralateral training maintains neural connections', 'Keep the injured area mobile within a pain-free range of motion', 'Don\'t skip strength work — weak muscles increase injury risk during recovery', 'Communicate with your physiotherapist before resuming any heavy lifting'].map((tip, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                  <CheckCircleIcon color="info" fontSize="small" sx={{ mt: 0.2 }} />
                  <Typography variant="body2">{tip}</Typography>
                </Box>
              ))}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 6: Diet Adaptation ──────────────────────────────────────── */}
          <TabPanel value={tab} index={6}>
            <Alert severity="info" sx={{ mb: 2 }}>Anti-inflammatory nutrition can significantly accelerate injury recovery. Here are evidence-based food recommendations.</Alert>
            {(['anti-inflammatory', 'protein', 'vitamin', 'mineral', 'hydration'] as const).map((cat) => (
              <SectionCard key={cat} title={`${cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Foods`}>
                <Grid container spacing={1.5}>
                  {DIET_RECOMMENDATIONS.filter((d) => d.category === cat).map((d) => (
                    <Grid item xs={12} sm={6} key={d.id}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                        <Typography variant="body2" fontWeight={600}>{d.food}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.benefit}</Typography>
                        <Chip label={d.frequency} size="small" variant="outlined" sx={{ mt: 0.5, display: 'block', width: 'fit-content' }} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>
            ))}
          </TabPanel>

          {/* ── Tab 7: Prevention & Safety ──────────────────────────────────── */}
          <TabPanel value={tab} index={7}>
            <Alert severity="success" sx={{ mb: 2 }}>Prevention is always better than treatment. Follow these evidence-based guidelines to stay injury-free.</Alert>
            <Grid container spacing={2}>
              {PREVENTION_TIPS.map((tip) => (
                <Grid item xs={12} sm={6} key={tip.id}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography fontSize={28} gutterBottom>{tip.icon}</Typography>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>{tip.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{tip.description}</Typography>
                    <Chip label={tip.category} size="small" sx={{ mt: 1 }} variant="outlined" />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* ── Tab 8: Rehab Programs ───────────────────────────────────────── */}
          <TabPanel value={tab} index={8}>
            <SectionCard title="Physiotherapy Exercises Library">
              <Grid container spacing={1.5}>
                {rehabExercises.map((ex) => (
                  <Grid item xs={12} sm={6} md={4} key={ex.id}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
                      <Typography variant="body2" fontWeight={600}>{ex.name}</Typography>
                      <Chip label={ex.category} size="small" sx={{ my: 0.5 }} variant="outlined" />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{ex.description}</Typography>
                      {ex.sets && <Chip label={`${ex.sets} sets × ${ex.reps} reps`} size="small" color="primary" sx={{ mr: 0.5 }} />}
                      {ex.durationSeconds && <Chip label={`${ex.durationSeconds}s`} size="small" color="primary" />}
                      <Box sx={{ mt: 0.75 }}>
                        <Typography variant="caption" color="success.main">Safe for: {ex.safeFor.slice(0, 2).map(fmt).join(', ')}{ex.safeFor.length > 2 ? '...' : ''}</Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </SectionCard>

            <SectionCard title="My Rehab Programs"
              action={
                <Button size="small" variant="outlined" startIcon={<AddIcon />}
                  onClick={() => {
                    if (activeInjuries.length === 0) { toast.error('Log an injury first'); return; }
                    store.createRehabProgram({ injuryId: activeInjuries[0].id, name: 'Recovery Program', startDate: new Date().toISOString().slice(0, 10), exerciseIds: ['ex-1', 'ex-5', 'ex-8'], frequency: '3× per week', notes: 'Auto-generated program', status: 'active' });
                    toast.success('Rehab program created');
                  }}>
                  Create Program
                </Button>
              }>
              {rehabPrograms.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No rehab programs yet. Create one to get started.</Typography>
              ) : (
                rehabPrograms.map((prog) => {
                  const injury = injuries.find((i) => i.id === prog.injuryId);
                  return (
                    <Paper key={prog.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography fontWeight={600}>{prog.name}</Typography>
                          <Typography variant="caption" color="text.secondary">For: {injury?.name ?? 'Unknown'} · {prog.frequency}</Typography>
                        </Box>
                        <Chip label={prog.status} size="small" color={prog.status === 'active' ? 'success' : 'default'} />
                      </Box>
                      <Typography variant="caption">{prog.completedSessions.length} sessions completed</Typography>
                      <Box sx={{ mt: 1 }}>
                        <Button size="small" variant="contained" onClick={() => { store.completeRehabSession(prog.id); toast.success('Session completed! 💪'); }}>
                          Complete Today's Session
                        </Button>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 9: AI Recovery Coach ─────────────────────────────────────── */}
          <TabPanel value={tab} index={9}>
            <Alert severity="info" sx={{ mb: 2 }}>Chat with your AI Recovery Coach for personalised daily guidance, motivation, and injury management tips.</Alert>
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 480 }}>
              <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}><SmartToyIcon fontSize="small" /></Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>AI Recovery Coach</Typography>
                  <Typography variant="caption" color="success.main">● Online</Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Button size="small" onClick={store.clearCoachChat}>Clear</Button>
                </Box>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
                {coachMessages.length === 0 && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography fontSize={40}>🤖</Typography>
                    <Typography variant="body2" color="text.secondary">Hi! I'm your AI Recovery Coach. Ask me anything about your injury recovery, exercises, or pain management.</Typography>
                  </Box>
                )}
                {coachMessages.map((msg) => (
                  <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                    {msg.role === 'coach' && <Avatar sx={{ bgcolor: 'primary.main', width: 28, height: 28, mr: 1, mt: 0.5 }}><SmartToyIcon sx={{ fontSize: 16 }} /></Avatar>}
                    <Paper sx={{ p: 1.5, maxWidth: '75%', bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper', color: msg.role === 'user' ? 'white' : 'text.primary', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px' }}>
                      <Typography variant="body2">{msg.content}</Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Box>
              <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" placeholder="Ask your coach…" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  disabled={coachSending}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleCoachSend(); } }} />
                <IconButton color="primary" onClick={() => void handleCoachSend()} disabled={!chatInput.trim() || coachSending}><SendIcon /></IconButton>
              </Box>
            </Paper>
          </TabPanel>

          {/* ── Tab 10: Wearable Detection ───────────────────────────────────── */}
          <TabPanel value={tab} index={10}>
            <Alert severity="info" sx={{ mb: 2 }}>Wearable devices can detect abnormal patterns that may indicate injury stress or impaired recovery.</Alert>
            <SectionCard title="Active Alerts"
              action={<Button size="small" variant="outlined" startIcon={<MonitorHeartIcon />} onClick={simulateWearableAlert}>Simulate Alert</Button>}>
              {wearableAlerts.filter((a) => !a.dismissed).length === 0 ? (
                <Alert severity="success">No active wearable alerts. Your recovery patterns look normal!</Alert>
              ) : (
                wearableAlerts.filter((a) => !a.dismissed).map((alert) => (
                  <Paper key={alert.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5, border: '1px solid', borderColor: 'warning.main' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <MonitorHeartIcon color="warning" />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{fmt(alert.type)}</Typography>
                          <Typography variant="body2">{alert.message}</Typography>
                          <Typography variant="caption" color="text.secondary">{new Date(alert.detectedAt).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => store.dismissWearableAlert(alert.id)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                  </Paper>
                ))
              )}
            </SectionCard>
            <SectionCard title="Monitored Metrics">
              {[
                { metric: 'Heart Rate Variability (HRV)', description: 'Low HRV indicates the body is under stress and recovery may be impaired', threshold: '< 40ms = alert' },
                { metric: 'Resting Heart Rate', description: 'Elevated resting HR can signal inflammation, infection or overtraining', threshold: '> 20% above baseline = alert' },
                { metric: 'Sleep Quality', description: 'Poor sleep dramatically slows tissue repair and pain tolerance', threshold: 'Score < 50 = alert' },
                { metric: 'Daily Movement', description: 'Extended inactivity during recovery can increase stiffness and delay healing', threshold: '< 1000 steps by 2pm = alert' },
                { metric: 'Sudden Impact', description: 'Accelerometer data detects falls or sudden impacts that may aggravate injuries', threshold: 'High G-force = immediate alert' },
              ].map((m) => (
                <Paper key={m.metric} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5 }}>
                  <Typography variant="body2" fontWeight={600}>{m.metric}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{m.description}</Typography>
                  <Chip label={m.threshold} size="small" color="warning" variant="outlined" />
                </Paper>
              ))}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 11: Posture/Image Analysis ──────────────────────────────── */}
          <TabPanel value={tab} index={11}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Simulated Feature:</strong> In a production environment, this would use computer vision to analyse posture from camera feed or uploaded photos. Results shown are illustrative only.
            </Alert>
            <SectionCard title="Posture Risk Analysis" action={<Chip label="AI Vision" color="primary" size="small" />}>
              <Typography variant="body2" color="text.secondary" gutterBottom>Allow camera access or upload a photo for AI posture screening. Poor posture is a leading predictor of musculoskeletal injury.</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                <Button variant="outlined" startIcon={<PhotoCameraIcon />} onClick={runPostureAnalysis}>Use Camera (Simulated)</Button>
                <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={runPostureAnalysis}>Upload Photo (Simulated)</Button>
              </Box>
              {postureAnalysisDone && postureResult && (
                <Paper variant="outlined" sx={{ mt: 2, p: 2, bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main', borderRadius: 1.5 }}>
                  <Typography variant="body1" fontWeight={600} gutterBottom>📸 Posture Analysis Result</Typography>
                  <Typography variant="body2">{postureResult}</Typography>
                  <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => { setPostureAnalysisDone(false); setPostureResult(null); }}>Reset</Button>
                </Paper>
              )}
            </SectionCard>
            <SectionCard title="Common Posture Risk Factors">
              {['Forward head posture (text neck) — strains cervical spine 4× more per cm of forward tilt', 'Rounded shoulders — compresses rotator cuff tendons and brachial plexus', 'Anterior pelvic tilt — overloads hip flexors and lower back extensors', 'Knee valgus (knees caving in) — increases ACL and meniscus injury risk', 'Flat arches — alters gait mechanics leading to chain injuries up the leg'].map((tip, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 0.75, alignItems: 'flex-start' }}>
                  <WarningIcon color="warning" fontSize="small" sx={{ mt: 0.2, flexShrink: 0 }} />
                  <Typography variant="body2">{tip}</Typography>
                </Box>
              ))}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 12: Medical Documents ────────────────────────────────────── */}
          <TabPanel value={tab} index={12}>
            <SectionCard title="My Medical Documents"
              action={<Button size="small" variant="contained" startIcon={<UploadFileIcon />} onClick={() => setDocUploadOpen(true)}>Upload Document</Button>}>
              {medicalDocs.length === 0 ? (
                <Alert severity="info">No documents uploaded. Store your prescriptions, scans and medical reports here securely.</Alert>
              ) : (
                medicalDocs.map((doc) => {
                  const injury = injuries.find((i) => i.id === doc.injuryId);
                  return (
                    <Paper key={doc.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <DescriptionIcon color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{doc.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {fmt(doc.type)} · {injury?.name ?? 'General'} · {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                          {doc.notes && <Typography variant="caption" sx={{ display: 'block' }}>{doc.notes}</Typography>}
                        </Box>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => { store.deleteMedicalDoc(doc.id); toast.success('Document removed'); }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  );
                })
              )}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 13: Notifications ────────────────────────────────────────── */}
          <TabPanel value={tab} index={13}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</Typography>
              <Button size="small" startIcon={<DoneAllIcon />} onClick={() => { store.markAllNotificationsRead(); toast.success('All marked as read'); }}>Mark All Read</Button>
            </Box>
            {notifications.length === 0 ? (
              <Alert severity="info">No notifications yet. Notifications will appear when you log injuries, complete sessions and hit milestones.</Alert>
            ) : (
              notifications.map((notif) => (
                <Paper key={notif.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5, opacity: notif.read ? 0.6 : 1, borderLeft: notif.read ? undefined : '3px solid', borderLeftColor: 'primary.main' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" fontWeight={notif.read ? 400 : 600}>{notif.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(notif.createdAt).toLocaleString()}</Typography>
                    </Box>
                    {!notif.read && (
                      <Button size="small" onClick={() => store.markNotificationRead(notif.id)}>Read</Button>
                    )}
                  </Box>
                </Paper>
              ))
            )}
          </TabPanel>

          {/* ── Tab 14: Analytics ────────────────────────────────────────────── */}
          <TabPanel value={tab} index={14}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                { label: 'Total Injuries', value: injuries.length },
                { label: 'Healed', value: injuries.filter((i) => i.status === 'healed').length },
                { label: 'Pain Logs', value: painLogs.length },
                { label: 'Longest Streak', value: `${longestStreak}d` },
                { label: 'Rehab Sessions', value: rehabPrograms.reduce((s, p) => s + p.completedSessions.length, 0) },
                { label: 'Docs Stored', value: medicalDocs.length },
              ].map((s) => (
                <Grid item xs={6} sm={4} key={s.label}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="h4" fontWeight={700}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <SectionCard title="Injury History">
              {injuries.length === 0 ? (
                <Alert severity="info">No injury history yet.</Alert>
              ) : (
                injuries.map((injury) => (
                  <Paper key={injury.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{injury.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{fmt(injury.bodyPart)} · {injury.dateOfOccurrence}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip label={injury.severity} size="small" color={SEVERITY_COLOR[injury.severity] as 'success' | 'warning' | 'error'} />
                        <Chip label={injury.status} size="small" variant="outlined" color={injury.status === 'healed' ? 'success' : injury.status === 'active' ? 'error' : 'warning'} />
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Pain logs: {painLogs.filter((l) => l.injuryId === injury.id).length} · Recovery score: {store.getRecoveryScore(injury.id)}%
                    </Typography>
                  </Paper>
                ))
              )}
            </SectionCard>

            <SectionCard title="Recurring Patterns">
              {(() => {
                const partCounts: Record<string, number> = {};
                injuries.forEach((i) => { partCounts[i.bodyPart] = (partCounts[i.bodyPart] ?? 0) + 1; });
                const recurring = Object.entries(partCounts).filter(([, count]) => count > 1);
                return recurring.length === 0 ? (
                  <Alert severity="success">No recurring injury patterns detected.</Alert>
                ) : (
                  recurring.map(([part, count]) => (
                    <Chip key={part} label={`${fmt(part)}: ${count} injuries`} color="warning" sx={{ m: 0.5 }} icon={<WarningIcon />} />
                  ))
                );
              })()}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 15: Gamification ─────────────────────────────────────────── */}
          <TabPanel value={tab} index={15}>
            <SectionCard title="Recovery Stats">
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography fontSize={32}>🔥</Typography>
                    <Typography variant="h5" fontWeight={700}>{currentStreak}</Typography>
                    <Typography variant="caption">Current Streak</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography fontSize={32}>⭐</Typography>
                    <Typography variant="h5" fontWeight={700}>{longestStreak}</Typography>
                    <Typography variant="caption">Longest Streak</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography fontSize={32}>🏅</Typography>
                    <Typography variant="h5" fontWeight={700}>{badges.filter((b) => b.unlockedAt).length}</Typography>
                    <Typography variant="caption">Badges Earned</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography fontSize={32}>🎯</Typography>
                    <Typography variant="h5" fontWeight={700}>{milestones.length}</Typography>
                    <Typography variant="caption">Milestones Hit</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard title="Badges">
              <Grid container spacing={1.5}>
                {badges.map((badge) => (
                  <Grid item xs={6} sm={4} md={3} key={badge.id}>
                    <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, opacity: badge.unlockedAt ? 1 : 0.4, bgcolor: badge.unlockedAt ? 'success.light' : undefined }}>
                      <Typography fontSize={32}>{badge.icon}</Typography>
                      <Typography variant="body2" fontWeight={600} gutterBottom>{badge.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{badge.description}</Typography>
                      {badge.unlockedAt ? (
                        <Chip label="Unlocked" color="success" size="small" sx={{ mt: 1 }} icon={<CheckCircleIcon />} />
                      ) : (
                        <Chip label="Locked" size="small" sx={{ mt: 1 }} variant="outlined" />
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </SectionCard>

            <SectionCard title="Recovery Milestones">
              {milestones.length === 0 ? (
                <Alert severity="info">No milestones yet. Log pain consistently and complete rehab sessions to earn milestones!</Alert>
              ) : (
                milestones.map((m) => {
                  const injury = injuries.find((i) => i.id === m.injuryId);
                  return (
                    <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography fontSize={24}>{m.icon}</Typography>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{m.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{injury?.name} · {new Date(m.achievedAt).toLocaleDateString()}</Typography>
                      </Box>
                    </Box>
                  );
                })
              )}
            </SectionCard>
          </TabPanel>

          {/* ── Tab 16: Expert Connect ───────────────────────────────────────── */}
          <TabPanel value={tab} index={16}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Coming Soon:</strong> Teleconsultation with certified physiotherapists, sports medicine doctors and nutritionists. Schedule virtual appointments directly in Heybobo.
            </Alert>
            <SectionCard title="Book a Consultation"
              action={<Button size="small" variant="contained" startIcon={<VideoCallIcon />} onClick={() => setConsultDialogOpen(true)}>Schedule</Button>}>
              <Alert severity="warning">Real-time video consultations are not yet available. You can pre-book and save consultant details for when the feature launches.</Alert>
            </SectionCard>

            <SectionCard title="Scheduled Consultations">
              {expertConsults.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No consultations scheduled yet.</Typography>
              ) : (
                expertConsults.map((consult) => {
                  const injury = injuries.find((i) => i.id === consult.injuryId);
                  return (
                    <Paper key={consult.id} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography fontWeight={600}>{consult.expertName}</Typography>
                          <Typography variant="body2" color="text.secondary">{consult.specialty}</Typography>
                          <Typography variant="caption">{injury?.name && `For: ${injury.name} · `}{new Date(consult.scheduledAt).toLocaleString()}</Typography>
                        </Box>
                        <Chip label={consult.status} size="small" color={consult.status === 'confirmed' ? 'success' : consult.status === 'cancelled' ? 'error' : 'warning'} />
                      </Box>
                      {consult.notes && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{consult.notes}</Typography>}
                    </Paper>
                  );
                })
              )}
            </SectionCard>

            <SectionCard title="Specialist Directory (Preview)">
              {[
                { name: 'Dr. Priya Menon', specialty: 'Sports Medicine', rating: '4.9', available: true },
                { name: 'James Harrington', specialty: 'Physiotherapy', rating: '4.8', available: true },
                { name: 'Dr. Arun Krishnan', specialty: 'Orthopaedics', rating: '4.7', available: false },
                { name: 'Sarah Mitchell', specialty: 'Sports Nutrition', rating: '4.9', available: true },
              ].map((expert) => (
                <Paper key={expert.name} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.light' }}><PersonIcon /></Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{expert.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{expert.specialty} · ⭐ {expert.rating}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Chip label={expert.available ? 'Available' : 'Unavailable'} size="small" color={expert.available ? 'success' : 'default'} sx={{ mr: 1 }} />
                    <Button size="small" variant="outlined" disabled={!expert.available} onClick={() => { setConsultForm({ ...consultForm, expertName: expert.name, specialty: expert.specialty }); setConsultDialogOpen(true); }}>Book</Button>
                  </Box>
                </Paper>
              ))}
            </SectionCard>
          </TabPanel>

        </Box>
      </Paper>

      {/* ── Log Injury Dialog ─────────────────────────────────────────────────── */}
      <LogInjuryDialog open={logDialogOpen} onClose={() => { setLogDialogOpen(false); setBodyMapSelected(null); }} defaultBodyPart={bodyMapSelected ?? undefined} />

      {/* ── Daily Pain Log Dialog ─────────────────────────────────────────────── */}
      <Dialog open={painLogOpen} onClose={() => setPainLogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Today's Pain & Mobility</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Injury</InputLabel>
              <Select label="Injury" value={painLogForm.injuryId} onChange={(e) => setPainLogForm({ ...painLogForm, injuryId: e.target.value })}>
                {activeInjuries.map((i) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Date" type="date" value={painLogForm.date} onChange={(e) => setPainLogForm({ ...painLogForm, date: e.target.value })} InputLabelProps={{ shrink: true }} />
            <Box>
              <Typography variant="body2" gutterBottom>Pain Level: <strong>{painLogForm.painLevel}/10</strong></Typography>
              <Slider value={painLogForm.painLevel} onChange={(_, v) => setPainLogForm({ ...painLogForm, painLevel: v as number })} min={1} max={10} marks step={1}
                sx={{ color: painLogForm.painLevel >= 7 ? 'error.main' : painLogForm.painLevel >= 4 ? 'warning.main' : 'success.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>Stiffness: <strong>{painLogForm.stiffness}/10</strong></Typography>
              <Slider value={painLogForm.stiffness} onChange={(_, v) => setPainLogForm({ ...painLogForm, stiffness: v as number })} min={1} max={10} marks step={1} />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>Mobility: <strong>{painLogForm.mobilityLevel}/10</strong></Typography>
              <Slider value={painLogForm.mobilityLevel} onChange={(_, v) => setPainLogForm({ ...painLogForm, mobilityLevel: v as number })} min={1} max={10} marks step={1} color="success" />
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>Mood: <strong>{['😢', '😟', '😐', '😊', '😄'][painLogForm.mood - 1]} ({painLogForm.mood}/5)</strong></Typography>
              <Slider value={painLogForm.mood} onChange={(_, v) => setPainLogForm({ ...painLogForm, mood: v as number })} min={1} max={5} marks step={1} color="secondary" />
            </Box>
            <TextField label="Notes (optional)" value={painLogForm.notes} onChange={(e) => setPainLogForm({ ...painLogForm, notes: e.target.value })} fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPainLogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLogPain}>Save Log</Button>
        </DialogActions>
      </Dialog>

      {/* ── Medical Doc Upload Dialog ─────────────────────────────────────────── */}
      <Dialog open={docUploadOpen} onClose={() => setDocUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Medical Document</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Related Injury</InputLabel>
              <Select label="Related Injury" value={docForm.injuryId} onChange={(e) => setDocForm({ ...docForm, injuryId: e.target.value })}>
                <MenuItem value="">General / Not specific</MenuItem>
                {injuries.map((i) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Document Title" value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select label="Document Type" value={docForm.type} onChange={(e) => setDocForm({ ...docForm, type: e.target.value as typeof docForm.type })}>
                <MenuItem value="prescription">Prescription</MenuItem>
                <MenuItem value="scan">Scan / X-Ray / MRI</MenuItem>
                <MenuItem value="report">Medical Report</MenuItem>
                <MenuItem value="referral">Referral Letter</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField label="File Name (simulated)" value={docForm.fileName} onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })} fullWidth placeholder="e.g. knee_mri_2024.pdf" />
            <TextField label="Notes" value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} fullWidth multiline rows={2} />
            <Alert severity="info">File storage is simulated. In production, documents would be securely encrypted and stored on your personal health record.</Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocUploadOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleDocUpload}>Upload</Button>
        </DialogActions>
      </Dialog>

      {/* ── Expert Consult Dialog ─────────────────────────────────────────────── */}
      <Dialog open={consultDialogOpen} onClose={() => setConsultDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><VideoCallIcon color="primary" /> Schedule Expert Consultation</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Related Injury</InputLabel>
              <Select label="Related Injury" value={consultForm.injuryId} onChange={(e) => setConsultForm({ ...consultForm, injuryId: e.target.value })}>
                <MenuItem value="">Not specific</MenuItem>
                {injuries.map((i) => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Expert Name" value={consultForm.expertName} onChange={(e) => setConsultForm({ ...consultForm, expertName: e.target.value })} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Specialty</InputLabel>
              <Select label="Specialty" value={consultForm.specialty} onChange={(e) => setConsultForm({ ...consultForm, specialty: e.target.value })}>
                {['Physiotherapy', 'Sports Medicine', 'Orthopaedics', 'Sports Nutrition', 'Chiropractic', 'Other'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Scheduled Date & Time" type="datetime-local" value={consultForm.scheduledAt} onChange={(e) => setConsultForm({ ...consultForm, scheduledAt: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} required />
            <TextField label="Meeting Link (optional)" value={consultForm.meetingLink} onChange={(e) => setConsultForm({ ...consultForm, meetingLink: e.target.value })} fullWidth placeholder="https://meet.google.com/..." />
            <TextField label="Notes" value={consultForm.notes} onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })} fullWidth multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConsultDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<VideoCallIcon />} onClick={handleScheduleConsult}>Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

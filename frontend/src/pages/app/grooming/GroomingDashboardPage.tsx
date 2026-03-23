import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
  Checkbox,
} from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';
import FaceIcon from '@mui/icons-material/Face';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import CheckroomIcon from '@mui/icons-material/Checkroom';

// ─── Seed data (mirrors mobile store) ────────────────────────────────────────

const PROFILE = {
  skinType: 'Combination',
  hairType: 'Wavy',
  faceShape: 'Oval',
  concerns: ['Oiliness', 'Dryness', 'Uneven Tone'],
  stylePrefs: ['Casual', 'Professional'],
};

const RECOMMENDATIONS = [
  {
    id: '1', category: 'Skincare', title: 'Daily Moisturizer',
    description: 'Use a lightweight, non-comedogenic moisturizer twice daily to maintain skin barrier.',
    priority: 'High', saved: true,
    products: ['CeraVe Facial Moisturizing Lotion', 'Cetaphil Daily Facial Cleanser'],
  },
  {
    id: '2', category: 'Skincare', title: 'Sunscreen SPF 30+',
    description: 'Apply broad-spectrum SPF 30+ every morning and reapply every 2 hours outdoors.',
    priority: 'High', saved: true,
    products: ['La Roche-Posay Anthelios', 'Neutrogena Ultra Sheer'],
  },
  {
    id: '3', category: 'Skincare', title: 'Vitamin C Serum',
    description: 'Use Vitamin C serum in the morning to brighten skin and reduce dark spots.',
    priority: 'Medium', saved: false, products: ['TruSkin Vitamin C Serum'],
  },
  {
    id: '4', category: 'Haircare', title: 'Deep Conditioning Mask',
    description: 'Use a deep conditioning hair mask once a week to restore moisture and shine.',
    priority: 'Medium', saved: false,
    products: ['Olaplex No. 3 Hair Perfector', 'Kerastase Masque Therapiste'],
  },
  {
    id: '5', category: 'Haircare', title: 'Scalp Massage',
    description: 'Massage your scalp for 5 minutes daily to stimulate blood flow and hair growth.',
    priority: 'Low', saved: false, products: [],
  },
  {
    id: '6', category: 'Lifestyle', title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily. Hydration directly impacts skin clarity.',
    priority: 'High', saved: true, products: [],
  },
  {
    id: '7', category: 'Lifestyle', title: 'Beauty Sleep',
    description: 'Aim for 7-9 hours of sleep. Skin repairs itself during sleep cycles.',
    priority: 'Medium', saved: false, products: ['Silk Pillowcase', 'Overnight Hydrating Mask'],
  },
  {
    id: '8', category: 'Grooming', title: 'Eyebrow Shaping',
    description: 'Define your brows every 2-3 weeks to frame your face shape.',
    priority: 'Low', saved: false, products: ['Benefit Precisely My Brow Pencil'],
  },
];

const LAST_ANALYSIS = {
  date: new Date(Date.now() - 2 * 86400000).toISOString(),
  skinType: 'Combination',
  skinScore: 72,
  concerns: ['Oiliness', 'Dryness', 'Uneven Tone'],
  recommendations: [
    'Use lightweight non-comedogenic moisturizer',
    'Apply sunscreen daily',
    'Exfoliate 2-3 times per week',
    'Use a gentle toner to balance pH',
  ],
};

const MORNING_ROUTINE = [
  { id: 'm1', label: 'Cleanse face', done: false },
  { id: 'm2', label: 'Apply toner', done: false },
  { id: 'm3', label: 'Vitamin C serum', done: false },
  { id: 'm4', label: 'Moisturize', done: true },
  { id: 'm5', label: 'Sunscreen SPF 30+', done: true },
];

const EVENING_ROUTINE = [
  { id: 'e1', label: 'Double cleanse', done: false },
  { id: 'e2', label: 'Exfoliate (2×/week)', done: false },
  { id: 'e3', label: 'Night serum', done: false },
  { id: 'e4', label: 'Eye cream', done: false },
  { id: 'e5', label: 'Night moisturizer', done: false },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  Skincare: '#e91e63',
  Haircare: '#ff9800',
  Lifestyle: '#4caf50',
  Grooming: '#6366F1',
};

const PRIORITY_COLOR: Record<string, 'error' | 'warning' | 'success'> = {
  High: 'error',
  Medium: 'warning',
  Low: 'success',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title, subtitle, action, children,
}: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
        </Box>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

function StatCard({
  icon, label, value, sub, color, onClick,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub: string; color: string; onClick?: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2, borderRadius: 3,
        display: 'flex', gap: 1.5, alignItems: 'flex-start',
        ...(onClick && { cursor: 'pointer', '&:hover': { borderColor: '#bdbdbd', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' } }),
      }}
    >
      <Avatar sx={{ bgcolor: color, width: 42, height: 42 }}>{icon}</Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{sub}</Typography>
      </Box>
    </Paper>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#4caf50' : score >= 50 ? '#ff9800' : '#f44336';
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate" value={100}
        size={100} thickness={4}
        sx={{ color: '#eeeeee', position: 'absolute' }}
      />
      <CircularProgress
        variant="determinate" value={score}
        size={100} thickness={4}
        sx={{ color }}
      />
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{score}</Typography>
        <Typography variant="caption" color="text.secondary">/100</Typography>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GroomingDashboardPage() {
  const navigate = useNavigate();

  const [morningDone, setMorningDone] = useState(() => MORNING_ROUTINE.map((s) => s.done));
  const [eveningDone, setEveningDone] = useState(() => EVENING_ROUTINE.map((s) => s.done));

  const stats = useMemo(() => ({
    total: RECOMMENDATIONS.length,
    saved: RECOMMENDATIONS.filter((r) => r.saved).length,
    skincare: RECOMMENDATIONS.filter((r) => r.category === 'Skincare').length,
    haircare: RECOMMENDATIONS.filter((r) => r.category === 'Haircare').length,
    lifestyle: RECOMMENDATIONS.filter((r) => r.category === 'Lifestyle').length,
  }), []);

  const topRecs = RECOMMENDATIONS.filter((r) => r.priority === 'High').slice(0, 4);

  const insights = useMemo(() => [
    {
      tone: 'info' as const,
      title: 'Combination skin needs balance',
      body: 'Your skin type benefits from lightweight hydration in the AM and richer repair at night. Avoid stripping cleansers.',
    },
    {
      tone: 'success' as const,
      title: 'Morning routine nearly complete',
      body: `${morningDone.filter(Boolean).length}/${MORNING_ROUTINE.length} morning steps done. Sunscreen and moisturizer are already checked off.`,
    },
    {
      tone: 'warning' as const,
      title: 'Evening routine not started',
      body: 'Consistency with your evening routine is key. Nightly cleansing removes pollutants that accelerate aging.',
    },
    {
      tone: 'info' as const,
      title: 'Skin score trending up',
      body: `Your latest AI scan scored ${LAST_ANALYSIS.skinScore}/100. Address oiliness and uneven tone to push above 80.`,
    },
  ], [morningDone]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Box sx={{ flex: 1, px: 3, py: 3, overflow: 'auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Grooming & Lifestyle Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personal care overview — insights from skin analysis, recommendations, and your daily routine tracker.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/app/grooming/recommendations')}>
            Recommendations
          </Button>
          <Button variant="contained" startIcon={<CameraAltIcon />} sx={{ bgcolor: '#e91e63' }} onClick={() => navigate('/app/grooming/visual-analysis')}>
            Visual Analysis
          </Button>
        </Box>
      </Box>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TipsAndUpdatesIcon sx={{ fontSize: 20 }} />}
            label="Total Tips"
            value={stats.total}
            sub={`${stats.saved} saved to favourites`}
            color="#6366F1"
            onClick={() => navigate('/app/grooming/recommendations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<SpaIcon sx={{ fontSize: 20 }} />}
            label="Skincare Tips"
            value={stats.skincare}
            sub="AI-generated skincare advice"
            color="#e91e63"
            onClick={() => navigate('/app/grooming/recommendations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ContentCutIcon sx={{ fontSize: 20 }} />}
            label="Haircare Tips"
            value={stats.haircare}
            sub="Hair & scalp recommendations"
            color="#ff9800"
            onClick={() => navigate('/app/grooming/recommendations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<StarIcon sx={{ fontSize: 20 }} />}
            label="Skin Score"
            value={`${LAST_ANALYSIS.skinScore}/100`}
            sub={`Last scan: ${formatDate(LAST_ANALYSIS.date)}`}
            color="#4caf50"
            onClick={() => navigate('/app/grooming/visual-analysis')}
          />
        </Grid>
      </Grid>

      {/* ── Row 2: Profile + Analysis ─────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Profile */}
        <Grid item xs={12} md={4}>
          <SectionCard
            title="My Profile"
            action={
              <Button size="small" variant="text" sx={{ color: '#6366F1', fontWeight: 600 }}>
                Edit
              </Button>
            }
          >
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              {[
                { icon: <WaterDropIcon fontSize="small" />, label: 'Skin Type', value: PROFILE.skinType, color: '#e91e63' },
                { icon: <ContentCutIcon fontSize="small" />, label: 'Hair Type', value: PROFILE.hairType, color: '#ff9800' },
                { icon: <FaceIcon fontSize="small" />, label: 'Face Shape', value: PROFILE.faceShape, color: '#6366F1' },
              ].map((item) => (
                <Grid item xs={4} key={item.label}>
                  <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 2, textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: `${item.color}18`, color: item.color, width: 32, height: 32, mx: 'auto', mb: 0.5 }}>
                      {item.icon}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 11 }}>{item.value}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Concerns</Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
              {PROFILE.concerns.map((c) => (
                <Chip key={c} label={c} size="small" color="error" variant="outlined" />
              ))}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Style Preferences</Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {PROFILE.stylePrefs.map((s) => (
                <Chip key={s} label={s} size="small" variant="outlined" />
              ))}
            </Box>
          </SectionCard>
        </Grid>

        {/* Skin Analysis */}
        <Grid item xs={12} md={8}>
          <SectionCard
            title="AI Skin Analysis"
            subtitle={`Last scan: ${formatDate(LAST_ANALYSIS.date)}`}
            action={
              <Button
                size="small" variant="outlined" startIcon={<CameraAltIcon />}
                sx={{ borderColor: '#e91e63', color: '#e91e63' }}
                onClick={() => navigate('/app/grooming/visual-analysis')}
              >
                New Scan
              </Button>
            }
          >
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <ScoreRing score={LAST_ANALYSIS.skinScore} />
                <Typography variant="caption" color="text.secondary">Overall Score</Typography>
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {LAST_ANALYSIS.skinType} Skin Detected
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Identified concerns:
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                  {LAST_ANALYSIS.concerns.map((c) => (
                    <Chip key={c} label={c} size="small" color="error" variant="outlined" />
                  ))}
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>AI Recommendations</Typography>
                {LAST_ANALYSIS.recommendations.slice(0, 3).map((r, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 15, color: '#4caf50' }} />
                    <Typography variant="body2" color="text.secondary">{r}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Score Breakdown
                </Typography>
                {[
                  { label: 'Hydration', value: 65 },
                  { label: 'Clarity', value: 58 },
                  { label: 'Texture', value: 74 },
                  { label: 'Tone', value: 70 },
                ].map((metric) => (
                  <Box key={metric.label} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                      <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{metric.value}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate" value={metric.value}
                      sx={{
                        height: 5, borderRadius: 3, bgcolor: '#eeeeee',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: metric.value >= 70 ? '#4caf50' : metric.value >= 55 ? '#ff9800' : '#f44336',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ── Row 3: Top Recommendations + Category Breakdown ───────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Top Priority Recommendations */}
        <Grid item xs={12} md={7}>
          <SectionCard
            title="Priority Recommendations"
            subtitle={`${topRecs.length} high-priority tips from all categories`}
            action={
              <Button
                size="small" endIcon={<ArrowForwardIcon />}
                sx={{ color: '#6366F1', fontWeight: 600 }}
                onClick={() => navigate('/app/grooming/recommendations')}
              >
                View All
              </Button>
            }
          >
            {topRecs.map((rec, idx) => (
              <Box key={rec.id}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
                  <Avatar sx={{ bgcolor: `${CATEGORY_COLOR[rec.category]}18`, color: CATEGORY_COLOR[rec.category], width: 36, height: 36, flexShrink: 0 }}>
                    {rec.category === 'Skincare' ? <SpaIcon fontSize="small" /> :
                     rec.category === 'Haircare' ? <ContentCutIcon fontSize="small" /> :
                     rec.category === 'Lifestyle' ? <LocalFloristIcon fontSize="small" /> :
                     <CheckroomIcon fontSize="small" />}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{rec.title}</Typography>
                      {rec.saved && <BookmarkIcon sx={{ fontSize: 14, color: '#6366F1' }} />}
                    </Box>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                    <Chip label={rec.priority} size="small" color={PRIORITY_COLOR[rec.priority]} variant="outlined" />
                    <Chip label={rec.category} size="small" variant="outlined"
                      sx={{ fontSize: 10, color: CATEGORY_COLOR[rec.category], borderColor: CATEGORY_COLOR[rec.category] }} />
                  </Box>
                </Box>
                {idx < topRecs.length - 1 && <Divider />}
              </Box>
            ))}
          </SectionCard>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={5}>
          <SectionCard title="Category Breakdown" subtitle="Distribution of all your personalised tips">
            {[
              { label: 'Skincare', count: stats.skincare, color: '#e91e63', icon: <SpaIcon /> },
              { label: 'Haircare', count: stats.haircare, color: '#ff9800', icon: <ContentCutIcon /> },
              { label: 'Lifestyle', count: stats.lifestyle, color: '#4caf50', icon: <LocalFloristIcon /> },
              { label: 'Grooming', count: RECOMMENDATIONS.filter((r) => r.category === 'Grooming').length, color: '#6366F1', icon: <CheckroomIcon /> },
            ].map((cat) => (
              <Box key={cat.label} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: `${cat.color}18`, color: cat.color, width: 28, height: 28 }}>
                      {cat.icon}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{cat.label}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{cat.count} tips</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(cat.count / stats.total) * 100}
                  sx={{
                    height: 6, borderRadius: 3, bgcolor: '#eeeeee',
                    '& .MuiLinearProgress-bar': { bgcolor: cat.color, borderRadius: 3 },
                  }}
                />
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#6366F1' }}>{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#e91e63' }}>{stats.saved}</Typography>
                <Typography variant="caption" color="text.secondary">Saved</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#4caf50' }}>
                  {RECOMMENDATIONS.filter((r) => r.priority === 'High').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">High Priority</Typography>
              </Box>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* ── Row 4: Daily Routine + Insights ──────────────────────────────────*/}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Daily Routine */}
        <Grid item xs={12} md={5}>
          <SectionCard title="Daily Routine Tracker" subtitle="Check off your morning & evening skincare steps">
            {/* Morning */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <WbSunnyIcon sx={{ color: '#ff9800', fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Morning</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {morningDone.filter(Boolean).length}/{MORNING_ROUTINE.length} done
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(morningDone.filter(Boolean).length / MORNING_ROUTINE.length) * 100}
              sx={{ height: 5, borderRadius: 3, bgcolor: '#eeeeee', mb: 1 }}
            />
            {MORNING_ROUTINE.map((step, i) => (
              <Box
                key={step.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4, cursor: 'pointer' }}
                onClick={() => setMorningDone((prev) => prev.map((v, idx) => idx === i ? !v : v))}
              >
                <Checkbox
                  checked={morningDone[i]} size="small"
                  sx={{ p: 0, color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }}
                  onChange={() => {}}
                />
                <Typography variant="body2"
                  sx={{ color: morningDone[i] ? 'text.disabled' : 'text.primary',
                        textDecoration: morningDone[i] ? 'line-through' : 'none' }}>
                  {step.label}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />

            {/* Evening */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <NightsStayIcon sx={{ color: '#7c3aed', fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Evening</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                {eveningDone.filter(Boolean).length}/{EVENING_ROUTINE.length} done
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(eveningDone.filter(Boolean).length / EVENING_ROUTINE.length) * 100}
              sx={{ height: 5, borderRadius: 3, bgcolor: '#eeeeee', mb: 1,
                    '& .MuiLinearProgress-bar': { bgcolor: '#7c3aed' } }}
            />
            {EVENING_ROUTINE.map((step, i) => (
              <Box
                key={step.id}
                sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4, cursor: 'pointer' }}
                onClick={() => setEveningDone((prev) => prev.map((v, idx) => idx === i ? !v : v))}
              >
                <Checkbox
                  checked={eveningDone[i]} size="small"
                  sx={{ p: 0, color: '#7c3aed', '&.Mui-checked': { color: '#7c3aed' } }}
                  onChange={() => {}}
                />
                <Typography variant="body2"
                  sx={{ color: eveningDone[i] ? 'text.disabled' : 'text.primary',
                        textDecoration: eveningDone[i] ? 'line-through' : 'none' }}>
                  {step.label}
                </Typography>
              </Box>
            ))}
          </SectionCard>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={7}>
          <SectionCard title="AI Insights" subtitle="Personalised observations from your grooming profile & analysis data">
            {insights.map((insight, i) => (
              <Alert
                key={i}
                severity={insight.tone}
                variant="outlined"
                sx={{
                  mb: i < insights.length - 1 ? 1.5 : 0,
                  borderRadius: 2,
                  '& .MuiAlert-message': { py: 0.25 },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>{insight.title}</Typography>
                <Typography variant="body2" color="text.secondary">{insight.body}</Typography>
              </Alert>
            ))}
          </SectionCard>
        </Grid>
      </Grid>

    </Box>
  );
}


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
  useTheme,
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
import { useUIStore } from '@/store/uiStore';
import { t } from '@/lib/translations';

// ─── Default empty state ────────────────────────────────────────

const PROFILE = {
  skinType: '',
  hairType: '',
  faceShape: '',
  concerns: [] as string[],
  stylePrefs: [] as string[],
};

const RECOMMENDATIONS: {
  id: string; category: string; title: string;
  description: string; priority: string; saved: boolean;
  products: string[];
}[] = [];

const LAST_ANALYSIS: {
  date: string; skinType: string; skinScore: number;
  concerns: string[]; recommendations: string[];
} | null = null;

const MORNING_ROUTINE: { id: string; label: string; done: boolean }[] = [];

const EVENING_ROUTINE: { id: string; label: string; done: boolean }[] = [];

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
  const dk = useTheme().palette.mode === 'dark';
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2, borderRadius: 3,
        display: 'flex', gap: 1.5, alignItems: 'flex-start',
        ...(onClick && { cursor: 'pointer', '&:hover': { borderColor: dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' } }),
      }}
    >
      <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 42, height: 42 }}>{icon}</Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{sub}</Typography>
      </Box>
    </Paper>
  );
}

function ScoreRing({ score }: { score: number }) {
  const dk = useTheme().palette.mode === 'dark';
  const color = score >= 75 ? '#4caf50' : score >= 50 ? '#ff9800' : '#f44336';
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate" value={100}
        size={100} thickness={4}
        sx={{ color: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee', position: 'absolute' }}
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
        <Typography variant="h5" sx={{ fontWeight: 700, color, lineHeight: 1 }}>{score}</Typography>
        <Typography variant="caption" color="text.secondary">/100</Typography>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GroomingDashboardPage() {
  const dk = useTheme().palette.mode === 'dark';
  const navigate = useNavigate();
  const { language } = useUIStore();

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

  const insights = useMemo(() => {
    if (!LAST_ANALYSIS && RECOMMENDATIONS.length === 0) {
      return [{
        tone: 'info' as const,
        title: 'Get started with your grooming profile',
        body: 'Run a Visual Analysis scan and configure your profile to receive personalised recommendations.',
      }];
    }
    const result: { tone: 'info' | 'success' | 'warning'; title: string; body: string }[] = [];
    if (PROFILE.skinType) {
      result.push({
        tone: 'info' as const,
        title: `${PROFILE.skinType} skin needs balance`,
        body: 'Your skin type benefits from lightweight hydration in the AM and richer repair at night. Avoid stripping cleansers.',
      });
    }
    if (MORNING_ROUTINE.length > 0) {
      result.push({
        tone: 'success' as const,
        title: 'Morning routine progress',
        body: `${morningDone.filter(Boolean).length}/${MORNING_ROUTINE.length} morning steps done.`,
      });
    }
    if (EVENING_ROUTINE.length > 0) {
      result.push({
        tone: 'warning' as const,
        title: 'Evening routine not started',
        body: 'Consistency with your evening routine is key. Nightly cleansing removes pollutants that accelerate aging.',
      });
    }
    if (LAST_ANALYSIS) {
      result.push({
        tone: 'info' as const,
        title: 'Skin score trending up',
        body: `Your latest AI scan scored ${LAST_ANALYSIS.skinScore}/100.`,
      });
    }
    return result;
  }, [morningDone]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <Box sx={{ flex: 1, px: { xs: 2.5, md: 4, lg: 5 }, py: 3, overflow: 'auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#c084fc20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SpaIcon sx={{ fontSize: 22, color: '#c084fc' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {t(language, 'groomingDashboardTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(language, 'groomingDashboardSubtitle')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<AutoAwesomeIcon />} onClick={() => navigate('/app/grooming/recommendations')}>
            {t(language, 'recommendationsBtn')}
          </Button>
          <Button variant="contained" startIcon={<CameraAltIcon />} sx={{ bgcolor: '#e91e63' }} onClick={() => navigate('/app/grooming/visual-analysis')}>
            {t(language, 'visualAnalysisBtn')}
          </Button>
        </Box>
      </Box>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TipsAndUpdatesIcon sx={{ fontSize: 20 }} />}
            label={t(language, 'totalTips')}
            value={stats.total}
            sub={`${stats.saved} saved to favourites`}
            color="#c084fc"
            onClick={() => navigate('/app/grooming/recommendations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<SpaIcon sx={{ fontSize: 20 }} />}
            label={t(language, 'skincareTipsLabel')}
            value={stats.skincare}
            sub={t(language, 'aiGeneratedNote')}
            color="#f43f5e"
            onClick={() => navigate('/app/grooming/recommendations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ContentCutIcon sx={{ fontSize: 20 }} />}
            label={t(language, 'haircareTipsLabel')}
            value={stats.haircare}
            sub={t(language, 'hairScalpNote')}
            color="#f59e0b"
            onClick={() => navigate('/app/grooming/recommendations')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<StarIcon sx={{ fontSize: 20 }} />}
            label={t(language, 'skinScoreLabel')}
            value={LAST_ANALYSIS ? `${LAST_ANALYSIS.skinScore}/100` : '--'}
            sub={LAST_ANALYSIS ? `Last scan: ${formatDate(LAST_ANALYSIS.date)}` : t(language, 'noScanYetMsg')}
            color="#10b981"
            onClick={() => navigate('/app/grooming/visual-analysis')}
          />
        </Grid>
      </Grid>

      {/* ── Row 2: Profile + Analysis ─────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Profile */}
        <Grid item xs={12} md={4}>
          <SectionCard
            title={t(language, 'myProfileSection')}
            action={
              <Button size="small" variant="text" sx={{ color: '#6366F1', fontWeight: 600 }}>
                {t(language, 'editBtn')}
              </Button>
            }
          >
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
              {[
                { icon: <WaterDropIcon fontSize="small" />, label: t(language, 'skinTypeLabel'), value: PROFILE.skinType, color: '#e91e63' },
                { icon: <ContentCutIcon fontSize="small" />, label: t(language, 'hairTypeLabel'), value: PROFILE.hairType, color: '#ff9800' },
                { icon: <FaceIcon fontSize="small" />, label: t(language, 'faceShapeLabel'), value: PROFILE.faceShape, color: '#6366F1' },
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

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t(language, 'concernsLabel')}</Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
              {PROFILE.concerns.map((c) => (
                <Chip key={c} label={c} size="small" color="error" variant="outlined" />
              ))}
            </Box>

            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t(language, 'stylePrefsLabel')}</Typography>
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
            title={t(language, 'aiSkinAnalysisSection')}
            subtitle={LAST_ANALYSIS ? `Last scan: ${formatDate(LAST_ANALYSIS.date)}` : t(language, 'noScanPerformedYet')}
            action={
              <Button
                size="small" variant="outlined" startIcon={<CameraAltIcon />}
                sx={{ borderColor: '#e91e63', color: '#e91e63' }}
                onClick={() => navigate('/app/grooming/visual-analysis')}
              >
                {t(language, 'newScanBtn')}
              </Button>
            }
          >
            {LAST_ANALYSIS ? (
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <ScoreRing score={LAST_ANALYSIS.skinScore} />
                  <Typography variant="caption" color="text.secondary">{t(language, 'overallScoreLabel')}</Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {LAST_ANALYSIS.skinType} Skin Detected
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {t(language, 'identifiedConcernsLabel')}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                    {LAST_ANALYSIS.concerns.map((c) => (
                      <Chip key={c} label={c} size="small" color="error" variant="outlined" />
                    ))}
                  </Box>

                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{t(language, 'aiRecommendationsLabel')}</Typography>
                  {LAST_ANALYSIS.recommendations.slice(0, 3).map((r, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CheckCircleIcon sx={{ fontSize: 15, color: '#4caf50' }} />
                      <Typography variant="body2" color="text.secondary">{r}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">
                  No skin analysis available. Use the <strong>New Scan</strong> button to run your first AI-powered skin assessment.
                </Typography>
              </Alert>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* ── Row 3: Top Recommendations + Category Breakdown ───────────────── */}
      <Grid container spacing={2} sx={{ mb: 2 }}>

        {/* Top Priority Recommendations */}
        <Grid item xs={12} md={7}>
          <SectionCard
            title={t(language, 'priorityRecsSection')}
            subtitle={`${topRecs.length} high-priority tips from all categories`}
            action={
              <Button
                size="small" endIcon={<ArrowForwardIcon />}
                sx={{ color: '#6366F1', fontWeight: 600 }}
                onClick={() => navigate('/app/grooming/recommendations')}
              >
                {t(language, 'viewAllBtn')}
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
                  value={(cat.count / Math.max(stats.total, 1)) * 100}
                  sx={{
                    height: 6, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee',
                    '& .MuiLinearProgress-bar': { bgcolor: cat.color, borderRadius: 3 },
                  }}
                />
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366F1' }}>{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#e91e63' }}>{stats.saved}</Typography>
                <Typography variant="caption" color="text.secondary">Saved</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
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
              value={(morningDone.filter(Boolean).length / Math.max(MORNING_ROUTINE.length, 1)) * 100}
              sx={{ height: 5, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee', mb: 1 }}
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
              value={(eveningDone.filter(Boolean).length / Math.max(EVENING_ROUTINE.length, 1)) * 100}
              sx={{ height: 5, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee', mb: 1,
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


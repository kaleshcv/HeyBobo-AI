import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HealingIcon from '@mui/icons-material/Healing';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InsightsIcon from '@mui/icons-material/Insights';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { useAuth } from '@/hooks/useAuth';
import {
  useAIBrainStore,
  type PriorityItem,
  type BrainAlert,
  type ScheduleEvent,
  type ModuleInsight,
  type CrossModuleInsight,
  type SmartRecommendation,
  type BrainMode,
} from '@/store/aiBrainStore';
import { generateAIBrainDashboard } from '@/lib/gemini';
import BrainChatbot from '@/components/common/BrainChatbot';
import { useBrainData } from '@/hooks/useBrainData';

// ─── Module icon/color map ──────────────────────────────────────────────────

const MODULE_META: Record<string, { icon: React.ReactElement; color: string; label: string; path: string }> = {
  education: { icon: <SchoolIcon fontSize="small" />, color: '#1976d2', label: 'Education', path: '/app/education' },
  fitness: { icon: <FitnessCenterIcon fontSize="small" />, color: '#e65100', label: 'Fitness', path: '/app/fitness' },
  health: { icon: <MonitorHeartIcon fontSize="small" />, color: '#d32f2f', label: 'Health', path: '/app/health' },
  dietary: { icon: <RestaurantIcon fontSize="small" />, color: '#2e7d32', label: 'Dietary', path: '/app/dietary' },
  injury: { icon: <HealingIcon fontSize="small" />, color: '#f57c00', label: 'Injury', path: '/app/health/injury' },
  shopping: { icon: <ShoppingCartIcon fontSize="small" />, color: '#7b1fa2', label: 'Shopping', path: '/app/shopping' },
  groups: { icon: <GroupsIcon fontSize="small" />, color: '#0097a7', label: 'Groups', path: '/app/groups' },
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#d32f2f',
  high: '#f57c00',
  medium: '#1976d2',
  low: '#757575',
};

const SEVERITY_MAP: Record<string, { color: 'error' | 'warning' | 'info' | 'success'; icon: React.ReactElement }> = {
  error: { color: 'error', icon: <ErrorOutlineIcon fontSize="small" /> },
  warning: { color: 'warning', icon: <WarningAmberIcon fontSize="small" /> },
  info: { color: 'info', icon: <InfoOutlinedIcon fontSize="small" /> },
  success: { color: 'success', icon: <CheckCircleOutlineIcon fontSize="small" /> },
};

const RECOMMENDATION_META: Record<string, { icon: React.ReactElement; color: string; label: string }> = {
  'do-now': { icon: <BoltIcon fontSize="small" />, color: '#d32f2f', label: 'Do Now' },
  recover: { icon: <SelfImprovementIcon fontSize="small" />, color: '#f57c00', label: 'Recover' },
  learn: { icon: <MenuBookIcon fontSize="small" />, color: '#1976d2', label: 'Learn' },
  buy: { icon: <LocalMallIcon fontSize="small" />, color: '#7b1fa2', label: 'Buy' },
  plan: { icon: <CalendarTodayIcon fontSize="small" />, color: '#0097a7', label: 'Plan' },
  monitor: { icon: <VisibilityIcon fontSize="small" />, color: '#757575', label: 'Monitor' },
};

const BRAIN_MODES: { id: BrainMode; label: string; icon: React.ReactElement }[] = [
  { id: 'monitor', label: 'Monitor', icon: <VisibilityIcon fontSize="small" /> },
  { id: 'priority', label: 'Priority', icon: <BoltIcon fontSize="small" /> },
  { id: 'safety', label: 'Safety', icon: <HealingIcon fontSize="small" /> },
  { id: 'coach', label: 'Coach', icon: <AutoAwesomeIcon fontSize="small" /> },
  { id: 'planner', label: 'Planner', icon: <CalendarTodayIcon fontSize="small" /> },
  { id: 'sync', label: 'Sync', icon: <InsightsIcon fontSize="small" /> },
  { id: 'insight', label: 'Insight', icon: <LightbulbIcon fontSize="small" /> },
];

// ─── Mode → visible sections mapping ────────────────────────────────────────

const MODE_SECTIONS: Record<BrainMode, Set<string>> = {
  monitor: new Set(['priorities', 'alerts', 'schedule', 'insights', 'cross', 'recommendations', 'weekly']),
  priority: new Set(['priorities', 'alerts', 'recommendations']),
  safety: new Set(['alerts', 'priorities', 'insights']),
  coach: new Set(['recommendations', 'insights', 'priorities']),
  planner: new Set(['schedule', 'weekly', 'priorities']),
  sync: new Set(['cross', 'insights']),
  insight: new Set(['weekly', 'cross', 'insights']),
};

// ─── Sub-Components ─────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  collapsible,
  defaultOpen = true,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactElement;
  action?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          cursor: collapsible ? 'pointer' : 'default',
          '&:hover': collapsible ? { bgcolor: 'action.hover' } : {},
        }}
        onClick={collapsible ? () => setOpen(!open) : undefined}
      >
        {icon && (
          <Avatar sx={{ width: 28, height: 28, bgcolor: '#f5f5f5', color: '#616161' }}>
            {icon}
          </Avatar>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
        {collapsible && (
          <IconButton size="small" sx={{ color: 'text.secondary' }}>
            {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
      <Collapse in={!collapsible || open}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
}

function ModuleChip({ module }: { module: string }) {
  const meta = MODULE_META[module];
  if (!meta) return null;
  return (
    <Chip
      icon={meta.icon}
      label={meta.label}
      size="small"
      variant="outlined"
      sx={{ borderColor: meta.color, color: meta.color, '& .MuiChip-icon': { color: meta.color } }}
    />
  );
}

function PriorityCard({ item, onNavigate }: { item: PriorityItem; onNavigate: (path: string) => void }) {
  const meta = MODULE_META[item.module];
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        py: 1,
        px: 1.5,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '3px solid',
        borderLeftColor: PRIORITY_COLORS[item.level] ?? '#757575',
        cursor: meta?.path ? 'pointer' : 'default',
        transition: 'all 0.15s',
        '&:hover': meta?.path ? { bgcolor: 'action.hover', borderColor: '#bdbdbd' } : {},
      }}
      onClick={() => meta?.path && onNavigate(meta.path)}
    >
      <Avatar sx={{ width: 28, height: 28, bgcolor: `${PRIORITY_COLORS[item.level]}14`, color: PRIORITY_COLORS[item.level] }}>
        {meta?.icon ?? <AssignmentIcon sx={{ fontSize: 16 }} />}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.3, display: 'block' }}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.3 }}>
          {item.description}
        </Typography>
      </Box>
      <Chip
        label={item.level}
        size="small"
        sx={{
          bgcolor: `${PRIORITY_COLORS[item.level]}14`,
          color: PRIORITY_COLORS[item.level],
          fontWeight: 600,
          fontSize: 10,
          height: 20,
          alignSelf: 'flex-start',
        }}
      />
    </Box>
  );
}

function AlertCard({ alert, onDismiss }: { alert: BrainAlert; onDismiss: (id: string) => void }) {
  const sev = SEVERITY_MAP[alert.severity] ?? SEVERITY_MAP.info;
  return (
    <Alert
      severity={sev.color}
      variant="outlined"
      sx={{ borderRadius: 1.5, py: 0, '& .MuiAlert-message': { flex: 1 } }}
      action={
        <IconButton size="small" onClick={() => onDismiss(alert.id)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.3 }}>{alert.title}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>{alert.description}</Typography>
    </Alert>
  );
}

function ScheduleTimeline({ events, toggleComplete }: { events: ScheduleEvent[]; toggleComplete: (id: string) => void }) {
  return (
    <Stack spacing={0}>
      {events.map((event, idx) => {
        const meta = MODULE_META[event.module];
        return (
          <Box
            key={event.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1,
              opacity: event.completed ? 0.5 : 1,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, pt: 0.25 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: event.completed ? '#9e9e9e' : (event.color || meta?.color || '#616161'),
                  border: '2px solid',
                  borderColor: event.completed ? '#bdbdbd' : (event.color || meta?.color || '#9e9e9e'),
                }}
              />
              {idx < events.length - 1 && (
                <Box sx={{ width: 2, flex: 1, bgcolor: '#e0e0e0', minHeight: 20 }} />
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{ width: 72, fontWeight: 600, color: 'text.secondary', pt: 0.1, flexShrink: 0 }}
            >
              {event.time}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  textDecoration: event.completed ? 'line-through' : 'none',
                }}
              >
                {event.title}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => toggleComplete(event.id)}
              sx={{
                color: event.completed ? '#4caf50' : '#bdbdbd',
                '&:hover': { color: '#4caf50' },
              }}
            >
              {event.completed ? <CheckIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Box>
        );
      })}
    </Stack>
  );
}

function InsightScoreCard({ insight, onNavigate }: { insight: ModuleInsight; onNavigate: (path: string) => void }) {
  const meta = MODULE_META[insight.module];
  const trendIcon = insight.trend === 'up'
    ? <TrendingUpIcon sx={{ fontSize: 18, color: '#4caf50' }} />
    : insight.trend === 'down'
      ? <TrendingDownIcon sx={{ fontSize: 18, color: '#f44336' }} />
      : <TrendingFlatIcon sx={{ fontSize: 18, color: '#9e9e9e' }} />;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: meta?.path ? 'pointer' : 'default',
        transition: 'all 0.15s',
        '&:hover': meta?.path ? { borderColor: meta.color, boxShadow: `0 2px 8px ${meta.color}18` } : {},
      }}
      onClick={() => meta?.path && onNavigate(meta.path)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <Avatar sx={{ width: 24, height: 24, bgcolor: `${meta?.color}14`, color: meta?.color }}>
          {meta?.icon ?? <InsightsIcon sx={{ fontSize: 14 }} />}
        </Avatar>
        <Typography variant="caption" sx={{ fontWeight: 700, flex: 1, fontSize: '0.72rem' }}>
          {insight.label}
        </Typography>
        {trendIcon}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={insight.score}
            size={40}
            thickness={4.5}
            sx={{ color: meta?.color ?? '#616161' }}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12 }}>
              {insight.score}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontSize: '0.68rem', lineHeight: 1.3 }}>
          {insight.summary}
        </Typography>
      </Box>
      {insight.details.length > 0 && (
        <Stack spacing={0.15} sx={{ mt: 0.5 }}>
          {insight.details.slice(0, 2).map((d, i) => (
            <Typography key={i} variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.3 }}>
              • {d}
            </Typography>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

function CrossInsightCard({ insight }: { insight: CrossModuleInsight }) {
  const typeColors: Record<string, string> = {
    pattern: '#1976d2',
    risk: '#d32f2f',
    opportunity: '#2e7d32',
    sync: '#7b1fa2',
  };
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: `${typeColors[insight.type] ?? '#616161'}08`,
        border: '1px solid',
        borderColor: `${typeColors[insight.type] ?? '#616161'}30`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
        <InsightsIcon sx={{ fontSize: 16, color: typeColors[insight.type] ?? '#616161' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, flex: 1, fontSize: '0.72rem' }}>
          {insight.title}
        </Typography>
        <Chip
          label={insight.type}
          size="small"
          sx={{
            bgcolor: `${typeColors[insight.type] ?? '#616161'}14`,
            color: typeColors[insight.type] ?? '#616161',
            fontWeight: 600,
            fontSize: 10,
            height: 20,
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontSize: '0.68rem', lineHeight: 1.3 }}>
        {insight.description}
      </Typography>
      <Stack direction="row" spacing={0.5}>
        {insight.modules.map((m) => (
          <ModuleChip key={m} module={m} />
        ))}
      </Stack>
    </Box>
  );
}

function RecommendationCard({ rec, onNavigate }: { rec: SmartRecommendation; onNavigate: (path: string) => void }) {
  const meta = RECOMMENDATION_META[rec.type] ?? RECOMMENDATION_META.monitor;
  const moduleMeta = MODULE_META[rec.module];
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        p: 1.25,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        cursor: moduleMeta?.path ? 'pointer' : 'default',
        '&:hover': moduleMeta?.path ? { bgcolor: 'action.hover' } : {},
      }}
      onClick={() => moduleMeta?.path && onNavigate(moduleMeta.path)}
    >
      <Avatar sx={{ width: 28, height: 28, bgcolor: `${meta.color}14`, color: meta.color }}>
        {meta.icon}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.15 }}>
          <Chip
            label={meta.label}
            size="small"
            sx={{ bgcolor: `${meta.color}14`, color: meta.color, fontWeight: 700, fontSize: 10, height: 18 }}
          />
          <ModuleChip module={rec.module} />
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', lineHeight: 1.3 }}>
          {rec.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem', lineHeight: 1.3 }}>
          {rec.description}
        </Typography>
      </Box>
    </Box>
  );
}

function DashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2.5 }} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Stack>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function AIBrainPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Brain store
  const {
    priorities,
    alerts,
    schedule,
    moduleInsights,
    crossInsights,
    recommendations,
    weeklySummary,
    isLoading,
    activeMode,
    lastRefresh,
    setLoading,
    setActiveMode,
    dismissAlert,
    toggleScheduleComplete,
    setBrainData,
  } = useAIBrainStore();

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !a.dismissed),
    [alerts],
  );

  // ─── Gather all module data via shared hook ────────────────────────────────

  const brainInput = useBrainData();

  const refreshDashboard = useCallback(async () => {
    if (isLoading) return;
    setLoading(true);
    setError(null);

    try {
      const rawJson = await generateAIBrainDashboard(brainInput);
      const parsed = JSON.parse(rawJson);

      setBrainData({
        priorities: (parsed.priorities ?? []).map((p: any) => ({
          ...p,
          dueTime: p.dueTime ?? undefined,
          actionLabel: p.actionLabel ?? undefined,
          actionPath: p.actionPath ?? undefined,
        })),
        alerts: (parsed.alerts ?? []).map((a: any) => ({
          ...a,
          timestamp: new Date().toISOString(),
          dismissed: false,
        })),
        schedule: (parsed.schedule ?? []).map((s: any) => ({
          ...s,
          completed: false,
          endTime: s.endTime ?? undefined,
          color: s.color ?? MODULE_META[s.module]?.color ?? '#616161',
        })),
        moduleInsights: parsed.moduleInsights ?? [],
        crossInsights: (parsed.crossInsights ?? []).map((ci: any) => ({
          ...ci,
          timestamp: new Date().toISOString(),
        })),
        recommendations: parsed.recommendations ?? [],
        weeklySummary: parsed.weeklySummary ?? null,
      });
    } catch (err: any) {
      console.error('AI Brain error:', err);
      setError(err?.message ?? 'Failed to generate dashboard. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  }, [
    isLoading, brainInput,
    setLoading, setBrainData,
  ]);

  // Auto-refresh on mount if stale (> 30 min)
  useEffect(() => {
    if (!lastRefresh) {
      refreshDashboard();
    } else {
      const age = Date.now() - new Date(lastRefresh).getTime();
      if (age > 30 * 60 * 1000) refreshDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const hasData = priorities.length > 0 || moduleInsights.length > 0;
  const show = MODE_SECTIONS[activeMode] ?? MODE_SECTIONS.monitor;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, md: 2 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#424242', width: 36, height: 36 }}>
            <PsychologyIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              AI Brain
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {greeting}, {user?.firstName ?? 'there'}. Here's your unified dashboard.
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastRefresh && (
            <Typography variant="caption" color="text.disabled" sx={{ mr: 1 }}>
              {new Date(lastRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={isLoading ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
            onClick={refreshDashboard}
            disabled={isLoading}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            {isLoading ? 'Analyzing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* Brain Mode Chips */}
      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
        {BRAIN_MODES.map((mode) => (
          <Chip
            key={mode.id}
            icon={mode.icon}
            label={mode.label}
            size="small"
            variant={activeMode === mode.id ? 'filled' : 'outlined'}
            onClick={() => setActiveMode(mode.id)}
            sx={{
              fontWeight: activeMode === mode.id ? 700 : 400,
              bgcolor: activeMode === mode.id ? '#424242' : 'transparent',
              color: activeMode === mode.id ? '#fff' : 'text.secondary',
              '& .MuiChip-icon': { color: activeMode === mode.id ? '#fff' : 'text.secondary' },
              '&:hover': { bgcolor: activeMode === mode.id ? '#616161' : 'action.hover' },
            }}
          />
        ))}
      </Stack>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 1, borderRadius: 1.5, py: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && !hasData && <DashboardSkeleton />}

      {/* Loading bar when refreshing existing data */}
      {isLoading && hasData && <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />}

      {/* Empty state */}
      {!isLoading && !hasData && !error && (
        <Paper
          variant="outlined"
          sx={{ p: 4, textAlign: 'center', borderRadius: 2.5, borderStyle: 'dashed' }}
        >
          <PsychologyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
            Your AI Brain is ready
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2, maxWidth: 440, mx: 'auto' }}>
            Click below to analyze all your modules and generate a personalized, unified dashboard with priorities, alerts, and cross-module insights.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={refreshDashboard}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#424242', '&:hover': { bgcolor: '#616161' } }}
          >
            Activate AI Brain
          </Button>
        </Paper>
      )}

      {/* ─── Dashboard Content ────────────────────────────────────── */}
      {hasData && (
        <Stack spacing={1.5}>
          {/* Row 1: Priorities + Alerts */}
          {(show.has('priorities') || show.has('alerts')) && (
            <Grid container spacing={1.5}>
              {show.has('priorities') && (
                <Grid item xs={12} md={show.has('alerts') ? 7 : 12}>
                  <SectionCard
                    title="Today's Priorities"
                    subtitle={`${priorities.length} action${priorities.length !== 1 ? 's' : ''} for today`}
                    icon={<BoltIcon fontSize="small" />}
                  >
                    <Stack spacing={0.75}>
                      {priorities.map((p) => (
                        <PriorityCard key={p.id} item={p} onNavigate={navigate} />
                      ))}
                      {priorities.length === 0 && (
                        <Typography variant="body2" color="text.disabled">No priorities right now</Typography>
                      )}
                    </Stack>
                  </SectionCard>
                </Grid>
              )}

              {show.has('alerts') && (
                <Grid item xs={12} md={show.has('priorities') ? 5 : 12}>
                  <SectionCard
                    title="Alerts & Risks"
                    subtitle={`${visibleAlerts.length} active alert${visibleAlerts.length !== 1 ? 's' : ''}`}
                    icon={<WarningAmberIcon fontSize="small" />}
                  >
                    <Stack spacing={0.75}>
                      {visibleAlerts.map((a) => (
                        <AlertCard key={a.id} alert={a} onDismiss={dismissAlert} />
                      ))}
                      {visibleAlerts.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 1 }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 28, color: '#4caf50', mb: 0.25 }} />
                          <Typography variant="body2" color="text.secondary">All clear! No active alerts.</Typography>
                        </Box>
                      )}
                    </Stack>
                  </SectionCard>
                </Grid>
              )}
            </Grid>
          )}

          {/* Row 2: Schedule + Module Insights */}
          {(show.has('schedule') || show.has('insights')) && (
            <Grid container spacing={1.5}>
              {show.has('schedule') && (
                <Grid item xs={12} md={show.has('insights') ? 5 : 12}>
                  <SectionCard
                    title="Today's Schedule"
                    subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    icon={<AccessTimeIcon fontSize="small" />}
                  >
                    {schedule.length > 0 ? (
                      <ScheduleTimeline events={schedule} toggleComplete={toggleScheduleComplete} />
                    ) : (
                      <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                        No events scheduled
                      </Typography>
                    )}
                  </SectionCard>
                </Grid>
              )}

              {show.has('insights') && (
                <Grid item xs={12} md={show.has('schedule') ? 7 : 12}>
                  <SectionCard
                    title="Module Intelligence"
                    subtitle="Performance scores across all modules"
                    icon={<InsightsIcon fontSize="small" />}
                  >
                    <Grid container spacing={1}>
                      {moduleInsights.map((mi) => (
                        <Grid item xs={6} sm={4} key={mi.module}>
                          <InsightScoreCard insight={mi} onNavigate={navigate} />
                        </Grid>
                      ))}
                      {moduleInsights.length === 0 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center' }}>
                            No module data available yet
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </SectionCard>
                </Grid>
              )}
            </Grid>
          )}

          {/* Row 3: Cross-Module Insights */}
          {crossInsights.length > 0 && show.has('cross') && (
            <SectionCard
              title="Cross-Module Insights"
              subtitle="Connections your AI Brain found across modules"
              icon={<LightbulbIcon fontSize="small" />}
              collapsible
            >
              <Grid container spacing={1}>
                {crossInsights.map((ci) => (
                  <Grid item xs={12} sm={6} key={ci.id}>
                    <CrossInsightCard insight={ci} />
                  </Grid>
                ))}
              </Grid>
            </SectionCard>
          )}

          {/* Row 4: Smart Recommendations */}
          {recommendations.length > 0 && show.has('recommendations') && (
            <SectionCard
              title="Smart Recommendations"
              subtitle="AI-powered actions to optimize your day"
              icon={<AutoAwesomeIcon fontSize="small" />}
              collapsible
            >
              <Grid container spacing={1}>
                {recommendations.map((rec) => (
                  <Grid item xs={12} sm={6} key={rec.id}>
                    <RecommendationCard rec={rec} onNavigate={navigate} />
                  </Grid>
                ))}
              </Grid>
            </SectionCard>
          )}

          {/* Row 5: Weekly Brain Summary */}
          {weeklySummary && show.has('weekly') && (
            <SectionCard
              title="Weekly Brain Summary"
              subtitle="Your week at a glance"
              icon={<EmojiEventsIcon fontSize="small" />}
              collapsible
              defaultOpen={false}
            >
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#4caf50', display: 'block', mb: 0.5 }}>
                    Wins
                  </Typography>
                  {weeklySummary.wins.map((w, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#4caf50', mt: 0.2 }} />
                      <Typography variant="caption">{w}</Typography>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57c00', display: 'block', mb: 0.5 }}>
                    Risks
                  </Typography>
                  {weeklySummary.risks.map((r, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      <WarningAmberIcon sx={{ fontSize: 14, color: '#f57c00', mt: 0.2 }} />
                      <Typography variant="caption">{r}</Typography>
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Adherence
                  </Typography>
                  {Object.entries(weeklySummary.adherence).map(([mod, pct]) => (
                    <Box key={mod} sx={{ mb: 0.75 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{mod}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{pct}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: '#f5f5f5',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: pct >= 80 ? '#4caf50' : pct >= 50 ? '#f57c00' : '#d32f2f',
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1976d2', display: 'block', mb: 0.5 }}>
                    Next Week Focus
                  </Typography>
                  {weeklySummary.predictedPriorities.map((p, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
                      <PlayArrowIcon sx={{ fontSize: 14, color: '#1976d2', mt: 0.2 }} />
                      <Typography variant="caption">{p}</Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </SectionCard>
          )}
        </Stack>
      )}

      {/* Floating AI Chatbot */}
      <BrainChatbot />
    </Box>
  );
}

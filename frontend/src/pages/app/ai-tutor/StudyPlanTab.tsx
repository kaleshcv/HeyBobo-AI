import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Checkbox,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
  Collapse,
  useTheme,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import toast from 'react-hot-toast';
import { useAITutorStore } from '@/store/aiTutorStore';
import { generateStudyPlan, teachContent } from '@/lib/gemini';
import { studyPlanApi, aiLessonApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';

interface Props {
  selectedBookId: string | null;
  onTeach: (content: string) => void;
}

export default function StudyPlanTab({ selectedBookId, onTeach }: Props) {
  const dk = useTheme().palette.mode === 'dark';
  const {
    textbooks,
    studyPlans,
    setStudyPlans,
    addStudyPlan,
    removeStudyPlan,
    toggleChapterComplete,
    addLesson,
  } = useAITutorStore();

  const [days, setDays] = useState('14');
  const [hours, setHours] = useState('3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [teachingTopic, setTeachingTopic] = useState<string | null>(null);
  const [loadingDB, setLoadingDB] = useState(true);

  // ── Load all plans from DB on mount ──────────────────
  useEffect(() => {
    studyPlanApi.getAll()
      .then((res) => {
        const raw: any[] = res.data?.data ?? [];
        if (raw.length > 0) {
          const mapped = raw.map((p: any) => ({
            id: p.clientId ?? p._id,
            textbookId: p.textbookId,
            title: p.title,
            totalDays: p.totalDays,
            hoursPerDay: p.hoursPerDay,
            chapters: (p.chapters ?? []).map((ch: any) => ({
              id: ch.id,
              title: ch.title,
              description: ch.description ?? '',
              days: ch.days ?? 1,
              topics: ch.topics ?? [],
              objectives: ch.objectives ?? [],
              completed: ch.completed ?? false,
            })),
            createdAt: p.createdAt ?? new Date().toISOString(),
          }));
          setStudyPlans(mapped);
        }
      })
      .catch(() => { /* silently fall back to local data */ })
      .finally(() => setLoadingDB(false));
  }, []);

  // ── Decide which plans to display ─────────────────────
  // No book selected (e.g. arriving from dashboard) → show ALL plans
  // Book selected → show only that book's plans
  const displayPlans = selectedBookId
    ? studyPlans.filter((p) => p.textbookId === selectedBookId)
    : studyPlans;

  const activeBook = textbooks.find((b) => b.id === selectedBookId);

  // ── Generate new plan ─────────────────────────────────
  const handleGenerate = async () => {
    if (!activeBook) {
      toast.error('Select a textbook first from the Textbooks tab');
      return;
    }
    const d = parseInt(days);
    const h = parseInt(hours);
    if (!d || d < 1 || !h || h < 1) {
      toast.error('Enter valid days and hours');
      return;
    }
    setIsGenerating(true);
    try {
      const json = await generateStudyPlan(activeBook.name, activeBook.extractedText, d, h);
      const data = JSON.parse(json);
      const clientId = `plan-${Date.now()}`;
      const plan = {
        id: clientId,
        textbookId: activeBook.id,
        title: data.title || `Study Plan for ${activeBook.name}`,
        totalDays: data.totalDays || d,
        hoursPerDay: data.hoursPerDay || h,
        chapters: (data.chapters || []).map((ch: any, idx: number) => ({
          id: ch.id || `ch-${idx}`,
          title: ch.title,
          description: ch.description || '',
          days: ch.days || 1,
          topics: ch.topics || [],
          objectives: ch.objectives || [],
          completed: false,
        })),
        createdAt: new Date().toISOString(),
      };

      // Persist to DB
      studyPlanApi.upsert({
        clientId,
        textbookId: plan.textbookId,
        title: plan.title,
        totalDays: plan.totalDays,
        hoursPerDay: plan.hoursPerDay,
        chapters: plan.chapters,
      }).catch((err) =>
        errorLogger.warn('Failed to save study plan to DB', 'StudyPlanTab', { meta: { error: String(err) } }),
      );

      addStudyPlan(plan);
      setExpandedPlan(clientId);
      toast.success('Study plan created!');
    } catch (err: any) {
      errorLogger.error('Failed to generate study plan: ' + (err?.message || 'Unknown error'), 'StudyPlanTab', { stack: err?.stack });
      toast.error('Failed to generate study plan: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Toggle chapter with DB sync ───────────────────────
  const handleToggleChapter = useCallback((planId: string, chapterId: string) => {
    toggleChapterComplete(planId, chapterId);
    studyPlanApi.toggleChapter(planId, chapterId).catch((err) =>
      errorLogger.warn('Failed to sync chapter toggle to DB', 'StudyPlanTab', { meta: { error: String(err) } }),
    );
  }, [toggleChapterComplete]);

  // ── Delete plan with DB sync ──────────────────────────
  const handleDeletePlan = useCallback((planId: string) => {
    removeStudyPlan(planId);
    studyPlanApi.delete(planId).catch((err) =>
      errorLogger.warn('Failed to delete study plan from DB', 'StudyPlanTab', { meta: { error: String(err) } }),
    );
  }, [removeStudyPlan]);

  // ── Teach a topic ─────────────────────────────────────
  const handleTeachTopic = async (planId: string, topic: string) => {
    const plan = studyPlans.find((p) => p.id === planId);
    const book = plan ? textbooks.find((b) => b.id === plan.textbookId) : activeBook;
    if (!book) {
      toast.error('Textbook not found — please select it in the Textbooks tab');
      return;
    }
    setTeachingTopic(topic);
    try {
      const content = await teachContent(book.name, book.extractedText, topic);
      const lessonClientId = `lesson-${Date.now()}`;
      addLesson({
        id: lessonClientId,
        clientId: lessonClientId,
        textbookId: book.id,
        topic,
        content,
        completedAt: new Date().toISOString(),
      });
      // Save lesson to DB (fire-and-forget)
      aiLessonApi.save({
        clientId: lessonClientId,
        textbookId: book.id,
        topic,
        content,
        completedAt: new Date().toISOString(),
      }).catch((err) =>
        errorLogger.warn('Failed to save lesson to DB', 'StudyPlanTab', { meta: { error: String(err) } }),
      );
      onTeach(content);
      toast.success(`Lesson on "${topic}" ready!`);
    } catch (err: any) {
      errorLogger.error('Failed to generate lesson: ' + (err?.message || 'Unknown error'), 'StudyPlanTab', { stack: err?.stack });
      toast.error('Failed to generate lesson: ' + (err?.message || 'Unknown error'));
    } finally {
      setTeachingTopic(null);
    }
  };

  const getPlanProgress = (plan: typeof displayPlans[0]) => {
    if (plan.chapters.length === 0) return 0;
    return Math.round((plan.chapters.filter((c) => c.completed).length / plan.chapters.length) * 100);
  };

  const getTextbookName = (textbookId: string) =>
    textbooks.find((b) => b.id === textbookId)?.name ?? 'Unknown Textbook';

  const totalCompletedAll = studyPlans.reduce((s, p) => s + p.chapters.filter((c) => c.completed).length, 0);
  const totalChaptersAll = studyPlans.reduce((s, p) => s + p.chapters.length, 0);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2.5, md: 4 }, py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#7c4dff20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CalendarTodayIcon sx={{ fontSize: 18, color: '#7c4dff' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Study Plans</Typography>
        {!selectedBookId && totalChaptersAll > 0 && (
          <Chip
            label={`${totalCompletedAll}/${totalChaptersAll} chapters completed`}
            size="small"
            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600, fontSize: 11 }}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {selectedBookId
          ? 'AI generates a personalized study plan from your textbook. Track your progress through each chapter.'
          : 'Overview of all your study plans and chapter progress across all textbooks.'}
      </Typography>

      {/* Generate form — only when a specific book is active */}
      {selectedBookId && activeBook && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            Create Study Plan for "{activeBook.name}"
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              label="Days available"
              type="number"
              size="small"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              sx={{ width: 130 }}
              inputProps={{ min: 1, max: 365 }}
            />
            <TextField
              label="Hours per day"
              type="number"
              size="small"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              sx={{ width: 130 }}
              inputProps={{ min: 1, max: 16 }}
            />
            <Button
              variant="contained"
              startIcon={isGenerating ? undefined : <AutoAwesomeIcon />}
              onClick={handleGenerate}
              disabled={isGenerating}
              sx={{ bgcolor: '#7c4dff', '&:hover': { bgcolor: '#651fff' }, textTransform: 'none' }}
            >
              {isGenerating ? 'Generating...' : 'Generate Plan'}
            </Button>
          </Box>
          {isGenerating && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
        </Paper>
      )}

      {/* Empty states */}
      {!selectedBookId && displayPlans.length === 0 && !loadingDB && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <CalendarTodayIcon sx={{ fontSize: 40, color: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No study plans yet. Select a textbook from the Textbooks tab to create one.
          </Typography>
        </Paper>
      )}

      {selectedBookId && displayPlans.length === 0 && !loadingDB && (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No study plans yet. Generate one above.
          </Typography>
        </Box>
      )}

      {/* Plans list */}
      {displayPlans.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {displayPlans.map((plan) => {
            const progress = getPlanProgress(plan);
            const isExpanded = expandedPlan === plan.id;
            return (
              <Paper key={plan.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fafafa' } }}
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <CalendarTodayIcon sx={{ fontSize: 20, color: '#7c4dff' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        {plan.title}
                      </Typography>
                      {/* Show textbook name when viewing all plans (no book filter) */}
                      {!selectedBookId && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          📖 {getTextbookName(plan.textbookId)}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={`${progress}%`}
                      size="small"
                      sx={{
                        bgcolor: progress === 100 ? '#e8f5e9' : dk ? 'rgba(255,255,255,0.08)' : '#f5f5f5',
                        color: progress === 100 ? '#2e7d32' : 'text.secondary',
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                    <Tooltip title="Delete plan">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    {isExpanded ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {plan.totalDays} days · {plan.hoursPerDay}h/day · {plan.chapters.filter((c) => c.completed).length}/{plan.chapters.length} chapters done
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ mt: 1, borderRadius: 1, height: 6, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#7c4dff' } }}
                  />
                </Box>

                <Collapse in={isExpanded}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {plan.chapters.map((ch, idx) => (
                      <Paper
                        key={ch.id}
                        variant="outlined"
                        sx={{ p: 1.5, mt: 1, borderRadius: 1.5, bgcolor: ch.completed ? (dk ? 'rgba(76,175,80,0.08)' : '#f1f8e9') : 'transparent' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Checkbox
                            checked={ch.completed}
                            onChange={() => handleToggleChapter(plan.id, ch.id)}
                            size="small"
                            sx={{ mt: -0.5, color: '#7c4dff', '&.Mui-checked': { color: '#7c4dff' } }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: ch.completed ? 'line-through' : 'none', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                              {idx + 1}. {ch.title}
                            </Typography>
                            {ch.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                {ch.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              <Chip label={`${ch.days} day${ch.days > 1 ? 's' : ''}`} size="small" sx={{ fontSize: 10, height: 20 }} />
                              {ch.topics.slice(0, 3).map((t, ti) => (
                                <Chip key={ti} label={t} size="small" variant="outlined" sx={{ fontSize: 10, height: 'auto', maxWidth: '100%', '& .MuiChip-label': { display: 'block', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere', py: 0.25 } }} />
                              ))}
                              {ch.topics.length > 3 && (
                                <Chip label={`+${ch.topics.length - 3} more`} size="small" sx={{ fontSize: 10, height: 20 }} />
                              )}
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant={ch.completed ? 'contained' : 'outlined'}
                                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                                onClick={() => handleToggleChapter(plan.id, ch.id)}
                                sx={{
                                  textTransform: 'none',
                                  borderColor: '#7c4dff',
                                  color: ch.completed ? '#fff' : '#7c4dff',
                                  bgcolor: ch.completed ? '#7c4dff' : 'transparent',
                                  '&:hover': {
                                    borderColor: '#651fff',
                                    bgcolor: ch.completed ? '#651fff' : (dk ? 'rgba(124,77,255,0.12)' : 'rgba(124,77,255,0.08)'),
                                  },
                                }}
                              >
                                {ch.completed ? 'Completed' : 'Mark Completed'}
                              </Button>
                            </Box>
                          </Box>
                          <Tooltip title={`Teach me: ${ch.title}`}>
                            <IconButton
                              size="small"
                              onClick={() => handleTeachTopic(plan.id, ch.title)}
                              disabled={teachingTopic === ch.title}
                              sx={{ color: '#7c4dff' }}
                            >
                              <SchoolIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

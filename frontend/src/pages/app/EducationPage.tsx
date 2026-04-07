import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  MenuItem,
  Paper,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CloseIcon from '@mui/icons-material/Close';
import { useCourseStore, LocalCourse, getYouTubeThumbnail, VideoProgress } from '@/store/courseStore';
import { useAITutorStore } from '@/store/aiTutorStore';
import { AnimatedPage } from '@/components/animations';
import { useAuth } from '@/hooks/useAuth';
import { aiApi, studyPlanApi, aiQuizApi, aiAttemptApi, aiLessonApi, aiRevisionApi } from '@/lib/api';
import toast from 'react-hot-toast';

// --- Course Card ---
function CourseCard({
  course,
  progress,
  onClick,
  onDelete,
}: {
  course: LocalCourse;
  progress: { completed: number; total: number; percent: number };
  onClick: () => void;
  onDelete: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          transition: 'all 0.2s',
          position: 'relative',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          '&:hover .delete-btn': { opacity: 1 },
        }}
      >
      <Box onClick={onClick}>
        <CardMedia
          component="img"
          height="140"
          image={course.thumbnail || ''}
          alt={course.title}
          sx={{
            objectFit: 'cover',
            bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
            {course.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {course.instructor}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <OndemandVideoIcon sx={{ fontSize: 14, color: dk ? '#777' : '#9e9e9e' }} />
              <Typography variant="caption" color="text.secondary">
                {course.videos.length} videos
              </Typography>
            </Box>
            <Chip
              label={course.level}
              size="small"
              sx={{
                ml: 'auto',
                height: 20,
                fontSize: 11,
                bgcolor: dk ? 'rgba(255,255,255,0.06)' : '#f5f5f5',
              }}
            />
          </Box>

          {/* Progress bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee',
                '& .MuiLinearProgress-bar': { bgcolor: progress.percent === 100 ? '#66bb6a' : dk ? '#666' : '#9e9e9e', borderRadius: 2 },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
              {progress.percent}%
            </Typography>
          </Box>
        </CardContent>
      </Box>

      {/* Delete button */}
      <Tooltip title="Delete course">
        <IconButton
          className="delete-btn"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            opacity: 0,
            transition: 'opacity 0.2s',
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
            color: 'text.secondary',
          }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      </Card>
    </motion.div>
  );
}

// --- Create Course Dialog ---
function CreateCourseDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  const addCourse = useCourseStore((s) => s.addCourse);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [videos, setVideos] = useState([{ title: '', youtubeUrl: '' }]);

  const handleAddVideo = () => {
    setVideos([...videos, { title: '', youtubeUrl: '' }]);
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index: number, field: 'title' | 'youtubeUrl', value: string) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    setVideos(updated);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Course title is required');
      return;
    }
    const validVideos = videos.filter((v) => v.title.trim() && v.youtubeUrl.trim());
    if (validVideos.length === 0) {
      toast.error('Add at least one video with a title and YouTube URL');
      return;
    }

    const thumbnail = getYouTubeThumbnail(validVideos[0].youtubeUrl);

    addCourse({
      title: title.trim(),
      description: description.trim(),
      thumbnail,
      instructor: instructor.trim() || 'Self',
      level,
      videos: validVideos.map((v, i) => ({
        id: `v-custom-${Date.now()}-${i}`,
        title: v.title.trim(),
        youtubeUrl: v.youtubeUrl.trim(),
        duration: '',
      })),
    });

    toast.success('Course created!');
    // Reset
    setTitle('');
    setDescription('');
    setInstructor('');
    setLevel('beginner');
    setVideos([{ title: '', youtubeUrl: '' }]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Create New Course</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField
          label="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="small"
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={2}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Instructor"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Level"
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
            select
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </TextField>
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
          Videos (YouTube URLs)
        </Typography>

        {videos.map((video, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <TextField
                label={`Video ${index + 1} Title`}
                value={video.title}
                onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="YouTube URL"
                value={video.youtubeUrl}
                onChange={(e) => handleVideoChange(index, 'youtubeUrl', e.target.value)}
                fullWidth
                size="small"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </Box>
            {videos.length > 1 && (
              <IconButton
                size="small"
                onClick={() => handleRemoveVideo(index)}
                sx={{ mt: 1, color: 'text.secondary' }}
              >
                <RemoveCircleOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}

        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddVideo}
          sx={{ alignSelf: 'flex-start', textTransform: 'none', borderColor: 'divider', color: 'text.secondary' }}
        >
          Add Video
        </Button>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{ textTransform: 'none', bgcolor: dk ? '#1A2B3C' : '#616161', '&:hover': { bgcolor: dk ? '#243B4F' : '#424242' } }}
        >
          Create Course
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Stat Card ---
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        borderColor: 'divider',
        ...(onClick && { cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }),
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.secondary">
            {sub}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

// --- AI Tutor Insights ---
function AITutorInsights() {
  const dk = useTheme().palette.mode === 'dark';
  const {
    textbooks, setTextbooks,
    studyPlans, setStudyPlans,
    quizzes, setQuizzes,
    quizAttempts, setQuizAttempts,
    lessons, setLessons,
    revisionPlans, setRevisionPlans,
    dismissRevisionPlan,
  } = useAITutorStore();
  const navigate = useNavigate();
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null);

  // Sync all AI-tutor data from the backend whenever the Education dashboard mounts
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      try {
        const [docRes, planRes, quizRes, attemptRes, lessonRes, revisionRes] = await Promise.all([
          aiApi.getDocuments(),
          studyPlanApi.getAll(),
          aiQuizApi.getAll(),
          aiAttemptApi.getAll(),
          aiLessonApi.getAll(),
          aiRevisionApi.getAll(),
        ]);
        if (cancelled) return;

        // Textbooks
        const docs: any[] = docRes.data?.data ?? [];
        if (docs.length) {
          setTextbooks(docs.map((d: any) => ({
            id: String(d._id ?? d.id),
            name: d.originalName ?? d.filename,
            size: d.size ?? 0,
            pageCount: d.pageCount ?? 0,
            extractedText: d.extractedText ?? '',
            createdAt: d.createdAt ?? new Date().toISOString(),
          })));
        }

        // Study plans
        const rawPlans: any[] = planRes.data?.data ?? [];
        if (rawPlans.length) {
          setStudyPlans(rawPlans.map((p: any) => ({
            id: p.clientId ?? String(p._id),
            clientId: p.clientId,
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
          })));
        }

        // Quizzes
        const rawQuizzes: any[] = quizRes.data?.data ?? [];
        if (rawQuizzes.length) {
          setQuizzes(rawQuizzes.map((q: any) => ({
            id: q.clientId ?? String(q._id),
            clientId: q.clientId,
            textbookId: q.textbookId,
            title: q.title,
            questions: q.questions ?? [],
            createdAt: q.createdAt ?? new Date().toISOString(),
          })));
        }

        // Quiz attempts
        const rawAttempts: any[] = attemptRes.data?.data ?? [];
        if (rawAttempts.length) {
          setQuizAttempts(rawAttempts.map((a: any) => ({
            id: a.clientId ?? String(a._id),
            clientId: a.clientId,
            quizId: a.quizId,
            textbookId: a.textbookId,
            answers: a.answers ?? {},
            score: a.score,
            total: a.total,
            completedAt: a.completedAt ?? new Date().toISOString(),
          })));
        }

        // Lessons
        const rawLessons: any[] = lessonRes.data?.data ?? [];
        if (rawLessons.length) {
          setLessons(rawLessons.map((l: any) => ({
            id: l.clientId ?? String(l._id),
            clientId: l.clientId,
            textbookId: l.textbookId,
            topic: l.topic,
            content: '',
            completedAt: l.completedAt ?? new Date().toISOString(),
          })));
        }

        // Revision plans
        const rawRevisions: any[] = revisionRes.data?.data ?? [];
        if (rawRevisions.length) {
          setRevisionPlans(rawRevisions.map((r: any) => ({
            id: r.clientId ?? String(r._id),
            clientId: r.clientId,
            quizAttemptId: r.quizAttemptId,
            textbookId: r.textbookId,
            quizTitle: r.quizTitle,
            score: r.score,
            total: r.total,
            weakAreas: r.weakAreas ?? [],
            summary: r.summary ?? '',
            createdAt: r.createdAt ?? new Date().toISOString(),
            dismissed: r.dismissed ?? false,
          })));
        }
      } catch {
        // Silently fall back to whatever is already in the store
      }
    };
    sync();
    return () => { cancelled = true; };
  }, []);

  const totalTextbooks = textbooks.length;
  const totalChapters = studyPlans.reduce((s, p) => s + p.chapters.length, 0);
  const completedChapters = studyPlans.reduce((s, p) => s + p.chapters.filter((c) => c.completed).length, 0);
  const studyPlanPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
  const totalAttempts = quizAttempts.length;
  const avgScore = totalAttempts > 0 ? Math.round((quizAttempts.reduce((s, a) => s + a.score / a.total, 0) / totalAttempts) * 100) : 0;
  const totalLessons = lessons.length;

  const activeRevisions = revisionPlans.filter((r) => !r.dismissed);
  const openRevision = revisionPlans.find((r) => r.id === selectedRevision);

  // Recent quiz attempts for bar chart (last 8)
  const recentAttempts = [...quizAttempts]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 8)
    .reverse();

  // Per-textbook study progress for ring charts
  const bookProgress = textbooks.map((b) => {
    const plans = studyPlans.filter((p) => p.textbookId === b.id);
    const tc = plans.reduce((s, p) => s + p.chapters.length, 0);
    const cc = plans.reduce((s, p) => s + p.chapters.filter((c) => c.completed).length, 0);
    return { name: b.name, total: tc, completed: cc, pct: tc > 0 ? Math.round((cc / tc) * 100) : 0 };
  });

  // SVG donut helper
  const Donut = ({ pct, size = 64, stroke = 6, color = '#7c4dff' }: { pct: number; size?: number; stroke?: number; color?: string }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dk ? 'rgba(255,255,255,0.06)' : '#f0f0f0'} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
    );
  };

  if (totalTextbooks === 0 && totalAttempts === 0 && totalLessons === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <SmartToyIcon sx={{ fontSize: 18, color: '#7c4dff' }} /> AI Tutor Insights
        </Typography>
        <Paper
          variant="outlined"
          onClick={() => navigate('/app/ai-tutor')}
          sx={{ p: 2.5, borderRadius: 3, textAlign: 'center', cursor: 'pointer', borderColor: 'divider', '&:hover': { borderColor: 'text.disabled' } }}
        >
          <SmartToyIcon sx={{ fontSize: 36, color: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Upload textbooks and start studying with AI Tutor to see insights here.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <SmartToyIcon sx={{ fontSize: 18, color: '#7c4dff' }} /> AI Tutor Insights
      </Typography>

      {/* AI stat cards */}
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" onClick={() => navigate('/app/ai-tutor?tab=0')} sx={{ p: 1.5, borderRadius: 3, textAlign: 'center', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <MenuBookIcon sx={{ fontSize: 18, color: '#7c4dff', mb: 0.25 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>{totalTextbooks}</Typography>
            <Typography variant="caption" color="text.secondary">Textbooks</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" onClick={() => navigate('/app/ai-tutor?tab=1')} sx={{ p: 1.5, borderRadius: 3, textAlign: 'center', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <CheckCircleIcon sx={{ fontSize: 18, color: '#4caf50', mb: 0.25 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>{completedChapters}/{totalChapters}</Typography>
            <Typography variant="caption" color="text.secondary">Chapters Done</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" onClick={() => navigate('/app/ai-tutor?tab=2')} sx={{ p: 1.5, borderRadius: 3, textAlign: 'center', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <QuizIcon sx={{ fontSize: 18, color: '#ff9800', mb: 0.25 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>{totalAttempts}</Typography>
            <Typography variant="caption" color="text.secondary">AI Quiz Attempts</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper variant="outlined" onClick={() => navigate('/app/ai-tutor?tab=4')} sx={{ p: 1.5, borderRadius: 3, textAlign: 'center', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <SchoolIcon sx={{ fontSize: 18, color: '#2196f3', mb: 0.25 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>{totalLessons}</Typography>
            <Typography variant="caption" color="text.secondary">AI Lessons</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        {/* Quiz Score History - Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" onClick={() => navigate('/app/ai-tutor?tab=2')} sx={{ p: 2, borderRadius: 3, borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>AI Quiz Score History</Typography>
            {recentAttempts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No AI quizzes taken yet</Typography>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 100 }}>
                {recentAttempts.map((a, i) => {
                  const pct = Math.round((a.score / a.total) * 100);
                  const quiz = quizzes.find((q) => q.id === a.quizId);
                  return (
                    <Tooltip key={i} title={`${quiz?.title || 'Quiz'}: ${a.score}/${a.total} (${pct}%)`}>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 36,
                            height: `${Math.max(pct, 5)}%`,
                            bgcolor: pct >= 70 ? '#7c4dff' : pct >= 50 ? '#ff9800' : '#f44336',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.4s ease',
                            minHeight: 4,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                          {pct}%
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            )}
            {recentAttempts.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Avg: {avgScore}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {totalAttempts} total attempt{totalAttempts !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Study Plan Progress - Donut Charts */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" onClick={() => navigate('/app/ai-tutor?tab=1')} sx={{ p: 2, borderRadius: 3, borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Study Plan Progress</Typography>
            {bookProgress.length === 0 || totalChapters === 0 ? (
              <Typography variant="body2" color="text.secondary">No study plans created yet</Typography>
            ) : (
              <>
                {/* Overall donut */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <Donut pct={studyPlanPct} size={72} stroke={7} />
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14 }}>{studyPlanPct}%</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Overall Completion</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {completedChapters} of {totalChapters} chapters completed
                    </Typography>
                  </Box>
                </Box>

                {/* Per-book bars */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {bookProgress.filter((b) => b.total > 0).slice(0, 5).map((b, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="body2" noWrap sx={{ fontSize: 12, flex: 1, mr: 1 }}>{b.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{b.completed}/{b.total}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={b.pct}
                        sx={{ height: 6, borderRadius: 3, bgcolor: dk ? 'rgba(255,255,255,0.06)' : '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: '#7c4dff', borderRadius: 3 } }}
                      />
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Revision Plans */}
      {activeRevisions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AssignmentLateIcon sx={{ fontSize: 18, color: '#f44336' }} /> Areas for Improvement
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {activeRevisions.slice(0, 5).map((rev) => {
              const pct = Math.round((rev.score / rev.total) * 100);
              const book = textbooks.find((b) => b.id === rev.textbookId);
              return (
                <Paper
                  key={rev.id}
                  variant="outlined"
                  onClick={() => setSelectedRevision(rev.id)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderColor: 'divider',
                    borderLeft: '3px solid',
                    borderLeftColor: pct < 40 ? '#f44336' : '#ff9800',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }} noWrap>
                      {rev.quizTitle}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Chip
                        label={`${rev.score}/${rev.total}`}
                        size="small"
                        sx={{ height: 20, fontSize: 11, bgcolor: dk ? 'rgba(198,40,40,0.12)' : '#fce4ec', color: '#c62828' }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); dismissRevisionPlan(rev.id); }}
                        sx={{ p: 0.25 }}
                      >
                        <CloseIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    {book?.name || 'Unknown textbook'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {rev.summary}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
                    {rev.weakAreas.slice(0, 3).map((w, i) => (
                      <Chip
                        key={i}
                        label={w.topic}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          bgcolor: w.priority === 'high' ? (dk ? 'rgba(198,40,40,0.12)' : '#ffebee') : w.priority === 'medium' ? (dk ? 'rgba(230,81,0,0.12)' : '#fff8e1') : (dk ? 'rgba(106,27,154,0.12)' : '#f3e5f5'),
                          color: w.priority === 'high' ? '#c62828' : w.priority === 'medium' ? '#e65100' : '#6a1b9a',
                        }}
                      />
                    ))}
                    {rev.weakAreas.length > 3 && (
                      <Chip label={`+${rev.weakAreas.length - 3}`} size="small" sx={{ height: 18, fontSize: 10 }} />
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Revision Plan Detail Dialog */}
      <Dialog open={!!openRevision} onClose={() => setSelectedRevision(null)} maxWidth="sm" fullWidth>
        {openRevision && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentLateIcon sx={{ color: '#f44336' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Revision Plan</Typography>
                  <Typography variant="caption" color="text.secondary">{openRevision.quizTitle}</Typography>
                </Box>
                <Chip
                  label={`${openRevision.score}/${openRevision.total} (${Math.round((openRevision.score / openRevision.total) * 100)}%)`}
                  size="small"
                  sx={{ bgcolor: dk ? 'rgba(198,40,40,0.12)' : '#fce4ec', color: '#c62828', fontWeight: 600 }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: dk ? 'rgba(230,81,0,0.08)' : '#fff8e1', borderColor: dk ? 'rgba(255,224,130,0.3)' : '#ffe082' }}>
                <Typography variant="body2" sx={{ fontSize: 13 }}>{openRevision.summary}</Typography>
              </Paper>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Weak Areas & Action Plan</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {openRevision.weakAreas.map((item, i) => (
                  <Paper
                    key={i}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      borderLeft: '3px solid',
                      borderLeftColor: item.priority === 'high' ? '#f44336' : item.priority === 'medium' ? '#ff9800' : '#7c4dff',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{item.topic}</Typography>
                      <Chip
                        label={item.priority}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: 10,
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          bgcolor: item.priority === 'high' ? (dk ? 'rgba(198,40,40,0.12)' : '#ffebee') : item.priority === 'medium' ? (dk ? 'rgba(230,81,0,0.12)' : '#fff8e1') : (dk ? 'rgba(106,27,154,0.12)' : '#f3e5f5'),
                          color: item.priority === 'high' ? '#c62828' : item.priority === 'medium' ? '#e65100' : '#6a1b9a',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      <strong>Gap:</strong> {item.weakness}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#2e7d32' }}>
                      <strong>Action:</strong> {item.action}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelectedRevision(null)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => { setSelectedRevision(null); navigate('/app/ai-tutor?tab=2'); }}
                sx={{ textTransform: 'none', bgcolor: '#7c4dff', '&:hover': { bgcolor: '#651fff' } }}
              >
                Retake Quiz
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// --- Dashboard Tab ---
function DashboardTab() {
  const dk = useTheme().palette.mode === 'dark';
  const courses = useCourseStore((s) => s.courses);
  const progress = useCourseStore((s) => s.progress);
  const quizProgress = useCourseStore((s) => s.quizProgress);
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress);
  const navigate = useNavigate();

  // Stats calculations
  const totalCourses = courses.length;
  const coursesCompleted = courses.filter((c) => {
    const cp = getCourseProgress(c.id);
    return cp.total > 0 && cp.completed === cp.total;
  }).length;

  const totalVideos = courses.reduce((acc, c) => acc + c.videos.length, 0);
  const videosWatched = progress.filter((p) => p.completed).length;

  const overallPercent =
    totalVideos > 0 ? Math.round((videosWatched / totalVideos) * 100) : 0;

  const quizzesTaken = quizProgress.length;
  const totalQuizScore = quizProgress.reduce((acc, q) => acc + q.score, 0);
  const totalQuizQuestions = quizProgress.reduce((acc, q) => acc + q.total, 0);
  const avgQuizPercent =
    totalQuizQuestions > 0 ? Math.round((totalQuizScore / totalQuizQuestions) * 100) : 0;
  const perfectQuizzes = quizProgress.filter((q) => q.score === q.total).length;

  // Recently active courses (those with progress, sorted by latest watchedAt)
  const recentCourses = useMemo(() => {
    const courseLastActivity = new Map<string, string>();
    progress.forEach((p) => {
      if (p.watchedAt) {
        const existing = courseLastActivity.get(p.courseId);
        if (!existing || p.watchedAt > existing) {
          courseLastActivity.set(p.courseId, p.watchedAt);
        }
      }
    });
    return courses
      .filter((c) => courseLastActivity.has(c.id))
      .sort((a, b) => {
        const aTime = courseLastActivity.get(a.id) || '';
        const bTime = courseLastActivity.get(b.id) || '';
        return bTime.localeCompare(aTime);
      })
      .slice(0, 4);
  }, [courses, progress]);

  return (
    <Box>
      {/* Stat cards */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<SchoolIcon sx={{ fontSize: 20, color: '#fff' }} />}
            label="Courses Completed"
            value={coursesCompleted}
            sub={`of ${totalCourses} total`}
            color="#66bb6a"
            onClick={() => navigate('/app/courses')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon sx={{ fontSize: 20, color: '#fff' }} />}
            label="Overall Progress"
            value={`${overallPercent}%`}
            sub={`${videosWatched} of ${totalVideos} videos`}
            color={dk ? '#1A2B3C' : '#616161'}
            onClick={() => navigate('/app/courses')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<QuizIcon sx={{ fontSize: 20, color: '#fff' }} />}
            label="Quiz Average"
            value={`${avgQuizPercent}%`}
            sub={`${quizzesTaken} quiz${quizzesTaken !== 1 ? 'zes' : ''} taken`}
            color="#ffa726"
            onClick={() => navigate('/app/courses')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EmojiEventsIcon sx={{ fontSize: 20, color: '#fff' }} />}
            label="Perfect Scores"
            value={perfectQuizzes}
            sub={`of ${quizzesTaken} quizzes`}
            color="#ab47bc"
            onClick={() => navigate('/app/courses')}
          />
        </Grid>
      </Grid>

      {/* Progress breakdown */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" onClick={() => navigate('/app/courses')} sx={{ p: 2, borderRadius: 3, borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Course Progress
              </Typography>
            </Box>
            {courses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No courses yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {courses.map((course) => {
                  const cp = getCourseProgress(course.id);
                  return (
                    <Box
                      key={course.id}
                      sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                      onClick={() => navigate(`/app/education/${course.id}`)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="body2" noWrap sx={{ fontSize: 13, flex: 1, mr: 1 }}>
                          {course.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cp.completed}/{cp.total}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={cp.percent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: cp.percent === 100 ? '#66bb6a' : dk ? '#666' : '#9e9e9e',
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Recent Quiz Scores
            </Typography>
            {quizProgress.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No quizzes taken yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[...quizProgress]
                  .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
                  .slice(0, 8)
                  .map((qp, i) => {
                    const course = courses.find((c) => c.id === qp.courseId);
                    const video = course?.videos.find((v) => v.id === qp.videoId);
                    const pct = Math.round((qp.score / qp.total) * 100);
                    return (
                      <Box key={i} onClick={() => course && navigate(`/app/education/${course.id}`)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', borderRadius: 1, px: 0.5, mx: -0.5, '&:hover': { bgcolor: 'action.hover' } }}>
                        {qp.score === qp.total ? (
                          <CheckCircleIcon sx={{ fontSize: 16, color: '#66bb6a' }} />
                        ) : (
                          <QuizIcon sx={{ fontSize: 16, color: '#ffa726' }} />
                        )}
                        <Typography variant="body2" noWrap sx={{ fontSize: 13, flex: 1 }}>
                          {video?.title || 'Unknown video'}
                        </Typography>
                        <Chip
                          label={`${qp.score}/${qp.total}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: 11,
                            bgcolor: pct === 100 ? (dk ? 'rgba(46,125,50,0.15)' : '#e8f5e9') : pct >= 50 ? (dk ? 'rgba(230,81,0,0.15)' : '#fff3e0') : (dk ? 'rgba(198,40,40,0.12)' : '#fce4ec'),
                            color: pct === 100 ? '#2e7d32' : pct >= 50 ? '#e65100' : '#c62828',
                          }}
                        />
                      </Box>
                    );
                  })}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Continue learning */}
      {recentCourses.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SchoolIcon sx={{ fontSize: 16, color: '#38bdf8' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Continue Learning
            </Typography>
          </Box>
          <Grid container spacing={1.5}>
            {recentCourses.map((course) => {
              const cp = getCourseProgress(course.id);
              return (
                <Grid item xs={12} sm={6} md={3} key={course.id}>
                  <Paper
                    variant="outlined"
                    onClick={() => navigate(`/app/education/${course.id}`)}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      cursor: 'pointer',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: 13 }} noWrap>
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {course.instructor}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={cp.percent}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: cp.percent === 100 ? '#66bb6a' : dk ? '#666' : '#9e9e9e',
                            borderRadius: 2,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                        {cp.percent}%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* AI Tutor Insights */}
      <AITutorInsights />
    </Box>
  );
}

// --- Main Education Page ---
export default function EducationPage() {
  const dk = useTheme().palette.mode === 'dark';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [tab] = useState(0);

  const courses = useCourseStore((s) => s.courses);
  const progress = useCourseStore((s) => s.progress);
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress);
  const deleteCourse = useCourseStore((s) => s.deleteCourse);

  const filteredCourses = useMemo(() => {
    let list = courses;
    // "My Courses" tab (index 2): only courses with at least one watched video
    if (tab === 2) {
      const startedIds = new Set(progress.map((p: VideoProgress) => p.courseId));
      list = list.filter((c) => startedIds.has(c.id));
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.level.includes(q)
    );
  }, [courses, progress, search, tab]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse(courseId);
    toast.success('Course deleted');
  };

  return (
    <AnimatedPage>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 2.5, md: 4, lg: 5 },
          py: 3,
          overflow: 'auto',
        }}
      >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#38bdf820', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SchoolIcon sx={{ fontSize: 22, color: '#38bdf8' }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {greeting()}{user ? `, ${user.firstName}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {courses.length} course{courses.length !== 1 ? 's' : ''} · Continue your learning journey
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            textTransform: 'none',
            bgcolor: dk ? '#1A2B3C' : '#616161',
            '&:hover': { bgcolor: dk ? '#243B4F' : '#424242' },
            borderRadius: 2,
          }}
        >
          New Course
        </Button>
      </Box>

      {/* Dashboard content */}
      <DashboardTab />

      {/* Course list */}
      {false && (
        <>
          {/* Search */}
          <Box sx={{ maxWidth: 480, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
              '& fieldset': { borderColor: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0' },
              '&:hover fieldset': { borderColor: dk ? 'rgba(255,255,255,0.25)' : '#bdbdbd' },
            },
          }}
        />
      </Box>

      {/* Course cards grid */}
      {filteredCourses.length > 0 ? (
        <Grid container spacing={2}>
          {filteredCourses.map((course, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} sx={{ height: '100%' }} key={course.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
              >
                <CourseCard
                  course={course}
                  progress={getCourseProgress(course.id)}
                  onClick={() => navigate(`/app/education/${course.id}`)}
                  onDelete={() => handleDeleteCourse(course.id)}
                />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <PlayCircleOutlineIcon sx={{ fontSize: 48, color: dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {search ? 'No courses match your search' : 'No courses yet'}
          </Typography>
          {!search && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ textTransform: 'none', borderColor: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0', color: 'text.secondary' }}
            >
              Create your first course
            </Button>
          )}
        </Box>
          )}
        </>
      )}

      <CreateCourseDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      </Box>
    </AnimatedPage>
  );
}

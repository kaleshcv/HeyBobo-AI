import { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAITutorStore } from '@/store/aiTutorStore';

interface Props {
  selectedBookId: string | null;
}

export default function ProgressTab({ selectedBookId }: Props) {
  const { textbooks, studyPlans, quizzes, quizAttempts, lessons } = useAITutorStore();

  const stats = useMemo(() => {
    const books = selectedBookId ? textbooks.filter((b) => b.id === selectedBookId) : textbooks;
    const bookIds = new Set(books.map((b) => b.id));
    const plans = studyPlans.filter((p) => bookIds.has(p.textbookId));
    const bQuizzes = quizzes.filter((q) => bookIds.has(q.textbookId));
    const bAttempts = quizAttempts.filter((a) => bookIds.has(a.textbookId));
    const bLessons = lessons.filter((l) => bookIds.has(l.textbookId));

    const totalChapters = plans.reduce((s, p) => s + p.chapters.length, 0);
    const completedChapters = plans.reduce((s, p) => s + p.chapters.filter((c) => c.completed).length, 0);
    const avgScore = bAttempts.length > 0 ? bAttempts.reduce((s, a) => s + a.score / a.total, 0) / bAttempts.length : 0;

    // Per-book breakdown
    const perBook = books.map((b) => {
      const bPlans = plans.filter((p) => p.textbookId === b.id);
      const bq = bQuizzes.filter((q) => q.textbookId === b.id);
      const ba = bAttempts.filter((a) => a.textbookId === b.id);
      const bl = bLessons.filter((l) => l.textbookId === b.id);
      const tc = bPlans.reduce((s, p) => s + p.chapters.length, 0);
      const cc = bPlans.reduce((s, p) => s + p.chapters.filter((c) => c.completed).length, 0);
      return { book: b, plans: bPlans.length, quizzes: bq.length, attempts: ba.length, lessons: bl.length, totalChapters: tc, completedChapters: cc, avgScore: ba.length ? ba.reduce((s, a) => s + a.score / a.total, 0) / ba.length : 0 };
    });

    return { books: books.length, plans: plans.length, totalChapters, completedChapters, quizzes: bQuizzes.length, attempts: bAttempts.length, lessons: bLessons.length, avgScore, perBook };
  }, [selectedBookId, textbooks, studyPlans, quizzes, quizAttempts, lessons]);

  const StatCard = ({ icon, label, value, color = '#7c4dff' }: { icon: React.ReactNode; label: string; value: string | number; color?: string }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 140 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Box sx={{ color }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
    </Paper>
  );

  const chapterPct = stats.totalChapters > 0 ? Math.round((stats.completedChapters / stats.totalChapters) * 100) : 0;
  const scorePct = Math.round(stats.avgScore * 100);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Progress Overview</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {selectedBookId ? `Showing stats for selected textbook` : 'Showing stats across all textbooks'}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        <StatCard icon={<MenuBookIcon sx={{ fontSize: 20 }} />} label="Textbooks" value={stats.books} />
        <StatCard icon={<CheckCircleIcon sx={{ fontSize: 20 }} />} label="Chapters Done" value={`${stats.completedChapters}/${stats.totalChapters}`} color="#4caf50" />
        <StatCard icon={<QuizIcon sx={{ fontSize: 20 }} />} label="Quiz Attempts" value={stats.attempts} color="#ff9800" />
        <StatCard icon={<SchoolIcon sx={{ fontSize: 20 }} />} label="Lessons Taken" value={stats.lessons} color="#2196f3" />
      </Box>

      {/* Progress bars */}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Overall Progress</Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Study Plan Completion</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{chapterPct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={chapterPct}
            sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: '#7c4dff', borderRadius: 4 } }}
          />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Average Quiz Score</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: scorePct >= 70 ? '#4caf50' : scorePct > 0 ? '#ff9800' : 'text.secondary' }}>
              {stats.attempts > 0 ? `${scorePct}%` : 'N/A'}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={scorePct}
            sx={{ height: 8, borderRadius: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: scorePct >= 70 ? '#4caf50' : '#ff9800', borderRadius: 4 } }}
          />
        </Box>
      </Paper>

      {/* Per-book breakdown */}
      {stats.perBook.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Per Textbook</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {stats.perBook.map(({ book, quizzes, attempts, lessons, totalChapters, completedChapters, avgScore }) => {
              const pct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
              return (
                <Paper key={book.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{book.name}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ height: 6, borderRadius: 3, mb: 1, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: '#7c4dff', borderRadius: 3 } }}
                  />
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <Chip label={`${completedChapters}/${totalChapters} chapters`} size="small" sx={{ fontSize: 11 }} />
                    <Chip label={`${quizzes} quizzes`} size="small" sx={{ fontSize: 11 }} />
                    <Chip label={`${attempts} attempts`} size="small" sx={{ fontSize: 11 }} />
                    <Chip label={`${lessons} lessons`} size="small" sx={{ fontSize: 11 }} />
                    {attempts > 0 && <Chip label={`Avg: ${Math.round(avgScore * 100)}%`} size="small" color={avgScore >= 0.7 ? 'success' : 'warning'} sx={{ fontSize: 11, fontWeight: 600 }} />}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </>
      )}

      {stats.books === 0 && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Upload textbooks and start studying to see your progress here.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

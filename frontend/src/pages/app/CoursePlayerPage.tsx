import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  LinearProgress,
  Tooltip,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Paper,
  Collapse,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import QuizIcon from '@mui/icons-material/Quiz';
import { useCourseStore, getYouTubeId, getVideoQuiz, QuizQuestion } from '@/store/courseStore';
import toast from 'react-hot-toast';

// --- Video Quiz Component ---
function VideoQuiz({
  courseId,
  videoId,
}: {
  courseId: string;
  videoId: string;
}) {
  const dk = useTheme().palette.mode === 'dark';
  const questions = getVideoQuiz(videoId);
  const completeQuiz = useCourseStore((s) => s.completeQuiz);
  const quizProgress = useCourseStore((s) =>
    s.quizProgress.find((q) => q.courseId === courseId && q.videoId === videoId)
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [open, setOpen] = useState(false);

  // Reset when video changes
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setOpen(false);
  }, [videoId]);

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q: QuizQuestion) => {
      if (answers[q.id] === q.correctOptionId) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    completeQuiz(courseId, videoId, correct, questions.length);
    if (correct === questions.length) {
      toast.success('Perfect score! 🎉');
    } else {
      toast(`You got ${correct}/${questions.length} correct`, { icon: '📝' });
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const allAnswered = questions.every((q: QuizQuestion) => answers[q.id]);

  return (
    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <QuizIcon sx={{ fontSize: 18, color: quizProgress ? '#66bb6a' : '#9e9e9e' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
          Video Quiz
        </Typography>
        {quizProgress && (
          <Chip
            label={`${quizProgress.score}/${quizProgress.total} correct`}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              bgcolor: quizProgress.score === quizProgress.total ? (dk ? 'rgba(46,125,50,0.15)' : '#e8f5e9') : (dk ? 'rgba(230,81,0,0.15)' : '#fff3e0'),
              color: quizProgress.score === quizProgress.total ? '#2e7d32' : '#e65100',
            }}
          />
        )}
        <Typography variant="caption" color="text.secondary">
          {open ? '▾' : '▸'} {questions.length} questions
        </Typography>
      </Box>

      <Collapse in={open}>
        <Box sx={{ mt: 2 }}>
          {questions.map((q: QuizQuestion, qi: number) => {
            const isCorrect = submitted && answers[q.id] === q.correctOptionId;
            const isWrong = submitted && answers[q.id] && answers[q.id] !== q.correctOptionId;

            return (
              <Paper
                key={q.id}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderColor: submitted
                    ? isCorrect
                      ? '#a5d6a7'
                      : isWrong
                      ? '#ef9a9a'
                      : 'divider'
                    : 'divider',
                  bgcolor: submitted
                    ? isCorrect
                      ? (dk ? 'rgba(165,214,167,0.1)' : '#f1f8e9')
                      : isWrong
                      ? (dk ? 'rgba(198,40,40,0.08)' : '#fce4ec')
                      : 'background.paper'
                    : 'background.paper',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {qi + 1}. {q.question}
                </Typography>
                <FormControl>
                  <RadioGroup
                    value={answers[q.id] || ''}
                    onChange={(e) => handleSelect(q.id, e.target.value)}
                  >
                    {q.options.map((opt) => {
                      const isThisCorrect = submitted && opt.id === q.correctOptionId;
                      const isThisSelected = answers[q.id] === opt.id;
                      return (
                        <FormControlLabel
                          key={opt.id}
                          value={opt.id}
                          disabled={submitted}
                          control={<Radio size="small" sx={{ py: 0.3 }} />}
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: 13,
                                fontWeight: submitted && isThisCorrect ? 600 : 400,
                                color: submitted
                                  ? isThisCorrect
                                    ? '#2e7d32'
                                    : isThisSelected
                                    ? '#c62828'
                                    : 'text.secondary'
                                  : 'text.primary',
                              }}
                            >
                              {opt.text}
                              {submitted && isThisCorrect && ' ✓'}
                            </Typography>
                          }
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              </Paper>
            );
          })}

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            {!submitted ? (
              <Button
                variant="contained"
                size="small"
                disabled={!allAnswered}
                onClick={handleSubmit}
                sx={{
                  textTransform: 'none',
                  bgcolor: dk ? '#1A2B3C' : '#616161',
                  '&:hover': { bgcolor: dk ? '#243B4F' : '#424242' },
                  '&.Mui-disabled': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#e0e0e0' },
                }}
              >
                Submit Quiz
              </Button>
            ) : (
              <>
                <Chip
                  label={`Score: ${score}/${questions.length}`}
                  sx={{
                    fontWeight: 600,
                    bgcolor: score === questions.length ? (dk ? 'rgba(46,125,50,0.15)' : '#e8f5e9') : (dk ? 'rgba(230,81,0,0.15)' : '#fff3e0'),
                    color: score === questions.length ? '#2e7d32' : '#e65100',
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRetake}
                  sx={{ textTransform: 'none', borderColor: 'divider', color: 'text.secondary' }}
                >
                  Retake
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

export default function CoursePlayerPage() {
  const dk = useTheme().palette.mode === 'dark';
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const course = useCourseStore((s) => s.courses.find((c) => c.id === courseId));
  const progress = useCourseStore((s) => s.progress);
  const quizProgress = useCourseStore((s) => s.quizProgress);
  const markVideoCompleted = useCourseStore((s) => s.markVideoCompleted);
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress);

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const playerRef = useRef<HTMLIFrameElement>(null);
  const checkIntervalRef = useRef<number | null>(null);

  // Find first unwatched video on mount
  useEffect(() => {
    if (!course) return;
    const firstUnwatched = course.videos.findIndex(
      (v) => !progress.find((p) => p.courseId === course.id && p.videoId === v.id && p.completed)
    );
    if (firstUnwatched >= 0) {
      setActiveVideoIndex(firstUnwatched);
    }
  }, [course?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-mark video as completed after a delay (simulates watching)
  // Since we can't easily get YouTube iframe playback state without the iFrame API,
  // we use a timer: mark completed 30 seconds after selecting a video
  const startWatchTimer = useCallback(
    (videoId: string) => {
      if (checkIntervalRef.current) {
        clearTimeout(checkIntervalRef.current);
      }
      if (!courseId) return;

      // Check if already completed
      const existing = progress.find(
        (p) => p.courseId === courseId && p.videoId === videoId && p.completed
      );
      if (existing) return;

      // Mark completed after 30 seconds of "watching"
      checkIntervalRef.current = window.setTimeout(() => {
        markVideoCompleted(courseId, videoId);
        toast.success('Video marked as watched!', { duration: 2000 });
      }, 30000);
    },
    [courseId, markVideoCompleted, progress]
  );

  // Start timer when active video changes
  useEffect(() => {
    if (!course) return;
    const video = course.videos[activeVideoIndex];
    if (video) {
      startWatchTimer(video.id);
    }
    return () => {
      if (checkIntervalRef.current) {
        clearTimeout(checkIntervalRef.current);
      }
    };
  }, [activeVideoIndex, course, startWatchTimer]);

  if (!course) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Course not found</Typography>
      </Box>
    );
  }

  const activeVideo = course.videos[activeVideoIndex];
  const youtubeId = activeVideo ? getYouTubeId(activeVideo.youtubeUrl) : null;
  const courseProgress = getCourseProgress(course.id);

  const isVideoCompleted = (videoId: string) =>
    progress.some((p) => p.courseId === course.id && p.videoId === videoId && p.completed);

  const handleVideoSelect = (index: number) => {
    setActiveVideoIndex(index);
  };

  const handleNext = () => {
    if (activeVideoIndex < course.videos.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1);
    }
  };

  const handleMarkComplete = () => {
    if (activeVideo && courseId) {
      markVideoCompleted(courseId, activeVideo.id);
      toast.success('Marked as watched!');
      if (checkIntervalRef.current) {
        clearTimeout(checkIntervalRef.current);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: '100vh' }}>
      {/* Main video area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Tooltip title="Back to courses">
            <IconButton size="small" onClick={() => navigate('/app/education')} sx={{ color: 'text.secondary' }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, flex: 1 }}>
            {course.title}
          </Typography>
          <Chip
            label={`${courseProgress.completed}/${courseProgress.total} completed`}
            size="small"
            sx={{ height: 24, fontSize: 12, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }}
          />
        </Box>

        {/* Video player */}
        <Box sx={{ bgcolor: '#000', position: 'relative', width: '100%', pt: '56.25%' /* 16:9 */ }}>
          {youtubeId ? (
            <iframe
              ref={playerRef}
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          ) : (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Typography>Invalid video URL</Typography>
            </Box>
          )}
        </Box>

        {/* Video info + controls */}
        <Box sx={{ px: 3, py: 2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              {activeVideo?.title}
            </Typography>
            {activeVideo && !isVideoCompleted(activeVideo.id) && (
              <Tooltip title="Mark as watched">
                <Chip
                  label="Mark complete"
                  size="small"
                  onClick={handleMarkComplete}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                    '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee' },
                    fontSize: 12,
                  }}
                />
              </Tooltip>
            )}
            {activeVideo && isVideoCompleted(activeVideo.id) && (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                label="Watched"
                size="small"
                sx={{ bgcolor: dk ? 'rgba(46,125,50,0.15)' : '#e8f5e9', color: '#2e7d32', fontSize: 12, '& .MuiChip-icon': { color: '#2e7d32' } }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Video {activeVideoIndex + 1} of {course.videos.length}
              {activeVideo?.duration && ` · ${activeVideo.duration}`}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
              <Tooltip title="Previous">
                <span>
                  <IconButton size="small" onClick={handlePrevious} disabled={activeVideoIndex === 0}>
                    <SkipPreviousIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Next">
                <span>
                  <IconButton size="small" onClick={handleNext} disabled={activeVideoIndex === course.videos.length - 1}>
                    <SkipNextIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {/* Overall progress */}
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={courseProgress.percent}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee',
                '& .MuiLinearProgress-bar': {
                  bgcolor: courseProgress.percent === 100 ? '#66bb6a' : '#9e9e9e',
                  borderRadius: 2,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {courseProgress.percent}%
            </Typography>
          </Box>
        </Box>

        {/* Quiz section */}
        {activeVideo && courseId && (
          <VideoQuiz courseId={courseId} videoId={activeVideo.id} />
        )}

        {/* Course description */}
        {course.description && (
          <Box sx={{ px: 3, py: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {course.description}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Right panel — video list */}
      <Box
        sx={{
          width: 320,
          flexShrink: 0,
          borderLeft: '1px solid',
          borderColor: 'divider',
          bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fafafa',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Course Content
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {courseProgress.completed} of {courseProgress.total} videos watched
          </Typography>
        </Box>

        <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {course.videos.map((video, index) => {
            const completed = isVideoCompleted(video.id);
            const isActive = index === activeVideoIndex;
            const qp = quizProgress.find(
              (q) => q.courseId === course.id && q.videoId === video.id
            );

            return (
              <ListItemButton
                key={video.id}
                selected={isActive}
                onClick={() => handleVideoSelect(index)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&.Mui-selected': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {completed ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: '#66bb6a' }} />
                  ) : isActive ? (
                    <PlayCircleIcon sx={{ fontSize: 20, color: dk ? '#aaa' : '#616161' }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={video.title}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {video.duration && <span>{video.duration}</span>}
                      {qp && (
                        <Chip
                          label={`${qp.score}/${qp.total}`}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: 10,
                            ml: 0.5,
                            bgcolor: qp.score === qp.total ? (dk ? 'rgba(46,125,50,0.15)' : '#e8f5e9') : (dk ? 'rgba(230,81,0,0.15)' : '#fff3e0'),
                            color: qp.score === qp.total ? '#2e7d32' : '#e65100',
                            '& .MuiChip-label': { px: 0.5 },
                          }}
                        />
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    noWrap: true,
                    color: completed ? 'text.secondary' : 'text.primary',
                    sx: completed ? { textDecoration: 'line-through', textDecorationColor: dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd' } : undefined,
                  }}
                  secondaryTypographyProps={{ fontSize: 11, component: 'div' }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

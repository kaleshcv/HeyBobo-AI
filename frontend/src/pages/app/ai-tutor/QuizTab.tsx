import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import QuizIcon from '@mui/icons-material/Quiz';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import toast from 'react-hot-toast';
import { useAITutorStore } from '@/store/aiTutorStore';
import { generateQuiz, generateRevisionPlan } from '@/lib/gemini';
import { aiQuizApi, aiAttemptApi, aiRevisionApi } from '@/lib/api';
import { errorLogger } from '@/lib/errorLogger';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer';
import { ConfettiBlast } from '@/components/animations/ConfettiBlast';
import { ScoreReveal } from '@/components/animations/ScoreReveal';

interface Props {
  selectedBookId: string | null;
}

export default function QuizTab({ selectedBookId }: Props) {
  const dk = useTheme().palette.mode === 'dark';
  const {
    textbooks, quizzes, setQuizzes, addQuiz, removeQuiz,
    quizAttempts, setQuizAttempts, addQuizAttempt,
    addRevisionPlan, setRevisionPlans, studyPlans,
  } = useAITutorStore();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [_currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load quizzes and attempts from DB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizRes, attemptRes, revisionRes] = await Promise.all([
          aiQuizApi.getAll(),
          aiAttemptApi.getAll(),
          aiRevisionApi.getAll(),
        ]);
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
      } catch (err) {
        errorLogger.warn('Failed to load quiz data from DB', 'QuizTab', { meta: { error: String(err) } });
      }
    };
    loadData();
  }, []);

  const activeBook = textbooks.find((b) => b.id === selectedBookId);
  const bookQuizzes = selectedBookId
    ? quizzes.filter((q) => q.textbookId === selectedBookId)
    : quizzes;

  // Get chapter titles from study plans for quick topic selection
  const planChapters = studyPlans
    .filter((p) => !selectedBookId || p.textbookId === selectedBookId)
    .flatMap((p) => p.chapters.map((c) => c.title));

  const handleGenerate = async () => {
    if (!activeBook) {
      toast.error('Select a textbook from the Textbooks tab');
      return;
    }
    const n = parseInt(numQuestions);
    if (!n || n < 1 || n > 30) {
      toast.error('Enter 1-30 questions');
      return;
    }
    setIsGenerating(true);
    try {
      const json = await generateQuiz(activeBook.name, activeBook.extractedText, topic || 'General', n);
      const data = JSON.parse(json);
      const clientId = `quiz-${Date.now()}`;
      const quiz = {
        id: clientId,
        clientId,
        textbookId: activeBook.id,
        title: data.title || `Quiz: ${topic || 'General'}`,
        questions: (data.questions || []).map((q: any, idx: number) => ({
          id: q.id || `q-${idx}`,
          question: q.question,
          options: q.options || [],
          correctIndex: q.correctIndex ?? 0,
          explanation: q.explanation || '',
        })),
        createdAt: new Date().toISOString(),
      };
      // Save to DB
      try {
        await aiQuizApi.upsert({
          clientId: quiz.clientId,
          textbookId: quiz.textbookId,
          title: quiz.title,
          questions: quiz.questions,
        });
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Unknown error';
        errorLogger.warn('Failed to save quiz to DB', 'QuizTab', { meta: { error: String(err) } });
        toast.error(`Quiz saved locally but not synced: ${msg}`);
      }
      addQuiz(quiz);
      toast.success(`Quiz created with ${quiz.questions.length} questions!`);
    } catch (err: any) {
      errorLogger.error('Failed to generate quiz: ' + (err?.message || 'Unknown error'), 'QuizTab', { stack: err?.stack });
      toast.error('Failed to generate quiz: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    setActiveQuiz(quizId);
    setAnswers({});
    setShowResults(false);
    setCurrentAttemptId(null);
  };

  const handleSubmit = async () => {
    const quiz = quizzes.find((q) => q.id === activeQuiz || q.clientId === activeQuiz);
    if (!quiz) return;
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score++;
    });
    const attemptClientId = `attempt-${Date.now()}`;
    setCurrentAttemptId(attemptClientId);

    const attempt = {
      id: attemptClientId,
      clientId: attemptClientId,
      quizId: quiz.id,
      textbookId: quiz.textbookId,
      answers,
      score,
      total: quiz.questions.length,
      completedAt: new Date().toISOString(),
    };

    // Save attempt to DB
    try {
      await aiAttemptApi.save({
        clientId: attemptClientId,
        quizId: quiz.clientId || quiz.id,
        textbookId: quiz.textbookId,
        answers,
        score,
        total: quiz.questions.length,
        completedAt: attempt.completedAt,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      errorLogger.warn('Failed to save quiz attempt to DB', 'QuizTab', { meta: { error: String(err) } });
      toast.error(`Quiz result saved locally but not synced: ${msg}`);
    }

    addQuizAttempt(attempt);
    setShowResults(true);
    const pct = Math.round((score / quiz.questions.length) * 100);

    // Trigger confetti for good scores (>= 80%)
    if (pct >= 80) {
      setShowConfetti(true);
    }

    toast.success(`Score: ${score}/${quiz.questions.length} (${pct}%)`);

    // Auto-generate revision plan on fail (<70%)
    if (pct < 70) {
      const wrongQs = quiz.questions
        .filter((q) => answers[q.id] !== q.correctIndex)
        .map((q) => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          userAnswer: answers[q.id] ?? -1,
        }));
      generateRevisionPlan(quiz.title, wrongQs)
        .then(async (json) => {
          const data = JSON.parse(json);
          const revClientId = `rev-${Date.now()}`;
          const revPlan = {
            id: revClientId,
            clientId: revClientId,
            quizAttemptId: attemptClientId,
            textbookId: quiz.textbookId,
            quizTitle: quiz.title,
            score,
            total: quiz.questions.length,
            weakAreas: (data.weakAreas || []).map((w: any) => ({
              topic: w.topic || 'Unknown',
              weakness: w.weakness || '',
              action: w.action || '',
              priority: ['high', 'medium', 'low'].includes(w.priority) ? w.priority : 'medium',
            })),
            summary: data.summary || 'Review the topics you got wrong.',
            createdAt: new Date().toISOString(),
            dismissed: false,
          };
          // Save revision plan to DB
          try {
            await aiRevisionApi.save({
              clientId: revClientId,
              quizAttemptId: attemptClientId,
              textbookId: quiz.textbookId,
              quizTitle: quiz.title,
              score,
              total: quiz.questions.length,
              weakAreas: revPlan.weakAreas,
              summary: revPlan.summary,
            });
          } catch (err) {
            errorLogger.warn('Failed to save revision plan to DB', 'QuizTab', { meta: { error: String(err) } });
          }
          addRevisionPlan(revPlan);
          toast('Revision plan created — check your Dashboard', { icon: '📋' });
        })
        .catch((e) => { errorLogger.warn('Failed to generate revision plan', 'QuizTab', { meta: { error: String(e) } }); });
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizClientId?: string) => {
    const idToDelete = quizClientId || quizId;
    try {
      await aiQuizApi.delete(idToDelete);
    } catch (err) {
      errorLogger.warn('Failed to delete quiz from DB', 'QuizTab', { meta: { error: String(err) } });
    }
    removeQuiz(quizId);
  };

  const currentQuiz = quizzes.find((q) => q.id === activeQuiz || q.clientId === activeQuiz);

  // Taking a quiz
  if (currentQuiz && activeQuiz) {
    const totalQ = currentQuiz.questions.length;
    const answeredCount = Object.keys(answers).length;
    let score = 0;
    if (showResults) {
      currentQuiz.questions.forEach((q) => {
        if (answers[q.id] === q.correctIndex) score++;
      });
    }

    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2.5, md: 4 }, py: 3 }}>
        <ConfettiBlast trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Button size="small" onClick={() => setActiveQuiz(null)} sx={{ textTransform: 'none' }}>
              ← Back to Quizzes
            </Button>
            <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>{currentQuiz.title}</Typography>
            {showResults && (
              <Chip
                label={`${score}/${totalQ} (${Math.round((score / totalQ) * 100)}%)`}
                color={score / totalQ >= 0.7 ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </motion.div>

        {!showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <LinearProgress
              variant="determinate"
              value={(answeredCount / totalQ) * 100}
              sx={{ mb: 2, borderRadius: 1, height: 6, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#7c4dff' } }}
            />
          </motion.div>
        )}

        {showResults ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '24px' }}
          >
            <Box sx={{ my: 3 }}>
              <ScoreReveal score={score} total={totalQ} label="Quiz Score" />
            </Box>
          </motion.div>
        ) : null}

        <StaggerContainer staggerDelay={0.05}>
          {currentQuiz.questions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <StaggerItem key={q.id}>
                <AnimatedCard
                  delay={showResults ? 0 : idx * 0.05}
                  hover={!showResults}
                >
                  <Paper variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, borderColor: showResults ? (isCorrect ? '#4caf50' : userAnswer !== undefined ? '#f44336' : 'divider') : 'divider' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {idx + 1}. {q.question}
                    </Typography>
                    <RadioGroup
                      value={userAnswer ?? ''}
                      onChange={(e) => !showResults && setAnswers((prev) => ({ ...prev, [q.id]: parseInt(e.target.value) }))}
                    >
                      {q.options.map((opt, oi) => (
                        <FormControlLabel
                          key={oi}
                          value={oi}
                          control={<Radio size="small" disabled={showResults} sx={{ '&.Mui-checked': { color: '#7c4dff' } }} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="body2" sx={{ color: showResults && oi === q.correctIndex ? '#2e7d32' : 'text.primary', fontWeight: showResults && oi === q.correctIndex ? 600 : 400 }}>
                                {opt}
                              </Typography>
                              {showResults && oi === q.correctIndex && <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />}
                              {showResults && userAnswer === oi && oi !== q.correctIndex && <CancelIcon sx={{ fontSize: 16, color: '#f44336' }} />}
                            </Box>
                          }
                          sx={{ mb: 0.25 }}
                        />
                      ))}
                    </RadioGroup>
                    {showResults && q.explanation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                      >
                        <Typography variant="caption" sx={{ display: 'block', mt: 1, p: 1, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 1, color: 'text.secondary' }}>
                          💡 {q.explanation}
                        </Typography>
                      </motion.div>
                    )}
                  </Paper>
                </AnimatedCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            {!showResults ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={answeredCount < totalQ}
                sx={{ bgcolor: '#7c4dff', '&:hover': { bgcolor: '#651fff' }, textTransform: 'none' }}
              >
                Submit ({answeredCount}/{totalQ} answered)
              </Button>
            ) : (
              <Button
                variant="outlined"
                startIcon={<ReplayIcon />}
                onClick={() => { handleStartQuiz(activeQuiz); setShowConfetti(false); }}
                sx={{ textTransform: 'none' }}
              >
                Retake Quiz
              </Button>
            )}
          </Box>
        </motion.div>
      </Box>
    );
  }

  // Quiz list view
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2.5, md: 4 }, py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <QuizIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Quizzes</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          AI generates quizzes from your textbook to test your understanding.
        </Typography>
      </motion.div>

      {!activeBook ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            <QuizIcon sx={{ fontSize: 40, color: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Select a textbook from the Textbooks tab to create quizzes.
            </Typography>
          </Paper>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Generate Quiz</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <TextField
                  label="Topic / Chapter (optional)"
                  size="small"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  sx={{ flex: 1, minWidth: 200 }}
                  placeholder="Leave blank for general quiz"
                />
                <TextField
                  label="Questions"
                  type="number"
                  size="small"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1, max: 30 }}
                />
                <Button
                  variant="contained"
                  startIcon={isGenerating ? undefined : <AutoAwesomeIcon />}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  sx={{ bgcolor: '#7c4dff', '&:hover': { bgcolor: '#651fff' }, textTransform: 'none' }}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </Box>
              {isGenerating && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}

              {/* Quick topic chips from study plan */}
              {planChapters.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, lineHeight: '24px' }}>Quick:</Typography>
                  {planChapters.slice(0, 6).map((ch, i) => (
                    <Chip key={i} label={ch} size="small" variant="outlined" onClick={() => setTopic(ch)} sx={{ fontSize: 11, cursor: 'pointer' }} />
                  ))}
                </Box>
              )}
            </Paper>
          </motion.div>

          {bookQuizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary">No quizzes yet. Generate one above.</Typography>
              </Box>
            </motion.div>
          ) : (
            <StaggerContainer staggerDelay={0.06}>
              {bookQuizzes.map((quiz) => {
                const attempts = quizAttempts.filter((a) => a.quizId === quiz.id || a.quizId === quiz.clientId);
                const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
                return (
                  <StaggerItem key={quiz.id}>
                    <AnimatedCard
                      onClick={() => handleStartQuiz(quiz.id)}
                      hover
                    >
                      <Paper
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2, cursor: 'pointer' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <QuizIcon sx={{ fontSize: 20, color: '#7c4dff' }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{quiz.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {quiz.questions.length} questions · {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
                              {bestScore !== null && ` · Best: ${bestScore}/${quiz.questions.length}`}
                            </Typography>
                          </Box>
                          {bestScore !== null && (
                            <Chip
                              label={`${Math.round((bestScore / quiz.questions.length) * 100)}%`}
                              size="small"
                              color={bestScore / quiz.questions.length >= 0.7 ? 'success' : 'warning'}
                              sx={{ fontWeight: 600, fontSize: 11 }}
                            />
                          )}
                          <Tooltip title="Delete quiz">
                            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz.id, quiz.clientId); }}>
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Paper>
                    </AnimatedCard>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </>
      )}
    </Box>
  );
}

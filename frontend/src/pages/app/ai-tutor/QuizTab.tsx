import { useState } from 'react';
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
import QuizIcon from '@mui/icons-material/Quiz';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ReplayIcon from '@mui/icons-material/Replay';
import toast from 'react-hot-toast';
import { useAITutorStore } from '@/store/aiTutorStore';
import { generateQuiz, generateRevisionPlan } from '@/lib/gemini';
import { errorLogger } from '@/lib/errorLogger';

interface Props {
  selectedBookId: string | null;
}

export default function QuizTab({ selectedBookId }: Props) {
  const dk = useTheme().palette.mode === 'dark';
  const { textbooks, quizzes, addQuiz, removeQuiz, quizAttempts, addQuizAttempt, addRevisionPlan, studyPlans } = useAITutorStore();
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const activeBook = textbooks.find((b) => b.id === selectedBookId);
  const bookQuizzes = quizzes.filter((q) => q.textbookId === selectedBookId);

  // Get chapter titles from study plans for quick topic selection
  const planChapters = studyPlans
    .filter((p) => p.textbookId === selectedBookId)
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
      const quiz = {
        id: `quiz-${Date.now()}`,
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
  };

  const handleSubmit = () => {
    const quiz = quizzes.find((q) => q.id === activeQuiz);
    if (!quiz) return;
    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) score++;
    });
    const attemptId = `attempt-${Date.now()}`;
    addQuizAttempt({
      id: attemptId,
      quizId: quiz.id,
      textbookId: quiz.textbookId,
      answers,
      score,
      total: quiz.questions.length,
      completedAt: new Date().toISOString(),
    });
    setShowResults(true);
    const pct = Math.round((score / quiz.questions.length) * 100);
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
        .then((json) => {
          const data = JSON.parse(json);
          addRevisionPlan({
            id: `rev-${Date.now()}`,
            quizAttemptId: attemptId,
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
          });
          toast('Revision plan created — check your Dashboard', { icon: '📋' });
        })
        .catch((e) => { errorLogger.warn('Failed to generate revision plan', 'QuizTab', { meta: { error: String(e) } }); });
    }
  };

  const currentQuiz = quizzes.find((q) => q.id === activeQuiz);

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

        {!showResults && (
          <LinearProgress
            variant="determinate"
            value={(answeredCount / totalQ) * 100}
            sx={{ mb: 2, borderRadius: 1, height: 6, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5', '& .MuiLinearProgress-bar': { bgcolor: '#7c4dff' } }}
          />
        )}

        {currentQuiz.questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctIndex;
          return (
            <Paper key={q.id} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, borderColor: showResults ? (isCorrect ? '#4caf50' : userAnswer !== undefined ? '#f44336' : 'divider') : 'divider' }}>
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
                <Typography variant="caption" sx={{ display: 'block', mt: 1, p: 1, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5', borderRadius: 1, color: 'text.secondary' }}>
                  💡 {q.explanation}
                </Typography>
              )}
            </Paper>
          );
        })}

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
              onClick={() => handleStartQuiz(activeQuiz)}
              sx={{ textTransform: 'none' }}
            >
              Retake Quiz
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  // Quiz list view
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2.5, md: 4 }, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <QuizIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Quizzes</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        AI generates quizzes from your textbook to test your understanding.
      </Typography>

      {!activeBook ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <QuizIcon sx={{ fontSize: 40, color: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Select a textbook from the Textbooks tab to create quizzes.
          </Typography>
        </Paper>
      ) : (
        <>
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

          {bookQuizzes.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">No quizzes yet. Generate one above.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {bookQuizzes.map((quiz) => {
                const attempts = quizAttempts.filter((a) => a.quizId === quiz.id);
                const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
                return (
                  <Paper
                    key={quiz.id}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fafafa' } }}
                    onClick={() => handleStartQuiz(quiz.id)}
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
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeQuiz(quiz.id); }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

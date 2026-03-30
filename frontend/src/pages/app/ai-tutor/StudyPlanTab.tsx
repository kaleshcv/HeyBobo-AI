import { useState } from 'react';
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
import toast from 'react-hot-toast';
import { useAITutorStore } from '@/store/aiTutorStore';
import { generateStudyPlan, teachContent } from '@/lib/gemini';
import { errorLogger } from '@/lib/errorLogger';

interface Props {
  selectedBookId: string | null;
  onTeach: (content: string) => void;
}

export default function StudyPlanTab({ selectedBookId, onTeach }: Props) {
  const dk = useTheme().palette.mode === 'dark';
  const { textbooks, studyPlans, addStudyPlan, removeStudyPlan, toggleChapterComplete, addLesson } = useAITutorStore();
  const [days, setDays] = useState('14');
  const [hours, setHours] = useState('3');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [teachingTopic, setTeachingTopic] = useState<string | null>(null);

  const activeBook = textbooks.find((b) => b.id === selectedBookId);
  const bookPlans = studyPlans.filter((p) => p.textbookId === selectedBookId);

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
      const plan = {
        id: `plan-${Date.now()}`,
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
      addStudyPlan(plan);
      setExpandedPlan(plan.id);
      toast.success('Study plan created!');
    } catch (err: any) {
      errorLogger.error('Failed to generate study plan: ' + (err?.message || 'Unknown error'), 'StudyPlanTab', { stack: err?.stack });
      toast.error('Failed to generate study plan: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTeachTopic = async (_planId: string, topic: string) => {
    if (!activeBook) return;
    setTeachingTopic(topic);
    try {
      const content = await teachContent(activeBook.name, activeBook.extractedText, topic);
      addLesson({
        id: `lesson-${Date.now()}`,
        textbookId: activeBook.id,
        topic,
        content,
        completedAt: new Date().toISOString(),
      });
      onTeach(content);
      toast.success(`Lesson on "${topic}" ready!`);
    } catch (err: any) {
      errorLogger.error('Failed to generate lesson: ' + (err?.message || 'Unknown error'), 'StudyPlanTab', { stack: err?.stack });
      toast.error('Failed to generate lesson: ' + (err?.message || 'Unknown error'));
    } finally {
      setTeachingTopic(null);
    }
  };

  const getPlanProgress = (plan: typeof bookPlans[0]) => {
    if (plan.chapters.length === 0) return 0;
    return Math.round((plan.chapters.filter((c) => c.completed).length / plan.chapters.length) * 100);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Study Plans</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        AI generates a personalized study plan from your textbook. Track your progress through each chapter.
      </Typography>

      {!activeBook ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <CalendarTodayIcon sx={{ fontSize: 40, color: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Select a textbook from the Textbooks tab to create a study plan.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Generate form */}
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
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

          {/* Plans list */}
          {bookPlans.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No study plans yet. Generate one above.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {bookPlans.map((plan) => {
                const progress = getPlanProgress(plan);
                const isExpanded = expandedPlan === plan.id;
                return (
                  <Paper key={plan.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                      sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: dk ? 'rgba(255,255,255,0.03)' : '#fafafa' } }}
                      onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 20, color: '#7c4dff' }} />
                        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
                          {plan.title}
                        </Typography>
                        <Chip
                          label={`${progress}%`}
                          size="small"
                          sx={{
                            bgcolor: progress === 100 ? '#e8f5e9' : '#f5f5f5',
                            color: progress === 100 ? '#2e7d32' : 'text.secondary',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                        <Tooltip title="Delete plan">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeStudyPlan(plan.id); }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        {isExpanded ? <ExpandLessIcon sx={{ fontSize: 20 }} /> : <ExpandMoreIcon sx={{ fontSize: 20 }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {plan.totalDays} days · {plan.hoursPerDay}h/day · {plan.chapters.length} chapters
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
                                onChange={() => toggleChapterComplete(plan.id, ch.id)}
                                size="small"
                                sx={{ mt: -0.5, color: '#7c4dff', '&.Mui-checked': { color: '#7c4dff' } }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, textDecoration: ch.completed ? 'line-through' : 'none' }}>
                                  {idx + 1}. {ch.title}
                                </Typography>
                                {ch.description && (
                                  <Typography variant="caption" color="text.secondary">{ch.description}</Typography>
                                )}
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                  <Chip label={`${ch.days} day${ch.days > 1 ? 's' : ''}`} size="small" sx={{ fontSize: 10, height: 20 }} />
                                  {ch.topics.slice(0, 3).map((t, ti) => (
                                    <Chip key={ti} label={t} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                                  ))}
                                  {ch.topics.length > 3 && (
                                    <Chip label={`+${ch.topics.length - 3} more`} size="small" sx={{ fontSize: 10, height: 20 }} />
                                  )}
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
        </>
      )}
    </Box>
  );
}

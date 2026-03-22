#!/usr/bin/env python3
"""Write the complete AITutorPage.tsx with multi-tab education features"""

# We build the file content in parts to avoid string escaping issues with template literals
# Every ${...} in JS needs to be written carefully

def d(varExpr):
    """Helper to produce ${varExpr} without Python interpreting it"""
    return "${" + varExpr + "}"

content = f"""import {{ useState, useRef, useEffect, useCallback }} from 'react';
import {{
  Box, Typography, TextField, IconButton, Avatar, CircularProgress, Paper,
  Tooltip, List, ListItemButton, ListItemText, Divider, Drawer, Chip,
  LinearProgress, Tabs, Tab, Button, Radio, RadioGroup, FormControlLabel,
  FormControl, Checkbox, Badge,
}} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatIcon from '@mui/icons-material/Chat';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {{ GoogleGenerativeAI }} from '@google/generative-ai';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ============ TYPES ============
interface ChatMessage {{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}}

interface Conversation {{
  id: string;
  title: string;
  messages: ChatMessage[];
  bookId?: string;
  createdAt: string;
  updatedAt: string;
}}

interface Textbook {{
  id: string;
  name: string;
  size: number;
  pageCount: number;
  extractedText: string;
  subject?: string;
  createdAt: string;
}}

interface StudyPlan {{
  id: string;
  bookId: string;
  bookName: string;
  title: string;
  totalChapters: number;
  hoursPerDay: number;
  chapters: StudyChapter[];
  createdAt: string;
}}

interface StudyChapter {{
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
}}

interface QuizData {{
  id: string;
  bookId: string;
  bookName: string;
  title: string;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  completedAt?: string;
  createdAt: string;
}}

interface QuizQuestion {{
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex?: number;
}}

// ============ STORAGE ============
const SK = 'heybobo-ai-tutor';

function load<T>(key: string, fallback: T): T {{
  try {{
    const raw = localStorage.getItem(`{d('SK')}-{d('key')}`);
    return raw ? JSON.parse(raw) : fallback;
  }} catch {{
    return fallback;
  }}
}}

function save(key: string, data: any) {{
  localStorage.setItem(`{d('SK')}-{d('key')}`, JSON.stringify(data));
}}

// ============ PDF EXTRACTION ============
async function extractPdfText(file: File): Promise<{{ text: string; pageCount: number }}> {{
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({{ data: arrayBuffer }}).promise;
  const pageCount = pdf.numPages;
  const textParts: string[] = [];
  for (let i = 1; i <= pageCount; i++) {{
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
    textParts.push(pageText);
  }}
  return {{ text: textParts.join('\\n\\n'), pageCount }};
}}

// ============ GEMINI HELPERS ============
async function geminiGenerate(prompt: string): Promise<string> {{
  if (!genAI) throw new Error('Gemini API key not configured');
  const model = genAI.getGenerativeModel({{ model: 'gemini-2.5-flash' }});
  const result = await model.generateContent(prompt);
  return result.response.text();
}}

async function sendChat(message: string, history: ChatMessage[], bookText: string | null): Promise<string> {{
  let docSection = '';
  if (bookText) {{
    const truncated = bookText.substring(0, 100000);
    docSection = `\\n\\nThe student has uploaded a textbook. Here is its content:\\n--- Textbook Start ---\\n{d('truncated')}\\n--- Textbook End ---\\n\\nFocus your answers on the textbook content. Reference specific chapters, sections, or concepts from the textbook.`;
  }}
  const recent = history.slice(-20).map((m) => `{d("m.role === 'user' ? 'Student' : 'Tutor'")}: {d('m.content')}`).join('\\n');
  const prompt = `You are Heybobo, a university-level AI tutor. You help students understand their textbooks, explain difficult concepts, give real-world examples, and prepare them for exams. Be thorough but clear.{d('docSection')}

{d("recent ? `Previous conversation:\\n{d('recent')}\\n\\n` : ''")}Student: {d('message')}

Provide a helpful, educational response using markdown.`;
  return geminiGenerate(prompt);
}}

async function generateStudyPlan(bookText: string, bookName: string, hoursPerDay: number): Promise<string> {{
  const truncated = bookText.substring(0, 80000);
  const prompt = `You are an educational AI tutor. Analyze this textbook and create a detailed study plan.

Textbook: {d('bookName')}
Student can study {d('hoursPerDay')} hours per day.

Textbook content:
--- Start ---
{d('truncated')}
--- End ---

Create a study plan in this EXACT JSON format (no markdown, just raw JSON):
{{
  "title": "Study Plan for [Book Name]",
  "chapters": [
    {{
      "title": "Chapter/Topic title",
      "summary": "Brief description of what this covers and key concepts",
      "estimatedMinutes": 60
    }}
  ]
}}

Break the textbook into logical study chapters/topics. Each should be a focused study session. Estimate realistic minutes based on content density. Include 10-20 chapters covering the entire book.`;
  return geminiGenerate(prompt);
}}

async function generateQuiz(bookText: string, bookName: string, numQuestions: number, chapterFocus?: string): Promise<string> {{
  const truncated = bookText.substring(0, 80000);
  const focusSection = chapterFocus ? `\\nFocus specifically on: {d('chapterFocus')}` : '';
  const prompt = `You are a university professor creating an exam. Generate a quiz from this textbook.

Textbook: {d('bookName')}{d('focusSection')}

Textbook content:
--- Start ---
{d('truncated')}
--- End ---

Create exactly {d('numQuestions')} multiple-choice questions in this EXACT JSON format (no markdown, just raw JSON):
{{
  "title": "Quiz: [Topic]",
  "questions": [
    {{
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct, with reference to the textbook"
    }}
  ]
}}

Make questions progressively harder. Test conceptual understanding, not just memorization. Include application-based questions.`;
  return geminiGenerate(prompt);
}}

async function generateTeachingContent(bookText: string, chapterTitle: string): Promise<string> {{
  const truncated = bookText.substring(0, 80000);
  const prompt = `You are a university professor teaching a student. The student is studying this topic from their textbook:

Topic: {d('chapterTitle')}

Textbook content:
--- Start ---
{d('truncated')}
--- End ---

Teach this topic thoroughly as if giving a private lecture:
1. Start with an overview of what the student will learn
2. Explain each key concept clearly with examples
3. Use analogies and real-world applications
4. Highlight important formulas, definitions, or theorems
5. Provide practice problems or thought exercises
6. End with a summary of key takeaways

Use markdown formatting with headings, bullet points, bold for key terms, and code blocks where relevant.`;
  return geminiGenerate(prompt);
}}

// ============ HOOKS ============
function useSpeechRecognition() {{
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startListening = useCallback(() => {{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {{ toast.error('Speech recognition not supported'); return; }}
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e: SpeechRecognitionEvent) => {{
      let t = '';
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTranscript(t);
    }};
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r; r.start(); setIsListening(true);
  }}, []);
  const stopListening = useCallback(() => {{ recognitionRef.current?.stop(); setIsListening(false); }}, []);
  return {{ isListening, transcript, startListening, stopListening, setTranscript }};
}}

function useTextToSpeech() {{
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const speak = useCallback((text: string, messageId: string) => {{
    if (!window.speechSynthesis) {{ toast.error('TTS not supported'); return; }}
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1; u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const pref = voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) || voices.find((v) => v.lang.startsWith('en'));
    if (pref) u.voice = pref;
    u.onend = () => {{ setIsSpeaking(false); setSpeakingMessageId(null); }};
    u.onerror = () => {{ setIsSpeaking(false); setSpeakingMessageId(null); }};
    setIsSpeaking(true); setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(u);
  }}, []);
  const stopSpeaking = useCallback(() => {{ window.speechSynthesis.cancel(); setIsSpeaking(false); setSpeakingMessageId(null); }}, []);
  return {{ isSpeaking, speakingMessageId, speak, stopSpeaking }};
}}

// ============ MARKDOWN STYLES ============
const mdStyles = {{
  '& p': {{ m: 0, mb: 1, lineHeight: 1.7, color: 'text.primary', fontSize: 14 }},
  '& p:last-child': {{ mb: 0 }},
  '& code': {{ bgcolor: '#f5f5f5', px: 0.5, py: 0.25, borderRadius: 0.5, fontSize: 13, fontFamily: 'monospace' }},
  '& pre': {{ bgcolor: '#f5f5f5', p: 1.5, borderRadius: 1, overflow: 'auto', mb: 1, '& code': {{ bgcolor: 'transparent', p: 0 }} }},
  '& ul, & ol': {{ pl: 2.5, mb: 1 }},
  '& li': {{ mb: 0.5, fontSize: 14, lineHeight: 1.7, color: 'text.primary' }},
  '& h1, & h2, & h3, & h4': {{ mt: 1.5, mb: 0.5, fontWeight: 600, color: 'text.primary' }},
  '& blockquote': {{ borderLeft: '3px solid #e0e0e0', pl: 1.5, ml: 0, color: 'text.secondary' }},
}};

// ============ SUB COMPONENTS ============
function MessageBubble({{ message, isSpeaking, onSpeak, onStopSpeaking }}: {{
  message: ChatMessage; isSpeaking: boolean; onSpeak: () => void; onStopSpeaking: () => void;
}}) {{
  const isUser = message.role === 'user';
  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 2, px: {{ xs: 2, md: 0 }}, maxWidth: 768, mx: 'auto', width: '100%' }}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: isUser ? '#9e9e9e' : '#616161', fontSize: 12, fontWeight: 600, flexShrink: 0, mt: 0.5 }}>
        {{isUser ? 'U' : <SmartToyIcon sx={{ fontSize: 16 }} />}}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, display: 'block' }}>
          {{isUser ? 'You' : 'AI Tutor'}}
        </Typography>
        <Box sx={{mdStyles}}><ReactMarkdown>{{message.content}}</ReactMarkdown></Box>
        {{!isUser && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
            <Tooltip title="Copy"><IconButton size="small" onClick={{() => {{ navigator.clipboard.writeText(message.content); toast.success('Copied'); }}}} sx={{ color: 'text.secondary' }}><ContentCopyIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
            <Tooltip title={{isSpeaking ? 'Stop' : 'Read aloud'}}><IconButton size="small" onClick={{isSpeaking ? onStopSpeaking : onSpeak}} sx={{ color: isSpeaking ? 'text.primary' : 'text.secondary' }}>{{isSpeaking ? <StopIcon sx={{ fontSize: 16 }} /> : <VolumeUpIcon sx={{ fontSize: 16 }} />}}</IconButton></Tooltip>
          </Box>
        )}}
      </Box>
    </Box>
  );
}}

// ============ TEXTBOOKS TAB ============
function TextbooksTab({{ books, onUpload, onDelete, onSelect, isUploading, selectedId }}: {{
  books: Textbook[]; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: string) => void; onSelect: (id: string) => void;
  isUploading: boolean; selectedId: string | null;
}}) {{
  const fileRef = useRef<HTMLInputElement>(null);
  const fmtSize = (b: number) => b < 1024*1024 ? `{d('(b/1024).toFixed(1)')} KB` : `{d('(b/(1024*1024)).toFixed(1)')} MB`;
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>My Textbooks</Typography>
          <Typography variant="body2" color="text.secondary">Upload your university textbooks to study with AI</Typography>
        </Box>
        <Button variant="contained" startIcon={{<AddIcon />}} onClick={{() => fileRef.current?.click()}} disabled={{isUploading}}
          sx={{ bgcolor: '#424242', '&:hover': {{ bgcolor: '#333' }}, textTransform: 'none' }}>
          Upload Textbook
        </Button>
      </Box>
      <input ref={{fileRef}} type="file" accept="application/pdf" style={{{{ display: 'none' }}}} onChange={{onUpload}} />
      {{isUploading && <Box sx={{ mb: 2 }}><LinearProgress /><Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Extracting text from PDF...</Typography></Box>}}
      {{books.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2, cursor: 'pointer', '&:hover': {{ bgcolor: '#fafafa' }} }} onClick={{() => fileRef.current?.click()}}>
          <MenuBookIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>No textbooks yet</Typography>
          <Typography variant="body2" color="text.secondary">Upload a PDF textbook to get started</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: {{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }}, gap: 2 }}>
          {{books.map((book) => (
            <Paper key={{book.id}} variant="outlined" sx={{ p: 2, borderRadius: 2, cursor: 'pointer', border: selectedId === book.id ? '2px solid #424242' : undefined, transition: 'all 0.2s', '&:hover': {{ boxShadow: 1 }} }} onClick={{() => onSelect(book.id)}}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                <PictureAsPdfIcon sx={{ fontSize: 32, color: '#e57373', mt: 0.5 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>{{book.name}}</Typography>
                  <Typography variant="caption" color="text.secondary">{{book.pageCount}} pages · {{fmtSize(book.size)}}</Typography>
                </Box>
              </Box>
              {{book.subject && <Chip label={{book.subject}} size="small" sx={{ mb: 1, fontSize: 11 }} />}}
              <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Added {{new Date(book.createdAt).toLocaleDateString()}}</Typography>
                <Box sx={{ flex: 1 }} />
                <IconButton size="small" onClick={{(e) => {{ e.stopPropagation(); onDelete(book.id); }}}} sx={{ color: 'text.secondary', '&:hover': {{ color: '#f44336' }} }}>
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Paper>
          ))}}
        </Box>
      )}}
    </Box>
  );
}}

// ============ STUDY PLAN TAB ============
function StudyPlanTab({{ books, plans, setPlans, selectedBookId, setSelectedBookId }}: {{
  books: Textbook[]; plans: StudyPlan[]; setPlans: (p: StudyPlan[]) => void;
  selectedBookId: string | null; setSelectedBookId: (id: string | null) => void;
}}) {{
  const [generating, setGenerating] = useState(false);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [teachingContent, setTeachingContent] = useState<string | null>(null);
  const [teachingTitle, setTeachingTitle] = useState('');
  const [teachingLoading, setTeachingLoading] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const selectedBook = books.find((b) => b.id === selectedBookId);
  const activeBookPlans = plans.filter((p) => p.bookId === selectedBookId);
  const activePlan = plans.find((p) => p.id === activePlanId);

  const handleGenerate = async () => {{
    if (!selectedBook) {{ toast.error('Select a textbook first'); return; }}
    setGenerating(true);
    try {{
      const raw = await generateStudyPlan(selectedBook.extractedText, selectedBook.name, hoursPerDay);
      const jsonStr = raw.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      const plan: StudyPlan = {{
        id: `plan-{d('Date.now()')}`, bookId: selectedBook.id, bookName: selectedBook.name,
        title: parsed.title || `Study Plan for {d('selectedBook.name')}`,
        totalChapters: parsed.chapters.length, hoursPerDay,
        chapters: parsed.chapters.map((c: any, i: number) => ({{
          id: `ch-{d('i')}`, title: c.title, summary: c.summary,
          estimatedMinutes: c.estimatedMinutes || 60, completed: false,
        }})),
        createdAt: new Date().toISOString(),
      }};
      const updated = [plan, ...plans];
      setPlans(updated);
      setActivePlanId(plan.id);
      toast.success('Study plan created!');
    }} catch (err: any) {{
      toast.error('Failed to generate study plan: ' + (err?.message || 'Unknown error'));
    }} finally {{
      setGenerating(false);
    }}
  }};

  const toggleChapter = (planId: string, chapterId: string) => {{
    const updated = plans.map((p) => p.id === planId ? {{
      ...p, chapters: p.chapters.map((c) => c.id === chapterId ? {{ ...c, completed: !c.completed, completedAt: !c.completed ? new Date().toISOString() : undefined }} : c),
    }} : p);
    setPlans(updated);
  }};

  const handleTeach = async (chapterTitle: string) => {{
    if (!selectedBook) return;
    setTeachingLoading(true); setTeachingTitle(chapterTitle); setTeachingContent(null);
    try {{
      const content = await generateTeachingContent(selectedBook.extractedText, chapterTitle);
      setTeachingContent(content);
    }} catch (err: any) {{
      toast.error('Failed to generate lesson: ' + (err?.message || ''));
    }} finally {{
      setTeachingLoading(false);
    }}
  }};

  const completedCount = activePlan?.chapters.filter((c) => c.completed).length || 0;
  const totalCount = activePlan?.chapters.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (teachingContent || teachingLoading) {{
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Button startIcon={{<CloseIcon />}} onClick={{() => {{ setTeachingContent(null); setTeachingTitle(''); }}}} sx={{ mb: 2, textTransform: 'none', color: 'text.secondary' }}>Back to Study Plan</Button>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>{{teachingTitle}}</Typography>
        {{teachingLoading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={{32}} /><Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Preparing your lesson...</Typography></Box>
        ) : (
          <Box sx={{mdStyles}}><ReactMarkdown>{{teachingContent || ''}}</ReactMarkdown></Box>
        )}}
      </Box>
    );
  }}

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Study Plans</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>AI creates personalized study plans from your textbooks</Typography>

      {{/* Book selector + generate */}}
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Create New Study Plan</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 200, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>Select Textbook</Typography>
            <TextField select value={{selectedBookId || ''}} onChange={{(e) => setSelectedBookId(e.target.value || null)}} size="small" SelectProps={{{{ native: true }}}}>
              <option value="">Choose a textbook...</option>
              {{books.map((b) => <option key={{b.id}} value={{b.id}}>{{b.name}}</option>)}}
            </TextField>
          </FormControl>
          <FormControl sx={{ width: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>Hours/Day</Typography>
            <TextField type="number" value={{hoursPerDay}} onChange={{(e) => setHoursPerDay(Math.max(1, Math.min(12, Number(e.target.value))))}} size="small" inputProps={{{{ min: 1, max: 12 }}}} />
          </FormControl>
          <Button variant="contained" onClick={{handleGenerate}} disabled={{generating || !selectedBookId}} startIcon={{generating ? <CircularProgress size={{16}} /> : <SchoolIcon />}}
            sx={{ bgcolor: '#424242', '&:hover': {{ bgcolor: '#333' }}, textTransform: 'none', height: 40 }}>
            {{generating ? 'Generating...' : 'Generate Plan'}}
          </Button>
        </Box>
      </Paper>

      {{/* Active plan details */}}
      {{activePlan && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{{activePlan.title}}</Typography>
              <Typography variant="caption" color="text.secondary">{{activePlan.hoursPerDay}}h/day · {{totalCount}} chapters · {{progressPct}}% complete</Typography>
            </Box>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress variant="determinate" value={{progressPct}} size={{48}} sx={{ color: '#4caf50' }} />
              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11 }}>{{progressPct}}%</Typography>
              </Box>
            </Box>
          </Box>
          <LinearProgress variant="determinate" value={{progressPct}} sx={{ height: 6, borderRadius: 1, mb: 2, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': {{ bgcolor: '#4caf50' }} }} />
          {{activePlan.chapters.map((ch, idx) => (
            <Paper key={{ch.id}} variant="outlined" sx={{ p: 1.5, mb: 1, borderRadius: 1.5, bgcolor: ch.completed ? '#f1f8e9' : 'transparent', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Checkbox checked={{ch.completed}} onChange={{() => toggleChapter(activePlan.id, ch.id)}} size="small" sx={{ mt: -0.5, color: '#9e9e9e', '&.Mui-checked': {{ color: '#4caf50' }} }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, textDecoration: ch.completed ? 'line-through' : 'none', color: ch.completed ? 'text.secondary' : 'text.primary' }}>
                  {{idx + 1}}. {{ch.title}}
                </Typography>
                <Typography variant="caption" color="text.secondary">{{ch.summary}}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">{{ch.estimatedMinutes}} min</Typography>
                </Box>
              </Box>
              <Tooltip title="Start lesson">
                <IconButton size="small" onClick={{() => handleTeach(ch.title)}} sx={{ color: '#424242' }}>
                  <PlayArrowIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}}
        </Paper>
      )}}

      {{/* Plans list */}}
      {{activeBookPlans.length > 0 && !activePlan && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Your Plans</Typography>
          {{activeBookPlans.map((plan) => {{
            const done = plan.chapters.filter((c) => c.completed).length;
            const pct = Math.round((done / plan.totalChapters) * 100);
            return (
              <Paper key={{plan.id}} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': {{ boxShadow: 1 }} }} onClick={{() => setActivePlanId(plan.id)}}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{{plan.title}}</Typography>
                    <Typography variant="caption" color="text.secondary">{{plan.totalChapters}} chapters · {{done}}/{{plan.totalChapters}} done</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#4caf50' }}>{{pct}}%</Typography>
                    <LinearProgress variant="determinate" value={{pct}} sx={{ width: 60, height: 4, borderRadius: 1, mt: 0.5, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': {{ bgcolor: '#4caf50' }} }} />
                  </Box>
                </Box>
              </Paper>
            );
          }})}}
        </Box>
      )}}

      {{books.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
          <SchoolIcon sx={{ fontSize: 40, color: '#bdbdbd', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Upload a textbook first to create study plans</Typography>
        </Paper>
      )}}
    </Box>
  );
}}

// ============ QUIZ TAB ============
function QuizTab({{ books, quizzes, setQuizzes, selectedBookId, setSelectedBookId }}: {{
  books: Textbook[]; quizzes: QuizData[]; setQuizzes: (q: QuizData[]) => void;
  selectedBookId: string | null; setSelectedBookId: (id: string | null) => void;
}}) {{
  const [generating, setGenerating] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const selectedBook = books.find((b) => b.id === selectedBookId);
  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);

  const handleGenerate = async () => {{
    if (!selectedBook) {{ toast.error('Select a textbook first'); return; }}
    setGenerating(true);
    try {{
      const raw = await generateQuiz(selectedBook.extractedText, selectedBook.name, numQuestions);
      const jsonStr = raw.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      const quiz: QuizData = {{
        id: `quiz-{d('Date.now()')}`, bookId: selectedBook.id, bookName: selectedBook.name,
        title: parsed.title || `Quiz - {d('selectedBook.name')}`,
        questions: parsed.questions.map((q: any, i: number) => ({{ id: `q-{d('i')}`, ...q }})),
        totalQuestions: parsed.questions.length,
        createdAt: new Date().toISOString(),
      }};
      const updated = [quiz, ...quizzes];
      setQuizzes(updated);
      setActiveQuizId(quiz.id);
      setShowResults(false);
      toast.success('Quiz generated!');
    }} catch (err: any) {{
      toast.error('Failed to generate quiz: ' + (err?.message || ''));
    }} finally {{
      setGenerating(false);
    }}
  }};

  const selectAnswer = (questionId: string, optionIdx: number) => {{
    if (showResults) return;
    const updated = quizzes.map((q) => q.id === activeQuizId ? {{
      ...q, questions: q.questions.map((qu) => qu.id === questionId ? {{ ...qu, selectedIndex: optionIdx }} : qu),
    }} : q);
    setQuizzes(updated);
  }};

  const submitQuiz = () => {{
    if (!activeQuiz) return;
    const answered = activeQuiz.questions.filter((q) => q.selectedIndex !== undefined).length;
    if (answered < activeQuiz.totalQuestions) {{ toast.error(`Answer all questions ({d('answered')}/{d('activeQuiz.totalQuestions')})`); return; }}
    const correct = activeQuiz.questions.filter((q) => q.selectedIndex === q.correctIndex).length;
    const score = Math.round((correct / activeQuiz.totalQuestions) * 100);
    const updated = quizzes.map((q) => q.id === activeQuizId ? {{ ...q, score, completedAt: new Date().toISOString() }} : q);
    setQuizzes(updated);
    setShowResults(true);
    if (score >= 80) toast.success(`Great job! Score: {d('score')}%`);
    else if (score >= 60) toast('Not bad! Score: ' + score + '%');
    else toast.error(`Keep studying! Score: {d('score')}%`);
  }};

  if (activeQuiz) {{
    const answered = activeQuiz.questions.filter((q) => q.selectedIndex !== undefined).length;
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Button startIcon={{<CloseIcon />}} onClick={{() => {{ setActiveQuizId(null); setShowResults(false); }}}} sx={{ textTransform: 'none', color: 'text.secondary' }}>Back to Quizzes</Button>
          {{showResults && activeQuiz.score !== undefined && (
            <Chip label={{`Score: {d('activeQuiz.score')}%`}} color={{activeQuiz.score >= 80 ? 'success' : activeQuiz.score >= 60 ? 'warning' : 'error'}} />
          )}}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{{activeQuiz.title}}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{{answered}}/{{activeQuiz.totalQuestions}} answered</Typography>
        {{activeQuiz.questions.map((q, idx) => {{
          const isCorrect = showResults && q.selectedIndex === q.correctIndex;
          const isWrong = showResults && q.selectedIndex !== undefined && q.selectedIndex !== q.correctIndex;
          return (
            <Paper key={{q.id}} variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2, borderColor: isCorrect ? '#4caf50' : isWrong ? '#f44336' : 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>{{idx + 1}}. {{q.question}}</Typography>
              <RadioGroup value={{q.selectedIndex ?? -1}} onChange={{(e) => selectAnswer(q.id, Number(e.target.value))}}>
                {{q.options.map((opt, oi) => (
                  <FormControlLabel key={{oi}} value={{oi}} control={{<Radio size="small" />}} label={{
                    <Typography variant="body2" sx={{{{
                      color: showResults && oi === q.correctIndex ? '#2e7d32' : showResults && oi === q.selectedIndex && oi !== q.correctIndex ? '#c62828' : 'text.primary',
                      fontWeight: showResults && oi === q.correctIndex ? 600 : 400,
                    }}}}>{{opt}}</Typography>
                  }} sx={{ mb: 0.5 }} disabled={{showResults}} />
                ))}}
              </RadioGroup>
              {{showResults && (
                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: isCorrect ? '#2e7d32' : '#c62828' }}>
                    {{isCorrect ? 'Correct!' : 'Incorrect'}}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{{q.explanation}}</Typography>
                </Box>
              )}}
            </Paper>
          );
        }})}}
        {{!showResults && (
          <Button variant="contained" fullWidth onClick={{submitQuiz}}
            sx={{ bgcolor: '#424242', '&:hover': {{ bgcolor: '#333' }}, textTransform: 'none', py: 1.5 }}>
            Submit Quiz
          </Button>
        )}}
      </Box>
    );
  }}

  const bookQuizzes = quizzes.filter((q) => !selectedBookId || q.bookId === selectedBookId);

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Quizzes</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Test your knowledge with AI-generated quizzes</Typography>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Generate New Quiz</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FormControl sx={{ minWidth: 200, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>Select Textbook</Typography>
            <TextField select value={{selectedBookId || ''}} onChange={{(e) => setSelectedBookId(e.target.value || null)}} size="small" SelectProps={{{{ native: true }}}}>
              <option value="">Choose a textbook...</option>
              {{books.map((b) => <option key={{b.id}} value={{b.id}}>{{b.name}}</option>)}}
            </TextField>
          </FormControl>
          <FormControl sx={{ width: 140 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>Questions</Typography>
            <TextField type="number" value={{numQuestions}} onChange={{(e) => setNumQuestions(Math.max(5, Math.min(30, Number(e.target.value))))}} size="small" inputProps={{{{ min: 5, max: 30 }}}} />
          </FormControl>
          <Button variant="contained" onClick={{handleGenerate}} disabled={{generating || !selectedBookId}} startIcon={{generating ? <CircularProgress size={{16}} /> : <QuizIcon />}}
            sx={{ bgcolor: '#424242', '&:hover': {{ bgcolor: '#333' }}, textTransform: 'none', height: 40 }}>
            {{generating ? 'Generating...' : 'Generate Quiz'}}
          </Button>
        </Box>
      </Paper>

      {{bookQuizzes.length > 0 ? (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Previous Quizzes</Typography>
          {{bookQuizzes.map((quiz) => (
            <Paper key={{quiz.id}} variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': {{ boxShadow: 1 }} }} onClick={{() => {{ setActiveQuizId(quiz.id); setShowResults(quiz.completedAt != null); }}}}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{{quiz.title}}</Typography>
                  <Typography variant="caption" color="text.secondary">{{quiz.totalQuestions}} questions · {{quiz.bookName}}</Typography>
                </Box>
                {{quiz.score !== undefined ? (
                  <Chip label={{`{d('quiz.score')}%`}} size="small" color={{quiz.score >= 80 ? 'success' : quiz.score >= 60 ? 'warning' : 'error'}} />
                ) : (
                  <Chip label="Not taken" size="small" variant="outlined" />
                )}}
              </Box>
            </Paper>
          ))}}
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
          <QuizIcon sx={{ fontSize: 40, color: '#bdbdbd', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">{{books.length === 0 ? 'Upload a textbook first' : 'Generate your first quiz'}}</Typography>
        </Paper>
      )}}
    </Box>
  );
}}

// ============ PROGRESS TAB ============
function ProgressTab({{ books, plans, quizzes }}: {{ books: Textbook[]; plans: StudyPlan[]; quizzes: QuizData[] }}) {{
  const totalChapters = plans.reduce((s, p) => s + p.totalChapters, 0);
  const completedChapters = plans.reduce((s, p) => s + p.chapters.filter((c) => c.completed).length, 0);
  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter((q) => q.completedAt).length;
  const avgScore = completedQuizzes > 0 ? Math.round(quizzes.filter((q) => q.score !== undefined).reduce((s, q) => s + (q.score || 0), 0) / completedQuizzes) : 0;
  const overallPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Progress Overview</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Track your study progress across all textbooks</Typography>

      {{/* Stats cards */}}
      <Box sx={{ display: 'grid', gridTemplateColumns: {{ xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }}, gap: 2, mb: 3 }}>
        {{[
          {{ label: 'Textbooks', value: books.length, icon: <MenuBookIcon />, color: '#1976d2' }},
          {{ label: 'Chapters Done', value: `{d('completedChapters')}/{d('totalChapters')}`, icon: <CheckCircleIcon />, color: '#4caf50' }},
          {{ label: 'Quizzes Taken', value: `{d('completedQuizzes')}/{d('totalQuizzes')}`, icon: <QuizIcon />, color: '#ff9800' }},
          {{ label: 'Avg Score', value: `{d('avgScore')}%`, icon: <TrendingUpIcon />, color: '#9c27b0' }},
        ].map((stat) => (
          <Paper key={{stat.label}} variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
            <Box sx={{ color: stat.color, mb: 0.5 }}>{{stat.icon}}</Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{{stat.value}}</Typography>
            <Typography variant="caption" color="text.secondary">{{stat.label}}</Typography>
          </Paper>
        ))}}
      </Box>

      {{/* Per-book progress */}}
      {{books.map((book) => {{
        const bookPlans = plans.filter((p) => p.bookId === book.id);
        const bookDone = bookPlans.reduce((s, p) => s + p.chapters.filter((c) => c.completed).length, 0);
        const bookTotal = bookPlans.reduce((s, p) => s + p.totalChapters, 0);
        const bookPct = bookTotal > 0 ? Math.round((bookDone / bookTotal) * 100) : 0;
        const bookQuizzes = quizzes.filter((q) => q.bookId === book.id);
        const bookAvg = bookQuizzes.filter((q) => q.score !== undefined).length > 0
          ? Math.round(bookQuizzes.filter((q) => q.score !== undefined).reduce((s, q) => s + (q.score || 0), 0) / bookQuizzes.filter((q) => q.score !== undefined).length)
          : null;
        return (
          <Paper key={{book.id}} variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <PictureAsPdfIcon sx={{ color: '#e57373' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{{book.name}}</Typography>
                <Typography variant="caption" color="text.secondary">{{book.pageCount}} pages</Typography>
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#4caf50' }}>{{bookPct}}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={{bookPct}} sx={{ height: 6, borderRadius: 1, mb: 1, bgcolor: '#e0e0e0', '& .MuiLinearProgress-bar': {{ bgcolor: '#4caf50' }} }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="caption" color="text.secondary">{{bookDone}}/{{bookTotal}} chapters</Typography>
              <Typography variant="caption" color="text.secondary">{{bookQuizzes.length}} quizzes</Typography>
              {{bookAvg !== null && <Typography variant="caption" color="text.secondary">Avg: {{bookAvg}}%</Typography>}}
            </Box>
          </Paper>
        );
      }})}}

      {{books.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: '#bdbdbd', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">Upload textbooks and start studying to see your progress</Typography>
        </Paper>
      )}}
    </Box>
  );
}}

// ============ MAIN PAGE ============
export default function AITutorPage() {{
  const [activeTab, setActiveTab] = useState(0);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(() => load('conversations', []));
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [books, setBooks] = useState<Textbook[]>(() => load('textbooks', []));
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [plans, setPlans] = useState<StudyPlan[]>(() => load('studyplans', []));
  const [quizzes, setQuizzes] = useState<QuizData[]>(() => load('quizzes', []));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {{ isListening, transcript, startListening, stopListening, setTranscript }} = useSpeechRecognition();
  const {{ speakingMessageId, speak, stopSpeaking }} = useTextToSpeech();
  const activeBook = books.find((b) => b.id === selectedBookId) || null;

  useEffect(() => {{ if (transcript) setInput(transcript); }}, [transcript]);
  useEffect(() => {{ messagesEndRef.current?.scrollIntoView({{ behavior: 'smooth' }}); }}, [messages, isLoading]);
  useEffect(() => {{ if (currentConvId) {{ const c = conversations.find((x) => x.id === currentConvId); if (c) setMessages(c.messages); }} }}, [currentConvId]);
  useEffect(() => {{ save('conversations', conversations); }}, [conversations]);
  useEffect(() => {{ save('textbooks', books); }}, [books]);
  useEffect(() => {{ save('studyplans', plans); }}, [plans]);
  useEffect(() => {{ save('quizzes', quizzes); }}, [quizzes]);

  const handleSend = async () => {{
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: ChatMessage = {{ id: `msg-{d('Date.now()')}`, role: 'user', content: text, createdAt: new Date().toISOString() }};
    const updated = [...messages, userMsg];
    setMessages(updated); setInput(''); setTranscript(''); setIsLoading(true);
    try {{
      const response = await sendChat(text, messages, activeBook?.extractedText || null);
      const assistantMsg: ChatMessage = {{ id: `msg-{d('Date.now() + 1')}`, role: 'assistant', content: response, createdAt: new Date().toISOString() }};
      const final_msgs = [...updated, assistantMsg];
      setMessages(final_msgs);
      if (currentConvId) {{
        setConversations((prev) => prev.map((c) => c.id === currentConvId ? {{ ...c, messages: final_msgs, updatedAt: new Date().toISOString() }} : c));
      }} else {{
        const title = text.length > 50 ? text.substring(0, 50) + '...' : text;
        const newConv: Conversation = {{ id: `conv-{d('Date.now()')}`, title, messages: final_msgs, bookId: selectedBookId || undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }};
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConvId(newConv.id);
      }}
    }} catch (err: any) {{
      toast.error(err?.message || 'Failed to get response');
      setMessages(messages);
    }} finally {{ setIsLoading(false); }}
  }};

  const handleKeyDown = (e: React.KeyboardEvent) => {{ if (e.key === 'Enter' && !e.shiftKey) {{ e.preventDefault(); handleSend(); }} }};
  const handleNewChat = () => {{ setCurrentConvId(null); setMessages([]); setInput(''); inputRef.current?.focus(); }};
  const handleSelectConv = (id: string) => {{ setCurrentConvId(id); setHistoryOpen(false); }};
  const handleDeleteConv = (id: string) => {{ setConversations((p) => p.filter((c) => c.id !== id)); if (currentConvId === id) handleNewChat(); toast.success('Deleted'); }};
  const handleMicToggle = () => {{ if (isListening) stopListening(); else startListening(); }};

  const handleBookUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {{
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {{ toast.error('Only PDF files'); return; }}
    if (file.size > 50 * 1024 * 1024) {{ toast.error('Max 50MB'); return; }}
    setIsUploading(true);
    try {{
      const {{ text, pageCount }} = await extractPdfText(file);
      const book: Textbook = {{ id: `book-{d('Date.now()')}`, name: file.name.replace('.pdf', ''), size: file.size, pageCount, extractedText: text, createdAt: new Date().toISOString() }};
      setBooks((prev) => [book, ...prev]);
      setSelectedBookId(book.id);
      toast.success(`"{d('book.name')}" uploaded ({d('pageCount')} pages)`);
    }} catch (err: any) {{
      toast.error('Failed to process PDF: ' + (err?.message || ''));
    }} finally {{
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }}
  }};

  const handleDeleteBook = (bookId: string) => {{
    setBooks((p) => p.filter((b) => b.id !== bookId));
    setPlans((p) => p.filter((pl) => pl.bookId !== bookId));
    setQuizzes((q) => q.filter((qz) => qz.bookId !== bookId));
    if (selectedBookId === bookId) setSelectedBookId(null);
    toast.success('Textbook removed');
  }};

  const handleUpdatePlans = (updated: StudyPlan[]) => setPlans(updated);
  const handleUpdateQuizzes = (updated: QuizData[]) => setQuizzes(updated);

  const hasMessages = messages.length > 0;

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: '100vh', flexDirection: 'column' }}>
      {{/* Tabs */}}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={{activeTab}} onChange={{(_, v) => setActiveTab(v)}} variant="scrollable" scrollButtons="auto"
          sx={{ minHeight: 44, '& .MuiTab-root': {{ minHeight: 44, textTransform: 'none', fontSize: 13, fontWeight: 500 }} }}>
          <Tab icon={{<ChatIcon sx={{ fontSize: 18 }} />}} iconPosition="start" label="Chat" />
          <Tab icon={{<MenuBookIcon sx={{ fontSize: 18 }} />}} iconPosition="start" label={{<Badge badgeContent={{books.length}} color="default" sx={{ '& .MuiBadge-badge': {{ fontSize: 10, minWidth: 16, height: 16 }} }}>Textbooks</Badge>}} />
          <Tab icon={{<SchoolIcon sx={{ fontSize: 18 }} />}} iconPosition="start" label="Study Plan" />
          <Tab icon={{<QuizIcon sx={{ fontSize: 18 }} />}} iconPosition="start" label="Quizzes" />
          <Tab icon={{<TrendingUpIcon sx={{ fontSize: 18 }} />}} iconPosition="start" label="Progress" />
        </Tabs>
      </Box>

      {{/* Tab panels */}}
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

      {{/* === CHAT TAB === */}}
      {{activeTab === 0 && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {{/* Chat history drawer */}}
          <Drawer anchor="left" open={{historyOpen}} onClose={{() => setHistoryOpen(false)}} sx={{ '& .MuiDrawer-paper': {{ width: 300, bgcolor: '#fafafa' }} }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Chat History</Typography>
              <IconButton size="small" onClick={{handleNewChat}}><AddIcon fontSize="small" /></IconButton>
            </Box>
            <Divider />
            <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
              {{conversations.length > 0 ? conversations.map((conv) => (
                <ListItemButton key={{conv.id}} selected={{currentConvId === conv.id}} onClick={{() => handleSelectConv(conv.id)}} sx={{ py: 1.5, px: 2, '&:hover .del': {{ opacity: 1 }} }}>
                  <ListItemText primary={{conv.title || 'Untitled'}} primaryTypographyProps={{{{ fontSize: 13, noWrap: true }}}} secondary={{new Date(conv.createdAt).toLocaleDateString()}} secondaryTypographyProps={{{{ fontSize: 11 }}}} />
                  <IconButton className="del" size="small" onClick={{(e) => {{ e.stopPropagation(); handleDeleteConv(conv.id); }}}} sx={{ opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                </ListItemButton>
              )) : <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No conversations yet</Typography></Box>}}
            </List>
          </Drawer>

          {{/* Chat top bar */}}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tooltip title="History"><IconButton size="small" onClick={{() => setHistoryOpen(true)}} sx={{ color: 'text.secondary' }}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="New chat"><IconButton size="small" onClick={{handleNewChat}} sx={{ color: 'text.secondary' }}><AddIcon fontSize="small" /></IconButton></Tooltip>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>AI Tutor</Typography>
            {{activeBook && <Chip size="small" icon={{<MenuBookIcon sx={{ fontSize: 14 }} />}} label={{activeBook.name}} onDelete={{() => setSelectedBookId(null)}} deleteIcon={{<CloseIcon sx={{ fontSize: 14 }} />}} sx={{ ml: 'auto', fontSize: 11 }} />}}
          </Box>

          {{/* Messages area */}}
          <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
            {{!hasMessages ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', px: 3 }}>
                <SmartToyIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>AI Tutor</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400, mb: 2 }}>
                  Upload your textbooks, select one, and ask me anything. I'll help you understand the material, prepare for exams, and track your progress.
                </Typography>
                {{books.length > 0 && (
                  <Box sx={{ maxWidth: 400, width: '100%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, display: 'block' }}>Select a textbook to study:</Typography>
                    {{books.map((b) => (
                      <Chip key={{b.id}} icon={{<MenuBookIcon sx={{ fontSize: 14 }} />}} label={{b.name}} onClick={{() => setSelectedBookId(b.id)}} variant={{selectedBookId === b.id ? 'filled' : 'outlined'}} sx={{ mr: 0.5, mb: 0.5, fontSize: 12 }} />
                    ))}}
                  </Box>
                )}}
              </Box>
            ) : (
              <Box sx={{ py: 2 }}>
                {{messages.map((msg) => (
                  <MessageBubble key={{msg.id}} message={{msg}} isSpeaking={{speakingMessageId === msg.id}} onSpeak={{() => speak(msg.content, msg.id)}} onStopSpeaking={{stopSpeaking}} />
                ))}}
                {{isLoading && (
                  <Box sx={{ display: 'flex', gap: 1.5, py: 2, maxWidth: 768, mx: 'auto', px: {{ xs: 2, md: 0 }} }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#616161', fontSize: 12, flexShrink: 0, mt: 0.5 }}><SmartToyIcon sx={{ fontSize: 16 }} /></Avatar>
                    <Box sx={{ pt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>AI Tutor</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {{[0, 1, 2].map((i) => <Box key={{i}} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#bdbdbd', animation: 'pulse 1.4s infinite ease-in-out', animationDelay: `{d('i * 0.2')}s`, '@keyframes pulse': {{ '0%, 80%, 100%': {{ opacity: 0.3 }}, '40%': {{ opacity: 1 }} }} }} />)}}
                      </Box>
                    </Box>
                  </Box>
                )}}
                <div ref={{messagesEndRef}} />
              </Box>
            )}}
          </Box>

          {{/* Input area */}}
          <Box sx={{ px: {{ xs: 2, md: 3 }}, py: 2, bgcolor: 'background.paper' }}>
            <input ref={{fileInputRef}} type="file" accept="application/pdf" style={{{{ display: 'none' }}}} onChange={{handleBookUpload}} />
            <Paper variant="outlined" sx={{ maxWidth: 768, mx: 'auto', display: 'flex', alignItems: 'flex-end', gap: 1, p: 1, borderRadius: 3, borderColor: isListening ? 'text.primary' : 'divider', transition: 'border-color 0.2s', '&:focus-within': {{ borderColor: '#9e9e9e' }} }}>
              <Tooltip title="Upload textbook"><IconButton onClick={{() => fileInputRef.current?.click()}} size="small" disabled={{isUploading}} sx={{ color: 'text.secondary' }}><AttachFileIcon fontSize="small" /></IconButton></Tooltip>
              <TextField inputRef={{inputRef}} fullWidth multiline maxRows={{6}} placeholder={{isListening ? 'Listening...' : activeBook ? `Ask about {d('activeBook.name')}...` : 'Ask your AI tutor anything...'}} value={{input}} onChange={{(e) => setInput(e.target.value)}} onKeyDown={{handleKeyDown}} variant="standard" InputProps={{{{ disableUnderline: true, sx: {{ fontSize: 14, px: 1 }} }}}} disabled={{isLoading}} />
              <Tooltip title={{isListening ? 'Stop' : 'Voice input'}}><IconButton onClick={{handleMicToggle}} size="small" sx={{ color: isListening ? '#f44336' : 'text.secondary', bgcolor: isListening ? 'rgba(244,67,54,0.08)' : 'transparent' }}>{{isListening ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}}</IconButton></Tooltip>
              <IconButton onClick={{handleSend}} disabled={{!input.trim() || isLoading}} size="small" sx={{ bgcolor: input.trim() ? '#616161' : 'transparent', color: input.trim() ? '#fff' : 'text.secondary', '&:hover': {{ bgcolor: input.trim() ? '#424242' : 'action.hover' }}, '&:disabled': {{ bgcolor: 'transparent', color: '#e0e0e0' }} }}>
                {{isLoading ? <CircularProgress size={{18}} sx={{ color: 'text.secondary' }} /> : <SendIcon fontSize="small" />}}
              </IconButton>
            </Paper>
            {{isListening && <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#f44336' }}>Recording... speak now</Typography>}}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>AI Tutor can make mistakes. Verify important information.</Typography>
          </Box>
        </Box>
      )}}

      {{/* === TEXTBOOKS TAB === */}}
      {{activeTab === 1 && <TextbooksTab books={{books}} onUpload={{handleBookUpload}} onDelete={{handleDeleteBook}} onSelect={{(id) => {{ setSelectedBookId(id); setActiveTab(0); }}}} isUploading={{isUploading}} selectedId={{selectedBookId}} />}}

      {{/* === STUDY PLAN TAB === */}}
      {{activeTab === 2 && <StudyPlanTab books={{books}} plans={{plans}} setPlans={{handleUpdatePlans}} selectedBookId={{selectedBookId}} setSelectedBookId={{setSelectedBookId}} />}}

      {{/* === QUIZ TAB === */}}
      {{activeTab === 3 && <QuizTab books={{books}} quizzes={{quizzes}} setQuizzes={{handleUpdateQuizzes}} selectedBookId={{selectedBookId}} setSelectedBookId={{setSelectedBookId}} />}}

      {{/* === PROGRESS TAB === */}}
      {{activeTab === 4 && <ProgressTab books={{books}} plans={{plans}} quizzes={{quizzes}} />}}

      </Box>
    </Box>
  );
}}
"""

import os
target = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'pages', 'app', 'AITutorPage.tsx')
with open(target, 'w') as f:
    f.write(content)
print(f"Written {len(content)} chars to {target}")

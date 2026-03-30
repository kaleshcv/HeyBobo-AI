import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Paper,
  Tooltip,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Drawer,
  Chip,
  useTheme,
} from '@mui/material';
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useAITutorStore, ChatMessage } from '@/store/aiTutorStore';
import { chatWithTutor } from '@/lib/gemini';
import { errorLogger } from '@/lib/errorLogger';

// --- Speech-to-Text hook ---
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error('Speech recognition not supported'); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: any) => {
      let t = '';
      for (let i = event.resultIndex; i < event.results.length; i++) t += event.results[i][0].transcript;
      setTranscript(t);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => { recognitionRef.current?.stop(); setIsListening(false); }, []);
  return { isListening, transcript, startListening, stopListening, setTranscript };
}

// --- Text-to-Speech hook ---
function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const speak = useCallback((text: string, messageId: string) => {
    if (!window.speechSynthesis) { toast.error('Text-to-speech not supported'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) || voices.find((v) => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => { setIsSpeaking(false); setSpeakingMessageId(null); };
    utterance.onerror = () => { setIsSpeaking(false); setSpeakingMessageId(null); };
    setIsSpeaking(true); setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setSpeakingMessageId(null); }, []);
  return { isSpeaking, speakingMessageId, speak, stopSpeaking };
}

// --- Message bubble ---
function MessageBubble({ message, isSpeaking, onSpeak, onStopSpeaking }: { message: ChatMessage; isSpeaking: boolean; onSpeak: () => void; onStopSpeaking: () => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const isUser = message.role === 'user';
  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 2, px: { xs: 2, md: 0 }, maxWidth: 768, mx: 'auto', width: '100%' }}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: isUser ? (dk ? 'rgba(255,255,255,0.15)' : '#9e9e9e') : (dk ? '#1A2B3C' : '#616161'), fontSize: 12, fontWeight: 600, flexShrink: 0, mt: 0.5 }}>
        {isUser ? 'U' : <SmartToyIcon sx={{ fontSize: 16 }} />}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, display: 'block' }}>
          {isUser ? 'You' : 'AI Tutor'}
        </Typography>
        <Box sx={{
          '& p': { m: 0, mb: 1, lineHeight: 1.7, color: 'text.primary', fontSize: 14 },
          '& p:last-child': { mb: 0 },
          '& code': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#f5f5f5', px: 0.5, py: 0.25, borderRadius: 0.5, fontSize: 13, fontFamily: 'monospace' },
          '& pre': { bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#f5f5f5', p: 1.5, borderRadius: 1, overflow: 'auto', mb: 1, '& code': { bgcolor: 'transparent', p: 0 } },
          '& ul, & ol': { pl: 2.5, mb: 1 },
          '& li': { mb: 0.5, fontSize: 14, lineHeight: 1.7, color: 'text.primary' },
          '& h1, & h2, & h3, & h4': { mt: 1.5, mb: 0.5, fontWeight: 600, color: 'text.primary' },
          '& blockquote': { borderLeft: '3px solid', borderColor: 'divider', pl: 1.5, ml: 0, color: 'text.secondary' },
        }}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </Box>
        {!isUser && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={() => { navigator.clipboard.writeText(message.content); toast.success('Copied'); }} sx={{ color: 'text.secondary' }}>
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isSpeaking ? 'Stop speaking' : 'Read aloud'}>
              <IconButton size="small" onClick={isSpeaking ? onStopSpeaking : onSpeak} sx={{ color: isSpeaking ? 'text.primary' : 'text.secondary' }}>
                {isSpeaking ? <StopIcon sx={{ fontSize: 16 }} /> : <VolumeUpIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// --- Props ---
interface Props {
  selectedBookId: string | null;
  /** Markdown content injected from StudyPlanTab's "Teach me" */
  injectedLesson: string | null;
  onLessonConsumed: () => void;
}

export default function ChatTab({ selectedBookId, injectedLesson, onLessonConsumed }: Props) {
  const dk = useTheme().palette.mode === 'dark';
  const { textbooks, conversations, addConversation, updateConversation, removeConversation } = useAITutorStore();
  const [input, setInput] = useState('');
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();
  const { speakingMessageId, speak, stopSpeaking } = useTextToSpeech();

  const activeBook = textbooks.find((b) => b.id === selectedBookId);
  const bookConversations = conversations.filter((c) => c.textbookId === selectedBookId || !selectedBookId);

  // Sync transcript
  useEffect(() => { if (transcript) setInput(transcript); }, [transcript]);
  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);
  // Load conversation
  useEffect(() => {
    if (currentConvId) {
      const conv = conversations.find((c) => c.id === currentConvId);
      if (conv) setMessages(conv.messages);
    }
  }, [currentConvId, conversations]);

  // Handle injected lesson content from StudyPlanTab
  useEffect(() => {
    if (injectedLesson) {
      const lessonMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'assistant', content: injectedLesson, createdAt: new Date().toISOString() };
      const newConv = {
        id: `conv-${Date.now()}`,
        title: 'Lesson',
        textbookId: selectedBookId || '',
        messages: [lessonMsg],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addConversation(newConv);
      setCurrentConvId(newConv.id);
      setMessages([lessonMsg]);
      onLessonConsumed();
    }
  }, [injectedLesson]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: text, createdAt: new Date().toISOString() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput(''); setTranscript('');
    setIsLoading(true);

    try {
      const response = await chatWithTutor(text, messages, activeBook?.extractedText || null);
      const assistantMsg: ChatMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', content: response, createdAt: new Date().toISOString() };
      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      if (currentConvId) {
        updateConversation(currentConvId, finalMessages);
      } else {
        const title = text.length > 50 ? text.substring(0, 50) + '...' : text;
        const newConv = { id: `conv-${Date.now()}`, title, textbookId: selectedBookId || '', messages: finalMessages, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        addConversation(newConv);
        setCurrentConvId(newConv.id);
      }
    } catch (err: any) {
      errorLogger.error(err?.message || 'Failed to get AI response', 'ChatTab', { stack: err?.stack });
      toast.error(err?.message || 'Failed to get AI response');
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const handleNewChat = () => { setCurrentConvId(null); setMessages([]); setInput(''); inputRef.current?.focus(); };
  const handleMicToggle = () => { if (isListening) stopListening(); else startListening(); };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Conversation history drawer */}
      <Drawer anchor="left" open={historyOpen} onClose={() => setHistoryOpen(false)} sx={{ '& .MuiDrawer-paper': { width: 300, bgcolor: dk ? '#0D1B2A' : '#fafafa' } }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Chat History</Typography>
          <IconButton size="small" onClick={handleNewChat}><AddIcon fontSize="small" /></IconButton>
        </Box>
        <Divider />
        <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {bookConversations.length > 0 ? bookConversations.map((conv) => (
            <ListItemButton key={conv.id} selected={currentConvId === conv.id} onClick={() => { setCurrentConvId(conv.id); setHistoryOpen(false); }} sx={{ py: 1.5, px: 2, '&:hover .delete-btn': { opacity: 1 } }}>
              <ListItemText primary={conv.title || 'Untitled Chat'} primaryTypographyProps={{ fontSize: 13, noWrap: true }} secondary={new Date(conv.createdAt).toLocaleDateString()} secondaryTypographyProps={{ fontSize: 11 }} />
              <IconButton className="delete-btn" size="small" onClick={(e) => { e.stopPropagation(); removeConversation(conv.id); if (currentConvId === conv.id) handleNewChat(); }} sx={{ opacity: 0, transition: 'opacity 0.2s', color: 'text.secondary' }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </ListItemButton>
          )) : (
            <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No conversations yet</Typography></Box>
          )}
        </List>
      </Drawer>

      {/* Top bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tooltip title="Chat history"><IconButton size="small" onClick={() => setHistoryOpen(true)} sx={{ color: 'text.secondary' }}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="New chat"><IconButton size="small" onClick={handleNewChat} sx={{ color: 'text.secondary' }}><AddIcon fontSize="small" /></IconButton></Tooltip>
        <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600, flex: 1 }}>Chat</Typography>
        {activeBook && <Chip icon={<PictureAsPdfIcon sx={{ fontSize: 14 }} />} label={activeBook.name} size="small" sx={{ fontSize: 11, maxWidth: 180 }} />}
      </Box>

      {/* Messages area */}
      <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.paper' }}>
        {messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', px: 3 }}>
            <SmartToyIcon sx={{ fontSize: 48, color: dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Ask your AI Tutor</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
              {activeBook ? `Ask questions about "${activeBook.name}" or any topic.` : 'Select a textbook for context-aware answers, or just ask anything.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isSpeaking={speakingMessageId === msg.id} onSpeak={() => speak(msg.content, msg.id)} onStopSpeaking={stopSpeaking} />
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', gap: 1.5, py: 2, maxWidth: 768, mx: 'auto', px: { xs: 2, md: 0 } }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: dk ? '#1A2B3C' : '#616161', fontSize: 12, flexShrink: 0, mt: 0.5 }}><SmartToyIcon sx={{ fontSize: 16 }} /></Avatar>
                <Box sx={{ pt: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>AI Tutor</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[0, 1, 2].map((i) => (
                      <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dk ? 'rgba(255,255,255,0.3)' : '#bdbdbd', animation: 'pulse 1.4s infinite ease-in-out', animationDelay: `${i * 0.2}s`, '@keyframes pulse': { '0%, 80%, 100%': { opacity: 0.3 }, '40%': { opacity: 1 } } }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input area */}
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2, bgcolor: 'background.paper' }}>
        <Paper variant="outlined" sx={{ maxWidth: 768, mx: 'auto', display: 'flex', alignItems: 'flex-end', gap: 1, p: 1, borderRadius: 3, borderColor: isListening ? 'text.primary' : 'divider', transition: 'border-color 0.2s', '&:focus-within': { borderColor: dk ? 'rgba(255,255,255,0.25)' : '#9e9e9e' } }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={6}
            placeholder={isListening ? 'Listening...' : 'Ask your AI tutor anything...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="standard"
            InputProps={{ disableUnderline: true, sx: { fontSize: 14, px: 1 } }}
            disabled={isLoading}
          />
          <Tooltip title={isListening ? 'Stop recording' : 'Voice input'}>
            <IconButton onClick={handleMicToggle} size="small" sx={{ color: isListening ? '#f44336' : 'text.secondary', bgcolor: isListening ? 'rgba(244,67,54,0.08)' : 'transparent', '&:hover': { bgcolor: isListening ? 'rgba(244,67,54,0.12)' : 'action.hover' } }}>
              {isListening ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleSend} disabled={!input.trim() || isLoading} size="small" sx={{ bgcolor: input.trim() ? (dk ? '#1A2B3C' : '#616161') : 'transparent', color: input.trim() ? '#fff' : 'text.secondary', '&:hover': { bgcolor: input.trim() ? (dk ? '#243B4F' : '#424242') : 'action.hover' }, '&:disabled': { bgcolor: 'transparent', color: dk ? 'rgba(255,255,255,0.15)' : '#e0e0e0' } }}>
            {isLoading ? <CircularProgress size={18} sx={{ color: 'text.secondary' }} /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Paper>
        {isListening && <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: '#f44336' }}>Recording... speak now</Typography>}
      </Box>
    </Box>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Slide,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { chatWithBrain } from '@/lib/gemini';
import { useBrainData } from '@/hooks/useBrainData';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function BrainChatbot() {
  const moduleData = useBrainData();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hey! I'm **Bobo**, your AI assistant. Ask me anything about your education, fitness, health, dietary, or any other module — I have access to all your data and can give you real-time insights. 🧠",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat window opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [chatOpen]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Open chat window on first send
    if (!chatOpen) setChatOpen(true);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await chatWithBrain(text, history, moduleData);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, something went wrong: ${err?.message || 'Unknown error'}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, chatOpen, messages, moduleData]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-lite renderer (bold, line breaks)
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <>
      {/* Chat window — slides up when open */}
      <Slide direction="up" in={chatOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            bottom: 88,
            left: { xs: 0, sm: '100px' },
            right: { xs: 0, sm: '100px' },
            zIndex: 1299,
            height: { xs: 'calc(100vh - 140px)', sm: '60vh' },
            maxHeight: 520,
            borderRadius: '24px 24px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              bgcolor: '#1a1a2e',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Avatar sx={{ bgcolor: '#6c63ff', width: 34, height: 34 }}>
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Bobo AI
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {sending ? 'Thinking...' : 'Ask anything about your modules'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setChatOpen(false)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: 2,
              py: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: '#f5f5f5',
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >
                {msg.role === 'assistant' && (
                  <Avatar sx={{ bgcolor: '#6c63ff', width: 28, height: 28, mt: 0.5, flexShrink: 0 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                )}
                <Paper
                  variant={msg.role === 'user' ? 'elevation' : 'outlined'}
                  elevation={msg.role === 'user' ? 1 : 0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: '80%',
                    bgcolor: msg.role === 'user' ? '#1a1a2e' : '#fff',
                    color: msg.role === 'user' ? '#fff' : 'text.primary',
                    '& strong': { fontWeight: 700 },
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {renderContent(msg.content)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.5,
                      fontSize: '0.65rem',
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {sending && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#6c63ff', width: 28, height: 28, flexShrink: 0 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Paper variant="outlined" sx={{ px: 2, py: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: '#6c63ff' }} />
                    <Typography variant="body2" color="text.secondary">
                      Analyzing your data...
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>
        </Paper>
      </Slide>

      {/* Fixed bottom input bar — always visible, full width */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: { xs: 8, sm: '100px' },
          right: { xs: 8, sm: '100px' },
          zIndex: 1300,
          bgcolor: '#1a1a2e',
          borderRadius: '50px',
          px: { xs: 1.5, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar sx={{ bgcolor: '#6c63ff', width: 36, height: 36, flexShrink: 0 }}>
          <AutoAwesomeIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={3}
          size="small"
          placeholder="Ask Bobo anything about your modules..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (messages.length > 1 || sending) setChatOpen(true); }}
          disabled={sending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.07)',
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#6c63ff' },
            },
            '& .MuiOutlinedInput-input': {
              color: '#fff',
              '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!input.trim() || sending}
          sx={{
            bgcolor: '#6c63ff',
            color: '#fff',
            width: 40,
            height: 40,
            flexShrink: 0,
            '&:hover': { bgcolor: '#5a52e0' },
            '&.Mui-disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' },
          }}
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {chatOpen && (
          <IconButton
            onClick={() => setChatOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0, width: 36, height: 36 }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>
    </>
  );
}

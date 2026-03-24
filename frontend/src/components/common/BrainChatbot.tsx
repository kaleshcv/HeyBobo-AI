import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Fab,
  Fade,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import MinimizeIcon from '@mui/icons-material/Minimize';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { chatWithBrain, type AIBrainInput } from '@/lib/gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BrainChatbotProps {
  moduleData: AIBrainInput;
}

export default function BrainChatbot({ moduleData }: BrainChatbotProps) {
  const [open, setOpen] = useState(false);
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

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

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
  }, [input, sending, messages, moduleData]);

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
        return (
          <strong key={i}>{part.slice(2, -2)}</strong>
        );
      }
      // Split on newlines
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
      {/* Floating Action Button */}
      <Fade in={!open}>
        <Fab
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            bgcolor: '#1a1a2e',
            color: '#fff',
            width: 60,
            height: 60,
            '&:hover': { bgcolor: '#16213e' },
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <Badge
            color="success"
            variant="dot"
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <SmartToyIcon sx={{ fontSize: 28 }} />
          </Badge>
        </Fab>
      </Fade>

      {/* Chat Window */}
      <Fade in={open}>
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1300,
            width: { xs: 'calc(100vw - 32px)', sm: 400 },
            height: { xs: 'calc(100vh - 100px)', sm: 560 },
            maxHeight: '80vh',
            borderRadius: 3,
            display: open ? 'flex' : 'none',
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
            <Avatar sx={{ bgcolor: '#6c63ff', width: 36, height: 36 }}>
              <AutoAwesomeIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Bobo AI
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {sending ? 'Thinking...' : 'Ask anything about your modules'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
              <MinimizeIcon />
            </IconButton>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
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

          {/* Input */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: '#fff',
              display: 'flex',
              gap: 1,
              alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <TextField
              inputRef={inputRef}
              fullWidth
              multiline
              maxRows={3}
              size="small"
              placeholder="Ask about fitness, courses, health..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f5f5f5',
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim() || sending}
              sx={{
                bgcolor: '#1a1a2e',
                color: '#fff',
                width: 40,
                height: 40,
                '&:hover': { bgcolor: '#16213e' },
                '&.Mui-disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}

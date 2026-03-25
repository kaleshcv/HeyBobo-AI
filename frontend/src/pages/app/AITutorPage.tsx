import { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventNoteIcon from '@mui/icons-material/EventNote';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import TextbooksTab from './ai-tutor/TextbooksTab';
import StudyPlanTab from './ai-tutor/StudyPlanTab';
import QuizTab from './ai-tutor/QuizTab';
import ProgressTab from './ai-tutor/ProgressTab';
import ChatTab from './ai-tutor/ChatTab';

const tabs = [
  { label: 'Textbooks', icon: <MenuBookIcon sx={{ fontSize: 18 }} /> },
  { label: 'Study Plans', icon: <EventNoteIcon sx={{ fontSize: 18 }} /> },
  { label: 'Quizzes', icon: <QuizIcon sx={{ fontSize: 18 }} /> },
  { label: 'Progress', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
  { label: 'Chat', icon: <ChatIcon sx={{ fontSize: 18 }} /> },
];

export default function AITutorPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [injectedLesson, setInjectedLesson] = useState<string | null>(null);

  useEffect(() => {
    const t = parseInt(searchParams.get('tab') || '', 10);
    if (!isNaN(t) && t >= 0 && t <= 4) setActiveTab(t);
  }, [searchParams]);

  const handleTeach = (content: string) => {
    setInjectedLesson(content);
    setActiveTab(4); // switch to Chat tab
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2, pb: 0.5 }}>
        <SmartToyIcon sx={{ fontSize: 24, color: '#7c4dff' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Tutor</Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 42,
            '& .MuiTab-root': {
              minHeight: 42,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              gap: 0.5,
              px: 2,
            },
            '& .Mui-selected': { color: '#7c4dff' },
            '& .MuiTabs-indicator': { bgcolor: '#7c4dff' },
          }}
        >
          {tabs.map((t, i) => (
            <Tab key={i} icon={t.icon} label={t.label} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 0 && (
          <TextbooksTab selectedBookId={selectedBookId} onSelectBook={setSelectedBookId} />
        )}
        {activeTab === 1 && (
          <StudyPlanTab selectedBookId={selectedBookId} onTeach={handleTeach} />
        )}
        {activeTab === 2 && (
          <QuizTab selectedBookId={selectedBookId} />
        )}
        {activeTab === 3 && (
          <ProgressTab selectedBookId={selectedBookId} />
        )}
        {activeTab === 4 && (
          <ChatTab
            selectedBookId={selectedBookId}
            injectedLesson={injectedLesson}
            onLessonConsumed={() => setInjectedLesson(null)}
          />
        )}
      </Box>
    </Box>
  );
}

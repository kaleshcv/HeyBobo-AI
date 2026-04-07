import { useState, useEffect } from 'react';
import {
  Box,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventNoteIcon from '@mui/icons-material/EventNote';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import { AnimatedPage } from '@/components/animations/AnimatedPage';
import TextbooksTab from './ai-tutor/TextbooksTab';
import StudyPlanTab from './ai-tutor/StudyPlanTab';
import QuizTab from './ai-tutor/QuizTab';
import ProgressTab from './ai-tutor/ProgressTab';
import ChatTab from './ai-tutor/ChatTab';

const tabs = [
  { label: 'Textbooks', icon: <MenuBookIcon sx={{ fontSize: 18, color: '#38bdf8' }} /> },
  { label: 'Study Plans', icon: <EventNoteIcon sx={{ fontSize: 18, color: '#a78bfa' }} /> },
  { label: 'Quizzes', icon: <QuizIcon sx={{ fontSize: 18, color: '#f59e0b' }} /> },
  { label: 'Progress', icon: <TrendingUpIcon sx={{ fontSize: 18, color: '#10b981' }} /> },
  { label: 'Chat', icon: <ChatIcon sx={{ fontSize: 18, color: '#7c4dff' }} /> },
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
    <AnimatedPage>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 2.5, md: 4, lg: 5 }, pt: 2, pb: 0.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#7c4dff20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <SmartToyIcon sx={{ fontSize: 22, color: '#7c4dff' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Tutor</Typography>
          </Box>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
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
        </motion.div>

        {/* Tab content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="textbooks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <TextbooksTab selectedBookId={selectedBookId} onSelectBook={setSelectedBookId} />
              </motion.div>
            )}
            {activeTab === 1 && (
              <motion.div
                key="studyplan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <StudyPlanTab selectedBookId={selectedBookId} onTeach={handleTeach} />
              </motion.div>
            )}
            {activeTab === 2 && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <QuizTab selectedBookId={selectedBookId} />
              </motion.div>
            )}
            {activeTab === 3 && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <ProgressTab selectedBookId={selectedBookId} />
              </motion.div>
            )}
            {activeTab === 4 && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <ChatTab
                  selectedBookId={selectedBookId}
                  injectedLesson={injectedLesson}
                  onLessonConsumed={() => setInjectedLesson(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </AnimatedPage>
  );
}

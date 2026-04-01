import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import SchoolIcon from '@mui/icons-material/School';
import { useCourseStore, LocalCourse, VideoProgress } from '@/store/courseStore';
import toast from 'react-hot-toast';
import { useUIStore } from '@/store/uiStore';
import { t } from '@/lib/translations';

// --- Course Card ---
function CourseCard({
  course,
  progress,
  onClick,
  onDelete,
}: {
  course: LocalCourse;
  progress: { completed: number; total: number; percent: number };
  onClick: () => void;
  onDelete: () => void;
}) {
  const dk = useTheme().palette.mode === 'dark';
  const { language } = useUIStore();
  return (
    <Card
      sx={{
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        transition: 'all 0.2s',
        position: 'relative',
        '&:hover': { bgcolor: 'action.hover' },
        '&:hover .delete-btn': { opacity: 1 },
      }}
    >
      <Box onClick={onClick}>
        <CardMedia
          component="img"
          height="140"
          image={course.thumbnail || ''}
          alt={course.title}
          sx={{ objectFit: 'cover', bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
        />
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>{course.title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{course.instructor}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <OndemandVideoIcon sx={{ fontSize: 14, color: '#9e9e9e' }} />
              <Typography variant="caption" color="text.secondary">{course.videos.length} videos</Typography>
            </Box>
            <Chip label={course.level} size="small" sx={{ ml: 'auto', height: 20, fontSize: 11, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5', color: 'text.secondary' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress.percent}
              sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#eeeeee', '& .MuiLinearProgress-bar': { bgcolor: progress.percent === 100 ? '#66bb6a' : '#9e9e9e', borderRadius: 2 } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>{progress.percent}%</Typography>
          </Box>
        </CardContent>
      </Box>
      <Tooltip title={t(language, 'deleteCourseTooltip')}>
        <IconButton
          className="delete-btn"
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          sx={{ position: 'absolute', top: 6, right: 6, opacity: 0, transition: 'opacity 0.2s', bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' }, color: 'text.secondary' }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Card>
  );
}

export default function CoursesListPage() {
  const dk = useTheme().palette.mode === 'dark';
  const navigate = useNavigate();
  const { language } = useUIStore();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0); // 0 = All, 1 = My Courses

  const courses = useCourseStore((s) => s.courses);
  const progress = useCourseStore((s) => s.progress);
  const getCourseProgress = useCourseStore((s) => s.getCourseProgress);
  const deleteCourse = useCourseStore((s) => s.deleteCourse);

  const filteredCourses = useMemo(() => {
    let list = courses;
    if (tab === 1) {
      const startedIds = new Set(progress.map((p: VideoProgress) => p.courseId));
      list = list.filter((c) => startedIds.has(c.id));
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.level.includes(q),
    );
  }, [courses, progress, search, tab]);

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse(courseId);
    toast.success('Course deleted');
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: { xs: 2.5, md: 4, lg: 5 }, py: 3, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#38bdf820', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <SchoolIcon sx={{ fontSize: 20, color: '#38bdf8' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{t(language, 'coursesPageTitle')}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t(language, 'coursesPageSubtitle')}
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          minHeight: 36,
          mb: 2,
          '& .MuiTabs-indicator': { bgcolor: dk ? '#C9A84C' : '#616161', height: 2 },
          '& .MuiTab-root': { textTransform: 'none', minHeight: 36, px: 2, py: 0.5, fontSize: 13, fontWeight: 600, color: 'text.secondary', '&.Mui-selected': { color: 'text.primary' } },
        }}
      >
        <Tab label={t(language, 'allCoursesTab')} />
        <Tab label={t(language, 'myCoursesTab')} />
      </Tabs>

      {/* Search */}
      <Box sx={{ maxWidth: 480, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t(language, 'searchCoursesPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: 'background.paper', '& fieldset': { borderColor: 'divider' }, '&:hover fieldset': { borderColor: dk ? 'rgba(255,255,255,0.3)' : '#bdbdbd' } },
          }}
        />
      </Box>

      {/* Course grid */}
      {filteredCourses.length > 0 ? (
        <Grid container spacing={2}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
              <CourseCard
                course={course}
                progress={getCourseProgress(course.id)}
                onClick={() => navigate(`/app/education/${course.id}`)}
                onDelete={() => handleDeleteCourse(course.id)}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <PlayCircleOutlineIcon sx={{ fontSize: 48, color: dk ? 'rgba(255,255,255,0.15)' : '#bdbdbd', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {search ? t(language, 'noCoursesMatchMsg') : tab === 1 ? t(language, 'noCoursesStartedMsg') : t(language, 'noCoursesYetMsg')}
          </Typography>
          {!search && tab === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t(language, 'addCoursesFromDashboard')}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Tooltip,
  Divider,
  Avatar,
  Switch,
} from '@mui/material';
import ChatIcon           from '@mui/icons-material/Chat';
import BrainChatbot       from '@/components/common/BrainChatbot';
import { useUIStore }     from '@/store/uiStore';
import { t }              from '@/lib/translations';
import MenuIcon           from '@mui/icons-material/Menu';
import ChevronRightIcon   from '@mui/icons-material/ChevronRight';
import SchoolIcon         from '@mui/icons-material/School';
import GroupsIcon         from '@mui/icons-material/Groups';
import SmartToyIcon       from '@mui/icons-material/SmartToy';
import DashboardIcon      from '@mui/icons-material/Dashboard';
import VideocamIcon       from '@mui/icons-material/Videocam';
import SettingsIcon       from '@mui/icons-material/Settings';
import LogoutIcon         from '@mui/icons-material/Logout';
import FitnessCenterIcon  from '@mui/icons-material/FitnessCenter';
import MonitorHeartIcon   from '@mui/icons-material/MonitorHeart';
import PersonIcon         from '@mui/icons-material/Person';
import TimelineIcon       from '@mui/icons-material/Timeline';
import WatchIcon          from '@mui/icons-material/Watch';
import RestaurantIcon     from '@mui/icons-material/Restaurant';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AutoAwesomeIcon    from '@mui/icons-material/AutoAwesome';
import RecommendIcon      from '@mui/icons-material/Recommend';
import CameraAltIcon      from '@mui/icons-material/CameraAlt';
import ShoppingCartIcon   from '@mui/icons-material/ShoppingCart';
import LocalMallIcon      from '@mui/icons-material/LocalMall';
import StorefrontIcon     from '@mui/icons-material/Storefront';
import SpaIcon            from '@mui/icons-material/Spa';
import PsychologyIcon     from '@mui/icons-material/Psychology';
import HealingIcon        from '@mui/icons-material/Healing';
import Brightness4Icon    from '@mui/icons-material/Brightness4';
import Brightness7Icon    from '@mui/icons-material/Brightness7';
import TranslateIcon      from '@mui/icons-material/Translate';

import { useAuth }    from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

const DRAWER_WIDTH       = 260;
const COLLAPSED_WIDTH    = 64;
const RIGHT_DRAWER_WIDTH = 240;
const RIGHT_COLLAPSED_WIDTH = 52;

interface NavModule {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
}

const buildModules = (lang: 'en' | 'ar'): NavModule[] => [
  { id: 'ai-brain',  label: t(lang, 'aiCoach'),   icon: <PsychologyIcon />,    path: '/app/ai-brain' },
  { id: 'education', label: t(lang, 'education'),  icon: <SchoolIcon />,        path: '/app/education' },
  { id: 'health',    label: t(lang, 'health'),     icon: <MonitorHeartIcon />,  path: '/app/health' },
  { id: 'fitness',   label: t(lang, 'fitness'),    icon: <FitnessCenterIcon />, path: '/app/fitness' },
  { id: 'dietary',   label: t(lang, 'dietary'),    icon: <RestaurantIcon />,    path: '/app/dietary' },
  { id: 'shopping',  label: t(lang, 'shopping'),   icon: <LocalMallIcon />,     path: '/app/shopping' },
  { id: 'grooming',  label: t(lang, 'grooming'),   icon: <SpaIcon />,           path: '/app/grooming' },
];

const buildEduSubs    = (lang: 'en' | 'ar'): NavModule[] => [
  { id: 'dashboard', label: t(lang, 'dashboard'), icon: <DashboardIcon />,  path: '/app/education' },
  { id: 'ai-tutor',  label: t(lang, 'aiTutor'),   icon: <SmartToyIcon />,   path: '/app/ai-tutor' },
  { id: 'groups',    label: t(lang, 'groups'),     icon: <GroupsIcon />,     path: '/app/groups' },
  { id: 'courses',   label: t(lang, 'courses'),    icon: <SchoolIcon />,     path: '/app/courses' },
  { id: 'meetings',  label: t(lang, 'meetings'),   icon: <VideocamIcon />,   path: '/app/meetings' },
];

const buildHealthSubs  = (lang: 'en' | 'ar'): NavModule[] => [
  { id: 'health-dashboard', label: t(lang, 'dashboard'),        icon: <DashboardIcon />,  path: '/app/health' },
  { id: 'health-profile',   label: t(lang, 'healthProfile'),    icon: <PersonIcon />,     path: '/app/health/fitness-profile' },
  { id: 'activity',         label: t(lang, 'activityTracking'), icon: <TimelineIcon />,   path: '/app/health/activity-tracking' },
  { id: 'wearables',        label: t(lang, 'wearables'),        icon: <WatchIcon />,      path: '/app/health/wearables' },
  { id: 'injury',           label: t(lang, 'injuryTracker'),    icon: <HealingIcon />,    path: '/app/health/injury' },
];

const buildFitnessSubs = (lang: 'en' | 'ar'): NavModule[] => [
  { id: 'fitness-dashboard', label: t(lang, 'dashboard'), icon: <DashboardIcon />,     path: '/app/fitness' },
  { id: 'workouts',          label: t(lang, 'workouts'),  icon: <FitnessCenterIcon />, path: '/app/fitness/workouts' },
];

const buildDietarySubs = (lang: 'en' | 'ar'): NavModule[] => [
  { id: 'dietary-dashboard',  label: t(lang, 'dashboard'),        icon: <DashboardIcon />,      path: '/app/dietary' },
  { id: 'meal-log',           label: t(lang, 'mealLog'),           icon: <RestaurantMenuIcon />, path: '/app/dietary/meals' },
  { id: 'meal-planner',       label: t(lang, 'mealPlanner'),       icon: <AutoAwesomeIcon />,    path: '/app/dietary/meal-planner' },
  { id: 'nutrition-tracker',  label: t(lang, 'nutritionTracker'),  icon: <TimelineIcon />,       path: '/app/dietary/nutrition' },
  { id: 'grocery',            label: t(lang, 'grocery'),           icon: <ShoppingCartIcon />,   path: '/app/dietary/grocery' },
];

const buildGroomingSubs = (lang: 'en' | 'ar'): NavModule[] => [
  { id: 'grooming-dashboard',      label: t(lang, 'dashboard'),      icon: <DashboardIcon />,  path: '/app/grooming' },
  { id: 'grooming-recommendations',label: t(lang, 'recommendations'),icon: <RecommendIcon />,  path: '/app/grooming/recommendations' },
  { id: 'grooming-visual',         label: t(lang, 'visualAnalysis'), icon: <CameraAltIcon />,  path: '/app/grooming/visual-analysis' },
];

const buildShoppingSubs = (lang: 'en' | 'ar'): NavModule[] => [
  { id: 'shopping-dashboard', label: t(lang, 'dashboard'),    icon: <DashboardIcon />,    path: '/app/shopping' },
  { id: 'shopping-lists',     label: t(lang, 'shoppingLists'),icon: <ShoppingCartIcon />, path: '/app/shopping/lists' },
  { id: 'marketplace',        label: t(lang, 'marketplace'),  icon: <StorefrontIcon />,   path: '/app/shopping/marketplace' },
  { id: 'budget',             label: t(lang, 'budget'),       icon: <LocalMallIcon />,    path: '/app/shopping/budget' },
  { id: 'orders',             label: t(lang, 'orders'),       icon: <AutoAwesomeIcon />,  path: '/app/shopping/orders' },
];

// Module accent colors — used in right sidebar section headers
const MODULE_COLORS: Record<string, string> = {
  education: '#C9A84C',
  health:    '#EF4444',
  fitness:   '#F97316',
  dietary:   '#22C55E',
  shopping:  '#A855F7',
  grooming:  '#06B6D4',
};

export default function AppShell() {
  const [expanded,      setExpanded]      = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isChatEnabled = useUIStore((s) => s.isChatEnabled);
  const toggleChat    = useUIStore((s) => s.toggleChat);
  const theme         = useUIStore((s) => s.theme);
  const toggleTheme   = useUIStore((s) => s.toggleTheme);
  const language      = useUIStore((s) => s.language);
  const toggleLanguage= useUIStore((s) => s.toggleLanguage);
  const isRTL         = useUIStore((s) => s.isRTL);
  const isDark        = theme === 'dark';

  const drawerWidth = expanded ? DRAWER_WIDTH : COLLAPSED_WIDTH;

  // Palette shortcuts
  const accent   = isDark ? '#C9A84C' : '#00843D';

  const textPri  = isDark ? '#F5F0E8' : '#1C1C1C';
  const textSec  = isDark ? '#B8C8D8' : '#4A5568';

  const modules      = buildModules(language);
  const eduSubs      = buildEduSubs(language);
  const healthSubs   = buildHealthSubs(language);
  const fitnessSubs  = buildFitnessSubs(language);
  const dietarySubs  = buildDietarySubs(language);
  const groomingSubs = buildGroomingSubs(language);
  const shoppingSubs = buildShoppingSubs(language);

  const aiBrainSections = [
    { label: t(language, 'education'), color: MODULE_COLORS.education, items: eduSubs },
    { label: t(language, 'health'),    color: MODULE_COLORS.health,    items: healthSubs },
    { label: t(language, 'fitness'),   color: MODULE_COLORS.fitness,   items: fitnessSubs },
    { label: t(language, 'dietary'),   color: MODULE_COLORS.dietary,   items: dietarySubs },
    { label: t(language, 'shopping'),  color: MODULE_COLORS.shopping,  items: shoppingSubs },
    { label: t(language, 'grooming'),  color: MODULE_COLORS.grooming,  items: groomingSubs },
  ];

  const handleLogout = () => { logout(); navigate('/auth/login'); };
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Sidebar direction
  const leftAnchor  = isRTL ? 'right' : 'left';
  const rightAnchor = isRTL ? 'left'  : 'right';

  const getSubModules = (): NavModule[] => {
    const p = location.pathname;
    if (p.startsWith('/app/grooming'))  return groomingSubs;
    if (p.startsWith('/app/shopping'))  return shoppingSubs;
    if (p.startsWith('/app/fitness'))   return fitnessSubs;
    if (p.startsWith('/app/health'))    return healthSubs;
    if (p.startsWith('/app/dietary'))   return dietarySubs;
    return eduSubs;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* ─── Left Sidebar ────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        anchor={leftAnchor}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          },
        }}
      >
        {/* Brand header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: expanded ? 2 : 1,
          py: 1.5,
          minHeight: 60,
          borderBottom: `1px solid ${isDark ? 'rgba(201,168,76,0.15)' : '#E2EBE8'}`,
        }}>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
            sx={{ color: accent }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          {expanded && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Logo mark */}
              <Box sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: isDark
                  ? 'linear-gradient(135deg, #C9A84C 0%, #E5B84E 100%)'
                  : 'linear-gradient(135deg, #00843D 0%, #00A650 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: isDark ? '#0D1B2A' : '#fff' }}>
                  H
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{
                color: accent,
                fontWeight: 700,
                letterSpacing: '0.02em',
                fontSize: 15,
              }}>
                {t(language, 'appName')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Module navigation */}
        <List sx={{ flex: 1, py: 1.5, overflowY: 'auto' }}>
          {modules.map((mod) => {
            const active = isActive(mod.path);
            return (
              <Tooltip key={mod.id} title={expanded ? '' : mod.label} placement={isRTL ? 'left' : 'right'}>
                <ListItemButton
                  selected={active}
                  onClick={() => navigate(mod.path)}
                  sx={{
                    justifyContent: expanded ? 'flex-start' : 'center',
                    py: 1.2,
                    position: 'relative',
                    ...(active && {
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        [leftAnchor === 'left' ? 'left' : 'right']: 0,
                        top: '20%',
                        height: '60%',
                        width: 3,
                        borderRadius: 2,
                        background: accent,
                      },
                    }),
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: expanded ? 36 : 'auto',
                    color: active ? accent : textSec,
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}>
                    {mod.icon}
                  </ListItemIcon>
                  {expanded && (
                    <ListItemText
                      primary={mod.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: active ? 700 : 400,
                        color: active ? accent : textPri,
                        fontFamily: '"Cairo", "Inter", sans-serif',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>

        {/* Bottom section */}
        <Divider />
        <List sx={{ py: 1 }}>
          {/* Theme toggle */}
          <Tooltip title={expanded ? '' : (isDark ? t(language, 'lightMode') : t(language, 'darkMode'))} placement={isRTL ? 'left' : 'right'}>
            <ListItemButton
              onClick={toggleTheme}
              sx={{ justifyContent: expanded ? 'flex-start' : 'center', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: expanded ? 36 : 'auto', color: accent }}>
                {isDark ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary={isDark ? t(language, 'lightMode') : t(language, 'darkMode')}
                  primaryTypographyProps={{ fontSize: 13, color: textPri }}
                />
              )}
            </ListItemButton>
          </Tooltip>

          {/* Language toggle */}
          <Tooltip title={expanded ? '' : (language === 'en' ? t(language, 'switchToArabic') : t(language, 'switchToEnglish'))} placement={isRTL ? 'left' : 'right'}>
            <ListItemButton
              onClick={toggleLanguage}
              sx={{ justifyContent: expanded ? 'flex-start' : 'center', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: expanded ? 36 : 'auto', color: textSec }}>
                <TranslateIcon fontSize="small" />
              </ListItemIcon>
              {expanded && (
                <ListItemText
                  primary={language === 'en' ? 'عربي' : 'English'}
                  primaryTypographyProps={{
                    fontSize: 13,
                    color: textPri,
                    fontFamily: '"Cairo", "Inter", sans-serif',
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>

          {/* Chat toggle */}
          <Tooltip title={expanded ? '' : `Chat: ${isChatEnabled ? 'On' : 'Off'}`} placement={isRTL ? 'left' : 'right'}>
            <ListItemButton
              onClick={toggleChat}
              sx={{ justifyContent: expanded ? 'flex-start' : 'center', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: expanded ? 36 : 'auto', color: isChatEnabled ? accent : textSec }}>
                <ChatIcon fontSize="small" />
              </ListItemIcon>
              {expanded ? (
                <>
                  <ListItemText primary={t(language, 'chatUI')} primaryTypographyProps={{ fontSize: 13, color: textPri }} />
                  <Switch
                    size="small"
                    checked={isChatEnabled}
                    onChange={toggleChat}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': { color: accent },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: isDark ? 'rgba(201,168,76,0.4)' : 'rgba(0,132,61,0.4)',
                      },
                    }}
                  />
                </>
              ) : (
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: isChatEnabled ? accent : 'grey.500',
                  position: 'absolute', bottom: 8,
                  [isRTL ? 'left' : 'right']: 8,
                }} />
              )}
            </ListItemButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title={expanded ? '' : t(language, 'settings')} placement={isRTL ? 'left' : 'right'}>
            <ListItemButton
              onClick={() => navigate('/app/settings')}
              sx={{ justifyContent: expanded ? 'flex-start' : 'center', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: expanded ? 36 : 'auto', color: textSec }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              {expanded && (
                <ListItemText primary={t(language, 'settings')} primaryTypographyProps={{ fontSize: 13, color: textPri }} />
              )}
            </ListItemButton>
          </Tooltip>

          {/* User */}
          {isAuthenticated && user && (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: expanded ? 1.5 : 0,
              py: 1,
              mx: 1,
              borderRadius: 2,
              justifyContent: expanded ? 'flex-start' : 'center',
              cursor: 'pointer',
              '&:hover': { background: isDark ? 'rgba(201,168,76,0.06)' : 'rgba(0,132,61,0.05)' },
            }}>
              <Avatar
                sx={{
                  width: 32, height: 32,
                  background: isDark
                    ? 'linear-gradient(135deg, #C9A84C 0%, #A8862A 100%)'
                    : 'linear-gradient(135deg, #00843D 0%, #00A650 100%)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: isDark ? '#0D1B2A' : '#fff',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                src={user.profileImage}
              >
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              {expanded && (
                <>
                  <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: textPri }} noWrap>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSec }} noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                  <Tooltip title={t(language, 'logout')}>
                    <IconButton size="small" onClick={handleLogout} sx={{ color: textSec }}>
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          )}
        </List>
      </Drawer>

      {/* ─── Main content ────────────────────────────────────────── */}
      <Box component="main" sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'auto',
        background: isDark
          ? `radial-gradient(ellipse at 15% 10%, rgba(201,168,76,0.05) 0%, transparent 45%),
             radial-gradient(ellipse at 85% 90%, rgba(45,74,110,0.35) 0%, transparent 45%),
             #0D1B2A`
          : `radial-gradient(ellipse at 10% 5%,  rgba(0,132,61,0.05) 0%, transparent 45%),
             radial-gradient(ellipse at 90% 95%, rgba(0,166,80,0.04) 0%, transparent 45%),
             #F0FAF5`,
      }}>
        <Outlet />
        {isChatEnabled && <BrainChatbot />}
      </Box>

      {/* ─── Right Sidebar (sub-modules) ─────────────────────────── */}
      <Drawer
        variant="permanent"
        anchor={rightAnchor}
        sx={{
          width: rightExpanded ? RIGHT_DRAWER_WIDTH : RIGHT_COLLAPSED_WIDTH,
          flexShrink: 0,
          transition: 'width 0.25s ease',
          '& .MuiDrawer-paper': {
            width: rightExpanded ? RIGHT_DRAWER_WIDTH : RIGHT_COLLAPSED_WIDTH,
            transition: 'width 0.25s ease',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            [leftAnchor === 'left' ? 'borderLeft' : 'borderRight']: `1px solid ${isDark ? 'rgba(201,168,76,0.12)' : '#E2EBE8'}`,
            [leftAnchor === 'left' ? 'borderRight' : 'borderLeft']: 'none',
            bgcolor: isDark ? '#0D1B2A' : '#FAFAFA',
          },
        }}
      >
        {/* Toggle header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: rightExpanded ? 1.5 : 0.5,
          py: 1.5,
          minHeight: 60,
          justifyContent: rightExpanded ? 'flex-start' : 'center',
          borderBottom: `1px solid ${isDark ? 'rgba(201,168,76,0.1)' : '#E2EBE8'}`,
        }}>
          <IconButton
            onClick={() => setRightExpanded(!rightExpanded)}
            size="small"
            sx={{
              color: textSec,
              transform: isRTL
                ? (rightExpanded ? 'rotate(0deg)' : 'rotate(180deg)')
                : (rightExpanded ? 'rotate(0deg)' : 'rotate(180deg)'),
              transition: 'transform 0.25s ease',
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          {rightExpanded && (
            <Typography variant="caption" sx={{
              color: accent,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.65rem',
            }}>
              {t(language, 'tools')}
            </Typography>
          )}
        </Box>

        {/* Sub-module links */}
        {location.pathname.startsWith('/app/ai-brain') ? (
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {aiBrainSections.map((section) => (
              <React.Fragment key={section.label}>
                {rightExpanded && (
                  <Typography variant="caption" sx={{
                    display: 'block',
                    px: 1.5, pt: 1.5, pb: 0.5,
                    fontWeight: 700,
                    fontSize: '0.6rem',
                    color: section.color,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}>
                    {section.label}
                  </Typography>
                )}
                {!rightExpanded && <Divider sx={{ mx: 0.5, my: 0.5 }} />}
                <List sx={{ py: 0 }}>
                  {section.items.map((mod) => (
                    <Tooltip key={mod.id} title={rightExpanded ? '' : `${section.label} · ${mod.label}`} placement={isRTL ? 'right' : 'left'}>
                      <ListItemButton
                        selected={isActive(mod.path)}
                        onClick={() => navigate(mod.path)}
                        sx={{ justifyContent: rightExpanded ? 'flex-start' : 'center', py: 0.6, mx: 0.5, borderRadius: 1.5, minHeight: 36 }}
                      >
                        <ListItemIcon sx={{
                          minWidth: rightExpanded ? 28 : 'auto',
                          color: isActive(mod.path) ? section.color : textSec,
                          '& .MuiSvgIcon-root': { fontSize: 18 },
                        }}>
                          {mod.icon}
                        </ListItemIcon>
                        {rightExpanded && (
                          <ListItemText
                            primary={mod.label}
                            primaryTypographyProps={{
                              fontSize: 12,
                              fontWeight: isActive(mod.path) ? 700 : 400,
                              color: isActive(mod.path) ? section.color : textPri,
                              fontFamily: '"Cairo", "Inter", sans-serif',
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  ))}
                </List>
              </React.Fragment>
            ))}
          </Box>
        ) : (
          <List sx={{ py: 0.5 }}>
            {getSubModules().map((mod) => (
              <Tooltip key={mod.id} title={rightExpanded ? '' : mod.label} placement={isRTL ? 'right' : 'left'}>
                <ListItemButton
                  selected={isActive(mod.path)}
                  onClick={() => navigate(mod.path)}
                  sx={{ justifyContent: rightExpanded ? 'flex-start' : 'center', py: 1, mx: 0.5, borderRadius: 1.5 }}
                >
                  <ListItemIcon sx={{
                    minWidth: rightExpanded ? 32 : 'auto',
                    color: isActive(mod.path) ? accent : textSec,
                  }}>
                    {mod.icon}
                  </ListItemIcon>
                  {rightExpanded && (
                    <ListItemText
                      primary={mod.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: isActive(mod.path) ? 700 : 400,
                        color: isActive(mod.path) ? accent : textPri,
                        fontFamily: '"Cairo", "Inter", sans-serif',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        )}
      </Drawer>
    </Box>
  );
}

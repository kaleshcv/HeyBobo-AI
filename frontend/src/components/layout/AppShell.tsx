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
import ChatIcon from '@mui/icons-material/Chat';
import BrainChatbot from '@/components/common/BrainChatbot';
import { useUIStore } from '@/store/uiStore';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VideocamIcon from '@mui/icons-material/Videocam';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PersonIcon from '@mui/icons-material/Person';
import TimelineIcon from '@mui/icons-material/Timeline';
import WatchIcon from '@mui/icons-material/Watch';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RecommendIcon from '@mui/icons-material/Recommend';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SpaIcon from '@mui/icons-material/Spa';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HealingIcon from '@mui/icons-material/Healing';

import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 64;

interface NavModule {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
}

const modules: NavModule[] = [
  { id: 'ai-brain', label: 'AI Brain', icon: <PsychologyIcon />, path: '/app/ai-brain' },
  { id: 'education', label: 'Education', icon: <SchoolIcon />, path: '/app/education' },
  { id: 'health', label: 'Health', icon: <MonitorHeartIcon />, path: '/app/health' },
  { id: 'fitness', label: 'Fitness', icon: <FitnessCenterIcon />, path: '/app/fitness' },
  { id: 'dietary', label: 'Dietary', icon: <RestaurantIcon />, path: '/app/dietary' },
  { id: 'shopping', label: 'Shopping', icon: <LocalMallIcon />, path: '/app/shopping' },
  { id: 'grooming', label: 'Grooming & Lifestyle', icon: <SpaIcon />, path: '/app/grooming' },
];

// Sub-modules per category for the right sidebar
const educationSubModules: NavModule[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/app/education' },
  { id: 'ai-tutor', label: 'AI Tutor', icon: <SmartToyIcon />, path: '/app/ai-tutor' },
  { id: 'groups', label: 'Groups', icon: <GroupsIcon />, path: '/app/groups' },
  { id: 'courses', label: 'Courses', icon: <SchoolIcon />, path: '/app/courses' },
  { id: 'meetings', label: 'Meetings', icon: <VideocamIcon />, path: '/app/meetings' },
];

const healthSubModules: NavModule[] = [
  { id: 'health-dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/app/health' },
  { id: 'health-profile', label: 'Health Profile', icon: <PersonIcon />, path: '/app/health/fitness-profile' },
  { id: 'activity-tracking', label: 'Activity Tracking', icon: <TimelineIcon />, path: '/app/health/activity-tracking' },
  { id: 'wearables', label: 'Wearables', icon: <WatchIcon />, path: '/app/health/wearables' },
  { id: 'injury', label: 'Injury Tracker', icon: <HealingIcon />, path: '/app/health/injury' },
];

const fitnessSubModules: NavModule[] = [
  { id: 'fitness-dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/app/fitness' },
  { id: 'workouts', label: 'Workouts', icon: <FitnessCenterIcon />, path: '/app/fitness/workouts' },
];

const dietarySubModules: NavModule[] = [
  { id: 'dietary-dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/app/dietary' },
  { id: 'meal-log', label: 'Meal Log', icon: <RestaurantMenuIcon />, path: '/app/dietary/meals' },
  { id: 'meal-planner', label: 'Meal Planner', icon: <AutoAwesomeIcon />, path: '/app/dietary/meal-planner' },
  { id: 'nutrition-tracker', label: 'Nutrition Tracker', icon: <TimelineIcon />, path: '/app/dietary/nutrition' },
  { id: 'grocery', label: 'Grocery & Food', icon: <ShoppingCartIcon />, path: '/app/dietary/grocery' },
];

const groomingSubModules: NavModule[] = [
  { id: 'grooming-dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/app/grooming' },
  { id: 'grooming-recommendations', label: 'Recommendations', icon: <RecommendIcon />, path: '/app/grooming/recommendations' },
  { id: 'grooming-visual-analysis', label: 'Visual Analysis', icon: <CameraAltIcon />, path: '/app/grooming/visual-analysis' },
];

const shoppingSubModules: NavModule[] = [
  { id: 'shopping-dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/app/shopping' },
  { id: 'shopping-lists', label: 'Shopping Lists', icon: <ShoppingCartIcon />, path: '/app/shopping/lists' },
  { id: 'campus-marketplace', label: 'Campus Marketplace', icon: <StorefrontIcon />, path: '/app/shopping/marketplace' },
  { id: 'budget-expenses', label: 'Budget & Expenses', icon: <LocalMallIcon />, path: '/app/shopping/budget' },
  { id: 'orders-reviews', label: 'Orders & Reviews', icon: <AutoAwesomeIcon />, path: '/app/shopping/orders' },
];

// AI Brain shows ALL sub-modules from every module, grouped by section header
const aiBrainSections: { label: string; color: string; items: NavModule[] }[] = [
  { label: 'Education', color: '#1976d2', items: educationSubModules },
  { label: 'Health', color: '#d32f2f', items: healthSubModules },
  { label: 'Fitness', color: '#e65100', items: fitnessSubModules },
  { label: 'Dietary', color: '#2e7d32', items: dietarySubModules },
  { label: 'Shopping', color: '#7b1fa2', items: shoppingSubModules },
  { label: 'Grooming', color: '#00796b', items: groomingSubModules },
];

const RIGHT_DRAWER_WIDTH = 240;
const RIGHT_COLLAPSED_WIDTH = 52;

export default function AppShell() {
  const [expanded, setExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isChatEnabled = useUIStore((s) => s.isChatEnabled);
  const toggleChat = useUIStore((s) => s.toggleChat);

  const drawerWidth = expanded ? DRAWER_WIDTH : COLLAPSED_WIDTH;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            transition: 'width 0.2s ease',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          },
        }}
      >
        {/* Top section: toggle + brand */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: expanded ? 2 : 1,
            py: 1.5,
            minHeight: 56,
          }}
        >
          <IconButton
            onClick={() => setExpanded(!expanded)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          {expanded && (
            <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Heybobo
            </Typography>
          )}
        </Box>

        <Divider sx={{ mx: 1, my: 0.5 }} />

        {/* Module navigation */}
        <List sx={{ flex: 1, py: 1 }}>
          {modules.map((mod) => (
            <Tooltip key={mod.id} title={expanded ? '' : mod.label} placement="right">
              <ListItemButton
                selected={isActive(mod.path)}
                onClick={() => navigate(mod.path)}
                sx={{ justifyContent: expanded ? 'flex-start' : 'center' }}
              >
                <ListItemIcon sx={{ minWidth: expanded ? 36 : 'auto', color: isActive(mod.path) ? 'text.primary' : 'text.secondary' }}>
                  {mod.icon}
                </ListItemIcon>
                {expanded && (
                  <ListItemText
                    primary={mod.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive(mod.path) ? 600 : 400,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          ))}
        </List>

        {/* Bottom section: chat toggle + settings + user */}
        <Divider sx={{ mx: 1 }} />
        <List sx={{ py: 1 }}>
          <Tooltip title={expanded ? '' : `Chat UI: ${isChatEnabled ? 'On' : 'Off'}`} placement="right">
            <ListItemButton
              onClick={toggleChat}
              sx={{ justifyContent: expanded ? 'flex-start' : 'center' }}
            >
              <ListItemIcon sx={{ minWidth: expanded ? 36 : 'auto', color: isChatEnabled ? 'primary.main' : 'text.secondary' }}>
                <ChatIcon fontSize="small" />
              </ListItemIcon>
              {expanded ? (
                <>
                  <ListItemText primary="Chat UI" primaryTypographyProps={{ fontSize: 14 }} />
                  <Switch
                    size="small"
                    checked={isChatEnabled}
                    onChange={toggleChat}
                    onClick={(e) => e.stopPropagation()}
                    color="primary"
                  />
                </>
              ) : (
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isChatEnabled ? 'primary.main' : 'grey.400', position: 'absolute', bottom: 8, right: 8 }} />
              )}
            </ListItemButton>
          </Tooltip>

          <Tooltip title={expanded ? '' : 'Settings'} placement="right">
            <ListItemButton
              onClick={() => navigate('/app/settings')}
              sx={{ justifyContent: expanded ? 'flex-start' : 'center' }}
            >
              <ListItemIcon sx={{ minWidth: expanded ? 36 : 'auto', color: 'text.secondary' }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              {expanded && <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: 14 }} />}
            </ListItemButton>
          </Tooltip>

          {isAuthenticated && user && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: expanded ? 2 : 0,
                py: 1,
                justifyContent: expanded ? 'flex-start' : 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#9e9e9e',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                src={user.profileImage}
              >
                {getInitials(user.firstName, user.lastName)}
              </Avatar>
              {expanded && (
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {user.email}
                  </Typography>
                </Box>
              )}
              {expanded && (
                <Tooltip title="Logout">
                  <IconButton size="small" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}
        </List>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Outlet />
        {isChatEnabled && <BrainChatbot />}
      </Box>

      {/* Right sidebar — education sub-modules */}
      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: rightExpanded ? RIGHT_DRAWER_WIDTH : RIGHT_COLLAPSED_WIDTH,
          flexShrink: 0,
          transition: 'width 0.2s ease',
          '& .MuiDrawer-paper': {
            width: rightExpanded ? RIGHT_DRAWER_WIDTH : RIGHT_COLLAPSED_WIDTH,
            transition: 'width 0.2s ease',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            borderLeft: '1px solid',
            borderLeftColor: 'divider',
            borderRight: 'none',
            bgcolor: '#fafafa',
          },
        }}
      >
        {/* Toggle header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: rightExpanded ? 1.5 : 0.5,
            py: 1.5,
            minHeight: 56,
            justifyContent: rightExpanded ? 'flex-start' : 'center',
          }}
        >
          <IconButton
            onClick={() => setRightExpanded(!rightExpanded)}
            size="small"
            sx={{
              color: 'text.secondary',
              transform: rightExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          {rightExpanded && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Tools
            </Typography>
          )}
        </Box>

        <Divider sx={{ mx: 1, mb: 0.5 }} />

        {/* Sub-module links */}
        {location.pathname.startsWith('/app/ai-brain') ? (
          /* AI Brain: show ALL modules grouped with section headers */
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {aiBrainSections.map((section) => (
              <React.Fragment key={section.label}>
                {rightExpanded && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      px: 1.5,
                      pt: 1.5,
                      pb: 0.25,
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      color: section.color,
                      letterSpacing: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    {section.label}
                  </Typography>
                )}
                {!rightExpanded && (
                  <Divider sx={{ mx: 0.5, my: 0.5 }} />
                )}
                <List sx={{ py: 0 }}>
                  {section.items.map((mod) => (
                    <Tooltip key={mod.id} title={rightExpanded ? '' : `${section.label} · ${mod.label}`} placement="left">
                      <ListItemButton
                        selected={isActive(mod.path)}
                        onClick={() => navigate(mod.path)}
                        sx={{
                          justifyContent: rightExpanded ? 'flex-start' : 'center',
                          py: 0.6,
                          mx: 0.5,
                          borderRadius: 1.5,
                          minHeight: 36,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: rightExpanded ? 28 : 'auto',
                            color: isActive(mod.path) ? section.color : 'text.secondary',
                            '& .MuiSvgIcon-root': { fontSize: 18 },
                          }}
                        >
                          {mod.icon}
                        </ListItemIcon>
                        {rightExpanded && (
                          <ListItemText
                            primary={mod.label}
                            primaryTypographyProps={{
                              fontSize: 12,
                              fontWeight: isActive(mod.path) ? 600 : 400,
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
          {(location.pathname.startsWith('/app/grooming')
              ? groomingSubModules
              : location.pathname.startsWith('/app/shopping')
                ? shoppingSubModules
                : location.pathname.startsWith('/app/fitness')
                  ? fitnessSubModules
                  : location.pathname.startsWith('/app/health')
                    ? healthSubModules
                    : location.pathname.startsWith('/app/dietary')
                      ? dietarySubModules
                      : educationSubModules).map((mod) => (
            <Tooltip key={mod.id} title={rightExpanded ? '' : mod.label} placement="left">
              <ListItemButton
                selected={isActive(mod.path)}
                onClick={() => navigate(mod.path)}
                sx={{
                  justifyContent: rightExpanded ? 'flex-start' : 'center',
                  py: 1,
                  mx: 0.5,
                  borderRadius: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: rightExpanded ? 32 : 'auto',
                    color: isActive(mod.path) ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {mod.icon}
                </ListItemIcon>
                {rightExpanded && (
                  <ListItemText
                    primary={mod.label}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: isActive(mod.path) ? 600 : 400,
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

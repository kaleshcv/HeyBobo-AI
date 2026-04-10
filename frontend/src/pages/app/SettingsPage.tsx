import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Avatar,
  Divider,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TranslateIcon from '@mui/icons-material/Translate';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SaveIcon from '@mui/icons-material/Save';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/lib/api';

export default function SettingsPage() {
  const muiTheme = useTheme();
  const dk = muiTheme.palette.mode === 'dark';

  const { theme, setTheme, language, setLanguage, isChatEnabled, toggleChat } = useUIStore();
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await userApi.updateProfile({ firstName, lastName, bio });
      const updated = res.data?.data ?? res.data;
      if (updated) setUser({ ...user!, ...updated });
      setSnackbar({ open: true, message: 'Profile updated', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to update profile', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const sectionSx = {
    p: 3,
    borderRadius: 2,
    mb: 3,
  };

  return (
    <Box sx={{ p: 3, maxWidth: 720, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 28, color: muiTheme.palette.primary.main }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
      </Box>

      {/* ── Profile Section ── */}
      <Paper variant="outlined" sx={sectionSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PersonIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Profile
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
          <Avatar
            src={user?.profileImage}
            sx={{ width: 56, height: 56, fontSize: 24 }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="First Name"
            size="small"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last Name"
            size="small"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Box>

        <TextField
          label="Bio"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveProfile}
          disabled={saving}
          size="small"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </Paper>

      {/* ── Appearance Section ── */}
      <Paper variant="outlined" sx={sectionSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {dk ? <DarkModeIcon fontSize="small" color="primary" /> : <LightModeIcon fontSize="small" color="primary" />}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Appearance
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Dark Mode
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Switch between light and dark theme
            </Typography>
          </Box>
          <Switch
            checked={theme === 'dark'}
            onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </Box>
      </Paper>

      {/* ── Language Section ── */}
      <Paper variant="outlined" sx={sectionSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TranslateIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Language
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            label="Language"
            onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">العربية (Arabic)</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {/* ── Notifications Section ── */}
      <Paper variant="outlined" sx={sectionSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <NotificationsIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            AI Chat
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Enable AI Chat
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Show the AI chat assistant in the sidebar
            </Typography>
          </Box>
          <Switch checked={isChatEnabled} onChange={toggleChat} />
        </Box>
      </Paper>

      {/* ── Account Info Section ── */}
      <Paper variant="outlined" sx={sectionSx}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
          Account
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Username</Typography>
            <Typography variant="body2">{user?.username || '—'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Role</Typography>
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{user?.role || '—'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Member since</Typography>
            <Typography variant="body2">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, Avatar, AvatarGroup,
  MenuItem, Select, FormControl, InputLabel, InputAdornment, IconButton,
  Tooltip, LinearProgress, Badge,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AnimatedPage } from '@/components/animations';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useGroupStore, GroupCategory, GroupType, PostPermission } from '@/store/groupStore';
import toast from 'react-hot-toast';
import { useUIStore } from '@/store/uiStore';
import { t } from '@/lib/translations';

// ─── Create Group Dialog ──────────────────────────────────

function CreateGroupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const { language } = useUIStore();
  const createGroup = useGroupStore((s) => s.createGroup);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GroupCategory>('study-group');
  const [groupType, setGroupType] = useState<GroupType>('public');
  const [postPermission, setPostPermission] = useState<PostPermission>('everyone');
  const [maxMembers, setMaxMembers] = useState(50);

  const handleCreate = () => {
    if (!name.trim()) { toast.error(t(language, 'groupNameRequired')); return; }
    const group = createGroup({
      name: name.trim(),
      description: description.trim(),
      category,
      groupType,
      postPermission,
      maxMembers,
      courseIds: [],
    });
    toast.success(t(language, 'groupCreated'));
    setName(''); setDescription('');
    onClose();
    navigate(`/app/groups/${group.id}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>{t(language, 'createBtn')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label={t(language, 'groupNameLabel')} value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" required placeholder="e.g. Batch 2026 - Web Dev" />
        <TextField label={t(language, 'groupDescriptionLabel')} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth size="small" multiline rows={2} placeholder="Short description of this group" />
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t(language, 'categoryLabel')}</InputLabel>
              <Select value={category} onChange={(e) => setCategory(e.target.value as GroupCategory)} label={t(language, 'categoryLabel')}>
                <MenuItem value="course-based">{t(language, 'groupCourse')}</MenuItem>
                <MenuItem value="subject-based">{t(language, 'groupSubject')}</MenuItem>
                <MenuItem value="college-based">{t(language, 'groupCollege')}</MenuItem>
                <MenuItem value="study-group">{t(language, 'groupStudy')}</MenuItem>
                <MenuItem value="project-group">{t(language, 'groupProject')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t(language, 'privacyLabel')}</InputLabel>
              <Select value={groupType} onChange={(e) => setGroupType(e.target.value as GroupType)} label={t(language, 'privacyLabel')}>
                <MenuItem value="public">{t(language, 'typePublic')}</MenuItem>
                <MenuItem value="private">{t(language, 'typePrivate')}</MenuItem>
                <MenuItem value="restricted">{t(language, 'typeRestricted')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>{t(language, 'postPermissionsLabel')}</InputLabel>
              <Select value={postPermission} onChange={(e) => setPostPermission(e.target.value as PostPermission)} label={t(language, 'postPermissionsLabel')}>
                <MenuItem value="everyone">{t(language, 'groupEveryone')}</MenuItem>
                <MenuItem value="admins-only">{t(language, 'groupAdminsOnly')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField label={t(language, 'maxMembersLabel')} type="number" value={maxMembers} onChange={(e) => setMaxMembers(Math.max(2, parseInt(e.target.value) || 2))} fullWidth size="small" inputProps={{ min: 2, max: 500 }} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>{t(language, 'cancelBtn')}</Button>
        <Button onClick={handleCreate} variant="contained" sx={{ textTransform: 'none', bgcolor: dk ? '#1A2B3C' : '#616161', '&:hover': { bgcolor: dk ? '#243B4F' : '#424242' } }}>{t(language, 'createBtn')}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Groups Page ──────────────────────────────────────

export default function GroupsPage() {
  const dk = useTheme().palette.mode === 'dark';
  const groups = useGroupStore((s) => s.groups);
  const navigate = useNavigate();
  const { language } = useUIStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = groups.filter((g) => {
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || g.category === filterCategory;
    const matchType = filterType === 'all' || g.groupType === filterType;
    return matchSearch && matchCategory && matchType;
  });

  const typeIcon = (t: GroupType) => {
    if (t === 'public') return <PublicIcon sx={{ fontSize: 14 }} />;
    if (t === 'private') return <LockIcon sx={{ fontSize: 14 }} />;
    return <LockOpenIcon sx={{ fontSize: 14 }} />;
  };

  const categoryLabel = (c: GroupCategory) => {
    const map: Record<GroupCategory, string> = { 'course-based': 'Course', 'subject-based': 'Subject', 'college-based': 'College', 'study-group': 'Study', 'project-group': 'Project' };
    return map[c];
  };

  return (
    <AnimatedPage>
      <Box sx={{ flex: 1, px: { xs: 2.5, md: 4, lg: 5 }, py: 3, overflow: 'auto' }}>
        {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#ec489920', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GroupIcon sx={{ fontSize: 20, color: '#ec4899' }} />
          </Box>
          <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>{t(language, 'communityGroupsTitle')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {groups.length} group{groups.length !== 1 ? 's' : ''} &middot; Collaborate, learn &amp; grow together
          </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ textTransform: 'none', bgcolor: dk ? '#1A2B3C' : '#616161', '&:hover': { bgcolor: dk ? '#243B4F' : '#424242' }, borderRadius: 2 }}>
          {t(language, 'newGroupBtn')}
        </Button>
      </Box>

      {/* Search & Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder={t(language, 'searchGroupsPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 240 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{t(language, 'categoryLabel')}</InputLabel>
          <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label={t(language, 'categoryLabel')}>
            <MenuItem value="all">{t(language, 'allCategoriesOpt')}</MenuItem>
            <MenuItem value="course-based">{t(language, 'groupCourse')}</MenuItem>
            <MenuItem value="subject-based">{t(language, 'groupSubject')}</MenuItem>
            <MenuItem value="college-based">{t(language, 'groupCollege')}</MenuItem>
            <MenuItem value="study-group">{t(language, 'groupStudy')}</MenuItem>
            <MenuItem value="project-group">{t(language, 'groupProject')}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
            <MenuItem value="all">{t(language, 'allTypesOpt')}</MenuItem>
            <MenuItem value="public">{t(language, 'typePublic')}</MenuItem>
            <MenuItem value="private">{t(language, 'typePrivate')}</MenuItem>
            <MenuItem value="restricted">{t(language, 'typeRestricted')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Cards */}
      {groups.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { icon: <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#ec489920', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}><GroupIcon sx={{ fontSize: 22, color: '#ec4899' }} /></Box>, value: groups.length, label: 'Total Groups' },
            { icon: <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#38bdf820', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}><SchoolIcon sx={{ fontSize: 22, color: '#38bdf8' }} /></Box>, value: groups.reduce((s, g) => s + g.members.length, 0), label: 'Total Members' },
            { icon: <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}><TrendingUpIcon sx={{ fontSize: 22, color: '#10b981' }} /></Box>, value: groups.reduce((s, g) => s + g.discussions.length, 0), label: 'Discussions' },
            { icon: <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}><NotificationsIcon sx={{ fontSize: 22, color: '#f59e0b' }} /></Box>, value: groups.reduce((s, g) => s + g.meetings.filter((m) => m.status === 'scheduled').length, 0), label: 'Upcoming Meetings' },
          ].map((stat, i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                  {stat.icon}
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Group Cards */}
      {filtered.length > 0 ? (
        <Grid container spacing={2}>
          {filtered.map((group, i) => {
          const unread = group.notifications.filter((n) => !n.read).length;
          const memberFill = Math.round((group.members.length / group.maxMembers) * 100);
          return (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
              >
                  <Card
                  onClick={() => navigate(`/app/groups/${group.id}`)}
                  sx={{
                    cursor: 'pointer', border: '1px solid', borderColor: 'divider', boxShadow: 'none',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                    <Box sx={{ height: 4, bgcolor: '#ec4899', borderRadius: '12px 12px 0 0' }} />
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Badge badgeContent={unread} color="error" max={9} sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}>
                        <GroupIcon sx={{ fontSize: 22, color: '#ec4899' }} />
                      </Badge>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }} noWrap>{group.name}</Typography>
                      <Tooltip title={group.groupType}>{typeIcon(group.groupType)}</Tooltip>
                    </Box>
                    {group.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5, lineHeight: 1.4 }}>
                        {group.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                      <Chip label={categoryLabel(group.category)} size="small" sx={{ height: 20, fontSize: 10, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }} />
                      <Chip label={`${group.members.length}/${group.maxMembers}`} size="small" icon={<GroupIcon sx={{ fontSize: '12px !important' }} />} sx={{ height: 20, fontSize: 10, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }} />
                      {group.courseIds.length > 0 && <Chip label={`${group.courseIds.length} courses`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }} />}
                      {group.assignments.length > 0 && <Chip label={`${group.assignments.length} tasks`} size="small" sx={{ height: 20, fontSize: 10, bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }} />}
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <LinearProgress variant="determinate" value={memberFill} sx={{ height: 3, borderRadius: 2, bgcolor: dk ? 'rgba(255,255,255,0.08)' : '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: '#ec4899' } }} />
                    </Box>
                    {group.members.length > 0 && (
                      <AvatarGroup max={5} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11, bgcolor: dk ? 'rgba(255,255,255,0.2)' : '#bdbdbd' } }}>
                        {group.members.map((m) => <Avatar key={m.id}>{m.name.charAt(0).toUpperCase()}</Avatar>)}
                      </AvatarGroup>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Code: {group.inviteCode}</Typography>
                      <Tooltip title={t(language, 'copyInviteCode')}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(group.inviteCode); toast.success(t(language, 'inviteCodeCopied')); }} sx={{ p: 0.25 }}>
                          <ContentCopyIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                  </Card>
              </motion.div>
            </Grid>
          );
        })}
        </Grid>
      ) : groups.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <GroupIcon sx={{ fontSize: 48, color: '#ec489940', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{t(language, 'noGroupsYetMsg')}</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ textTransform: 'none', borderColor: 'divider', color: 'text.secondary' }}>
            {t(language, 'createFirstGroupMsg')}
          </Button>
        </Box>
      ) : (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">{t(language, 'noGroupsMatchMsg')}</Typography>
        </Box>
      )}

      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      </Box>
    </AnimatedPage>
  );
}

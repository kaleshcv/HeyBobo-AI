import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Tabs, Tab, Card, CardContent, Grid, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Avatar,
  AvatarGroup, List, ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  Tooltip, Divider, Badge, LinearProgress, MenuItem, Select, FormControl,
  InputLabel, Radio, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FolderIcon from '@mui/icons-material/Folder';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PushPinIcon from '@mui/icons-material/PushPin';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PollIcon from '@mui/icons-material/Poll';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';

import HowToRegIcon from '@mui/icons-material/HowToReg';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  useGroupStore,
  Group, MemberRole, MeetingStatus,
} from '@/store/groupStore';
import toast from 'react-hot-toast';

// ─── Tab Panel ────────────────────────────────────────────

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

// ─── Section Card Helper ──────────────────────────────────

const SectionCard = ({ children, sx }: { children: React.ReactNode; sx?: object }) => (
  <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', ...sx }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>{children}</CardContent>
  </Card>
);

const btnSx = { textTransform: 'none', bgcolor: '#616161', '&:hover': { bgcolor: '#424242' } };

// =============================================================
// 1. OVERVIEW & SETTINGS TAB
// =============================================================
function OverviewTab({ group }: { group: Group }) {
  const updateGroup = useGroupStore((s) => s.updateGroup);
  const deleteGroup = useGroupStore((s) => s.deleteGroup);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [desc, setDesc] = useState(group.description);

  const handleSave = () => {
    updateGroup(group.id, { name: name.trim(), description: desc.trim() });
    toast.success('Group updated');
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this group permanently?')) {
      deleteGroup(group.id);
      toast.success('Group deleted');
      navigate('/app/groups');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <SectionCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SettingsIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>Group Settings</Typography>
            <IconButton size="small" onClick={() => setEditing(!editing)}><EditIcon fontSize="small" /></IconButton>
          </Box>
          {editing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth />
              <TextField label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} size="small" fullWidth multiline rows={2} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleSave} size="small" sx={btnSx}>Save</Button>
                <Button onClick={() => setEditing(false)} size="small" sx={{ textTransform: 'none' }}>Cancel</Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Category:</strong> {group.category}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Type:</strong> {group.groupType}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Post Permission:</strong> {group.postPermission}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Max Members:</strong> {group.maxMembers}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Created:</strong> {new Date(group.createdAt).toLocaleDateString()}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Chip label={`Invite: ${group.inviteCode}`} size="small" />
                <IconButton size="small" onClick={() => { navigator.clipboard.writeText(group.inviteCode); toast.success('Copied!'); }}>
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          )}
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={4}>
        <SectionCard>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Quick Stats</Typography>
          {[
            { label: 'Members', value: `${group.members.length}/${group.maxMembers}` },
            { label: 'Courses', value: group.courseIds.length },
            { label: 'Discussions', value: group.discussions.length },
            { label: 'Assignments', value: group.assignments.length },
            { label: 'Meetings', value: group.meetings.length },
            { label: 'Resources', value: group.resources.length },
          ].map((s, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.value}</Typography>
            </Box>
          ))}
        </SectionCard>
        <Button fullWidth variant="outlined" color="error" onClick={handleDelete} sx={{ mt: 2, textTransform: 'none' }} startIcon={<DeleteIcon />}>
          Delete Group
        </Button>
      </Grid>
    </Grid>
  );
}

// =============================================================
// 2. MEMBERS TAB
// =============================================================
function MembersTab({ group }: { group: Group }) {
  const { addMember, removeMember, updateMemberRole, bulkAddMembers, resolveJoinRequest } = useGroupStore();
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('member');
  const [bulkText, setBulkText] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !email.trim()) { toast.error('Name and email required'); return; }
    addMember(group.id, { name: name.trim(), email: email.trim(), role });
    toast.success('Member added');
    setName(''); setEmail(''); setRole('member'); setAddOpen(false);
  };

  const handleBulk = () => {
    const lines = bulkText.split('\n').filter(Boolean);
    const members = lines.map((l) => {
      const [n, e] = l.split(',').map((s) => s.trim());
      return { name: n || '', email: e || '' };
    }).filter((m) => m.name && m.email);
    if (members.length === 0) { toast.error('No valid entries. Use format: Name, Email'); return; }
    bulkAddMembers(group.id, members);
    toast.success(`${members.length} members added`);
    setBulkText(''); setBulkOpen(false);
  };

  const pendingRequests = group.joinRequests.filter((r) => r.status === 'pending');

  const roleIcon = (r: MemberRole) => {
    if (r === 'owner' || r === 'admin') return <AdminPanelSettingsIcon sx={{ fontSize: 16, color: '#757575' }} />;
    return <PersonIcon sx={{ fontSize: 16, color: '#bdbdbd' }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={() => setAddOpen(true)} sx={btnSx}>Add Member</Button>
        <Button variant="outlined" size="small" onClick={() => setBulkOpen(true)} sx={{ textTransform: 'none' }}>Bulk Import</Button>
        <Box sx={{ flex: 1 }} />
        <Chip label={`${group.members.length}/${group.maxMembers} members`} size="small" />
      </Box>

      {/* Pending Join Requests */}
      {pendingRequests.length > 0 && (
        <SectionCard sx={{ mb: 2, borderColor: '#fff3e0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Join Requests ({pendingRequests.length})</Typography>
          <List dense sx={{ py: 0 }}>
            {pendingRequests.map((req) => (
              <ListItem key={req.id} sx={{ px: 0 }}>
                <ListItemAvatar><Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: '#bdbdbd' }}>{req.name.charAt(0)}</Avatar></ListItemAvatar>
                <ListItemText primary={req.name} secondary={req.email} primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }} />
                <ListItemSecondaryAction>
                  <IconButton size="small" onClick={() => { resolveJoinRequest(group.id, req.id, true); toast.success('Approved'); }} sx={{ color: 'success.main' }}><HowToRegIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => { resolveJoinRequest(group.id, req.id, false); toast.success('Rejected'); }} sx={{ color: 'error.main' }}><CancelIcon fontSize="small" /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </SectionCard>
      )}

      {/* Members List */}
      <SectionCard>
        {group.members.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No members yet. Add your first member above.</Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {group.members.map((m) => (
              <ListItem key={m.id} sx={{ px: 0, py: 0.5 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: '#9e9e9e' }}>{m.name.charAt(0).toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{m.name} {roleIcon(m.role)} <Chip label={m.role} size="small" sx={{ height: 18, fontSize: 10 }} /></Box>}
                  secondary={`${m.email} · Joined ${new Date(m.joinedAt).toLocaleDateString()}`}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
                <ListItemSecondaryAction>
                  <FormControl size="small" sx={{ minWidth: 90, mr: 1 }}>
                    <Select value={m.role} onChange={(e) => { updateMemberRole(group.id, m.id, e.target.value as MemberRole); toast.success('Role updated'); }} sx={{ fontSize: 11, height: 28 }}>
                      <MenuItem value="owner" sx={{ fontSize: 12 }}>Owner</MenuItem>
                      <MenuItem value="admin" sx={{ fontSize: 12 }}>Admin</MenuItem>
                      <MenuItem value="moderator" sx={{ fontSize: 12 }}>Moderator</MenuItem>
                      <MenuItem value="member" sx={{ fontSize: 12 }}>Member</MenuItem>
                    </Select>
                  </FormControl>
                  <Tooltip title="Remove"><IconButton size="small" onClick={() => { removeMember(group.id, m.id); toast.success('Removed'); }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </SectionCard>

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Add Member</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth />
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} size="small" fullWidth type="email" />
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={role} onChange={(e) => setRole(e.target.value as MemberRole)} label="Role">
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
              <MenuItem value="member">Member</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" sx={btnSx}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Bulk Import Members</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>One member per line: Name, Email</Typography>
          <TextField value={bulkText} onChange={(e) => setBulkText(e.target.value)} fullWidth multiline rows={8} size="small" placeholder={"John Doe, john@example.com\nJane Smith, jane@example.com"} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBulkOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleBulk} variant="contained" sx={btnSx}>Import</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 3. CONTENT & LECTURES TAB
// =============================================================
function ContentTab({ group }: { group: Group }) {
  const { addContent, removeContent, togglePinContent, removeCourse } = useGroupStore();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'pdf' | 'note' | 'link' | 'recording'>('video');
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (!title.trim()) { toast.error('Title required'); return; }
    addContent(group.id, { title: title.trim(), type, url: url.trim(), description: desc.trim(), uploadedBy: 'You' });
    toast.success('Content added');
    setTitle(''); setUrl(''); setDesc(''); setAddOpen(false);
  };

  const pinned = group.content.filter((c) => c.pinned);
  const unpinned = group.content.filter((c) => !c.pinned);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<UploadFileIcon />} onClick={() => setAddOpen(true)} sx={btnSx}>Add Content</Button>
      </Box>

      {/* Courses Section */}
      {group.courseIds.length > 0 && (
        <SectionCard sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            <MenuBookIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
            Assigned Courses ({group.courseIds.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {group.courseIds.map((cid) => (
              <Chip key={cid} label={cid} size="small" onDelete={() => { removeCourse(group.id, cid); toast.success('Course removed'); }} sx={{ fontSize: 11 }} />
            ))}
          </Box>
        </SectionCard>
      )}

      {/* Pinned Content */}
      {pinned.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PushPinIcon sx={{ fontSize: 16 }} /> Pinned
          </Typography>
          <Grid container spacing={1}>
            {pinned.map((c) => (
              <Grid item xs={12} sm={6} key={c.id}>
                <SectionCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={c.type} size="small" sx={{ height: 20, fontSize: 10 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }} noWrap>{c.title}</Typography>
                    <IconButton size="small" onClick={() => togglePinContent(group.id, c.id)}><PushPinIcon sx={{ fontSize: 14, color: '#616161' }} /></IconButton>
                    <IconButton size="small" onClick={() => { removeContent(group.id, c.id); toast.success('Removed'); }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  {c.url && <Typography variant="caption" color="primary" component="a" href={c.url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 11 }}>{c.url}</Typography>}
                </SectionCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* All Content */}
      <SectionCard>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>All Content ({group.content.length})</Typography>
        {group.content.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No content shared yet</Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {unpinned.map((c) => (
              <ListItem key={c.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Chip label={c.type} size="small" sx={{ height: 18, fontSize: 10 }} /> {c.title}</Box>}
                  secondary={`By ${c.uploadedBy} · ${new Date(c.createdAt).toLocaleDateString()}`}
                  primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" onClick={() => togglePinContent(group.id, c.id)}><PushPinIcon sx={{ fontSize: 14, color: '#bdbdbd' }} /></IconButton>
                  <IconButton size="small" onClick={() => { removeContent(group.id, c.id); toast.success('Removed'); }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </SectionCard>

      {/* Add Content Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Add Content</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} label="Type">
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="link">Link</MenuItem>
              <MenuItem value="recording">Recording</MenuItem>
            </Select>
          </FormControl>
          <TextField label="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} size="small" fullWidth />
          <TextField label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} size="small" fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" sx={btnSx}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 4. LIVE CLASSES & MEETINGS TAB
// =============================================================
function MeetingsTab({ group }: { group: Group }) {
  const { scheduleMeeting, updateMeetingStatus } = useGroupStore();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [platform, setPlatform] = useState<'jitsi' | 'zoom' | 'google-meet'>('jitsi');
  const [link, setLink] = useState('');

  const handleSchedule = () => {
    if (!title.trim() || !date) { toast.error('Title and date required'); return; }
    scheduleMeeting(group.id, { title: title.trim(), description: desc.trim(), date, duration, instructor: 'You', platform, meetingLink: link.trim() || undefined });
    toast.success('Meeting scheduled');
    setTitle(''); setDesc(''); setDate(''); setLink(''); setScheduleOpen(false);
  };

  const statusColor = (s: MeetingStatus) => {
    if (s === 'live') return 'success';
    if (s === 'completed') return 'default';
    if (s === 'cancelled') return 'error';
    return 'primary';
  };

  const scheduled = group.meetings.filter((m) => m.status === 'scheduled');
  const past = group.meetings.filter((m) => m.status !== 'scheduled');

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<VideoCallIcon />} onClick={() => setScheduleOpen(true)} sx={btnSx}>Schedule Meeting</Button>
      </Box>

      {/* Upcoming */}
      {scheduled.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Upcoming ({scheduled.length})</Typography>
          <Grid container spacing={1}>
            {scheduled.map((m) => (
              <Grid item xs={12} sm={6} key={m.id}>
                <SectionCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VideoCallIcon sx={{ fontSize: 18, color: '#757575' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{m.title}</Typography>
                    <Chip label={m.status} size="small" color={statusColor(m.status)} sx={{ height: 20, fontSize: 10 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{new Date(m.date).toLocaleString()} · {m.duration}min · {m.platform}</Typography>
                  {m.meetingLink && <Typography variant="caption" color="primary" component="a" href={m.meetingLink} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 11 }}>Join Link</Typography>}
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => { updateMeetingStatus(group.id, m.id, 'live'); toast.success('Meeting started!'); }} sx={{ textTransform: 'none', fontSize: 11 }}>Start</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => { updateMeetingStatus(group.id, m.id, 'cancelled'); toast.success('Cancelled'); }} sx={{ textTransform: 'none', fontSize: 11 }}>Cancel</Button>
                  </Box>
                </SectionCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Past Meetings */}
      <SectionCard>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Past Meetings ({past.length})</Typography>
        {past.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No past meetings</Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {past.map((m) => (
              <ListItem key={m.id} sx={{ px: 0 }}>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{m.title} <Chip label={m.status} size="small" color={statusColor(m.status)} sx={{ height: 18, fontSize: 10 }} /></Box>}
                  secondary={`${new Date(m.date).toLocaleString()} · ${m.attendees.length} attended · ${m.platform}`}
                  primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }}
                />
                <ListItemSecondaryAction>
                  {m.status === 'live' && (
                    <Button size="small" onClick={() => { updateMeetingStatus(group.id, m.id, 'completed'); toast.success('Completed'); }} sx={{ textTransform: 'none', fontSize: 11 }}>End</Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </SectionCard>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Schedule Meeting</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
          <TextField label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} size="small" fullWidth multiline rows={2} />
          <TextField label="Date & Time" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Duration (min)" type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 30)} size="small" fullWidth /></Grid>
            <Grid item xs={6}>
              <FormControl size="small" fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)} label="Platform">
                  <MenuItem value="jitsi">Jitsi</MenuItem>
                  <MenuItem value="zoom">Zoom</MenuItem>
                  <MenuItem value="google-meet">Google Meet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <TextField label="Meeting Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} size="small" fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setScheduleOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleSchedule} variant="contained" sx={btnSx}>Schedule</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 5. AI STUDY ASSISTANT TAB
// =============================================================
function AIStudyTab({ group }: { group: Group }) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Hi! I'm the AI Study Assistant for "${group.name}". Ask me anything about the group's subjects, assignments, or topics.` },
  ]);

  const handleSend = () => {
    if (!query.trim()) return;
    const q = query.trim();
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setQuery('');
    // Simulated AI response
    setTimeout(() => {
      const responses = [
        `Great question about "${q}"! Based on the group content, here's what I found:\n\n- Review the pinned materials in the Content tab\n- Check recent discussions for peer insights\n- The upcoming assignments cover related topics`,
        `Let me help with "${q}". Here are some study tips:\n\n1. Break the topic into smaller concepts\n2. Use the group's resources for reference material\n3. Discuss with peers in the Discussion tab`,
        `Regarding "${q}":\n\nThis topic connects to ${group.assignments.length} assignments in this group. I'd recommend starting with the foundational concepts and working through the practice problems.`,
      ];
      setMessages((prev) => [...prev, { role: 'ai', text: responses[Math.floor(Math.random() * responses.length)] }]);
    }, 800);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 500 }}>
      <SectionCard sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SmartToyIcon sx={{ fontSize: 20, color: '#757575' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>AI Study Assistant</Typography>
        </Box>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1, py: 1 }}>
          {messages.map((m, i) => (
            <Box key={i} sx={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <Paper sx={{ px: 2, py: 1, maxWidth: '75%', bgcolor: m.role === 'user' ? '#616161' : '#f5f5f5', color: m.role === 'user' ? '#fff' : 'text.primary', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ fontSize: 13, whiteSpace: 'pre-line' }}>{m.text}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            fullWidth size="small" placeholder="Ask the AI study assistant..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <IconButton onClick={handleSend} sx={{ bgcolor: '#616161', color: '#fff', '&:hover': { bgcolor: '#424242' }, borderRadius: 2 }}>
            <SendIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </SectionCard>
    </Box>
  );
}

// =============================================================
// 6. DISCUSSIONS & CHAT TAB
// =============================================================
function DiscussionsTab({ group }: { group: Group }) {
  const { createDiscussion, replyToDiscussion, togglePinDiscussion, reactToDiscussion } = useGroupStore();
  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dType, setDType] = useState<'general' | 'topic' | 'doubt'>('general');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) { toast.error('Title and content required'); return; }
    createDiscussion(group.id, { type: dType, title: title.trim(), content: content.trim(), authorId: 'current-user', authorName: 'You' });
    toast.success('Discussion created');
    setTitle(''); setContent(''); setNewOpen(false);
  };

  const handleReply = (discussionId: string) => {
    const text = replyText[discussionId]?.trim();
    if (!text) return;
    replyToDiscussion(group.id, discussionId, { content: text, authorId: 'current-user', authorName: 'You' });
    setReplyText((prev) => ({ ...prev, [discussionId]: '' }));
    toast.success('Reply posted');
  };

  const emojis = ['👍', '❤️', '🎉', '💡', '🔥'];

  const pinned = group.discussions.filter((d) => d.pinned);
  const regular = group.discussions.filter((d) => !d.pinned);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<ChatIcon />} onClick={() => setNewOpen(true)} sx={btnSx}>New Discussion</Button>
        <Box sx={{ flex: 1 }} />
        <Chip label={`${group.discussions.length} discussions`} size="small" />
      </Box>

      {[...pinned, ...regular].map((d) => (
        <SectionCard key={d.id} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            {d.pinned && <PushPinIcon sx={{ fontSize: 14, color: '#616161' }} />}
            <Chip label={d.type} size="small" sx={{ height: 18, fontSize: 10 }} />
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{d.title}</Typography>
            <Tooltip title="Pin/Unpin"><IconButton size="small" onClick={() => togglePinDiscussion(group.id, d.id)}><PushPinIcon sx={{ fontSize: 14, color: d.pinned ? '#616161' : '#bdbdbd' }} /></IconButton></Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: 13 }}>{d.content}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">{d.authorName} · {new Date(d.createdAt).toLocaleString()}</Typography>
            <Box sx={{ flex: 1 }} />
            {emojis.map((emoji) => (
              <Tooltip key={emoji} title={`${(d.reactions[emoji] || []).length} reactions`}>
                <Chip
                  label={`${emoji} ${(d.reactions[emoji] || []).length || ''}`}
                  size="small"
                  onClick={() => reactToDiscussion(group.id, d.id, emoji, 'current-user')}
                  sx={{ height: 22, fontSize: 11, cursor: 'pointer', bgcolor: (d.reactions[emoji] || []).includes('current-user') ? '#e0e0e0' : 'transparent' }}
                />
              </Tooltip>
            ))}
          </Box>

          {/* Replies */}
          <Button size="small" onClick={() => setExpanded(expanded === d.id ? null : d.id)} sx={{ textTransform: 'none', fontSize: 11, color: 'text.secondary' }}>
            {d.replies.length} replies {expanded === d.id ? '▲' : '▼'}
          </Button>
          {expanded === d.id && (
            <Box sx={{ pl: 2, mt: 1, borderLeft: '2px solid #e0e0e0' }}>
              {d.replies.map((r) => (
                <Box key={r.id} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: 12 }}><strong>{r.authorName}</strong>: {r.content}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(r.createdAt).toLocaleString()}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small" fullWidth placeholder="Write a reply..."
                  value={replyText[d.id] || ''} onChange={(e) => setReplyText((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleReply(d.id))}
                />
                <IconButton onClick={() => handleReply(d.id)} size="small" sx={{ bgcolor: '#616161', color: '#fff', '&:hover': { bgcolor: '#424242' } }}>
                  <SendIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          )}
        </SectionCard>
      ))}

      {group.discussions.length === 0 && (
        <SectionCard><Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No discussions yet. Start the conversation!</Typography></SectionCard>
      )}

      {/* New Discussion Dialog */}
      <Dialog open={newOpen} onClose={() => setNewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>New Discussion</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={dType} onChange={(e) => setDType(e.target.value as typeof dType)} label="Type">
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="topic">Topic</MenuItem>
              <MenuItem value="doubt">Doubt</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
          <TextField label="Content" value={content} onChange={(e) => setContent(e.target.value)} size="small" fullWidth multiline rows={4} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNewOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" sx={btnSx}>Post</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 7. ASSIGNMENTS & TASKS TAB
// =============================================================
function AssignmentsTab({ group }: { group: Group }) {
  const { createAssignment, gradeSubmission } = useGroupStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [gradeOpen, setGradeOpen] = useState<{ assignmentId: string; submissionId: string } | null>(null);
  const [gradeVal, setGradeVal] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleCreate = () => {
    if (!title.trim() || !deadline) { toast.error('Title and deadline required'); return; }
    createAssignment(group.id, { title: title.trim(), description: desc.trim(), instructions: instructions.trim(), deadline, createdBy: 'You' });
    toast.success('Assignment created');
    setTitle(''); setDesc(''); setInstructions(''); setDeadline(''); setCreateOpen(false);
  };

  const handleGrade = () => {
    if (!gradeOpen) return;
    gradeSubmission(group.id, gradeOpen.assignmentId, gradeOpen.submissionId, gradeVal, 100, feedback.trim());
    toast.success('Graded');
    setGradeOpen(null); setGradeVal(0); setFeedback('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<AssignmentIcon />} onClick={() => setCreateOpen(true)} sx={btnSx}>New Assignment</Button>
        <Box sx={{ flex: 1 }} />
        <Chip label={`${group.assignments.length} assignments`} size="small" />
      </Box>

      {group.assignments.map((a) => {
        const overdue = new Date(a.deadline) < new Date();
        return (
          <SectionCard key={a.id} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <AssignmentIcon sx={{ fontSize: 18, color: overdue ? '#f44336' : '#757575' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{a.title}</Typography>
              <Chip label={overdue ? 'Overdue' : 'Active'} size="small" color={overdue ? 'error' : 'success'} sx={{ height: 20, fontSize: 10 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 0.5 }}>{a.description}</Typography>
            <Typography variant="caption" color="text.secondary">Due: {new Date(a.deadline).toLocaleString()} · {a.submissions.length} submissions</Typography>

            <Button size="small" onClick={() => setExpanded(expanded === a.id ? null : a.id)} sx={{ textTransform: 'none', fontSize: 11, mt: 0.5 }}>
              Submissions ({a.submissions.length}) {expanded === a.id ? '▲' : '▼'}
            </Button>

            {expanded === a.id && (
              <Box sx={{ mt: 1 }}>
                {a.instructions && (
                  <Paper sx={{ p: 1.5, mb: 1, bgcolor: '#fafafa' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Instructions:</Typography>
                    <Typography variant="body2" sx={{ fontSize: 12 }}>{a.instructions}</Typography>
                  </Paper>
                )}
                {a.submissions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>No submissions yet</Typography>
                ) : (
                  <List dense sx={{ py: 0 }}>
                    {a.submissions.map((s) => (
                      <ListItem key={s.id} sx={{ px: 0 }}>
                        <ListItemText
                          primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{s.memberName} <Chip label={s.status} size="small" color={s.status === 'graded' ? 'success' : 'default'} sx={{ height: 18, fontSize: 10 }} /> {s.grade !== undefined && <Typography variant="caption" sx={{ fontWeight: 600 }}>{s.grade}/{s.maxGrade}</Typography>}</Box>}
                          secondary={s.content.substring(0, 100)}
                          primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }}
                        />
                        {s.status !== 'graded' && (
                          <ListItemSecondaryAction>
                            <Button size="small" onClick={() => setGradeOpen({ assignmentId: a.id, submissionId: s.id })} sx={{ textTransform: 'none', fontSize: 11 }}>Grade</Button>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </SectionCard>
        );
      })}

      {group.assignments.length === 0 && (
        <SectionCard><Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No assignments yet</Typography></SectionCard>
      )}

      {/* Create Assignment Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>New Assignment</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
          <TextField label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} size="small" fullWidth multiline rows={2} />
          <TextField label="Instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} size="small" fullWidth multiline rows={3} />
          <TextField label="Deadline" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" sx={btnSx}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Grade Dialog */}
      <Dialog open={!!gradeOpen} onClose={() => setGradeOpen(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Grade Submission</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Grade (out of 100)" type="number" value={gradeVal} onChange={(e) => setGradeVal(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} size="small" fullWidth inputProps={{ min: 0, max: 100 }} />
          <TextField label="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} size="small" fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setGradeOpen(null)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleGrade} variant="contained" sx={btnSx}>Grade</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 8. ATTENDANCE & PARTICIPATION TAB
// =============================================================
function AttendanceTab({ group }: { group: Group }) {
  const { recordAttendance } = useGroupStore();
  const [selectedMeeting, setSelectedMeeting] = useState<string>('');
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const meetings = group.meetings;

  const toggleMember = (id: string) => {
    setCheckedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!selectedMeeting) { toast.error('Select a meeting'); return; }
    recordAttendance(group.id, selectedMeeting, checkedIds);
    toast.success('Attendance recorded');
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <SectionCard>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Record Attendance</Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Meeting</InputLabel>
              <Select value={selectedMeeting} onChange={(e) => { setSelectedMeeting(e.target.value); setCheckedIds([]); }} label="Meeting">
                {meetings.map((m) => <MenuItem key={m.id} value={m.id}>{m.title} - {new Date(m.date).toLocaleDateString()}</MenuItem>)}
              </Select>
            </FormControl>
            {selectedMeeting && group.members.length > 0 && (
              <>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Button size="small" onClick={() => setCheckedIds(group.members.map((m) => m.id))} sx={{ textTransform: 'none', fontSize: 11 }}>Select All</Button>
                  <Button size="small" onClick={() => setCheckedIds([])} sx={{ textTransform: 'none', fontSize: 11 }}>Clear</Button>
                </Box>
                <List dense sx={{ py: 0, maxHeight: 300, overflow: 'auto' }}>
                  {group.members.map((m) => (
                    <ListItem key={m.id} sx={{ px: 0, cursor: 'pointer' }} onClick={() => toggleMember(m.id)}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: checkedIds.includes(m.id) ? '#616161' : '#bdbdbd' }}>
                          {checkedIds.includes(m.id) ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : m.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={m.name} secondary={m.email} primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }} />
                    </ListItem>
                  ))}
                </List>
                <Button fullWidth variant="contained" onClick={handleSave} sx={{ mt: 1, ...btnSx }}>Save Attendance ({checkedIds.length}/{group.members.length})</Button>
              </>
            )}
            {group.members.length === 0 && <Typography variant="body2" color="text.secondary">Add members to track attendance</Typography>}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={5}>
          <SectionCard>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Member Attendance</Typography>
            <List dense sx={{ py: 0 }}>
              {group.members.map((m) => (
                <ListItem key={m.id} sx={{ px: 0 }}>
                  <ListItemText primary={m.name} secondary={`Attendance: ${m.stats.attendance}%`} primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }} />
                  <Box sx={{ width: 80 }}>
                    <LinearProgress variant="determinate" value={m.stats.attendance} sx={{ height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: m.stats.attendance >= 75 ? '#4caf50' : m.stats.attendance >= 50 ? '#ff9800' : '#f44336' } }} />
                  </Box>
                </ListItem>
              ))}
            </List>
            {group.members.length === 0 && <Typography variant="body2" color="text.secondary">No members yet</Typography>}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// =============================================================
// 9. QUIZZES & POLLS TAB
// =============================================================
function QuizPollTab({ group }: { group: Group }) {
  const { createQuiz, createPoll, votePoll } = useGroupStore();
  const [quizOpen, setQuizOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  // Quiz form
  const [qTitle, setQTitle] = useState('');
  const [qTimeLimit, setQTimeLimit] = useState(10);
  const [questions, setQuestions] = useState<{ question: string; options: string[]; correctIdx: number }[]>([{ question: '', options: ['', '', '', ''], correctIdx: 0 }]);
  // Poll form
  const [pQuestion, setPQuestion] = useState('');
  const [pOptions, setPOptions] = useState(['', '']);

  const addQuestion = () => setQuestions((prev) => [...prev, { question: '', options: ['', '', '', ''], correctIdx: 0 }]);

  const handleCreateQuiz = () => {
    if (!qTitle.trim() || questions.some((q) => !q.question.trim())) { toast.error('Fill all questions'); return; }
    createQuiz(group.id, {
      title: qTitle.trim(),
      timeLimit: qTimeLimit,
      isLive: false,
      questions: questions.map((q, i) => ({
        id: `q-${i}`,
        question: q.question,
        options: q.options.map((o, j) => ({ id: `o-${j}`, text: o })),
        correctOptionId: `o-${q.correctIdx}`,
      })),
    });
    toast.success('Quiz created');
    setQTitle(''); setQuestions([{ question: '', options: ['', '', '', ''], correctIdx: 0 }]); setQuizOpen(false);
  };

  const handleCreatePoll = () => {
    if (!pQuestion.trim() || pOptions.filter(Boolean).length < 2) { toast.error('Question and 2+ options required'); return; }
    createPoll(group.id, {
      question: pQuestion.trim(),
      options: pOptions.filter(Boolean).map((o, i) => ({ id: `po-${i}`, text: o, votes: [] })),
      createdBy: 'You',
    });
    toast.success('Poll created');
    setPQuestion(''); setPOptions(['', '']); setPollOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<QuizIcon />} onClick={() => setQuizOpen(true)} sx={btnSx}>New Quiz</Button>
        <Button variant="outlined" size="small" startIcon={<PollIcon />} onClick={() => setPollOpen(true)} sx={{ textTransform: 'none' }}>New Poll</Button>
      </Box>

      {/* Polls */}
      {group.polls.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Active Polls</Typography>
          <Grid container spacing={1}>
            {group.polls.map((p) => {
              const totalVotes = p.options.reduce((s, o) => s + o.votes.length, 0);
              return (
                <Grid item xs={12} sm={6} key={p.id}>
                  <SectionCard>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{p.question}</Typography>
                    {p.options.map((o) => {
                      const pct = totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0;
                      const voted = o.votes.includes('current-user');
                      return (
                        <Box key={o.id} sx={{ mb: 0.5, cursor: 'pointer' }} onClick={() => { votePoll(group.id, p.id, o.id, 'current-user'); }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                            <Typography variant="body2" sx={{ fontSize: 12, fontWeight: voted ? 600 : 400 }}>{o.text}</Typography>
                            <Typography variant="caption">{pct}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: voted ? '#616161' : '#bdbdbd' } }} />
                        </Box>
                      );
                    })}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{totalVotes} votes</Typography>
                  </SectionCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Quizzes */}
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Quizzes ({group.quizzes.length})</Typography>
      {group.quizzes.length === 0 ? (
        <SectionCard><Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No quizzes yet</Typography></SectionCard>
      ) : (
        <Grid container spacing={1}>
          {group.quizzes.map((q) => (
            <Grid item xs={12} sm={6} key={q.id}>
              <SectionCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <QuizIcon sx={{ fontSize: 18, color: '#757575' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{q.title}</Typography>
                  {q.isLive && <Chip label="LIVE" size="small" color="error" sx={{ height: 18, fontSize: 10 }} />}
                </Box>
                <Typography variant="caption" color="text.secondary">{q.questions.length} questions · {q.timeLimit || '∞'}min · {q.attempts.length} attempts</Typography>
                {q.attempts.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Top Scores:</Typography>
                    {q.attempts.sort((a, b) => b.score - a.score).slice(0, 3).map((a, i) => (
                      <Typography key={i} variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 11 }}>
                        {i + 1}. {a.memberName}: {a.score}/{a.total}
                      </Typography>
                    ))}
                  </Box>
                )}
              </SectionCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Quiz Dialog */}
      <Dialog open={quizOpen} onClose={() => setQuizOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Create Quiz</DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField label="Quiz Title" value={qTitle} onChange={(e) => setQTitle(e.target.value)} size="small" sx={{ flex: 1 }} />
            <TextField label="Time (min)" type="number" value={qTimeLimit} onChange={(e) => setQTimeLimit(parseInt(e.target.value) || 5)} size="small" sx={{ width: 100 }} />
          </Box>
          {questions.map((q, qi) => (
            <Paper key={qi} sx={{ p: 2, mb: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>Question {qi + 1}</Typography>
              <TextField
                fullWidth size="small" placeholder="Question text" value={q.question} sx={{ mb: 1, mt: 0.5 }}
                onChange={(e) => setQuestions((prev) => prev.map((p, i) => i === qi ? { ...p, question: e.target.value } : p))}
              />
              <Grid container spacing={1}>
                {q.options.map((o, oi) => (
                  <Grid item xs={6} key={oi}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Radio size="small" checked={q.correctIdx === oi} onChange={() => setQuestions((prev) => prev.map((p, i) => i === qi ? { ...p, correctIdx: oi } : p))} />
                      <TextField
                        size="small" fullWidth placeholder={`Option ${oi + 1}`} value={o}
                        onChange={(e) => setQuestions((prev) => prev.map((p, i) => i === qi ? { ...p, options: p.options.map((op, j) => j === oi ? e.target.value : op) } : p))}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
          <Button size="small" onClick={addQuestion} startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>Add Question</Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setQuizOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleCreateQuiz} variant="contained" sx={btnSx}>Create Quiz</Button>
        </DialogActions>
      </Dialog>

      {/* Create Poll Dialog */}
      <Dialog open={pollOpen} onClose={() => setPollOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Create Poll</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Question" value={pQuestion} onChange={(e) => setPQuestion(e.target.value)} size="small" fullWidth />
          {pOptions.map((o, i) => (
            <TextField key={i} label={`Option ${i + 1}`} value={o} onChange={(e) => setPOptions((prev) => prev.map((p, j) => j === i ? e.target.value : p))} size="small" fullWidth />
          ))}
          <Button size="small" onClick={() => setPOptions((prev) => [...prev, ''])} startIcon={<AddIcon />} sx={{ textTransform: 'none' }}>Add Option</Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPollOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleCreatePoll} variant="contained" sx={btnSx}>Create Poll</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 10. CALENDAR & SCHEDULING TAB
// =============================================================
function CalendarTab({ group }: { group: Group }) {
  const { addCalendarEvent, removeCalendarEvent } = useGroupStore();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'lecture' | 'assignment' | 'exam' | 'meeting' | 'other'>('lecture');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');

  const sorted = useMemo(() => [...group.calendar].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [group.calendar]);
  const upcoming = sorted.filter((e) => new Date(e.date) >= new Date());
  const past = sorted.filter((e) => new Date(e.date) < new Date());

  const handleAdd = () => {
    if (!title.trim() || !date) { toast.error('Title and date required'); return; }
    addCalendarEvent(group.id, { title: title.trim(), type, date, description: desc.trim() });
    toast.success('Event added');
    setTitle(''); setDate(''); setDesc(''); setAddOpen(false);
  };

  const typeColor = (t: string) => {
    const map: Record<string, string> = { lecture: '#1976d2', assignment: '#f44336', exam: '#ff9800', meeting: '#4caf50', other: '#9e9e9e' };
    return map[t] || '#9e9e9e';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" size="small" startIcon={<EventIcon />} onClick={() => setAddOpen(true)} sx={btnSx}>Add Event</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Upcoming Events ({upcoming.length})</Typography>
            {upcoming.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No upcoming events</Typography>
            ) : (
              <List dense sx={{ py: 0 }}>
                {upcoming.map((e) => (
                  <ListItem key={e.id} sx={{ px: 0 }}>
                    <Box sx={{ width: 4, height: 32, bgcolor: typeColor(e.type), borderRadius: 2, mr: 1.5, flexShrink: 0 }} />
                    <ListItemText
                      primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{e.title} <Chip label={e.type} size="small" sx={{ height: 18, fontSize: 10 }} /></Box>}
                      secondary={new Date(e.date).toLocaleString()}
                      primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => { removeCalendarEvent(group.id, e.id); toast.success('Removed'); }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Past Events ({past.length})</Typography>
            {past.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No past events</Typography>
            ) : (
              <List dense sx={{ py: 0 }}>
                {past.slice(0, 10).map((e) => (
                  <ListItem key={e.id} sx={{ px: 0, opacity: 0.6 }}>
                    <Box sx={{ width: 4, height: 32, bgcolor: typeColor(e.type), borderRadius: 2, mr: 1.5, flexShrink: 0 }} />
                    <ListItemText primary={e.title} secondary={new Date(e.date).toLocaleString()} primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }} />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Add Event Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Add Calendar Event</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} label="Type">
              <MenuItem value="lecture">Lecture</MenuItem>
              <MenuItem value="assignment">Assignment</MenuItem>
              <MenuItem value="exam">Exam</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} size="small" fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Description" value={desc} onChange={(e) => setDesc(e.target.value)} size="small" fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" sx={btnSx}>Add Event</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 11. NOTIFICATIONS TAB
// =============================================================
function NotificationsTab({ group }: { group: Group }) {
  const { markNotificationRead, markAllNotificationsRead } = useGroupStore();
  const unread = group.notifications.filter((n) => !n.read).length;

  const typeIcon = (t: string) => {
    const map: Record<string, React.ReactNode> = {
      lecture: <MenuBookIcon sx={{ fontSize: 18 }} />,
      meeting: <VideoCallIcon sx={{ fontSize: 18 }} />,
      assignment: <AssignmentIcon sx={{ fontSize: 18 }} />,
      reply: <ChatIcon sx={{ fontSize: 18 }} />,
      content: <FolderIcon sx={{ fontSize: 18 }} />,
      member: <PersonIcon sx={{ fontSize: 18 }} />,
      quiz: <QuizIcon sx={{ fontSize: 18 }} />,
    };
    return map[t] || <NotificationsIcon sx={{ fontSize: 18 }} />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>{unread} unread</Typography>
        {unread > 0 && (
          <Button size="small" onClick={() => markAllNotificationsRead(group.id)} sx={{ textTransform: 'none', fontSize: 12 }}>Mark all read</Button>
        )}
      </Box>

      <SectionCard>
        {group.notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No notifications</Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {group.notifications.map((n) => (
              <ListItem
                key={n.id}
                sx={{ px: 0, py: 0.5, cursor: 'pointer', bgcolor: !n.read ? 'rgba(97,97,97,0.04)' : 'transparent', borderRadius: 1 }}
                onClick={() => markNotificationRead(group.id, n.id)}
              >
                <ListItemAvatar sx={{ minWidth: 36 }}>
                  <Box sx={{ color: !n.read ? '#616161' : '#bdbdbd' }}>{typeIcon(n.type)}</Box>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontSize: 13, fontWeight: !n.read ? 600 : 400 }}>{n.title}</Typography>}
                  secondary={<Typography variant="caption" color="text.secondary">{n.message} · {new Date(n.createdAt).toLocaleString()}</Typography>}
                />
                {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#616161', flexShrink: 0 }} />}
              </ListItem>
            ))}
          </List>
        )}
      </SectionCard>
    </Box>
  );
}

// =============================================================
// 12. RESOURCE HUB TAB
// =============================================================
function ResourcesTab({ group }: { group: Group }) {
  const { addResource, removeResource } = useGroupStore();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'note' | 'video' | 'link' | 'document'>('note');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleAdd = () => {
    if (!title.trim()) { toast.error('Title required'); return; }
    addResource(group.id, { title: title.trim(), type, url: url.trim() || undefined, content: content.trim() || undefined, tags: tags.split(',').map((t) => t.trim()).filter(Boolean), uploadedBy: 'You' });
    toast.success('Resource added');
    setTitle(''); setUrl(''); setContent(''); setTags(''); setAddOpen(false);
  };

  const allTags = [...new Set(group.resources.flatMap((r) => r.tags))];
  const [filterTag, setFilterTag] = useState<string>('');
  const filtered = filterTag ? group.resources.filter((r) => r.tags.includes(filterTag)) : group.resources;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" size="small" startIcon={<FolderIcon />} onClick={() => setAddOpen(true)} sx={btnSx}>Add Resource</Button>
        <Box sx={{ flex: 1 }} />
        {allTags.map((t) => (
          <Chip key={t} label={t} size="small" onClick={() => setFilterTag(filterTag === t ? '' : t)} sx={{ cursor: 'pointer', bgcolor: filterTag === t ? '#616161' : '#f5f5f5', color: filterTag === t ? '#fff' : 'text.primary' }} />
        ))}
      </Box>

      {filtered.length === 0 ? (
        <SectionCard><Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No resources yet</Typography></SectionCard>
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((r) => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <SectionCard>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {r.type === 'link' ? <LinkIcon sx={{ fontSize: 18, color: '#757575' }} /> : <FolderIcon sx={{ fontSize: 18, color: '#757575' }} />}
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }} noWrap>{r.title}</Typography>
                  <IconButton size="small" onClick={() => { removeResource(group.id, r.id); toast.success('Removed'); }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
                </Box>
                <Chip label={r.type} size="small" sx={{ height: 18, fontSize: 10, mb: 0.5 }} />
                {r.url && <Typography variant="caption" color="primary" component="a" href={r.url} target="_blank" rel="noopener noreferrer" sx={{ display: 'block', fontSize: 11 }}>{r.url}</Typography>}
                {r.content && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 11 }}>{r.content.substring(0, 80)}...</Typography>}
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  {r.tags.map((t) => <Chip key={t} label={t} size="small" sx={{ height: 16, fontSize: 9 }} />)}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: 10 }}>By {r.uploadedBy} · {new Date(r.createdAt).toLocaleDateString()}</Typography>
              </SectionCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Resource Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Add Resource</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} size="small" fullWidth />
          <FormControl size="small" fullWidth>
            <InputLabel>Type</InputLabel>
            <Select value={type} onChange={(e) => setType(e.target.value as typeof type)} label="Type">
              <MenuItem value="note">Note</MenuItem>
              <MenuItem value="video">Video</MenuItem>
              <MenuItem value="link">Link</MenuItem>
              <MenuItem value="document">Document</MenuItem>
            </Select>
          </FormControl>
          <TextField label="URL" value={url} onChange={(e) => setUrl(e.target.value)} size="small" fullWidth />
          <TextField label="Content/Notes" value={content} onChange={(e) => setContent(e.target.value)} size="small" fullWidth multiline rows={3} />
          <TextField label="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} size="small" fullWidth placeholder="math, calculus, notes" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" sx={btnSx}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// =============================================================
// 13. LEADERBOARD & GAMIFICATION TAB
// =============================================================
function LeaderboardTab({ group }: { group: Group }) {
  const getLeaderboard = useGroupStore((s) => s.getLeaderboard);
  const leaderboard = getLeaderboard(group.id);

  const medalColor = (i: number) => {
    if (i === 0) return '#FFD700';
    if (i === 1) return '#C0C0C0';
    if (i === 2) return '#CD7F32';
    return '#bdbdbd';
  };

  return (
    <Box>
      <SectionCard>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LeaderboardIcon sx={{ fontSize: 22, color: '#757575' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Leaderboard</Typography>
        </Box>

        {leaderboard.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No members to rank yet</Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {leaderboard.map((entry, i) => (
              <ListItem key={entry.memberId} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ width: 32, textAlign: 'center', mr: 1 }}>
                  {i < 3 ? (
                    <EmojiEventsIcon sx={{ fontSize: 22, color: medalColor(i) }} />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{i + 1}</Typography>
                  )}
                </Box>
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: '#9e9e9e' }}>{entry.memberName.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>{entry.memberName} {entry.badges.map((b) => <Chip key={b} label={b} size="small" sx={{ height: 18, fontSize: 9, bgcolor: '#f5f5f5' }} />)}</Box>}
                  secondary={`Quiz: ${entry.quizScore} · Participation: ${entry.participation} · Streak: ${entry.streak}d`}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }} secondaryTypographyProps={{ fontSize: 11 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#616161', minWidth: 50, textAlign: 'right' }}>{entry.totalPoints}</Typography>
              </ListItem>
            ))}
          </List>
        )}
      </SectionCard>
    </Box>
  );
}

// =============================================================
// 14. ANALYTICS TAB
// =============================================================
function AnalyticsTab({ group }: { group: Group }) {
  const getGroupAnalytics = useGroupStore((s) => s.getGroupAnalytics);
  const analytics = getGroupAnalytics(group.id);

  if (!analytics) return <Typography>No data</Typography>;

  const StatCard = ({ label, value, suffix }: { label: string; value: number; suffix?: string }) => (
    <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#616161' }}>{value}{suffix}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={4} md={2}><StatCard label="Members" value={analytics.totalMembers} /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard label="Avg Attendance" value={analytics.avgAttendance} suffix="%" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard label="Avg Quiz Score" value={analytics.avgQuizScore} suffix="%" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard label="Completion Rate" value={analytics.completionRate} suffix="%" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard label="Engagement" value={analytics.engagementScore} suffix="/100" /></Grid>
        <Grid item xs={6} sm={4} md={2}><StatCard label="Discussions" value={group.discussions.length} /></Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Top Performers</Typography>
            {analytics.topPerformers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No data yet</Typography>
            ) : (
              <List dense sx={{ py: 0 }}>
                {analytics.topPerformers.map((p, i) => (
                  <ListItem key={i} sx={{ px: 0 }}>
                    <ListItemAvatar><Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: '#9e9e9e' }}>{i + 1}</Avatar></ListItemAvatar>
                    <ListItemText primary={p.name} secondary={`Score: ${p.score}`} primaryTypographyProps={{ fontSize: 13 }} secondaryTypographyProps={{ fontSize: 11 }} />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Activity Summary</Typography>
            {[
              { label: 'Total Meetings', value: group.meetings.length },
              { label: 'Total Assignments', value: group.assignments.length },
              { label: 'Total Quizzes', value: group.quizzes.length },
              { label: 'Resources Shared', value: group.resources.length },
              { label: 'Content Items', value: group.content.length },
              { label: 'Active Polls', value: group.polls.length },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>{item.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{item.value}</Typography>
              </Box>
            ))}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// =============================================================
// MAIN GROUP DETAIL PAGE
// =============================================================
export default function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));
  const [tab, setTab] = useState(0);

  if (!group) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>Group not found</Typography>
        <Button onClick={() => navigate('/app/groups')} startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none' }}>Back to Groups</Button>
      </Box>
    );
  }

  const unread = group.notifications.filter((n) => !n.read).length;

  const tabs = [
    { label: 'Overview', icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
    { label: 'Members', icon: <GroupIcon sx={{ fontSize: 18 }} /> },
    { label: 'Content', icon: <MenuBookIcon sx={{ fontSize: 18 }} /> },
    { label: 'Meetings', icon: <VideoCallIcon sx={{ fontSize: 18 }} /> },
    { label: 'AI Study', icon: <SmartToyIcon sx={{ fontSize: 18 }} /> },
    { label: 'Discussion', icon: <ChatIcon sx={{ fontSize: 18 }} /> },
    { label: 'Assignments', icon: <AssignmentIcon sx={{ fontSize: 18 }} /> },
    { label: 'Attendance', icon: <HowToRegIcon sx={{ fontSize: 18 }} /> },
    { label: 'Quizzes', icon: <QuizIcon sx={{ fontSize: 18 }} /> },
    { label: 'Calendar', icon: <CalendarMonthIcon sx={{ fontSize: 18 }} /> },
    { label: 'Notifications', icon: <Badge badgeContent={unread} color="error" max={9}><NotificationsIcon sx={{ fontSize: 18 }} /></Badge> },
    { label: 'Resources', icon: <FolderIcon sx={{ fontSize: 18 }} /> },
    { label: 'Leaderboard', icon: <LeaderboardIcon sx={{ fontSize: 18 }} /> },
    { label: 'Analytics', icon: <BarChartIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 3, pt: 2, pb: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <IconButton onClick={() => navigate('/app/groups')} size="small"><ArrowBackIcon /></IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{group.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {group.members.length} members · {group.category} · {group.groupType}
            </Typography>
          </Box>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12, bgcolor: '#9e9e9e' } }}>
            {group.members.slice(0, 5).map((m) => <Avatar key={m.id}>{m.name.charAt(0)}</Avatar>)}
          </AvatarGroup>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': { minHeight: 40, py: 0, textTransform: 'none', fontSize: 12, minWidth: 'auto', px: 1.5 },
            '& .MuiTabs-indicator': { bgcolor: '#616161' },
          }}
        >
          {tabs.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 2 }}>
        <TabPanel value={tab} index={0}><OverviewTab group={group} /></TabPanel>
        <TabPanel value={tab} index={1}><MembersTab group={group} /></TabPanel>
        <TabPanel value={tab} index={2}><ContentTab group={group} /></TabPanel>
        <TabPanel value={tab} index={3}><MeetingsTab group={group} /></TabPanel>
        <TabPanel value={tab} index={4}><AIStudyTab group={group} /></TabPanel>
        <TabPanel value={tab} index={5}><DiscussionsTab group={group} /></TabPanel>
        <TabPanel value={tab} index={6}><AssignmentsTab group={group} /></TabPanel>
        <TabPanel value={tab} index={7}><AttendanceTab group={group} /></TabPanel>
        <TabPanel value={tab} index={8}><QuizPollTab group={group} /></TabPanel>
        <TabPanel value={tab} index={9}><CalendarTab group={group} /></TabPanel>
        <TabPanel value={tab} index={10}><NotificationsTab group={group} /></TabPanel>
        <TabPanel value={tab} index={11}><ResourcesTab group={group} /></TabPanel>
        <TabPanel value={tab} index={12}><LeaderboardTab group={group} /></TabPanel>
        <TabPanel value={tab} index={13}><AnalyticsTab group={group} /></TabPanel>
      </Box>
    </Box>
  );
}

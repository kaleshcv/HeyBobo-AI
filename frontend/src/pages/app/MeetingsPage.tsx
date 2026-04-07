import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Tooltip,
  Avatar,
  AvatarGroup,
  Divider,
  Tab,
  Tabs,
  Paper,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Stack,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { AnimatedPage } from '@/components/animations';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleIcon from '@mui/icons-material/People';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LinkIcon from '@mui/icons-material/Link';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import CancelIcon from '@mui/icons-material/Cancel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMeetingStore, Meeting } from '@/store/meetingStore';
import { useCourseStore } from '@/store/courseStore';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useUIStore } from '@/store/uiStore';
import { t } from '@/lib/translations';

// ============ Create Meeting Dialog ============
function CreateMeetingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const { language } = useUIStore();
  const { user } = useAuth();
  const createMeeting = useMeetingStore((s) => s.createMeeting);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);

  const handleCreate = () => {
    if (!title.trim()) { toast.error(t(language, 'titleRequired')); return; }
    if (!scheduledAt) { toast.error(t(language, 'scheduleDTRequired')); return; }
    const m = createMeeting({
      title: title.trim(),
      description: description.trim(),
      hostEmail: user?.email || '',
      hostName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      scheduledAt: new Date(scheduledAt).toISOString(),
      duration,
    });
    toast.success(`Meeting created! Code: ${m.meetingCode}`);
    setTitle(''); setDescription(''); setScheduledAt(''); setDuration(60);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VideocamIcon color="primary" /> {t(language, 'newMeetingBtn')}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <TextField label={t(language, 'meetingTitleLabel')} value={title} onChange={(e) => setTitle(e.target.value)} fullWidth size="small" />
        <TextField label={t(language, 'descriptionOptionalLabel')} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={2} size="small" />
        <TextField
          label={t(language, 'scheduleDateTimeLabel')}
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <FormControl size="small" fullWidth>
          <InputLabel>{t(language, 'durationLabel')}</InputLabel>
          <Select value={duration} label={t(language, 'durationLabel')} onChange={(e) => setDuration(Number(e.target.value))}>
            <MenuItem value={15}>{t(language, 'dur15minLabel')}</MenuItem>
            <MenuItem value={30}>{t(language, 'dur30minLabel')}</MenuItem>
            <MenuItem value={45}>{t(language, 'dur45minLabel')}</MenuItem>
            <MenuItem value={60}>{t(language, 'dur1hourLabel')}</MenuItem>
            <MenuItem value={90}>{t(language, 'dur1_5hourLabel')}</MenuItem>
            <MenuItem value={120}>{t(language, 'dur2hourLabel')}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t(language, 'cancelBtn')}</Button>
        <Button variant="contained" onClick={handleCreate} sx={{ bgcolor: dk ? '#1A2B3C' : '#616161' }}>{t(language, 'createMeetingBtn')}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ============ Get registered users from localStorage ============
function getRegisteredUsers(): { name: string; email: string }[] {
  try {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return [];
    const u = JSON.parse(raw);
    return [{ name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email, email: u.email }];
  } catch { return []; }
}

// ============ Invite / Share Dialog ============
function InviteDialog({ open, onClose, meeting }: { open: boolean; onClose: () => void; meeting: Meeting | null }) {
  const dk = useTheme().palette.mode === 'dark';
  const { language } = useUIStore();
  const sendInvite = useMeetingStore((s) => s.sendInvite);
  const removeInvite = useMeetingStore((s) => s.removeInvite);
  const groups = useCourseStore((s) => s.groups);
  const { user } = useAuth();
  const [inviteType, setInviteType] = useState<'users' | 'group' | 'email'>('users');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  if (!meeting) return null;

  const registeredUsers = getRegisteredUsers().filter((u) => u.email !== user?.email);
  const alreadyInvitedEmails = meeting.invites.map((i) => i.targetId);

  const toggleUser = (email: string) => {
    setSelectedUsers((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleInviteSelectedUsers = () => {
    if (selectedUsers.length === 0) { toast.error('Select at least one user'); return; }
    let newCount = 0;
    selectedUsers.forEach((email) => {
      if (!meeting.invites.some((i) => i.targetId === email)) {
        const u = registeredUsers.find((r) => r.email === email);
        sendInvite(meeting.id, {
          type: 'individual',
          targetId: email,
          targetName: u?.name || email,
        });
        newCount++;
      }
    });
    if (newCount > 0) toast.success(`Invited ${newCount} user${newCount > 1 ? 's' : ''}`);
    else toast.error('All selected users already invited');
    setSelectedUsers([]);
  };

  const handleSendEmail = () => {
    if (!email.trim()) { toast.error('Email is required'); return; }
    if (meeting.invites.some((i) => i.targetId === email.trim().toLowerCase())) {
      toast.error('Already invited'); return;
    }
    sendInvite(meeting.id, {
      type: 'individual',
      targetId: email.trim().toLowerCase(),
      targetName: name.trim() || email.trim(),
    });
    toast.success(`Invite sent to ${email}`);
    setEmail(''); setName('');
  };

  const handleSendGroup = () => {
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) { toast.error('Select a group'); return; }
    if (meeting.invites.some((i) => i.targetId === group.id)) {
      toast.error('Group already invited'); return;
    }
    sendInvite(meeting.id, {
      type: 'group',
      targetId: group.id,
      targetName: group.name,
    });
    group.members.forEach((member) => {
      if (!meeting.invites.some((i) => i.targetId === member.email)) {
        sendInvite(meeting.id, {
          type: 'individual',
          targetId: member.email,
          targetName: member.name,
        });
      }
    });
    toast.success(`Invited group "${group.name}" (${group.members.length} members)`);
    setSelectedGroupId('');
  };

  const handleCopyLink = () => {
    const text = `Join my meeting "${meeting.title}" on Heybobo!\nMeeting Code: ${meeting.meetingCode}\nScheduled: ${new Date(meeting.scheduledAt).toLocaleString()}\nDuration: ${meeting.duration} min`;
    navigator.clipboard.writeText(text);
    toast.success('Meeting details copied to clipboard!');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon color="primary" /> {t(language, 'shareInviteTitle')}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        {/* Meeting info + copy share */}
        <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2">{meeting.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              Code: <strong>{meeting.meetingCode}</strong> &middot; {new Date(meeting.scheduledAt).toLocaleDateString()} &middot; {meeting.duration} min
            </Typography>
          </Box>
          <Tooltip title="Copy meeting details">
            <IconButton size="small" onClick={handleCopyLink} sx={{ bgcolor: dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5' }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>

        <Tabs value={inviteType} onChange={(_, v) => setInviteType(v)} sx={{ mb: 2, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontSize: 13 } }}>
          <Tab label={t(language, 'usersTabLabel')} value="users" icon={<PeopleIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label={t(language, 'groupsTabLabel')} value="group" icon={<GroupIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          <Tab label={t(language, 'byEmailTabLabel')} value="email" icon={<SendIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>

        {inviteType === 'users' && (
          <Box>
            {registeredUsers.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                No other registered users yet. Invite by email instead.
              </Typography>
            ) : (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  {t(language, 'selectUsersToInvite')} ({registeredUsers.length} registered)
                </Typography>
                <List dense sx={{ maxHeight: 220, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  {registeredUsers.map((u) => {
                    const isInvited = alreadyInvitedEmails.includes(u.email);
                    const isSelected = selectedUsers.includes(u.email);
                    return (
                      <ListItem
                        key={u.email}
                        onClick={() => !isInvited && toggleUser(u.email)}
                        sx={{
                          cursor: isInvited ? 'default' : 'pointer',
                          bgcolor: isSelected ? (dk ? 'rgba(25,118,210,0.15)' : '#e3f2fd') : 'transparent',
                          opacity: isInvited ? 0.5 : 1,
                          '&:hover': { bgcolor: isInvited ? 'transparent' : (dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5') },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: isSelected ? '#1976d2' : (dk ? '#1A2B3C' : '#616161') }}>
                            {u.name[0]?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={u.name}
                          secondary={u.email}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 600 : 400 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        {isInvited ? (
                    <Chip label={t(language, 'invitedLabel')} size="small" color="success" sx={{ height: 22, fontSize: 10 }} />
                        ) : isSelected ? (
                          <Chip label={t(language, 'selectedLabel')} size="small" color="primary" sx={{ height: 22, fontSize: 10 }} />
                        ) : null}
                      </ListItem>
                    );
                  })}
                </List>
                {selectedUsers.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={handleInviteSelectedUsers}
                    startIcon={<SendIcon />}
                    fullWidth
                    sx={{ mt: 1.5, bgcolor: dk ? '#1A2B3C' : '#616161' }}
                  >
                    Invite {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
                  </Button>
                )}
              </>
            )}
          </Box>
        )}

        {inviteType === 'group' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {groups.length === 0 ? (
              <Typography color="text.secondary" variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                No groups yet. Create groups in the Groups page first.
              </Typography>
            ) : (
              <>
                <Typography variant="caption" color="text.secondary">
                  Select a group — all members will be invited
                </Typography>
                <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, maxHeight: 220, overflow: 'auto' }}>
                  {groups.map((g) => {
                    const isInvited = meeting.invites.some((i) => i.targetId === g.id);
                    return (
                      <ListItem
                        key={g.id}
                        onClick={() => { if (!isInvited) { setSelectedGroupId(g.id); } }}
                        sx={{
                          cursor: isInvited ? 'default' : 'pointer',
                          bgcolor: selectedGroupId === g.id ? (dk ? 'rgba(25,118,210,0.15)' : '#e3f2fd') : 'transparent',
                          opacity: isInvited ? 0.5 : 1,
                          '&:hover': { bgcolor: isInvited ? 'transparent' : (dk ? 'rgba(255,255,255,0.05)' : '#f5f5f5') },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: selectedGroupId === g.id ? '#1976d2' : (dk ? '#1A2B3C' : '#616161') }}>
                            <GroupIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={g.name}
                          secondary={`${g.members.length} members`}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: selectedGroupId === g.id ? 600 : 400 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        {isInvited && <Chip label={t(language, 'invitedLabel')} size="small" color="success" sx={{ height: 22, fontSize: 10 }} />}
                      </ListItem>
                    );
                  })}
                </List>
                {selectedGroupId && !meeting.invites.some((i) => i.targetId === selectedGroupId) && (
                  <Button
                    variant="contained"
                    onClick={handleSendGroup}
                    startIcon={<SendIcon />}
                    fullWidth
                    sx={{ bgcolor: dk ? '#1A2B3C' : '#616161' }}
                  >
                    {t(language, 'inviteGroupBtn')}
                  </Button>
                )}
              </>
            )}
          </Box>
        )}

        {inviteType === 'email' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Invite someone by their email address
            </Typography>
            <TextField label="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth />
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} size="small" fullWidth
              onKeyDown={(e) => e.key === 'Enter' && handleSendEmail()} />
            <Button variant="contained" onClick={handleSendEmail} startIcon={<SendIcon />} sx={{ bgcolor: dk ? '#1A2B3C' : '#616161', alignSelf: 'flex-end' }}>
                  {t(language, 'sendInviteBtn')}
            </Button>
          </Box>
        )}

        {/* Already invited list */}
        {meeting.invites.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{t(language, 'invitedLabel')} ({meeting.invites.length})</Typography>
            <List dense sx={{ maxHeight: 180, overflow: 'auto' }}>
              {meeting.invites.map((inv) => (
                <ListItem key={inv.id} sx={{ py: 0.25 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: inv.type === 'group' ? '#1976d2' : (dk ? '#1A2B3C' : '#616161') }}>
                      {inv.type === 'group' ? <GroupIcon sx={{ fontSize: 14 }} /> : inv.targetName[0]?.toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={inv.targetName}
                    secondary={inv.type === 'group' ? 'Group' : inv.targetId}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <ListItemSecondaryAction>
                    <Chip label={inv.accepted ? 'Accepted' : 'Pending'} size="small" color={inv.accepted ? 'success' : 'default'} sx={{ mr: 0.5, height: 20, fontSize: 10 }} />
                    <IconButton size="small" onClick={() => removeInvite(meeting.id, inv.id)}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============ Join by Code Dialog ============
function JoinByCodeDialog({ open, onClose, onJoin }: { open: boolean; onClose: () => void; onJoin: (meeting: Meeting) => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const { language } = useUIStore();
  const joinByCode = useMeetingStore((s) => s.joinByCode);
  const [code, setCode] = useState('');

  const handleJoin = () => {
    const meeting = joinByCode(code.trim());
    if (!meeting) { toast.error('Meeting not found or already ended'); return; }
    toast.success(`Joining "${meeting.title}"`);
    setCode('');
    onJoin(meeting);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyboardIcon color="primary" /> {t(language, 'joinWithCodeTitle')}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the meeting code provided by the host
        </Typography>
        <TextField
          label={t(language, 'meetingCodeLabel')}
          placeholder="abc-def-ghi"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fullWidth
          size="small"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t(language, 'cancelBtn')}</Button>
        <Button variant="contained" onClick={handleJoin} disabled={!code.trim()} sx={{ bgcolor: dk ? '#1A2B3C' : '#616161' }}>{t(language, 'joinWithCodeBtn')}</Button>
      </DialogActions>
    </Dialog>
  );
}

// ============ Live Meeting View ============
function LiveMeetingView({ meeting, onLeave }: { meeting: Meeting; onLeave: () => void }) {
  const { user } = useAuth();
  const {
    sendChat, toggleRecording, toggleScreenSharing,
    endMeeting, leaveMeeting, joinMeeting,
  } = useMeetingStore();
  const currentMeeting = useMeetingStore((s) => s.meetings.find((m) => m.id === meeting.id))!;

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatText, setChatText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isHost = user?.email === currentMeeting.hostEmail;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartRef = useRef<number>(0);

  // Initialize camera/mic on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error('Camera/microphone access denied');
        setCamOn(false);
        setMicOn(false);
      });
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (user) {
      joinMeeting(meeting.id, { name: `${user.firstName} ${user.lastName}`, email: user.email });
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMeeting.chat.length]);

  const handleSendChat = () => {
    if (!chatText.trim() || !user) return;
    sendChat(meeting.id, {
      senderName: `${user.firstName} ${user.lastName}`,
      senderEmail: user.email,
      text: chatText.trim(),
    });
    setChatText('');
  };

  const handleEndMeeting = () => {
    endMeeting(meeting.id);
    toast.success('Meeting ended');
    onLeave();
  };

  const handleLeaveMeeting = () => {
    if (user) leaveMeeting(meeting.id, user.email);
    toast('You left the meeting');
    onLeave();
  };

  const handleToggleCam = () => {
    const enabled = !camOn;
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = enabled; });
    setCamOn(enabled);
  };

  const handleToggleMic = () => {
    const enabled = !micOn;
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = enabled; });
    setMicOn(enabled);
  };

  const handleToggleScreenShare = async () => {
    if (currentMeeting.screenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      toggleScreenSharing(meeting.id);
      toast('Screen sharing stopped');
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = stream;
        toggleScreenSharing(meeting.id);
        toast.success('Screen sharing started');
        stream.getVideoTracks()[0]?.addEventListener('ended', () => {
          screenStreamRef.current = null;
          if (useMeetingStore.getState().meetings.find((m) => m.id === meeting.id)?.screenSharing) {
            toggleScreenSharing(meeting.id);
          }
        });
      } catch {
        // user cancelled picker or denied
      }
    }
  };

  const handleToggleRecording = () => {
    if (currentMeeting.recording) {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
      toggleRecording(meeting.id);
    } else {
      const stream = screenStreamRef.current || localStreamRef.current;
      if (!stream) { toast.error('No media stream available to record'); return; }
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';
      try {
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recordingChunksRef.current = [];
        recordingStartRef.current = Date.now();
        const capturedTitle = currentMeeting.title;
        const capturedMeetingId = meeting.id;
        recorder.ondataavailable = (e) => { if (e.data.size > 0) recordingChunksRef.current.push(e.data); };
        recorder.onstop = () => {
          const blob = new Blob(recordingChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${capturedTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          const durationSec = Math.round((Date.now() - recordingStartRef.current) / 1000);
          useMeetingStore.getState().saveRecording({
            meetingId: capturedMeetingId,
            meetingTitle: capturedTitle,
            recordedAt: new Date(recordingStartRef.current).toISOString(),
            duration: durationSec,
            sizeBytes: blob.size,
          });
          toast.success(`Recording downloaded (${durationSec}s)`);
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        toggleRecording(meeting.id);
      } catch {
        toast.error('Recording not supported in this browser');
      }
    }
  };

  const activeParticipants = currentMeeting.participants.filter((p) => !p.leftAt);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#1a1a2e' }}>
      {/* Top bar */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#16213e' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>{currentMeeting.title}</Typography>
          {currentMeeting.recording && (
            <Chip icon={<FiberManualRecordIcon sx={{ fontSize: 12 }} />} label="REC" size="small" color="error" sx={{ height: 22 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip label={currentMeeting.meetingCode} size="small" sx={{ color: '#ccc', bgcolor: '#0f3460' }}
            onDelete={() => { navigator.clipboard.writeText(currentMeeting.meetingCode); toast.success('Code copied'); }}
            deleteIcon={<ContentCopyIcon sx={{ fontSize: 14, color: '#ccc !important' }} />}
          />
          <Chip label={`${activeParticipants.length} in call`} size="small" sx={{ color: '#ccc', bgcolor: '#0f3460' }} icon={<PeopleIcon sx={{ fontSize: 14, color: '#ccc !important' }} />} />
        </Box>
      </Box>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Video grid area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Grid container spacing={1.5} sx={{ maxWidth: 900, justifyContent: 'center' }}>
            {activeParticipants.length === 0 ? (
              <Grid item xs={12} sx={{ textAlign: 'center' }}>
                <Typography color="#888">Waiting for participants...</Typography>
              </Grid>
            ) : (
              activeParticipants.map((p) => (
                <Grid item xs={12} sm={activeParticipants.length === 1 ? 8 : 6} md={activeParticipants.length <= 2 ? 6 : 4} key={p.email}>
                  <Box sx={{
                    bgcolor: '#0f3460', borderRadius: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', aspectRatio: '16/9', position: 'relative',
                  }}>
                    {p.email === user?.email && camOn ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <>
                        <Avatar sx={{ width: 64, height: 64, fontSize: 24, bgcolor: '#e94560', mb: 1 }}>
                          {p.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Avatar>
                        <Typography variant="body2" sx={{ color: '#fff' }}>{p.name}</Typography>
                      </>
                    )}
                    {p.email === currentMeeting.hostEmail && (
                      <Chip label="Host" size="small" sx={{ position: 'absolute', top: 8, left: 8, height: 20, fontSize: 10, bgcolor: '#e94560', color: '#fff' }} />
                    )}
                  </Box>
                </Grid>
              ))
            )}
          </Grid>

          {currentMeeting.screenSharing && (
            <Chip label="Screen is being shared" icon={<ScreenShareIcon />} sx={{ mt: 2, bgcolor: '#0f3460', color: '#ccc' }} />
          )}
        </Box>

        {/* Side panels */}
        {(showChat || showParticipants) && (
          <Box sx={{ width: 300, bgcolor: '#16213e', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #0f3460' }}>
            {showParticipants && (
              <Box sx={{ p: 2, flex: showChat ? '0 0 auto' : 1, maxHeight: showChat ? 200 : '100%', overflow: 'auto' }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 1 }}>Participants ({activeParticipants.length})</Typography>
                <List dense>
                  {activeParticipants.map((p) => (
                    <ListItem key={p.email} sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: '#e94560' }}>
                          {p.name[0]?.toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ color: '#fff' }}>{p.name}</Typography>}
                        secondary={p.email === currentMeeting.hostEmail ? <Chip label="Host" size="small" sx={{ height: 16, fontSize: 9, bgcolor: '#e94560', color: '#fff' }} /> : null}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            {showChat && showParticipants && <Divider sx={{ borderColor: '#0f3460' }} />}
            {showChat && (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', p: 1.5, pb: 0.5 }}>Chat</Typography>
                <Box sx={{ flex: 1, overflow: 'auto', px: 1.5 }}>
                  {currentMeeting.chat.map((msg) => (
                    <Box key={msg.id} sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#e94560', fontWeight: 600 }}>{msg.senderName}</Typography>
                      <Typography variant="body2" sx={{ color: '#ddd' }}>{msg.text}</Typography>
                    </Box>
                  ))}
                  <div ref={chatEndRef} />
                </Box>
                <Box sx={{ p: 1.5, pt: 0.5 }}>
                  <TextField
                    size="small"
                    placeholder="Type a message..."
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: '#0f3460', '& fieldset': { borderColor: '#0f3460' } },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleSendChat} sx={{ color: '#e94560' }}>
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Bottom controls */}
      <Box sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: '#16213e' }}>
        <Tooltip title={micOn ? 'Mute' : 'Unmute'}>
          <IconButton onClick={handleToggleMic} sx={{ bgcolor: micOn ? '#0f3460' : '#e94560', color: '#fff', '&:hover': { bgcolor: micOn ? '#1a4a8a' : '#c7384f' } }}>
            {micOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={camOn ? 'Turn off camera' : 'Turn on camera'}>
          <IconButton onClick={handleToggleCam} sx={{ bgcolor: camOn ? '#0f3460' : '#e94560', color: '#fff', '&:hover': { bgcolor: camOn ? '#1a4a8a' : '#c7384f' } }}>
            {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={currentMeeting.screenSharing ? 'Stop sharing' : 'Share screen'}>
          <IconButton onClick={handleToggleScreenShare} sx={{ bgcolor: currentMeeting.screenSharing ? '#4caf50' : '#0f3460', color: '#fff', '&:hover': { bgcolor: currentMeeting.screenSharing ? '#388e3c' : '#1a4a8a' } }}>
            {currentMeeting.screenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        </Tooltip>
        {isHost && (
          <Tooltip title={currentMeeting.recording ? 'Stop recording' : 'Start recording'}>
            <IconButton onClick={handleToggleRecording} sx={{ bgcolor: currentMeeting.recording ? '#f44336' : '#0f3460', color: '#fff', '&:hover': { bgcolor: currentMeeting.recording ? '#d32f2f' : '#1a4a8a' } }}>
              {currentMeeting.recording ? <StopIcon /> : <FiberManualRecordIcon />}
            </IconButton>
          </Tooltip>
        )}
        <Divider orientation="vertical" flexItem sx={{ borderColor: '#0f3460', mx: 1 }} />
        <Tooltip title="Chat">
          <IconButton onClick={() => setShowChat(!showChat)} sx={{ bgcolor: showChat ? '#4caf50' : '#0f3460', color: '#fff', '&:hover': { bgcolor: showChat ? '#388e3c' : '#1a4a8a' } }}>
            <Badge badgeContent={currentMeeting.chat.length} color="error" max={99}>
              <ChatIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Participants">
          <IconButton onClick={() => setShowParticipants(!showParticipants)} sx={{ bgcolor: showParticipants ? '#4caf50' : '#0f3460', color: '#fff', '&:hover': { bgcolor: showParticipants ? '#388e3c' : '#1a4a8a' } }}>
            <Badge badgeContent={activeParticipants.length} color="primary">
              <PeopleIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ borderColor: '#0f3460', mx: 1 }} />
        <Tooltip title={isHost ? 'End meeting for all' : 'Leave meeting'}>
          <IconButton onClick={isHost ? handleEndMeeting : handleLeaveMeeting} sx={{ bgcolor: '#e94560', color: '#fff', '&:hover': { bgcolor: '#c7384f' }, px: 2, borderRadius: 2 }}>
            <CallEndIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

// ============ Meeting Card ============
function MeetingCard({ meeting, onInvite, onJoin }: { meeting: Meeting; onInvite: (m: Meeting) => void; onJoin: (m: Meeting) => void }) {
  const dk = useTheme().palette.mode === 'dark';
  const { user } = useAuth();
  const { deleteMeeting, cancelMeeting, startMeeting } = useMeetingStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isHost = user?.email === meeting.hostEmail;

  const statusColor: Record<string, string> = {
    scheduled: '#1976d2',
    live: '#4caf50',
    ended: '#9e9e9e',
    cancelled: '#f44336',
  };

  const handleStart = () => {
    startMeeting(meeting.id);
    onJoin(meeting);
  };

  const scheduledDate = new Date(meeting.scheduledAt);

  return (
    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'relative', '&:hover': { boxShadow: 2 } }} elevation={0}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>{meeting.title}</Typography>
            {meeting.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{meeting.description}</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip
              label={meeting.status.toUpperCase()}
              size="small"
              sx={{ bgcolor: statusColor[meeting.status], color: '#fff', fontWeight: 600, height: 22, fontSize: 10 }}
            />
            {isHost && meeting.status !== 'ended' && meeting.status !== 'cancelled' && (
              <>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVertIcon fontSize="small" /></IconButton>
                <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={() => { cancelMeeting(meeting.id); setAnchorEl(null); toast.success('Meeting cancelled'); }}>
                    <CancelIcon fontSize="small" sx={{ mr: 1 }} /> Cancel Meeting
                  </MenuItem>
                  <MenuItem onClick={() => { deleteMeeting(meeting.id); setAnchorEl(null); toast.success('Meeting deleted'); }} sx={{ color: '#f44336' }}>
                    <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Meeting
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
          <Chip icon={<ScheduleIcon />} label={scheduledDate.toLocaleString()} size="small" variant="outlined" />
          <Chip label={`${meeting.duration} min`} size="small" variant="outlined" />
          <Chip icon={<PeopleIcon />} label={`${meeting.invites.length} invited`} size="small" variant="outlined" />
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Code:</Typography>
          <Chip
            label={meeting.meetingCode}
            size="small"
            sx={{ fontFamily: 'monospace', fontWeight: 600 }}
            onDelete={() => { navigator.clipboard.writeText(meeting.meetingCode); toast.success('Code copied'); }}
            deleteIcon={<ContentCopyIcon sx={{ fontSize: 14 }} />}
          />
        </Box>

        {meeting.invites.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <AvatarGroup max={5} sx={{ justifyContent: 'flex-end', '& .MuiAvatar-root': { width: 26, height: 26, fontSize: 11 } }}>
              {meeting.invites.filter((i) => i.type === 'individual').map((inv) => (
                <Tooltip key={inv.id} title={inv.targetName}>
                  <Avatar sx={{ bgcolor: dk ? '#1A2B3C' : '#616161' }}>{inv.targetName[0]?.toUpperCase()}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>
        )}

        <Divider sx={{ mb: 1.5 }} />

        <Stack direction="row" spacing={1}>
          {meeting.status === 'scheduled' && isHost && (
            <Button size="small" variant="contained" startIcon={<PlayArrowIcon />} onClick={handleStart} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}>
              Start Now
            </Button>
          )}
          {meeting.status === 'live' && (
            <Button size="small" variant="contained" startIcon={<VideocamIcon />} onClick={() => onJoin(meeting)} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}>
              Join Meeting
            </Button>
          )}
          {(meeting.status === 'scheduled' || meeting.status === 'live') && isHost && (
            <Button size="small" variant="outlined" startIcon={<PersonAddIcon />} onClick={() => onInvite(meeting)}>
              Invite
            </Button>
          )}
          {meeting.status !== 'cancelled' && (
            <Button size="small" variant="outlined" startIcon={<PeopleIcon />} onClick={() => onInvite(meeting)}>
              Share
            </Button>
          )}
          <Button size="small" variant="outlined" startIcon={<LinkIcon />}
            onClick={() => { navigator.clipboard.writeText(meeting.meetingCode); toast.success('Meeting code copied'); }}>
            Copy Code
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============ Main MeetingsPage ============
export default function MeetingsPage() {
  const dk = useTheme().palette.mode === 'dark';
  const { language } = useUIStore();
  const { user } = useAuth();
  const meetings = useMeetingStore((s) => s.meetings);
  const { startMeeting, setActiveMeeting, joinMeeting } = useMeetingStore();
  const recordings = useMeetingStore((s) => s.recordings);
  const deleteRecording = useMeetingStore((s) => s.deleteRecording);

  const [createOpen, setCreateOpen] = useState(false);
  const [joinCodeOpen, setJoinCodeOpen] = useState(false);
  const [inviteMeeting, setInviteMeeting] = useState<Meeting | null>(null);
  const [liveMeeting, setLiveMeeting] = useState<Meeting | null>(null);
  const [tab, setTab] = useState(0);

  const myMeetings = meetings.filter((m) => m.hostEmail === user?.email);
  const invitedMeetings = meetings.filter((m) => m.hostEmail !== user?.email && m.invites.some((i) => i.targetId === user?.email));

  const tabMeetings = [
    myMeetings.filter((m) => m.status === 'scheduled' || m.status === 'live'),
    [...myMeetings, ...invitedMeetings].filter((m) => m.status === 'live'),
    myMeetings.filter((m) => m.status === 'ended' || m.status === 'cancelled'),
    invitedMeetings,
  ];

  const handleJoinLive = (meeting: Meeting) => {
    if (meeting.status === 'scheduled') {
      startMeeting(meeting.id);
    }
    if (user) {
      joinMeeting(meeting.id, { name: `${user.firstName} ${user.lastName}`, email: user.email });
    }
    setActiveMeeting(meeting.id);
    setLiveMeeting(meeting);
  };

  // Full-screen meeting view
  if (liveMeeting) {
    return (
      <Box sx={{ height: '100%', minHeight: 'calc(100vh - 64px)' }}>
        <LiveMeetingView meeting={liveMeeting} onLeave={() => setLiveMeeting(null)} />
      </Box>
    );
  }

  return (
    <AnimatedPage>
      <Box sx={{ px: { xs: 2.5, md: 4, lg: 5 }, py: 3 }}>
        {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#ec489920', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <VideocamIcon sx={{ fontSize: 22, color: '#ec4899' }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>{t(language, 'meetingsTitleLabel')}</Typography>
            <Typography variant="body2" color="text.secondary">{t(language, 'meetingSubtitle')}</Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<KeyboardIcon />} onClick={() => setJoinCodeOpen(true)}>
            {t(language, 'joinWithCodeBtn')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ bgcolor: dk ? '#1A2B3C' : '#616161' }}>
            {t(language, 'newMeetingBtn')}
          </Button>
        </Stack>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {[
          { label: t(language, 'scheduledLabel'), count: myMeetings.filter((m) => m.status === 'scheduled').length, color: '#1976d2' },
          { label: t(language, 'liveNowLabel'), count: meetings.filter((m) => m.status === 'live').length, color: '#4caf50' },
          { label: t(language, 'completedLabel'), count: myMeetings.filter((m) => m.status === 'ended').length, color: '#9e9e9e' },
          { label: t(language, 'invitationsLabel'), count: invitedMeetings.length, color: '#ff9800' },
        ].map((stat) => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Paper sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, borderTop: `3px solid ${stat.color}` }} elevation={0} variant="outlined">
              <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>{stat.count}</Typography>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
        <Tab label={`${t(language, 'upcomingLabel')} (${tabMeetings[0].length})`} />
        <Tab label={<Badge badgeContent={tabMeetings[1].length} color="success" sx={{ '& .MuiBadge-badge': { right: -8 } }}>{t(language, 'liveLabel')}</Badge>} />
        <Tab label={`${t(language, 'pastLabel')} (${tabMeetings[2].length})`} />
        <Tab label={`${t(language, 'invitedLabel')} (${tabMeetings[3].length})`} />
        <Tab label={`${t(language, 'recordingsLabel')} (${recordings.length})`} icon={<FiberManualRecordIcon sx={{ fontSize: 14, color: '#f44336' }} />} iconPosition="start" />
      </Tabs>

      {/* Meeting list */}
      {tab === 4 ? (
        recordings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} elevation={0} variant="outlined">
            <FiberManualRecordIcon sx={{ fontSize: 48, color: dk ? 'rgba(255,255,255,0.15)' : '#bdbdbd', mb: 1 }} />
            <Typography color="text.secondary">No recordings yet. Start recording in a live meeting.</Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Recordings are automatically downloaded as .webm files when you stop recording.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={1.5}>
            {recordings.map((rec) => (
              <Grid item xs={12} md={6} key={rec.id}>
                <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                        <FiberManualRecordIcon sx={{ fontSize: 14, color: '#f44336' }} />
                        <Typography variant="subtitle2" fontWeight={600}>{rec.meetingTitle}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                        <Chip label={new Date(rec.recordedAt).toLocaleString()} size="small" variant="outlined" icon={<ScheduleIcon />} />
                        <Chip label={`${rec.duration}s`} size="small" variant="outlined" />
                        <Chip label={`${(rec.sizeBytes / 1024 / 1024).toFixed(1)} MB`} size="small" variant="outlined" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                        File auto-downloaded when recording stopped.
                      </Typography>
                    </Box>
                    <Tooltip title="Remove from list">
                      <IconButton size="small" onClick={() => deleteRecording(rec.id)} sx={{ color: '#f44336' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )
      ) : tabMeetings[tab].length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} elevation={0} variant="outlined">
          <VideocamIcon sx={{ fontSize: 48, color: dk ? 'rgba(255,255,255,0.15)' : '#bdbdbd', mb: 1 }} />
          <Typography color="text.secondary">
            {tab === 0 && t(language, 'noUpcomingMeetings')}
            {tab === 1 && t(language, 'noLiveMeetings')}
            {tab === 2 && t(language, 'noPastMeetings')}
            {tab === 3 && t(language, 'noInvitedMeetings')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {tabMeetings[tab].map((meeting, i) => (
            <Grid item xs={12} md={6} key={meeting.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
              >
                <MeetingCard meeting={meeting} onInvite={setInviteMeeting} onJoin={handleJoinLive} />
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <CreateMeetingDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <InviteDialog open={!!inviteMeeting} onClose={() => setInviteMeeting(null)} meeting={inviteMeeting} />
      <JoinByCodeDialog open={joinCodeOpen} onClose={() => setJoinCodeOpen(false)} onJoin={handleJoinLive} />
      </Box>
    </AnimatedPage>
  );
}

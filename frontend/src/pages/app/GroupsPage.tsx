import { useState } from 'react';
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
  Tooltip,
  Avatar,
  AvatarGroup,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useCourseStore, StudentGroup } from '@/store/courseStore';
import toast from 'react-hot-toast';

// --- Create Group Dialog ---
function CreateGroupDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addGroup = useCourseStore((s) => s.addGroup);
  const courses = useCourseStore((s) => s.courses);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }
    addGroup({
      name: name.trim(),
      description: description.trim(),
      courseIds: selectedCourseIds,
      members: [],
    });
    toast.success('Group created!');
    setName('');
    setDescription('');
    setSelectedCourseIds([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Create New Group</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField
          label="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          size="small"
          required
          placeholder="e.g. Batch 2026 - Web Dev"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          size="small"
          multiline
          rows={2}
          placeholder="Short description of this group"
        />

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
          Assign Courses (optional)
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1 }}>
          {courses.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              No courses available. Create courses first.
            </Typography>
          ) : (
            courses.map((course) => (
              <FormControlLabel
                key={course.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedCourseIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: 13 }}>
                    {course.title}
                  </Typography>
                }
                sx={{ display: 'flex', mx: 0, my: 0 }}
              />
            ))
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{ textTransform: 'none', bgcolor: '#616161', '&:hover': { bgcolor: '#424242' } }}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Add Member Dialog ---
function AddMemberDialog({
  open,
  onClose,
  groupId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
}) {
  const addMemberToGroup = useCourseStore((s) => s.addMemberToGroup);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const handleAdd = () => {
    if (!memberName.trim() || !memberEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }
    addMemberToGroup(groupId, { name: memberName.trim(), email: memberEmail.trim() });
    toast.success('Member added!');
    setMemberName('');
    setMemberEmail('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>Add Member</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField
          label="Name"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          fullWidth
          size="small"
          placeholder="Student name"
        />
        <TextField
          label="Email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
          fullWidth
          size="small"
          type="email"
          placeholder="student@example.com"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          sx={{ textTransform: 'none', bgcolor: '#616161', '&:hover': { bgcolor: '#424242' } }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Assign Courses Dialog ---
function AssignCoursesDialog({
  open,
  onClose,
  group,
}: {
  open: boolean;
  onClose: () => void;
  group: StudentGroup;
}) {
  const courses = useCourseStore((s) => s.courses);
  const assignCoursesToGroup = useCourseStore((s) => s.assignCoursesToGroup);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const unassigned = courses.filter((c) => !group.courseIds.includes(c.id));

  const toggleCourse = (courseId: string) => {
    setSelectedIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleAssign = () => {
    if (selectedIds.length === 0) {
      toast.error('Select at least one course');
      return;
    }
    assignCoursesToGroup(group.id, selectedIds);
    toast.success(`${selectedIds.length} course${selectedIds.length > 1 ? 's' : ''} assigned!`);
    setSelectedIds([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 600, fontSize: 16 }}>
        Assign Courses to {group.name}
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        {unassigned.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            All available courses are already assigned to this group.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {unassigned.map((course) => (
              <FormControlLabel
                key={course.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedIds.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.instructor} · {course.videos.length} videos · {course.level}
                    </Typography>
                  </Box>
                }
                sx={{ display: 'flex', mx: 0, my: 0.5, alignItems: 'flex-start' }}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={selectedIds.length === 0}
          sx={{
            textTransform: 'none',
            bgcolor: '#616161',
            '&:hover': { bgcolor: '#424242' },
            '&.Mui-disabled': { bgcolor: '#e0e0e0' },
          }}
        >
          Assign ({selectedIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Group Detail Panel ---
function GroupDetail({
  group,
  onClose,
}: {
  group: StudentGroup;
  onClose: () => void;
}) {
  const courses = useCourseStore((s) => s.courses);
  const removeCourseFromGroup = useCourseStore((s) => s.removeCourseFromGroup);
  const removeMemberFromGroup = useCourseStore((s) => s.removeMemberFromGroup);
  const deleteGroup = useCourseStore((s) => s.deleteGroup);

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  const assignedCourses = courses.filter((c) => group.courseIds.includes(c.id));

  const handleDeleteGroup = () => {
    deleteGroup(group.id);
    toast.success('Group deleted');
    onClose();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          {group.name}
        </Typography>
        <Tooltip title="Delete group">
          <IconButton size="small" onClick={handleDeleteGroup} sx={{ color: 'text.secondary' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {group.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {group.description}
        </Typography>
      )}

      {/* Assigned Courses */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <MenuBookIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
            Courses ({assignedCourses.length})
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAssignOpen(true)}
            sx={{ textTransform: 'none', fontSize: 12, color: 'text.secondary' }}
          >
            Assign
          </Button>
        </Box>
        {assignedCourses.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5 }}>
            No courses assigned yet
          </Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {assignedCourses.map((course) => (
              <ListItem key={course.id} sx={{ pl: 3.5, pr: 1 }}>
                <ListItemText
                  primary={course.title}
                  secondary={`${course.instructor} · ${course.videos.length} videos`}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Remove from group">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => {
                        removeCourseFromGroup(group.id, course.id);
                        toast.success('Course removed');
                      }}
                    >
                      <RemoveCircleOutlineIcon sx={{ fontSize: 16, color: '#bdbdbd' }} />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Members */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <GroupIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
            Members ({group.members.length})
          </Typography>
          <Button
            size="small"
            startIcon={<PersonAddIcon />}
            onClick={() => setAddMemberOpen(true)}
            sx={{ textTransform: 'none', fontSize: 12, color: 'text.secondary' }}
          >
            Add
          </Button>
        </Box>
        {group.members.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ pl: 3.5 }}>
            No members yet
          </Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {group.members.map((member) => (
              <ListItem key={member.email} sx={{ pl: 3.5, pr: 1 }}>
                <Avatar
                  sx={{ width: 24, height: 24, fontSize: 11, bgcolor: '#9e9e9e', mr: 1.5 }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={member.name}
                  secondary={member.email}
                  primaryTypographyProps={{ fontSize: 13 }}
                  secondaryTypographyProps={{ fontSize: 11 }}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Remove member">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => {
                        removeMemberFromGroup(group.id, member.email);
                        toast.success('Member removed');
                      }}
                    >
                      <RemoveCircleOutlineIcon sx={{ fontSize: 16, color: '#bdbdbd' }} />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <AddMemberDialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} groupId={group.id} />
      <AssignCoursesDialog open={assignOpen} onClose={() => setAssignOpen(false)} group={group} />
    </Box>
  );
}

// --- Main Groups Page ---
export default function GroupsPage() {
  const groups = useCourseStore((s) => s.groups);
  const courses = useCourseStore((s) => s.courses);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <Box sx={{ flex: 1, display: 'flex', px: 3, py: 3, overflow: 'auto', gap: 3 }}>
      {/* Left: Groups List */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Community Groups
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {groups.length} group{groups.length !== 1 ? 's' : ''} · Organize students and assign courses
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              textTransform: 'none',
              bgcolor: '#616161',
              '&:hover': { bgcolor: '#424242' },
              borderRadius: 2,
            }}
          >
            New Group
          </Button>
        </Box>

        {/* Group cards */}
        {groups.length > 0 ? (
          <Grid container spacing={2}>
            {groups.map((group) => {
              const assignedCourses = courses.filter((c) => group.courseIds.includes(c.id));
              return (
                <Grid item xs={12} sm={6} md={4} key={group.id}>
                  <Card
                    onClick={() => setSelectedGroupId(group.id)}
                    sx={{
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selectedGroupId === group.id ? '#9e9e9e' : 'divider',
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#bdbdbd',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GroupIcon sx={{ fontSize: 20, color: '#757575' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }} noWrap>
                          {group.name}
                        </Typography>
                      </Box>
                      {group.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 1.5,
                            lineHeight: 1.4,
                          }}
                        >
                          {group.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          icon={<MenuBookIcon sx={{ fontSize: '14px !important' }} />}
                          label={`${assignedCourses.length} course${assignedCourses.length !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ height: 22, fontSize: 11, bgcolor: '#f5f5f5' }}
                        />
                        <Chip
                          icon={<GroupIcon sx={{ fontSize: '14px !important' }} />}
                          label={`${group.members.length} member${group.members.length !== 1 ? 's' : ''}`}
                          size="small"
                          sx={{ height: 22, fontSize: 11, bgcolor: '#f5f5f5' }}
                        />
                      </Box>

                      {group.members.length > 0 && (
                        <AvatarGroup
                          max={5}
                          sx={{
                            justifyContent: 'flex-start',
                            '& .MuiAvatar-root': {
                              width: 24,
                              height: 24,
                              fontSize: 11,
                              bgcolor: '#bdbdbd',
                            },
                          }}
                        >
                          {group.members.map((m) => (
                            <Avatar key={m.email}>
                              {m.name.charAt(0).toUpperCase()}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
            }}
          >
            <GroupIcon sx={{ fontSize: 48, color: '#bdbdbd', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No groups yet
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ textTransform: 'none', borderColor: '#e0e0e0', color: 'text.secondary' }}
            >
              Create your first group
            </Button>
          </Box>
        )}
      </Box>

      {/* Right: Group Detail Panel */}
      {selectedGroup && (
        <Box
          sx={{
            width: 360,
            flexShrink: 0,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 2.5,
            bgcolor: 'background.paper',
            alignSelf: 'flex-start',
            position: 'sticky',
            top: 24,
          }}
        >
          <GroupDetail group={selectedGroup} onClose={() => setSelectedGroupId(null)} />
        </Box>
      )}

      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}

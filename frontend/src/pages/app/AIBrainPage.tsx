import { Box, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';

export default function AIBrainPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: 2,
        opacity: 0.5,
      }}
    >
      <PsychologyIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
      <Typography variant="h4" color="text.secondary" fontWeight={600}>
        AI Brain
      </Typography>
      <Typography variant="body1" color="text.disabled">
        Your intelligent dashboard — coming soon
      </Typography>
    </Box>
  );
}

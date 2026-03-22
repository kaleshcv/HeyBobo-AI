import { Box, Typography } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';

export default function DietaryGoalsPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'text.secondary',
        gap: 2,
      }}
    >
      <FlagIcon sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Dietary Goals
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Dashboard coming soon
      </Typography>
    </Box>
  );
}

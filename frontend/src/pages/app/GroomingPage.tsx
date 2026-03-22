import { Box, Typography } from '@mui/material';
import SpaIcon from '@mui/icons-material/Spa';

export default function GroomingPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <SpaIcon sx={{ fontSize: 28, color: '#9c27b0' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Grooming & Lifestyle
        </Typography>
      </Box>
    </Box>
  );
}

import { Box, Typography } from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function DietaryProfilePage() {
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
      <MenuBookIcon sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Dietary Profile
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Set up your dietary preferences, goals, and restrictions.
      </Typography>
    </Box>
  );
}

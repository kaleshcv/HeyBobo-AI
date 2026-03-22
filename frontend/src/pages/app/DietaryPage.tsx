import { Box, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function DietaryPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <RestaurantIcon sx={{ fontSize: 28, color: '#4caf50' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Dietary Dashboard
        </Typography>
      </Box>
    </Box>
  );
}

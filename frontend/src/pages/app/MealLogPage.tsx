import { Box, Typography } from '@mui/material';
import SetMealIcon from '@mui/icons-material/SetMeal';

export default function MealLogPage() {
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
      <SetMealIcon sx={{ fontSize: 64, color: '#f59e0b', opacity: 0.4 }} />
      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Meal Log
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Log and track your daily meals and nutrition intake.
      </Typography>
    </Box>
  );
}

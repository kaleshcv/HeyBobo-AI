import { Box, Typography } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useUIStore } from '@/store/uiStore';
import { t } from '@/lib/translations';

export default function DietaryPage() {
  const { language } = useUIStore();
  return (
    <Box sx={{ px: { xs: 2.5, md: 4, lg: 5 }, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <RestaurantIcon sx={{ fontSize: 22, color: '#f59e0b' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t(language, 'dietaryDashboardTitle')}
        </Typography>
      </Box>
    </Box>
  );
}

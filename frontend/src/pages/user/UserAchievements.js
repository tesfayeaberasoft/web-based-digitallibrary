import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const UserAchievements = () => {
  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700}>Achievements</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          View your earned achievements and badges
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default UserAchievements;
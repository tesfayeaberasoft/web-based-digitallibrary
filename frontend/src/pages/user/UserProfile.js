import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const UserProfile = () => {
  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700}>My Profile</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Manage your account information
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default UserProfile;
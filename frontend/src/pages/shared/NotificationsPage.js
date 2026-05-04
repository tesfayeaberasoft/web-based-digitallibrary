import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const NotificationsPage = () => {
  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700}>Notifications</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          You have 3 unread notifications
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default NotificationsPage;
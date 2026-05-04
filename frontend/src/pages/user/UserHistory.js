import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const UserHistory = () => {
  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700}>Reading History</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          View your reading history and completed books
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default UserHistory;
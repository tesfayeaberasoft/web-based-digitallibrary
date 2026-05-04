import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const UserBooks = () => {
  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700}>My Books</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          View your borrowed and reserved books
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default UserBooks;
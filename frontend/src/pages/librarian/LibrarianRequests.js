import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LibrarianRequests = () => {
  return (
    <DashboardLayout title="Librarian Panel">
      <Box>
        <Typography variant="h4" fontWeight={700}>Book Requests</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Manage pending book requests and reservations
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianRequests;
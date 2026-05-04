import React from 'react';
import { Box, Typography } from '@mui/material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LibrarianInventory = () => {
  return (
    <DashboardLayout title="Librarian Panel">
      <Box>
        <Typography variant="h4" fontWeight={700}>Book Inventory</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Manage book inventory and stock levels
        </Typography>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianInventory;
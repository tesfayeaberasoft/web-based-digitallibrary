import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import Navbar from '../../components/layout/Navbar';

const BrowseBooks = () => {
  return (
    <Box>
      <Navbar title="Digital Library" showUserMenu={false} />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700}>Browse Our Collection</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Discover your next favorite book from our extensive library
        </Typography>
      </Container>
    </Box>
  );
};

export default BrowseBooks;
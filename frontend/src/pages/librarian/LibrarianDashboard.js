import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, Button } from '@mui/material';
import { CheckCircle, Inventory2, People } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LibrarianDashboard = () => {
  return (
    <DashboardLayout title="Librarian Panel">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Librarian Overview
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: 200 }}>
              <CardContent>
                <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mb: 2 }}>
                  <CheckCircle />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>856</Typography>
                <Typography>Issued Books</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: 200 }}>
              <CardContent>
                <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mb: 2 }}>
                  <Inventory2 />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>10,234</Typography>
                <Typography>Total Books</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: 200 }}>
              <CardContent>
                <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mb: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h4" fontWeight={700}>5,234</Typography>
                <Typography>Active Members</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" size="large" sx={{ py: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Box>
                <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Issue Book</Typography>
                <Typography variant="caption">Quick book checkout</Typography>
              </Box>
            </Button>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" size="large" sx={{ py: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Box>
                <Inventory2 sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Return Book</Typography>
                <Typography variant="caption">Process return</Typography>
              </Box>
            </Button>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Button fullWidth variant="contained" size="large" sx={{ py: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Box>
                <People sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6">Add Member</Typography>
                <Typography variant="caption">Register new user</Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
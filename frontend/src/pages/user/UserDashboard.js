import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { MenuBook, TrendingUp, AccessTime, EmojiEvents } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const UserDashboard = () => {
  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          My Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Avatar sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', mb: 2 }}>
                  <MenuBook />
                </Avatar>
                <Typography variant="body2" color="text.secondary">Books Read</Typography>
                <Typography variant="h4" fontWeight={700}>47</Typography>
                <Typography variant="caption" color="success.main">+12</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Avatar sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', mb: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="body2" color="text.secondary">Reading Streak</Typography>
                <Typography variant="h4" fontWeight={700}>12 days</Typography>
                <Typography variant="caption" color="success.main">+2</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Avatar sx={{ backgroundColor: '#f3e5f5', color: '#7b1fa2', mb: 2 }}>
                  <AccessTime />
                </Avatar>
                <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                <Typography variant="h4" fontWeight={700}>156</Typography>
                <Typography variant="caption" color="success.main">+24</Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Avatar sx={{ backgroundColor: '#fff3e0', color: '#e65100', mb: 2 }}>
                  <EmojiEvents />
                </Avatar>
                <Typography variant="body2" color="text.secondary">Achievements</Typography>
                <Typography variant="h4" fontWeight={700}>8/12</Typography>
                <Typography variant="caption" color="success.main">+2</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default UserDashboard;
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar
} from '@mui/material';
import {
  TrendingUp,
  ThumbUp,
  AccessTime
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminAnalytics = () => {
  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Detailed insights and performance metrics
        </Typography>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Collection Rate
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  92%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +5% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <ThumbUp />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    User Satisfaction
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  4.8/5
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Based on 1.2K reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ backgroundColor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                    <AccessTime />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Avg Processing Time
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700}>
                  2.3h
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  -15% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Performance Chart */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Performance Overview
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'flex-end', gap: 3, mt: 4 }}>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => {
                const booksHeight = [120, 150, 140, 180, 200];
                const usersHeight = [80, 100, 90, 120, 140];
                const revenueHeight = [150, 180, 170, 210, 240];
                
                return (
                  <Box key={month} sx={{ flex: 1, display: 'flex', gap: 0.5, alignItems: 'flex-end' }}>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          height: booksHeight[index],
                          backgroundColor: '#5c6bc0',
                          borderRadius: '4px 4px 0 0',
                          mb: 1
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          height: usersHeight[index],
                          backgroundColor: '#42a5f5',
                          borderRadius: '4px 4px 0 0',
                          mb: 1
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          height: revenueHeight[index],
                          backgroundColor: '#ec407a',
                          borderRadius: '4px 4px 0 0',
                          mb: 1
                        }}
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                        {month}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#5c6bc0', borderRadius: 1, mr: 1 }} />
                <Typography variant="body2">Books</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#42a5f5', borderRadius: 1, mr: 1 }} />
                <Typography variant="body2">Users</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#ec407a', borderRadius: 1, mr: 1 }} />
                <Typography variant="body2">Revenue</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
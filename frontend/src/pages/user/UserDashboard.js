import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar, CircularProgress, Alert } from '@mui/material';
import { MenuBook, TrendingUp, AccessTime, EmojiEvents } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view statistics');
        setLoading(false);
        return;
      }

      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User data not found. Please login again.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userStr);
      const userId = userData.id;

      if (!userId) {
        setError('User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching stats for user ID:', userId);

      const response = await axios.get(
        `http://localhost:8000/api/users/${userId}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Stats response:', response.data);

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError(response.data.message || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Digital Library">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          My Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Avatar sx={{ backgroundColor: '#e3f2fd', color: '#1976d2', mb: 2 }}>
                  <MenuBook />
                </Avatar>
                <Typography variant="body2" color="text.secondary">Books Read</Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats?.books_read || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
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
                <Typography variant="h4" fontWeight={700}>
                  {stats?.reading_streak || 0} days
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Consecutive
                </Typography>
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
                <Typography variant="h4" fontWeight={700}>
                  {stats?.total_hours || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estimated
                </Typography>
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
                <Typography variant="h4" fontWeight={700}>
                  {stats?.achievements || 0}/{stats?.total_achievements || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unlocked
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {stats?.currently_reading > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Currently Reading
              </Typography>
              <Typography variant="h3" fontWeight={700} color="primary">
                {stats.currently_reading}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.currently_reading === 1 ? 'book' : 'books'} in progress
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default UserDashboard;
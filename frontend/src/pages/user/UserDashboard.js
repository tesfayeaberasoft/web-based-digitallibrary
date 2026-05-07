import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  CircularProgress, 
  Alert,
  LinearProgress,
  Button,
  Chip,
  Paper,
  Fade,
  Grow
} from '@mui/material';
import { 
  MenuBook, 
  TrendingUp, 
  AccessTime, 
  EmojiEvents,
  LocalFireDepartment,
  AutoStories,
  TrendingUpOutlined,
  ArrowForward
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      <Fade in={true} timeout={800}>
        <Box>
          {/* Welcome Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome back, {user?.first_name || 'Reader'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's your reading journey at a glance
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {/* Main Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Books Read Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={600}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(74, 155, 142, 0.3)'
                    }
                  }}
                  onClick={() => navigate('/user/history')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white',
                        width: 56,
                        height: 56
                      }}>
                        <MenuBook sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="Total" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                      {stats?.books_read || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Books Read
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Click to view history
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Reading Streak Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={800}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(255, 107, 107, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white',
                        width: 56,
                        height: 56
                      }}>
                        <LocalFireDepartment sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="🔥 Streak" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                      {stats?.reading_streak || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Day Streak
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {stats?.reading_streak > 0 ? 'Keep it up!' : 'Start reading today!'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Total Hours Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1000}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(167, 139, 250, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white',
                        width: 56,
                        height: 56
                      }}>
                        <AccessTime sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="Hours" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                      {stats?.total_hours || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Reading Time
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Estimated hours
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Achievements Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1200}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: 'white',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(251, 191, 36, 0.3)'
                    }
                  }}
                  onClick={() => navigate('/user/achievements')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white',
                        width: 56,
                        height: 56
                      }}>
                        <EmojiEvents sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="🏆 Badges" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.2)', 
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                    <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                      {stats?.achievements || 0}/{stats?.total_achievements || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Achievements
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Click to view all
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* Currently Reading Section */}
          {stats?.currently_reading > 0 && (
            <Fade in={true} timeout={1400}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  mb: 4,
                  background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
                  border: '2px solid #4a9b8e',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#4a9b8e', 
                      width: 64, 
                      height: 64 
                    }}>
                      <AutoStories sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700} color="#2c5f57">
                        Currently Reading
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="#4a9b8e" sx={{ my: 1 }}>
                        {stats.currently_reading} {stats.currently_reading === 1 ? 'Book' : 'Books'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Keep up the great work! 📚
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/user/books')}
                    sx={{ 
                      bgcolor: '#4a9b8e', 
                      '&:hover': { bgcolor: '#3d8276' },
                      px: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    View My Books
                  </Button>
                </Box>
              </Paper>
            </Fade>
          )}

          {/* Reading Progress Section */}
          <Grid container spacing={3}>
            {/* Reading Goal Progress */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1600}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                        <TrendingUpOutlined />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          Reading Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your journey this month
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Books Completed
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {stats?.books_read || 0} / 10
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, ((stats?.books_read || 0) / 10) * 100)}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4a9b8e',
                            borderRadius: 5
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Box sx={{ flex: 1, p: 2, bgcolor: '#f0f9f8', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          This Week
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="#4a9b8e">
                          {Math.min(stats?.books_read || 0, 3)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, p: 2, bgcolor: '#f0f9f8', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          This Month
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="#4a9b8e">
                          {stats?.books_read || 0}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/user/reading-goals')}
                      sx={{ 
                        mt: 3,
                        borderColor: '#4a9b8e',
                        color: '#4a9b8e',
                        '&:hover': {
                          borderColor: '#3d8276',
                          bgcolor: 'rgba(74, 155, 142, 0.04)'
                        }
                      }}
                    >
                      Manage Reading Goals
                    </Button>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1800}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Quick Actions
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      What would you like to do today?
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<MenuBook />}
                        onClick={() => navigate('/browse')}
                        sx={{ 
                          bgcolor: '#4a9b8e', 
                          '&:hover': { bgcolor: '#3d8276' },
                          py: 1.5,
                          justifyContent: 'flex-start',
                          fontSize: '1rem'
                        }}
                      >
                        Browse Books
                      </Button>
                      
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AutoStories />}
                        onClick={() => navigate('/user/books')}
                        sx={{ 
                          borderColor: '#4a9b8e',
                          color: '#4a9b8e',
                          '&:hover': {
                            borderColor: '#3d8276',
                            bgcolor: 'rgba(74, 155, 142, 0.04)'
                          },
                          py: 1.5,
                          justifyContent: 'flex-start',
                          fontSize: '1rem'
                        }}
                      >
                        My Books
                      </Button>
                      
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EmojiEvents />}
                        onClick={() => navigate('/user/achievements')}
                        sx={{ 
                          borderColor: '#4a9b8e',
                          color: '#4a9b8e',
                          '&:hover': {
                            borderColor: '#3d8276',
                            bgcolor: 'rgba(74, 155, 142, 0.04)'
                          },
                          py: 1.5,
                          justifyContent: 'flex-start',
                          fontSize: '1rem'
                        }}
                      >
                        View Achievements
                      </Button>
                      
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<TrendingUp />}
                        onClick={() => navigate('/user/reading-goals')}
                        sx={{ 
                          borderColor: '#4a9b8e',
                          color: '#4a9b8e',
                          '&:hover': {
                            borderColor: '#3d8276',
                            bgcolor: 'rgba(74, 155, 142, 0.04)'
                          },
                          py: 1.5,
                          justifyContent: 'flex-start',
                          fontSize: '1rem'
                        }}
                      >
                        Reading Goals
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default UserDashboard;
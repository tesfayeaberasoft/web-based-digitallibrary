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
  Grow,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { 
  MenuBook, 
  TrendingUp, 
  AccessTime, 
  EmojiEvents,
  LocalFireDepartment,
  AutoStories,
  ArrowForward,
  BookmarkBorder,
  Search,
  Favorite,
  Star,
  Timeline,
  Refresh,
  BookOnline,
  LibraryBooks
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FinesWidget from '../../components/payments/FinesWidget';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Green Theme Colors
const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#d8f3dc',
  lighter: '#f0fdf4',
  dark: '#1b4332',
  accent: '#95d5b2'
};

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [favoritesError, setFavoritesError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:8000/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!data.success) throw new Error(data.message || 'Could not load favorites.');
        setFavorites(data.favorites || []);
      } catch (requestError) {
        setFavoritesError(
          requestError.response?.data?.message || requestError.message || 'Could not load favorites.'
        );
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
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

      const response = await axios.get(
        `http://localhost:8000/api/users/${userId}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError(response.data.message || 'Failed to load statistics');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <DashboardLayout title="Digital Library">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={60} sx={{ color: C.primary }} />
          <Typography variant="body1" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Digital Library">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Welcome Header with Refresh */}
          <Box sx={{ 
            mb: 4, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h4" 
                fontWeight={800} 
                sx={{ 
                  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Welcome back, {user?.full_name?.split(' ')[0] || 'Reader'}! 👋
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here's your reading journey at a glance
              </Typography>
            </Box>
            <Tooltip title="Refresh Statistics">
              <IconButton 
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ 
                  bgcolor: C.lighter,
                  color: C.primary,
                  '&:hover': { 
                    bgcolor: C.light,
                    transform: 'rotate(180deg)'
                  },
                  transition: 'all 0.5s ease'
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-icon': { color: C.primary }
              }}
            >
              {error}
            </Alert>
          )}
          
          {/* Main Stats Cards - 4 Column Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Books Read Card */}
            <Grid item xs={12} sm={6} lg={3}>
              <Grow in={true} timeout={600}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${C.primary}40`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease'
                    },
                    '&:hover::before': {
                      transform: 'scale(1.5)',
                      opacity: 0.2
                    }
                  }}
                  onClick={() => navigate('/history')}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                        color: 'white',
                        width: 60,
                        height: 60,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <MenuBook sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="Total" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.25)', 
                          color: 'white',
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.3)'
                        }} 
                      />
                    </Box>
                    <Typography variant="h2" fontWeight={900} sx={{ mb: 1, letterSpacing: -1 }}>
                      {stats?.books_read || 0}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600, mb: 0.5 }}>
                      Books Read
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Click to view history <ArrowForward sx={{ fontSize: 14 }} />
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Reading Streak Card */}
            <Grid item xs={12} sm={6} lg={3}>
              <Grow in={true} timeout={800}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${C.secondary} 0%, ${C.accent} 100%)`,
                    color: C.dark,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${C.secondary}40`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      bottom: -50,
                      left: -50,
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      transition: 'all 0.3s ease'
                    },
                    '&:hover::before': {
                      transform: 'scale(1.5)',
                      opacity: 0.3
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                        color: C.dark,
                        width: 60,
                        height: 60,
                        backdropFilter: 'blur(10px)'
                      }}>
                        <LocalFireDepartment sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="🔥 Streak" 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255, 255, 255, 0.4)', 
                          color: C.dark,
                          fontWeight: 700,
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.5)'
                        }} 
                      />
                    </Box>
                    <Typography variant="h2" fontWeight={900} sx={{ mb: 1, letterSpacing: -1 }}>
                      {stats?.reading_streak || 0}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Day Streak
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {stats?.reading_streak > 0 ? 'Keep it up! 🎯' : 'Start reading today! 📖'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Total Hours Card */}
            <Grid item xs={12} sm={6} lg={3}>
              <Grow in={true} timeout={1000}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${C.light} 0%, ${C.accent} 100%)`,
                    color: C.dark,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${C.secondary}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${C.accent}60`,
                      borderColor: C.primary
                    }
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        backgroundColor: C.secondary, 
                        color: 'white',
                        width: 60,
                        height: 60
                      }}>
                        <AccessTime sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="Hours" 
                        size="small" 
                        sx={{ 
                          bgcolor: C.secondary, 
                          color: 'white',
                          fontWeight: 700
                        }} 
                      />
                    </Box>
                    <Typography variant="h2" fontWeight={900} sx={{ mb: 1, letterSpacing: -1, color: C.primary }}>
                      {stats?.total_hours || 0}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: C.dark }}>
                      Reading Time
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Estimated hours ⏱️
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Achievements Card */}
            <Grid item xs={12} sm={6} lg={3}>
              <Grow in={true} timeout={1200}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${C.lighter} 0%, white 100%)`,
                    color: C.dark,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: `2px solid ${C.light}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 20px 40px ${C.light}`,
                      borderColor: C.secondary,
                      background: `linear-gradient(135deg, ${C.light} 0%, ${C.lighter} 100%)`
                    }
                  }}
                  onClick={() => navigate('/achievements')}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                        color: 'white',
                        width: 60,
                        height: 60
                      }}>
                        <EmojiEvents sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Chip 
                        label="🏆 Badges" 
                        size="small" 
                        sx={{ 
                          background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                          color: 'white',
                          fontWeight: 700
                        }} 
                      />
                    </Box>
                    <Typography variant="h2" fontWeight={900} sx={{ mb: 1, letterSpacing: -1, color: C.primary }}>
                      {stats?.achievements || 0}<Typography component="span" variant="h4" color="text.secondary">/{stats?.total_achievements || 12}</Typography>
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: C.dark }}>
                      Achievements
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Click to view all <ArrowForward sx={{ fontSize: 14 }} />
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* Currently Reading Banner */}
          {stats?.currently_reading > 0 && (
            <Fade in={true} timeout={1400}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  mb: 4,
                  background: `linear-gradient(135deg, ${C.lighter} 0%, white 50%, ${C.lighter} 100%)`,
                  border: `3px solid ${C.secondary}`,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${C.secondary}30`
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle at top right, ${C.light}40, transparent)`,
                    pointerEvents: 'none'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  flexWrap: 'wrap', 
                  gap: 3,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ 
                      background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                      width: { xs: 56, md: 72 }, 
                      height: { xs: 56, md: 72 },
                      boxShadow: `0 8px 16px ${C.primary}40`
                    }}>
                      <AutoStories sx={{ fontSize: { xs: 32, md: 40 } }} />
                    </Avatar>
                    <Box>
                      <Typography variant="overline" sx={{ color: C.secondary, fontWeight: 700, letterSpacing: 1 }}>
                        In Progress
                      </Typography>
                      <Typography variant="h4" fontWeight={800} sx={{ color: C.primary, mb: 0.5 }}>
                        {stats.currently_reading} {stats.currently_reading === 1 ? 'Book' : 'Books'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Keep up the great work! <Star sx={{ fontSize: 16, color: C.secondary }} />
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/my-books')}
                    sx={{ 
                      background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      borderRadius: 2,
                      boxShadow: `0 8px 16px ${C.primary}40`,
                      '&:hover': { 
                        background: `linear-gradient(135deg, ${C.dark}, ${C.primary})`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 12px 24px ${C.primary}50`
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View My Books
                  </Button>
                </Box>
              </Paper>
            </Fade>
          )}

          {/* Bottom Section - Progress & Quick Actions */}
          <Grid container spacing={3}>
            {/* Reading Goal Progress */}
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1600}>
                <Card 
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    border: `1px solid ${C.light}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${C.light}`,
                      borderColor: C.secondary
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ 
                        background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                        width: 48,
                        height: 48
                      }}>
                        <Timeline />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: C.dark }}>
                          Reading Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Your journey this month
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          Books Completed
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: C.primary }}>
                          {stats?.books_read || 0} / 10
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(100, ((stats?.books_read || 0) / 10) * 100)}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: C.lighter,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`,
                            borderRadius: 6
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {Math.min(100, ((stats?.books_read || 0) / 10) * 100).toFixed(0)}% Complete
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: C.lighter, borderRadius: 2, border: `1px solid ${C.light}` }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            This Week
                          </Typography>
                          <Typography variant="h5" fontWeight={800} sx={{ color: C.primary, mt: 0.5 }}>
                            {Math.min(stats?.books_read || 0, 3)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <TrendingUp sx={{ fontSize: 14, color: C.secondary }} />
                            <Typography variant="caption" sx={{ color: C.secondary, fontWeight: 600 }}>
                              Active
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, bgcolor: C.lighter, borderRadius: 2, border: `1px solid ${C.light}` }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            This Month
                          </Typography>
                          <Typography variant="h5" fontWeight={800} sx={{ color: C.primary, mt: 0.5 }}>
                            {stats?.books_read || 0}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Star sx={{ fontSize: 14, color: C.secondary }} />
                            <Typography variant="caption" sx={{ color: C.secondary, fontWeight: 600 }}>
                              Great!
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Button
                      fullWidth
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/reading-goals')}
                      sx={{ 
                        borderColor: C.secondary,
                        color: C.primary,
                        py: 1.2,
                        fontWeight: 700,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: C.primary,
                          bgcolor: C.lighter,
                          transform: 'translateX(4px)'
                        },
                        transition: 'all 0.3s ease'
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
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    border: `1px solid ${C.light}`,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${C.light}`,
                      borderColor: C.secondary
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Avatar sx={{ 
                        background: `linear-gradient(135deg, ${C.secondary}, ${C.accent})`,
                        width: 48,
                        height: 48
                      }}>
                        <BookOnline />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: C.dark }}>
                          Quick Actions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Navigate easily
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      {[
                        { icon: <Search />, label: 'Browse Books', path: '/browse', color: C.primary },
                        { icon: <BookmarkBorder />, label: 'My Reservations', path: '/my-books', color: C.secondary },
                        { icon: <LibraryBooks />, label: 'Borrowed Books', path: '/my-books', color: C.accent },
                        { icon: <Favorite />, label: 'Favorites', path: '/favorites', color: C.primary }
                      ].map((action, index) => (
                        <Grid item xs={6} key={index}>
                          <Paper
                            onClick={() => navigate(action.path)}
                            sx={{
                              p: 2.5,
                              textAlign: 'center',
                              cursor: 'pointer',
                              bgcolor: C.lighter,
                              border: `2px solid ${C.light}`,
                              borderRadius: 2,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                transform: 'translateY(-8px) scale(1.05)',
                                bgcolor: 'white',
                                borderColor: action.color,
                                boxShadow: `0 12px 24px ${action.color}30`
                              }
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: action.color,
                                mx: 'auto',
                                mb: 1.5,
                                width: 56,
                                height: 56,
                                boxShadow: `0 4px 12px ${action.color}40`
                              }}
                            >
                              {React.cloneElement(action.icon, { sx: { fontSize: 28 } })}
                            </Avatar>
                            <Typography 
                              variant="body2" 
                              fontWeight={700}
                              sx={{ 
                                color: C.dark,
                                lineHeight: 1.4
                              }}
                            >
                              {action.label}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        Need help? Contact support
                      </Typography>
                      <Button
                        variant="text"
                        size="small"
                        sx={{ 
                          color: C.primary,
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: C.lighter
                          }
                        }}
                      >
                        Visit Help Center
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>

          {/* Favorite Books */}
          <Card elevation={0} sx={{ mt: 4, border: `1px solid ${C.light}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})` }}>
                    <Favorite />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: C.dark }}>
                      My Favorite Books
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Books you have saved to revisit
                    </Typography>
                  </Box>
                </Box>
                <Button endIcon={<ArrowForward />} onClick={() => navigate('/favorites')}>
                  View all
                </Button>
              </Box>

              {favoritesError ? (
                <Alert severity="error">{favoritesError}</Alert>
              ) : favoritesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={32} sx={{ color: C.primary }} />
                </Box>
              ) : favorites.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: C.lighter, borderRadius: 2 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    You have not saved any favorite books yet.
                  </Typography>
                  <Button variant="outlined" onClick={() => navigate('/browse')}>
                    Browse books
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {favorites.slice(0, 4).map((book) => (
                    <Grid item xs={12} sm={6} md={3} key={book.id}>
                      <Paper
                        sx={{
                          height: '100%',
                          p: 2,
                          bgcolor: C.lighter,
                          border: `1px solid ${C.light}`,
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={700} noWrap title={book.title}>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap title={book.author}>
                          {book.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          {book.category_name || 'Uncategorized'}
                        </Typography>
                        <Button size="small" sx={{ mt: 1 }} onClick={() => navigate('/browse')}>
                          View in library
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>

          {/* Fines Widget */}
          <Fade in={true} timeout={2000}>
            <Box sx={{ mt: 4 }}>
              <FinesWidget />
            </Box>
          </Fade>
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default UserDashboard;

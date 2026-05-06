import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Paper,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  MenuBook as BookIcon,
  LocalFireDepartment as FireIcon,
  RateReview as ReviewIcon,
  AccessTime as TimeIcon,
  Stars as StarsIcon,
  Whatshot as HotIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const UserAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        setError('Please login to view achievements');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userStr);
      const userId = userData.id;

      // Fetch user stats for progress calculation
      const statsResponse = await axios.get(
        `http://localhost:8000/api/users/${userId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      // For now, create sample achievements since the API might not have them
      // In production, you would fetch from: /api/achievements
      const sampleAchievements = [
        {
          id: 1,
          name: 'First Book',
          description: 'Read your first book',
          icon: 'book',
          criteria_type: 'books_read',
          criteria_value: 1,
          points: 10,
          earned: statsResponse.data.stats.books_read >= 1
        },
        {
          id: 2,
          name: 'Bookworm',
          description: 'Read 5 books',
          icon: 'book',
          criteria_type: 'books_read',
          criteria_value: 5,
          points: 25,
          earned: statsResponse.data.stats.books_read >= 5
        },
        {
          id: 3,
          name: 'Book Master',
          description: 'Read 10 books',
          icon: 'book',
          criteria_type: 'books_read',
          criteria_value: 10,
          points: 50,
          earned: statsResponse.data.stats.books_read >= 10
        },
        {
          id: 4,
          name: 'Reading Streak',
          description: 'Maintain a 7-day reading streak',
          icon: 'fire',
          criteria_type: 'reading_streak',
          criteria_value: 7,
          points: 30,
          earned: statsResponse.data.stats.reading_streak >= 7
        },
        {
          id: 5,
          name: 'Dedicated Reader',
          description: 'Maintain a 30-day reading streak',
          icon: 'fire',
          criteria_type: 'reading_streak',
          criteria_value: 30,
          points: 100,
          earned: statsResponse.data.stats.reading_streak >= 30
        },
        {
          id: 6,
          name: 'Time Traveler',
          description: 'Spend 100 hours reading',
          icon: 'time',
          criteria_type: 'time_spent',
          criteria_value: 100,
          points: 75,
          earned: statsResponse.data.stats.total_hours >= 100
        }
      ];

      setAchievements(sampleAchievements);
      setUserAchievements(sampleAchievements.filter(a => a.earned));

    } catch (err) {
      console.error('Error fetching achievements:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load achievements';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'book':
        return <BookIcon />;
      case 'fire':
        return <FireIcon />;
      case 'review':
        return <ReviewIcon />;
      case 'time':
        return <TimeIcon />;
      default:
        return <TrophyIcon />;
    }
  };

  const getProgress = (achievement) => {
    if (!stats) return 0;
    
    let current = 0;
    switch (achievement.criteria_type) {
      case 'books_read':
        current = stats.books_read;
        break;
      case 'reading_streak':
        current = stats.reading_streak;
        break;
      case 'time_spent':
        current = stats.total_hours;
        break;
      default:
        current = 0;
    }
    
    return Math.min(100, (current / achievement.criteria_value) * 100);
  };

  const getProgressText = (achievement) => {
    if (!stats) return '0/0';
    
    let current = 0;
    switch (achievement.criteria_type) {
      case 'books_read':
        current = stats.books_read;
        break;
      case 'reading_streak':
        current = stats.reading_streak;
        break;
      case 'time_spent':
        current = stats.total_hours;
        break;
      default:
        current = 0;
    }
    
    return `${current}/${achievement.criteria_value}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Digital Library">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#4a9b8e' }} size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  const totalPoints = userAchievements.reduce((sum, a) => sum + a.points, 0);
  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;

  return (
    <DashboardLayout title="Digital Library">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              🏆 Achievements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your reading milestones and earn badges
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Zoom in={true} timeout={600}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 24px rgba(251, 191, 36, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                        <TrophyIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Achievements Earned
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {earnedCount}/{totalCount}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Zoom in={true} timeout={800}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 24px rgba(74, 155, 142, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                        <StarsIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Points
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {totalPoints}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Zoom in={true} timeout={1000}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                    color: 'white',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 24px rgba(167, 139, 250, 0.3)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                        <LockIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Locked
                        </Typography>
                        <Typography variant="h3" fontWeight={700}>
                          {totalCount - earnedCount}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Achievements Grid */}
          <Grid container spacing={3}>
            {achievements.map((achievement, index) => {
              const progress = getProgress(achievement);
              const isEarned = achievement.earned;
              
              // Determine colors based on achievement type and status
              let cardGradient, borderColor, iconBg;
              
              if (isEarned) {
                cardGradient = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
                borderColor = '#4caf50';
                iconBg = '#4caf50';
              } else {
                // Different colors for different achievement types
                if (achievement.icon === 'book') {
                  cardGradient = 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)';
                  borderColor = '#4a9b8e';
                  iconBg = '#4a9b8e';
                } else if (achievement.icon === 'fire') {
                  cardGradient = 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';
                  borderColor = '#ff6b6b';
                  iconBg = '#ff6b6b';
                } else if (achievement.icon === 'time') {
                  cardGradient = 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)';
                  borderColor = '#a78bfa';
                  iconBg = '#a78bfa';
                } else {
                  cardGradient = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
                  borderColor = '#9e9e9e';
                  iconBg = '#9e9e9e';
                }
              }
              
              return (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                  <Grow in={true} timeout={600 + (index * 100)}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        background: cardGradient,
                        border: `3px solid ${borderColor}`,
                        opacity: isEarned ? 1 : 0.85,
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'visible',
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 12px 24px ${borderColor}60`,
                          opacity: 1
                        }
                      }}
                    >
                      {isEarned && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            bgcolor: '#4caf50',
                            borderRadius: '50%',
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                            animation: 'pulse 2s infinite'
                          }}
                        >
                          <CheckIcon sx={{ color: 'white', fontSize: 28 }} />
                        </Box>
                      )}
                      
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: iconBg,
                              width: 64,
                              height: 64,
                              boxShadow: `0 4px 12px ${iconBg}40`
                            }}
                          >
                            {getIcon(achievement.icon)}
                          </Avatar>
                          <Chip 
                            label={`${achievement.points} pts`}
                            size="medium"
                            sx={{
                              bgcolor: iconBg,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.875rem'
                            }}
                          />
                        </Box>

                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {achievement.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                          {achievement.description}
                        </Typography>

                        {isEarned ? (
                          <Paper 
                            elevation={0}
                            sx={{ 
                              p: 2,
                              bgcolor: 'rgba(76, 175, 80, 0.1)',
                              borderRadius: 2,
                              border: '2px solid #4caf50'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                              <Typography variant="body2" fontWeight={700} sx={{ color: '#2e7d32' }}>
                                🎉 Unlocked!
                              </Typography>
                            </Box>
                          </Paper>
                        ) : (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" fontWeight={600} color={borderColor}>
                                Progress
                              </Typography>
                              <Typography variant="caption" fontWeight={700} color={borderColor}>
                                {getProgressText(achievement)}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={progress}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                bgcolor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: borderColor,
                                  borderRadius: 5
                                }
                              }}
                            />
                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                              {Math.round(progress)}% complete
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>

          {earnedCount === 0 && (
            <Fade in={true} timeout={1200}>
              <Paper 
                elevation={0}
                sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  mt: 4,
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                  borderRadius: 2,
                  border: '2px solid #ff9800'
                }}
              >
                <Avatar sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: '#ff9800', 
                  margin: '0 auto',
                  mb: 3
                }}>
                  <TrophyIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  No achievements yet
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Start reading books to unlock achievements! 📚
                </Typography>
              </Paper>
            </Fade>
          )}
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default UserAchievements;
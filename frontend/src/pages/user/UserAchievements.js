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
  Alert
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  MenuBook as BookIcon,
  LocalFireDepartment as FireIcon,
  RateReview as ReviewIcon,
  AccessTime as TimeIcon
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
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const totalPoints = userAchievements.reduce((sum, a) => sum + a.points, 0);
  const earnedCount = userAchievements.length;
  const totalCount = achievements.length;

  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Track your reading milestones and earn badges
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#ffd700', width: 56, height: 56 }}>
                    <TrophyIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Achievements Earned
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {earnedCount}/{totalCount}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                    <CheckIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Points
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {totalPoints}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 56, height: 56 }}>
                    <LockIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Locked
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {totalCount - earnedCount}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Achievements Grid */}
        <Grid container spacing={3}>
          {achievements.map((achievement) => (
            <Grid item xs={12} sm={6} md={4} key={achievement.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  opacity: achievement.earned ? 1 : 0.6,
                  border: achievement.earned ? '2px solid #4caf50' : 'none'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: achievement.earned ? '#4caf50' : '#9e9e9e',
                        width: 56,
                        height: 56
                      }}
                    >
                      {achievement.earned ? <CheckIcon sx={{ fontSize: 32 }} /> : getIcon(achievement.icon)}
                    </Avatar>
                    <Chip 
                      label={`${achievement.points} pts`}
                      size="small"
                      color={achievement.earned ? 'success' : 'default'}
                    />
                  </Box>

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {achievement.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {achievement.description}
                  </Typography>

                  {achievement.earned ? (
                    <Chip 
                      label="Unlocked!" 
                      color="success" 
                      size="small"
                      icon={<CheckIcon />}
                    />
                  ) : (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {getProgressText(achievement)}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={getProgress(achievement)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#4caf50'
                          }
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {earnedCount === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <TrophyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No achievements yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start reading books to unlock achievements!
            </Typography>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default UserAchievements;
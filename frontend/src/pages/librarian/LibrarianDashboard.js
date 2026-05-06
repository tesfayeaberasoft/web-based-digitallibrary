import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Button,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Fade,
  Grow,
  Zoom
} from '@mui/material';
import { 
  CheckCircle, 
  Inventory2, 
  People,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  LibraryBooks as LibraryIcon,
  PersonAdd as PersonAddIcon,
  AssignmentReturn as ReturnIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LibrarianDashboard = () => {
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
      const response = await axios.get(
        'http://localhost:8000/api/librarian/stats',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        setError(response.data.message || 'Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Librarian Panel">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress sx={{ color: '#4a9b8e' }} size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Librarian Panel">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              📊 Librarian Overview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage library operations and monitor activities
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {/* Main Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Total Books */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={600}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                    color: 'white',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(74, 155, 142, 0.3)'
                    }
                  }}
                  onClick={() => navigate('/librarian/inventory')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                      <LibraryIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {stats?.total_books || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                      Total Books
                    </Typography>
                    <Chip 
                      label={`${stats?.available_books || 0} Available`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Issued Books */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={800}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                    color: 'white',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(33, 150, 243, 0.3)'
                    }
                  }}
                  onClick={() => navigate('/librarian/requests')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                      <CheckCircle sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {stats?.issued_books || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                      Issued Books
                    </Typography>
                    <Chip 
                      label={`${stats?.today_loans || 0} Today`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Active Members */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1000}>
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                    color: 'white',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(167, 139, 250, 0.3)'
                    }
                  }}
                  onClick={() => navigate('/librarian/users')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                      <People sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {stats?.active_members || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                      Active Members
                    </Typography>
                    <Chip 
                      label={`${stats?.total_members || 0} Total`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            {/* Overdue Books */}
            <Grid item xs={12} sm={6} md={3}>
              <Grow in={true} timeout={1200}>
                <Card 
                  sx={{ 
                    background: stats?.overdue_books > 0 
                      ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
                      : 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                    color: 'white',
                    height: '100%',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: stats?.overdue_books > 0 
                        ? '0 12px 24px rgba(255, 107, 107, 0.3)'
                        : '0 12px 24px rgba(76, 175, 80, 0.3)'
                    }
                  }}
                  onClick={() => navigate('/librarian/requests')}
                >
                  <CardContent>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                      <WarningIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight={700}>
                      {stats?.overdue_books || 0}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                      Overdue Books
                    </Typography>
                    <Chip 
                      label={stats?.overdue_books > 0 ? 'Action Needed' : 'All Clear'}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
                    />
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* Today's Activity */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              mb: 4,
              background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
              border: '2px solid #4a9b8e',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#2c5f57' }}>
              📅 Today's Activity
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4a9b8e', width: 48, height: 48 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="#2c5f57">
                      {stats?.today_loans || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Books Issued
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4a9b8e', width: 48, height: 48 }}>
                    <ReturnIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="#2c5f57">
                      {stats?.today_returns || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Books Returned
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4a9b8e', width: 48, height: 48 }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="#2c5f57">
                      {stats?.pending_reservations || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Reservations
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Quick Actions */}
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            ⚡ Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={600}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/librarian/requests')}
                  sx={{ 
                    py: 3, 
                    background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3d8276 0%, #2c5f57 100%)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" fontWeight={600}>Issue Book</Typography>
                    <Typography variant="caption">Quick checkout</Typography>
                  </Box>
                </Button>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={800}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/librarian/requests')}
                  sx={{ 
                    py: 3, 
                    background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <ReturnIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" fontWeight={600}>Return Book</Typography>
                    <Typography variant="caption">Process return</Typography>
                  </Box>
                </Button>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={1000}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/librarian/inventory')}
                  sx={{ 
                    py: 3, 
                    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Inventory2 sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" fontWeight={600}>Manage Books</Typography>
                    <Typography variant="caption">Inventory control</Typography>
                  </Box>
                </Button>
              </Zoom>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Zoom in={true} timeout={1200}>
                <Button 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/librarian/users')}
                  sx={{ 
                    py: 3, 
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <PersonAddIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6" fontWeight={600}>Manage Users</Typography>
                    <Typography variant="caption">User management</Typography>
                  </Box>
                </Button>
              </Zoom>
            </Grid>
          </Grid>

          {/* Additional Stats */}
          {stats?.total_fines > 0 && (
            <Fade in={true} timeout={1400}>
              <Alert 
                severity="warning" 
                sx={{ mt: 4 }}
                icon={<MoneyIcon />}
              >
                <Typography variant="body1" fontWeight={600}>
                  Unpaid Fines: ${stats.total_fines.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  There are outstanding fines that need to be collected.
                </Typography>
              </Alert>
            </Fade>
          )}
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default LibrarianDashboard;
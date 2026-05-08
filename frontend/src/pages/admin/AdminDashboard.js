import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  Zoom,
  Paper,
  Divider,
  Button,
  Badge
} from '@mui/material';
import {
  People,
  MenuBook,
  TrendingUp,
  AttachMoney,
  SupervisorAccount,
  Shield,
  Refresh as RefreshIcon,
  TrendingDown,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  BookmarkAdd as BookmarkAddIcon,
  Assignment as AssignmentIcon,
  AccountBalance as AccountBalanceIcon,
  Notifications as NotificationsIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const StatCard = ({ title, value, change, icon, color, bgColor, subtitle, onClick, delay = 0 }) => (
  <Zoom in timeout={500 + delay}>
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%)`,
        '&:hover': onClick ? {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1, color: color }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {subtitle}
              </Typography>
            )}
            {change && (
              <Chip
                label={change}
                size="small"
                icon={change.startsWith('+') ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                sx={{
                  backgroundColor: change.startsWith('+') ? '#e8f5e9' : '#ffebee',
                  color: change.startsWith('+') ? '#2e7d32' : '#c62828',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  '& .MuiChip-icon': {
                    color: change.startsWith('+') ? '#2e7d32' : '#c62828'
                  }
                }}
              />
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 64,
              height: 64,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
      
      {/* Animated background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${color}20, ${color}10)`,
          zIndex: 0
        }}
      />
    </Card>
  </Zoom>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  if (loading) {
    return (
      <DashboardLayout title="Admin Panel">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} sx={{ color: '#4a9b8e' }} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin Panel">
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchStats}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        {/* Header Section */}
        <Fade in timeout={300}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #4a9b8e 30%, #2c5f5a 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  🎛️ Admin Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Welcome back! Here's your library's performance overview
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip 
                  icon={<ScheduleIcon />}
                  label={`Updated: ${lastUpdate.toLocaleTimeString()}`}
                  variant="outlined"
                  color="primary"
                />
                <Tooltip title="Refresh Data">
                  <IconButton 
                    onClick={fetchStats}
                    sx={{ 
                      bgcolor: '#4a9b8e',
                      color: 'white',
                      '&:hover': { bgcolor: '#3d8276' }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Key Performance Indicators */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Total Users"
              value={stats?.overview?.total_users || 0}
              change={formatPercentage(stats?.overview?.user_growth_percentage || 0)}
              icon={<People />}
              color="#1976d2"
              bgColor="#e3f2fd"
              subtitle="All registered users"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Total Books"
              value={stats?.overview?.total_books || 0}
              change="+5.2%"
              icon={<MenuBook />}
              color="#2e7d32"
              bgColor="#e8f5e9"
              subtitle="In library collection"
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Active Loans"
              value={stats?.overview?.active_loans || 0}
              change={formatPercentage(stats?.overview?.loan_growth_percentage || 0)}
              icon={<AssignmentIcon />}
              color="#7b1fa2"
              bgColor="#f3e5f5"
              subtitle="Currently borrowed"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Revenue"
              value={formatCurrency(stats?.overview?.total_revenue || 0)}
              change="+15.3%"
              icon={<AttachMoney />}
              color="#e65100"
              bgColor="#fff3e0"
              subtitle="Fines collected"
              delay={300}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Overdue Books"
              value={stats?.overview?.overdue_books || 0}
              change={stats?.overview?.overdue_books > 0 ? "⚠️ Action needed" : "✅ All good"}
              icon={<WarningIcon />}
              color="#d32f2f"
              bgColor="#ffebee"
              subtitle="Need attention"
              delay={400}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Outstanding Fines"
              value={formatCurrency(stats?.overview?.outstanding_fines || 0)}
              change="-8.2%"
              icon={<AccountBalanceIcon />}
              color="#00695c"
              bgColor="#e0f2f1"
              subtitle="Pending collection"
              delay={500}
            />
          </Grid>
        </Grid>

        {/* Today's Activity Summary */}
        <Grow in timeout={800}>
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 4
          }}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon />
              📊 Today's Activity
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    {stats?.today?.loans || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Books Borrowed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    {stats?.today?.returns || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Books Returned
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    {stats?.today?.registrations || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    New Registrations
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    {formatCurrency(stats?.today?.revenue || 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Revenue Generated
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grow>

        {/* Charts and Analytics */}
        <Grid container spacing={3}>
          {/* Monthly Circulation Chart */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1000}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp sx={{ color: '#4a9b8e' }} />
                    📈 Monthly Circulation Trend
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, mt: 3 }}>
                    {stats?.monthly_circulation?.map((item, index) => {
                      const maxValue = Math.max(...(stats?.monthly_circulation?.map(i => i.loans) || [1]));
                      const height = (item.loans / maxValue) * 250;
                      return (
                        <Box key={item.month} sx={{ flex: 1, textAlign: 'center' }}>
                          <Tooltip title={`${item.loans} loans in ${getMonthName(item.month)}`}>
                            <Box
                              sx={{
                                height: height,
                                background: `linear-gradient(to top, #4a9b8e, #66bb6a)`,
                                borderRadius: '8px 8px 0 0',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                pb: 1,
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 4px 12px rgba(74, 155, 142, 0.3)'
                                }
                              }}
                            >
                              {item.loans}
                            </Box>
                          </Tooltip>
                          <Typography variant="caption" fontWeight={500}>
                            {getMonthName(item.month)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Revenue Trend */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1200}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney sx={{ color: '#5c6bc0' }} />
                    💰 Monthly Revenue Trend
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, mt: 3 }}>
                    {stats?.monthly_revenue?.map((item, index) => {
                      const maxValue = Math.max(...(stats?.monthly_revenue?.map(i => parseFloat(i.revenue || 0)) || [1]));
                      const height = (parseFloat(item.revenue || 0) / maxValue) * 250;
                      return (
                        <Box key={item.month} sx={{ flex: 1, textAlign: 'center' }}>
                          <Tooltip title={`${formatCurrency(item.revenue || 0)} in ${getMonthName(item.month)}`}>
                            <Box
                              sx={{
                                height: height || 20,
                                background: `linear-gradient(to top, #5c6bc0, #7986cb)`,
                                borderRadius: '8px 8px 0 0',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                pb: 1,
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  boxShadow: '0 4px 12px rgba(92, 107, 192, 0.3)'
                                }
                              }}
                            >
                              ${Math.round(item.revenue || 0)}
                            </Box>
                          </Tooltip>
                          <Typography variant="caption" fontWeight={500}>
                            {getMonthName(item.month)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1400}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon sx={{ color: '#9575cd' }} />
                    📚 Category Distribution
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    {stats?.category_distribution?.slice(0, 5).map((category, index) => {
                      const colors = ['#9575cd', '#64b5f6', '#ef5350', '#ffa726', '#26a69a'];
                      return (
                        <Box key={category.category} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {category.category}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {category.percentage}% ({category.count} books)
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={parseFloat(category.percentage)}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: colors[index % colors.length],
                                borderRadius: 5,
                                transition: 'all 0.3s ease'
                              }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1600}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon sx={{ color: '#4a9b8e' }} />
                    🔔 Recent Activities
                  </Typography>
                  <Box sx={{ mt: 3, maxHeight: 300, overflowY: 'auto' }}>
                    {stats?.recent_activities?.length > 0 ? (
                      stats.recent_activities.map((activity, index) => {
                        const getActivityIcon = (type) => {
                          switch (type) {
                            case 'loan': return <BookmarkAddIcon sx={{ color: '#4a9b8e' }} />;
                            case 'return': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
                            case 'registration': return <PersonAddIcon sx={{ color: '#2196f3' }} />;
                            default: return <NotificationsIcon sx={{ color: '#9e9e9e' }} />;
                          }
                        };

                        const formatTimeAgo = (dateString) => {
                          const date = new Date(dateString);
                          const now = new Date();
                          const diffMs = now - date;
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffMins = Math.floor(diffMs / 60000);
                          
                          if (diffMins < 60) return `${diffMins} minutes ago`;
                          if (diffHours < 24) return `${diffHours} hours ago`;
                          return date.toLocaleDateString();
                        };

                        return (
                          <Fade in timeout={300 + index * 100} key={index}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 2,
                                pb: 2,
                                borderBottom: index < stats.recent_activities.length - 1 ? '1px solid #f0f0f0' : 'none',
                                '&:hover': {
                                  bgcolor: 'rgba(74, 155, 142, 0.04)',
                                  borderRadius: 2,
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              <Avatar
                                sx={{
                                  backgroundColor: 'rgba(74, 155, 142, 0.1)',
                                  width: 40,
                                  height: 40,
                                  mr: 2
                                }}
                              >
                                {getActivityIcon(activity.type)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {activity.user_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {activity.action}
                                  {activity.book_title && ` - ${activity.book_title}`}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatTimeAgo(activity.activity_date)}
                              </Typography>
                            </Box>
                          </Fade>
                        );
                      })
                    ) : (
                      <Box textAlign="center" py={4}>
                        <Typography variant="body2" color="text.secondary">
                          No recent activities
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboard;
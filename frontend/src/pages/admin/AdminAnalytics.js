import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  Zoom,
  Paper,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ThumbUp,
  AccessTime,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  BookmarkBorder as BookmarkIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AutoGraph as AutoGraphIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  LocalLibrary as LibraryIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const MetricCard = ({ title, value, subtitle, icon, color, bgColor, trend, onClick, delay = 0 }) => (
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
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
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
            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5, color: color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Chip
                label={trend}
                size="small"
                icon={trend.startsWith('+') ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                sx={{
                  backgroundColor: trend.startsWith('+') ? '#e8f5e9' : '#ffebee',
                  color: trend.startsWith('+') ? '#2e7d32' : '#c62828',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: trend.startsWith('+') ? '#2e7d32' : '#c62828'
                  }
                }}
              />
            )}
          </Box>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 48,
              height: 48,
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
          top: -15,
          right: -15,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(45deg, ${color}15, ${color}08)`,
          zIndex: 0
        }}
      />
    </Card>
  </Zoom>
);

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value) => {
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  const formatDuration = (days) => {
    if (days < 1) return `${Math.round(days * 24)}h`;
    return `${Math.round(days)}d`;
  };

  const getHourLabel = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
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

  const analytics = stats?.analytics || {};

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        {/* Header Section */}
        <Fade in timeout={300}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom sx={{ 
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  📊 Advanced Analytics
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Deep insights into library performance and user behavior
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAdvanced}
                      onChange={(e) => setShowAdvanced(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Advanced View"
                />
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
                      bgcolor: '#667eea',
                      color: 'white',
                      '&:hover': { bgcolor: '#5a67d8' }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Key Performance Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Collection Utilization"
              value={`${analytics.collection_utilization?.utilization_rate || 0}%`}
              subtitle={`${analytics.collection_utilization?.borrowed_books || 0} of ${analytics.collection_utilization?.total_books || 0} books`}
              icon={<LibraryIcon />}
              color="#667eea"
              bgColor="#e8eaf6"
              trend={analytics.collection_utilization?.utilization_rate > 70 ? "+High" : "Moderate"}
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Return Rate"
              value={`${analytics.return_analysis?.return_rate || 0}%`}
              subtitle={`${analytics.return_analysis?.returned_books || 0} returned this month`}
              icon={<ThumbUp />}
              color="#f093fb"
              bgColor="#fce4ec"
              trend={formatPercentage(analytics.monthly_comparison?.loans?.change || 0)}
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="On-Time Returns"
              value={`${analytics.satisfaction_metrics?.on_time_rate || 0}%`}
              subtitle={`${analytics.satisfaction_metrics?.on_time_returns || 0} on time`}
              icon={<AccessTime />}
              color="#4facfe"
              bgColor="#e1f5fe"
              trend={analytics.satisfaction_metrics?.on_time_rate > 85 ? "+Excellent" : "Good"}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Avg Books/User"
              value={`${(analytics.user_engagement?.avg_books_per_user || 0).toFixed(1)}`}
              subtitle={`Max: ${analytics.user_engagement?.max_books_per_user || 0} books`}
              icon={<PeopleIcon />}
              color="#26a69a"
              bgColor="#e0f2f1"
              trend={analytics.user_engagement?.avg_books_per_user > 2 ? "+Active" : "Moderate"}
              delay={300}
            />
          </Grid>
        </Grid>

        {/* Peak Hours Analysis */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Grow in timeout={800}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ color: '#ff7043' }} />
                    🕐 Peak Hours Analysis
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 1, mt: 3, overflowX: 'auto' }}>
                    {analytics.peak_hours?.map((item, index) => {
                      const maxValue = Math.max(...(analytics.peak_hours?.map(i => parseInt(i.loan_count)) || [1]));
                      const height = (parseInt(item.loan_count) / maxValue) * 250;
                      const isPeak = parseInt(item.loan_count) > maxValue * 0.7;
                      return (
                        <Box key={item.hour} sx={{ flex: 1, textAlign: 'center', minWidth: 30 }}>
                          <Tooltip title={`${item.loan_count} loans at ${getHourLabel(parseInt(item.hour))}`}>
                            <Box
                              sx={{
                                height: height || 10,
                                background: isPeak 
                                  ? `linear-gradient(to top, #ff7043, #ff8a65)` 
                                  : `linear-gradient(to top, #90caf9, #64b5f6)`,
                                borderRadius: '4px 4px 0 0',
                                mb: 1,
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                                pb: 0.5,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 4px 12px rgba(255, 112, 67, 0.3)'
                                }
                              }}
                            >
                              {item.loan_count}
                            </Box>
                          </Tooltip>
                          <Typography variant="caption" fontWeight={500} sx={{ fontSize: '0.65rem' }}>
                            {parseInt(item.hour)}h
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, background: 'linear-gradient(45deg, #ff7043, #ff8a65)', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Peak Hours</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, background: 'linear-gradient(45deg, #90caf9, #64b5f6)', borderRadius: 1, mr: 1 }} />
                      <Typography variant="caption">Regular Hours</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Weekly Patterns */}
          <Grid item xs={12} md={6}>
            <Grow in timeout={1000}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon sx={{ color: '#ab47bc' }} />
                    📅 Weekly Patterns
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, mt: 3 }}>
                    {analytics.weekly_patterns?.map((item, index) => {
                      const maxValue = Math.max(...(analytics.weekly_patterns?.map(i => parseInt(i.loan_count)) || [1]));
                      const height = (parseInt(item.loan_count) / maxValue) * 250;
                      const colors = ['#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6', '#4fc3f7'];
                      return (
                        <Box key={item.day_name} sx={{ flex: 1, textAlign: 'center' }}>
                          <Tooltip title={`${item.loan_count} loans on ${item.day_name}`}>
                            <Box
                              sx={{
                                height: height || 20,
                                backgroundColor: colors[index % colors.length],
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
                                  boxShadow: `0 4px 12px ${colors[index % colors.length]}40`
                                }
                              }}
                            >
                              {item.loan_count}
                            </Box>
                          </Tooltip>
                          <Typography variant="caption" fontWeight={500}>
                            {item.day_name.substring(0, 3)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Popular Books & Revenue Breakdown */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Popular Books */}
          <Grid item xs={12} md={8}>
            <Grow in timeout={1200}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon sx={{ color: '#ffa726' }} />
                    🏆 Most Popular Books (Last 30 Days)
                  </Typography>
                  <TableContainer sx={{ mt: 2, maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Rank</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Book</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Author</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 600, bgcolor: '#f5f5f5' }}>Loans</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analytics.popular_books?.slice(0, 10).map((book, index) => (
                          <Fade in timeout={300 + index * 50} key={index}>
                            <TableRow 
                              sx={{ 
                                '&:hover': { bgcolor: 'rgba(74, 155, 142, 0.04)' },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <TableCell>
                                <Chip
                                  label={`#${index + 1}`}
                                  size="small"
                                  sx={{
                                    bgcolor: index < 3 ? '#ffa726' : '#e0e0e0',
                                    color: index < 3 ? 'white' : 'text.secondary',
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {book.title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {book.author}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={book.category}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </TableCell>
                              <TableCell>
                                <Badge badgeContent={book.loan_count} color="primary">
                                  <BookmarkIcon color="action" />
                                </Badge>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Revenue Breakdown */}
          <Grid item xs={12} md={4}>
            <Grow in timeout={1400}>
              <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon sx={{ color: '#66bb6a' }} />
                    💰 Revenue Breakdown
                  </Typography>
                  <Box sx={{ mt: 3 }}>
                    {analytics.revenue_breakdown?.map((item, index) => {
                      const colors = ['#66bb6a', '#42a5f5', '#ef5350', '#ffa726', '#ab47bc'];
                      const totalRevenue = analytics.revenue_breakdown?.reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0) || 1;
                      const percentage = ((parseFloat(item.total_amount || 0) / totalRevenue) * 100).toFixed(1);
                      
                      return (
                        <Box key={item.fine_type} sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                              {item.fine_type?.replace('_', ' ') || 'Other'}
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color={colors[index % colors.length]}>
                              ${parseFloat(item.total_amount || 0).toFixed(2)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={parseFloat(percentage)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: colors[index % colors.length],
                                borderRadius: 4,
                              }
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {item.fine_count} fines
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {percentage}%
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Advanced Analytics (Conditional) */}
        {showAdvanced && (
          <Fade in timeout={500}>
            <Grid container spacing={3}>
              {/* Loan Duration Analysis */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SpeedIcon sx={{ color: '#5c6bc0' }} />
                      ⏱️ Loan Duration Insights
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1" fontWeight={600}>
                          Average Loan Duration
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="#5c6bc0">
                          {formatDuration(analytics.satisfaction_metrics?.avg_loan_duration || 0)}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#2e7d32">
                              {analytics.satisfaction_metrics?.on_time_returns || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              On-Time Returns
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#c62828">
                              {analytics.satisfaction_metrics?.late_returns || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Late Returns
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Monthly Comparison */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimelineIcon sx={{ color: '#ff7043' }} />
                      📈 Monthly Comparison
                    </Typography>
                    <Box sx={{ mt: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Loans This Month
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="#1976d2">
                              {analytics.monthly_comparison?.loans?.current || 0}
                            </Typography>
                            <Chip
                              label={formatPercentage(analytics.monthly_comparison?.loans?.change || 0)}
                              size="small"
                              icon={analytics.monthly_comparison?.loans?.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                              sx={{
                                mt: 1,
                                backgroundColor: analytics.monthly_comparison?.loans?.change >= 0 ? '#e8f5e9' : '#ffebee',
                                color: analytics.monthly_comparison?.loans?.change >= 0 ? '#2e7d32' : '#c62828',
                              }}
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              New Users This Month
                            </Typography>
                            <Typography variant="h4" fontWeight={700} color="#7b1fa2">
                              {analytics.monthly_comparison?.users?.current || 0}
                            </Typography>
                            <Chip
                              label={formatPercentage(analytics.monthly_comparison?.users?.change || 0)}
                              size="small"
                              icon={analytics.monthly_comparison?.users?.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                              sx={{
                                mt: 1,
                                backgroundColor: analytics.monthly_comparison?.users?.change >= 0 ? '#e8f5e9' : '#ffebee',
                                color: analytics.monthly_comparison?.users?.change >= 0 ? '#2e7d32' : '#c62828',
                              }}
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
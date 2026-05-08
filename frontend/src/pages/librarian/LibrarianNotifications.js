import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  Fade,
  Grow,
  Zoom,
  Slide,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
  LinearProgress,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Divider,
  CardActions,
  ButtonGroup,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Bolt as BoltIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Timeline as TimelineIcon,
  Insights as InsightsIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const LibrarianNotifications = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Manual notification state
  const [manualDialog, setManualDialog] = useState(false);
  const [manualForm, setManualForm] = useState({
    type: 'general',
    recipients: 'all',
    subject: '',
    message: ''
  });
  
  // Notification logs state
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(0);
  const [logsRowsPerPage, setLogsRowsPerPage] = useState(25);
  const [logsTotalCount, setLogsTotalCount] = useState(0);
  const [logsFilters, setLogsFilters] = useState({
    type: '',
    status: '',
    date_from: '',
    date_to: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    total_notifications: 0,
    sent_count: 0,
    failed_count: 0,
    email_count: 0,
    sms_count: 0,
    today_count: 0,
    week_count: 0
  });

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);

  useEffect(() => {
    if (activeTab === 1) {
      fetchNotificationLogs();
    }
    if (activeTab === 0) {
      fetchDashboardStats();
    }
  }, [activeTab, logsPage, logsRowsPerPage, logsFilters]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (activeTab === 0) {
          fetchDashboardStats();
        } else if (activeTab === 1) {
          fetchNotificationLogs();
        }
        setLastUpdate(new Date());
      }, 30000); // Refresh every 30 seconds
      
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/logs?limit=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.summary || {});
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats');
    }
  };

  const fetchNotificationLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: logsPage + 1,
        limit: logsRowsPerPage,
        ...logsFilters
      });

      const response = await fetch(`http://localhost:8000/api/notifications/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setLogsTotalCount(data.pagination?.total || 0);
        setStats(data.summary || {});
      }
    } catch (error) {
      showAlert('Failed to fetch notification logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendManualNotification = async () => {
    if (!manualForm.subject || !manualForm.message) {
      showAlert('Subject and message are required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/notifications/send-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(manualForm)
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert(`Notification sent successfully: ${data.sent_count} sent, ${data.failed_count} failed`, 'success');
        setManualDialog(false);
        setManualForm({ type: 'general', recipients: 'all', subject: '', message: '' });
        if (activeTab === 1) {
          fetchNotificationLogs();
        }
      } else {
        showAlert(data.message || 'Failed to send notification', 'error');
      }
    } catch (error) {
      showAlert('Failed to send notification', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runScheduler = async () => {
    setIsSchedulerRunning(true);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/notifications/run-scheduler', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showSnackbar('Notification scheduler completed successfully! 🎉', 'success');
        if (activeTab === 1) {
          fetchNotificationLogs();
        }
        fetchDashboardStats();
      } else {
        showAlert(data.message || 'Failed to run scheduler', 'error');
      }
    } catch (error) {
      showAlert('Failed to run notification scheduler', 'error');
    } finally {
      setLoading(false);
      setIsSchedulerRunning(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const clearFilters = () => {
    setLogsFilters({
      type: '',
      status: '',
      date_from: '',
      date_to: ''
    });
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, onClick, delay = 0 }) => (
    <Zoom in timeout={500 + delay}>
      <Card 
        sx={{ 
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          color: 'white',
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': onClick ? {
            transform: 'translateY(-8px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
            background: `linear-gradient(135deg, ${color}ee 0%, ${color}cc 100%)`,
          } : {},
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={onClick}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box sx={{ fontSize: 32, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box>
              <Typography variant="h3" fontWeight="bold" sx={{ 
                background: 'linear-gradient(45deg, #fff 30%, rgba(255,255,255,0.8) 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {value.toLocaleString()}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {trend && (
            <Box display="flex" alignItems="center" mt={1}>
              <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, opacity: 0.8 }} />
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {trend}
              </Typography>
            </Box>
          )}
        </CardContent>
        {onClick && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'rgba(255,255,255,0.3)',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'rgba(255,255,255,0.5)',
                transform: 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.3s ease'
              }
            }}
          />
        )}
      </Card>
    </Zoom>
  );

  return (
    <DashboardLayout title="Notification Management">
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
          minHeight: 'calc(100vh - 120px)',
          borderRadius: 2,
          p: 3
        }}
      >
        <Fade in timeout={300}>
          <Box>
            {/* Header Section */}
            <Box mb={4}>
              <Slide direction="down" in timeout={500}>
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                  <Box>
                    <Typography 
                      variant="h3" 
                      gutterBottom 
                      fontWeight="bold" 
                      sx={{
                        background: 'linear-gradient(45deg, #4a9b8e 30%, #2c5f5a 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      📧 Notification Command Center
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Manage automated notifications and communication with library users
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      <Chip 
                        icon={<ScheduleIcon />} 
                        label={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Auto-refresh"
                      />
                    </Box>
                  </Box>
                  
                  {/* Quick Action Buttons */}
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Tooltip title="Send Manual Notification">
                      <Button
                        variant="contained"
                        startIcon={<SendIcon />}
                        onClick={() => setManualDialog(true)}
                        sx={{ 
                          bgcolor: '#4a9b8e',
                          '&:hover': { bgcolor: '#3d8276' },
                          borderRadius: 3,
                          px: 3
                        }}
                      >
                        Send Notification
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Run Scheduler Now">
                      <Button
                        variant="contained"
                        startIcon={isSchedulerRunning ? <CircularProgress size={16} /> : <BoltIcon />}
                        onClick={runScheduler}
                        disabled={isSchedulerRunning}
                        sx={{ 
                          bgcolor: '#ff9800',
                          '&:hover': { bgcolor: '#f57c00' },
                          borderRadius: 3,
                          px: 3
                        }}
                      >
                        {isSchedulerRunning ? 'Running...' : 'Run Scheduler'}
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              </Slide>
            </Box>

            {alert.show && (
              <Slide direction="down" in timeout={300}>
                <Alert 
                  severity={alert.severity} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    '& .MuiAlert-icon': {
                      fontSize: 24
                    }
                  }}
                  onClose={() => setAlert({ show: false, message: '', severity: 'info' })}
                >
                  {alert.message}
                </Alert>
              </Slide>
            )}

            {/* Enhanced Tabs */}
            <Paper 
              sx={{ 
                mb: 3, 
                borderRadius: 4,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ 
                  '& .MuiTab-root': {
                    minHeight: 72,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                      color: 'white',
                      borderRadius: '12px 12px 0 0'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none'
                  }
                }}
              >
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <AnalyticsIcon />
                      Dashboard
                      <Badge badgeContent={stats.today_count || 0} color="error" />
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <HistoryIcon />
                      Notification Logs
                      <Badge badgeContent={stats.failed_count || 0} color="warning" />
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <SettingsIcon />
                      Settings & Analytics
                    </Box>
                  } 
                />
              </Tabs>
            </Paper>

          {/* Dashboard Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Enhanced Statistics Cards */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Successfully Sent"
                    value={stats.sent_count || 0}
                    icon={<CheckCircleIcon />}
                    color="#4caf50"
                    subtitle="All time deliveries"
                    trend="+12% this week"
                    onClick={() => setActiveTab(1)}
                    delay={0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Failed Deliveries"
                    value={stats.failed_count || 0}
                    icon={<ErrorIcon />}
                    color="#f44336"
                    subtitle="Needs attention"
                    trend={stats.failed_count > 0 ? "Action required" : "All good!"}
                    onClick={() => setActiveTab(1)}
                    delay={100}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Today's Activity"
                    value={stats.today_count || 0}
                    icon={<TrendingUpIcon />}
                    color="#4a9b8e"
                    subtitle="Sent today"
                    trend="Real-time updates"
                    delay={200}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Weekly Total"
                    value={stats.week_count || 0}
                    icon={<TimelineIcon />}
                    color="#ff9800"
                    subtitle="Last 7 days"
                    trend="+8% vs last week"
                    delay={300}
                  />
                </Grid>
              </Grid>

              {/* Enhanced Quick Actions */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                  <Grow in timeout={800}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(102, 126, 234, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                            <CampaignIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              📤 Broadcast Center
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Send targeted notifications
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.6 }}>
                          Create and send custom notifications to specific user groups or all library members
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<SendIcon />}
                          onClick={() => setManualDialog(true)}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 600
                          }}
                        >
                          Create Notification
                        </Button>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Grow in timeout={1000}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(245, 87, 108, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              ⚡ Smart Scheduler
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Automated notifications
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.6 }}>
                          Run due date reminders, overdue alerts, and reservation notifications instantly
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={isSchedulerRunning ? <CircularProgress size={20} /> : <BoltIcon />}
                          onClick={runScheduler}
                          disabled={isSchedulerRunning}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 600
                          }}
                        >
                          {isSchedulerRunning ? 'Processing...' : 'Run Scheduler'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Grow in timeout={1200}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(79, 172, 254, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                            <InsightsIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              📊 Analytics Hub
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Performance insights
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.8, mb: 3, lineHeight: 1.6 }}>
                          View detailed logs, delivery rates, and notification performance metrics
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<AnalyticsIcon />}
                          onClick={() => setActiveTab(1)}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            borderRadius: 3,
                            py: 1.5,
                            fontWeight: 600
                          }}
                        >
                          View Analytics
                        </Button>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>

              {/* Real-time Activity Feed */}
              <Fade in timeout={1500}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                        <TimelineIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          📈 Real-time Activity
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Live notification performance metrics
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      icon={<CelebrationIcon />}
                      label="All systems operational"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="#4caf50" fontWeight="bold">
                          {((stats.sent_count / (stats.sent_count + stats.failed_count)) * 100 || 0).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Rate
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(stats.sent_count / (stats.sent_count + stats.failed_count)) * 100 || 0}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="#2196f3" fontWeight="bold">
                          {stats.email_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Email Notifications
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                          <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: '#2196f3' }} />
                          <Typography variant="caption" color="text.secondary">
                            Primary channel
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="#ff9800" fontWeight="bold">
                          {stats.sms_count || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          SMS Notifications
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                          <SmsIcon sx={{ fontSize: 16, mr: 0.5, color: '#ff9800' }} />
                          <Typography variant="caption" color="text.secondary">
                            Secondary channel
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" color="#9c27b0" fontWeight="bold">
                          {Math.round((stats.week_count || 0) / 7)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Daily Average
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                          <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: '#9c27b0' }} />
                          <Typography variant="caption" color="text.secondary">
                            This week
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Fade>
            </Box>
          )}

          {/* Enhanced Notification Logs Tab */}
          {activeTab === 1 && (
            <Box>
              {/* Advanced Filters */}
              <Accordion 
                expanded={showFilters} 
                onChange={() => setShowFilters(!showFilters)}
                sx={{ 
                  mb: 3, 
                  borderRadius: 4,
                  '&:before': { display: 'none' },
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                    color: 'white',
                    borderRadius: showFilters ? '16px 16px 0 0' : 4,
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <FilterListIcon />
                    <Typography variant="h6" fontWeight="bold">
                      🔍 Advanced Filters & Search
                    </Typography>
                    {(logsFilters.type || logsFilters.status || logsFilters.date_from || logsFilters.date_to) && (
                      <Chip 
                        label="Filters Active" 
                        size="small" 
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3, bgcolor: '#f8f9fa' }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={logsFilters.type}
                          onChange={(e) => setLogsFilters({...logsFilters, type: e.target.value})}
                          label="Type"
                        >
                          <MenuItem value="">All Types</MenuItem>
                          <MenuItem value="email">📧 Email</MenuItem>
                          <MenuItem value="sms">📱 SMS</MenuItem>
                          <MenuItem value="push">🔔 Push</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={logsFilters.status}
                          onChange={(e) => setLogsFilters({...logsFilters, status: e.target.value})}
                          label="Status"
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="sent">✅ Sent</MenuItem>
                          <MenuItem value="failed">❌ Failed</MenuItem>
                          <MenuItem value="pending">⏳ Pending</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        size="small"
                        type="date"
                        label="From Date"
                        value={logsFilters.date_from}
                        onChange={(e) => setLogsFilters({...logsFilters, date_from: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <TextField
                        size="small"
                        type="date"
                        label="To Date"
                        value={logsFilters.date_to}
                        onChange={(e) => setLogsFilters({...logsFilters, date_to: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ButtonGroup variant="outlined" fullWidth>
                        <Button
                          startIcon={<RefreshIcon />}
                          onClick={fetchNotificationLogs}
                          disabled={loading}
                          sx={{ flex: 1 }}
                        >
                          Refresh
                        </Button>
                        <Button
                          startIcon={<ClearIcon />}
                          onClick={clearFilters}
                          sx={{ flex: 1 }}
                        >
                          Clear
                        </Button>
                        <Button
                          startIcon={<DownloadIcon />}
                          onClick={() => {/* Export functionality */}}
                          sx={{ flex: 1 }}
                        >
                          Export
                        </Button>
                      </ButtonGroup>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Enhanced Logs Table */}
              <Paper sx={{ 
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  p: 2,
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <Box display="flex" alignItems="center" justifyContent="between" flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                        <HistoryIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          📋 Notification History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {logsTotalCount.toLocaleString()} total notifications
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip 
                        icon={<CheckCircleIcon />}
                        label={`${stats.sent_count || 0} Sent`}
                        color="success"
                        size="small"
                      />
                      <Chip 
                        icon={<ErrorIcon />}
                        label={`${stats.failed_count || 0} Failed`}
                        color="error"
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <NotificationsIcon sx={{ fontSize: 16 }} />
                            Type
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PeopleIcon sx={{ fontSize: 16 }} />
                            Recipient
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <ScheduleIcon sx={{ fontSize: 16 }} />
                            Sent At
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                          </TableRow>
                        ))
                      ) : logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: '#f5f5f5', width: 64, height: 64 }}>
                                <HistoryIcon sx={{ fontSize: 32, color: '#999' }} />
                              </Avatar>
                              <Typography variant="h6" color="text.secondary">
                                No notification logs found
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Try adjusting your filters or run the scheduler to generate notifications
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs.map((log, index) => (
                          <Fade in timeout={300 + index * 50} key={log.id}>
                            <TableRow 
                              hover 
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'rgba(74, 155, 142, 0.04)',
                                  transform: 'scale(1.01)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32,
                                    bgcolor: log.type === 'email' ? '#2196f3' : log.type === 'sms' ? '#ff9800' : '#9c27b0'
                                  }}>
                                    {getTypeIcon(log.type)}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight="500">
                                    {log.type.toUpperCase()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="500">
                                    {log.recipient}
                                  </Typography>
                                  {log.user_name && (
                                    <Typography variant="caption" color="text.secondary">
                                      {log.user_name}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Tooltip title={log.subject || 'No subject'}>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                    {log.subject || 'No subject'}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={log.status}
                                  color={getStatusColor(log.status)}
                                  size="small"
                                  sx={{ 
                                    fontWeight: 600,
                                    '& .MuiChip-label': {
                                      textTransform: 'capitalize'
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(log.sent_at).toLocaleString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Tooltip title="View Details">
                                  <IconButton 
                                    size="small"
                                    sx={{ 
                                      bgcolor: 'rgba(74, 155, 142, 0.1)',
                                      '&:hover': { bgcolor: 'rgba(74, 155, 142, 0.2)' }
                                    }}
                                  >
                                    <VisibilityIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={logsTotalCount}
                    page={logsPage}
                    onPageChange={(e, newPage) => setLogsPage(newPage)}
                    rowsPerPage={logsRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setLogsRowsPerPage(parseInt(e.target.value, 10));
                      setLogsPage(0);
                    }}
                    sx={{
                      borderTop: '1px solid #dee2e6',
                      bgcolor: '#f8f9fa'
                    }}
                  />
                </TableContainer>
              </Paper>
            </Box>
          )}

          {/* Enhanced Settings Tab */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                {/* SendGrid Configuration */}
                <Grid item xs={12} md={6}>
                  <Grow in timeout={500}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" alignItems="center" mb={3}>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                            <SettingsIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              ⚙️ SendGrid Configuration
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Email service settings
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mb: 3,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            '& .MuiAlert-icon': { color: 'white' }
                          }}
                        >
                          Configure SendGrid API key and settings in the .env file
                        </Alert>
                        
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2">Email Provider:</Typography>
                            <Chip label="SendGrid" color="primary" size="small" />
                          </Box>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2">SMTP Status:</Typography>
                            <Chip label="Configured" color="success" size="small" />
                          </Box>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2">Daily Limit:</Typography>
                            <Chip label="100 emails/day" color="warning" size="small" />
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<SettingsIcon />}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            borderRadius: 3
                          }}
                        >
                          View Setup Guide
                        </Button>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>

                {/* Notification Templates */}
                <Grid item xs={12} md={6}>
                  <Grow in timeout={700}>
                    <Card sx={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white'
                    }}>
                      <CardContent sx={{ p: 4 }}>
                        <Box display="flex" alignItems="center" mb={3}>
                          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2, width: 56, height: 56 }}>
                            <EmailIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h5" fontWeight="bold">
                              📧 Email Templates
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Professional HTML templates
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2">Due Date Reminders:</Typography>
                            <Chip label="Active" color="success" size="small" />
                          </Box>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2">Overdue Alerts:</Typography>
                            <Chip label="Active" color="success" size="small" />
                          </Box>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2">Reservation Notices:</Typography>
                            <Chip label="Active" color="success" size="small" />
                          </Box>
                          <Box display="flex" justifyContent="between" alignItems="center">
                            <Typography variant="body2">Fine Reminders:</Typography>
                            <Chip label="Active" color="success" size="small" />
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ p: 3, pt: 0 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<VisibilityIcon />}
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            borderRadius: 3
                          }}
                        >
                          Preview Templates
                        </Button>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>

                {/* Automation Settings */}
                <Grid item xs={12}>
                  <Grow in timeout={900}>
                    <Paper sx={{ 
                      p: 4, 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <Avatar sx={{ bgcolor: '#4a9b8e', mr: 2, width: 56, height: 56 }}>
                          <AutoAwesomeIcon sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            🤖 Automation Settings
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            Configure automated notification schedules and preferences
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Box p={3} sx={{ bgcolor: '#f8f9fa', borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                              📅 Schedule Settings
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                              <FormControlLabel
                                control={<Switch defaultChecked color="primary" />}
                                label="Due date reminders (3 days)"
                              />
                              <FormControlLabel
                                control={<Switch defaultChecked color="primary" />}
                                label="Due date reminders (1 day)"
                              />
                              <FormControlLabel
                                control={<Switch defaultChecked color="primary" />}
                                label="Overdue alerts"
                              />
                              <FormControlLabel
                                control={<Switch defaultChecked color="primary" />}
                                label="Reservation notifications"
                              />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box p={3} sx={{ bgcolor: '#f8f9fa', borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                              ⏰ Timing Configuration
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                              <TextField
                                size="small"
                                label="Daily run time"
                                defaultValue="09:00"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                              />
                              <TextField
                                size="small"
                                label="Retry interval (minutes)"
                                defaultValue="30"
                                type="number"
                              />
                              <TextField
                                size="small"
                                label="Max retry attempts"
                                defaultValue="3"
                                type="number"
                              />
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box p={3} sx={{ bgcolor: '#f8f9fa', borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                              📊 Performance Metrics
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                              <Box display="flex" justifyContent="between">
                                <Typography variant="body2">Success Rate:</Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {((stats.sent_count / (stats.sent_count + stats.failed_count)) * 100 || 0).toFixed(1)}%
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="between">
                                <Typography variant="body2">Avg. Response Time:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  2.3s
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="between">
                                <Typography variant="body2">Last Run:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {lastUpdate.toLocaleTimeString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grow>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Enhanced Manual Notification Dialog */}
          <Dialog 
            open={manualDialog} 
            onClose={() => setManualDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                <CampaignIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  📤 Create Notification Campaign
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Send targeted messages to library users
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>📋 Notification Type</InputLabel>
                    <Select
                      value={manualForm.type}
                      onChange={(e) => setManualForm({...manualForm, type: e.target.value})}
                      label="📋 Notification Type"
                    >
                      <MenuItem value="general">
                        <Box display="flex" alignItems="center" gap={1}>
                          <CampaignIcon sx={{ fontSize: 20 }} />
                          General Announcement
                        </Box>
                      </MenuItem>
                      <MenuItem value="due_reminder">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ScheduleIcon sx={{ fontSize: 20 }} />
                          Due Date Reminder
                        </Box>
                      </MenuItem>
                      <MenuItem value="overdue_alert">
                        <Box display="flex" alignItems="center" gap={1}>
                          <WarningIcon sx={{ fontSize: 20 }} />
                          Overdue Alert
                        </Box>
                      </MenuItem>
                      <MenuItem value="fine_reminder">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ErrorIcon sx={{ fontSize: 20 }} />
                          Fine Reminder
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>👥 Target Audience</InputLabel>
                    <Select
                      value={manualForm.recipients}
                      onChange={(e) => setManualForm({...manualForm, recipients: e.target.value})}
                      label="👥 Target Audience"
                    >
                      <MenuItem value="all">
                        <Box display="flex" alignItems="center" gap={1}>
                          <PeopleIcon sx={{ fontSize: 20 }} />
                          All Active Users
                        </Box>
                      </MenuItem>
                      <MenuItem value="overdue">
                        <Box display="flex" alignItems="center" gap={1}>
                          <WarningIcon sx={{ fontSize: 20 }} />
                          Users with Overdue Books
                        </Box>
                      </MenuItem>
                      <MenuItem value="fines">
                        <Box display="flex" alignItems="center" gap={1}>
                          <ErrorIcon sx={{ fontSize: 20 }} />
                          Users with Outstanding Fines
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="✉️ Subject Line"
                    value={manualForm.subject}
                    onChange={(e) => setManualForm({...manualForm, subject: e.target.value})}
                    required
                    placeholder="Enter a compelling subject line..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="📝 Message Content"
                    value={manualForm.message}
                    onChange={(e) => setManualForm({...manualForm, message: e.target.value})}
                    multiline
                    rows={6}
                    required
                    placeholder="Write your message here... Be clear, friendly, and helpful!"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ borderRadius: 3 }}>
                    <Typography variant="body2">
                      💡 <strong>Pro Tip:</strong> Keep your message concise and include clear next steps for users. 
                      The system will automatically format your message with professional templates.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 2 }}>
              <Button 
                onClick={() => setManualDialog(false)}
                variant="outlined"
                sx={{ borderRadius: 3, px: 3 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={sendManualNotification}
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                sx={{ 
                  bgcolor: '#4a9b8e',
                  '&:hover': { bgcolor: '#3d8276' },
                  borderRadius: 3,
                  px: 4
                }}
              >
                {loading ? 'Sending...' : 'Send Notification'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setSnackbar({ ...snackbar, open: false })} 
              severity={snackbar.severity}
              sx={{ 
                width: '100%',
                borderRadius: 3,
                '& .MuiAlert-icon': {
                  fontSize: 24
                }
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Floating Action Button for Quick Actions */}
          <SpeedDial
            ariaLabel="Quick Actions"
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
            icon={<SpeedDialIcon />}
            FabProps={{
              sx: {
                bgcolor: '#4a9b8e',
                '&:hover': { bgcolor: '#3d8276' }
              }
            }}
          >
            <SpeedDialAction
              icon={<SendIcon />}
              tooltipTitle="Send Notification"
              onClick={() => setManualDialog(true)}
            />
            <SpeedDialAction
              icon={<BoltIcon />}
              tooltipTitle="Run Scheduler"
              onClick={runScheduler}
            />
            <SpeedDialAction
              icon={<RefreshIcon />}
              tooltipTitle="Refresh Data"
              onClick={() => {
                if (activeTab === 0) fetchDashboardStats();
                else if (activeTab === 1) fetchNotificationLogs();
              }}
            />
          </SpeedDial>
          </Box>
        </Fade>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianNotifications;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  SupervisorAccount,
  Dashboard as DashboardIcon,
  People,
  LibraryBooks,
  Storage,
  Security,
  Backup,
  Notifications,
  TrendingUp,
  Speed,
  Memory,
  NetworkCheck,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Settings,
  AdminPanelSettings,
  Group,
  Book,
  PersonAdd,
  PersonRemove,
  Build,
  CleaningServices,
  SystemUpdateAlt,
  Download,
  Upload,
  Delete,
  Edit,
  Visibility,
  ExpandMore,
  Timeline,
  Assessment,
  MonitorHeart,
  CloudDownload,
  Schedule,
  AccessTime,
  DataUsage,
  HealthAndSafety,
  BugReport,
  Analytics,
  Insights,
  TrendingDown,
  SignalCellularAlt,
  DeviceHub,
  Computer,
  PhoneAndroid,
  Tablet,
  DesktopWindows,
  Public,
  Lock,
  VpnKey,
  Shield,
  Gavel,
  Assignment,
  History,
  EventNote,
  Today,
  CalendarToday,
  AttachMoney,
  AccountBalance,
  CreditCard,
  Receipt,
  MonetizationOn
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/super-admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Ensure all data properties are properly structured
        const data = response.data.data || {};
        
        // Validate and sanitize the data
        const sanitizedData = {
          system_overview: data.system_overview || {},
          user_statistics: data.user_statistics || {},
          resource_statistics: data.resource_statistics || {},
          system_health: data.system_health || {},
          security_status: data.security_status || {},
          recent_activities: Array.isArray(data.recent_activities) ? data.recent_activities : [],
          performance_metrics: data.performance_metrics || {},
          backup_status: data.backup_status || {},
          active_sessions: data.active_sessions || {}
        };
        
        setDashboardData(sanitizedData);
        setError('');
      } else {
        throw new Error(response.data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      
      // Set default data structure to prevent crashes
      setDashboardData({
        system_overview: { totals: {}, users_by_role: [] },
        user_statistics: { registration_trend: [], activity_breakdown: [], top_users: [] },
        resource_statistics: { books_by_category: [], popular_books: [], loan_trends: [] },
        system_health: { database: {}, storage: {}, memory: {}, cpu: {} },
        security_status: { failed_logins_24h: 0, suspended_users: 0, recent_events: [] },
        recent_activities: [],
        performance_metrics: { query_performance: {}, uptime: {} },
        backup_status: { backup_enabled: false, last_backup: null },
        active_sessions: { online_users: 0, total_sessions: 0 }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleSystemAction = async (action, data = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/super-admin/system-management', {
        action: action,
        ...data
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        await loadDashboardData(); // Refresh data
        setOpenDialog('');
      } else {
        throw new Error(response.data.message || 'Action failed');
      }
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      setError(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy': case 'active': case 'online': return 'success';
      case 'warning': case 'degraded': return 'warning';
      case 'error': case 'critical': case 'offline': return 'error';
      default: return 'default';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Chart colors
  const chartColors = ['#4a9b8e', '#66bb6a', '#42a5f5', '#ab47bc', '#ff7043', '#ffa726', '#26c6da', '#ec407a'];

  if (loading && !dashboardData) {
    return (
      <DashboardLayout title="Super Admin Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error && !dashboardData) {
    return (
      <DashboardLayout title="Super Admin Dashboard">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  const {
    system_overview = {},
    user_statistics = {},
    resource_statistics = {},
    system_health = {},
    security_status = {},
    recent_activities = [],
    performance_metrics = {},
    backup_status = {},
    active_sessions = {}
  } = dashboardData || {};

  // Ensure arrays are properly initialized
  const safeRecentActivities = Array.isArray(recent_activities) ? recent_activities : [];
  const safeRegistrationTrend = Array.isArray(user_statistics.registration_trend) ? user_statistics.registration_trend : [];
  const safeBooksbyCategory = Array.isArray(resource_statistics.books_by_category) ? resource_statistics.books_by_category : [];

  return (
    <DashboardLayout title="Super Admin Dashboard">
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ 
              background: 'linear-gradient(45deg, #d32f2f 30%, #f57c00 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <SupervisorAccount sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
              Super Administrator
            </Typography>
            <Typography variant="h6" color="text.secondary">
              System-wide control center and monitoring dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Dashboard">
              <IconButton onClick={handleRefresh} disabled={refreshing}>
                <Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              </IconButton>
            </Tooltip>
            <Chip 
              label="SUPER ADMIN" 
              color="error" 
              variant="filled"
              icon={<AdminPanelSettings />}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        {/* System Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {formatNumber(system_overview.totals?.total_users || 0)}
                    </Typography>
                    <Typography variant="body2">Total Users</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Staff: {formatNumber(system_overview.totals?.total_staff || 0)}
                    </Typography>
                  </Box>
                  <People sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {formatNumber(system_overview.totals?.total_books || 0)}
                    </Typography>
                    <Typography variant="body2">Total Books</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Active Loans: {formatNumber(system_overview.totals?.active_loans || 0)}
                    </Typography>
                  </Box>
                  <LibraryBooks sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {active_sessions?.online_users || 0}
                    </Typography>
                    <Typography variant="body2">Online Users</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Sessions: {active_sessions?.total_sessions || 0}
                    </Typography>
                  </Box>
                  <SignalCellularAlt sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {system_overview.totals?.pending_fines || 0}
                    </Typography>
                    <Typography variant="body2">Pending Fines</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Reservations: {formatNumber(system_overview.totals?.active_reservations || 0)}
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 50, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* System Health Status */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <MonitorHeart sx={{ mr: 1, verticalAlign: 'middle' }} />
                  System Health Status
                </Typography>
                <Grid container spacing={2}>
                  {/* Database Health */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>Database</Typography>
                        <Chip 
                          label={system_health.database?.status || 'Unknown'} 
                          color={getStatusColor(system_health.database?.status)} 
                          size="small" 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Response Time: {system_health.database?.response_time || 0}ms
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Memory Usage */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>Memory</Typography>
                        <Typography variant="body2">{system_health.memory?.usage_percent || 0}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={system_health.memory?.usage_percent || 0}
                        color={system_health.memory?.usage_percent > 80 ? 'error' : 'primary'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {system_health.memory?.used_mb || 0} MB / {system_health.memory?.limit_mb || 0} MB
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Storage Usage */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>Storage</Typography>
                        <Typography variant="body2">{system_health.storage?.usage_percent || 0}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={system_health.storage?.usage_percent || 0}
                        color={system_health.storage?.usage_percent > 85 ? 'error' : 'info'}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {system_health.storage?.used_gb || 0} GB / {system_health.storage?.total_gb || 0} GB
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* CPU Usage */}
                  {system_health.cpu && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>CPU</Typography>
                          <Typography variant="body2">{system_health.cpu?.usage_percent || 0}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={system_health.cpu?.usage_percent || 0}
                          color={system_health.cpu?.usage_percent > 70 ? 'warning' : 'success'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Load: {system_health.cpu?.load_1min || 0}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Security Status
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color={security_status?.failed_logins_24h > 10 ? 'error' : 'success'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Failed Logins (24h)"
                      secondary={security_status?.failed_logins_24h || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonRemove color={security_status?.suspended_users > 0 ? 'warning' : 'success'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Suspended Users"
                      secondary={security_status?.suspended_users || 0}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Backup color={backup_status?.backup_enabled ? 'success' : 'error'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Backup Status"
                      secondary={backup_status?.backup_enabled ? 'Enabled' : 'Disabled'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Backup"
                      secondary={backup_status?.last_backup || 'Never'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* User Registration Trend */}
          {safeRegistrationTrend.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    User Registration Trend (30 Days)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={safeRegistrationTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="registrations" stroke="#4a9b8e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
          
          {/* Books by Category */}
          {safeBooksbyCategory.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Books by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={safeBooksbyCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, total_books }) => `${category}: ${total_books}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_books"
                      >
                        {safeBooksbyCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Build sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Backup />}
                      onClick={() => handleSystemAction('backup_system')}
                      disabled={loading}
                    >
                      Create Backup
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CleaningServices />}
                      onClick={() => handleSystemAction('system_maintenance', { maintenance_type: 'clear_cache' })}
                      disabled={loading}
                    >
                      Clear Cache
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<SystemUpdateAlt />}
                      onClick={() => setOpenDialog('maintenance')}
                      disabled={loading}
                    >
                      Maintenance Mode
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Group />}
                      onClick={() => setOpenDialog('userManagement')}
                      disabled={loading}
                    >
                      User Management
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activities */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent System Activities
                </Typography>
                <List>
                  {safeRecentActivities.slice(0, 10).map((activity, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        {activity.activity_type === 'user_registration' && <PersonAdd color="success" />}
                        {activity.activity_type === 'book_added' && <LibraryBooks color="info" />}
                        {activity.activity_type === 'book_loan' && <Assignment color="primary" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          activity.activity_type === 'user_registration' 
                            ? `New user registered: ${activity.user_name}`
                            : activity.activity_type === 'book_added'
                            ? `Book added: ${activity.book_title}`
                            : `Book loaned: ${activity.book_title} to ${activity.user_name}`
                        }
                        secondary={new Date(activity.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Insights sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Performance Metrics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Average Query Time"
                      secondary={`${performance_metrics.query_performance?.average_ms || 0}ms`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="PHP Version"
                      secondary={performance_metrics.uptime?.php_version || 'Unknown'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Server Start"
                      secondary={performance_metrics.uptime?.server_start || 'Unknown'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Dialogs */}
        {/* Maintenance Mode Dialog */}
        <Dialog open={openDialog === 'maintenance'} onClose={() => setOpenDialog('')} maxWidth="sm" fullWidth>
          <DialogTitle>System Maintenance</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Choose a maintenance action to perform:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleSystemAction('system_maintenance', { maintenance_type: 'enable_maintenance_mode' })}
                >
                  Enable Maintenance Mode
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleSystemAction('system_maintenance', { maintenance_type: 'disable_maintenance_mode' })}
                >
                  Disable Maintenance Mode
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* User Management Dialog */}
        <Dialog open={openDialog === 'userManagement'} onClose={() => setOpenDialog('')} maxWidth="md" fullWidth>
          <DialogTitle>User Management</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Bulk user management actions:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Security />}
                  onClick={() => handleSystemAction('security_action', { security_action: 'clear_failed_logins' })}
                >
                  Clear Failed Logins
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Delete />}
                  onClick={() => handleSystemAction('clear_logs', { log_type: 'all', older_than_days: 30 })}
                >
                  Clear Old Logs
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbars */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
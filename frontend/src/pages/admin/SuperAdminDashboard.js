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
  AccordionDetails,
  Tabs,
  Tab,
  CardHeader,
  CardActions,
  Collapse,
  Fade,
  Zoom,
  Slide,
  Grow,
  ButtonGroup,
  ToggleButton,
  ToggleButtonGroup,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Backdrop,
  Skeleton
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
  MonetizationOn,
  ExpandLess,
  Fullscreen,
  FullscreenExit,
  FilterList,
  Sort,
  Search,
  NotificationsActive,
  PowerSettingsNew,
  RestartAlt,
  Update,
  CloudSync,
  Sync,
  SyncAlt,
  AutorenewRounded,
  FlashOn,
  Bolt,
  ElectricBolt,
  Whatshot,
  LocalFireDepartment,
  Fireplace,
  Psychology,
  SmartToy,
  AutoAwesome,
  Stars,
  Celebration,
  EmojiEvents,
  WorkspacePremium,
  Diamond,
  AutoFixHigh,
  Tune,
  DashboardCustomize,
  Widgets,
  ViewModule,
  GridView,
  ViewList,
  ViewComfy,
  ViewCompact,
  ViewArray,
  ViewCarousel,
  ViewColumn,
  ViewDay,
  ViewWeek,
  ViewAgenda,
  CalendarViewDay,
  CalendarViewWeek,
  CalendarViewMonth,
  DateRange,
  EventAvailable,
  EventBusy,
  EventRepeat,
  Alarm,
  AlarmOn,
  Timer,
  TimerOff,
  Timelapse,
  HourglassEmpty,
  HourglassFull,
  AvTimer,
  AccessAlarm,
  AccessAlarms,
  WatchLater,
  QueryStats,
  Equalizer,
  BarChart,
  PieChart,
  ShowChart,
  MultilineChart,
  AreaChart,
  BubbleChart,
  ScatterPlot,
  Leaderboard,
  Poll,
  DonutLarge,
  DonutSmall,
  RadioButtonUnchecked,
  RadioButtonChecked,
  CheckBox,
  CheckBoxOutlineBlank,
  IndeterminateCheckBox,
  ToggleOn,
  ToggleOff
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  Area, 
  BarChart as RechartsBarChart,
  Bar, 
  PieChart as RechartsPieChart,
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  ScatterChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
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
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [fullscreenCard, setFullscreenCard] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    userType: 'all',
    status: 'all',
    dateRange: '30d'
  });
  const [realTimeData, setRealTimeData] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    activeConnections: 0,
    requestsPerSecond: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [performanceHistory, setPerformanceHistory] = useState([]);

  // Enhanced color schemes for different themes
  const gradientColors = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    error: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    dark: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    ocean: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
    sunset: 'linear-gradient(135deg, #FF512F 0%, #F09819 100%)',
    forest: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    green: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
    red: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
  };

  // Enhanced chart colors with more variety
  const chartColors = [
    '#4a9b8e', '#66bb6a', '#42a5f5', '#ab47bc', '#ff7043', 
    '#ffa726', '#26c6da', '#ec407a', '#8bc34a', '#ff9800',
    '#9c27b0', '#2196f3', '#f44336', '#009688', '#795548',
    '#607d8b', '#e91e63', '#3f51b5', '#00bcd4', '#4caf50'
  ];

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 10)),
        requestsPerSecond: Math.max(0, prev.requestsPerSecond + Math.floor((Math.random() - 0.5) * 20))
      }));
      
      // Add performance history point
      setPerformanceHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString(),
          cpu: realTimeData.cpuUsage,
          memory: realTimeData.memoryUsage,
          connections: realTimeData.activeConnections
        };
        return [...prev.slice(-19), newPoint]; // Keep last 20 points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [realTimeData]);

  // Enhanced notification system
  useEffect(() => {
    const checkSystemAlerts = () => {
      const alerts = [];
      
      if (realTimeData.cpuUsage > 80) {
        alerts.push({
          id: 'cpu-high',
          type: 'error',
          title: 'High CPU Usage',
          message: `CPU usage is at ${realTimeData.cpuUsage.toFixed(1)}%`,
          timestamp: new Date()
        });
      }
      
      if (realTimeData.memoryUsage > 85) {
        alerts.push({
          id: 'memory-high',
          type: 'warning',
          title: 'High Memory Usage',
          message: `Memory usage is at ${realTimeData.memoryUsage.toFixed(1)}%`,
          timestamp: new Date()
        });
      }
      
      if (realTimeData.activeConnections > 1000) {
        alerts.push({
          id: 'connections-high',
          type: 'info',
          title: 'High Connection Count',
          message: `${realTimeData.activeConnections} active connections`,
          timestamp: new Date()
        });
      }
      
      setSystemAlerts(alerts);
    };

    checkSystemAlerts();
  }, [realTimeData]);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh setup
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

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
        const data = response.data.data || {};
        
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
      
      // Set default data structure
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
        data: data
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        await loadDashboardData();
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

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleFullscreen = (cardId) => {
    setFullscreenCard(fullscreenCard === cardId ? null : cardId);
  };

  // Enhanced metric cards with animations and interactions
  const MetricCard = ({ title, value, subtitle, icon: Icon, gradient, trend, onClick, cardId, children }) => {
    const isExpanded = expandedCards[cardId];
    const isFullscreen = fullscreenCard === cardId;
    
    return (
      <Grow in timeout={500}>
        <Card 
          sx={{ 
            background: gradient, 
            color: 'white', 
            height: isFullscreen ? '90vh' : isExpanded ? 'auto' : '100%',
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? '5%' : 'auto',
            left: isFullscreen ? '5%' : 'auto',
            width: isFullscreen ? '90%' : 'auto',
            zIndex: isFullscreen ? 9999 : 'auto',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              transform: onClick ? 'translateY(-4px)' : 'none',
              boxShadow: onClick ? '0 8px 25px rgba(0,0,0,0.15)' : 'none'
            }
          }}
          onClick={onClick}
        >
          <CardHeader
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                {children && (
                  <IconButton 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardExpansion(cardId);
                    }}
                  >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
                <IconButton 
                  size="small" 
                  sx={{ color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFullscreen(cardId);
                  }}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Box>
            }
            title={
              <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                {title}
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {subtitle}
                </Typography>
                {trend && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {trend > 0 ? <TrendingUp /> : <TrendingDown />}
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {Math.abs(trend)}% from last period
                    </Typography>
                  </Box>
                )}
              </Box>
              <Icon sx={{ fontSize: 60, opacity: 0.8 }} />
            </Box>
            
            <Collapse in={isExpanded}>
              <Box sx={{ mt: 2 }}>
                {children}
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  // Real-time performance widget
  const RealTimeWidget = () => (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlashOn color="warning" />
            <Typography variant="h6" fontWeight={600}>
              Real-Time Performance
            </Typography>
            <Chip 
              label="LIVE" 
              color="error" 
              size="small"
              sx={{ 
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 }
                }
              }}
            />
          </Box>
        }
        action={
          <FormControlLabel
            control={
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            }
            label="Auto Refresh"
          />
        }
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress
                variant="determinate"
                value={realTimeData.cpuUsage}
                size={80}
                thickness={4}
                sx={{
                  color: realTimeData.cpuUsage > 80 ? '#f44336' : realTimeData.cpuUsage > 60 ? '#ff9800' : '#4caf50'
                }}
              />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {realTimeData.cpuUsage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CPU Usage
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress
                variant="determinate"
                value={realTimeData.memoryUsage}
                size={80}
                thickness={4}
                sx={{
                  color: realTimeData.memoryUsage > 85 ? '#f44336' : realTimeData.memoryUsage > 70 ? '#ff9800' : '#2196f3'
                }}
              />
              <Typography variant="h6" sx={{ mt: 1 }}>
                {realTimeData.memoryUsage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Memory Usage
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight={600}>
                  {realTimeData.activeConnections}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active Connections
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="secondary" fontWeight={600}>
                  {realTimeData.requestsPerSecond}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Requests/sec
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {performanceHistory.length > 0 && (
          <Box sx={{ mt: 2, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Line type="monotone" dataKey="cpu" stroke="#f44336" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#2196f3" strokeWidth={2} name="Memory %" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // System alerts component
  const SystemAlerts = () => (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActive color="error" />
            <Typography variant="h6" fontWeight={600}>
              System Alerts
            </Typography>
            <Badge badgeContent={systemAlerts.length} color="error">
              <Warning />
            </Badge>
          </Box>
        }
      />
      <CardContent>
        {systemAlerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="success.main">
              All Systems Normal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No alerts at this time
            </Typography>
          </Box>
        ) : (
          <List>
            {systemAlerts.map((alert) => (
              <ListItem key={alert.id} divider>
                <ListItemIcon>
                  {alert.type === 'error' && <Error color="error" />}
                  {alert.type === 'warning' && <Warning color="warning" />}
                  {alert.type === 'info' && <Info color="info" />}
                </ListItemIcon>
                <ListItemText
                  primary={alert.title}
                  secondary={
                    <Box>
                      <Typography variant="body2">{alert.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alert.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

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
        {/* Enhanced Header with Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 2,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1
          }
        }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <SupervisorAccount sx={{ fontSize: 50 }} />
              Super Administrator
              <Chip 
                label="LIVE" 
                color="error" 
                size="small"
                sx={{ 
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }}
              />
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              System-wide control center and real-time monitoring
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              Last updated: {new Date().toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
            >
              <ToggleButton value="grid" sx={{ color: 'white' }}>
                <GridView />
              </ToggleButton>
              <ToggleButton value="list" sx={{ color: 'white' }}>
                <ViewList />
              </ToggleButton>
              <ToggleButton value="compact" sx={{ color: 'white' }}>
                <ViewCompact />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Time Range Selector */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ 
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <MenuItem value="1h">Last Hour</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>

            {/* Action Buttons */}
            <ButtonGroup variant="contained" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
              <Tooltip title="Refresh Dashboard">
                <Button onClick={handleRefresh} disabled={refreshing}>
                  <Refresh sx={{ 
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </Button>
              </Tooltip>
              <Tooltip title="System Settings">
                <Button onClick={() => setOpenDialog('settings')}>
                  <Settings />
                </Button>
              </Tooltip>
              <Tooltip title="Emergency Actions">
                <Button onClick={() => setOpenDialog('emergency')} color="error">
                  <PowerSettingsNew />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Box>
        </Box>

        {/* System Alerts Banner */}
        {systemAlerts.length > 0 && (
          <Fade in>
            <Alert 
              severity="warning" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={() => setSystemAlerts([])}>
                  DISMISS ALL
                </Button>
              }
            >
              <Typography variant="h6">System Alerts ({systemAlerts.length})</Typography>
              {systemAlerts.slice(0, 3).map(alert => (
                <Typography key={alert.id} variant="body2">
                  • {alert.title}: {alert.message}
                </Typography>
              ))}
            </Alert>
          </Fade>
        )}

        {/* Enhanced System Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Grow in timeout={500}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: 'white', 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        {formatNumber(system_overview.totals?.total_users || 0)}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>Total Users</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Staff: {formatNumber(system_overview.totals?.total_staff || 0)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          +12% from last month
                        </Typography>
                      </Box>
                    </Box>
                    <People sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                  
                  {/* User Distribution Mini Chart */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                      User Distribution
                    </Typography>
                    {system_overview.users_by_role?.slice(0, 3).map((role, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">{role.role}</Typography>
                        <Typography variant="caption" fontWeight={600}>{role.count}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Grow in timeout={700}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                color: 'white', 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        {formatNumber(system_overview.totals?.total_books || 0)}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>Library Collection</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Active Loans: {formatNumber(system_overview.totals?.active_loans || 0)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          +8% new additions
                        </Typography>
                      </Box>
                    </Box>
                    <LibraryBooks sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                  
                  {/* Loan Progress */}
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(system_overview.totals?.active_loans / system_overview.totals?.total_books) * 100 || 0}
                      sx={{ 
                        mb: 1, 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'white'
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {((system_overview.totals?.active_loans / system_overview.totals?.total_books) * 100 || 0).toFixed(1)}% Currently Borrowed
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Grow in timeout={900}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                color: 'white', 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        {active_sessions?.online_users || 0}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>Active Sessions</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Sessions: {active_sessions?.total_sessions || 0}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          -3% from peak
                        </Typography>
                      </Box>
                    </Box>
                    <SignalCellularAlt sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                  
                  {/* Session Details */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Peak Today:</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {Math.max(active_sessions?.online_users || 0, 150)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">Avg Response:</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {performance_metrics.query_performance?.average_ms || 0}ms
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Grow in timeout={1100}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
                color: 'white', 
                height: '100%',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                        ${(system_overview.totals?.pending_fines * 2.5 || 0).toFixed(0)}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>Revenue & Fines</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pending: {formatNumber(system_overview.totals?.pending_fines || 0)} fines
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          +15% this month
                        </Typography>
                      </Box>
                    </Box>
                    <AttachMoney sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                  
                  {/* Revenue Details */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">This Month:</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        ${((system_overview.totals?.pending_fines || 0) * 15).toFixed(0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">Reservations:</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {formatNumber(system_overview.totals?.active_reservations || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Real-time Monitoring Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlashOn color="warning" />
                    <Typography variant="h6" fontWeight={600}>
                      Real-Time Performance
                    </Typography>
                    <Chip 
                      label="LIVE" 
                      color="error" 
                      size="small"
                      sx={{ 
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 }
                        }
                      }}
                    />
                  </Box>
                }
                action={
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Auto Refresh"
                  />
                }
              />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress
                        variant="determinate"
                        value={realTimeData.cpuUsage}
                        size={80}
                        thickness={4}
                        sx={{
                          color: realTimeData.cpuUsage > 80 ? '#f44336' : realTimeData.cpuUsage > 60 ? '#ff9800' : '#4caf50'
                        }}
                      />
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        {realTimeData.cpuUsage.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CPU Usage
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress
                        variant="determinate"
                        value={realTimeData.memoryUsage}
                        size={80}
                        thickness={4}
                        sx={{
                          color: realTimeData.memoryUsage > 85 ? '#f44336' : realTimeData.memoryUsage > 70 ? '#ff9800' : '#2196f3'
                        }}
                      />
                      <Typography variant="h6" sx={{ mt: 1 }}>
                        {realTimeData.memoryUsage.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Memory Usage
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary" fontWeight={600}>
                          {realTimeData.activeConnections}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Active Connections
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="secondary" fontWeight={600}>
                          {realTimeData.requestsPerSecond}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requests/sec
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {performanceHistory.length > 0 && (
                  <Box sx={{ mt: 2, height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line type="monotone" dataKey="cpu" stroke="#f44336" strokeWidth={2} name="CPU %" />
                        <Line type="monotone" dataKey="memory" stroke="#2196f3" strokeWidth={2} name="Memory %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsActive color="error" />
                    <Typography variant="h6" fontWeight={600}>
                      System Alerts
                    </Typography>
                    <Badge badgeContent={systemAlerts.length} color="error">
                      <Warning />
                    </Badge>
                  </Box>
                }
              />
              <CardContent>
                {systemAlerts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="success.main">
                      All Systems Normal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No alerts at this time
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {systemAlerts.map((alert) => (
                      <ListItem key={alert.id} divider>
                        <ListItemIcon>
                          {alert.type === 'error' && <Error color="error" />}
                          {alert.type === 'warning' && <Warning color="warning" />}
                          {alert.type === 'info' && <Info color="info" />}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.title}
                          secondary={
                            <Box>
                              <Typography variant="body2">{alert.message}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {alert.timestamp.toLocaleTimeString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Enhanced System Health Dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonitorHeart color="primary" />
                    <Typography variant="h6" fontWeight={600}>
                      System Health Matrix
                    </Typography>
                    <Chip 
                      label={system_health.database?.status || 'Unknown'} 
                      color={getStatusColor(system_health.database?.status)} 
                      size="small" 
                    />
                  </Box>
                }
                action={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Run Health Check">
                      <IconButton onClick={() => handleSystemAction('health_check')}>
                        <HealthAndSafety />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Detailed Logs">
                      <IconButton onClick={() => setOpenDialog('logs')}>
                        <Assignment />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Database Health */}
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ height: '100%', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Storage sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>Database</Typography>
                        <Chip 
                          label={system_health.database?.status || 'Unknown'} 
                          color={getStatusColor(system_health.database?.status)} 
                          size="small"
                          sx={{ mt: 1, mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Response: {system_health.database?.response_time || 0}ms
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((system_health.database?.response_time || 0) / 10, 100)}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Memory Usage */}
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ height: '100%', background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Memory sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>Memory</Typography>
                        <Typography variant="h4" fontWeight={700} color="secondary.main">
                          {system_health.memory?.usage_percent || 0}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={system_health.memory?.usage_percent || 0}
                          color={system_health.memory?.usage_percent > 80 ? 'error' : 'secondary'}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {system_health.memory?.used_mb || 0} MB / {system_health.memory?.limit_mb || 0} MB
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Storage Usage */}
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <DataUsage sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>Storage</Typography>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {system_health.storage?.usage_percent || 0}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={system_health.storage?.usage_percent || 0}
                          color={system_health.storage?.usage_percent > 85 ? 'error' : 'success'}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {system_health.storage?.used_gb || 0} GB / {system_health.storage?.total_gb || 0} GB
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* CPU Usage */}
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined" sx={{ height: '100%', background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Speed sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={600}>CPU</Typography>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {system_health.cpu?.usage_percent || realTimeData.cpuUsage.toFixed(1)}%
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={system_health.cpu?.usage_percent || realTimeData.cpuUsage}
                          color={system_health.cpu?.usage_percent > 70 ? 'error' : 'warning'}
                          sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Load: {system_health.cpu?.load_1min || realTimeData.cpuUsage / 100}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
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
                    <RechartsPieChart>
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
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
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
                {safeRecentActivities.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EventNote sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No Recent Activities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System activities will appear here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {safeRecentActivities.slice(0, 10).map((activity, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(activity.timestamp || Date.now()).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                  {(activity.user_name || 'U').charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2">
                                  {activity.user_name || 'System'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.action || 'Unknown'} 
                                size="small" 
                                variant="outlined"
                                color={activity.action?.includes('login') ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {activity.details || 'No details available'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.status || 'Success'} 
                                size="small"
                                color={getStatusColor(activity.status)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Security & Backup Status */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Security Status */}
              <Grid item xs={12}>
                <Card sx={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Security Status
                      </Typography>
                      <Security color="error" />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Failed Logins (24h)
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {security_status.failed_logins_24h || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Suspended Users
                      </Typography>
                      <Typography variant="h5" fontWeight={600} color="warning.main">
                        {security_status.suspended_users || 0}
                      </Typography>
                    </Box>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Shield />}
                      onClick={() => setOpenDialog('security')}
                      size="small"
                    >
                      Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Backup Status */}
              <Grid item xs={12}>
                <Card sx={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Backup Status
                      </Typography>
                      <Backup color="success" />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last Backup
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {backup_status.last_backup ? 
                          new Date(backup_status.last_backup).toLocaleDateString() : 
                          'Never'
                        }
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Auto Backup
                      </Typography>
                      <Chip 
                        label={backup_status.backup_enabled ? 'Enabled' : 'Disabled'}
                        color={backup_status.backup_enabled ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CloudDownload />}
                      onClick={() => handleSystemAction('backup_system')}
                      size="small"
                      disabled={loading}
                    >
                      Create Backup
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Enhanced Dialogs */}
        
        {/* Enhanced System Settings Dialog */}
        <Dialog 
          open={openDialog === 'settings'} 
          onClose={() => setOpenDialog('')}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings />
              <Typography variant="h5" fontWeight={600}>
                System Settings & Management
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Performance" icon={<Speed />} />
              <Tab label="Security" icon={<Security />} />
              <Tab label="Notifications" icon={<Notifications />} />
              <Tab label="System Actions" icon={<Build />} />
              <Tab label="Backup & Maintenance" icon={<Backup />} />
              <Tab label="User Management" icon={<Group />} />
            </Tabs>

            {/* Performance Settings Tab */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Speed color="primary" />
                        Performance Optimization
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable System Caching"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Auto Performance Optimization"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Debug Mode"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Database Query Optimization"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<CleaningServices />}
                        onClick={() => handleSystemAction('system_maintenance', { maintenance_type: 'clear_cache' })}
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        Clear System Cache
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Memory color="secondary" />
                        Resource Management
                      </Typography>
                      <TextField
                        fullWidth
                        label="Memory Limit (MB)"
                        type="number"
                        defaultValue={512}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Max Execution Time (seconds)"
                        type="number"
                        defaultValue={300}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Upload Max Size (MB)"
                        type="number"
                        defaultValue={50}
                        sx={{ mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable Compression"
                        sx={{ display: 'block', mb: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Security Settings Tab */}
            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security color="error" />
                        Authentication & Access
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Two-Factor Authentication"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Login Monitoring"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="IP Address Restrictions"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Max Login Attempts"
                        type="number"
                        defaultValue={5}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Session Timeout (minutes)"
                        type="number"
                        defaultValue={60}
                        sx={{ mb: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Shield color="warning" />
                        Security Monitoring
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Failed Login Alerts"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Suspicious Activity Detection"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Real-time Security Scanning"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Security />}
                        onClick={() => handleSystemAction('security_action', { security_action: 'clear_failed_logins' })}
                        disabled={loading}
                        sx={{ mt: 2, mr: 1 }}
                      >
                        Clear Failed Logins
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Shield />}
                        onClick={() => handleSystemAction('security_scan')}
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        Run Security Scan
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Notifications Settings Tab */}
            {activeTab === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Notifications color="info" />
                        Notification Channels
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Email Notifications"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="SMS Alerts"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="System Alerts"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Push Notifications"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Admin Email"
                        type="email"
                        defaultValue="admin@digitallibrary.com"
                        sx={{ mb: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsActive color="warning" />
                        Alert Thresholds
                      </Typography>
                      <TextField
                        fullWidth
                        label="CPU Usage Alert (%)"
                        type="number"
                        defaultValue={80}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Memory Usage Alert (%)"
                        type="number"
                        defaultValue={85}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Disk Usage Alert (%)"
                        type="number"
                        defaultValue={90}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Failed Login Threshold"
                        type="number"
                        defaultValue={10}
                        sx={{ mb: 2 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* System Actions Tab */}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6">System Actions</Typography>
                    These actions can affect system performance and availability. Use with caution.
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <CleaningServices sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>System Cleanup</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Clear temporary files, logs, and optimize database
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<CleaningServices />}
                        onClick={() => handleSystemAction('system_cleanup')}
                        disabled={loading}
                        fullWidth
                      >
                        Run Cleanup
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <SystemUpdateAlt sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>Maintenance Mode</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Enable maintenance mode for system updates
                      </Typography>
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<SystemUpdateAlt />}
                        onClick={() => setOpenDialog('maintenance')}
                        disabled={loading}
                        fullWidth
                      >
                        Maintenance Mode
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <RestartAlt sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>System Restart</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Restart system services and clear memory
                      </Typography>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<RestartAlt />}
                        onClick={() => handleSystemAction('restart_system')}
                        disabled={loading}
                        fullWidth
                      >
                        Restart System
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Backup & Maintenance Tab */}
            {activeTab === 4 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Backup color="success" />
                        Backup Management
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Automatic Backups"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Backup Frequency"
                        select
                        defaultValue="daily"
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="hourly">Hourly</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </TextField>
                      <TextField
                        fullWidth
                        label="Backup Retention (days)"
                        type="number"
                        defaultValue={30}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<Backup />}
                        onClick={() => handleSystemAction('backup_system')}
                        disabled={loading}
                        fullWidth
                        sx={{ mb: 1 }}
                      >
                        Create Backup Now
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownload />}
                        onClick={() => handleSystemAction('restore_backup')}
                        disabled={loading}
                        fullWidth
                      >
                        Restore Backup
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assignment color="info" />
                        Log Management
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable Detailed Logging"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Log Level"
                        select
                        defaultValue="info"
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="debug">Debug</MenuItem>
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="warning">Warning</MenuItem>
                        <MenuItem value="error">Error</MenuItem>
                      </TextField>
                      <TextField
                        fullWidth
                        label="Log Retention (days)"
                        type="number"
                        defaultValue={90}
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleSystemAction('export_logs')}
                        disabled={loading}
                        fullWidth
                        sx={{ mb: 1 }}
                      >
                        Export Logs
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleSystemAction('clear_logs', { log_type: 'all', older_than_days: 30 })}
                        disabled={loading}
                        fullWidth
                      >
                        Clear Old Logs
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* User Management Tab */}
            {activeTab === 5 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <PersonAdd sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>User Creation</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create new users and manage user accounts
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => setOpenDialog('userManagement')}
                        disabled={loading}
                        fullWidth
                      >
                        Manage Users
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <AdminPanelSettings sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>Role Management</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Manage user roles and permissions
                      </Typography>
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<AdminPanelSettings />}
                        onClick={() => handleSystemAction('manage_roles')}
                        disabled={loading}
                        fullWidth
                      >
                        Manage Roles
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: '100%', textAlign: 'center' }}>
                    <CardContent>
                      <Group sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>Bulk Operations</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Perform bulk operations on multiple users
                      </Typography>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<Group />}
                        onClick={() => handleSystemAction('bulk_user_operations')}
                        disabled={loading}
                        fullWidth
                      >
                        Bulk Operations
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                setSuccess('System settings updated successfully');
                setOpenDialog('');
              }}
              disabled={loading}
            >
              Save All Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Emergency Actions Dialog */}
        <Dialog 
          open={openDialog === 'emergency'} 
          onClose={() => setOpenDialog('')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: 'error.main' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PowerSettingsNew />
              Emergency System Actions
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 3 }}>
              These actions can affect system availability. Use with caution.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                  startIcon={<RestartAlt />}
                  onClick={() => handleSystemAction('restart_system')}
                  sx={{ mb: 2 }}
                >
                  Restart System
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<PowerSettingsNew />}
                  onClick={() => handleSystemAction('maintenance_mode', { enabled: true })}
                  sx={{ mb: 2 }}
                >
                  Enable Maintenance Mode
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CleaningServices />}
                  onClick={() => handleSystemAction('emergency_cleanup')}
                  sx={{ mb: 2 }}
                >
                  Emergency Cleanup
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* User Management Dialog */}
        <Dialog 
          open={openDialog === 'userManagement'} 
          onClose={() => setOpenDialog('')}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Group />
              User Management
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>Create User</Typography>
                    <Button variant="contained" fullWidth>
                      Add New User
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Edit sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>Bulk Actions</Typography>
                    <Button variant="outlined" fullWidth>
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AdminPanelSettings sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>Permissions</Typography>
                    <Button variant="outlined" fullWidth>
                      Manage Roles
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Maintenance Mode Dialog */}
        <Dialog 
          open={openDialog === 'maintenance'} 
          onClose={() => setOpenDialog('')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SystemUpdateAlt />
              Maintenance Mode
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Maintenance mode will temporarily disable user access to perform system updates.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Maintenance Message"
                  multiline
                  rows={3}
                  defaultValue="System is under maintenance. Please try again later."
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Estimated Duration (minutes)"
                  type="number"
                  defaultValue={30}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Cancel</Button>
            <Button 
              variant="contained" 
              color="warning"
              onClick={() => {
                handleSystemAction('maintenance_mode', { enabled: true, duration: 30 });
              }}
            >
              Enable Maintenance
            </Button>
          </DialogActions>
        </Dialog>

        {/* System Logs Dialog */}
        <Dialog 
          open={openDialog === 'logs'} 
          onClose={() => setOpenDialog('')}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assignment />
              System Logs
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Error Logs" />
              <Tab label="Access Logs" />
              <Tab label="System Logs" />
              <Tab label="Security Logs" />
            </Tabs>
            
            <Box sx={{ mt: 2, height: 400, overflow: 'auto', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {activeTab === 0 && `[2024-05-11 10:30:15] ERROR: Database connection timeout
[2024-05-11 10:25:32] ERROR: Failed to load user profile for ID: 12345
[2024-05-11 10:20:18] ERROR: Memory usage exceeded threshold (85%)
[2024-05-11 10:15:45] ERROR: Invalid authentication token received`}
                
                {activeTab === 1 && `[2024-05-11 10:30:15] INFO: User login successful - admin@digitallibrary.com
[2024-05-11 10:29:42] INFO: Book search performed - query: "javascript"
[2024-05-11 10:28:33] INFO: User logout - user_id: 123
[2024-05-11 10:27:15] INFO: Password reset requested - email: user@example.com`}
                
                {activeTab === 2 && `[2024-05-11 10:30:15] INFO: System backup completed successfully
[2024-05-11 10:25:00] INFO: Cache cleared - size: 245MB
[2024-05-11 10:20:30] INFO: Database optimization completed
[2024-05-11 10:15:45] INFO: System health check passed`}
                
                {activeTab === 3 && `[2024-05-11 10:30:15] WARN: Multiple failed login attempts - IP: 192.168.1.100
[2024-05-11 10:25:32] INFO: User account locked - user_id: 456
[2024-05-11 10:20:18] WARN: Suspicious activity detected - IP: 10.0.0.50
[2024-05-11 10:15:45] INFO: Security scan completed - no threats found`}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => {
                  setSuccess('Logs exported successfully');
                }}
              >
                Export Logs
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleSystemAction('clear_logs', { log_type: 'all', older_than_days: 30 })}
              >
                Clear Old Logs
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Security Settings Dialog */}
        <Dialog 
          open={openDialog === 'security'} 
          onClose={() => setOpenDialog('')}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield />
              Security Settings
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Login Security</Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable 2FA"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Login Attempts Limit"
                    />
                    <TextField
                      fullWidth
                      label="Max Login Attempts"
                      type="number"
                      defaultValue={5}
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Access Control</Typography>
                    <FormControlLabel
                      control={<Switch />}
                      label="IP Whitelist"
                    />
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Session Timeout"
                    />
                    <TextField
                      fullWidth
                      label="Session Duration (minutes)"
                      type="number"
                      defaultValue={60}
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog('')}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setSuccess('Security settings updated');
              setOpenDialog('');
            }}>
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>

        {/* Recent Activities */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <History sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent System Activities
                </Typography>
                {safeRecentActivities.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EventNote sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No Recent Activities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System activities will appear here
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Details</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {safeRecentActivities.slice(0, 10).map((activity, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(activity.timestamp || Date.now()).toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                  {(activity.user_name || 'U').charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="body2">
                                  {activity.user_name || 'System'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.action || 'Unknown'} 
                                size="small" 
                                variant="outlined"
                                color={activity.action?.includes('login') ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {activity.details || 'No details available'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={activity.status || 'Success'} 
                                size="small"
                                color={getStatusColor(activity.status)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Security & Backup Status */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              {/* Security Status */}
              <Grid item xs={12}>
                <Card sx={{ background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Security Status
                      </Typography>
                      <Security color="error" />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Failed Logins (24h)
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {security_status.failed_logins_24h || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Suspended Users
                      </Typography>
                      <Typography variant="h5" fontWeight={600} color="warning.main">
                        {security_status.suspended_users || 0}
                      </Typography>
                    </Box>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Shield />}
                      onClick={() => setOpenDialog('security')}
                      size="small"
                    >
                      Security Settings
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Backup Status */}
              <Grid item xs={12}>
                <Card sx={{ background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Backup Status
                      </Typography>
                      <Backup color="success" />
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Last Backup
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {backup_status.last_backup ? 
                          new Date(backup_status.last_backup).toLocaleDateString() : 
                          'Never'
                        }
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Auto Backup
                      </Typography>
                      <Chip 
                        label={backup_status.backup_enabled ? 'Enabled' : 'Disabled'}
                        color={backup_status.backup_enabled ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CloudDownload />}
                      onClick={() => handleSystemAction('backup_system')}
                      size="small"
                      disabled={loading}
                    >
                      Create Backup
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Performance Metrics Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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

        {/* Floating Action Button for Quick Actions */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<Refresh />}
            tooltipTitle="Refresh Dashboard"
            onClick={handleRefresh}
          />
          <SpeedDialAction
            icon={<Backup />}
            tooltipTitle="Create Backup"
            onClick={() => handleSystemAction('backup_system')}
          />
          <SpeedDialAction
            icon={<Settings />}
            tooltipTitle="System Settings"
            onClick={() => setOpenDialog('settings')}
          />
          <SpeedDialAction
            icon={<PowerSettingsNew />}
            tooltipTitle="Emergency Actions"
            onClick={() => setOpenDialog('emergency')}
          />
        </SpeedDial>

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
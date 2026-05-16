import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TablePagination,
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
  ToggleOff,
  LibraryAdd,
  MenuBook,
  AssignmentReturn,
  BookmarkAdd,
  Login
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
  const navigate = useNavigate();
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
  const [activitiesPage, setActivitiesPage] = useState(0);
  const [activitiesRowsPerPage, setActivitiesRowsPerPage] = useState(10);
  const [systemSettings, setSystemSettings] = useState({
    performance: {
      caching_enabled: true,
      auto_optimization: true,
      debug_mode: false,
      query_optimization: true,
      memory_limit_mb: 512,
      max_execution_time: 300,
      upload_max_size_mb: 50,
      compression_enabled: true
    },
    security: {
      two_factor_auth: true,
      login_monitoring: true,
      ip_restrictions: false,
      max_login_attempts: 5,
      session_timeout_minutes: 60,
      failed_login_alerts: true,
      suspicious_activity_detection: true,
      realtime_security_scanning: false
    },
    notifications: {
      email_notifications: true,
      sms_alerts: false,
      system_alerts: true,
      push_notifications: true,
      admin_email: 'admin@digitallibrary.com',
      cpu_usage_alert_threshold: 80,
      memory_usage_alert_threshold: 85,
      disk_usage_alert_threshold: 90,
      failed_login_threshold: 10
    },
    backup: {
      automatic_backups: true,
      backup_frequency: 'daily',
      backup_retention_days: 30,
      detailed_logging: true,
      log_level: 'info',
      log_retention_days: 90
    }
  });

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/super-admin/system-management', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setSystemSettings(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    if (openDialog === 'settings') {
      loadSettings();
    }
  }, [openDialog]);

  const handleSettingChange = (section, field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:8000/api/super-admin/system-management', systemSettings, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.success) {
        setSuccess('System settings updated successfully');
        setOpenDialog('');
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };


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

  // System + security alerts
  useEffect(() => {
    const alerts = [];

    if (realTimeData.cpuUsage > 80) {
      alerts.push({
        id: 'cpu-high',
        type: 'error',
        title: 'High CPU Usage',
        message: `CPU usage is at ${Number(realTimeData.cpuUsage || 0).toFixed(1)}%`,
        timestamp: new Date()
      });
    }

    if (realTimeData.memoryUsage > 85) {
      alerts.push({
        id: 'memory-high',
        type: 'warning',
        title: 'High Memory Usage',
        message: `Memory usage is at ${Number(realTimeData.memoryUsage || 0).toFixed(1)}%`,
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

    const sec = dashboardData?.security_status;
    if (sec) {
      const threshold = sec.failed_login_threshold ?? 10;
      if ((sec.failed_logins_24h ?? 0) >= threshold) {
        alerts.push({
          id: 'security-failed-logins',
          type: 'error',
          title: 'High Failed Login Rate',
          message: `${sec.failed_logins_24h} failed login attempt(s) in the last 24 hours`,
          link: '/super-admin/security',
          timestamp: new Date()
        });
      }
      if ((sec.suspicious_ips ?? 0) > 0) {
        alerts.push({
          id: 'security-suspicious-ips',
          type: 'warning',
          title: 'Suspicious IP Activity',
          message: `${sec.suspicious_ips} IP address(es) exceeded the failed-login threshold`,
          link: '/super-admin/security',
          timestamp: new Date()
        });
      }
      if ((sec.inactive_admins ?? 0) > 0) {
        alerts.push({
          id: 'security-inactive-admins',
          type: 'warning',
          title: 'Inactive Admin Accounts',
          message: `${sec.inactive_admins} admin account(s) inactive for 90+ days`,
          link: '/super-admin/security',
          timestamp: new Date()
        });
      }
    }

    setSystemAlerts(alerts);
  }, [realTimeData, dashboardData]);

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
        const fileLabel = response.data.backup_file || response.data.export_file;
        setSuccess(response.data.message + (fileLabel ? ` (${fileLabel})` : ''));
        if (response.data.download_url) {
          try {
            const dl = await axios.get(response.data.download_url, {
              headers: { Authorization: `Bearer ${token}` },
              responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([dl.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileLabel || 'download');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          } catch (downloadErr) {
            console.warn('Auto-download failed:', downloadErr);
          }
        }
        await loadDashboardData();
        setOpenDialog('');
      } else {
        throw new Error(response.data.message || 'Action failed');
      }
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
      setError(err.response?.data?.message || err.message || `Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy': case 'active': case 'online': case 'success': return 'success';
      case 'warning': case 'degraded': case 'overdue': return 'warning';
      case 'error': case 'critical': case 'offline': case 'failed': return 'error';
      case 'info': case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getActivityIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('registration') || actionLower.includes('user')) return <PersonAdd />;
    if (actionLower.includes('book added')) return <LibraryAdd />;
    if (actionLower.includes('issued') || actionLower.includes('borrowed')) return <MenuBook />;
    if (actionLower.includes('returned')) return <AssignmentReturn />;
    if (actionLower.includes('reserved')) return <BookmarkAdd />;
    if (actionLower.includes('fine') || actionLower.includes('paid')) return <AttachMoney />;
    if (actionLower.includes('login')) return <Login />;
    return <EventNote />;
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
                {Number(realTimeData.cpuUsage || 0).toFixed(1)}%
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
                {Number(realTimeData.memoryUsage || 0).toFixed(1)}%
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
                {alert.link && (
                  <ListItemSecondaryAction>
                    <Button size="small" color="error" onClick={() => navigate(alert.link)}>
                      Review
                    </Button>
                  </ListItemSecondaryAction>
                )}
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {systemAlerts.some((a) => a.link) && (
                    <Button color="inherit" size="small" onClick={() => navigate('/super-admin/security')}>
                      SECURITY CENTER
                    </Button>
                  )}
                  <Button color="inherit" size="small" onClick={() => setSystemAlerts([])}>
                    DISMISS ALL
                  </Button>
                </Box>
              }
            >
              <Typography variant="h6">System Alerts ({systemAlerts.length})</Typography>
              {systemAlerts.slice(0, 3).map(alert => (
                <Typography key={alert.id} variant="body2">
                  • {alert.title}: {alert.message}
                  {alert.link && (
                    <Button size="small" sx={{ ml: 1, py: 0 }} onClick={() => navigate(alert.link)}>
                      Review
                    </Button>
                  )}
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
                        Active: {formatNumber(system_overview.totals?.active_users || 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Staff: {formatNumber(system_overview.totals?.total_staff || 0)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          {system_overview.totals?.user_engagement_rate || 0}% engagement rate
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
                        Copies: {formatNumber(system_overview.totals?.total_book_copies || 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Available: {formatNumber(system_overview.totals?.available_book_copies || 0)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          {system_overview.totals?.borrowed_percentage || 0}% in circulation
                        </Typography>
                      </Box>
                    </Box>
                    <LibraryBooks sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                  
                  {/* Loan Progress */}
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={system_overview.totals?.borrowed_percentage || 0}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Active Loans: {formatNumber(system_overview.totals?.active_loans || 0)}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Overdue: {formatNumber(system_overview.totals?.overdue_loans || 0)}
                      </Typography>
                    </Box>
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
                        Today: {system_overview.totals?.users_today || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        This Week: {system_overview.totals?.users_this_week || 0}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <SignalCellularAlt sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          {system_overview.health_indicators?.book_availability_rate || 0}% availability
                        </Typography>
                      </Box>
                    </Box>
                    <SignalCellularAlt sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                  
                  {/* Session Details */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Reservations:</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {formatNumber(system_overview.totals?.pending_reservations || 0)}
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
                        ${Number(system_overview.totals?.total_pending_fine_amount || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>Pending Fines</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Count: {formatNumber(system_overview.totals?.pending_fines || 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Collected: ${Number(system_overview.totals?.total_collected_fines || 0).toFixed(2)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="caption">
                          {system_overview.health_indicators?.fine_collection_rate || 0}% collection rate
                        </Typography>
                      </Box>
                    </Box>
                    <AttachMoney sx={{ fontSize: 60, opacity: 0.8 }} />
                  </Box>
                  
                  {/* Revenue Details */}
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Paid Fines:</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {formatNumber(system_overview.totals?.paid_fines || 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption">Overdue Rate:</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {system_overview.health_indicators?.overdue_rate || 0}%
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
                        {Number(realTimeData.cpuUsage || 0).toFixed(1)}%
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
                        {Number(realTimeData.memoryUsage || 0).toFixed(1)}%
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
                        {alert.link && (
                          <ListItemSecondaryAction>
                            <Button size="small" color="error" onClick={() => navigate(alert.link)}>
                              Review
                            </Button>
                          </ListItemSecondaryAction>
                        )}
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
                          {Number(system_health.cpu?.usage_percent || realTimeData.cpuUsage || 0).toFixed(1)}%
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

        {/* Top Borrowed Books & Most Active Users */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Top Borrowed Books */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LibraryBooks color="primary" />
                  Top Borrowed Books
                </Typography>
                {system_overview.top_borrowed_books && system_overview.top_borrowed_books.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Author</TableCell>
                          <TableCell align="center">Borrows</TableCell>
                          <TableCell align="center">Available</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {system_overview.top_borrowed_books.slice(0, 5).map((book, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {book.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {book.category}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {book.author}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={book.borrow_count} 
                                size="small" 
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {book.available_copies}/{book.total_copies}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LibraryBooks sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No borrowing data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Most Active Users */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <People color="secondary" />
                  Most Active Users
                </Typography>
                {system_overview.most_active_users && system_overview.most_active_users.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell align="center">Total Loans</TableCell>
                          <TableCell align="center">Current</TableCell>
                          <TableCell align="center">Last Login</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {system_overview.most_active_users.slice(0, 5).map((user, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                                  {user.full_name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {user.full_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.user_id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={user.total_loans} 
                                size="small" 
                                color="secondary"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2">
                                {user.current_loans}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="text.secondary">
                                {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No user activity data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* System Health Indicators */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HealthAndSafety color="success" />
                  System Health Indicators
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {system_overview.health_indicators?.book_availability_rate || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Book Availability Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={system_overview.health_indicators?.book_availability_rate || 0}
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {system_overview.health_indicators?.overdue_rate || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Overdue Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={system_overview.health_indicators?.overdue_rate || 0}
                        color="warning"
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {system_overview.health_indicators?.fine_collection_rate || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fine Collection Rate
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={system_overview.health_indicators?.fine_collection_rate || 0}
                        color="success"
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {system_overview.health_indicators?.reservation_fulfillment_rate || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reservation Fulfillment
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={system_overview.health_indicators?.reservation_fulfillment_rate || 0}
                        color="info"
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activities */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
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
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Action</TableCell>
                            <TableCell>Details</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {safeRecentActivities
                            .slice(activitiesPage * activitiesRowsPerPage, activitiesPage * activitiesRowsPerPage + activitiesRowsPerPage)
                            .map((activity, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {getActivityIcon(activity.action)}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(activity.timestamp || Date.now()).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 28, height: 28, fontSize: 13, bgcolor: 'primary.main' }}>
                                    {(activity.user_name || 'U').charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Typography variant="body2" fontWeight={500}>
                                    {activity.user_name || 'System'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={activity.action || 'Unknown'} 
                                  size="small" 
                                  variant="outlined"
                                  color={
                                    activity.action?.includes('Login') ? 'primary' : 
                                    activity.action?.includes('Added') ? 'success' :
                                    activity.action?.includes('Paid') ? 'info' :
                                    'default'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                                  {activity.details || 'No details available'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={activity.status || 'Success'} 
                                  size="small"
                                  color={getStatusColor(activity.status)}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      component="div"
                      count={safeRecentActivities.length}
                      rowsPerPage={activitiesRowsPerPage}
                      page={activitiesPage}
                      onPageChange={(event, newPage) => setActivitiesPage(newPage)}
                      onRowsPerPageChange={(event) => {
                        setActivitiesRowsPerPage(parseInt(event.target.value, 10));
                        setActivitiesPage(0);
                      }}
                    />
                  </>
                )}
              </CardContent>
            </Card>
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
                        control={<Switch 
                          checked={systemSettings.performance.caching_enabled} 
                          onChange={(e) => handleSettingChange('performance', 'caching_enabled', e.target.checked)}
                        />}
                        label="Enable System Caching"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.performance.auto_optimization} 
                          onChange={(e) => handleSettingChange('performance', 'auto_optimization', e.target.checked)}
                        />}
                        label="Auto Performance Optimization"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.performance.debug_mode} 
                          onChange={(e) => handleSettingChange('performance', 'debug_mode', e.target.checked)}
                        />}
                        label="Debug Mode"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.performance.query_optimization} 
                          onChange={(e) => handleSettingChange('performance', 'query_optimization', e.target.checked)}
                        />}
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
                        value={systemSettings.performance.memory_limit_mb}
                        onChange={(e) => handleSettingChange('performance', 'memory_limit_mb', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Max Execution Time (seconds)"
                        type="number"
                        value={systemSettings.performance.max_execution_time}
                        onChange={(e) => handleSettingChange('performance', 'max_execution_time', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Upload Max Size (MB)"
                        type="number"
                        value={systemSettings.performance.upload_max_size_mb}
                        onChange={(e) => handleSettingChange('performance', 'upload_max_size_mb', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.performance.compression_enabled} 
                          onChange={(e) => handleSettingChange('performance', 'compression_enabled', e.target.checked)}
                        />}
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
                <Grid item xs={12}>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'error.lighter', p: 2 }}>
                        <Typography variant="subtitle2" color="error.main">Failed Logins (24h)</Typography>
                        <Typography variant="h4" fontWeight={700}>{security_status.failed_logins_24h || 0}</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'warning.lighter', p: 2 }}>
                        <Typography variant="subtitle2" color="warning.main">Suspicious IPs</Typography>
                        <Typography variant="h4" fontWeight={700}>{security_status.suspicious_ips || 0}</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'info.lighter', p: 2 }}>
                        <Typography variant="subtitle2" color="info.main">Inactive Admins</Typography>
                        <Typography variant="h4" fontWeight={700}>{security_status.inactive_admins || 0}</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card sx={{ bgcolor: 'success.lighter', p: 2 }}>
                        <Typography variant="subtitle2" color="success.main">Blocked IPs</Typography>
                        <Typography variant="h4" fontWeight={700}>{security_status.blocked_ips || 0}</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security color="error" />
                        Authentication & Access
                      </Typography>
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.security.two_factor_auth} 
                          onChange={(e) => handleSettingChange('security', 'two_factor_auth', e.target.checked)}
                        />}
                        label="Two-Factor Authentication"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.security.login_monitoring} 
                          onChange={(e) => handleSettingChange('security', 'login_monitoring', e.target.checked)}
                        />}
                        label="Login Monitoring"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.security.ip_restrictions} 
                          onChange={(e) => handleSettingChange('security', 'ip_restrictions', e.target.checked)}
                        />}
                        label="IP Address Restrictions"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Max Login Attempts"
                        type="number"
                        value={systemSettings.security.max_login_attempts}
                        onChange={(e) => handleSettingChange('security', 'max_login_attempts', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Session Timeout (minutes)"
                        type="number"
                        value={systemSettings.security.session_timeout_minutes}
                        onChange={(e) => handleSettingChange('security', 'session_timeout_minutes', parseInt(e.target.value))}
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
                        control={<Switch 
                          checked={systemSettings.security.failed_login_alerts} 
                          onChange={(e) => handleSettingChange('security', 'failed_login_alerts', e.target.checked)}
                        />}
                        label="Failed Login Alerts"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.security.suspicious_activity_detection} 
                          onChange={(e) => handleSettingChange('security', 'suspicious_activity_detection', e.target.checked)}
                        />}
                        label="Suspicious Activity Detection"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.security.realtime_security_scanning} 
                          onChange={(e) => handleSettingChange('security', 'realtime_security_scanning', e.target.checked)}
                        />}
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
                        sx={{ mt: 2, mr: 1 }}
                      >
                        Run Security Scan
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Security />}
                        onClick={() => navigate('/super-admin/security')}
                        sx={{ mt: 2 }}
                      >
                        Open Security Center
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
                        control={<Switch 
                          checked={systemSettings.notifications.email_notifications} 
                          onChange={(e) => handleSettingChange('notifications', 'email_notifications', e.target.checked)}
                        />}
                        label="Email Notifications"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.notifications.sms_alerts} 
                          onChange={(e) => handleSettingChange('notifications', 'sms_alerts', e.target.checked)}
                        />}
                        label="SMS Alerts"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.notifications.system_alerts} 
                          onChange={(e) => handleSettingChange('notifications', 'system_alerts', e.target.checked)}
                        />}
                        label="System Alerts"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.notifications.push_notifications} 
                          onChange={(e) => handleSettingChange('notifications', 'push_notifications', e.target.checked)}
                        />}
                        label="Push Notifications"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Admin Email"
                        type="email"
                        value={systemSettings.notifications.admin_email}
                        onChange={(e) => handleSettingChange('notifications', 'admin_email', e.target.value)}
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
                        value={systemSettings.notifications.cpu_usage_alert_threshold}
                        onChange={(e) => handleSettingChange('notifications', 'cpu_usage_alert_threshold', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Memory Usage Alert (%)"
                        type="number"
                        value={systemSettings.notifications.memory_usage_alert_threshold}
                        onChange={(e) => handleSettingChange('notifications', 'memory_usage_alert_threshold', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Disk Usage Alert (%)"
                        type="number"
                        value={systemSettings.notifications.disk_usage_alert_threshold}
                        onChange={(e) => handleSettingChange('notifications', 'disk_usage_alert_threshold', parseInt(e.target.value))}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Failed Login Threshold"
                        type="number"
                        value={systemSettings.notifications.failed_login_threshold}
                        onChange={(e) => handleSettingChange('notifications', 'failed_login_threshold', parseInt(e.target.value))}
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
                <Grid item xs={12}>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ bgcolor: 'success.lighter', p: 2 }}>
                        <Typography variant="subtitle2" color="success.main">Last Backup</Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {backup_status.last_backup ? new Date(backup_status.last_backup).toLocaleString() : 'Never'}
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ bgcolor: backup_status.backup_enabled ? 'success.lighter' : 'error.lighter', p: 2 }}>
                        <Typography variant="subtitle2" color={backup_status.backup_enabled ? 'success.main' : 'error.main'}>
                          Auto Backup Status
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {backup_status.backup_enabled ? 'Active' : 'Disabled'}
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Backup color="success" />
                        Backup Management
                      </Typography>
                      <FormControlLabel
                        control={<Switch 
                          checked={systemSettings.backup.automatic_backups} 
                          onChange={(e) => handleSettingChange('backup', 'automatic_backups', e.target.checked)}
                        />}
                        label="Automatic Backups"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Backup Frequency"
                        select
                        value={systemSettings.backup.backup_frequency}
                        onChange={(e) => handleSettingChange('backup', 'backup_frequency', e.target.value)}
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
                        value={systemSettings.backup.backup_retention_days}
                        onChange={(e) => handleSettingChange('backup', 'backup_retention_days', parseInt(e.target.value))}
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
                        control={<Switch 
                          checked={systemSettings.backup.detailed_logging} 
                          onChange={(e) => handleSettingChange('backup', 'detailed_logging', e.target.checked)}
                        />}
                        label="Enable Detailed Logging"
                        sx={{ display: 'block', mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Log Level"
                        select
                        value={systemSettings.backup.log_level}
                        onChange={(e) => handleSettingChange('backup', 'log_level', e.target.value)}
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
                        value={systemSettings.backup.log_retention_days}
                        onChange={(e) => handleSettingChange('backup', 'log_retention_days', parseInt(e.target.value))}
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
              onClick={handleSaveSettings}
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



      </Box>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
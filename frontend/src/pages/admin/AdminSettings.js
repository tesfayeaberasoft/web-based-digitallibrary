import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  CircularProgress,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Save,
  Settings,
  Security,
  Notifications,
  Storage,
  Backup,
  RestoreFromTrash,
  Delete,
  Add,
  Edit,
  Visibility,
  VisibilityOff,
  Email,
  Sms,
  Schedule,
  Warning,
  CheckCircle,
  Error,
  Info,
  CloudUpload,
  Download,
  Refresh,
  ExpandMore,
  AdminPanelSettings,
  NetworkCheck,
  Speed,
  Memory,
  BugReport,
  Analytics,
  ColorLens,
  Language,
  AccessTime,
  Group,
  Book,
  AttachMoney,
  Tune,
  Shield,
  VpnKey,
  Lock,
  Public,
  Business,
  Phone,
  LocationOn,
  Web,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Search,
  // Enhanced icons for better visual appeal
  LibraryBooks,
  School,
  ContactMail,
  Schedule as ScheduleIcon,
  SocialDistance,
  Palette,
  Code,
  Brightness4,
  Brightness7,
  AutoAwesome,
  BrandingWatermark,
  FileUpload,
  MonitorHeart,
  HealthAndSafety,
  SystemUpdateAlt,
  CleaningServices,
  SearchOff,
  Assessment,
  CloudDownload,
  InfoOutlined,
  VerifiedUser,
  LockClock,
  DataUsage,
  HttpsLock,
  BackupTable,
  RestoreIcon,
  NotificationImportant,
  MarkEmailRead,
  TextSms,
  PushPin,
  AlarmOn,
  EventAvailable,
  NewReleases,
  SystemSecurityUpdate,
  EmailOutlined,
  SmsOutlined,
  NotificationsActive,
  AlarmAdd,
  EventNote,
  ReportProblem,
  TrendingUp,
  Insights,
  Dashboard as DashboardIcon,
  MonitorWeight,
  SpeedIcon,
  StorageIcon,
  TimerIcon,
  PeopleAlt,
  MenuBook,
  BookOnline,
  CalendarToday
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState('');
  const { hasRole } = useAuth();
  const isSuperAdmin = hasRole('super-admin');
  
  // Library Settings
  const [librarySettings, setLibrarySettings] = useState({
    libraryName: 'Digital Library Management System',
    description: 'A comprehensive digital library management solution',
    address: '123 Library Street, Education City',
    phone: '+1 (555) 123-4567',
    email: 'info@digitallibrary.com',
    website: 'https://digitallibrary.com',
    // Library Policy Settings
    maxUserBorrowBooks: 5,
    dueFinesPerDay: 0.50,
    maxBookReturnDays: 14,
    operatingHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    socialMedia: {
      facebook: 'https://facebook.com/digitallibrary',
      twitter: 'https://twitter.com/digitallibrary',
      instagram: 'https://instagram.com/digitallibrary',
      linkedin: 'https://linkedin.com/company/digitallibrary'
    }
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maxBorrowDays: 30,
    finePerDay: 0.50,
    maxBooksPerUser: 5,
    maxReservationsPerUser: 3,
    reservationHoldDays: 7,
    renewalLimit: 2,
    gracePeriodDays: 3,
    autoRenewal: true,
    emailNotifications: true,
    smsNotifications: false,
    overdueNotificationDays: [1, 3, 7],
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 60,
    passwordMinLength: 6,
    passwordRequireSpecial: false,
    twoFactorAuth: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    overdueReminders: true,
    reservationAlerts: true,
    newBookNotifications: true,
    systemAlerts: true,
    emailTemplates: {
      welcome: 'Welcome to our Digital Library!',
      overdue: 'You have overdue books. Please return them.',
      reservation: 'Your reserved book is now available.',
      renewal: 'Your book loan has been renewed.'
    },
    notificationSchedule: {
      overdueCheck: '09:00',
      reservationCheck: '10:00',
      dailyReport: '18:00'
    }
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    loginAttempts: 5,
    lockoutDuration: 30,
    passwordExpiry: 90,
    sessionSecurity: true,
    ipWhitelist: [],
    auditLogging: true,
    dataEncryption: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    apiRateLimit: 100,
    corsEnabled: true,
    httpsOnly: true
  });

  // System Status
  const [systemStatus, setSystemStatus] = useState({
    database: { status: 'healthy', lastCheck: new Date(), responseTime: 45 },
    storage: { used: 2.3, total: 10, unit: 'GB' },
    memory: { used: 65, total: 100, unit: '%' },
    cpu: { usage: 23, unit: '%' },
    activeUsers: 142,
    totalBooks: 15847,
    totalLibrarians: 0,
    messages: 0,
    activeLoans: 892,
    overdueBooks: 23,
    systemUptime: '15 days, 7 hours',
    lastBackup: new Date(Date.now() - 86400000), // 1 day ago
    version: '2.1.0',
    environment: 'production'
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: '#4a9b8e',
    secondaryColor: '#66bb6a',
    logo: null,
    favicon: null,
    customCSS: '',
    showBranding: true,
    compactMode: false,
    animationsEnabled: true
  });

  useEffect(() => {
    loadSettings();
    loadOverview();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const settings = response.data.settings;
        
        // Update library settings (combine basic info and policies)
        if (settings.library || settings.library_policies) {
          const basicInfo = settings.library || {};
          const policies = settings.library_policies || {};
          
          setLibrarySettings(prev => ({
            ...prev,
            ...basicInfo,
            ...(isSuperAdmin ? {
              maxUserBorrowBooks: policies.max_user_borrow_books || prev.maxUserBorrowBooks,
              dueFinesPerDay: policies.due_fines_per_day || prev.dueFinesPerDay,
              maxBookReturnDays: policies.max_book_return_days || prev.maxBookReturnDays
            } : {})
          }));
        }

        // Update system settings
        if (isSuperAdmin && settings.system) {
          setSystemSettings(prev => ({
            ...prev,
            ...settings.system
          }));
        }

        // Update notification settings
        if (isSuperAdmin && settings.notifications) {
          setNotificationSettings(prev => ({
            ...prev,
            ...settings.notifications
          }));
        }

        // Update security settings
        if (isSuperAdmin && settings.security) {
          setSecuritySettings(prev => ({
            ...prev,
            ...settings.security
          }));
        }

        // Update appearance settings
        if (isSuperAdmin && settings.appearance) {
          setAppearanceSettings(prev => ({
            ...prev,
            ...settings.appearance
          }));
        }

        setSuccess('Settings loaded successfully');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings from server');
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const [statsResponse, notificationsResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.get('http://localhost:8000/api/notifications?limit=1', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (statsResponse.data?.success && statsResponse.data?.stats) {
        const overview = statsResponse.data.stats.overview || {};
        const byRole = Array.isArray(statsResponse.data.stats.users_by_role) ? statsResponse.data.stats.users_by_role : [];
        const librarian = byRole.find((r) => String(r.role).toLowerCase() === 'librarian');

        setSystemStatus((prev) => ({
          ...prev,
          activeUsers: overview.total_users ?? prev.activeUsers,
          totalBooks: overview.total_books ?? prev.totalBooks,
          totalLibrarians: librarian ? Number(librarian.count) : prev.totalLibrarians
        }));
      }

      if (notificationsResponse.data?.success) {
        setSystemStatus((prev) => ({
          ...prev,
          messages: notificationsResponse.data.unread_count ?? prev.messages
        }));
      }
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLibrarySettingChange = (field, value) => {
    setLibrarySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSystemSettingChange = (field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationSettingChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSecuritySettingChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAppearanceSettingChange = (field, value) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setLibrarySettings(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setLibrarySettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSaveSettings = async (settingsType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      let settingsData;
      let category;
      
      switch (settingsType) {
        case 'library':
          // Split library settings into basic info and policies
          const { maxUserBorrowBooks, dueFinesPerDay, maxBookReturnDays, ...basicLibraryInfo } = librarySettings;
          
          if (!isSuperAdmin) {
            const response = await axios.post('http://localhost:8000/api/admin/settings', {
              category: 'library',
              settings: basicLibraryInfo
            }, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.data.success) {
              setSuccess('Library info saved successfully!');
              await loadSettings();
            } else {
              throw new Error('Failed to save library info');
            }
            return;
          }

          // Save basic library info
          const libraryInfoResponse = await axios.post('http://localhost:8000/api/admin/settings', {
            category: 'library',
            settings: basicLibraryInfo
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          // Save library policies separately
          const libraryPoliciesResponse = await axios.post('http://localhost:8000/api/admin/settings', {
            category: 'library_policies',
            settings: {
              max_user_borrow_books: maxUserBorrowBooks,
              due_fines_per_day: dueFinesPerDay,
              max_book_return_days: maxBookReturnDays
            }
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (libraryInfoResponse.data.success && libraryPoliciesResponse.data.success) {
            setSuccess('Library settings saved successfully!');
            await loadSettings();
          } else {
            throw new Error('Failed to save library settings');
          }
          return;
          
        case 'system':
          settingsData = systemSettings;
          category = 'system';
          break;
        case 'notifications':
          settingsData = notificationSettings;
          category = 'notifications';
          break;
        case 'security':
          settingsData = securitySettings;
          category = 'security';
          break;
        case 'appearance':
          settingsData = appearanceSettings;
          category = 'appearance';
          break;
        default:
          throw new Error('Invalid settings type');
      }

      const response = await axios.post('http://localhost:8000/api/admin/settings', {
        category: category,
        settings: settingsData
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved successfully!`);
        
        // Reload settings to ensure consistency
        await loadSettings();
      } else {
        throw new Error(response.data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error(`Failed to save ${settingsType} settings:`, err);
      setError(err.response?.data?.message || `Failed to save ${settingsType} settings`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/admin/maintenance', {
        action: 'backup'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(`Database backup completed successfully! File: ${response.data.backup_file}`);
      } else {
        throw new Error(response.data.message || 'Backup failed');
      }
    } catch (err) {
      console.error('Backup failed:', err);
      setError(err.response?.data?.message || 'Failed to backup database');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemMaintenance = async (action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/admin/maintenance', {
        action: action
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        switch (action) {
          case 'clearCache':
            setSuccess(`System cache cleared successfully! ${response.data.files_cleared} files cleared.`);
            break;
          case 'optimizeDb':
            setSuccess(`Database optimized successfully! ${response.data.tables_optimized} tables optimized.`);
            break;
          case 'updateIndex':
            setSuccess(`Search index updated successfully! Books: ${response.data.books_updated}, Users: ${response.data.users_updated}`);
            break;
          case 'exportLogs':
            setSuccess(`System logs exported successfully! File: ${response.data.export_file}`);
            break;
          case 'generateReport':
            setSuccess(`System report generated successfully! File: ${response.data.report_file}`);
            break;
          default:
            setSuccess('Maintenance task completed successfully!');
        }
      } else {
        throw new Error(response.data.message || 'Maintenance task failed');
      }
    } catch (err) {
      console.error(`Maintenance action ${action} failed:`, err);
      setError(err.response?.data?.message || `Failed to ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
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

  // Library Settings Tab
  const renderLibrarySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
          <LibraryBooks sx={{ mr: 1, verticalAlign: 'middle', fontSize: 28 }} />
          Library Information
        </Typography>
      </Grid>
      
      {/* Basic Information */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Library Name"
          value={librarySettings.libraryName}
          onChange={(e) => handleLibrarySettingChange('libraryName', e.target.value)}
          InputProps={{
            startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Email Address"
          value={librarySettings.email}
          onChange={(e) => handleLibrarySettingChange('email', e.target.value)}
          InputProps={{
            startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={librarySettings.phone}
          onChange={(e) => handleLibrarySettingChange('phone', e.target.value)}
          InputProps={{
            startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Website"
          value={librarySettings.website}
          onChange={(e) => handleLibrarySettingChange('website', e.target.value)}
          InputProps={{
            startAdornment: <Web sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={librarySettings.description}
          onChange={(e) => handleLibrarySettingChange('description', e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Address"
          multiline
          rows={2}
          value={librarySettings.address}
          onChange={(e) => handleLibrarySettingChange('address', e.target.value)}
          InputProps={{
            startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Grid>

      {isSuperAdmin && (
        <>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <LibraryBooks sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
              Library Policies
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Maximum Books Per User"
              type="number"
              value={librarySettings.maxUserBorrowBooks}
              onChange={(e) => handleLibrarySettingChange('maxUserBorrowBooks', parseInt(e.target.value) || 0)}
              InputProps={{
                startAdornment: <MenuBook sx={{ mr: 1, color: 'text.secondary' }} />,
                inputProps: { min: 1, max: 20 }
              }}
              helperText="Maximum number of books a user can borrow at once"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Fine Per Day (USD)"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={librarySettings.dueFinesPerDay}
              onChange={(e) => handleLibrarySettingChange('dueFinesPerDay', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              helperText="Daily fine amount for overdue books"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Maximum Return Days"
              type="number"
              value={librarySettings.maxBookReturnDays}
              onChange={(e) => handleLibrarySettingChange('maxBookReturnDays', parseInt(e.target.value) || 0)}
              InputProps={{
                startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />,
                inputProps: { min: 1, max: 365 }
              }}
              helperText="Maximum days allowed for book return"
            />
          </Grid>
        </>
      )}

      {/* Operating Hours */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          <AccessTime sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          Operating Hours
        </Typography>
      </Grid>
      {Object.entries(librarySettings.operatingHours).map(([day, hours]) => (
        <Grid item xs={12} key={day}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                  {day}
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!hours.closed}
                      onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                    />
                  }
                  label="Open"
                />
              </Grid>
              {!hours.closed && (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Open Time"
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Close Time"
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Card>
        </Grid>
      ))}

      {/* Social Media */}
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          <SocialDistance sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          Social Media Links
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Facebook"
          value={librarySettings.socialMedia.facebook}
          onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
          InputProps={{
            startAdornment: <Facebook sx={{ mr: 1, color: '#1877f2' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Twitter"
          value={librarySettings.socialMedia.twitter}
          onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
          InputProps={{
            startAdornment: <Twitter sx={{ mr: 1, color: '#1da1f2' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Instagram"
          value={librarySettings.socialMedia.instagram}
          onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
          InputProps={{
            startAdornment: <Instagram sx={{ mr: 1, color: '#e4405f' }} />
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="LinkedIn"
          value={librarySettings.socialMedia.linkedin}
          onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
          InputProps={{
            startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077b5' }} />
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => handleSaveSettings('library')}
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Library Settings'}
        </Button>
      </Grid>
    </Grid>
  );

  // System Settings Tab
  const renderSystemSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
          <Settings sx={{ mr: 1, verticalAlign: 'middle', fontSize: 28 }} />
          System Configuration
        </Typography>
      </Grid>

      {/* Loan Settings */}
      <Grid item xs={12}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <LibraryBooks sx={{ mr: 1, verticalAlign: 'middle' }} />
              Loan Settings
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Maximum Borrow Days"
                  type="number"
                  value={systemSettings.maxBorrowDays}
                  onChange={(e) => handleSystemSettingChange('maxBorrowDays', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fine Per Day (USD)"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={systemSettings.finePerDay}
                  onChange={(e) => handleSystemSettingChange('finePerDay', parseFloat(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Maximum Books Per User"
                  type="number"
                  value={systemSettings.maxBooksPerUser}
                  onChange={(e) => handleSystemSettingChange('maxBooksPerUser', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Maximum Reservations Per User"
                  type="number"
                  value={systemSettings.maxReservationsPerUser}
                  onChange={(e) => handleSystemSettingChange('maxReservationsPerUser', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Reservation Hold Days"
                  type="number"
                  value={systemSettings.reservationHoldDays}
                  onChange={(e) => handleSystemSettingChange('reservationHoldDays', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Renewal Limit"
                  type="number"
                  value={systemSettings.renewalLimit}
                  onChange={(e) => handleSystemSettingChange('renewalLimit', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.autoRenewal}
                      onChange={(e) => handleSystemSettingChange('autoRenewal', e.target.checked)}
                    />
                  }
                  label="Enable Auto-Renewal"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* User Registration */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <Group sx={{ mr: 1, verticalAlign: 'middle' }} />
              User Registration
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.allowRegistration}
                      onChange={(e) => handleSystemSettingChange('allowRegistration', e.target.checked)}
                    />
                  }
                  label="Allow New User Registration"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.requireEmailVerification}
                      onChange={(e) => handleSystemSettingChange('requireEmailVerification', e.target.checked)}
                    />
                  }
                  label="Require Email Verification"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={systemSettings.sessionTimeout}
                  onChange={(e) => handleSystemSettingChange('sessionTimeout', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password Minimum Length"
                  type="number"
                  value={systemSettings.passwordMinLength}
                  onChange={(e) => handleSystemSettingChange('passwordMinLength', parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* System Features */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <Tune sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Features
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => handleSystemSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.smsNotifications}
                      onChange={(e) => handleSystemSettingChange('smsNotifications', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.twoFactorAuth}
                      onChange={(e) => handleSystemSettingChange('twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => handleSaveSettings('system')}
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save System Settings'}
        </Button>
      </Grid>
    </Grid>
  );
  // Notification Settings Tab
  const renderNotificationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
          <NotificationsActive sx={{ mr: 1, verticalAlign: 'middle', fontSize: 28 }} />
          Notification Configuration
        </Typography>
      </Grid>

      {/* Notification Channels */}
      <Grid item xs={12}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <Notifications sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notification Channels
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailEnabled}
                      onChange={(e) => handleNotificationSettingChange('emailEnabled', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsEnabled}
                      onChange={(e) => handleNotificationSettingChange('smsEnabled', e.target.checked)}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.pushEnabled}
                      onChange={(e) => handleNotificationSettingChange('pushEnabled', e.target.checked)}
                    />
                  }
                  label="Push Notifications"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Notification Types */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <EventNote sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notification Types
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.overdueReminders}
                      onChange={(e) => handleNotificationSettingChange('overdueReminders', e.target.checked)}
                    />
                  }
                  label="Overdue Reminders"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.reservationAlerts}
                      onChange={(e) => handleNotificationSettingChange('reservationAlerts', e.target.checked)}
                    />
                  }
                  label="Reservation Alerts"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.newBookNotifications}
                      onChange={(e) => handleNotificationSettingChange('newBookNotifications', e.target.checked)}
                    />
                  }
                  label="New Book Notifications"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onChange={(e) => handleNotificationSettingChange('systemAlerts', e.target.checked)}
                    />
                  }
                  label="System Alerts"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Email Templates */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <EmailOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
              Email Templates
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Welcome Email"
                  multiline
                  rows={3}
                  value={notificationSettings.emailTemplates.welcome}
                  onChange={(e) => handleNotificationSettingChange('emailTemplates', {
                    ...notificationSettings.emailTemplates,
                    welcome: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Overdue Notice"
                  multiline
                  rows={3}
                  value={notificationSettings.emailTemplates.overdue}
                  onChange={(e) => handleNotificationSettingChange('emailTemplates', {
                    ...notificationSettings.emailTemplates,
                    overdue: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reservation Ready"
                  multiline
                  rows={3}
                  value={notificationSettings.emailTemplates.reservation}
                  onChange={(e) => handleNotificationSettingChange('emailTemplates', {
                    ...notificationSettings.emailTemplates,
                    reservation: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Renewal Confirmation"
                  multiline
                  rows={3}
                  value={notificationSettings.emailTemplates.renewal}
                  onChange={(e) => handleNotificationSettingChange('emailTemplates', {
                    ...notificationSettings.emailTemplates,
                    renewal: e.target.value
                  })}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Notification Schedule */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
              Notification Schedule
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Overdue Check Time"
                  type="time"
                  value={notificationSettings.notificationSchedule.overdueCheck}
                  onChange={(e) => handleNotificationSettingChange('notificationSchedule', {
                    ...notificationSettings.notificationSchedule,
                    overdueCheck: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Reservation Check Time"
                  type="time"
                  value={notificationSettings.notificationSchedule.reservationCheck}
                  onChange={(e) => handleNotificationSettingChange('notificationSchedule', {
                    ...notificationSettings.notificationSchedule,
                    reservationCheck: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Daily Report Time"
                  type="time"
                  value={notificationSettings.notificationSchedule.dailyReport}
                  onChange={(e) => handleNotificationSettingChange('notificationSchedule', {
                    ...notificationSettings.notificationSchedule,
                    dailyReport: e.target.value
                  })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => handleSaveSettings('notifications')}
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Notification Settings'}
        </Button>
      </Grid>
    </Grid>
  );

  // Security Settings Tab
  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
          <Security sx={{ mr: 1, verticalAlign: 'middle', fontSize: 28 }} />
          Security Configuration
        </Typography>
      </Grid>

      {/* Authentication Settings */}
      <Grid item xs={12}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <VpnKey sx={{ mr: 1, verticalAlign: 'middle' }} />
              Authentication
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  type="number"
                  value={securitySettings.loginAttempts}
                  onChange={(e) => handleSecuritySettingChange('loginAttempts', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Lockout Duration (minutes)"
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => handleSecuritySettingChange('lockoutDuration', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Password Expiry (days)"
                  type="number"
                  value={securitySettings.passwordExpiry}
                  onChange={(e) => handleSecuritySettingChange('passwordExpiry', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.sessionSecurity}
                      onChange={(e) => handleSecuritySettingChange('sessionSecurity', e.target.checked)}
                    />
                  }
                  label="Enhanced Session Security"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Data Protection */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <Shield sx={{ mr: 1, verticalAlign: 'middle' }} />
              Data Protection
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.auditLogging}
                      onChange={(e) => handleSecuritySettingChange('auditLogging', e.target.checked)}
                    />
                  }
                  label="Audit Logging"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.dataEncryption}
                      onChange={(e) => handleSecuritySettingChange('dataEncryption', e.target.checked)}
                    />
                  }
                  label="Data Encryption"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.corsEnabled}
                      onChange={(e) => handleSecuritySettingChange('corsEnabled', e.target.checked)}
                    />
                  }
                  label="CORS Enabled"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.httpsOnly}
                      onChange={(e) => handleSecuritySettingChange('httpsOnly', e.target.checked)}
                    />
                  }
                  label="HTTPS Only"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Backup Settings */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <Backup sx={{ mr: 1, verticalAlign: 'middle' }} />
              Backup Settings
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={securitySettings.backupFrequency}
                    label="Backup Frequency"
                    onChange={(e) => handleSecuritySettingChange('backupFrequency', e.target.value)}
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Backup Retention (days)"
                  type="number"
                  value={securitySettings.backupRetention}
                  onChange={(e) => handleSecuritySettingChange('backupRetention', parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => handleSaveSettings('security')}
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Security Settings'}
        </Button>
      </Grid>
    </Grid>
  );
  // Appearance Settings Tab
  const renderAppearanceSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
          <Palette sx={{ mr: 1, verticalAlign: 'middle', fontSize: 28 }} />
          Appearance & Branding
        </Typography>
      </Grid>

      {/* Theme Settings */}
      <Grid item xs={12}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <ColorLens sx={{ mr: 1, verticalAlign: 'middle' }} />
              Theme Configuration
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Theme Mode</InputLabel>
                  <Select
                    value={appearanceSettings.theme}
                    label="Theme Mode"
                    onChange={(e) => handleAppearanceSettingChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Primary Color"
                  type="color"
                  value={appearanceSettings.primaryColor}
                  onChange={(e) => handleAppearanceSettingChange('primaryColor', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Secondary Color"
                  type="color"
                  value={appearanceSettings.secondaryColor}
                  onChange={(e) => handleAppearanceSettingChange('secondaryColor', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={appearanceSettings.animationsEnabled}
                      onChange={(e) => handleAppearanceSettingChange('animationsEnabled', e.target.checked)}
                    />
                  }
                  label="Enable Animations"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={appearanceSettings.compactMode}
                      onChange={(e) => handleAppearanceSettingChange('compactMode', e.target.checked)}
                    />
                  }
                  label="Compact Mode"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Branding */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <BrandingWatermark sx={{ mr: 1, verticalAlign: 'middle' }} />
              Branding
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={appearanceSettings.showBranding}
                      onChange={(e) => handleAppearanceSettingChange('showBranding', e.target.checked)}
                    />
                  }
                  label="Show Library Branding"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload Logo
                  <input type="file" hidden accept="image/*" />
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload Favicon
                  <input type="file" hidden accept="image/*" />
                </Button>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Grid>

      {/* Custom CSS */}
      <Grid item xs={12}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={600}>
              <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
              Custom CSS
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              label="Custom CSS"
              multiline
              rows={10}
              value={appearanceSettings.customCSS}
              onChange={(e) => handleAppearanceSettingChange('customCSS', e.target.value)}
              placeholder="/* Add your custom CSS here */"
              sx={{ fontFamily: 'monospace' }}
            />
          </AccordionDetails>
        </Accordion>
      </Grid>

      <Grid item xs={12}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => handleSaveSettings('appearance')}
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Appearance Settings'}
        </Button>
      </Grid>
    </Grid>
  );

  // Maintenance Settings Tab
  const renderMaintenanceSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
          <Tune sx={{ mr: 1, verticalAlign: 'middle', fontSize: 28 }} />
          System Maintenance
        </Typography>
      </Grid>

      {/* System Status */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <MonitorHeart sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Storage color={getStatusColor(systemStatus.database.status)} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Database"
                      secondary={`Status: ${systemStatus.database.status} | Response: ${systemStatus.database.responseTime}ms`}
                    />
                    <Chip
                      label={systemStatus.database.status}
                      color={getStatusColor(systemStatus.database.status)}
                      size="small"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Memory />
                    </ListItemIcon>
                    <ListItemText
                      primary="Memory Usage"
                      secondary={`${systemStatus.memory.used}% of ${systemStatus.memory.total}%`}
                    />
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={systemStatus.memory.used}
                        color={systemStatus.memory.used > 80 ? 'error' : 'primary'}
                      />
                    </Box>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Speed />
                    </ListItemIcon>
                    <ListItemText
                      primary="CPU Usage"
                      secondary={`${systemStatus.cpu.usage}%`}
                    />
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={systemStatus.cpu.usage}
                        color={systemStatus.cpu.usage > 70 ? 'warning' : 'success'}
                      />
                    </Box>
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Storage />
                    </ListItemIcon>
                    <ListItemText
                      primary="Storage"
                      secondary={`${systemStatus.storage.used} GB / ${systemStatus.storage.total} GB`}
                    />
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(systemStatus.storage.used / systemStatus.storage.total) * 100}
                        color="info"
                      />
                    </Box>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Backup />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Backup"
                      secondary={systemStatus.lastBackup.toLocaleDateString()}
                    />
                    <Chip
                      label="Healthy"
                      color="success"
                      size="small"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime />
                    </ListItemIcon>
                    <ListItemText
                      primary="System Uptime"
                      secondary={systemStatus.systemUptime}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Maintenance Actions */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <Tune sx={{ mr: 1, verticalAlign: 'middle' }} />
              Maintenance Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Backup />}
                  onClick={handleBackupDatabase}
                  disabled={loading}
                >
                  Backup Database
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => handleSystemMaintenance('clearCache')}
                  disabled={loading}
                >
                  Clear Cache
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Tune />}
                  onClick={() => handleSystemMaintenance('optimizeDb')}
                  disabled={loading}
                >
                  Optimize Database
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Search />}
                  onClick={() => handleSystemMaintenance('updateIndex')}
                  disabled={loading}
                >
                  Update Search Index
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => handleSystemMaintenance('exportLogs')}
                  disabled={loading}
                >
                  Export System Logs
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Analytics />}
                  onClick={() => handleSystemMaintenance('generateReport')}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* System Information */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <InfoOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
              System Information
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Version</strong></TableCell>
                    <TableCell>{systemStatus.version}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Environment</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={systemStatus.environment} 
                        color={systemStatus.environment === 'production' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Active Users</strong></TableCell>
                    <TableCell>{systemStatus.activeUsers}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Total Books</strong></TableCell>
                    <TableCell>{systemStatus.totalBooks.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Active Loans</strong></TableCell>
                    <TableCell>{systemStatus.activeLoans}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Overdue Books</strong></TableCell>
                    <TableCell>
                      <Chip 
                        label={systemStatus.overdueBooks} 
                        color={systemStatus.overdueBooks > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom sx={{ 
              background: 'linear-gradient(45deg, #4a9b8e 30%, #2c5f5a 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <Settings sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
              {isSuperAdmin ? 'System Settings' : 'Library Info'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {isSuperAdmin ? 'Configure and manage all system settings and preferences' : 'Update library information and view system summary'}
            </Typography>
          </Box>
          <Chip 
            label={`v${systemStatus.version}`} 
            color="primary" 
            variant="outlined"
            icon={<AdminPanelSettings />}
          />
        </Box>

        {/* System Status Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {isSuperAdmin ? (
            <>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.activeUsers}
                        </Typography>
                        <Typography variant="body2">Active Users</Typography>
                      </Box>
                      <Group sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.totalBooks.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">Total Books</Typography>
                      </Box>
                      <Book sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.storage.used}/{systemStatus.storage.total} GB
                        </Typography>
                        <Typography variant="body2">Storage Used</Typography>
                      </Box>
                      <Storage sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.systemUptime}
                        </Typography>
                        <Typography variant="body2">System Uptime</Typography>
                      </Box>
                      <AccessTime sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.activeUsers}
                        </Typography>
                        <Typography variant="body2">Active Users</Typography>
                      </Box>
                      <Group sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.totalBooks.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">Total Books</Typography>
                      </Box>
                      <Book sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.totalLibrarians}
                        </Typography>
                        <Typography variant="body2">Total Librarians</Typography>
                      </Box>
                      <PeopleAlt sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {systemStatus.messages}
                        </Typography>
                        <Typography variant="body2">Messages</Typography>
                      </Box>
                      <Notifications sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {isSuperAdmin ? (
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Business />} label="Library Info" />
              <Tab icon={<Settings />} label="System" />
              <Tab icon={<Notifications />} label="Notifications" />
              <Tab icon={<Security />} label="Security" />
              <Tab icon={<ColorLens />} label="Appearance" />
              <Tab icon={<Tune />} label="Maintenance" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && renderLibrarySettings()}
              {activeTab === 1 && renderSystemSettings()}
              {activeTab === 2 && renderNotificationSettings()}
              {activeTab === 3 && renderSecuritySettings()}
              {activeTab === 4 && renderAppearanceSettings()}
              {activeTab === 5 && renderMaintenanceSettings()}
            </Box>
          </Paper>
        ) : (
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ p: 3 }}>
              {renderLibrarySettings()}
            </Box>
          </Paper>
        )}

        {/* Success/Error Snackbar */}
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

export default AdminSettings;

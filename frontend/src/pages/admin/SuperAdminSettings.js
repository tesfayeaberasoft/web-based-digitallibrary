import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Settings,
  Save,
  Refresh,
  Security,
  Notifications,
  Speed,
  Backup,
  CleaningServices,
  Shield,
  Business,
  Email,
  Phone,
  LocationOn,
  Language,
  Tune,
  ColorLens,
  CheckCircle,
  Warning,
  Storage,
  People,
  MenuBook,
  Assignment,
  Build,
  RestartAlt,
  Download,
  BugReport,
  Lock,
  CloudUpload,
  AdminPanelSettings,
  PowerSettingsNew,
  Memory,
  MonitorHeart,
  History
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const API = 'http://localhost:8000/api';
const RED = '#d32f2f';
const GRADIENT = 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)';

const TAB_COLORS = ['#d32f2f', '#1976d2', '#ed6c02', '#9c27b0', '#2e7d32', '#00838f', '#5d4037'];

const SettingSwitch = ({ label, description, checked, onChange, color = 'error' }) => (
  <Paper variant="outlined" sx={{ p: 2, mb: 1.5, borderRadius: 2, '&:hover': { borderColor: RED, bgcolor: '#fff5f5' } }}>
    <FormControlLabel
      control={<Switch checked={checked} onChange={(e) => onChange(e.target.checked)} color={color} />}
      label={
        <Box>
          <Typography fontWeight={600}>{label}</Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      }
      sx={{ m: 0, width: '100%', justifyContent: 'space-between', ml: 0 }}
      labelPlacement="start"
    />
  </Paper>
);

const ActionCard = ({ title, description, icon, color, onClick, loading: busy }) => (
  <Card
    sx={{
      height: '100%',
      cursor: busy ? 'wait' : 'pointer',
      background: `linear-gradient(145deg, ${color}18, ${color}08)`,
      border: `1px solid ${color}44`,
      transition: 'all 0.25s',
      '&:hover': busy ? {} : { transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${color}33` }
    }}
    onClick={busy ? undefined : onClick}
  >
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Avatar sx={{ bgcolor: color, width: 56, height: 56, mx: 'auto', mb: 2 }}>{icon}</Avatar>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const SuperAdminSettings = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [health, setHealth] = useState(null);
  const [backups, setBackups] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState({ enabled: false });
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  const [library, setLibrary] = useState({
    libraryName: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: ''
  });
  const [policies, setPolicies] = useState({
    max_user_borrow_books: 5,
    due_fines_per_day: 0.5,
    max_book_return_days: 14
  });
  const [system, setSystem] = useState({
    maxBorrowDays: 30,
    finePerDay: 0.5,
    maxBooksPerUser: 5,
    allowRegistration: true,
    maintenanceMode: false,
    sessionTimeout: 60,
    passwordMinLength: 6,
    twoFactorAuth: false
  });
  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    overdueReminders: true,
    systemAlerts: true
  });
  const [security, setSecurity] = useState({
    loginAttempts: 5,
    lockoutDuration: 30,
    auditLogging: true,
    httpsOnly: true
  });
  const [appearance, setAppearance] = useState({
    primaryColor: '#4a9b8e',
    secondaryColor: '#66bb6a',
    theme: 'light',
    animationsEnabled: true
  });
  const [performance, setPerformance] = useState({
    caching_enabled: true,
    auto_optimization: true,
    debug_mode: false,
    memory_limit_mb: 512,
    upload_max_size_mb: 50
  });
  const [saSecurity, setSaSecurity] = useState({
    two_factor_auth: true,
    login_monitoring: true,
    max_login_attempts: 5,
    session_timeout_minutes: 60,
    failed_login_alerts: true
  });
  const [saNotifications, setSaNotifications] = useState({
    email_notifications: true,
    system_alerts: true,
    admin_email: 'admin@digitallibrary.com',
    cpu_usage_alert_threshold: 80
  });
  const [backupSettings, setBackupSettings] = useState({
    automatic_backups: true,
    backup_frequency: 'daily',
    backup_retention_days: 30,
    log_level: 'info'
  });

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [adminResult, saResult] = await Promise.allSettled([
        axios.get(`${API}/admin/settings`, { headers: authHeaders() }),
        axios.get(`${API}/super-admin/system-management`, { headers: authHeaders() })
      ]);

      if (adminResult.status === 'fulfilled' && adminResult.value.data?.success) {
        const s = adminResult.value.data.settings || {};
        if (s.library) setLibrary((p) => ({ ...p, ...s.library }));
        if (s.library_policies) {
          setPolicies((p) => ({
            ...p,
            max_user_borrow_books: s.library_policies.max_user_borrow_books ?? p.max_user_borrow_books,
            due_fines_per_day: s.library_policies.due_fines_per_day ?? p.due_fines_per_day,
            max_book_return_days: s.library_policies.max_book_return_days ?? p.max_book_return_days
          }));
        }
        if (s.system) setSystem((p) => ({ ...p, ...s.system }));
        if (s.notifications) setNotifications((p) => ({ ...p, ...s.notifications }));
        if (s.security) setSecurity((p) => ({ ...p, ...s.security }));
        if (s.appearance) setAppearance((p) => ({ ...p, ...s.appearance }));
      } else if (adminResult.status === 'rejected') {
        const msg = adminResult.reason?.response?.data?.message || adminResult.reason?.message;
        throw new Error(msg || 'Failed to load library settings');
      }

      if (saResult.status === 'fulfilled' && saResult.value.data?.success) {
        const d = saResult.value.data.data || {};
        if (d.performance) setPerformance((p) => ({ ...p, ...d.performance }));
        if (d.security) setSaSecurity((p) => ({ ...p, ...d.security }));
        if (d.notifications) setSaNotifications((p) => ({ ...p, ...d.notifications }));
        if (d.backup) setBackupSettings((p) => ({ ...p, ...d.backup }));
        setHealth(saResult.value.data.health || null);
        setBackups(saResult.value.data.backups || []);
        setMaintenanceMode(saResult.value.data.maintenance_mode || { enabled: false });
      } else if (saResult.status === 'rejected') {
        const msg = saResult.reason?.response?.data?.message || saResult.reason?.message;
        throw new Error(msg || 'Failed to load system management settings');
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveAdminCategory = async (category, settings) => {
    const res = await axios.post(`${API}/admin/settings`, { category, settings }, { headers: authHeaders() });
    if (!res.data.success) throw new Error(res.data.message);
  };

  const saveSuperAdminConfig = async () => {
    const payload = {
      performance,
      security: saSecurity,
      notifications: saNotifications,
      backup: backupSettings
    };
    const res = await axios.put(`${API}/super-admin/system-management`, payload, {
      headers: authHeaders()
    });
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to save system config');
  };

  const handleSaveTab = async () => {
    setSaving(true);
    setError('');
    try {
      switch (tab) {
        case 0:
          await saveAdminCategory('library', library);
          await saveAdminCategory('library_policies', policies);
          break;
        case 1:
          await saveAdminCategory('library_policies', policies);
          break;
        case 2:
          await saveAdminCategory('notifications', notifications);
          await saveSuperAdminConfig();
          break;
        case 3:
          await saveAdminCategory('security', security);
          await saveSuperAdminConfig();
          break;
        case 4:
          await saveAdminCategory('appearance', appearance);
          break;
        case 5:
          await saveSuperAdminConfig();
          break;
        default:
          break;
      }
      setSuccess('Settings saved successfully');
      setLastSaved(new Date());
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const triggerDownload = async (downloadUrl, filename) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'download');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const runAction = async (action, data = {}) => {
    setActionLoading(action);
    setError('');
    try {
      const res = await axios.post(
        `${API}/super-admin/system-management`,
        { action, data },
        { headers: authHeaders() }
      );
      if (res.data?.success) {
        const extra = res.data.backup_file || res.data.export_file
          ? ` (${res.data.backup_file || res.data.export_file})`
          : '';
        setSuccess((res.data.message || 'Action completed') + extra);
        if (res.data.download_url) {
          try {
            await triggerDownload(
              res.data.download_url,
              res.data.backup_file || res.data.export_file
            );
          } catch (downloadErr) {
            console.warn('Auto-download failed:', downloadErr);
          }
        }
        if (action === 'backup_system' || action === 'system_cleanup' || action === 'export_logs') {
          await loadAll();
        }
        return res.data;
      }
      throw new Error(res.data?.message || 'Action failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action failed';
      setError(msg.includes('Endpoint not found') ? `${msg} — restart the PHP backend server if you just updated routes.` : msg);
      return null;
    } finally {
      setActionLoading('');
    }
  };

  const toggleMaintenanceMode = async () => {
    const type = maintenanceMode.enabled ? 'disable_maintenance_mode' : 'enable_maintenance_mode';
    const result = await runAction('system_maintenance', {
      maintenance_type: type,
      message: 'Library is under scheduled maintenance. Please check back soon.'
    });
    if (result) setMaintenanceMode({ enabled: !maintenanceMode.enabled });
  };

  const totals = health?.totals || {};

  if (loading) {
    return (
      <DashboardLayout title="Super Admin Panel">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress color="error" size={56} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Super Admin Panel">
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              <Settings sx={{ mr: 1, verticalAlign: 'middle', color: RED }} />
              System Settings
            </Typography>
            <Typography color="text.secondary">
              Configure library, security, performance, and maintenance — saved to database
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {maintenanceMode.enabled && <Chip label="Maintenance ON" color="warning" icon={<Warning />} />}
            {lastSaved && <Chip label={`Saved ${lastSaved.toLocaleTimeString()}`} size="small" variant="outlined" />}
            <Tooltip title="Reload">
              <IconButton onClick={loadAll} disabled={saving}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} onClick={handleSaveTab} disabled={saving} sx={{ background: GRADIENT }}>
              Save section
            </Button>
          </Box>
        </Box>

        {/* Health KPIs */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Users', value: totals.total_users, icon: <People />, color: '#1976d2' },
            { label: 'Books', value: totals.total_books, icon: <MenuBook />, color: '#2e7d32' },
            { label: 'Active loans', value: totals.active_loans, icon: <Assignment />, color: '#7b1fa2' },
            { label: 'Overdue', value: totals.overdue_loans, icon: <Warning />, color: '#ed6c02' },
            { label: 'Failed logins (24h)', value: health?.failed_logins_24h ?? 0, icon: <Lock />, color: RED },
            { label: 'DB status', value: health?.database?.status || '—', icon: <MonitorHeart />, color: '#00838f' }
          ].map((k) => (
            <Grid item xs={6} sm={4} md={2} key={k.label}>
              <Card sx={{ background: `linear-gradient(135deg, ${k.color}22, ${k.color}08)`, border: `1px solid ${k.color}33` }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: k.color, width: 36, height: 36 }}>{k.icon}</Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        {k.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {k.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: '#fafafa',
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root.Mui-selected': { color: TAB_COLORS[tab] || RED, fontWeight: 700 },
              '& .MuiTabs-indicator': { bgcolor: TAB_COLORS[tab] || RED, height: 3 }
            }}
          >
            <Tab icon={<Business />} label="Library" />
            <Tab icon={<Tune />} label="Policies" />
            <Tab icon={<Notifications />} label="Alerts" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<ColorLens />} label="Appearance" />
            <Tab icon={<Speed />} label="Performance" />
            <Tab icon={<Build />} label="Tools" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Library */}
            {tab === 0 && (
              <Grid container spacing={2}>
                {[
                  { key: 'libraryName', label: 'Library name', icon: <Business /> },
                  { key: 'email', label: 'Email', icon: <Email /> },
                  { key: 'phone', label: 'Phone', icon: <Phone /> },
                  { key: 'website', label: 'Website', icon: <Language /> }
                ].map((f) => (
                  <Grid item xs={12} md={6} key={f.key}>
                    <TextField
                      fullWidth
                      label={f.label}
                      value={library[f.key] || ''}
                      onChange={(e) => setLibrary((p) => ({ ...p, [f.key]: e.target.value }))}
                      InputProps={{ startAdornment: <Box sx={{ mr: 1, color: RED, display: 'flex' }}>{f.icon}</Box> }}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Description" value={library.description || ''} onChange={(e) => setLibrary((p) => ({ ...p, description: e.target.value }))} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Address" value={library.address || ''} onChange={(e) => setLibrary((p) => ({ ...p, address: e.target.value }))} InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: RED }} /> }} />
                </Grid>
              </Grid>
            )}

            {/* Policies */}
            {tab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>Max books per user</Typography>
                  <Slider value={policies.max_user_borrow_books || 5} min={1} max={20} marks valueLabelDisplay="on" color="error" onChange={(_, v) => setPolicies((p) => ({ ...p, max_user_borrow_books: v }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>Loan period (days)</Typography>
                  <Slider value={policies.max_book_return_days || 14} min={7} max={60} marks valueLabelDisplay="on" color="error" onChange={(_, v) => setPolicies((p) => ({ ...p, max_book_return_days: v }))} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography gutterBottom>Fine per day ($)</Typography>
                  <Slider value={policies.due_fines_per_day || 0.5} min={0} max={5} step={0.25} valueLabelDisplay="on" color="error" onChange={(_, v) => setPolicies((p) => ({ ...p, due_fines_per_day: v }))} />
                </Grid>
                <Grid item xs={12}>
                  <SettingSwitch label="Allow public registration" checked={system.allowRegistration} onChange={(v) => setSystem((p) => ({ ...p, allowRegistration: v }))} />
                  <SettingSwitch label="Maintenance mode (library)" checked={system.maintenanceMode} onChange={(v) => setSystem((p) => ({ ...p, maintenanceMode: v }))} />
                </Grid>
              </Grid>
            )}

            {/* Notifications */}
            {tab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SettingSwitch label="Email notifications" checked={notifications.emailEnabled} onChange={(v) => setNotifications((p) => ({ ...p, emailEnabled: v }))} />
                  <SettingSwitch label="SMS alerts" checked={notifications.smsEnabled} onChange={(v) => setNotifications((p) => ({ ...p, smsEnabled: v }))} />
                  <SettingSwitch label="Push notifications" checked={notifications.pushEnabled} onChange={(v) => setNotifications((p) => ({ ...p, pushEnabled: v }))} />
                  <SettingSwitch label="Overdue reminders" checked={notifications.overdueReminders} onChange={(v) => setNotifications((p) => ({ ...p, overdueReminders: v }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <SettingSwitch label="System alerts" checked={saNotifications.system_alerts} onChange={(v) => setSaNotifications((p) => ({ ...p, system_alerts: v }))} />
                  <TextField fullWidth label="Admin alert email" sx={{ mt: 2 }} value={saNotifications.admin_email || ''} onChange={(e) => setSaNotifications((p) => ({ ...p, admin_email: e.target.value }))} />
                  <Typography sx={{ mt: 3 }}>CPU alert threshold (%)</Typography>
                  <Slider value={saNotifications.cpu_usage_alert_threshold || 80} min={50} max={99} color="error" valueLabelDisplay="on" onChange={(_, v) => setSaNotifications((p) => ({ ...p, cpu_usage_alert_threshold: v }))} />
                </Grid>
              </Grid>
            )}

            {/* Security */}
            {tab === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SettingSwitch label="Two-factor authentication" checked={saSecurity.two_factor_auth} onChange={(v) => setSaSecurity((p) => ({ ...p, two_factor_auth: v }))} />
                  <SettingSwitch label="Login monitoring" checked={saSecurity.login_monitoring} onChange={(v) => setSaSecurity((p) => ({ ...p, login_monitoring: v }))} />
                  <SettingSwitch label="Failed login alerts" checked={saSecurity.failed_login_alerts} onChange={(v) => setSaSecurity((p) => ({ ...p, failed_login_alerts: v }))} />
                  <SettingSwitch label="Audit logging" checked={security.auditLogging} onChange={(v) => setSecurity((p) => ({ ...p, auditLogging: v }))} />
                  <SettingSwitch label="HTTPS only" checked={security.httpsOnly} onChange={(v) => setSecurity((p) => ({ ...p, httpsOnly: v }))} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Max login attempts (members)</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    Regular user accounts auto-suspend after this many failed sign-ins. Remaining attempts are shown on the login page.
                  </Typography>
                  <Slider value={saSecurity.max_login_attempts || 5} min={3} max={20} color="error" valueLabelDisplay="on" onChange={(_, v) => setSaSecurity((p) => ({ ...p, max_login_attempts: v }))} />
                  <Typography sx={{ mt: 2 }}>Session timeout (minutes)</Typography>
                  <Slider value={saSecurity.session_timeout_minutes || 60} min={15} max={240} step={15} color="error" valueLabelDisplay="on" onChange={(_, v) => setSaSecurity((p) => ({ ...p, session_timeout_minutes: v }))} />
                  <Button sx={{ mt: 3 }} variant="outlined" color="warning" startIcon={<Shield />} disabled={!!actionLoading} onClick={() => runAction('security_action', { security_action: 'clear_failed_logins' })}>
                    Clear failed logins
                  </Button>
                  <Button sx={{ mt: 1 }} fullWidth variant="outlined" color="error" startIcon={<BugReport />} disabled={!!actionLoading} onClick={() => runAction('security_scan')}>
                    Run security scan
                  </Button>
                  <Button sx={{ mt: 1 }} fullWidth variant="contained" color="error" startIcon={<Shield />} onClick={() => navigate('/super-admin/security')}>
                    Open Security Center
                  </Button>
                </Grid>
              </Grid>
            )}

            {/* Appearance */}
            {tab === 4 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Primary color" type="color" value={appearance.primaryColor} onChange={(e) => setAppearance((p) => ({ ...p, primaryColor: e.target.value }))} sx={{ '& input': { height: 48 } }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Secondary color" type="color" value={appearance.secondaryColor} onChange={(e) => setAppearance((p) => ({ ...p, secondaryColor: e.target.value }))} sx={{ '& input': { height: 48 } }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Theme</InputLabel>
                    <Select value={appearance.theme || 'light'} label="Theme" onChange={(e) => setAppearance((p) => ({ ...p, theme: e.target.value }))}>
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <SettingSwitch label="UI animations" checked={appearance.animationsEnabled} onChange={(v) => setAppearance((p) => ({ ...p, animationsEnabled: v }))} />
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 2, background: `linear-gradient(135deg, ${appearance.primaryColor}, ${appearance.secondaryColor})`, color: 'white' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Preview — {library.libraryName || 'Digital Library'}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      This is how your brand colors will appear across the admin panel.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Performance */}
            {tab === 5 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <SettingSwitch label="Enable caching" checked={performance.caching_enabled} onChange={(v) => setPerformance((p) => ({ ...p, caching_enabled: v }))} />
                  <SettingSwitch label="Auto optimization" checked={performance.auto_optimization} onChange={(v) => setPerformance((p) => ({ ...p, auto_optimization: v }))} />
                  <SettingSwitch label="Debug mode" checked={performance.debug_mode} onChange={(v) => setPerformance((p) => ({ ...p, debug_mode: v }))} description="Only enable for troubleshooting" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Memory limit (MB)</Typography>
                  <Slider value={performance.memory_limit_mb || 512} min={128} max={2048} step={128} color="error" valueLabelDisplay="on" onChange={(_, v) => setPerformance((p) => ({ ...p, memory_limit_mb: v }))} />
                  <Typography sx={{ mt: 2 }}>Max upload size (MB)</Typography>
                  <Slider value={performance.upload_max_size_mb || 50} min={5} max={200} color="error" valueLabelDisplay="on" onChange={(_, v) => setPerformance((p) => ({ ...p, upload_max_size_mb: v }))} />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <SettingSwitch label="Automatic backups" checked={backupSettings.automatic_backups} onChange={(v) => setBackupSettings((p) => ({ ...p, automatic_backups: v }))} />
                  <FormControl fullWidth sx={{ mt: 2, maxWidth: 320 }}>
                    <InputLabel>Backup frequency</InputLabel>
                    <Select value={backupSettings.backup_frequency || 'daily'} label="Backup frequency" onChange={(e) => setBackupSettings((p) => ({ ...p, backup_frequency: e.target.value }))}>
                      <MenuItem value="hourly">Hourly</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {/* Tools */}
            {tab === 6 && (
              <Box>
                <Alert severity={maintenanceMode.enabled ? 'warning' : 'info'} sx={{ mb: 3 }}>
                  {maintenanceMode.enabled
                    ? 'Maintenance mode is ON — public users may be blocked from the app.'
                    : 'System is live. Use tools below for backups, cleanup, and diagnostics.'}
                </Alert>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <ActionCard title="Backup database" description="Create SQL backup in /backups" icon={<Backup />} color={RED} loading={actionLoading === 'backup_system'} onClick={() => setConfirmDialog({ action: 'backup_system', title: 'Create backup?' })} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ActionCard title="System cleanup" description="Prune logs, optimize tables" icon={<CleaningServices />} color="#2e7d32" loading={actionLoading === 'system_cleanup'} onClick={() => runAction('system_cleanup')} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ActionCard title="Clear cache" description="Remove cached files" icon={<Memory />} color="#1976d2" loading={actionLoading === 'system_maintenance'} onClick={() => runAction('system_maintenance', { maintenance_type: 'clear_cache' })} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ActionCard title="Export logs" description="Zip log files for download" icon={<Download />} color="#9c27b0" loading={actionLoading === 'export_logs'} onClick={() => runAction('export_logs')} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ActionCard title="Audit logs" description="Search activity & accountability" icon={<History />} color="#5c6bc0" onClick={() => navigate('/super-admin/audit-logs')} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ActionCard title="Restart services" description="Clear PHP opcache" icon={<RestartAlt />} color="#ed6c02" loading={actionLoading === 'restart_system'} onClick={() => setConfirmDialog({ action: 'restart_system', title: 'Restart system services?' })} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <ActionCard
                      title={maintenanceMode.enabled ? 'Disable maintenance' : 'Enable maintenance'}
                      description="Block public access during updates"
                      icon={<PowerSettingsNew />}
                      color="#5d4037"
                      loading={actionLoading === 'system_maintenance'}
                      onClick={toggleMaintenanceMode}
                    />
                  </Grid>
                </Grid>

                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Recent backups
                    </Typography>
                    {backups.length === 0 ? (
                      <Typography color="text.secondary">No backups found. Create one using the card above.</Typography>
                    ) : (
                      <List dense>
                        {backups.map((b) => (
                          <ListItem key={b.filename} divider>
                            <ListItemIcon>
                              <Storage color="error" />
                            </ListItemIcon>
                            <ListItemText primary={b.filename} secondary={`${b.size} · ${b.created_at}`} />
                            <Chip label="SQL" size="small" variant="outlined" />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>

                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Environment
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow><TableCell>PHP</TableCell><TableCell>{health?.php_version}</TableCell></TableRow>
                        <TableRow><TableCell>Server time</TableCell><TableCell>{health?.server_time}</TableCell></TableRow>
                        <TableRow><TableCell>DB response</TableCell><TableCell>{health?.database?.response_time_ms} ms</TableCell></TableRow>
                        <TableRow><TableCell>Suspended users</TableCell><TableCell>{totals.suspended_users}</TableCell></TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </Paper>

        <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)}>
          <DialogTitle>{confirmDialog?.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>This action may take a moment. Continue?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                const a = confirmDialog?.action;
                setConfirmDialog(null);
                await runAction(a);
              }}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!success} autoHideDuration={5000} onClose={() => setSuccess('')}>
          <Alert severity="success" onClose={() => setSuccess('')} icon={<CheckCircle />}>
            {success}
          </Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={7000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default SuperAdminSettings;

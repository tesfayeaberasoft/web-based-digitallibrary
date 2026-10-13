import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip, LinearProgress,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Paper, Divider, Avatar, Badge, Tooltip, FormControl,
  Select, MenuItem, TextField, Switch, FormControlLabel, Tabs, Tab,
  Fade, Grow
} from '@mui/material';
import {
  SupervisorAccount, People, LibraryBooks, Storage, Security,
  Notifications, TrendingUp, TrendingDown, Speed, Memory, Warning,
  CheckCircle, Error as ErrorIcon, Info, Refresh, Settings, PersonAdd,
  Build, CleaningServices, Download, ExpandMore, Timeline, Assessment,
  MonitorHeart, Schedule, DataUsage, HealthAndSafety, Analytics,
  SignalCellularAlt, Shield, Assignment, History, EventNote,
  CalendarToday, AttachMoney, NotificationsActive, PowerSettingsNew,
  RestartAlt, FlashOn, Stars, BarChart as BarChartIcon, ShowChart,
  LibraryAdd, MenuBook, AssignmentReturn, BookmarkAdd,
  Login as LoginIcon, Close, Backup
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart as RBarChart, Bar, PieChart as RPieChart,
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

/* ── palette ── */
const C = {
  primary:   '#2d6a4f',
  secondary: '#52b788',
  light:     '#d8f3dc',
  lighter:   '#f0fdf4',
  dark:      '#1b4332',
  accent:    '#95d5b2',
};
const COLORS = [C.primary, C.secondary, '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', C.accent, '#06b6d4'];

const gBtn = (outline = false) => outline ? {
  borderColor: C.secondary, color: C.primary, fontWeight: 700, borderRadius: 2,
  '&:hover': { borderColor: C.primary, bgcolor: C.lighter }, transition: 'all .2s',
} : {
  background: `linear-gradient(135deg,${C.primary},${C.secondary})`,
  color: 'white', fontWeight: 700, borderRadius: 2,
  boxShadow: `0 4px 12px rgba(45,106,79,.3)`,
  '&:hover': { background: `linear-gradient(135deg,${C.dark},${C.primary})`, transform: 'translateY(-2px)' },
  '&.Mui-disabled': { opacity: .5 }, transition: 'all .3s',
};

const fmt   = n => new Intl.NumberFormat().format(n || 0);
const scol  = s => { const l = s?.toLowerCase(); return ['healthy','active','online','success'].includes(l) ? C.secondary : ['warning','degraded'].includes(l) ? '#f59e0b' : ['error','critical','offline'].includes(l) ? '#ef4444' : '#9ca3af'; };
const aIcon = a => { const l = a?.toLowerCase()||''; if(l.includes('user')||l.includes('registr')) return <PersonAdd/>; if(l.includes('book added')) return <LibraryAdd/>; if(l.includes('issue')||l.includes('borrow')) return <MenuBook/>; if(l.includes('return')) return <AssignmentReturn/>; if(l.includes('reserv')) return <BookmarkAdd/>; if(l.includes('fine')||l.includes('paid')) return <AttachMoney/>; if(l.includes('login')) return <LoginIcon/>; return <EventNote/>; };

/* ══════════════════════════════════════════ */
export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [loading,         setLoading]         = useState(true);
  const [dashboardData,   setDashboardData]   = useState(null);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');
  const [openDialog,      setOpenDialog]      = useState('');
  const [selectedBackup,  setSelectedBackup]  = useState(null);
  const [restoreConfirm,  setRestoreConfirm]  = useState('');
  const [backups,         setBackups]         = useState([]);
  const [refreshing,      setRefreshing]      = useState(false);
  const [activeTab,       setActiveTab]       = useState(0);
  const [autoRefresh,     setAutoRefresh]     = useState(true);
  const [systemAlerts,    setSystemAlerts]    = useState([]);
  const [perfHistory,     setPerfHistory]     = useState([]);
  const [activitiesPage,  setActivitiesPage]  = useState(0);
  const [rowsPerPage,     setRowsPerPage]     = useState(10);
  const [realTime,        setRealTime]        = useState({ cpu: 0, mem: 0, conn: 0, rps: 0 });
  const [settings,        setSettings]        = useState({
    performance:   { caching_enabled: true,  auto_optimization: true,  debug_mode: false,      query_optimization: true,  memory_limit_mb: 512, max_execution_time: 300, upload_max_size_mb: 50, compression_enabled: true },
    security:      { two_factor_auth: true,  login_monitoring: true,   ip_restrictions: false, max_login_attempts: 5, session_timeout_minutes: 60, failed_login_alerts: true, suspicious_activity_detection: true, realtime_security_scanning: false },
    notifications: { email_notifications: true, sms_alerts: false, system_alerts: true, push_notifications: true, admin_email: 'admin@digitallibrary.com', cpu_usage_alert_threshold: 80, memory_usage_alert_threshold: 85, disk_usage_alert_threshold: 90 },
    backup:        { automatic_backups: true, backup_frequency: 'daily', backup_retention_days: 30, detailed_logging: true, log_level: 'info', log_retention_days: 90 },
  });

  /* real-time simulation */
  useEffect(() => {
    const t = setInterval(() => {
      setRealTime(p => {
        const n = {
          cpu:  Math.max(0, Math.min(100, p.cpu  + (Math.random()-.5)*10)),
          mem:  Math.max(0, Math.min(100, p.mem  + (Math.random()-.5)*5)),
          conn: Math.max(0, p.conn + Math.floor((Math.random()-.5)*10)),
          rps:  Math.max(0, p.rps  + Math.floor((Math.random()-.5)*20)),
        };
        setPerfHistory(h => [...h.slice(-19), { t: new Date().toLocaleTimeString(), cpu: n.cpu, mem: n.mem }]);
        return n;
      });
    }, 2000);
    return () => clearInterval(t);
  }, []);

  /* alerts from realtime + data */
  useEffect(() => {
    const a = [];
    if (realTime.cpu > 80) a.push({ id:'cpu', type:'error',   title:'High CPU',    msg:`CPU at ${realTime.cpu.toFixed(1)}%` });
    if (realTime.mem > 85) a.push({ id:'mem', type:'warning', title:'High Memory', msg:`Memory at ${realTime.mem.toFixed(1)}%` });
    const sec = dashboardData?.security_status;
    if (sec) {
      if ((sec.failed_logins_24h||0) >= (sec.failed_login_threshold||10))
        a.push({ id:'logins', type:'error',   title:'High Failed Logins', msg:`${sec.failed_logins_24h} failed logins in 24h`, link:'/super-admin/security' });
      if ((sec.suspicious_ips||0) > 0)
        a.push({ id:'ips',    type:'warning', title:'Suspicious IPs',     msg:`${sec.suspicious_ips} flagged IPs`, link:'/super-admin/security' });
    }
    setSystemAlerts(a);
  }, [realTime, dashboardData]);

  /* auto-refresh */
  useEffect(() => {
    loadData();
    let t; if (autoRefresh) t = setInterval(loadData, 30000);
    return () => t && clearInterval(t);
  }, [autoRefresh]); // eslint-disable-line

  /* load settings when dialog opens */
  useEffect(() => { if (openDialog === 'settings') loadSettings(); }, [openDialog]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/api/super-admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const d = data.data || {};
        setDashboardData({
          system_overview:     d.system_overview     || {},
          user_statistics:     d.user_statistics     || {},
          resource_statistics: d.resource_statistics || {},
          system_health:       d.system_health       || {},
          security_status:     d.security_status     || {},
          recent_activities:   Array.isArray(d.recent_activities) ? d.recent_activities : [],
          performance_metrics: d.performance_metrics || {},
          backup_status:       d.backup_status       || {},
          active_sessions:     d.active_sessions     || {},
        });
        setError('');
      } else throw new Error(data.message);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load dashboard');
      if (!dashboardData) setDashboardData({
        system_overview:{totals:{},users_by_role:[]}, user_statistics:{registration_trend:[],top_users:[]},
        resource_statistics:{books_by_category:[],loan_trends:[]}, system_health:{}, security_status:{},
        recent_activities:[], performance_metrics:{}, backup_status:{}, active_sessions:{},
      });
    } finally { setLoading(false); setRefreshing(false); }
  };

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/api/super-admin/system-management', { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) setSettings(data.data);
    } catch { /* keep defaults */ }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put('http://localhost:8000/api/super-admin/system-management', settings, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (data.success) { setSuccess('Settings saved!'); setOpenDialog(''); }
      else throw new Error(data.message);
    } catch (e) { setError(e.response?.data?.message || 'Failed to save settings'); }
    finally { setLoading(false); }
  };

  const handleAction = async (action, extra = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:8000/api/super-admin/system-management', { action, data: extra }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (data.success) {
        const label = data.backup_file || data.export_file;
        setSuccess(data.message + (label ? ` (${label})` : ''));
        if (data.download_url) {
          try {
            const dl = await axios.get(data.download_url, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([dl.data]));
            const a   = document.createElement('a'); a.href = url; a.setAttribute('download', label || 'download');
            document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
          } catch { /* silent */ }
        }
        await loadData(); setOpenDialog('');
      } else throw new Error(data.message);
    } catch (e) { setError(e.response?.data?.message || e.message || `Action failed: ${action}`); }
    finally { setLoading(false); }
  };

  const openRestoreDialog = async () => {
    setSelectedBackup(null); setRestoreConfirm('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/api/super-admin/system-management', { headers: { Authorization: `Bearer ${token}` } });
      if (data.backups) setBackups(data.backups);
    } catch { /* silent */ }
    setOpenDialog('restore_backup');
  };

  const handleRestore = async () => {
    if (!selectedBackup)              { setError('Please select a backup file');    return; }
    if (restoreConfirm !== 'RESTORE') { setError('Type "RESTORE" to confirm');      return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post('http://localhost:8000/api/super-admin/system-management', { action:'restore_backup', data:{ backup_file:selectedBackup.name, confirmation:'RESTORE' } }, { headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } });
      if (data.success) { setSuccess('Database restored!'); setOpenDialog(''); setSelectedBackup(null); setRestoreConfirm(''); await loadData(); }
      else throw new Error(data.message);
    } catch (e) { setError(e.response?.data?.message || 'Restore failed'); }
    finally { setLoading(false); }
  };

  const setSetting = (sec, key, val) => setSettings(p => ({ ...p, [sec]: { ...p[sec], [key]: val } }));

  /* derived */
  const D          = dashboardData || {};
  const ov         = D.system_overview       || {};
  const totals     = ov.totals               || {};
  const us         = D.user_statistics       || {};
  const rs         = D.resource_statistics   || {};
  const sh         = D.system_health         || {};
  const sec        = D.security_status       || {};
  const acts       = Array.isArray(D.recent_activities) ? D.recent_activities : [];
  const regTrend   = Array.isArray(us.registration_trend) ? us.registration_trend : [];
  const catData    = Array.isArray(rs.books_by_category)  ? rs.books_by_category  : [];
  const loanTrend  = Array.isArray(rs.loan_trends)        ? rs.loan_trends        : [];
  const topUsers   = Array.isArray(us.top_users)          ? us.top_users          : [];
  const pageActs   = acts.slice(activitiesPage * rowsPerPage, activitiesPage * rowsPerPage + rowsPerPage);

  /* ── loading / error guards ── */
  if (loading && !dashboardData) return (
    <DashboardLayout title="Super Admin Dashboard">
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', flexDirection:'column', gap:2 }}>
        <CircularProgress size={60} sx={{ color:C.primary }} />
        <Typography color="text.secondary">Loading dashboard…</Typography>
      </Box>
    </DashboardLayout>
  );

  /* ════════════════════════════════════════ RENDER ════════════════════════════════════════ */
  return (
    <DashboardLayout title="Super Admin Dashboard">
      <Fade in timeout={500}>
        <Box>

          {/* ── HERO ── */}
          <Box sx={{
            mb:4, p:{ xs:3, md:4 },
            background:`linear-gradient(135deg,${C.primary} 0%,${C.secondary} 100%)`,
            borderRadius:3, color:'white', position:'relative', overflow:'hidden',
          }}>
            {/* decorative blobs */}
            {[{s:280,t:-80,r:-80,o:.1},{s:180,b:-50,l:-50,o:.08}].map((c,i)=>(
              <Box key={i} sx={{ position:'absolute', width:c.s, height:c.s, borderRadius:'50%', background:'rgba(255,255,255,.2)', top:c.t, bottom:c.b, left:c.l, right:c.r, opacity:c.o }} />
            ))}
            <Box sx={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:2, alignItems:'center' }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                <Avatar sx={{ width:64, height:64, bgcolor:'rgba(255,255,255,.2)' }}>
                  <SupervisorAccount sx={{ fontSize:36, color:'white' }} />
                </Avatar>
                <Box>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:.4 }}>
                    <Typography variant="h4" fontWeight={900}>Super Administrator</Typography>
                    <Chip label="LIVE" size="small" sx={{ bgcolor:'#ef4444', color:'white', fontWeight:700, animation:'pulse 2s infinite', '@keyframes pulse':{'0%,100%':{opacity:1},'50%':{opacity:.5}} }} />
                  </Box>
                  <Typography variant="body1" sx={{ opacity:.9 }}>
                    System-wide control centre · {new Date().toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display:'flex', alignItems:'center', gap:1.5, flexWrap:'wrap' }}>
                <FormControlLabel label={<Typography variant="body2" sx={{ color:'white' }}>Auto Refresh</Typography>}
                  control={<Switch checked={autoRefresh} onChange={e=>setAutoRefresh(e.target.checked)}
                    sx={{ '& .Mui-checked':{ color:'white!important' }, '& .Mui-checked + .MuiSwitch-track':{ bgcolor:'rgba(255,255,255,.5)!important' } }} />} />
                <Tooltip title="Refresh">
                  <IconButton onClick={() => { setRefreshing(true); loadData(); }} disabled={refreshing}
                    sx={{ bgcolor:'rgba(255,255,255,.2)', color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,.3)' } }}>
                    <Refresh sx={{ animation:refreshing?'spin 1s linear infinite':'none', '@keyframes spin':{'0%':{transform:'rotate(0deg)'},'100%':{transform:'rotate(360deg)'}} }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="System Settings">
                  <IconButton onClick={() => setOpenDialog('settings')} sx={{ bgcolor:'rgba(255,255,255,.2)', color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,.3)' } }}>
                    <Settings />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Emergency Actions">
                  <IconButton onClick={() => setOpenDialog('emergency')} sx={{ bgcolor:'rgba(239,68,68,.4)', color:'white', '&:hover':{ bgcolor:'rgba(239,68,68,.6)' } }}>
                    <PowerSettingsNew />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* ── alerts ── */}
          {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb:3, borderRadius:2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb:3, borderRadius:2, bgcolor:C.lighter, border:`1px solid ${C.secondary}` }}>{success}</Alert>}
          {systemAlerts.length > 0 && (
            <Alert severity="warning" sx={{ mb:3, borderRadius:2 }}
              action={<>
                {systemAlerts.some(a=>a.link) && <Button color="inherit" size="small" onClick={()=>navigate('/super-admin/security')}>Security</Button>}
                <Button color="inherit" size="small" onClick={()=>setSystemAlerts([])}>Dismiss</Button>
              </>}>
              <Typography fontWeight={700}>System Alerts ({systemAlerts.length})</Typography>
              {systemAlerts.slice(0,3).map(a=><Typography key={a.id} variant="body2">• {a.title}: {a.msg}</Typography>)}
            </Alert>
          )}

          {/* ── STAT CARDS ── */}
          <Grid container spacing={3} sx={{ mb:4 }}>
            {[
              { title:'Total Users',        value:fmt(totals.total_users),     sub1:`Active: ${fmt(totals.active_users)}`,     sub2:`Staff: ${fmt(totals.total_staff)}`,            icon:<People sx={{ fontSize:56, opacity:.8, color:'white' }} />,           grad:`linear-gradient(135deg,${C.primary},${C.secondary})`, progress:null },
              { title:'Library Collection', value:fmt(totals.total_books),     sub1:`Copies: ${fmt(totals.total_book_copies)}`,sub2:`Available: ${fmt(totals.available_book_copies)}`,icon:<LibraryBooks sx={{ fontSize:56, opacity:.8, color:'white' }} />,       grad:'linear-gradient(135deg,#3b82f6,#60a5fa)',             progress:totals.borrowed_percentage||0 },
              { title:'Active Sessions',    value:D.active_sessions?.online_users||0, sub1:`Today: ${totals.users_today||0}`,  sub2:`This Week: ${totals.users_this_week||0}`,        icon:<SignalCellularAlt sx={{ fontSize:56, opacity:.8, color:'white' }} />, grad:'linear-gradient(135deg,#8b5cf6,#a78bfa)',             progress:null },
              { title:'Pending Fines',      value:`$${Number(totals.total_pending_fine_amount||0).toFixed(2)}`, sub1:`Count: ${fmt(totals.pending_fines)}`, sub2:`Collected: $${Number(totals.total_collected_fines||0).toFixed(2)}`, icon:<AttachMoney sx={{ fontSize:56, opacity:.8, color:'white' }} />, grad:'linear-gradient(135deg,#f59e0b,#fbbf24)', progress:null },
            ].map((s,i)=>(
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Grow in timeout={400+i*150}>
                  <Card elevation={0} sx={{ height:'100%', background:s.grad, color:'white', borderRadius:3, position:'relative', overflow:'hidden',
                    transition:'all .3s', '&:hover':{ transform:'translateY(-6px)', boxShadow:'0 20px 40px rgba(0,0,0,.2)' },
                    '&::after':{ content:'""', position:'absolute', top:-40, right:-40, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,.1)' } }}>
                    <CardContent sx={{ position:'relative', zIndex:1 }}>
                      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:1.5 }}>
                        <Box>
                          <Typography variant="h2" fontWeight={900} sx={{ letterSpacing:-2, lineHeight:1 }}>{s.value}</Typography>
                          <Typography variant="h6" fontWeight={700} sx={{ opacity:.95, mt:.5 }}>{s.title}</Typography>
                        </Box>
                        {s.icon}
                      </Box>
                      <Typography variant="caption" sx={{ opacity:.9, display:'block' }}>{s.sub1}</Typography>
                      <Typography variant="caption" sx={{ opacity:.9, display:'block', mb:1 }}>{s.sub2}</Typography>
                      {s.progress != null && (
                        <LinearProgress variant="determinate" value={s.progress}
                          sx={{ height:6, borderRadius:3, bgcolor:'rgba(255,255,255,.2)', '& .MuiLinearProgress-bar':{ bgcolor:'white', borderRadius:3 } }} />
                      )}
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* ── REAL-TIME + ALERTS ── */}
          <Grid container spacing={3} sx={{ mb:4 }}>
            {/* Real-time */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, height:'100%' }}>
                <CardContent sx={{ p:3 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2.5 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                      <Avatar sx={{ bgcolor:C.lighter, width:42, height:42 }}><FlashOn sx={{ color:C.primary }} /></Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Real-Time Performance</Typography>
                        <Typography variant="caption" color="text.secondary">Live system metrics</Typography>
                      </Box>
                    </Box>
                    <Chip label="LIVE" size="small" sx={{ bgcolor:'#ef4444', color:'white', fontWeight:700, animation:'pulse 2s infinite', '@keyframes pulse':{'0%,100%':{opacity:1},'50%':{opacity:.5}} }} />
                  </Box>

                  <Grid container spacing={3} sx={{ mb:2 }}>
                    {[
                      { label:'CPU Usage',  val:realTime.cpu, col:realTime.cpu>80?'#ef4444':realTime.cpu>60?'#f59e0b':C.secondary },
                      { label:'Memory',     val:realTime.mem, col:realTime.mem>85?'#ef4444':realTime.mem>70?'#f59e0b':'#3b82f6' },
                    ].map((m,i)=>(
                      <Grid item xs={6} key={i}>
                        <Box sx={{ textAlign:'center' }}>
                          <Box sx={{ position:'relative', display:'inline-block' }}>
                            <CircularProgress variant="determinate" value={m.val} size={88} thickness={5} sx={{ color:m.col }} />
                            <Box sx={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <Typography variant="body2" fontWeight={800} sx={{ color:m.col }}>{m.val.toFixed(1)}%</Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt:.5 }}>{m.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  <Paper elevation={0} sx={{ p:2, bgcolor:C.lighter, borderRadius:2, border:`1px solid ${C.light}`, mb:2 }}>
                    <Grid container spacing={2}>
                      {[{ label:'Connections', val:realTime.conn, col:C.primary },{ label:'Req/sec', val:realTime.rps, col:'#3b82f6' }].map((m,i)=>(
                        <Grid item xs={6} key={i} sx={{ textAlign:'center' }}>
                          <Typography variant="h5" fontWeight={900} sx={{ color:m.col }}>{m.val}</Typography>
                          <Typography variant="caption" color="text.secondary">{m.label}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {perfHistory.length > 2 && (
                    <Box sx={{ height:160 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={perfHistory}>
                          <defs>
                            <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                            <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                          </defs>
                          <XAxis dataKey="t" tick={{ fontSize:10 }} /><YAxis domain={[0,100]} tick={{ fontSize:10 }} />
                          <CartesianGrid strokeDasharray="3 3" stroke={C.light} /><RTooltip />
                          <Area type="monotone" dataKey="cpu" stroke="#ef4444" fill="url(#gCpu)" strokeWidth={2} name="CPU %" />
                          <Area type="monotone" dataKey="mem" stroke="#3b82f6" fill="url(#gMem)" strokeWidth={2} name="Mem %" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* System Alerts */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, height:'100%' }}>
                <CardContent sx={{ p:3 }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2.5 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                      <Avatar sx={{ bgcolor:'#fef2f2', width:42, height:42 }}>
                        <Badge badgeContent={systemAlerts.length} color="error">
                          <NotificationsActive sx={{ color:'#ef4444' }} />
                        </Badge>
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>System Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">Real-time issue monitoring</Typography>
                      </Box>
                    </Box>
                    {systemAlerts.length > 0 && <Button size="small" onClick={()=>setSystemAlerts([])} sx={{ color:'text.secondary', fontWeight:600 }}>Dismiss All</Button>}
                  </Box>

                  {systemAlerts.length === 0 ? (
                    <Box sx={{ textAlign:'center', py:6 }}>
                      <Avatar sx={{ width:72, height:72, mx:'auto', mb:2, background:`linear-gradient(135deg,${C.primary},${C.secondary})` }}>
                        <CheckCircle sx={{ fontSize:40, color:'white' }} />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700} sx={{ color:C.primary }}>All Systems Normal</Typography>
                      <Typography variant="body2" color="text.secondary">No alerts at this time</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                      {systemAlerts.map(a=>(
                        <Paper key={a.id} elevation={0} sx={{ p:2, borderRadius:2, display:'flex', alignItems:'center', justifyContent:'space-between', gap:1.5,
                          bgcolor:a.type==='error'?'#fef2f2':a.type==='warning'?'#fffbeb':'#eff6ff',
                          border:`1px solid ${a.type==='error'?'#fecaca':a.type==='warning'?'#fde68a':'#bfdbfe'}` }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                            {a.type==='error'   && <ErrorIcon   sx={{ color:'#ef4444',fontSize:20 }} />}
                            {a.type==='warning' && <Warning     sx={{ color:'#f59e0b',fontSize:20 }} />}
                            {a.type==='info'    && <Info        sx={{ color:'#3b82f6',fontSize:20 }} />}
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{a.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{a.msg}</Typography>
                            </Box>
                          </Box>
                          {a.link && <Button size="small" color="error" onClick={()=>navigate(a.link)}>Review</Button>}
                        </Paper>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── SYSTEM HEALTH ── */}
          <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, mb:4 }}>
            <CardContent sx={{ p:3 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3 }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                  <Avatar sx={{ bgcolor:C.lighter, width:44, height:44 }}><MonitorHeart sx={{ color:C.primary }} /></Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>System Health</Typography>
                    <Typography variant="caption" color="text.secondary">Database, storage &amp; security status</Typography>
                  </Box>
                </Box>
                <Tooltip title="Run Health Check">
                  <IconButton onClick={()=>handleAction('health_check')} sx={{ bgcolor:C.lighter, color:C.primary, '&:hover':{ bgcolor:C.light } }}>
                    <HealthAndSafety />
                  </IconButton>
                </Tooltip>
              </Box>
              <Grid container spacing={3}>
                {[
                  { label:'Database', data:sh.database||{}, icon:<Storage sx={{ fontSize:26,color:C.primary}} />,   bg:C.lighter,  border:C.light,     fields:[['Status','status'],['Size','db_size'],['Tables','tables_count'],['Connections','connections']] },
                  { label:'Storage',  data:sh.storage||{},  icon:<DataUsage sx={{ fontSize:26,color:'#3b82f6'}} />, bg:'#eff6ff',  border:'#bfdbfe',   fields:[['Total','total_formatted'],['Used','used_formatted'],['Free','free_formatted'],['Usage %','usage_percent']] },
                  { label:'Memory',   data:sh.memory||{},   icon:<Memory sx={{ fontSize:26,color:'#8b5cf6'}} />,   bg:'#f5f3ff',  border:'#ddd6fe',   fields:[['Total','total_formatted'],['Used','used_formatted'],['Free','free_formatted'],['Usage %','usage_percent']] },
                  { label:'Security', data:sec,             icon:<Shield sx={{ fontSize:26,color:'#ef4444'}} />,   bg:'#fef2f2',  border:'#fecaca',   fields:[['Failed Logins (24h)','failed_logins_24h'],['Suspended Users','suspended_users'],['Suspicious IPs','suspicious_ips']] },
                ].map((h,i)=>{
                  const st = h.data?.status || h.data?.health_status;
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={i}>
                      <Grow in timeout={300+i*100}>
                        <Paper elevation={0} sx={{ p:2.5, borderRadius:3, bgcolor:h.bg, border:`2px solid ${h.border}`, transition:'all .3s', '&:hover':{ transform:'translateY(-4px)', boxShadow:'0 8px 20px rgba(0,0,0,.08)' } }}>
                          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2 }}>
                            <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>{h.icon}<Typography variant="subtitle1" fontWeight={700} sx={{ color:C.dark }}>{h.label}</Typography></Box>
                            {st && <Chip label={st} size="small" sx={{ bgcolor:`${scol(st)}20`, color:scol(st), fontWeight:700, border:`1px solid ${scol(st)}40` }} />}
                          </Box>
                          <Divider sx={{ mb:1.5, borderColor:h.border }} />
                          {h.fields.map(([label,field])=> h.data[field] !== undefined && (
                            <Box key={field} sx={{ display:'flex', justifyContent:'space-between', py:.4 }}>
                              <Typography variant="caption" color="text.secondary">{label}</Typography>
                              <Typography variant="caption" fontWeight={700} sx={{ color:C.dark }}>{String(h.data[field])}</Typography>
                            </Box>
                          ))}
                          {h.label==='Storage' && h.data.usage_percent != null && (
                            <LinearProgress variant="determinate" value={Number(h.data.usage_percent)||0}
                              sx={{ mt:1.5, height:6, borderRadius:3, bgcolor:`${h.border}80`, '& .MuiLinearProgress-bar':{ bgcolor:Number(h.data.usage_percent)>90?'#ef4444':Number(h.data.usage_percent)>70?'#f59e0b':C.primary, borderRadius:3 } }} />
                          )}
                        </Paper>
                      </Grow>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          {/* ── CHARTS ── */}
          <Grid container spacing={3} sx={{ mb:4 }}>
            {/* Registration trend */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3 }}>
                <CardContent sx={{ p:3 }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
                    <Avatar sx={{ bgcolor:C.lighter, width:40, height:40 }}><ShowChart sx={{ color:C.primary }} /></Avatar>
                    <Box><Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>User Registration Trend</Typography><Typography variant="caption" color="text.secondary">New users over time</Typography></Box>
                  </Box>
                  {regTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={regTrend}>
                        <defs><linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.primary} stopOpacity={.3}/><stop offset="95%" stopColor={C.primary} stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.light} /><XAxis dataKey="date" tick={{ fontSize:11 }} /><YAxis tick={{ fontSize:11 }} /><RTooltip />
                        <Area type="monotone" dataKey="count" stroke={C.primary} fill="url(#rGrad)" strokeWidth={2.5} name="New Users" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <Box sx={{ height:220, display:'flex', alignItems:'center', justifyContent:'center' }}><Typography color="text.secondary">No data</Typography></Box>}
                </CardContent>
              </Card>
            </Grid>

            {/* Books by category */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3 }}>
                <CardContent sx={{ p:3 }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
                    <Avatar sx={{ bgcolor:C.lighter, width:40, height:40 }}><BarChartIcon sx={{ color:C.primary }} /></Avatar>
                    <Box><Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Books by Category</Typography><Typography variant="caption" color="text.secondary">Collection distribution</Typography></Box>
                  </Box>
                  {catData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <RBarChart data={catData.slice(0,8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={C.light} />
                        <XAxis type="number" tick={{ fontSize:11 }} /><YAxis type="category" dataKey="name" width={90} tick={{ fontSize:10 }} /><RTooltip />
                        <Bar dataKey="count" name="Books" radius={[0,4,4,0]}>
                          {catData.slice(0,8).map((_,idx)=><Cell key={idx} fill={COLORS[idx%COLORS.length]} />)}
                        </Bar>
                      </RBarChart>
                    </ResponsiveContainer>
                  ) : <Box sx={{ height:220, display:'flex', alignItems:'center', justifyContent:'center' }}><Typography color="text.secondary">No data</Typography></Box>}
                </CardContent>
              </Card>
            </Grid>

            {/* Loan trends */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3 }}>
                <CardContent sx={{ p:3 }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
                    <Avatar sx={{ bgcolor:C.lighter, width:40, height:40 }}><Timeline sx={{ color:C.primary }} /></Avatar>
                    <Box><Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Loan Trends</Typography><Typography variant="caption" color="text.secondary">Borrowing activity over time</Typography></Box>
                  </Box>
                  {loanTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <RBarChart data={loanTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.light} />
                        <XAxis dataKey="date" tick={{ fontSize:11 }} /><YAxis tick={{ fontSize:11 }} /><RTooltip /><Legend />
                        <Bar dataKey="issued"   fill={C.primary}   name="Issued"   radius={[4,4,0,0]} />
                        <Bar dataKey="returned" fill={C.secondary} name="Returned" radius={[4,4,0,0]} />
                      </RBarChart>
                    </ResponsiveContainer>
                  ) : <Box sx={{ height:220, display:'flex', alignItems:'center', justifyContent:'center' }}><Typography color="text.secondary">No data</Typography></Box>}
                </CardContent>
              </Card>
            </Grid>

            {/* Top users */}
            <Grid item xs={12} md={6}>
              <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3 }}>
                <CardContent sx={{ p:3 }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
                    <Avatar sx={{ bgcolor:C.lighter, width:40, height:40 }}><Stars sx={{ color:C.primary }} /></Avatar>
                    <Box><Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Top Active Users</Typography><Typography variant="caption" color="text.secondary">Most active library members</Typography></Box>
                  </Box>
                  {topUsers.length > 0 ? (
                    <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                      {topUsers.slice(0,6).map((u,i)=>(
                        <Box key={i} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', p:1.5, borderRadius:2, border:`1px solid ${C.light}`, bgcolor:i===0?`${C.primary}08`:C.lighter }}>
                          <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                            <Avatar sx={{ width:36, height:36, fontSize:'.85rem', fontWeight:700, background:i===0?`linear-gradient(135deg,${C.primary},${C.secondary})`:`linear-gradient(135deg,${C.secondary},${C.accent})` }}>
                              {(u.full_name||'U')[0].toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700} sx={{ color:C.dark }}>{u.full_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                            </Box>
                          </Box>
                          <Chip label={`${u.loan_count||0} loans`} size="small" sx={{ bgcolor:`${C.primary}15`, color:C.primary, fontWeight:700 }} />
                        </Box>
                      ))}
                    </Box>
                  ) : <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', height:200 }}><Typography color="text.secondary">No data</Typography></Box>}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── RECENT ACTIVITIES ── */}
          <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, mb:4 }}>
            <CardContent sx={{ p:3 }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
                <Avatar sx={{ bgcolor:C.lighter, width:44, height:44 }}><History sx={{ color:C.primary }} /></Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Recent Activities</Typography>
                  <Typography variant="caption" color="text.secondary">{acts.length} total activities</Typography>
                </Box>
              </Box>
              {acts.length === 0 ? (
                <Box sx={{ textAlign:'center', py:5 }}><Typography color="text.secondary">No recent activities</Typography></Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ background:`linear-gradient(135deg,${C.primary},${C.secondary})` }}>
                          {['Activity','User','Details','Date & Time'].map(h=>(
                            <TableCell key={h} sx={{ color:'white', fontWeight:700, py:1.5 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pageActs.map((act,i)=>(
                          <TableRow key={i} hover sx={{ bgcolor:i%2===0?'white':C.lighter, '&:hover':{ bgcolor:`${C.light}80` } }}>
                            <TableCell>
                              <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                                <Avatar sx={{ width:34, height:34, bgcolor:`${C.primary}12`, color:C.primary }}>{aIcon(act.action)}</Avatar>
                                <Typography variant="body2" fontWeight={700} sx={{ color:C.dark }}>{act.action}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{act.user_name||'—'}</Typography>
                              <Typography variant="caption" color="text.secondary">{act.user_role||''}</Typography>
                            </TableCell>
                            <TableCell><Typography variant="body2" color="text.secondary">{act.details||act.description||'—'}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ whiteSpace:'nowrap' }}>{act.created_at?new Date(act.created_at).toLocaleString():'—'}</Typography></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={acts.length}
                    rowsPerPage={rowsPerPage} page={activitiesPage}
                    onPageChange={(_,p)=>setActivitiesPage(p)}
                    onRowsPerPageChange={e=>{ setRowsPerPage(parseInt(e.target.value,10)); setActivitiesPage(0); }} />
                </>
              )}
            </CardContent>
          </Card>

          {/* ── QUICK ACTIONS ── */}
          <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, mb:4 }}>
            <CardContent sx={{ p:3 }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:3 }}>
                <Avatar sx={{ bgcolor:C.lighter, width:44, height:44 }}><Build sx={{ color:C.primary }} /></Avatar>
                <Box><Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>System Management</Typography><Typography variant="caption" color="text.secondary">Maintenance, backups &amp; utilities</Typography></Box>
              </Box>
              <Grid container spacing={2}>
                {[
                  { label:'Create Backup',     icon:<Backup/>,           action:()=>handleAction('create_backup'),     color:C.primary,   desc:'Back up database now' },
                  { label:'Restore Backup',    icon:<RestartAlt/>,       action:openRestoreDialog,                     color:'#8b5cf6',   desc:'Restore from backup file' },
                  { label:'Export Data',       icon:<Download/>,         action:()=>handleAction('export_data'),       color:'#3b82f6',   desc:'Export library data' },
                  { label:'Clear Cache',       icon:<CleaningServices/>, action:()=>handleAction('clear_cache'),       color:'#f59e0b',   desc:'Flush all cached data' },
                  { label:'Optimize DB',       icon:<Speed/>,            action:()=>handleAction('optimize_database'), color:C.secondary, desc:'Run DB optimisation' },
                  { label:'Health Check',      icon:<HealthAndSafety/>,  action:()=>handleAction('health_check'),      color:'#06b6d4',   desc:'Run full health check' },
                  { label:'System Settings',   icon:<Settings/>,         action:()=>setOpenDialog('settings'),         color:C.dark,      desc:'Edit system config' },
                  { label:'Emergency Actions', icon:<PowerSettingsNew/>, action:()=>setOpenDialog('emergency'),        color:'#ef4444',   desc:'Maintenance &amp; shutdown' },
                ].map((a,i)=>(
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Grow in timeout={300+i*60}>
                      <Paper elevation={0} onClick={a.action} sx={{ p:2.5, borderRadius:3, cursor:'pointer', bgcolor:C.lighter, border:`2px solid ${C.light}`,
                        transition:'all .3s', '&:hover':{ transform:'translateY(-5px)', bgcolor:'white', borderColor:a.color, boxShadow:`0 12px 24px ${a.color}20` } }}>
                        <Avatar sx={{ width:48, height:48, bgcolor:`${a.color}15`, mb:1.5, border:`2px solid ${a.color}30` }}>
                          {React.cloneElement(a.icon, { sx:{ color:a.color, fontSize:24 } })}
                        </Avatar>
                        <Typography variant="body1" fontWeight={700} sx={{ color:C.dark, mb:.3 }}>{a.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{a.desc}</Typography>
                      </Paper>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* ══════════════ DIALOGS ══════════════ */}

          {/* Settings */}
          <Dialog open={openDialog==='settings'} onClose={()=>setOpenDialog('')} maxWidth="md" fullWidth PaperProps={{ sx:{ borderRadius:3, overflow:'hidden' } }}>
            <DialogTitle sx={{ background:`linear-gradient(135deg,${C.primary},${C.secondary})`, color:'white', fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              System Settings
              <IconButton onClick={()=>setOpenDialog('')} sx={{ color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,.2)' } }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt:3 }}>
              <Tabs value={activeTab} onChange={(_,v)=>setActiveTab(v)} sx={{ mb:3, '& .Mui-selected':{ color:`${C.primary}!important` }, '& .MuiTabs-indicator':{ bgcolor:C.primary } }}>
                {['Performance','Security','Notifications','Backup'].map((t,i)=><Tab key={i} label={t} />)}
              </Tabs>

              {activeTab===0 && (
                <Grid container spacing={2}>
                  {[['Caching','caching_enabled'],['Auto Optimisation','auto_optimization'],['Debug Mode','debug_mode'],['Query Optimisation','query_optimization'],['Compression','compression_enabled']].map(([l,f])=>(
                    <Grid item xs={12} sm={6} key={f}>
                      <Paper elevation={0} sx={{ p:2, bgcolor:C.lighter, borderRadius:2, display:'flex', justifyContent:'space-between', alignItems:'center', border:`1px solid ${C.light}` }}>
                        <Typography variant="body2" fontWeight={600}>{l}</Typography>
                        <Switch checked={!!settings.performance[f]} onChange={e=>setSetting('performance',f,e.target.checked)} sx={{ '& .Mui-checked':{ color:`${C.primary}!important` }, '& .Mui-checked+.MuiSwitch-track':{ bgcolor:`${C.secondary}!important` } }} />
                      </Paper>
                    </Grid>
                  ))}
                  {[['Memory Limit (MB)','memory_limit_mb'],['Max Exec Time (s)','max_execution_time'],['Upload Max (MB)','upload_max_size_mb']].map(([l,f])=>(
                    <Grid item xs={12} sm={4} key={f}>
                      <TextField fullWidth type="number" label={l} value={settings.performance[f]||0} onChange={e=>setSetting('performance',f,Number(e.target.value))}
                        sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {activeTab===1 && (
                <Grid container spacing={2}>
                  {[['Two-Factor Auth','two_factor_auth'],['Login Monitoring','login_monitoring'],['IP Restrictions','ip_restrictions'],['Failed Login Alerts','failed_login_alerts'],['Suspicious Activity','suspicious_activity_detection'],['Realtime Scanning','realtime_security_scanning']].map(([l,f])=>(
                    <Grid item xs={12} sm={6} key={f}>
                      <Paper elevation={0} sx={{ p:2, bgcolor:C.lighter, borderRadius:2, display:'flex', justifyContent:'space-between', alignItems:'center', border:`1px solid ${C.light}` }}>
                        <Typography variant="body2" fontWeight={600}>{l}</Typography>
                        <Switch checked={!!settings.security[f]} onChange={e=>setSetting('security',f,e.target.checked)} sx={{ '& .Mui-checked':{ color:`${C.primary}!important` }, '& .Mui-checked+.MuiSwitch-track':{ bgcolor:`${C.secondary}!important` } }} />
                      </Paper>
                    </Grid>
                  ))}
                  {[['Max Login Attempts','max_login_attempts'],['Session Timeout (min)','session_timeout_minutes']].map(([l,f])=>(
                    <Grid item xs={12} sm={6} key={f}>
                      <TextField fullWidth type="number" label={l} value={settings.security[f]||0} onChange={e=>setSetting('security',f,Number(e.target.value))}
                        sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {activeTab===2 && (
                <Grid container spacing={2}>
                  {[['Email Notifications','email_notifications'],['SMS Alerts','sms_alerts'],['System Alerts','system_alerts'],['Push Notifications','push_notifications']].map(([l,f])=>(
                    <Grid item xs={12} sm={6} key={f}>
                      <Paper elevation={0} sx={{ p:2, bgcolor:C.lighter, borderRadius:2, display:'flex', justifyContent:'space-between', alignItems:'center', border:`1px solid ${C.light}` }}>
                        <Typography variant="body2" fontWeight={600}>{l}</Typography>
                        <Switch checked={!!settings.notifications[f]} onChange={e=>setSetting('notifications',f,e.target.checked)} sx={{ '& .Mui-checked':{ color:`${C.primary}!important` }, '& .Mui-checked+.MuiSwitch-track':{ bgcolor:`${C.secondary}!important` } }} />
                      </Paper>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <TextField fullWidth label="Admin Email" value={settings.notifications.admin_email||''} onChange={e=>setSetting('notifications','admin_email',e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }} />
                  </Grid>
                  {[['CPU Alert Threshold (%)','cpu_usage_alert_threshold'],['Memory Alert Threshold (%)','memory_usage_alert_threshold'],['Disk Alert Threshold (%)','disk_usage_alert_threshold']].map(([l,f])=>(
                    <Grid item xs={12} sm={4} key={f}>
                      <TextField fullWidth type="number" label={l} value={settings.notifications[f]||0} onChange={e=>setSetting('notifications',f,Number(e.target.value))}
                        sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }} />
                    </Grid>
                  ))}
                </Grid>
              )}

              {activeTab===3 && (
                <Grid container spacing={2}>
                  {[['Automatic Backups','automatic_backups'],['Detailed Logging','detailed_logging']].map(([l,f])=>(
                    <Grid item xs={12} sm={6} key={f}>
                      <Paper elevation={0} sx={{ p:2, bgcolor:C.lighter, borderRadius:2, display:'flex', justifyContent:'space-between', alignItems:'center', border:`1px solid ${C.light}` }}>
                        <Typography variant="body2" fontWeight={600}>{l}</Typography>
                        <Switch checked={!!settings.backup[f]} onChange={e=>setSetting('backup',f,e.target.checked)} sx={{ '& .Mui-checked':{ color:`${C.primary}!important` }, '& .Mui-checked+.MuiSwitch-track':{ bgcolor:`${C.secondary}!important` } }} />
                      </Paper>
                    </Grid>
                  ))}
                  {[{ l:'Backup Frequency', f:'backup_frequency', opts:[['daily','Daily'],['weekly','Weekly'],['monthly','Monthly']] },
                    { l:'Log Level',        f:'log_level',        opts:[['info','Info'],['debug','Debug'],['error','Error']] }].map(s=>(
                    <Grid item xs={12} sm={6} key={s.f}>
                      <TextField select fullWidth label={s.l} value={settings.backup[s.f]||''} onChange={e=>setSetting('backup',s.f,e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }}>
                        {s.opts.map(([v,lbl])=><MenuItem key={v} value={v}>{lbl}</MenuItem>)}
                      </TextField>
                    </Grid>
                  ))}
                  {[['Backup Retention (days)','backup_retention_days'],['Log Retention (days)','log_retention_days']].map(([l,f])=>(
                    <Grid item xs={12} sm={6} key={f}>
                      <TextField fullWidth type="number" label={l} value={settings.backup[f]||0} onChange={e=>setSetting('backup',f,Number(e.target.value))}
                        sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </DialogContent>
            <DialogActions sx={{ p:2.5, gap:1 }}>
              <Button onClick={()=>setOpenDialog('')} variant="outlined" sx={{ borderColor:'#e5e7eb', color:'text.secondary', borderRadius:2 }}>Cancel</Button>
              <Button onClick={handleSaveSettings} variant="contained" disabled={loading} sx={{ ...gBtn(), px:4 }}>
                {loading ? <CircularProgress size={20} sx={{ color:'white' }} /> : 'Save Settings'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Emergency */}
          <Dialog open={openDialog==='emergency'} onClose={()=>setOpenDialog('')} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, overflow:'hidden' } }}>
            <DialogTitle sx={{ background:'linear-gradient(135deg,#ef4444,#f87171)', color:'white', fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              Emergency Actions
              <IconButton onClick={()=>setOpenDialog('')} sx={{ color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,.2)' } }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt:3 }}>
              <Alert severity="error" sx={{ mb:3, borderRadius:2 }}>These actions affect the entire system. Use with extreme caution.</Alert>
              <Grid container spacing={2}>
                {[
                  { label:'Enable Maintenance',  icon:<Build/>,          action:'maintenance_mode_on',  color:'#f59e0b' },
                  { label:'Disable Maintenance', icon:<CheckCircle/>,    action:'maintenance_mode_off', color:C.secondary },
                  { label:'Force Restart',        icon:<RestartAlt/>,     action:'restart_system',       color:'#ef4444' },
                  { label:'Clear All Cache',      icon:<CleaningServices/>,action:'clear_all_cache',    color:'#3b82f6' },
                ].map((a,i)=>(
                  <Grid item xs={12} sm={6} key={i}>
                    <Button fullWidth variant="outlined" startIcon={a.icon} onClick={()=>{ handleAction(a.action); setOpenDialog(''); }}
                      sx={{ py:1.5, borderRadius:2, borderColor:`${a.color}60`, color:a.color, fontWeight:700, '&:hover':{ borderColor:a.color, bgcolor:`${a.color}10` } }}>
                      {a.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
          </Dialog>

          {/* Restore Backup */}
          <Dialog open={openDialog==='restore_backup'} onClose={()=>setOpenDialog('')} maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, overflow:'hidden' } }}>
            <DialogTitle sx={{ background:'linear-gradient(135deg,#8b5cf6,#a78bfa)', color:'white', fontWeight:700, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              Restore Backup
              <IconButton onClick={()=>setOpenDialog('')} sx={{ color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,.2)' } }}><Close /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt:3 }}>
              <Alert severity="warning" sx={{ mb:3, borderRadius:2 }}>Restoring a backup will overwrite the current database. This cannot be undone.</Alert>
              <TextField select fullWidth label="Select Backup" value={selectedBackup?.name||''} sx={{ mb:2.5, '& .MuiOutlinedInput-root':{ borderRadius:2 } }}
                onChange={e => { const b = backups.find(b => b.name===e.target.value); setSelectedBackup(b||null); }}>
                {backups.map(b=><MenuItem key={b.name} value={b.name}>{b.name} — {b.size_formatted||''} ({b.created_at?new Date(b.created_at).toLocaleString():''})</MenuItem>)}
              </TextField>
              <TextField fullWidth label='Type "RESTORE" to confirm' value={restoreConfirm} onChange={e=>setRestoreConfirm(e.target.value)}
                error={restoreConfirm.length>0 && restoreConfirm!=='RESTORE'} helperText={restoreConfirm.length>0&&restoreConfirm!=='RESTORE'?'Must type exactly RESTORE':''}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
            </DialogContent>
            <DialogActions sx={{ p:2.5, gap:1 }}>
              <Button onClick={()=>setOpenDialog('')} variant="outlined" sx={{ borderColor:'#e5e7eb', color:'text.secondary', borderRadius:2 }}>Cancel</Button>
              <Button onClick={handleRestore} variant="contained" disabled={loading||!selectedBackup||restoreConfirm!=='RESTORE'}
                sx={{ background:'linear-gradient(135deg,#8b5cf6,#a78bfa)', color:'white', fontWeight:700, borderRadius:2, px:3, '&:hover':{ background:'linear-gradient(135deg,#7c3aed,#8b5cf6)' }, '&.Mui-disabled':{ opacity:.5 } }}>
                {loading ? <CircularProgress size={20} sx={{ color:'white' }} /> : 'Restore Now'}
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Fade>
    </DashboardLayout>
  );
}

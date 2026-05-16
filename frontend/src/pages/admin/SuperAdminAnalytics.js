import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Skeleton
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  MenuBook,
  AttachMoney,
  Warning,
  Refresh,
  Analytics as AnalyticsIcon,
  Schedule,
  LocalLibrary,
  Assignment,
  PersonAdd,
  Replay,
  ShowChart,
  PieChart as PieChartIcon,
  Timeline,
  EmojiEvents,
  SupervisorAccount,
  AdminPanelSettings,
  Block,
  CheckCircle
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ComposedChart
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const API = 'http://localhost:8000/api/super-admin/analytics';
const RED = '#d32f2f';
const CHART_COLORS = ['#d32f2f', '#f44336', '#ff7043', '#ff9800', '#ffc107', '#4a9b8e', '#2196f3', '#9c27b0', '#607d8b'];

const formatMonth = (monthStr) => {
  if (!monthStr) return '';
  const [y, m] = monthStr.split('-');
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const formatPct = (v) => (v > 0 ? `+${v}%` : `${v}%`);

const KpiCard = ({ title, value, subtitle, icon, color, trend, onClick, active }) => (
  <Card
    onClick={onClick}
    sx={{
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      border: active ? `2px solid ${color}` : '1px solid transparent',
      transition: 'all 0.25s ease',
      '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 4 } : {}
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ color, my: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block">
              {subtitle}
            </Typography>
          )}
          {trend != null && (
            <Chip
              size="small"
              label={formatPct(trend)}
              icon={trend >= 0 ? <TrendingUp /> : <TrendingDown />}
              sx={{
                mt: 1,
                height: 22,
                bgcolor: trend >= 0 ? '#e8f5e9' : '#ffebee',
                color: trend >= 0 ? '#2e7d32' : '#c62828',
                '& .MuiChip-icon': { color: 'inherit' }
              }}
            />
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const SuperAdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [highlightKpi, setHighlightKpi] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(fetchStats, 60000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchStats]);

  const overview = stats?.overview || {};
  const analytics = stats?.analytics || {};
  const today = stats?.today || {};

  const peakHoursChart = useMemo(() => {
    const hours = analytics.peak_hours || [];
    const full = Array.from({ length: 24 }, (_, h) => {
      const found = hours.find((x) => parseInt(x.hour, 10) === h);
      return { hour: h, label: h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`, loans: found ? parseInt(found.loan_count, 10) : 0 };
    });
    return full;
  }, [analytics.peak_hours]);

  const roleChartData = useMemo(
    () =>
      (stats?.users_by_role || []).map((r) => ({
        name: r.role?.replace('-', ' ') || 'unknown',
        value: parseInt(r.count, 10),
        active: parseInt(r.active_count, 10)
      })),
    [stats?.users_by_role]
  );

  const categoryChartData = useMemo(
    () =>
      (stats?.category_distribution || [])
        .filter((c) => c.count > 0)
        .slice(0, 8)
        .map((c) => ({ name: c.category, value: parseInt(c.count, 10), fill: c.color_code || RED })),
    [stats?.category_distribution]
  );

  const monthlyChart = useMemo(() => {
    const loans = stats?.monthly_circulation || [];
    const rev = stats?.monthly_revenue || [];
    const months = [...new Set([...loans.map((l) => l.month), ...rev.map((r) => r.month)])].sort();
    return months.map((month) => ({
      month: formatMonth(month),
      loans: parseInt(loans.find((l) => l.month === month)?.loans || 0, 10),
      revenue: parseFloat(rev.find((r) => r.month === month)?.revenue || 0)
    }));
  }, [stats?.monthly_circulation, stats?.monthly_revenue]);

  const dailyTrend = useMemo(
    () =>
      (stats?.daily_trend || []).map((d) => ({
        ...d,
        dateLabel: formatDateShort(d.date),
        loans: d.loans || 0,
        returns: d.returns || 0,
        registrations: d.registrations || 0
      })),
    [stats?.daily_trend]
  );

  if (loading && !stats) {
    return (
      <DashboardLayout title="Super Admin Panel">
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width={300} height={48} />
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={360} sx={{ mt: 3 }} />
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
                <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle', color: RED }} />
                System Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Live insights from your library database — last {days} days
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                size="small"
                value={days}
                exclusive
                onChange={(_, v) => v && setDays(v)}
                color="error"
              >
                <ToggleButton value={7}>7d</ToggleButton>
                <ToggleButton value={30}>30d</ToggleButton>
                <ToggleButton value={90}>90d</ToggleButton>
                <ToggleButton value={180}>6mo</ToggleButton>
              </ToggleButtonGroup>
              <Chip
                label={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                onClick={() => setAutoRefresh(!autoRefresh)}
                color={autoRefresh ? 'error' : 'default'}
                variant={autoRefresh ? 'filled' : 'outlined'}
                size="small"
              />
              {lastUpdate && (
                <Chip icon={<Schedule />} label={lastUpdate.toLocaleTimeString()} size="small" variant="outlined" />
              )}
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchStats} disabled={loading} sx={{ bgcolor: RED, color: 'white', '&:hover': { bgcolor: '#b71c1c' } }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={fetchStats}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress color="error" sx={{ mb: 2 }} />}

        {/* KPI row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { key: 'users', title: 'Total users', value: overview.total_users, sub: `${overview.active_users} active`, icon: <People />, color: '#1976d2', trend: analytics.monthly_comparison?.users?.change, tab: 2 },
            { key: 'books', title: 'Books / copies', value: `${overview.total_books}`, sub: `${overview.total_copies} copies · ${overview.borrow_rate}% borrowed`, icon: <MenuBook />, color: '#2e7d32', tab: 1 },
            { key: 'loans', title: 'Active loans', value: overview.active_loans, sub: `${overview.overdue_loans} overdue`, icon: <Assignment />, color: '#7b1fa2', trend: analytics.monthly_comparison?.loans?.change, tab: 1 },
            { key: 'revenue', title: 'Revenue collected', value: formatCurrency(overview.total_revenue), sub: `${formatCurrency(overview.outstanding_fines)} outstanding`, icon: <AttachMoney />, color: '#e65100', tab: 3 },
            { key: 'staff', title: 'Staff', value: (overview.admins || 0) + (overview.librarians || 0), sub: `${overview.admins} admins · ${overview.librarians} librarians`, icon: <SupervisorAccount />, color: RED, tab: 2 },
            { key: 'health', title: 'Reservations', value: overview.pending_reservations, sub: 'Pending holds', icon: <Warning />, color: overview.overdue_loans > 0 ? '#d32f2f' : '#4a9b8e', tab: 0 }
          ].map((k) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={k.key}>
              <KpiCard
                {...k}
                active={highlightKpi === k.key}
                onClick={() => {
                  setHighlightKpi(k.key);
                  setTab(k.tab);
                }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Today strip */}
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
            color: 'white',
            borderRadius: 3
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Today&apos;s activity
          </Typography>
          <Grid container spacing={2}>
            {[
              { label: 'Loans', value: today.loans, icon: <LocalLibrary /> },
              { label: 'Returns', value: today.returns, icon: <Replay /> },
              { label: 'Registrations', value: today.registrations, icon: <PersonAdd /> },
              { label: 'Revenue', value: formatCurrency(today.revenue), icon: <AttachMoney /> }
            ].map((item) => (
              <Grid item xs={6} md={3} key={item.label}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>{item.icon}</Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {item.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {item.label}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" icon={<ShowChart />} iconPosition="start" />
          <Tab label="Circulation" icon={<MenuBook />} iconPosition="start" />
          <Tab label="Members & staff" icon={<People />} iconPosition="start" />
          <Tab label="Revenue" icon={<AttachMoney />} iconPosition="start" />
        </Tabs>

        {/* Tab: Overview */}
        {tab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Daily activity trend
                  </Typography>
                  <Box sx={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dailyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                        <ChartTooltip />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="loans" name="Loans" fill="#ffcdd2" stroke={RED} fillOpacity={0.4} />
                        <Line yAxisId="left" type="monotone" dataKey="returns" name="Returns" stroke="#4a9b8e" strokeWidth={2} dot={false} />
                        <Bar yAxisId="right" dataKey="registrations" name="New users" fill="#2196f3" barSize={8} radius={[4, 4, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Performance ({days}d)
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {[
                      { label: 'Collection utilization', value: analytics.collection_utilization?.utilization_rate || 0, color: RED },
                      { label: 'Return rate', value: analytics.return_analysis?.return_rate || 0, color: '#4a9b8e' },
                      { label: 'On-time returns', value: analytics.satisfaction_metrics?.on_time_rate || 0, color: '#2e7d32' }
                    ].map((m) => (
                      <Box key={m.label} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">{m.label}</Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {m.value}%
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={Math.min(100, m.value)} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: m.color } }} />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Live activity feed
                  </Typography>
                  <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
                    {(stats?.recent_activities || []).length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No recent activity in the last 48 hours
                      </Typography>
                    ) : (
                      stats.recent_activities.map((a, i) => (
                        <ListItem key={i} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: a.type === 'loan' ? '#e3f2fd' : a.type === 'return' ? '#e8f5e9' : '#fce4ec', width: 36, height: 36 }}>
                              {a.type === 'loan' ? <MenuBook fontSize="small" /> : a.type === 'return' ? <Replay fontSize="small" /> : <PersonAdd fontSize="small" />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={a.user_name}
                            secondary={`${a.action}${a.book_title ? ` — ${a.book_title}` : ''}`}
                            primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(a.activity_date).toLocaleString()}
                          </Typography>
                        </ListItem>
                      ))
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    6-month circulation & revenue
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={monthlyChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="l" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} />
                        <ChartTooltip />
                        <Legend />
                        <Bar yAxisId="l" dataKey="loans" name="Loans" fill={RED} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="r" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#ff9800" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab: Circulation */}
        {tab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Peak hours (loans by hour)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHoursChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip formatter={(v) => [`${v} loans`, 'Loans']} />
                        <Bar dataKey="loans" fill={RED} radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Weekly loan patterns
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(analytics.weekly_patterns || []).map((d) => ({ ...d, day: d.day_name?.substring(0, 3), loans: parseInt(d.loan_count, 10) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip />
                        <Bar dataKey="loans" name="Loans" fill="#f44336" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEvents sx={{ color: '#ffa726' }} />
                    Top books ({days} days)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Author</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Loans</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(analytics.popular_books || []).map((book, i) => (
                          <TableRow key={i} hover>
                            <TableCell>
                              <Chip label={i + 1} size="small" sx={{ bgcolor: i < 3 ? '#ffa726' : '#eee', color: i < 3 ? 'white' : 'inherit', fontWeight: 700 }} />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600}>{book.title}</Typography>
                            </TableCell>
                            <TableCell>{book.author}</TableCell>
                            <TableCell>
                              <Chip label={book.category || '—'} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={book.loan_count} color="error" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab: Members */}
        {tab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Users by role
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={roleChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {roleChartData.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Account status
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(stats?.user_status || []).map((s) => ({ name: s.status, value: parseInt(s.count, 10) }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                        >
                          {(stats?.user_status || []).map((s, i) => (
                            <Cell key={i} fill={s.status === 'active' ? '#4caf50' : s.status === 'suspended' ? RED : '#9e9e9e'} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Staff breakdown
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: RED }}>
                          <AdminPanelSettings />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Administrators" secondary={`${overview.admins} accounts`} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                          <SupervisorAccount />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Librarians" secondary={`${overview.librarians} accounts`} />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#1976d2' }}>
                          <People />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary="Members" secondary={`${overview.members} accounts`} />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Most active members ({days}d)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Member</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell align="right">Loans</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(stats?.top_members || []).map((m, i) => (
                          <TableRow key={i} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#4a9b8e' }}>{m.full_name?.charAt(0)}</Avatar>
                                <Typography fontWeight={600}>{m.full_name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{m.email}</TableCell>
                            <TableCell align="right">
                              <Chip label={m.loan_count} color="primary" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tab: Revenue */}
        {tab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Monthly revenue (6 months)
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(v) => `$${v}`} />
                        <ChartTooltip formatter={(v) => formatCurrency(v)} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#ff9800" fill="#ffe0b2" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Fine breakdown ({days}d)
                  </Typography>
                  {(analytics.revenue_breakdown || []).length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      No fines in this period
                    </Typography>
                  ) : (
                    <Box sx={{ mt: 2 }}>
                      {(analytics.revenue_breakdown || []).map((item, i) => {
                        const total = (analytics.revenue_breakdown || []).reduce((s, r) => s + parseFloat(r.total_amount || 0), 0) || 1;
                        const pct = ((parseFloat(item.total_amount || 0) / total) * 100).toFixed(1);
                        return (
                          <Box key={i} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {(item.fine_type || 'other').replace(/_/g, ' ')}
                              </Typography>
                              <Typography variant="body2" fontWeight={700}>
                                {formatCurrency(item.total_amount)}
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={parseFloat(pct)} sx={{ mt: 0.5, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: CHART_COLORS[i % CHART_COLORS.length] } }} />
                            <Typography variant="caption" color="text.secondary">
                              {item.fine_count} fines · {pct}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Books by category
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                        <ChartTooltip />
                        <Bar dataKey="value" name="Books" radius={[0, 4, 4, 0]}>
                          {categoryChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill || CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default SuperAdminAnalytics;

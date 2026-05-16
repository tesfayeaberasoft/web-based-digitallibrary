import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Alert,
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
  TablePagination,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  Shield,
  Refresh,
  Block,
  LockOpen,
  DeleteSweep,
  Warning,
  PersonOff,
  Security,
  Email,
  Computer,
  BugReport,
  CheckCircle,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const API = 'http://localhost:8000/api/super-admin/security';
const ATTEMPTS_PER_PAGE = 10;
const RED = '#d32f2f';
const GRADIENT = 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)';

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

const StatCard = ({ title, value, subtitle, color = RED, icon }) => (
  <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={color}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ bgcolor: `${color}18`, p: 1.2, borderRadius: 2 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const SuperAdminSecurity = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [period, setPeriod] = useState('24h');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blockDialog, setBlockDialog] = useState({ open: false, ip: '' });
  const [confirmClear, setConfirmClear] = useState(false);
  const [attemptsPage, setAttemptsPage] = useState(1);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  const loadData = useCallback(async (page = 1, { attemptsOnly = false } = {}) => {
    if (attemptsOnly) {
      setAttemptsLoading(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const res = await axios.get(API, {
        headers: authHeaders(),
        params: {
          login_attempts_page: page,
          login_attempts_per_page: ATTEMPTS_PER_PAGE
        }
      });
      if (res.data?.success) {
        setData(res.data.data);
        setAttemptsPage(res.data.data?.recent_attempts_pagination?.page ?? page);
      } else {
        throw new Error(res.data?.message || 'Failed to load security data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load security data');
    } finally {
      setLoading(false);
      setAttemptsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handleAttemptsPageChange = (newPage) => {
    const page = newPage + 1;
    loadData(page, { attemptsOnly: true });
  };

  const runAction = async (action, payload = {}) => {
    setActionLoading(action);
    setError('');
    try {
      const res = await axios.post(API, { action, ...payload }, { headers: authHeaders() });
      if (res.data?.success) {
        setSuccess(res.data.message || 'Action completed');
        if (res.data.data) {
          setData(res.data.data);
          setAttemptsPage(res.data.data?.recent_attempts_pagination?.page ?? 1);
        } else {
          await loadData(attemptsPage);
        }
        return true;
      }
      throw new Error(res.data?.message || 'Action failed');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Action failed');
      return false;
    } finally {
      setActionLoading('');
    }
  };

  const failedData = period === '7d' ? data?.failed_7d : data?.failed_24h;
  const summary = data?.summary || {};
  const threshold = data?.settings?.failed_login_threshold ?? 10;
  const blockedSet = new Set(data?.blocked_ips || []);

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString();
  };

  if (loading && !data) {
    return (
      <DashboardLayout title="Security Operations">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: RED }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Security Operations">
      <Box sx={{ mb: 3 }}>
        <Paper
          sx={{
            p: 3,
            background: GRADIENT,
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Shield sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Security Operations Center
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Monitor failed logins, block suspicious IPs, and review inactive admin accounts
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{ bgcolor: 'white', color: RED, '&:hover': { bgcolor: '#f5f5f5' } }}
              startIcon={<Refresh />}
              onClick={() => {
                setAttemptsPage(1);
                loadData(1);
              }}
              disabled={!!actionLoading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              sx={{ borderColor: 'white', color: 'white' }}
              startIcon={<BugReport />}
              disabled={!!actionLoading}
              onClick={() => runAction('run_scan')}
            >
              Run scan
            </Button>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Failed logins (24h)"
            value={summary.failed_logins_24h ?? 0}
            subtitle={`Alert threshold: ${threshold}`}
            color={summary.failed_logins_24h >= threshold ? '#ed6c02' : RED}
            icon={<Warning sx={{ color: summary.failed_logins_24h >= threshold ? '#ed6c02' : RED }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Suspicious IPs"
            value={summary.suspicious_ips ?? 0}
            subtitle="≥ threshold failures in 24h"
            color="#9c27b0"
            icon={<Computer sx={{ color: '#9c27b0' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive admins"
            value={summary.inactive_admins ?? 0}
            subtitle="No login in 90+ days"
            color="#1976d2"
            icon={<PersonOff sx={{ color: '#1976d2' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Blocked IPs"
            value={summary.blocked_ips ?? 0}
            subtitle={data?.settings?.ip_restrictions ? 'Enforcement active' : 'Blocklist only'}
            color="#2e7d32"
            icon={<Block sx={{ color: '#2e7d32' }} />}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, v) => v && setPeriod(v)}
          size="small"
          color="error"
        >
          <ToggleButton value="24h">Last 24 hours</ToggleButton>
          <ToggleButton value="7d">Last 7 days</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteSweep />}
          disabled={!!actionLoading}
          onClick={() => setConfirmClear(true)}
        >
          Clear all failed attempts
        </Button>
        <Button
          color="error"
          variant="contained"
          startIcon={<Block />}
          disabled={!!actionLoading}
          onClick={() => setBlockDialog({ open: true, ip: '' })}
        >
          Block IP
        </Button>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Computer color="error" /> Failed logins by IP
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>IP address</TableCell>
                      <TableCell align="right">Attempts</TableCell>
                      <TableCell>Last attempt</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(failedData?.by_ip || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No failed login attempts in this period
                        </TableCell>
                      </TableRow>
                    ) : (
                      failedData.by_ip.map((row) => {
                        const ip = row.ip_address || 'Unknown';
                        const isBlocked = blockedSet.has(ip);
                        return (
                          <TableRow key={ip} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {ip}
                                {isBlocked && <Chip label="Blocked" size="small" color="error" />}
                                {parseInt(row.attempts, 10) >= threshold && (
                                  <Chip label="Suspicious" size="small" color="warning" />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{row.attempts}</TableCell>
                            <TableCell>{formatTime(row.last_attempt)}</TableCell>
                            <TableCell align="right">
                              {!isBlocked ? (
                                <Tooltip title="Block IP">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    disabled={!!actionLoading || ip === 'Unknown'}
                                    onClick={() => runAction('block_ip', { ip })}
                                  >
                                    <Block fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Unblock IP">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    disabled={!!actionLoading}
                                    onClick={() => runAction('unblock_ip', { ip })}
                                  >
                                    <LockOpen fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Clear attempts for this IP">
                                <IconButton
                                  size="small"
                                  disabled={!!actionLoading || ip === 'Unknown'}
                                  onClick={() => runAction('clear_ip_attempts', { ip })}
                                >
                                  <DeleteSweep fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="error" /> Failed logins by email
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Attempts</TableCell>
                      <TableCell>Last attempt</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(failedData?.by_email || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No failed login attempts in this period
                        </TableCell>
                      </TableRow>
                    ) : (
                      failedData.by_email.map((row) => (
                        <TableRow key={row.email} hover>
                          <TableCell>{row.email}</TableCell>
                          <TableCell align="right">{row.attempts}</TableCell>
                          <TableCell>{formatTime(row.last_attempt)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Clear attempts for this email">
                              <IconButton
                                size="small"
                                disabled={!!actionLoading}
                                onClick={() => runAction('clear_email_attempts', { email: row.email })}
                              >
                                <DeleteSweep fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettings color="error" /> Inactive admin accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Admins with no login in the last 90 days
              </Typography>
              {(data?.inactive_admins || []).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography color="text.secondary">All admin accounts have recent activity</Typography>
                </Box>
              ) : (
                <List dense>
                  {data.inactive_admins.map((admin) => (
                    <React.Fragment key={admin.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${admin.full_name} (${admin.role})`}
                          secondary={
                            <>
                              {admin.email}
                              <br />
                              Last login: {admin.last_login ? formatTime(admin.last_login) : 'Never'}
                              {' · '}
                              {admin.days_inactive} days inactive
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            onClick={() => navigate('/super-admin/admins')}
                          >
                            Manage
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Block color="error" /> IP blocklist
              </Typography>
              {(data?.blocked_ips || []).length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No IPs are currently blocked. Block addresses from the failed-login table or use Block IP above.
                </Typography>
              ) : (
                <List dense>
                  {data.blocked_ips.map((ip) => (
                    <ListItem key={ip}>
                      <ListItemText primary={ip} secondary="Login blocked" />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<LockOpen />}
                          disabled={!!actionLoading}
                          onClick={() => runAction('unblock_ip', { ip })}
                        >
                          Unblock
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security color="error" /> Recent login attempts
                </Typography>
                {data?.recent_attempts_pagination?.total != null && (
                  <Typography variant="body2" color="text.secondary">
                    {data.recent_attempts_pagination.total} total record
                    {data.recent_attempts_pagination.total === 1 ? '' : 's'}
                  </Typography>
                )}
              </Box>
              <TableContainer sx={{ position: 'relative', minHeight: 120 }}>
                {attemptsLoading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.7)',
                      zIndex: 1
                    }}
                  >
                    <CircularProgress size={32} sx={{ color: RED }} />
                  </Box>
                )}
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Result</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.recent_attempts || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No login attempts recorded yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      (data?.recent_attempts || []).map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{formatTime(row.attempted_at)}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell>{row.ip_address || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={parseInt(row.success, 10) ? 'Success' : 'Failed'}
                              color={parseInt(row.success, 10) ? 'success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {(data?.recent_attempts_pagination?.total_pages ?? 0) > 0 && (
                <TablePagination
                  count={data.recent_attempts_pagination.total}
                  page={Math.max(0, (data.recent_attempts_pagination.page ?? 1) - 1)}
                  onPageChange={(_, newPage) => handleAttemptsPageChange(newPage)}
                  rowsPerPage={ATTEMPTS_PER_PAGE}
                  rowsPerPageOptions={[ATTEMPTS_PER_PAGE]}
                  labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
                  nextIconButtonProps={{
                    'aria-label': 'Next page',
                    disabled: attemptsLoading || !data.recent_attempts_pagination.has_next
                  }}
                  backIconButtonProps={{
                    'aria-label': 'Previous page',
                    disabled: attemptsLoading || !data.recent_attempts_pagination.has_prev
                  }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>Clear all failed login attempts?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This removes every failed attempt record from the database. Successful login history is kept.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              setConfirmClear(false);
              setAttemptsPage(1);
              await runAction('clear_failed_logins');
            }}
          >
            Clear all
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={blockDialog.open} onClose={() => setBlockDialog({ open: false, ip: '' })}>
        <DialogTitle>Block IP address</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Blocked IPs cannot sign in to the library. Enforcement is applied at login.
          </DialogContentText>
          <TextField
            fullWidth
            label="IP address"
            value={blockDialog.ip}
            onChange={(e) => setBlockDialog((p) => ({ ...p, ip: e.target.value }))}
            placeholder="e.g. 192.168.1.100"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialog({ open: false, ip: '' })}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!!actionLoading}
            onClick={async () => {
              const ip = blockDialog.ip.trim();
              if (!ip) return;
              const ok = await runAction('block_ip', { ip });
              if (ok) setBlockDialog({ open: false, ip: '' });
            }}
          >
            Block
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!success} autoHideDuration={5000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')} icon={<CheckCircle />}>
          {success}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default SuperAdminSecurity;

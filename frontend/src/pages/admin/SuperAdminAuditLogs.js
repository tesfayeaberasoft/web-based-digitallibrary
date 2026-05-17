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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  IconButton,
  CircularProgress,
  Snackbar,
  Divider
} from '@mui/material';
import {
  History,
  Refresh,
  Download,
  Close,
  FilterList,
  Person,
  Storage,
  Visibility
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const API = 'http://localhost:8000/api/super-admin/audit-logs';
const RED = '#d32f2f';
const GRADIENT = 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)';
const ROWS_PER_PAGE = 20;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

const defaultDateTo = () => new Date().toISOString().slice(0, 10);
const defaultDateFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
};

const formatAction = (action) =>
  (action || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const actionColor = (action) => {
  const a = (action || '').toLowerCase();
  if (a.includes('delete') || a.includes('suspend')) return 'error';
  if (a.includes('create') || a.includes('issue')) return 'success';
  if (a.includes('update') || a.includes('renew')) return 'info';
  if (a.includes('return')) return 'primary';
  return 'default';
};

const JsonBlock = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    {value == null ? (
      <Typography variant="body2" color="text.secondary" fontStyle="italic">
        None
      </Typography>
    ) : (
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          bgcolor: '#fafafa',
          maxHeight: 220,
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: 12,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
      </Paper>
    )}
  </Box>
);

const SuperAdminAuditLogs = () => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, per_page: ROWS_PER_PAGE, total: 0, total_pages: 0 });
  const [filterOptions, setFilterOptions] = useState({ actions: [], tables: [] });
  const [summary, setSummary] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const [dateFrom, setDateFrom] = useState(defaultDateFrom);
  const [dateTo, setDateTo] = useState(defaultDateTo);
  const [userSearch, setUserSearch] = useState('');
  const [action, setAction] = useState('');
  const [tableName, setTableName] = useState('');
  const [page, setPage] = useState(0);

  const buildParams = (pageNum, overrides = {}) => ({
    page: pageNum,
    per_page: ROWS_PER_PAGE,
    date_from: overrides.dateFrom ?? dateFrom,
    date_to: overrides.dateTo ?? dateTo,
    user_search: (overrides.userSearch ?? userSearch).trim() || undefined,
    action: overrides.action !== undefined ? overrides.action : action || undefined,
    table_name: overrides.tableName !== undefined ? overrides.tableName : tableName || undefined
  });

  const loadLogs = useCallback(async (pageNum = 1, overrides = {}) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(API, {
        headers: authHeaders(),
        params: buildParams(pageNum, overrides)
      });
      if (res.data?.success) {
        const d = res.data.data;
        setItems(d.items || []);
        setPagination(d.pagination || {});
        setFilterOptions(d.filter_options || { actions: [], tables: [] });
        setSummary(d.summary || { total: 0 });
        setPage((d.pagination?.page ?? pageNum) - 1);
      } else {
        throw new Error(res.data?.message || 'Failed to load audit logs');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, userSearch, action, tableName]);

  useEffect(() => {
    loadLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setPage(0);
    loadLogs(1);
  };

  const handleReset = () => {
    const from = defaultDateFrom();
    const to = defaultDateTo();
    setDateFrom(from);
    setDateTo(to);
    setUserSearch('');
    setAction('');
    setTableName('');
    setPage(0);
    loadLogs(1, { dateFrom: from, dateTo: to, userSearch: '', action: '', tableName: '' });
  };

  const handlePageChange = (_, newPage) => {
    loadLogs(newPage + 1);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await axios.get(API, {
        headers: authHeaders(),
        params: { ...buildParams(1), export: 'csv' },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${dateFrom}_to_${dateTo}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'CSV export failed');
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString();
  };

  return (
    <DashboardLayout title="Audit & Activity Logs">
      <Paper
        sx={{
          p: 3,
          mb: 3,
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
          <History sx={{ fontSize: 44 }} />
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Audit & Activity Log Center
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Review who changed what — loans, books, users, notifications, and more
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            sx={{ bgcolor: 'white', color: RED, '&:hover': { bgcolor: '#f5f5f5' } }}
            startIcon={<Refresh />}
            onClick={() => loadLogs(page + 1)}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            sx={{ borderColor: 'white', color: 'white' }}
            startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <Download />}
            onClick={handleExportCsv}
            disabled={exporting || loading}
          >
            Export CSV
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList fontSize="small" /> Filters
          </Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="From date"
                type="date"
                size="small"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="To date"
                type="date"
                size="small"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="User (name, email, ID)"
                size="small"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search actor..."
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select value={action} label="Action" onChange={(e) => setAction(e.target.value)}>
                  <MenuItem value="">All actions</MenuItem>
                  {filterOptions.actions.map((a) => (
                    <MenuItem key={a} value={a}>
                      {formatAction(a)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Table</InputLabel>
                <Select value={tableName} label="Table" onChange={(e) => setTableName(e.target.value)}>
                  <MenuItem value="">All tables</MenuItem>
                  {filterOptions.tables.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button variant="contained" color="error" onClick={handleSearch} disabled={loading} sx={{ mr: 1 }}>
                Apply
              </Button>
              <Button variant="outlined" onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderTop: `4px solid ${RED}` }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Matching records
              </Typography>
              <Typography variant="h4" fontWeight={700} color={RED}>
                {summary.total ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dateFrom} → {dateTo}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Action types in range
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {filterOptions.actions?.length ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Tables affected
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {filterOptions.tables?.length ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer sx={{ position: 'relative', minHeight: 200 }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255,255,255,0.75)',
                  zIndex: 1
                }}
              >
                <CircularProgress sx={{ color: RED }} />
              </Box>
            )}
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Table</TableCell>
                  <TableCell>Record</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      No audit log entries match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTime(row.created_at)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {row.user_name || 'System'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.user_email || row.user_role || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={formatAction(row.action)} color={actionColor(row.action)} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={row.table_name || '—'} />
                      </TableCell>
                      <TableCell>{row.record_id ?? '—'}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.ip_address || '—'}</TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<Visibility />} onClick={() => setSelected(row)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            count={pagination.total ?? 0}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={ROWS_PER_PAGE}
            rowsPerPageOptions={[ROWS_PER_PAGE]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
          />
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={!!selected}
        onClose={() => setSelected(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 0 } }}
      >
        {selected && (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                p: 2,
                background: GRADIENT,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Log #{selected.id}
              </Typography>
              <IconButton color="inherit" onClick={() => setSelected(null)}>
                <Close />
              </IconButton>
            </Box>
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
              <Chip
                label={formatAction(selected.action)}
                color={actionColor(selected.action)}
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatTime(selected.created_at)}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="subtitle2">Actor</Typography>
              </Box>
              <Typography variant="body2" gutterBottom>
                {selected.user_name || 'System / unknown'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                {selected.user_email}
                {selected.user_role ? ` · ${selected.user_role}` : ''}
                {selected.user_code ? ` · ${selected.user_code}` : ''}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
                <Storage fontSize="small" color="action" />
                <Typography variant="subtitle2">Target</Typography>
              </Box>
              <Typography variant="body2">
                Table: <strong>{selected.table_name || '—'}</strong>
                {selected.record_id != null ? ` · Record ID: ${selected.record_id}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: 12 }}>
                IP: {selected.ip_address || '—'}
              </Typography>
              {selected.user_agent && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {selected.user_agent}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <JsonBlock label="Previous values (old_values)" value={selected.old_values} />
              <JsonBlock label="New values (new_values)" value={selected.new_values} />
            </Box>
          </Box>
        )}
      </Drawer>

    </DashboardLayout>
  );
};

export default SuperAdminAuditLogs;

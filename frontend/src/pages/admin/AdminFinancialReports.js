import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Alert,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Paper, IconButton, Tooltip, Button, Divider
} from '@mui/material';
import {
  ReceiptLong, Refresh as RefreshIcon, AttachMoney,
  CheckCircle, Warning, HourglassEmpty, AccountBalance
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const AdminFinancialReports = () => {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({ overview: null, details: [], revenue: [] });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(amount || 0);

  const getMonthLabel = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const fetchReport = async (type) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/admin/financial-reports?type=${type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const d = response.data.data;
        if (type === 'overview') setData(prev => ({ ...prev, overview: d }));
        else if (type === 'details') setData(prev => ({ ...prev, details: Array.isArray(d) ? d : [] }));
        else if (type === 'revenue') setData(prev => ({ ...prev, revenue: Array.isArray(d) ? d : [] }));
      } else {
        setError(response.data.message || 'Failed to load report');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    const types = ['overview', 'details', 'revenue'];
    fetchReport(types[newValue]);
  };

  // Load overview on mount
  useEffect(() => { fetchReport('overview'); }, []);

  const tabTypes = ['overview', 'details', 'revenue'];

  const handleRefresh = () => fetchReport(tabTypes[tab]);

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              p: 1.5, borderRadius: 2,
              background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)'
            }}>
              <ReceiptLong sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{
                background: 'linear-gradient(45deg, #2d6a4f 30%, #52b788 90%)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Financial Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue, payments and fine collection analytics
              </Typography>
            </Box>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              sx={{ bgcolor: '#2d6a4f', color: 'white', '&:hover': { bgcolor: '#1b4332' } }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            sx={{
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' },
              '& .Mui-selected': { color: '#2d6a4f' },
              '& .MuiTabs-indicator': { backgroundColor: '#2d6a4f' }
            }}
          >
            <Tab label="📊 Overview" />
            <Tab label="🧾 Transactions" />
            <Tab label="📈 Monthly Revenue" />
          </Tabs>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#2d6a4f' }} size={56} />
          </Box>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {tab === 0 && (
              data.overview ? (
                <Grid container spacing={3}>
                  {/* Revenue Card */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)', color: 'white', borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Total Revenue</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {formatCurrency(data.overview.total_revenue)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>All time collected</Typography>
                          </Box>
                          <AttachMoney sx={{ fontSize: 48, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Transactions */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Total Transactions</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {data.overview.total_transactions || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {data.overview.successful_payments || 0} successful
                            </Typography>
                          </Box>
                          <CheckCircle sx={{ fontSize: 48, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Avg Payment */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)', color: 'white', borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Average Payment</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {formatCurrency(data.overview.average_payment)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>Per transaction</Typography>
                          </Box>
                          <AccountBalance sx={{ fontSize: 48, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Outstanding Fines */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)', color: 'white', borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Outstanding Balance</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {formatCurrency(data.overview.outstanding_balance)}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>Unpaid fines</Typography>
                          </Box>
                          <Warning sx={{ fontSize: 48, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Total Fines */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)', color: 'white', borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Total Fines Issued</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {data.overview.total_fines || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {data.overview.paid_fines || 0} paid · {data.overview.unpaid_fines || 0} unpaid
                            </Typography>
                          </Box>
                          <ReceiptLong sx={{ fontSize: 48, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Collection Rate */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)', color: 'white', borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Collection Rate</Typography>
                            <Typography variant="h4" fontWeight={700}>
                              {data.overview.collection_rate || 0}%
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>Fines collected vs issued</Typography>
                          </Box>
                          <HourglassEmpty sx={{ fontSize: 48, opacity: 0.3 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Summary Table */}
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Payment Status Breakdown</Typography>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Successful', value: data.overview.successful_payments || 0, color: 'success' },
                          { label: 'Pending', value: data.overview.pending_payments || 0, color: 'warning' },
                          { label: 'Failed', value: data.overview.failed_payments || 0, color: 'error' },
                        ].map(item => (
                          <Grid item xs={12} sm={4} key={item.label}>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                              <Chip label={item.label} color={item.color} sx={{ mb: 1, fontWeight: 600 }} />
                              <Typography variant="h4" fontWeight={700}>{item.value}</Typography>
                              <Typography variant="caption" color="text.secondary">transactions</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="info">No financial data available yet.</Alert>
              )
            )}

            {/* ── TRANSACTIONS TAB ── */}
            {tab === 1 && (
              <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Transaction Ref</strong></TableCell>
                        <TableCell><strong>Student</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.details.length > 0 ? (
                        data.details.map((txn, idx) => (
                          <TableRow key={txn.payment_id || idx} hover>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace" fontSize="0.78rem" color="text.secondary">
                                {txn.tx_ref || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600}>{txn.student_name || '—'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={700} color="success.main">
                                {formatCurrency(txn.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={txn.payment_status || 'unknown'}
                                color={
                                  txn.payment_status === 'success' ? 'success' :
                                  txn.payment_status === 'pending' ? 'warning' : 'error'
                                }
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {txn.payment_date
                                  ? new Date(txn.payment_date).toLocaleDateString('en-US', {
                                      day: 'numeric', month: 'short', year: 'numeric'
                                    })
                                  : '—'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <ReceiptLong sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                            <Typography color="text.secondary">No transactions found</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {/* ── MONTHLY REVENUE TAB ── */}
            {tab === 2 && (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Monthly Revenue (Last 12 Months)
                </Typography>
                {data.revenue.length > 0 ? (
                  <>
                    {/* Bar chart */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 280, px: 1, overflowX: 'auto', pb: 1 }}>
                      {data.revenue.map((item) => {
                        const maxVal = Math.max(...data.revenue.map(i => parseFloat(i.revenue || 0)), 1);
                        const barH = Math.max((parseFloat(item.revenue || 0) / maxVal) * 230, 6);
                        return (
                          <Box key={item.month} sx={{ flex: '1 0 50px', textAlign: 'center' }}>
                            <Tooltip title={`${formatCurrency(item.revenue)} — ${item.transaction_count} tx`}>
                              <Box sx={{
                                height: barH,
                                background: 'linear-gradient(to top, #2d6a4f, #52b788)',
                                borderRadius: '6px 6px 0 0',
                                mb: 0.5,
                                cursor: 'default',
                                transition: 'all 0.3s ease',
                                '&:hover': { filter: 'brightness(1.1)', transform: 'scaleY(1.03)' }
                              }} />
                            </Tooltip>
                            <Typography variant="caption" fontWeight={600} display="block">
                              {getMonthLabel(item.month)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem' }}>
                              {item.transaction_count} tx
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Revenue Table */}
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><strong>Month</strong></TableCell>
                            <TableCell align="right"><strong>Revenue</strong></TableCell>
                            <TableCell align="right"><strong>Transactions</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...data.revenue].reverse().map((item) => (
                            <TableRow key={item.month} hover>
                              <TableCell>{getMonthLabel(item.month)}</TableCell>
                              <TableCell align="right">
                                <Typography fontWeight={600} color="success.main">
                                  {formatCurrency(item.revenue)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">{item.transaction_count}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                ) : (
                  <Alert severity="info">
                    No revenue data yet. Revenue will appear here once payments are processed.
                  </Alert>
                )}
              </Paper>
            )}
          </>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AdminFinancialReports;

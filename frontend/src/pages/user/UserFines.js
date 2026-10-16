import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Paper,
  Divider,
  LinearProgress,
  Fade,
  Grow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PaymentCard from '../../components/payments/PaymentCard';
import axios from 'axios';

const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#d8f3dc',
  lighter: '#f0fdf4',
  dark: '#1b4332',
  accent: '#95d5b2',
  gradient: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)'
};

const UserFines = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');

      // Fetch unpaid fines
      const finesResponse = await axios.get(
        'http://localhost:8000/api/fines/unpaid',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (finesResponse.data.success) {
        setUnpaidFines(finesResponse.data.fines);
        setSummary(finesResponse.data.summary);
      }

      // Fetch payment history
      const historyResponse = await axios.get(
        'http://localhost:8000/api/payments/history?limit=50',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (historyResponse.data.success) {
        setPaymentHistory(historyResponse.data.payments);
      }

      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fines data');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handlePaymentInitiated = (paymentData) => {
    console.log('Payment initiated:', paymentData);
    setSuccessMessage('Payment window opened. Please complete your payment.');
  };

  const handlePaymentComplete = (paymentData) => {
    console.log('Payment completed:', paymentData);
    setSuccessMessage('Payment completed successfully! Refreshing data...');
    setTimeout(() => {
      fetchData();
      setSuccessMessage('');
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'paid':
        return '#4caf50';
      case 'pending':
      case 'partial':
        return '#ff9800';
      case 'failed':
      case 'unpaid':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Fines & Payments">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} sx={{ color: C.primary }} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Fines & Payments">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ color: C.dark, mb: 0.5 }}>
                  Fines & Payments
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your library fines and payment history
                </Typography>
              </Box>
              <Tooltip title="Refresh data">
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    bgcolor: C.lighter,
                    border: `2px solid ${C.light}`,
                    '&:hover': { bgcolor: C.light }
                  }}
                >
                  <RefreshIcon sx={{ color: C.primary, animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Success Message */}
            {successMessage && (
              <Alert
                severity="success"
                onClose={() => setSuccessMessage('')}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {successMessage}
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError('')}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                {error}
              </Alert>
            )}
          </Box>

          {/* Summary Cards */}
          {summary && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Total Balance Card */}
              <Grid item xs={12} md={4}>
                <Grow in={true} timeout={600}>
                  <Card
                    sx={{
                      background: unpaidFines.length > 0 ? 'linear-gradient(135deg, #f44336 0%, #e57373 100%)' : C.gradient,
                      color: 'white',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.25)', width: 56, height: 56 }}>
                          <BalanceIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        <Chip
                          label={summary.total_unpaid > 0 ? 'Action Required' : 'All Clear'}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.25)',
                            color: 'white',
                            fontWeight: 700
                          }}
                        />
                      </Box>
                      <Typography variant="h3" fontWeight={900} sx={{ mb: 0.5 }}>
                        {summary.total_balance.toFixed(2)} ETB
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Outstanding Balance
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>

              {/* Unpaid Fines Card */}
              <Grid item xs={12} md={4}>
                <Grow in={true} timeout={800}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: `2px solid ${C.light}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px ${C.primary}20`
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: C.light, width: 56, height: 56 }}>
                          <WarningIcon sx={{ fontSize: 32, color: C.primary }} />
                        </Avatar>
                      </Box>
                      <Typography variant="h3" fontWeight={900} sx={{ color: C.dark, mb: 0.5 }}>
                        {summary.total_unpaid}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Unpaid Fines
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>

              {/* Borrowing Status Card */}
              <Grid item xs={12} md={4}>
                <Grow in={true} timeout={1000}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: `2px solid ${summary.can_borrow ? '#4caf50' : '#f44336'}20`,
                      bgcolor: summary.can_borrow ? '#e8f5e9' : '#ffebee',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px ${summary.can_borrow ? '#4caf50' : '#f44336'}20`
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: summary.can_borrow ? '#4caf50' : '#f44336',
                            width: 56,
                            height: 56
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: summary.can_borrow ? '#2e7d32' : '#c62828', mb: 0.5 }}>
                        {summary.can_borrow ? 'Active' : 'Restricted'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Borrowing Status
                      </Typography>
                      {!summary.can_borrow && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                          Pay fines to restore borrowing privileges
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            </Grid>
          )}

          {/* Borrowing Restriction Warning */}
          {summary && !summary.can_borrow && (
            <Alert
              severity="warning"
              icon={<WarningIcon />}
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `2px solid #ff9800`,
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" fontWeight={700} sx={{ mb: 0.5 }}>
                    Borrowing Restricted
                  </Typography>
                  <Typography variant="body2">
                    You have {summary.total_unpaid} unpaid fine(s) totaling {summary.total_balance.toFixed(2)} ETB. 
                    Please pay your fines to restore borrowing privileges.
                  </Typography>
                </Box>
              </Box>
            </Alert>
          )}

          {/* Tabs */}
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64
                },
                '& .Mui-selected': {
                  color: C.primary
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: C.primary,
                  height: 3
                }
              }}
            >
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon />
                    Unpaid Fines
                    {unpaidFines.length > 0 && (
                      <Chip
                        label={unpaidFines.length}
                        size="small"
                        sx={{ bgcolor: '#f44336', color: 'white', fontWeight: 700 }}
                      />
                    )}
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon />
                    Payment History
                  </Box>
                }
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Box>
              {unpaidFines.length === 0 ? (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: `2px dashed ${C.light}`,
                    bgcolor: C.lighter
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ color: C.dark, mb: 1 }}>
                    No Unpaid Fines
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You have no outstanding fines. Keep up the good work!
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {unpaidFines.map((fine) => (
                    <Grid item xs={12} md={6} lg={4} key={fine.id}>
                      <PaymentCard
                        fine={fine}
                        onPaymentInitiated={handlePaymentInitiated}
                        onPaymentComplete={handlePaymentComplete}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {paymentHistory.length === 0 ? (
                <Paper
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: `2px dashed ${C.light}`,
                    bgcolor: C.lighter
                  }}
                >
                  <ReceiptIcon sx={{ fontSize: 80, color: C.primary, mb: 2 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ color: C.dark, mb: 1 }}>
                    No Payment History
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You haven't made any payments yet.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {paymentHistory.map((payment) => (
                    <Grid item xs={12} key={payment.id}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          border: `2px solid ${C.light}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: C.secondary,
                            boxShadow: `0 4px 12px ${C.primary}20`
                          }
                        }}
                      >
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Transaction Date
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {new Date(payment.created_at).toLocaleDateString()}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Amount
                              </Typography>
                              <Typography variant="h6" fontWeight={700} sx={{ color: C.primary }}>
                                {payment.amount.toFixed(2)} {payment.currency}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Status
                              </Typography>
                              <Chip
                                label={payment.status}
                                size="small"
                                sx={{
                                  bgcolor: getStatusColor(payment.status),
                                  color: 'white',
                                  fontWeight: 700,
                                  textTransform: 'uppercase'
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Book
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {payment.book?.title || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                              <Tooltip title="View receipt">
                                <IconButton size="small" sx={{ color: C.primary }}>
                                  <ReceiptIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Transaction info">
                                <IconButton size="small" sx={{ color: C.primary }}>
                                  <InfoIcon />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Fade>

      {/* CSS for refresh spin animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </DashboardLayout>
  );
};

export default UserFines;

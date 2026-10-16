import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Book as BookIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
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

const PaymentCard = ({ fine, onPaymentInitiated, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayNow = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:8000/api/payments/initialize',
        {
          fine_id: fine.id,
          amount: fine.balance,
          currency: 'ETB'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const { checkout_url, tx_ref, payment_id } = response.data.data;
        
        // Notify parent component
        if (onPaymentInitiated) {
          onPaymentInitiated({
            fine_id: fine.id,
            tx_ref,
            payment_id,
            checkout_url
          });
        }

        // Open Chapa checkout in new window
        const width = 600;
        const height = 700;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        
        const paymentWindow = window.open(
          checkout_url,
          'ChapaPayment',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        // Poll for payment completion
        const pollInterval = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(pollInterval);
            setLoading(false);
            
            // Verify payment status
            verifyPayment(tx_ref);
          }
        }, 1000);

      } else {
        throw new Error(response.data.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const verifyPayment = async (txRef) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:8000/api/payments/verify?tx_ref=${txRef}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success && response.data.data.status === 'success') {
        if (onPaymentComplete) {
          onPaymentComplete({
            fine_id: fine.id,
            tx_ref: txRef,
            status: 'success'
          });
        }
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#4caf50';
      case 'partial':
        return '#ff9800';
      case 'unpaid':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon />;
      case 'partial':
        return <ScheduleIcon />;
      case 'unpaid':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `2px solid ${C.light}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${C.primary}20`,
          borderColor: C.secondary
        }
      }}
    >
      {/* Status Banner */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          bgcolor: getStatusColor(fine.payment_status),
          color: 'white',
          px: 2,
          py: 0.5,
          borderBottomLeftRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}
      >
        {getStatusIcon(fine.payment_status)}
        <Typography variant="caption" fontWeight={700}>
          {fine.payment_status.toUpperCase()}
        </Typography>
      </Box>

      <CardContent sx={{ p: 3, pt: 5 }}>
        {/* Book Information */}
        {fine.book && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Avatar
              src={fine.book.cover_image ? `http://localhost:8000/${fine.book.cover_image}` : undefined}
              sx={{
                width: 60,
                height: 80,
                borderRadius: 1,
                bgcolor: C.light
              }}
              variant="rounded"
            >
              <BookIcon sx={{ fontSize: 32, color: C.primary }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: C.dark, mb: 0.5 }}>
                {fine.book.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fine.book.author}
              </Typography>
              {fine.book.isbn && (
                <Typography variant="caption" color="text.secondary">
                  ISBN: {fine.book.isbn}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Fine Details */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Reason:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {fine.reason}
            </Typography>
          </Box>

          {fine.loan && fine.loan.days_overdue > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Days Overdue:
              </Typography>
              <Chip
                label={`${fine.loan.days_overdue} days`}
                size="small"
                color="error"
                sx={{ fontWeight: 700 }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Original Amount:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {fine.amount.toFixed(2)} ETB
            </Typography>
          </Box>

          {fine.paid_amount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Paid Amount:
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {fine.paid_amount.toFixed(2)} ETB
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: C.dark }}>
              Balance:
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{
                color: fine.balance > 0 ? '#f44336' : '#4caf50'
              }}
            >
              {fine.balance.toFixed(2)} ETB
            </Typography>
          </Box>
        </Box>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payment Progress */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              sx={{
                borderRadius: 1,
                height: 6,
                bgcolor: C.light,
                '& .MuiLinearProgress-bar': {
                  background: C.gradient
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
              Initializing secure payment...
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        {fine.payment_status !== 'paid' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
              disabled={loading || fine.balance <= 0}
              onClick={handlePayNow}
              sx={{
                background: C.gradient,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: `0 4px 12px ${C.primary}40`,
                '&:hover': {
                  boxShadow: `0 8px 24px ${C.primary}50`,
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: '#ccc'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Processing...' : `Pay ${fine.balance.toFixed(2)} ETB`}
            </Button>

            <Tooltip title="View payment details">
              <IconButton
                sx={{
                  border: `2px solid ${C.light}`,
                  color: C.primary,
                  '&:hover': {
                    bgcolor: C.lighter,
                    borderColor: C.secondary
                  }
                }}
              >
                <ReceiptIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Paid Status */}
        {fine.payment_status === 'paid' && (
          <Box
            sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: C.lighter,
              border: `2px solid ${C.light}`
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
            <Typography variant="h6" fontWeight={700} color="success.main">
              Paid in Full
            </Typography>
            {fine.paid_at && (
              <Typography variant="caption" color="text.secondary">
                Paid on {new Date(fine.paid_at).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        )}

        {/* Fine Date */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 2 }}
        >
          Fine issued on {new Date(fine.created_at).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;

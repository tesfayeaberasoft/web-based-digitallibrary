import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#d8f3dc',
  lighter: '#f0fdf4',
  dark: '#1b4332',
  gradient: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)'
};

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed, error
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const txRef = searchParams.get('tx_ref');
    
    if (!txRef) {
      setStatus('error');
      setError('No transaction reference found');
      return;
    }

    verifyPayment(txRef);
  }, [searchParams]);

  const verifyPayment = async (txRef) => {
    try {
      const token = localStorage.getItem('token');
      
      // Wait a moment for Chapa webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await axios.get(
        `http://localhost:8000/api/payments/verify?tx_ref=${txRef}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success && response.data.data.status === 'success') {
        setStatus('success');
        setPaymentData(response.data.data);
      } else {
        setStatus('failed');
        setError(response.data.message || 'Payment verification failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.message || err.message || 'Failed to verify payment');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={80} sx={{ color: C.primary, mb: 3 }} />
            <Typography variant="h5" fontWeight={700} sx={{ color: C.dark, mb: 1 }}>
              Verifying Payment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we confirm your payment...
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 100, color: '#4caf50', mb: 3 }} />
            <Typography variant="h4" fontWeight={900} sx={{ color: '#2e7d32', mb: 2 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your fine payment has been processed successfully.
            </Typography>
            
            {paymentData && (
              <Card sx={{ maxWidth: 400, mx: 'auto', mb: 3, borderRadius: 2, border: `2px solid ${C.light}` }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Payment Amount
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: C.primary, mb: 2 }}>
                    {paymentData.amount.toFixed(2)} {paymentData.currency}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    Reference Number
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    {paymentData.reference}
                  </Typography>
                  
                  {paymentData.payment_method && (
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Payment Method
                      </Typography>
                      <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {paymentData.payment_method}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/fines')}
                sx={{
                  background: C.gradient,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none'
                }}
              >
                View Fines
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderColor: C.secondary,
                  color: C.primary,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none'
                }}
              >
                Go to Dashboard
              </Button>
            </Box>
          </Box>
        );

      case 'failed':
        return (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 100, color: '#ff9800', mb: 3 }} />
            <Typography variant="h4" fontWeight={900} sx={{ color: '#f57c00', mb: 2 }}>
              Payment Pending
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your payment is being processed. This may take a few minutes.
            </Typography>
            
            <Alert severity="info" sx={{ maxWidth: 500, mx: 'auto', mb: 3, borderRadius: 2 }}>
              {error || 'Please check your payment status in a few minutes.'}
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/fines')}
                sx={{
                  background: C.gradient,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none'
                }}
              >
                Check Fines Status
              </Button>
            </Box>
          </Box>
        );

      case 'error':
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <ErrorIcon sx={{ fontSize: 100, color: '#f44336', mb: 3 }} />
            <Typography variant="h4" fontWeight={900} sx={{ color: '#c62828', mb: 2 }}>
              Verification Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We couldn't verify your payment at this time.
            </Typography>
            
            <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto', mb: 3, borderRadius: 2 }}>
              {error || 'An unexpected error occurred. Please contact support if you made a payment.'}
            </Alert>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/fines')}
                sx={{
                  background: C.gradient,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none'
                }}
              >
                Go to Fines
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{
                  borderColor: C.secondary,
                  color: C.primary,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: 'none'
                }}
              >
                Dashboard
              </Button>
            </Box>
          </Box>
        );
    }
  };

  return (
    <DashboardLayout title="Payment Status">
      <Card
        sx={{
          maxWidth: 800,
          mx: 'auto',
          mt: 4,
          borderRadius: 3,
          border: `2px solid ${C.light}`,
          boxShadow: `0 8px 32px ${C.primary}20`
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {renderContent()}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default PaymentReturn;

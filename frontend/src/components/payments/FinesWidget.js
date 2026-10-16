import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#d8f3dc',
  lighter: '#f0fdf4',
  dark: '#1b4332',
  gradient: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)'
};

const FinesWidget = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unpaidFines, setUnpaidFines] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchUnpaidFines();
  }, []);

  const fetchUnpaidFines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8000/api/fines/unpaid',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUnpaidFines(response.data.fines || []);
        setSummary(response.data.summary || {
          total_balance: 0,
          total_unpaid: 0,
          can_borrow: true
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch unpaid fines:', err);
      // Set default values on error
      setUnpaidFines([]);
      setSummary({
        total_balance: 0,
        total_unpaid: 0,
        can_borrow: true
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, border: `2px solid ${C.light}` }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress sx={{ color: C.primary }} />
        </CardContent>
      </Card>
    );
  }

  const hasUnpaidFines = unpaidFines.length > 0;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `2px solid ${hasUnpaidFines ? '#f44336' : C.light}`,
        bgcolor: hasUnpaidFines ? '#ffebee' : C.lighter,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: hasUnpaidFines ? '0 12px 24px #f4433620' : `0 12px 24px ${C.primary}20`
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar
            sx={{
              bgcolor: hasUnpaidFines ? '#f44336' : C.primary,
              width: 56,
              height: 56
            }}
          >
            {hasUnpaidFines ? (
              <WarningIcon sx={{ fontSize: 32 }} />
            ) : (
              <CheckCircleIcon sx={{ fontSize: 32 }} />
            )}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: C.dark }}>
              Library Fines
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {hasUnpaidFines ? 'Action required' : 'All clear'}
            </Typography>
          </Box>
        </Box>

        {hasUnpaidFines ? (
          <>
            {/* Warning Alert */}
            {!summary?.can_borrow && (
              <Alert
                severity="error"
                icon={<WarningIcon />}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  border: '2px solid #f44336'
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Borrowing Restricted
                </Typography>
                <Typography variant="caption">
                  Pay fines to restore privileges
                </Typography>
              </Alert>
            )}

            {/* Total Balance */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: '#fff',
                border: `2px solid ${C.light}`,
                mb: 2,
                textAlign: 'center'
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                Total Outstanding
              </Typography>
              <Typography variant="h3" fontWeight={900} sx={{ color: '#f44336', mb: 0.5 }}>
                {summary?.total_balance.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ethiopian Birr (ETB)
              </Typography>
            </Box>

            {/* Fines List */}
            <List sx={{ mb: 2, bgcolor: '#fff', borderRadius: 2, border: `1px solid ${C.light}` }}>
              {unpaidFines.slice(0, 3).map((fine, index) => (
                <React.Fragment key={fine.id}>
                  {index > 0 && <Divider />}
                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600} sx={{ color: C.dark }}>
                          {fine.book?.title || 'Unnamed Book'}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {fine.reason}
                          </Typography>
                          <Chip
                            label={`${fine.balance.toFixed(2)} ETB`}
                            size="small"
                            sx={{
                              bgcolor: '#f44336',
                              color: 'white',
                              fontWeight: 700,
                              height: 20,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>

            {unpaidFines.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                +{unpaidFines.length - 3} more fine(s)
              </Typography>
            )}

            {/* Pay Now Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PaymentIcon />}
              endIcon={<ArrowForward />}
              onClick={() => navigate('/fines')}
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 12px #f4433640',
                '&:hover': {
                  boxShadow: '0 8px 24px #f4433650',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Pay Fines Now
            </Button>
          </>
        ) : (
          <>
            {/* No Fines Message */}
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
              <Typography variant="h6" fontWeight={700} sx={{ color: '#2e7d32', mb: 1 }}>
                No Outstanding Fines
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You're all set! Keep borrowing responsibly.
              </Typography>
            </Box>

            {/* View History Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/fines')}
              sx={{
                borderColor: C.secondary,
                color: C.primary,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: C.primary,
                  bgcolor: C.lighter
                }
              }}
            >
              View Payment History
            </Button>
          </>
        )}

        {/* Stats Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${C.light}`
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: C.dark }}>
              {summary?.total_unpaid || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unpaid
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: hasUnpaidFines ? '#f44336' : '#4caf50' }}>
              {summary?.can_borrow ? 'Active' : 'Restricted'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FinesWidget;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Fade,
  Grow,
  Avatar,
  Paper
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AssignmentReturn as ReturnIcon,
  AutoStories as ReadingIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const UserBooks = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returning, setReturning] = useState(false);
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    fetchUserBooks();
  }, []);

  const fetchUserBooks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Fetch active loans
      const loansResponse = await axios.get('http://localhost:8000/api/loans?status=active', config);
      if (loansResponse.data.success) {
        setLoans(loansResponse.data.loans || []);
      } else {
        setLoans([]);
      }
      
      // Fetch reservations
      const reservationsResponse = await axios.get('http://localhost:8000/api/reservations', config);
      if (reservationsResponse.data.success) {
        const allReservations = reservationsResponse.data.reservations || [];
        setReservations(allReservations.filter(r => 
          r.status === 'pending' || r.status === 'available'
        ));
      } else {
        setReservations([]);
      }
    } catch (err) {
      setLoans([]);
      setReservations([]);
      console.error('Error fetching user books:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Show actual error message from backend
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load your books. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenReturnDialog = (loan) => {
    setSelectedLoan(loan);
    setReturnDialogOpen(true);
  };

  const handleCloseReturnDialog = () => {
    setReturnDialogOpen(false);
    setSelectedLoan(null);
  };

  const handleOpenRenewDialog = (loan) => {
    setSelectedLoan(loan);
    setRenewDialogOpen(true);
  };

  const handleCloseRenewDialog = () => {
    setRenewDialogOpen(false);
    setSelectedLoan(null);
  };

  const handleReturnBook = async () => {
    if (!selectedLoan) return;
    
    setReturning(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8000/api/loans/${selectedLoan.id}/return`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSuccess(`Book "${selectedLoan.book_title}" returned successfully!`);
        
        // Show fine message if applicable
        if (response.data.fine_amount > 0) {
          setSuccess(
            `Book returned successfully! You have a fine of $${response.data.fine_amount} for late return.`
          );
        }
        
        // Close dialog
        handleCloseReturnDialog();
        
        // Refresh the loans list
        fetchUserBooks();
      }
    } catch (err) {
      console.error('Error returning book:', err);
      const errorMessage = err.response?.data?.message || 'Failed to return book. Please try again.';
      setError(errorMessage);
    } finally {
      setReturning(false);
    }
  };

  const handleRenewBook = async () => {
    if (!selectedLoan) return;
    
    setRenewing(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8000/api/loans/${selectedLoan.id}/renew`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        const newDueDate = new Date(response.data.new_due_date).toLocaleDateString();
        const renewalsRemaining = response.data.renewals_remaining;
        
        setSuccess(
          `Book "${selectedLoan.book_title}" renewed successfully! New due date: ${newDueDate}. ` +
          `You have ${renewalsRemaining} renewal${renewalsRemaining !== 1 ? 's' : ''} remaining.`
        );
        
        // Close dialog
        handleCloseRenewDialog();
        
        // Refresh the loans list
        fetchUserBooks();
      }
    } catch (err) {
      console.error('Error renewing book:', err);
      const errorMessage = err.response?.data?.message || 'Failed to renew book. Please try again.';
      setError(errorMessage);
    } finally {
      setRenewing(false);
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusChip = (loan) => {
    const daysUntilDue = getDaysUntilDue(loan.due_date);
    
    if (daysUntilDue < 0) {
      return <Chip label="Overdue" color="error" size="small" icon={<WarningIcon />} />;
    } else if (daysUntilDue <= 3) {
      return <Chip label="Due Soon" color="warning" size="small" icon={<ScheduleIcon />} />;
    } else {
      return <Chip label="Active" color="success" size="small" icon={<CheckIcon />} />;
    }
  };

  const renderLoans = () => {
    if (loans.length === 0) {
      return (
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
              borderRadius: 2
            }}
          >
            <Avatar sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: '#4a9b8e', 
              margin: '0 auto',
              mb: 3
            }}>
              <BookIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No borrowed books
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Visit our library to borrow your first book and start your reading journey! 📚
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<ReadingIcon />}
              href="/browse"
              sx={{ 
                bgcolor: '#4a9b8e', 
                '&:hover': { bgcolor: '#3d8276' },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Browse Books
            </Button>
          </Paper>
        </Fade>
      );
    }

    return (
      <Grid container spacing={3}>
        {loans.map((loan, index) => {
          const daysUntilDue = getDaysUntilDue(loan.due_date);
          const progress = Math.max(0, Math.min(100, ((14 - daysUntilDue) / 14) * 100));
          
          // Determine card gradient based on status
          let cardGradient = 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)';
          let borderColor = '#4a9b8e';
          
          if (daysUntilDue < 0) {
            cardGradient = 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)';
            borderColor = '#f44336';
          } else if (daysUntilDue <= 3) {
            cardGradient = 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';
            borderColor = '#ff9800';
          }
          
          return (
            <Grid item xs={12} md={6} lg={4} key={loan.id}>
              <Grow in={true} timeout={600 + (index * 200)}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: cardGradient,
                    border: `2px solid ${borderColor}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${borderColor}40`
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: borderColor,
                        width: 48,
                        height: 48
                      }}>
                        <ReadingIcon />
                      </Avatar>
                      {getStatusChip(loan)}
                    </Box>
                    
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {loan.book_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      by {loan.book_author}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} color={borderColor}>
                          Reading Progress
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color={borderColor}>
                          {Math.round(progress)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: borderColor,
                            borderRadius: 5
                          }
                        }}
                      />
                    </Box>
                    
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Issued
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(loan.loan_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Due Date
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    {daysUntilDue >= 0 ? (
                      <Alert 
                        severity={daysUntilDue <= 3 ? 'warning' : 'info'} 
                        sx={{ 
                          mb: 2,
                          fontWeight: 600,
                          '& .MuiAlert-icon': {
                            fontSize: 24
                          }
                        }}
                      >
                        {daysUntilDue === 0 ? '⏰ Due today!' : `📅 ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} remaining`}
                      </Alert>
                    ) : (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 2,
                          fontWeight: 600,
                          '& .MuiAlert-icon': {
                            fontSize: 24
                          }
                        }}
                      >
                        ⚠️ Overdue by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}
                      </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        startIcon={<ReturnIcon />}
                        onClick={() => handleOpenReturnDialog(loan)}
                        sx={{ 
                          bgcolor: '#4a9b8e', 
                          '&:hover': { bgcolor: '#3d8276' },
                          fontWeight: 600
                        }}
                      >
                        Return
                      </Button>
                      <Button 
                        fullWidth 
                        variant="outlined"
                        startIcon={<ScheduleIcon />}
                        onClick={() => handleOpenRenewDialog(loan)}
                        sx={{ 
                          borderColor: '#4a9b8e', 
                          color: '#4a9b8e',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#3d8276',
                            bgcolor: 'rgba(74, 155, 142, 0.08)'
                          }
                        }}
                      >
                        Renew
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderReservations = () => {
    if (reservations.length === 0) {
      return (
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0}
            sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
              borderRadius: 2
            }}
          >
            <Avatar sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: '#ff9800', 
              margin: '0 auto',
              mb: 3
            }}>
              <ScheduleIcon sx={{ fontSize: 60 }} />
            </Avatar>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No reservations
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Reserve books that are currently unavailable to get notified when they're ready! 🔔
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<BookIcon />}
              href="/browse"
              sx={{ 
                bgcolor: '#ff9800', 
                '&:hover': { bgcolor: '#f57c00' },
                px: 4,
                py: 1.5,
                fontSize: '1.1rem'
              }}
            >
              Browse Books
            </Button>
          </Paper>
        </Fade>
      );
    }

    return (
      <Grid container spacing={3}>
        {reservations.map((reservation, index) => {
          const isReady = reservation.status === 'available';
          const cardGradient = isReady 
            ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
            : 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)';
          const borderColor = isReady ? '#4caf50' : '#ff9800';
          
          return (
            <Grid item xs={12} md={6} lg={4} key={reservation.id}>
              <Grow in={true} timeout={600 + (index * 200)}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: cardGradient,
                    border: `2px solid ${borderColor}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 24px ${borderColor}40`
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: borderColor,
                        width: 48,
                        height: 48
                      }}>
                        {isReady ? <CheckIcon /> : <ScheduleIcon />}
                      </Avatar>
                      <Chip 
                        label={isReady ? '✅ Ready' : '⏳ Pending'}
                        sx={{
                          bgcolor: borderColor,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem'
                        }}
                        size="medium"
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {reservation.book_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                      by {reservation.book_author}
                    </Typography>
                    
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, mb: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Reserved On
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(reservation.created_at).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Queue Position
                            </Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={700} color={borderColor}>
                            #{reservation.queue_position}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    {isReady ? (
                      <Alert 
                        severity="success" 
                        sx={{ 
                          mb: 2,
                          fontWeight: 600,
                          '& .MuiAlert-icon': {
                            fontSize: 24
                          }
                        }}
                      >
                        🎉 Your book is ready for pickup!
                      </Alert>
                    ) : (
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 2,
                          fontWeight: 600,
                          '& .MuiAlert-icon': {
                            fontSize: 24
                          }
                        }}
                      >
                        📋 You're #{reservation.queue_position} in the queue
                      </Alert>
                    )}
                    
                    <Button 
                      fullWidth 
                      variant="outlined"
                      color="error"
                      sx={{
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: 'rgba(244, 67, 54, 0.08)'
                        }
                      }}
                    >
                      Cancel Reservation
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <DashboardLayout title="Digital Library">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              📚 My Books
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your borrowed and reserved books
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Enhanced Tabs */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 4,
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #e0e0e0'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontSize: '1rem',
                  fontWeight: 600,
                  py: 2,
                  minHeight: 64
                },
                '& .Mui-selected': {
                  color: '#4a9b8e !important'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#4a9b8e',
                  height: 3
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BookIcon />
                    <span>Borrowed</span>
                    <Chip 
                      label={loans.length} 
                      size="small" 
                      sx={{ 
                        bgcolor: tabValue === 0 ? '#4a9b8e' : 'grey.300',
                        color: tabValue === 0 ? 'white' : 'text.secondary',
                        fontWeight: 700,
                        minWidth: 32
                      }} 
                    />
                  </Box>
                }
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon />
                    <span>Reservations</span>
                    <Chip 
                      label={reservations.length} 
                      size="small" 
                      sx={{ 
                        bgcolor: tabValue === 1 ? '#4a9b8e' : 'grey.300',
                        color: tabValue === 1 ? 'white' : 'text.secondary',
                        fontWeight: 700,
                        minWidth: 32
                      }} 
                    />
                  </Box>
                }
              />
            </Tabs>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#4a9b8e' }} size={60} />
            </Box>
          ) : (
            <>
              {tabValue === 0 && renderLoans()}
              {tabValue === 1 && renderReservations()}
            </>
          )}
        </Box>
      </Fade>

        {/* Return Book Confirmation Dialog */}
        <Dialog
          open={returnDialogOpen}
          onClose={handleCloseReturnDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Return Book
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to return <strong>"{selectedLoan?.book_title}"</strong>?
              {selectedLoan && getDaysUntilDue(selectedLoan.due_date) < 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This book is overdue by {Math.abs(getDaysUntilDue(selectedLoan.due_date))} day(s). 
                  A fine of ${Math.abs(getDaysUntilDue(selectedLoan.due_date)) * 5} will be applied.
                </Alert>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={handleCloseReturnDialog}
              variant="outlined"
              disabled={returning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReturnBook}
              variant="contained"
              startIcon={returning ? <CircularProgress size={20} /> : <ReturnIcon />}
              disabled={returning}
              sx={{ 
                bgcolor: '#4a9b8e', 
                '&:hover': { bgcolor: '#3d8276' }
              }}
            >
              {returning ? 'Returning...' : 'Confirm Return'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Renew Book Confirmation Dialog */}
        <Dialog
          open={renewDialogOpen}
          onClose={handleCloseRenewDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Renew Book
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to renew <strong>"{selectedLoan?.book_title}"</strong>?
            </DialogContentText>
            {selectedLoan && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  The due date will be extended by 14 days.
                </Alert>
                <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Current Due Date:</strong> {new Date(selectedLoan.due_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>New Due Date:</strong> {new Date(new Date(selectedLoan.due_date).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Renewals Used:</strong> {selectedLoan.renewal_count || 0} / 2
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={handleCloseRenewDialog}
              variant="outlined"
              disabled={renewing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenewBook}
              variant="contained"
              startIcon={renewing ? <CircularProgress size={20} /> : <ScheduleIcon />}
              disabled={renewing}
              sx={{ 
                bgcolor: '#4a9b8e', 
                '&:hover': { bgcolor: '#3d8276' }
              }}
            >
              {renewing ? 'Renewing...' : 'Confirm Renew'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default UserBooks;
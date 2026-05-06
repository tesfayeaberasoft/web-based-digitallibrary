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
  DialogContentText
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AssignmentReturn as ReturnIcon
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
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returning, setReturning] = useState(false);

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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No borrowed books
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Visit our library to borrow your first book
          </Typography>
          <Button 
            variant="contained" 
            href="/browse"
            sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
          >
            Browse Books
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {loans.map((loan) => {
          const daysUntilDue = getDaysUntilDue(loan.due_date);
          const progress = Math.max(0, Math.min(100, ((14 - daysUntilDue) / 14) * 100));
          
          return (
            <Grid item xs={12} md={6} key={loan.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {loan.book_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        by {loan.book_author}
                      </Typography>
                    </Box>
                    {getStatusChip(loan)}
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Reading Progress
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: daysUntilDue < 0 ? 'error.main' : daysUntilDue <= 3 ? 'warning.main' : 'success.main'
                        }
                      }}
                    />
                  </Box>
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Issued Date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(loan.loan_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(loan.due_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {daysUntilDue >= 0 ? (
                    <Alert severity={daysUntilDue <= 3 ? 'warning' : 'info'} sx={{ mb: 2 }}>
                      {daysUntilDue === 0 ? 'Due today!' : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} remaining`}
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Overdue by {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''}
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
                        '&:hover': { bgcolor: '#3d8276' }
                      }}
                    >
                      Return Book
                    </Button>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      sx={{ borderColor: '#4a9b8e', color: '#4a9b8e' }}
                    >
                      Renew
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderReservations = () => {
    if (reservations.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ScheduleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No reservations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reserve books that are currently unavailable
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {reservations.map((reservation) => (
          <Grid item xs={12} md={6} key={reservation.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {reservation.book_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      by {reservation.book_author}
                    </Typography>
                  </Box>
                  <Chip 
                    label={reservation.status === 'available' ? 'Ready' : 'Pending'}
                    color={reservation.status === 'available' ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Reserved On
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(reservation.created_at).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Queue Position
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      #{reservation.queue_position}
                    </Typography>
                  </Grid>
                </Grid>
                
                {reservation.status === 'available' ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Your book is ready for pickup!
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You're #{reservation.queue_position} in the queue
                  </Alert>
                )}
                
                <Button 
                  fullWidth 
                  variant="outlined"
                  color="error"
                >
                  Cancel Reservation
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          My Books
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your borrowed and reserved books
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              label={`Borrowed (${loans.length})`}
              icon={<BookIcon />}
              iconPosition="start"
            />
            <Tab 
              label={`Reservations (${reservations.length})`}
              icon={<ScheduleIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tabValue === 0 && renderLoans()}
            {tabValue === 1 && renderReservations()}
          </>
        )}

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
      </Box>
    </DashboardLayout>
  );
};

export default UserBooks;
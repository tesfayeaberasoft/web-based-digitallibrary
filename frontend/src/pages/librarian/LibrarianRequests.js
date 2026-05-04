import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibrarianRequests = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Issue Book Dialog
  const [openIssueDialog, setOpenIssueDialog] = useState(false);
  const [issueFormData, setIssueFormData] = useState({
    user_id: '',
    book_id: '',
    borrow_days: 14
  });
  
  // Return Book Dialog
  const [openReturnDialog, setOpenReturnDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      if (tabValue === 0) {
        // Fetch active loans
        const response = await axios.get('http://localhost:8000/api/loans?status=active', config);
        if (response.data.success) {
          setLoans(response.data.loans);
        }
      } else if (tabValue === 1) {
        // Fetch pending reservations
        const response = await axios.get('http://localhost:8000/api/reservations?status=pending', config);
        if (response.data.success) {
          setReservations(response.data.reservations);
        }
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenIssueDialog = () => {
    setIssueFormData({
      user_id: '',
      book_id: '',
      borrow_days: 14
    });
    setOpenIssueDialog(true);
  };

  const handleCloseIssueDialog = () => {
    setOpenIssueDialog(false);
  };

  const handleIssueBook = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/loans',
        issueFormData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Book issued successfully!');
      handleCloseIssueDialog();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    }
  };

  const handleOpenReturnDialog = (loan) => {
    setSelectedLoan(loan);
    setOpenReturnDialog(true);
  };

  const handleCloseReturnDialog = () => {
    setOpenReturnDialog(false);
    setSelectedLoan(null);
  };

  const handleReturnBook = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/loans/${selectedLoan.id}/return`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Book returned successfully!');
      handleCloseReturnDialog();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
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
      return <Chip label="Overdue" color="error" size="small" icon={<CancelIcon />} />;
    } else if (daysUntilDue <= 3) {
      return <Chip label="Due Soon" color="warning" size="small" icon={<ScheduleIcon />} />;
    } else {
      return <Chip label="Active" color="success" size="small" icon={<CheckIcon />} />;
    }
  };

  const renderActiveLoans = () => {
    if (loans.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No active loans
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All books have been returned
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Book</strong></TableCell>
              <TableCell><strong>Issue Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Days Left</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((loan) => {
              const daysUntilDue = getDaysUntilDue(loan.due_date);
              
              return (
                <TableRow key={loan.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#4a9b8e' }}>
                        {loan.user_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {loan.user_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {loan.user_email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {loan.book_title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      by {loan.book_author}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(loan.issue_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(loan.due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={daysUntilDue < 0 ? 'error.main' : daysUntilDue <= 3 ? 'warning.main' : 'success.main'}
                    >
                      {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getStatusChip(loan)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenReturnDialog(loan)}
                      sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
                    >
                      Return
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderReservations = () => {
    if (reservations.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No pending reservations
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User</strong></TableCell>
              <TableCell><strong>Book</strong></TableCell>
              <TableCell><strong>Reserved On</strong></TableCell>
              <TableCell><strong>Queue Position</strong></TableCell>
              <TableCell><strong>Available Copies</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#4a9b8e' }}>
                      {reservation.user_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {reservation.user_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reservation.user_email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {reservation.book_title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    by {reservation.book_author}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(reservation.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip label={`#${reservation.queue_position}`} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={reservation.available_copies}
                    color={reservation.available_copies > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={reservation.available_copies === 0}
                    sx={{ borderColor: '#4a9b8e', color: '#4a9b8e' }}
                  >
                    Notify User
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <DashboardLayout title="Librarian Panel">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Book Requests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage pending book requests and reservations
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={handleOpenIssueDialog}
            sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
          >
            Issue Book
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`Active Loans (${loans.length})`} />
              <Tab label={`Reservations (${reservations.length})`} />
            </Tabs>
          </Box>

          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {tabValue === 0 && renderActiveLoans()}
                {tabValue === 1 && renderReservations()}
              </>
            )}
          </CardContent>
        </Card>

        {/* Issue Book Dialog */}
        <Dialog open={openIssueDialog} onClose={handleCloseIssueDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Issue Book</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="User ID"
                  type="number"
                  value={issueFormData.user_id}
                  onChange={(e) => setIssueFormData({ ...issueFormData, user_id: e.target.value })}
                  helperText="Enter the user's ID number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Book ID"
                  type="number"
                  value={issueFormData.book_id}
                  onChange={(e) => setIssueFormData({ ...issueFormData, book_id: e.target.value })}
                  helperText="Enter the book's ID number"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Borrow Duration (Days)"
                  type="number"
                  value={issueFormData.borrow_days}
                  onChange={(e) => setIssueFormData({ ...issueFormData, borrow_days: e.target.value })}
                  helperText="Default is 14 days"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseIssueDialog}>Cancel</Button>
            <Button
              onClick={handleIssueBook}
              variant="contained"
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              Issue Book
            </Button>
          </DialogActions>
        </Dialog>

        {/* Return Book Dialog */}
        <Dialog open={openReturnDialog} onClose={handleCloseReturnDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Return Book</DialogTitle>
          <DialogContent>
            {selectedLoan && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      User
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedLoan.user_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Book
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedLoan.book_title}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Issue Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(selectedLoan.issue_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {new Date(selectedLoan.due_date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  {getDaysUntilDue(selectedLoan.due_date) < 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        This book is {Math.abs(getDaysUntilDue(selectedLoan.due_date))} days overdue. 
                        A fine will be calculated automatically.
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReturnDialog}>Cancel</Button>
            <Button
              onClick={handleReturnBook}
              variant="contained"
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              Confirm Return
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianRequests;
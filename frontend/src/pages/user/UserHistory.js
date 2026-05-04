import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Rating
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';

const UserHistory = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter, yearFilter]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter
      };
      
      const response = await axios.get('http://localhost:8000/api/loans', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        let loans = response.data.loans;
        
        // Filter by year if selected
        if (yearFilter !== 'all') {
          loans = loans.filter(loan => 
            new Date(loan.issue_date).getFullYear().toString() === yearFilter
          );
        }
        
        setHistory(loans);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      setError('Failed to load reading history. Please try again.');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const getStatusChip = (loan) => {
    if (loan.status === 'returned') {
      const returnDate = new Date(loan.return_date);
      const dueDate = new Date(loan.due_date);
      const isLate = returnDate > dueDate;
      
      return (
        <Chip
          label={isLate ? 'Returned Late' : 'Returned'}
          color={isLate ? 'warning' : 'success'}
          size="small"
          icon={<CheckIcon />}
        />
      );
    } else if (loan.status === 'active') {
      return (
        <Chip
          label="Active"
          color="primary"
          size="small"
          icon={<ScheduleIcon />}
        />
      );
    } else {
      return (
        <Chip
          label="Cancelled"
          color="error"
          size="small"
          icon={<CancelIcon />}
        />
      );
    }
  };

  const calculateDuration = (issueDate, returnDate) => {
    const issue = new Date(issueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    const diffTime = Math.abs(returned - issue);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get unique years from history
  const getYears = () => {
    const years = new Set();
    history.forEach(loan => {
      years.add(new Date(loan.issue_date).getFullYear().toString());
    });
    return Array.from(years).sort().reverse();
  };

  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Reading History
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          View your reading history and completed books
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Year"
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">All Years</MenuItem>
                  {getYears().map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : history.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No reading history found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start borrowing books to build your reading history
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Book Title</strong></TableCell>
                        <TableCell><strong>Author</strong></TableCell>
                        <TableCell><strong>Issue Date</strong></TableCell>
                        <TableCell><strong>Return Date</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((loan) => (
                        <TableRow key={loan.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {loan.book_title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {loan.book_author}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(loan.issue_date).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {loan.return_date 
                                ? new Date(loan.return_date).toLocaleDateString()
                                : '-'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {calculateDuration(loan.issue_date, loan.return_date)} days
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(loan)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {!loading && history.length > 0 && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Books Read
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {history.filter(l => l.status === 'returned').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Currently Reading
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {history.filter(l => l.status === 'active').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Avg. Reading Time
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round(
                      history
                        .filter(l => l.status === 'returned')
                        .reduce((acc, l) => acc + calculateDuration(l.issue_date, l.return_date), 0) /
                      history.filter(l => l.status === 'returned').length || 0
                    )} days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    On-Time Returns
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {Math.round(
                      (history.filter(l => 
                        l.status === 'returned' && 
                        new Date(l.return_date) <= new Date(l.due_date)
                      ).length / history.filter(l => l.status === 'returned').length || 0) * 100
                    )}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default UserHistory;
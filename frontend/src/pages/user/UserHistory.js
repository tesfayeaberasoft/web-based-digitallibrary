import React, { useState, useEffect } from 'react';
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
  Avatar,
  Paper,
  Fade,
  Grow
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  MenuBook as BookIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  AccessTime as TimeIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const UserHistory = () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            new Date(loan.loan_date).getFullYear().toString() === yearFilter
          );
        }
        
        setHistory(loans);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Show actual error message from backend
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load reading history. Please try again.';
      setError(errorMessage);
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
      years.add(new Date(loan.loan_date).getFullYear().toString());
    });
    return Array.from(years).sort().reverse();
  };

  return (
    <DashboardLayout title="Digital Library">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              📖 Reading History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your reading journey and completed books
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Paper 
            elevation={0}
            sx={{ 
              mb: 3,
              p: 3,
              background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
              border: '2px solid #4a9b8e',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#2c5f57' }}>
              🔍 Filter History
            </Typography>
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
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a9b8e'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4a9b8e'
                    }
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
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a9b8e'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4a9b8e'
                    }
                  }}
                >
                  <MenuItem value="all">All Years</MenuItem>
                  {getYears().map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* History Table */}
          <Card 
            sx={{ 
              mb: 3,
              border: '2px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#4a9b8e' }} size={60} />
                </Box>
              ) : history.length === 0 ? (
                <Paper 
                  elevation={0}
                  sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    m: 3,
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                    borderRadius: 2
                  }}
                >
                  <Avatar sx={{ 
                    width: 100, 
                    height: 100, 
                    bgcolor: '#9e9e9e', 
                    margin: '0 auto',
                    mb: 3
                  }}>
                    <HistoryIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    No reading history found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start borrowing books to build your reading history 📚
                  </Typography>
                </Paper>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#4a9b8e' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Book Title</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Author</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Issue Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Return Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Duration</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((loan, index) => (
                          <TableRow 
                            key={loan.id} 
                            hover
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: '#e0f2f1',
                                transform: 'scale(1.01)'
                              },
                              bgcolor: index % 2 === 0 ? 'white' : '#f9f9f9'
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ bgcolor: '#4a9b8e', width: 32, height: 32 }}>
                                  <BookIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography variant="body2" fontWeight={600}>
                                  {loan.book_title}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {loan.book_author}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {new Date(loan.loan_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {loan.return_date 
                                  ? new Date(loan.return_date).toLocaleDateString()
                                  : '-'
                                }
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${calculateDuration(loan.loan_date, loan.return_date)} days`}
                                size="small"
                                sx={{ 
                                  bgcolor: '#e0f2f1',
                                  color: '#2c5f57',
                                  fontWeight: 600
                                }}
                              />
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        sx={{
                          '& .MuiPaginationItem-root': {
                            fontWeight: 600
                          },
                          '& .Mui-selected': {
                            bgcolor: '#4a9b8e !important',
                            color: 'white'
                          }
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {!loading && history.length > 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={600}>
                  <Card 
                    sx={{ 
                      background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                      color: 'white',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(74, 155, 142, 0.3)'
                      }
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                        <BookIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                        Total Books Read
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {history.filter(l => l.status === 'returned').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={800}>
                  <Card 
                    sx={{ 
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      color: 'white',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(33, 150, 243, 0.3)'
                      }
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                        <ScheduleIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                        Currently Reading
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {history.filter(l => l.status === 'active').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={1000}>
                  <Card 
                    sx={{ 
                      background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                      color: 'white',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(167, 139, 250, 0.3)'
                      }
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                        <TimeIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                        Avg. Reading Time
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {Math.round(
                          history
                            .filter(l => l.status === 'returned')
                            .reduce((acc, l) => acc + calculateDuration(l.loan_date, l.return_date), 0) /
                          history.filter(l => l.status === 'returned').length || 0
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        days
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Grow in={true} timeout={1200}>
                  <Card 
                    sx={{ 
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      color: 'white',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(251, 191, 36, 0.3)'
                      }
                    }}
                  >
                    <CardContent>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2, width: 56, height: 56 }}>
                        <TrophyIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
                        On-Time Returns
                      </Typography>
                      <Typography variant="h3" fontWeight={700}>
                        {Math.round(
                          (history.filter(l => 
                            l.status === 'returned' && 
                            new Date(l.return_date) <= new Date(l.due_date)
                          ).length / history.filter(l => l.status === 'returned').length || 0) * 100
                        )}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            </Grid>
          )}
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default UserHistory;
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment,
  Avatar,
  Tabs,
  Tab,
  Fade,
  Grow
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  MenuBook as BooksIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibrarianMembers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog state
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit,
        search: searchQuery,
        role: 'user', // Only show regular users, not librarians/admins
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await axios.get('http://localhost:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      setError('Failed to load members. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/users/${userId}/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setUserStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setUserStats(null);
    setOpenViewDialog(true);
    await fetchUserStats(user.id);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedUser(null);
    setUserStats(null);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'suspend';
    
    if (!window.confirm(`Are you sure you want to ${action} this member?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/users/${userId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Member ${action}d successfully!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} member`);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
    
    switch (newValue) {
      case 0:
        setStatusFilter('all');
        break;
      case 1:
        setStatusFilter('active');
        break;
      case 2:
        setStatusFilter('inactive');
        break;
      default:
        setStatusFilter('all');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout title="Librarian Panel">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              👥 Library Members
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage library members and view their activity
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Grow in={true} timeout={600}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={700}>
                      {users.length}
                    </Typography>
                    <Typography variant="body1">
                      Total Members
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Grow in={true} timeout={800}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={700}>
                      {users.filter(u => u.status === 'active').length}
                    </Typography>
                    <Typography variant="body1">
                      Active Members
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Grow in={true} timeout={1000}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h3" fontWeight={700}>
                      {users.filter(u => u.status !== 'active').length}
                    </Typography>
                    <Typography variant="body1">
                      Inactive Members
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          </Grid>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Search by name, email, or user ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label={`All Members (${users.length})`} />
                <Tab label={`Active (${users.filter(u => u.status === 'active').length})`} />
                <Tab label={`Inactive (${users.filter(u => u.status !== 'active').length})`} />
              </Tabs>
            </Box>

            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#4a9b8e' }} />
                </Box>
              ) : users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    No members found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or filters
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Member</strong></TableCell>
                          <TableCell><strong>Contact</strong></TableCell>
                          <TableCell><strong>Joined</strong></TableCell>
                          <TableCell><strong>Last Login</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar 
                                  sx={{ bgcolor: '#4a9b8e', width: 40, height: 40 }}
                                  src={user.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
                                >
                                  {user.full_name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {user.full_name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ID: {user.user_id || user.id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                  <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption">
                                    {user.email}
                                  </Typography>
                                </Box>
                                {user.phone && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption">
                                      {user.phone}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(user.created_at)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(user.last_login)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={user.status}
                                color={getStatusColor(user.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewUser(user)}
                                  sx={{ color: '#4a9b8e' }}
                                  title="View Details"
                                >
                                  <ViewIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleStatus(user.id, user.status)}
                                  color={user.status === 'active' ? 'error' : 'success'}
                                  title={user.status === 'active' ? 'Suspend' : 'Activate'}
                                >
                                  {user.status === 'active' ? <BlockIcon /> : <ActivateIcon />}
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* View User Dialog */}
          <Dialog 
            open={openViewDialog} 
            onClose={handleCloseViewDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ bgcolor: '#4a9b8e', color: 'white' }}>
              Member Details
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedUser && (
                <Box>
                  {/* User Info */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          bgcolor: '#4a9b8e',
                          margin: '0 auto',
                          mb: 2
                        }}
                        src={selectedUser.profile_image ? `http://localhost:8000/${selectedUser.profile_image}` : undefined}
                      >
                        <Typography variant="h3">
                          {selectedUser.full_name?.charAt(0)}
                        </Typography>
                      </Avatar>
                      <Typography variant="h5" fontWeight={600}>
                        {selectedUser.full_name}
                      </Typography>
                      <Chip
                        label={selectedUser.status}
                        color={getStatusColor(selectedUser.status)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedUser.email}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedUser.phone || 'Not provided'}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatDate(selectedUser.created_at)}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last Login
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formatDate(selectedUser.last_login)}
                      </Typography>
                    </Grid>

                    {selectedUser.address && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Address
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedUser.address}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {/* User Stats */}
                  {userStats ? (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Activity Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Card sx={{ bgcolor: '#e3f2fd', textAlign: 'center', p: 2 }}>
                            <BooksIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
                            <Typography variant="h4" fontWeight={700}>
                              {userStats.books_read || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Books Read
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Card sx={{ bgcolor: '#fff3e0', textAlign: 'center', p: 2 }}>
                            <BooksIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                            <Typography variant="h4" fontWeight={700}>
                              {userStats.currently_reading || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Currently Reading
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Card sx={{ bgcolor: '#f3e5f5', textAlign: 'center', p: 2 }}>
                            <CalendarIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                            <Typography variant="h4" fontWeight={700}>
                              {userStats.reading_streak || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Day Streak
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Card sx={{ bgcolor: '#e8f5e9', textAlign: 'center', p: 2 }}>
                            <MoneyIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                            <Typography variant="h4" fontWeight={700}>
                              ${userStats.total_fines || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Fines
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default LibrarianMembers;

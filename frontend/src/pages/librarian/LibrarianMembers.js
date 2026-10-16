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
  Grow,
  Divider,
  Tooltip,
  Paper
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
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Close as CloseIcon
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
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [statusAction, setStatusAction] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Detail dialog tab
  const [detailTab, setDetailTab] = useState(0);

  // Loan history state
  const [userLoans, setUserLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);

  // Fine history state
  const [userFines, setUserFines] = useState([]);
  const [finesSummary, setFinesSummary] = useState(null);
  const [finesLoading, setFinesLoading] = useState(false);
  
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

  const fetchUserLoans = async (userId) => {
    setLoansLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/loans?user_id=${userId}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setUserLoans(response.data.loans || []);
      }
    } catch (err) {
      console.error('Error fetching user loans:', err);
    } finally {
      setLoansLoading(false);
    }
  };

  const fetchUserFines = async (userId) => {
    setFinesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/fines?user_id=${userId}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setUserFines(response.data.fines || []);
        setFinesSummary(response.data.totals || null);
      }
    } catch (err) {
      console.error('Error fetching user fines:', err);
    } finally {
      setFinesLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setUserStats(null);
    setUserLoans([]);
    setUserFines([]);
    setFinesSummary(null);
    setDetailTab(0);
    setOpenViewDialog(true);
    // Fetch all data in parallel
    fetchUserStats(user.id);
    fetchUserLoans(user.id);
    fetchUserFines(user.id);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedUser(null);
    setUserStats(null);
    setUserLoans([]);
    setUserFines([]);
    setFinesSummary(null);
    setDetailTab(0);
  };

  const handleOpenStatusDialog = (user) => {
    setSelectedUser(user);
    const action = user.status === 'active' ? 'suspend' : 'activate';
    setStatusAction(action);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedUser(null);
    setStatusAction(null);
    setSuspensionReason(''); // Clear suspension reason
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;
    
    // Validate suspension reason if suspending
    if (statusAction === 'suspend' && !suspensionReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    
    const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
    const action = statusAction;
    
    try {
      const token = localStorage.getItem('token');
      const updateData = { 
        status: newStatus,
        ...(statusAction === 'suspend' && { suspension_reason: suspensionReason.trim() })
      };
      
      await axios.put(
        `http://localhost:8000/api/users/${selectedUser.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Member ${action}d successfully!`);
      handleCloseStatusDialog();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} member`);
      handleCloseStatusDialog();
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
        // For inactive tab, we need to handle this differently since we want both 'inactive' and 'suspended'
        setStatusFilter('non-active');
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
        <Box className="librarian-page">
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
                                  onClick={() => handleOpenStatusDialog(user)}
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

          {/* Status Change Confirmation Dialog */}
          <Dialog
            open={openStatusDialog}
            onClose={handleCloseStatusDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle 
              sx={{ 
                bgcolor: statusAction === 'suspend' ? '#f44336' : '#4caf50',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {statusAction === 'suspend' ? <BlockIcon /> : <ActivateIcon />}
              {statusAction === 'suspend' ? 'Suspend Member' : 'Activate Member'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              {selectedUser && (
                <Box>
                  <Alert 
                    severity={statusAction === 'suspend' ? 'warning' : 'info'}
                    sx={{ mb: 2 }}
                  >
                    {statusAction === 'suspend' 
                      ? 'Suspending this member will prevent them from borrowing books and accessing library services.'
                      : 'Activating this member will restore their access to library services.'}
                  </Alert>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 60, 
                        height: 60, 
                        bgcolor: statusAction === 'suspend' ? '#f44336' : '#4caf50'
                      }}
                      src={selectedUser.profile_image ? `http://localhost:8000/${selectedUser.profile_image}` : undefined}
                    >
                      <Typography variant="h5">
                        {selectedUser.full_name?.charAt(0)}
                      </Typography>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {selectedUser.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedUser.email}
                      </Typography>
                      <Chip
                        label={selectedUser.status}
                        color={getStatusColor(selectedUser.status)}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>User ID:</strong> {selectedUser.user_id || selectedUser.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Member Since:</strong> {formatDate(selectedUser.created_at)}
                    </Typography>
                    {selectedUser.phone && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Phone:</strong> {selectedUser.phone}
                      </Typography>
                    )}
                  </Box>

                  <Typography 
                    variant="body2" 
                    sx={{ mt: 2, fontWeight: 600 }}
                  >
                    Are you sure you want to {statusAction} this member?
                  </Typography>

                  {/* Suspension Reason Field */}
                  {statusAction === 'suspend' && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Reason for Suspension <span style={{ color: '#f44336' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Please provide a detailed reason for suspending this member (e.g., overdue books, violation of library rules, etc.)"
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#f44336',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#f44336',
                            },
                          },
                        }}
                        helperText={`${suspensionReason.length}/500 characters`}
                        inputProps={{ maxLength: 500 }}
                        error={suspensionReason.trim() === ''}
                      />
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Note:</strong> This reason will be recorded and may be visible to the member. 
                          Please provide a clear and professional explanation.
                        </Typography>
                      </Alert>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={handleCloseStatusDialog}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmStatusChange}
                variant="contained"
                color={statusAction === 'suspend' ? 'error' : 'success'}
                startIcon={statusAction === 'suspend' ? <BlockIcon /> : <ActivateIcon />}
                disabled={statusAction === 'suspend' && !suspensionReason.trim()}
              >
                {statusAction === 'suspend' ? 'Suspend Member' : 'Activate Member'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* View User Dialog */}
          <Dialog
            open={openViewDialog}
            onClose={handleCloseViewDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonIcon />
                <Typography variant="h6" fontWeight={600}>Member Details</Typography>
              </Box>
              <IconButton onClick={handleCloseViewDialog} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              {selectedUser && (
                <>
                  {/* Profile Header */}
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 2.5,
                    px: 3, py: 2.5, bgcolor: '#f8fdfb',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <Avatar
                      src={selectedUser.profile_image ? `http://localhost:8000/${selectedUser.profile_image}` : undefined}
                      sx={{ width: 72, height: 72, bgcolor: '#4a9b8e', fontSize: '2rem', fontWeight: 700 }}
                    >
                      {selectedUser.full_name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700}>{selectedUser.full_name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={`ID: ${selectedUser.user_id || selectedUser.id}`} size="small" variant="outlined" />
                        <Chip label={selectedUser.status} color={getStatusColor(selectedUser.status)} size="small" />
                        {userStats?.overdue_books > 0 && (
                          <Chip icon={<WarningIcon />} label={`${userStats.overdue_books} Overdue`} color="error" size="small" />
                        )}
                        {userStats?.unpaid_fines > 0 && (
                          <Chip icon={<MoneyIcon />} label={`ETB ${parseFloat(userStats.unpaid_fines).toFixed(2)} Unpaid`} color="warning" size="small" />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{selectedUser.email}</Typography>
                        </Box>
                        {selectedUser.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">{selectedUser.phone}</Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">Joined {formatDate(selectedUser.created_at)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Detail Tabs */}
                  <Tabs
                    value={detailTab}
                    onChange={(_, v) => setDetailTab(v)}
                    sx={{
                      px: 2, borderBottom: '1px solid #e0e0e0',
                      '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
                      '& .Mui-selected': { color: '#4a9b8e' },
                      '& .MuiTabs-indicator': { backgroundColor: '#4a9b8e' }
                    }}
                  >
                    <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Profile" />
                    <Tab icon={<BooksIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Loans (${userLoans.length})`} />
                    <Tab icon={<ReceiptIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Fines (${userFines.length})`} />
                  </Tabs>

                  <Box sx={{ p: 3, minHeight: 320 }}>

                    {/* ── TAB 0: PROFILE ── */}
                    {detailTab === 0 && (
                      <Box>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {[
                            { label: 'Full Name', value: selectedUser.full_name },
                            { label: 'User ID', value: selectedUser.user_id || selectedUser.id },
                            { label: 'Email', value: selectedUser.email },
                            { label: 'Phone', value: selectedUser.phone || 'Not provided' },
                            { label: 'Member Since', value: formatDate(selectedUser.created_at) },
                            { label: 'Last Login', value: formatDate(selectedUser.last_login) },
                          ].map((f) => (
                            <Grid item xs={12} sm={6} key={f.label}>
                              <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                              <Typography fontWeight={600}>{f.value}</Typography>
                            </Grid>
                          ))}
                          {selectedUser.address && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary">Address</Typography>
                              <Typography fontWeight={600}>{selectedUser.address}</Typography>
                            </Grid>
                          )}
                          {selectedUser.status === 'suspended' && selectedUser.suspension_reason && (
                            <Grid item xs={12}>
                              <Alert severity="warning">
                                <strong>Suspension Reason:</strong> {selectedUser.suspension_reason}
                              </Alert>
                            </Grid>
                          )}
                        </Grid>

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Activity Statistics</Typography>

                        {userStats ? (
                          <Grid container spacing={2}>
                            {[
                              { label: 'Books Read', value: userStats.books_read || 0, bg: '#e3f2fd', icon: <BooksIcon sx={{ color: '#2196f3', fontSize: 30 }} /> },
                              { label: 'Currently Borrowed', value: userStats.currently_reading || 0, bg: '#fff3e0', icon: <BooksIcon sx={{ color: '#ff9800', fontSize: 30 }} /> },
                              { label: 'Overdue Books', value: userStats.overdue_books || 0, bg: userStats.overdue_books > 0 ? '#ffebee' : '#e8f5e9', icon: <WarningIcon sx={{ color: userStats.overdue_books > 0 ? '#f44336' : '#4caf50', fontSize: 30 }} /> },
                              { label: 'Active Reservations', value: userStats.reservations || 0, bg: '#f3e5f5', icon: <CalendarIcon sx={{ color: '#9c27b0', fontSize: 30 }} /> },
                              { label: 'Total Fines', value: `ETB ${(userStats.total_fines || 0).toFixed(2)}`, bg: '#fce4ec', icon: <MoneyIcon sx={{ color: '#e91e63', fontSize: 30 }} /> },
                              { label: 'Unpaid Fines', value: `ETB ${(userStats.unpaid_fines || 0).toFixed(2)}`, bg: '#ffebee', icon: <MoneyIcon sx={{ color: '#f44336', fontSize: 30 }} /> },
                              { label: 'Paid Fines', value: `ETB ${(userStats.paid_fines || 0).toFixed(2)}`, bg: '#e8f5e9', icon: <MoneyIcon sx={{ color: '#4caf50', fontSize: 30 }} /> },
                              { label: 'Reading Streak', value: `${userStats.reading_streak || 0} days`, bg: '#e8eaf6', icon: <CalendarIcon sx={{ color: '#3f51b5', fontSize: 30 }} /> },
                            ].map((s) => (
                              <Grid item xs={6} sm={3} key={s.label}>
                                <Card sx={{ bgcolor: s.bg, textAlign: 'center', p: 1.5, borderRadius: 2 }}>
                                  {s.icon}
                                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{s.value}</Typography>
                                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={30} sx={{ color: '#4a9b8e' }} />
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* ── TAB 1: LOAN HISTORY ── */}
                    {detailTab === 1 && (
                      loansLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                          <CircularProgress sx={{ color: '#4a9b8e' }} />
                        </Box>
                      ) : userLoans.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                          <BooksIcon sx={{ fontSize: 56, color: '#ccc', mb: 1 }} />
                          <Typography color="text.secondary">No loan history found</Typography>
                        </Box>
                      ) : (
                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell><strong>Book</strong></TableCell>
                                <TableCell><strong>Author</strong></TableCell>
                                <TableCell><strong>Loan Date</strong></TableCell>
                                <TableCell><strong>Due Date</strong></TableCell>
                                <TableCell><strong>Returned</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {userLoans.map((loan) => (
                                <TableRow key={loan.id} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{loan.book_title}</Typography>
                                    <Typography variant="caption" color="text.secondary">ISBN: {loan.isbn || '—'}</Typography>
                                  </TableCell>
                                  <TableCell><Typography variant="body2">{loan.book_author}</Typography></TableCell>
                                  <TableCell><Typography variant="body2">{formatDate(loan.loan_date)}</Typography></TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color={loan.display_status === 'overdue' ? 'error' : 'inherit'}>
                                      {formatDate(loan.due_date)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell><Typography variant="body2">{formatDate(loan.return_date)}</Typography></TableCell>
                                  <TableCell>
                                    <Chip
                                      label={loan.display_status || loan.status}
                                      size="small"
                                      color={
                                        loan.display_status === 'overdue' ? 'error' :
                                        loan.status === 'returned' ? 'success' :
                                        loan.status === 'active' ? 'primary' : 'default'
                                      }
                                      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )
                    )}

                    {/* ── TAB 2: FINES ── */}
                    {detailTab === 2 && (
                      finesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                          <CircularProgress sx={{ color: '#4a9b8e' }} />
                        </Box>
                      ) : (
                        <>
                          {finesSummary && (
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                              {[
                                { label: 'Total Fines', value: `ETB ${parseFloat(finesSummary.total_amount || 0).toFixed(2)}`, bg: '#fff3e0', color: '#e65100' },
                                { label: 'Paid', value: `ETB ${parseFloat(finesSummary.paid_amount || 0).toFixed(2)}`, bg: '#e8f5e9', color: '#2e7d32' },
                                { label: 'Unpaid Balance', value: `ETB ${parseFloat(finesSummary.total_balance || 0).toFixed(2)}`, bg: '#ffebee', color: '#c62828' },
                              ].map((s) => (
                                <Grid item xs={4} key={s.label}>
                                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: s.bg, borderRadius: 2 }}>
                                    <Typography variant="h6" fontWeight={700} color={s.color}>{s.value}</Typography>
                                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                                  </Paper>
                                </Grid>
                              ))}
                            </Grid>
                          )}
                          {userFines.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 5 }}>
                              <ReceiptIcon sx={{ fontSize: 56, color: '#ccc', mb: 1 }} />
                              <Typography color="text.secondary">No fines found</Typography>
                            </Box>
                          ) : (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell><strong>Book</strong></TableCell>
                                    <TableCell><strong>Type</strong></TableCell>
                                    <TableCell><strong>Amount</strong></TableCell>
                                    <TableCell><strong>Paid</strong></TableCell>
                                    <TableCell><strong>Balance</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {userFines.map((fine) => (
                                    <TableRow key={fine.id} hover>
                                      <TableCell>
                                        <Typography variant="body2" fontWeight={600}>{fine.book_title || 'N/A'}</Typography>
                                        {fine.description && (
                                          <Typography variant="caption" color="text.secondary">{fine.description}</Typography>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Chip label={fine.fine_type || 'overdue'} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                      </TableCell>
                                      <TableCell><Typography fontWeight={600}>ETB {parseFloat(fine.amount || 0).toFixed(2)}</Typography></TableCell>
                                      <TableCell><Typography color="success.main">ETB {parseFloat(fine.paid_amount || 0).toFixed(2)}</Typography></TableCell>
                                      <TableCell>
                                        <Typography color={parseFloat(fine.balance) > 0 ? 'error' : 'success.main'} fontWeight={600}>
                                          ETB {parseFloat(fine.balance || 0).toFixed(2)}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={fine.payment_status || fine.status}
                                          size="small"
                                          color={
                                            (fine.payment_status === 'paid' || fine.status === 'paid') ? 'success' :
                                            (fine.payment_status === 'partial' || fine.status === 'partial') ? 'warning' : 'error'
                                          }
                                          sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                        />
                                      </TableCell>
                                      <TableCell><Typography variant="body2">{formatDate(fine.created_at)}</Typography></TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </>
                      )
                    )}
                  </Box>
                </>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
              <Button
                variant="outlined"
                color={selectedUser?.status === 'active' ? 'error' : 'success'}
                startIcon={selectedUser?.status === 'active' ? <BlockIcon /> : <ActivateIcon />}
                onClick={() => { handleCloseViewDialog(); handleOpenStatusDialog(selectedUser); }}
              >
                {selectedUser?.status === 'active' ? 'Suspend Member' : 'Activate Member'}
              </Button>
              <Button onClick={handleCloseViewDialog} variant="contained" sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default LibrarianMembers;

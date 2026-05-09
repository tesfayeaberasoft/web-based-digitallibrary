import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Alert,
  CircularProgress,
  Pagination,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Grow,
  Snackbar,
  DialogContentText
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Visibility,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  BookmarkBorder,
  AttachMoney,
  Warning,
  Refresh,
  FilterList,
  PersonAdd,
  Security,
  AccountCircle,
  SupervisorAccount,
  Settings,
  // Enhanced icons for better visual appeal
  PeopleAlt,
  ManageAccounts,
  PersonSearch,
  PersonOff,
  PersonOutline,
  ContactMail,
  LocalLibrary,
  MenuBook,
  AccountBalance,
  TrendingUp,
  Assignment,
  Schedule,
  NotificationImportant,
  VerifiedUser,
  AdminPanelSettings,
  WorkOutline,
  BusinessCenter,
  School,
  LibraryBooks,
  BookOnline,
  MonetizationOn,
  EventAvailable,
  PersonPin,
  GroupAdd,
  Upgrade,
  ChangeCircle,
  SwapHoriz,
  Transform,
  EmojiPeople,
  Groups,
  SupervisedUserCircle
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [openDialog, setOpenDialog] = useState('');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [promotionReason, setPromotionReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        role: 'user', // Only fetch users with 'user' role
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await axios.get(`http://localhost:8000/api/users/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUserDetails(response.data.user);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
    setSelectedUserId(user.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedUser here to prevent null reference errors
  };

  const handleOpenDialog = (dialogType, user = null) => {
    setOpenDialog(dialogType);
    setSelectedUser(user);
    if (dialogType === 'add') {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'user', // Always set to 'user' since we only manage library users
        status: 'active'
      });
    } else if (dialogType === 'edit' && user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '', // Always start with empty password for security
        phone: user.phone || '',
        address: user.address || '',
        role: 'user', // Always 'user' since we only manage library users
        status: user.status
      });
    } else if (dialogType === 'details' && user) {
      fetchUserDetails(user.id);
    } else if (dialogType === 'suspend' && user) {
      setSuspendReason(''); // Reset reason field
    } else if (dialogType === 'promote' && user) {
      setPromotionReason('');
      setFormData({
        role: 'librarian',
        department: '',
        employee_id: `LIB${String(user.id).padStart(4, '0')}`,
        hire_date: new Date().toISOString().split('T')[0],
        shift: 'morning'
      });
    } else if (dialogType === 'status' && user) {
      setFormData({
        status: user.status
      });
    }
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog('');
    setSelectedUser(null);
    setSelectedUserId(null);
    setFormData({});
    setUserDetails(null);
    setSuspendReason('');
    setPromotionReason('');
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/users/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('User created successfully');
        handleCloseDialog();
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) {
      setError('No user selected for update');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Updating user:', selectedUser.id, 'with data:', formData);
      
      const response = await axios.put(`http://localhost:8000/api/users/${selectedUser.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        setSuccess('User updated successfully');
        handleCloseDialog();
        fetchUsers();
      } else {
        setError(response.data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Update user error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || `Failed to update user: ${err.message}`);
    }
  };

  const handleSuspendUser = async (user, action = 'toggle') => {
    if (!user) {
      setError('No user selected for status update');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Suspending user:', user.id, 'action:', action, 'reason:', suspendReason);
      
      const requestBody = { action };
      if (suspendReason.trim()) {
        requestBody.reason = suspendReason.trim();
      }
      
      const response = await axios.put(`http://localhost:8000/api/users/${user.id}/suspend`, 
        requestBody, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Suspend response:', response.data);

      if (response.data.success) {
        setSuccess(response.data.message);
        handleCloseDialog();
        fetchUsers();
      } else {
        setError(response.data.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Suspend user error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || `Failed to update user status: ${err.message}`);
    }
  };

  const handlePromoteUser = async () => {
    if (!selectedUser) {
      setError('No user selected for promotion');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Promoting user:', selectedUser.id, 'to librarian');
      
      const promotionData = {
        role: 'librarian',
        department: formData.department || 'General',
        employee_id: formData.employee_id,
        hire_date: formData.hire_date,
        shift: formData.shift || 'morning'
      };

      if (promotionReason.trim()) {
        promotionData.promotion_reason = promotionReason.trim();
      }
      
      const response = await axios.put(`http://localhost:8000/api/users/${selectedUser.id}`, 
        promotionData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Promotion response:', response.data);

      if (response.data.success) {
        setSuccess(`User ${selectedUser.full_name} has been promoted to librarian successfully`);
        handleCloseDialog();
        fetchUsers();
      } else {
        setError(response.data.message || 'Failed to promote user');
      }
    } catch (err) {
      console.error('Promote user error:', err);
      setError(err.response?.data?.message || `Failed to promote user: ${err.message}`);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      setError('No user selected for deletion');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Deleting user:', selectedUser.id, selectedUser.full_name);
      
      const response = await axios.delete(`http://localhost:8000/api/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Delete response:', response.data);

      if (response.data.success) {
        setSuccess(response.data.message);
        handleCloseDialog();
        fetchUsers();
      } else {
        setError(response.data.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      console.error('Error response:', err.response?.data);
      
      // Provide more specific error messages
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Cannot delete user - check for active loans or unpaid fines');
      } else if (err.response?.status === 403) {
        setError('Access denied - admin privileges required');
      } else if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError(err.response?.data?.message || `Failed to delete user: ${err.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        {/* Header */}
        <Fade in timeout={300}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ 
                background: 'linear-gradient(45deg, #4a9b8e 30%, #2c5f5a 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <Groups sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
                Library Users Management
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Manage library users, their accounts, and permissions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<GroupAdd />}
              onClick={() => handleOpenDialog('add')}
              sx={{ 
                px: 3,
                background: 'linear-gradient(45deg, #4a9b8e 30%, #66bb6a 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #3d8276 30%, #4caf50 90%)',
                }
              }}
            >
              Add Library User
            </Button>
          </Box>
        </Fade>

        {/* Debug Panel (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔧 Debug Information
              </Typography>
              <Typography variant="body2">
                • This page shows only library users (role: 'user')<br/>
                • Admins and librarians are not displayed here<br/>
                • Backend APIs are working correctly in tests<br/>
                • If you see "Failed to delete/update user", check browser console (F12)<br/>
                • Users with active loans cannot be deleted<br/>
                • Only users with 0 books and $0.00 fines can be safely deleted<br/>
                • Try hard refresh (Ctrl+F5) if issues persist<br/>
                • Selected User: {selectedUser ? `${selectedUser.full_name} (ID: ${selectedUser.id})` : 'None'}<br/>
                • Selected User ID: {selectedUserId || 'None'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Grow in timeout={500}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search users by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <SelectMenuItem value="">All Status</SelectMenuItem>
                      <SelectMenuItem value="active">Active</SelectMenuItem>
                      <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
                      <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchUsers}
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grow>

        {/* Users Table */}
        <Grow in timeout={700}>
          <Card>
            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>User</TableCell>
                          <TableCell>User ID</TableCell>
                          <TableCell align="center">Books</TableCell>
                          <TableCell align="center">Fines</TableCell>
                          <TableCell align="center">Status</TableCell>
                          <TableCell align="center">Joined</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user, index) => (
                          <Fade in timeout={300 + index * 50} key={user.id}>
                            <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(74, 155, 142, 0.04)' } }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    src={user.profile_image}
                                    sx={{
                                      backgroundColor: '#4a9b8e',
                                      width: 40,
                                      height: 40,
                                      mr: 2
                                    }}
                                  >
                                    {user.full_name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {user.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {user.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {user.user_id}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={user.active_loans || 0}
                                  size="small"
                                  sx={{
                                    backgroundColor: user.active_loans > 0 ? '#e3f2fd' : '#f5f5f5',
                                    color: user.active_loans > 0 ? '#1976d2' : '#666',
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color={user.unpaid_fines > 0 ? 'error' : 'success.main'}
                                >
                                  ${(user.unpaid_fines || 0).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={user.status}
                                  size="small"
                                  color={getStatusColor(user.status)}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {formatDate(user.created_at)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, user)}
                                >
                                  <MoreVert />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          </Fade>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grow>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleOpenDialog('details', selectedUser);
          }}>
            <Visibility sx={{ mr: 2, fontSize: 20 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            handleOpenDialog('edit', selectedUser);
          }}>
            <Edit sx={{ mr: 2, fontSize: 20 }} />
            Edit User
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            handleOpenDialog('status', selectedUser);
          }}>
            <ChangeCircle sx={{ mr: 2, fontSize: 20 }} />
            Change Status
          </MenuItem>
          <MenuItem onClick={() => {
            handleOpenDialog('promote', selectedUser);
          }} sx={{ color: 'primary.main' }}>
            <Upgrade sx={{ mr: 2, fontSize: 20 }} />
            Promote to Librarian
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            const userToSuspend = selectedUser;
            handleMenuClose();
            if (userToSuspend) {
              handleOpenDialog('suspend', userToSuspend);
            }
          }}>
            <Block sx={{ mr: 2, fontSize: 20 }} />
            {selectedUser?.status === 'suspended' ? 'Activate' : 'Suspend'} User
          </MenuItem>
          <MenuItem onClick={() => {
            handleOpenDialog('delete', selectedUser);
          }} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 2, fontSize: 20 }} />
            Delete User
          </MenuItem>
        </Menu>

        {/* Add/Edit User Dialog */}
        <Dialog open={openDialog === 'add' || openDialog === 'edit'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {openDialog === 'add' ? 'Add New User' : 'Edit User'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </Grid>
              {openDialog === 'add' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </Grid>
              )}
              {openDialog === 'edit' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password (leave empty to keep current)"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    helperText="Only enter a password if you want to change it"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status || 'active'}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <SelectMenuItem value="active">Active</SelectMenuItem>
                    <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
                    <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={openDialog === 'add' ? handleCreateUser : handleUpdateUser}
            >
              {openDialog === 'add' ? 'Create User' : 'Update User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog open={openDialog === 'details'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountCircle />
              User Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : userDetails ? (
              <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Basic Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Person /></ListItemIcon>
                          <ListItemText primary="Name" secondary={userDetails.full_name} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Email /></ListItemIcon>
                          <ListItemText primary="Email" secondary={userDetails.email} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Phone /></ListItemIcon>
                          <ListItemText primary="Phone" secondary={userDetails.phone || 'Not provided'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocationOn /></ListItemIcon>
                          <ListItemText primary="Address" secondary={userDetails.address || 'Not provided'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CalendarToday /></ListItemIcon>
                          <ListItemText primary="Member Since" secondary={formatDate(userDetails.created_at)} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Statistics */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <LibraryBooks sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#1976d2">
                              {userDetails.active_loans}
                            </Typography>
                            <Typography variant="body2">Active Loans</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#7b1fa2">
                              {userDetails.total_loans}
                            </Typography>
                            <Typography variant="body2">Total Loans</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#c62828">
                              ${userDetails.unpaid_fines.toFixed(2)}
                            </Typography>
                            <Typography variant="body2">Unpaid Fines</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#2e7d32">
                              {userDetails.active_reservations}
                            </Typography>
                            <Typography variant="body2">Reservations</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Current Books */}
                {userDetails.current_books && userDetails.current_books.length > 0 && (
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Currently Borrowed Books
                        </Typography>
                        <List>
                          {userDetails.current_books.map((book, index) => (
                            <ListItem key={index} divider>
                              <ListItemText
                                primary={book.title}
                                secondary={`by ${book.author} • Due: ${formatDate(book.due_date)} • ${book.days_remaining} days remaining`}
                              />
                              <Chip
                                label={book.days_remaining < 0 ? 'Overdue' : `${book.days_remaining} days`}
                                size="small"
                                color={book.days_remaining < 0 ? 'error' : book.days_remaining < 3 ? 'warning' : 'success'}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDialog === 'delete'} onClose={handleCloseDialog}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
              <Warning />
              Confirm Delete
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete user <strong>{selectedUser?.full_name}</strong>? 
              This action cannot be undone and will remove all user data except completed transactions.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={() => {
              if (selectedUser) {
                handleDeleteUser();
              }
            }} color="error" variant="contained">
              Delete User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Suspend/Activate Confirmation Dialog */}
        <Dialog open={openDialog === 'suspend'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
              <Block />
              {selectedUser?.status === 'suspended' ? 'Activate User' : 'Suspend User'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {selectedUser?.status === 'suspended' 
                ? `Are you sure you want to activate user ${selectedUser?.full_name}? They will regain access to all library services.`
                : `Are you sure you want to suspend user ${selectedUser?.full_name}? They will lose access to library services and all active reservations will be cancelled.`
              }
            </DialogContentText>
            
            {selectedUser?.status !== 'suspended' && (
              <TextField
                fullWidth
                label="Reason for Suspension (Optional)"
                multiline
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter the reason for suspending this user..."
                helperText="This reason will be included in the notification sent to the user"
                sx={{ mt: 1 }}
              />
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={() => {
                if (selectedUser) {
                  handleSuspendUser(selectedUser, 'toggle');
                }
              }} 
              color={selectedUser?.status === 'suspended' ? 'success' : 'warning'} 
              variant="contained"
            >
              {selectedUser?.status === 'suspended' ? 'Activate User' : 'Suspend User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog open={openDialog === 'status'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <ChangeCircle />
              Change User Status
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Change the status of user <strong>{selectedUser?.full_name}</strong>:
            </DialogContentText>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={formData.status || selectedUser?.status || 'active'}
                label="New Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <SelectMenuItem value="active">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    Active - Full access to library services
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="inactive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Block sx={{ color: 'default', fontSize: 20 }} />
                    Inactive - Limited access, account on hold
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="suspended">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning sx={{ color: 'error.main', fontSize: 20 }} />
                    Suspended - No access, disciplinary action
                  </Box>
                </SelectMenuItem>
              </Select>
            </FormControl>

            {formData.status === 'suspended' && (
              <TextField
                fullWidth
                label="Reason for Status Change"
                multiline
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter the reason for this status change..."
                helperText="This reason will be recorded and may be included in notifications"
                sx={{ mt: 2 }}
              />
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={() => {
                if (selectedUser) {
                  handleUpdateUser();
                }
              }} 
              variant="contained"
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Promote User Dialog */}
        <Dialog open={openDialog === 'promote'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <Upgrade />
              Promote User to Librarian
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Promote user <strong>{selectedUser?.full_name}</strong> to librarian role. This will grant them staff privileges and access to librarian functions.
            </DialogContentText>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                  <BusinessCenter sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Employment Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={formData.employee_id || ''}
                  onChange={(e) => handleInputChange('employee_id', e.target.value)}
                  helperText="Unique identifier for the new librarian"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Reference, Circulation, Children's"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date as Librarian"
                  type="date"
                  value={formData.hire_date || ''}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Work Shift</InputLabel>
                  <Select
                    value={formData.shift || 'morning'}
                    label="Work Shift"
                    onChange={(e) => handleInputChange('shift', e.target.value)}
                  >
                    <SelectMenuItem value="morning">Morning (8:00 AM - 4:00 PM)</SelectMenuItem>
                    <SelectMenuItem value="afternoon">Afternoon (12:00 PM - 8:00 PM)</SelectMenuItem>
                    <SelectMenuItem value="evening">Evening (4:00 PM - 12:00 AM)</SelectMenuItem>
                    <SelectMenuItem value="night">Night (10:00 PM - 6:00 AM)</SelectMenuItem>
                    <SelectMenuItem value="flexible">Flexible Hours</SelectMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Promotion (Optional)"
                  multiline
                  rows={3}
                  value={promotionReason}
                  onChange={(e) => setPromotionReason(e.target.value)}
                  placeholder="Enter the reason for promoting this user to librarian..."
                  helperText="This reason will be recorded for HR purposes and may be included in notifications"
                />
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handlePromoteUser}
              variant="contained"
              color="primary"
            >
              Promote to Librarian
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
        >
          <Alert onClose={() => setSuccess('')} severity="success">
            {success}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert onClose={() => setError('')} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default AdminUsers;
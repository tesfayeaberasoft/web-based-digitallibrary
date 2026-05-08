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
  AccountCircle
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDialog, setOpenDialog] = useState('');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter && { role: roleFilter }),
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
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
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
        role: 'user',
        status: 'active'
      });
    } else if (dialogType === 'edit' && user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        role: user.role,
        status: user.status
      });
    } else if (dialogType === 'details' && user) {
      fetchUserDetails(user.id);
    }
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog('');
    setSelectedUser(null);
    setFormData({});
    setUserDetails(null);
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
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8000/api/users/${selectedUser.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('User updated successfully');
        handleCloseDialog();
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleSuspendUser = async (action = 'toggle') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8000/api/users/${selectedUser.id}/suspend`, 
        { action }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        handleCloseDialog();
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:8000/api/users/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        handleCloseDialog();
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'librarian': return 'warning';
      case 'user': return 'primary';
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
                👥 User Management
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Manage all registered users, roles, and permissions
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => handleOpenDialog('add')}
              sx={{ 
                px: 3,
                background: 'linear-gradient(45deg, #4a9b8e 30%, #66bb6a 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #3d8276 30%, #4caf50 90%)',
                }
              }}
            >
              Add User
            </Button>
          </Box>
        </Fade>

        {/* Filters */}
        <Grow in timeout={500}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={roleFilter}
                      label="Role"
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <SelectMenuItem value="">All Roles</SelectMenuItem>
                      <SelectMenuItem value="user">User</SelectMenuItem>
                      <SelectMenuItem value="librarian">Librarian</SelectMenuItem>
                      <SelectMenuItem value="admin">Admin</SelectMenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
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
                <Grid item xs={12} md={2}>
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
                          <TableCell>Role</TableCell>
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
                              <TableCell>
                                <Chip
                                  label={user.role}
                                  size="small"
                                  color={getRoleColor(user.role)}
                                  sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                />
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
          <MenuItem onClick={() => handleOpenDialog('details', selectedUser)}>
            <Visibility sx={{ mr: 2, fontSize: 20 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => handleOpenDialog('edit', selectedUser)}>
            <Edit sx={{ mr: 2, fontSize: 20 }} />
            Edit User
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleSuspendUser('toggle')}>
            <Block sx={{ mr: 2, fontSize: 20 }} />
            {selectedUser?.status === 'suspended' ? 'Activate' : 'Suspend'} User
          </MenuItem>
          <MenuItem onClick={() => handleOpenDialog('delete', selectedUser)} sx={{ color: 'error.main' }}>
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
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role || 'user'}
                    label="Role"
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <SelectMenuItem value="user">User</SelectMenuItem>
                    <SelectMenuItem value="librarian">Librarian</SelectMenuItem>
                    <SelectMenuItem value="admin">Admin</SelectMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
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
                        <BookmarkBorder sx={{ mr: 1, verticalAlign: 'middle' }} />
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
                          📚 Currently Borrowed Books
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
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Delete User
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
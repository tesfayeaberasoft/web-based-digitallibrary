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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Grow,
  Snackbar,
  DialogContentText,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Search,
  MoreVert,
  Edit,
  Delete,
  Block,
  Visibility,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Warning,
  Refresh,
  PersonAdd,
  AccountCircle,
  SupervisorAccount,
  Security,
  Work,
  Schedule,
  Assignment,
  Notifications,
  Settings,
  CheckCircle,
  Cancel,
  AccessTime,
  Group,
  PersonRemove,
  // Enhanced icons for better visual appeal
  SupervisedUserCircle,
  ManageAccounts,
  WorkOutline,
  BusinessCenter,
  School,
  LocalLibrary,
  AdminPanelSettings,
  Groups,
  PeopleAlt,
  PersonPin,
  WorkspacePremium,
  Engineering,
  Support,
  Handyman,
  Psychology,
  EmojiPeople,
  GroupWork,
  Diversity3,
  PersonSearch,
  PersonOff,
  Transform,
  SwapVerticalCircle,
  TrendingDown,
  RemoveCircle,
  ChangeCircle,
  AccountBox,
  ContactMail,
  EventAvailable,
  VerifiedUser,
  Apartment,
  Schedule as ScheduleIcon,
  AccessTimeFilled,
  WbSunny,
  Brightness3,
  Brightness6,
  Assessment
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const AdminLibrarians = () => {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLibrarian, setSelectedLibrarian] = useState(null);
  const [selectedLibrarianId, setSelectedLibrarianId] = useState(null);
  const [openDialog, setOpenDialog] = useState('');
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [librarianDetails, setLibrarianDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [demotionReason, setDemotionReason] = useState('');

  useEffect(() => {
    fetchLibrarians();
  }, [page, searchQuery, statusFilter]);

  const fetchLibrarians = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        role: 'librarian', // Only fetch librarians
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await axios.get(`http://localhost:8000/api/users/list?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLibrarians(response.data.users);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching librarians:', err);
      setError('Failed to load librarians');
    } finally {
      setLoading(false);
    }
  };

  const fetchLibrarianDetails = async (librarianId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/users/${librarianId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLibrarianDetails(response.data.user);
      }
    } catch (err) {
      console.error('Error fetching librarian details:', err);
      setError('Failed to load librarian details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleMenuOpen = (event, librarian) => {
    setAnchorEl(event.currentTarget);
    setSelectedLibrarian(librarian);
    setSelectedLibrarianId(librarian.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (dialogType, librarian = null) => {
    setOpenDialog(dialogType);
    setSelectedLibrarian(librarian);
    if (dialogType === 'add') {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'librarian',
        status: 'active',
        department: '',
        employee_id: '',
        hire_date: new Date().toISOString().split('T')[0],
        shift: 'morning',
        permissions: []
      });
    } else if (dialogType === 'edit' && librarian) {
      setFormData({
        full_name: librarian.full_name,
        email: librarian.email,
        password: '',
        phone: librarian.phone || '',
        address: librarian.address || '',
        role: 'librarian',
        status: librarian.status,
        department: librarian.department || '',
        employee_id: librarian.employee_id || '',
        hire_date: librarian.hire_date || new Date().toISOString().split('T')[0],
        shift: librarian.shift || 'morning',
        permissions: librarian.permissions || []
      });
    } else if (dialogType === 'status' && librarian) {
      setFormData({
        status: librarian.status
      });
      setSuspendReason('');
    } else if (dialogType === 'details' && librarian) {
      fetchLibrarianDetails(librarian.id);
    } else if (dialogType === 'suspend' && librarian) {
      setSuspendReason('');
    } else if (dialogType === 'demote' && librarian) {
      setDemotionReason('');
    }
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog('');
    setSelectedLibrarian(null);
    setSelectedLibrarianId(null);
    setFormData({});
    setLibrarianDetails(null);
    setSuspendReason('');
    setDemotionReason('');
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateLibrarian = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/users/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('Librarian created successfully');
        handleCloseDialog();
        fetchLibrarians();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create librarian');
    }
  };

  const handleUpdateLibrarian = async () => {
    if (!selectedLibrarian) {
      setError('No librarian selected for update');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Updating librarian:', selectedLibrarian.id, 'with data:', formData);
      
      const response = await axios.put(`http://localhost:8000/api/users/${selectedLibrarian.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        setSuccess('Librarian updated successfully');
        handleCloseDialog();
        fetchLibrarians();
      } else {
        setError(response.data.message || 'Failed to update librarian');
      }
    } catch (err) {
      console.error('Update librarian error:', err);
      setError(err.response?.data?.message || `Failed to update librarian: ${err.message}`);
    }
  };

  const handleSuspendLibrarian = async (librarian, action = 'toggle') => {
    if (!librarian) {
      setError('No librarian selected for status update');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Suspending librarian:', librarian.id, 'action:', action, 'reason:', suspendReason);
      
      const requestBody = { action };
      if (suspendReason.trim()) {
        requestBody.reason = suspendReason.trim();
      }
      
      const response = await axios.put(`http://localhost:8000/api/users/${librarian.id}/suspend`, 
        requestBody, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Suspend response:', response.data);

      if (response.data.success) {
        setSuccess(response.data.message);
        handleCloseDialog();
        fetchLibrarians();
      } else {
        setError(response.data.message || 'Failed to update librarian status');
      }
    } catch (err) {
      console.error('Suspend librarian error:', err);
      setError(err.response?.data?.message || `Failed to update librarian status: ${err.message}`);
    }
  };

  const handleDeleteLibrarian = async () => {
    if (!selectedLibrarian) {
      setError('No librarian selected for deletion');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Deleting librarian:', selectedLibrarian.id, selectedLibrarian.full_name);
      
      const response = await axios.delete(`http://localhost:8000/api/users/${selectedLibrarian.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Delete response:', response.data);

      if (response.data.success) {
        setSuccess(response.data.message);
        handleCloseDialog();
        fetchLibrarians();
      } else {
        setError(response.data.message || 'Failed to delete librarian');
      }
    } catch (err) {
      console.error('Delete librarian error:', err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Cannot delete librarian - check for active responsibilities');
      } else if (err.response?.status === 403) {
        setError('Access denied - admin privileges required');
      } else if (err.response?.status === 404) {
        setError('Librarian not found');
      } else {
        setError(err.response?.data?.message || `Failed to delete librarian: ${err.message}`);
      }
    }
  };

  const handleDemoteLibrarian = async () => {
    if (!selectedLibrarian) {
      setError('No librarian selected for demotion');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Demoting librarian:', selectedLibrarian.id, 'to user');
      
      const demotionData = {
        role: 'user',
        // Clear librarian-specific fields
        department: null,
        employee_id: null,
        hire_date: null,
        shift: null
      };

      if (demotionReason.trim()) {
        demotionData.promotion_reason = `Demoted from librarian: ${demotionReason.trim()}`;
      }
      
      const response = await axios.put(`http://localhost:8000/api/users/${selectedLibrarian.id}`, 
        demotionData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Demotion response:', response.data);

      if (response.data.success) {
        setSuccess(`Librarian ${selectedLibrarian.full_name} has been demoted to user successfully`);
        handleCloseDialog();
        fetchLibrarians();
      } else {
        setError(response.data.message || 'Failed to demote librarian');
      }
    } catch (err) {
      console.error('Demote librarian error:', err);
      setError(err.response?.data?.message || `Failed to demote librarian: ${err.message}`);
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

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'morning': return 'primary';
      case 'afternoon': return 'warning';
      case 'evening': return 'secondary';
      case 'night': return 'info';
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
                <SupervisedUserCircle sx={{ mr: 1, verticalAlign: 'middle', fontSize: 40 }} />
                Librarian Management
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Manage library staff, their roles, and permissions
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
              Add Librarian
            </Button>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grow in timeout={400}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {librarians.filter(l => l.status === 'active').length}
                      </Typography>
                      <Typography variant="body2">Active Librarians</Typography>
                    </Box>
                    <SupervisorAccount sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {librarians.filter(l => l.status === 'suspended').length}
                      </Typography>
                      <Typography variant="body2">Suspended</Typography>
                    </Box>
                    <Block sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {librarians.filter(l => l.shift === 'morning').length}
                      </Typography>
                      <Typography variant="body2">Morning Shift</Typography>
                    </Box>
                    <AccessTimeFilled sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={700}>
                        {librarians.length}
                      </Typography>
                      <Typography variant="body2">Total Staff</Typography>
                    </Box>
                    <Group sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grow>

        {/* Filters */}
        <Grow in timeout={500}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search librarians by name, email, or employee ID..."
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
                    onClick={fetchLibrarians}
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grow>

        {/* Librarians Table */}
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
                          <TableCell>Librarian</TableCell>
                          <TableCell>Employee ID</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell align="center">Shift</TableCell>
                          <TableCell align="center">Status</TableCell>
                          <TableCell align="center">Hire Date</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {librarians.map((librarian, index) => (
                          <Fade in timeout={300 + index * 50} key={librarian.id}>
                            <TableRow hover sx={{ '&:hover': { bgcolor: 'rgba(74, 155, 142, 0.04)' } }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    badgeContent={
                                      librarian.status === 'active' ? 
                                        <CheckCircle sx={{ color: 'success.main', fontSize: 16 }} /> :
                                        <Cancel sx={{ color: 'error.main', fontSize: 16 }} />
                                    }
                                  >
                                    <Avatar
                                      src={librarian.profile_image}
                                      sx={{
                                        backgroundColor: '#4a9b8e',
                                        width: 45,
                                        height: 45,
                                        mr: 2
                                      }}
                                    >
                                      {librarian.full_name.charAt(0)}
                                    </Avatar>
                                  </Badge>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {librarian.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {librarian.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={600}>
                                  {librarian.employee_id || librarian.user_id}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {librarian.department || 'General'}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={librarian.shift || 'Morning'}
                                  size="small"
                                  color={getShiftColor(librarian.shift)}
                                  sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={librarian.status}
                                  size="small"
                                  color={getStatusColor(librarian.status)}
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {formatDate(librarian.hire_date || librarian.created_at)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, librarian)}
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
            handleOpenDialog('details', selectedLibrarian);
          }}>
            <Visibility sx={{ mr: 2, fontSize: 20 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={() => {
            handleOpenDialog('edit', selectedLibrarian);
          }}>
            <Edit sx={{ mr: 2, fontSize: 20 }} />
            Edit Librarian
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            handleOpenDialog('status', selectedLibrarian);
          }}>
            <ChangeCircle sx={{ mr: 2, fontSize: 20 }} />
            Change Status
          </MenuItem>
          <MenuItem onClick={() => {
            handleOpenDialog('demote', selectedLibrarian);
          }} sx={{ color: 'warning.main' }}>
            <TrendingDown sx={{ mr: 2, fontSize: 20 }} />
            Demote to User
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            const librarianToSuspend = selectedLibrarian;
            handleMenuClose();
            if (librarianToSuspend) {
              handleOpenDialog('suspend', librarianToSuspend);
            }
          }}>
            <Block sx={{ mr: 2, fontSize: 20 }} />
            {selectedLibrarian?.status === 'suspended' ? 'Activate' : 'Suspend'} Librarian
          </MenuItem>
          <MenuItem onClick={() => {
            handleOpenDialog('delete', selectedLibrarian);
          }} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 2, fontSize: 20 }} />
            Delete Librarian
          </MenuItem>
        </Menu>
        {/* Add/Edit Librarian Dialog */}
        <Dialog open={openDialog === 'add' || openDialog === 'edit'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ManageAccounts />
              {openDialog === 'add' ? 'Add New Librarian' : 'Edit Librarian'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Personal Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.full_name || ''}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </Grid>

              {/* Employment Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}>
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
                  helperText="Unique identifier for the librarian"
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
                  label="Hire Date"
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

              {/* Account Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}>
                  <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Settings
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Account Status</InputLabel>
                  <Select
                    value={formData.status || 'active'}
                    label="Account Status"
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
              onClick={openDialog === 'add' ? handleCreateLibrarian : handleUpdateLibrarian}
            >
              {openDialog === 'add' ? 'Create Librarian' : 'Update Librarian'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Librarian Details Dialog */}
        <Dialog open={openDialog === 'details'} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountCircle />
              Librarian Details
            </Box>
          </DialogTitle>
          <DialogContent>
            {detailsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : librarianDetails ? (
              <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Personal Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Person /></ListItemIcon>
                          <ListItemText primary="Name" secondary={librarianDetails.full_name} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Email /></ListItemIcon>
                          <ListItemText primary="Email" secondary={librarianDetails.email} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Phone /></ListItemIcon>
                          <ListItemText primary="Phone" secondary={librarianDetails.phone || 'Not provided'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><LocationOn /></ListItemIcon>
                          <ListItemText primary="Address" secondary={librarianDetails.address || 'Not provided'} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Employment Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Employment Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><Assignment /></ListItemIcon>
                          <ListItemText primary="Employee ID" secondary={librarianDetails.employee_id || librarianDetails.user_id} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Work /></ListItemIcon>
                          <ListItemText primary="Department" secondary={librarianDetails.department || 'General'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><Schedule /></ListItemIcon>
                          <ListItemText primary="Work Shift" secondary={librarianDetails.shift || 'Morning'} />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon><CalendarToday /></ListItemIcon>
                          <ListItemText primary="Hire Date" secondary={formatDate(librarianDetails.hire_date || librarianDetails.created_at)} />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Account Status */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Account Status
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: getStatusColor(librarianDetails.status) === 'success' ? '#e8f5e9' : '#ffebee', borderRadius: 2 }}>
                            <Typography variant="h5" fontWeight={700} color={getStatusColor(librarianDetails.status) === 'success' ? '#2e7d32' : '#c62828'}>
                              {librarianDetails.status.toUpperCase()}
                            </Typography>
                            <Typography variant="body2">Current Status</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                            <Typography variant="h5" fontWeight={700} color="#1976d2">
                              {formatDate(librarianDetails.last_login || librarianDetails.created_at)}
                            </Typography>
                            <Typography variant="body2">Last Login</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Performance Metrics */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Performance Overview
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#7b1fa2">
                              {Math.floor(Math.random() * 50) + 20}
                            </Typography>
                            <Typography variant="body2">Books Processed</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
                            <Typography variant="h4" fontWeight={700} color="#f57c00">
                              {Math.floor(Math.random() * 30) + 10}
                            </Typography>
                            <Typography variant="body2">Users Assisted</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Status Change Dialog */}
        <Dialog open={openDialog === 'status'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <ChangeCircle />
              Change Librarian Status
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Change the status of librarian <strong>{selectedLibrarian?.full_name}</strong>:
            </DialogContentText>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={formData.status || selectedLibrarian?.status || 'active'}
                label="New Status"
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <SelectMenuItem value="active">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    Active - Full access to all systems
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="inactive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Cancel sx={{ color: 'default', fontSize: 20 }} />
                    Inactive - Limited access, on leave
                  </Box>
                </SelectMenuItem>
                <SelectMenuItem value="suspended">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Block sx={{ color: 'error.main', fontSize: 20 }} />
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
                if (selectedLibrarian) {
                  handleUpdateLibrarian();
                }
              }} 
              variant="contained"
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Suspend/Activate Confirmation Dialog */}
        <Dialog open={openDialog === 'suspend'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
              <Block />
              {selectedLibrarian?.status === 'suspended' ? 'Activate Librarian' : 'Suspend Librarian'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {selectedLibrarian?.status === 'suspended' 
                ? `Are you sure you want to activate librarian ${selectedLibrarian?.full_name}? They will regain access to all library systems and responsibilities.`
                : `Are you sure you want to suspend librarian ${selectedLibrarian?.full_name}? They will lose access to library systems and their duties will need to be reassigned.`
              }
            </DialogContentText>
            
            {selectedLibrarian?.status !== 'suspended' && (
              <TextField
                fullWidth
                label="Reason for Suspension (Optional)"
                multiline
                rows={3}
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter the reason for suspending this librarian..."
                helperText="This reason will be included in the notification sent to the librarian"
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
                if (selectedLibrarian) {
                  handleSuspendLibrarian(selectedLibrarian, 'toggle');
                }
              }} 
              color={selectedLibrarian?.status === 'suspended' ? 'success' : 'warning'} 
              variant="contained"
            >
              {selectedLibrarian?.status === 'suspended' ? 'Activate Librarian' : 'Suspend Librarian'}
            </Button>
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
              Are you sure you want to delete librarian <strong>{selectedLibrarian?.full_name}</strong>? 
              This action cannot be undone and will remove all librarian data except completed transactions.
              <br /><br />
              <strong>Warning:</strong> Make sure to reassign any ongoing responsibilities before deletion.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={() => {
              if (selectedLibrarian) {
                handleDeleteLibrarian();
              }
            }} color="error" variant="contained">
              Delete Librarian
            </Button>
          </DialogActions>
        </Dialog>

        {/* Demote Confirmation Dialog */}
        <Dialog open={openDialog === 'demote'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
              <TrendingDown />
              Demote Librarian to User
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Are you sure you want to demote librarian <strong>{selectedLibrarian?.full_name}</strong> to a regular user? 
              This action will:
            </DialogContentText>
            
            <Box sx={{ mb: 2, pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • ❌ Remove all librarian privileges and system access
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 🏢 Clear employment information (department, employee ID, shift)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 📚 Revoke access to librarian-only functions
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • 👤 Convert to regular library user account
              </Typography>
            </Box>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Important:</strong> Make sure to reassign any ongoing responsibilities and notify the staff member before proceeding.
            </Alert>
            
            <TextField
              fullWidth
              label="Reason for Demotion"
              multiline
              rows={3}
              value={demotionReason}
              onChange={(e) => setDemotionReason(e.target.value)}
              placeholder="Enter the reason for demoting this librarian to user..."
              helperText="This reason will be recorded for HR purposes and may be included in notifications"
              required
            />
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleDemoteLibrarian}
              color="warning" 
              variant="contained"
              disabled={!demotionReason.trim()}
            >
              Demote to User
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

export default AdminLibrarians;
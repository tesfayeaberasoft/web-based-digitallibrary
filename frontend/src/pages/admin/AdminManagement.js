import React, { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Switch,
  Tooltip
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
  Warning,
  Refresh,
  PersonAdd,
  AdminPanelSettings,
  Security,
  Upgrade,
  PersonOff,
  ChangeCircle,
  Shield,
  Groups,
  VerifiedUser,
  Schedule,
  Key
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API = 'http://localhost:8000/api';
const GRADIENT = 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)';

const AdminManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [suspendReason, setSuspendReason] = useState('');
  const [demotionReason, setDemotionReason] = useState('');
  const [promotionReason, setPromotionReason] = useState('');
  const [showLibrarians, setShowLibrarians] = useState(false);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const isProtectedAccount = (u) =>
    u?.role === 'super-admin' || String(u?.id) === String(currentUser?.id);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/users/list?role=admin&limit=500&page=1`, {
        headers: authHeaders()
      });
      if (res.data.success) {
        const list = res.data.users || [];
        setStats({
          total: list.length,
          active: list.filter((u) => u.status === 'active').length,
          suspended: list.filter((u) => u.status === 'suspended').length,
          inactive: list.filter((u) => u.status === 'inactive').length
        });
      }
    } catch (e) {
      console.error('Stats fetch failed', e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(showLibrarians ? { role: 'librarian' } : { role: 'admin' }),
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter })
      });
      const res = await axios.get(`${API}/users/list?${params}`, { headers: authHeaders() });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrators');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, showLibrarians]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, success]);

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(`${API}/users/${userId}`, { headers: authHeaders() });
      if (res.data.success) setUserDetails(res.data.user);
    } catch {
      setError('Failed to load admin details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleOpenDialog = (type, user = null) => {
    setOpenDialog(type);
    setSelectedUser(user);
    setError('');
    if (type === 'add') {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'admin',
        status: 'active'
      });
    } else if (type === 'edit' && user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '',
        phone: user.phone || '',
        address: user.address || '',
        role: 'admin',
        status: user.status
      });
    } else if (type === 'details' && user) {
      fetchUserDetails(user.id);
    } else if (type === 'status' && user) {
      setFormData({ status: user.status });
    } else if (type === 'demote' && user) {
      setDemotionReason('');
    } else if (type === 'promote' && user) {
      setPromotionReason('');
    } else if (type === 'suspend') {
      setSuspendReason('');
    }
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog('');
    setSelectedUser(null);
    setFormData({});
    setUserDetails(null);
    setSuspendReason('');
    setDemotionReason('');
    setPromotionReason('');
    setError('');
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAdmin = async () => {
    try {
      const payload = { ...formData, role: 'admin' };
      const res = await axios.post(`${API}/users/create`, payload, { headers: authHeaders() });
      if (res.data.success) {
        setSuccess('Administrator created successfully');
        handleCloseDialog();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create administrator');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const payload = { ...formData, role: 'admin' };
      if (!payload.password) delete payload.password;
      const res = await axios.put(`${API}/users/${selectedUser.id}`, payload, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setSuccess('Administrator updated successfully');
        handleCloseDialog();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update administrator');
    }
  };

  const handleSuspendUser = async (user) => {
    try {
      const body = { action: 'toggle' };
      if (suspendReason.trim()) body.reason = suspendReason.trim();
      const res = await axios.put(`${API}/users/${user.id}/suspend`, body, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        handleCloseDialog();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePromoteToAdmin = async () => {
    if (!selectedUser) return;
    try {
      const payload = { role: 'admin' };
      if (promotionReason.trim()) payload.promotion_reason = promotionReason.trim();
      const res = await axios.put(`${API}/users/${selectedUser.id}`, payload, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setSuccess(`${selectedUser.full_name} promoted to administrator`);
        handleCloseDialog();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemoteToLibrarian = async () => {
    if (!selectedUser) return;
    try {
      const payload = {
        role: 'librarian',
        department: 'Administration',
        shift: 'morning',
        employee_id: `LIB${String(selectedUser.id).padStart(4, '0')}`
      };
      if (demotionReason.trim()) payload.demotion_reason = demotionReason.trim();
      const res = await axios.put(`${API}/users/${selectedUser.id}`, payload, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setSuccess(`${selectedUser.full_name} demoted to librarian`);
        handleCloseDialog();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to demote administrator');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await axios.delete(`${API}/users/${selectedUser.id}`, {
        headers: authHeaders()
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        handleCloseDialog();
        fetchUsers();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete administrator');
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

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : 'Never');

  return (
    <DashboardLayout title="Super Admin Panel">
      <Box>
        <Fade in timeout={300}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                sx={{
                  background: GRADIENT,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
                Admin Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create, manage, and control system administrators and permissions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showLibrarians}
                    onChange={(e) => {
                      setShowLibrarians(e.target.checked);
                      setPage(1);
                    }}
                    color="error"
                  />
                }
                label={showLibrarians ? 'Librarians (promote)' : 'Administrators only'}
              />
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleOpenDialog('add')}
                sx={{
                  background: GRADIENT,
                  '&:hover': { background: 'linear-gradient(45deg, #c62828 30%, #e53935 90%)' }
                }}
              >
                Add Administrator
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Admins', value: stats.total, icon: <Groups />, color: '#d32f2f', bg: '#ffebee' },
            { label: 'Active', value: stats.active, icon: <VerifiedUser />, color: '#2e7d32', bg: '#e8f5e9' },
            { label: 'Suspended', value: stats.suspended, icon: <Block />, color: '#c62828', bg: '#ffcdd2' },
            { label: 'Inactive', value: stats.inactive, icon: <Schedule />, color: '#616161', bg: '#f5f5f5' }
          ].map((s, i) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Grow in timeout={400 + i * 100}>
                <Card sx={{ bgcolor: s.bg }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: s.color }}>{s.icon}</Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>
                        {s.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.label}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        <Alert severity="info" sx={{ mb: 3 }} icon={<Shield />}>
          Super administrators cannot be modified or removed from this panel. Use librarian view to promote staff to admin.
        </Alert>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder={showLibrarians ? 'Search librarians...' : 'Search admins by name or email...'}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <SelectMenuItem value="">All</SelectMenuItem>
                    <SelectMenuItem value="active">Active</SelectMenuItem>
                    <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
                    <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button fullWidth variant="outlined" startIcon={<Refresh />} onClick={() => { fetchUsers(); fetchStats(); }}>
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress color="error" />
              </Box>
            ) : users.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <AdminPanelSettings sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  {showLibrarians ? 'No librarians found to promote.' : 'No administrators found. Add one to get started.'}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{showLibrarians ? 'Librarian' : 'Administrator'}</TableCell>
                        <TableCell>Staff ID</TableCell>
                        <TableCell align="center">Role</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Last login</TableCell>
                        <TableCell align="center">Joined</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                src={user.profile_image ? `${API.replace('/api', '')}/${user.profile_image}` : undefined}
                                sx={{ bgcolor: '#d32f2f' }}
                              >
                                {user.full_name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600}>{user.full_name}</Typography>
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
                            <Chip label={user.role} size="small" color="error" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={user.status} size="small" color={getStatusColor(user.status)} sx={{ textTransform: 'capitalize' }} />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{formatDate(user.last_login)}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">{new Date(user.created_at).toLocaleDateString()}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            {isProtectedAccount(user) ? (
                              <Tooltip title="Protected account">
                                <Chip icon={<Shield />} label="Protected" size="small" variant="outlined" />
                              </Tooltip>
                            ) : (
                              <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                                <MoreVert />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleOpenDialog('details', selectedUser)}>
            <Visibility sx={{ mr: 2 }} /> View details
          </MenuItem>
          {!showLibrarians && (
            <MenuItem onClick={() => handleOpenDialog('edit', selectedUser)}>
              <Edit sx={{ mr: 2 }} /> Edit
            </MenuItem>
          )}
          <MenuItem onClick={() => handleOpenDialog('status', selectedUser)}>
            <ChangeCircle sx={{ mr: 2 }} /> Change status
          </MenuItem>
          <Divider />
          {showLibrarians ? (
            <MenuItem onClick={() => handleOpenDialog('promote', selectedUser)} sx={{ color: 'success.main' }}>
              <Upgrade sx={{ mr: 2 }} /> Promote to admin
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleOpenDialog('demote', selectedUser)} sx={{ color: 'warning.main' }}>
              <PersonOff sx={{ mr: 2 }} /> Demote to librarian
            </MenuItem>
          )}
          <MenuItem onClick={() => handleOpenDialog('suspend', selectedUser)}>
            <Block sx={{ mr: 2 }} />
            {selectedUser?.status === 'suspended' ? 'Activate' : 'Suspend'}
          </MenuItem>
          <MenuItem onClick={() => handleOpenDialog('delete', selectedUser)} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 2 }} /> Delete
          </MenuItem>
        </Menu>

        {/* Add / Edit */}
        <Dialog open={openDialog === 'add' || openDialog === 'edit'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: '#d32f2f', color: 'white' }}>
            {openDialog === 'add' ? 'Add administrator' : 'Edit administrator'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full name" required value={formData.full_name || ''} onChange={(e) => handleInputChange('full_name', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" required value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={openDialog === 'add' ? 'Password' : 'New password (optional)'}
                  type="password"
                  required={openDialog === 'add'}
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  InputProps={openDialog === 'edit' ? { startAdornment: <InputAdornment position="start"><Key /></InputAdornment> } : undefined}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Phone" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status || 'active'} label="Status" onChange={(e) => handleInputChange('status', e.target.value)}>
                    <SelectMenuItem value="active">Active</SelectMenuItem>
                    <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
                    <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Address" multiline rows={2} value={formData.address || ''} onChange={(e) => handleInputChange('address', e.target.value)} />
              </Grid>
            </Grid>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" color="error" onClick={openDialog === 'add' ? handleCreateAdmin : handleUpdateUser}>
              {openDialog === 'add' ? 'Create' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Details */}
        <Dialog open={openDialog === 'details'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Administrator details</DialogTitle>
          <DialogContent>
            {detailsLoading ? (
              <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
            ) : userDetails ? (
              <List dense>
                <ListItem><ListItemIcon><Person /></ListItemIcon><ListItemText primary="Name" secondary={userDetails.full_name} /></ListItem>
                <ListItem><ListItemIcon><Email /></ListItemIcon><ListItemText primary="Email" secondary={userDetails.email} /></ListItem>
                <ListItem><ListItemIcon><Phone /></ListItemIcon><ListItemText primary="Phone" secondary={userDetails.phone || '—'} /></ListItem>
                <ListItem><ListItemIcon><LocationOn /></ListItemIcon><ListItemText primary="Address" secondary={userDetails.address || '—'} /></ListItem>
                <ListItem><ListItemIcon><Security /></ListItemIcon><ListItemText primary="Role" secondary={userDetails.role} /></ListItem>
                <ListItem><ListItemIcon><CalendarToday /></ListItemIcon><ListItemText primary="Joined" secondary={formatDate(userDetails.created_at)} /></ListItem>
                <ListItem><ListItemIcon><Schedule /></ListItemIcon><ListItemText primary="Last login" secondary={formatDate(userDetails.last_login)} /></ListItem>
              </List>
            ) : null}
          </DialogContent>
          <DialogActions><Button onClick={handleCloseDialog}>Close</Button></DialogActions>
        </Dialog>

        {/* Status */}
        <Dialog open={openDialog === 'status'} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle>Change status</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status || 'active'} label="Status" onChange={(e) => handleInputChange('status', e.target.value)}>
                <SelectMenuItem value="active">Active</SelectMenuItem>
                <SelectMenuItem value="inactive">Inactive</SelectMenuItem>
                <SelectMenuItem value="suspended">Suspended</SelectMenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleUpdateUser}>Update</Button>
          </DialogActions>
        </Dialog>

        {/* Suspend */}
        <Dialog open={openDialog === 'suspend'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedUser?.status === 'suspended' ? 'Activate' : 'Suspend'} account</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {selectedUser?.status === 'suspended'
                ? `Restore access for ${selectedUser?.full_name}?`
                : `Suspend ${selectedUser?.full_name}? They will lose admin panel access.`}
            </DialogContentText>
            {selectedUser?.status !== 'suspended' && (
              <TextField fullWidth multiline rows={2} label="Reason (optional)" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" color={selectedUser?.status === 'suspended' ? 'success' : 'warning'} onClick={() => handleSuspendUser(selectedUser)}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Promote librarian → admin */}
        <Dialog open={openDialog === 'promote'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: 'success.main' }}>Promote to administrator</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Grant <strong>{selectedUser?.full_name}</strong> full admin access to users, settings, and analytics.
            </DialogContentText>
            <TextField fullWidth multiline rows={2} label="Reason (optional)" value={promotionReason} onChange={(e) => setPromotionReason(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" color="success" startIcon={<Upgrade />} onClick={handlePromoteToAdmin}>Promote</Button>
          </DialogActions>
        </Dialog>

        {/* Demote admin → librarian */}
        <Dialog open={openDialog === 'demote'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: 'warning.main' }}>Demote to librarian</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>Removes admin panel access; keeps librarian tools.</Alert>
            <TextField fullWidth multiline rows={2} label="Reason (optional)" value={demotionReason} onChange={(e) => setDemotionReason(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" color="warning" onClick={handleDemoteToLibrarian}>Demote</Button>
          </DialogActions>
        </Dialog>

        {/* Delete */}
        <Dialog open={openDialog === 'delete'} onClose={handleCloseDialog}>
          <DialogTitle sx={{ color: 'error.main' }}><Warning sx={{ mr: 1 }} />Delete administrator</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Permanently delete <strong>{selectedUser?.full_name}</strong>? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button color="error" variant="contained" onClick={handleDeleteUser}>Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!success} autoHideDuration={5000} onClose={() => setSuccess('')}>
          <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
        </Snackbar>
        <Snackbar open={!!error && !openDialog} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default AdminManagement;

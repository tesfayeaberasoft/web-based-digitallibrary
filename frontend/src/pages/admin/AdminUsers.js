import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import {
  Search,
  Add,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const users = [
    {
      id: 1,
      userId: 'USR001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-1234',
      booksIssued: 3,
      fines: 0,
      status: 'active',
      memberSince: '1/15/2026'
    },
    {
      id: 2,
      userId: 'USR002',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-5678',
      booksIssued: 2,
      fines: 5.50,
      status: 'active',
      memberSince: '2/20/2026'
    },
    {
      id: 3,
      userId: 'USR003',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1-555-9012',
      booksIssued: 0,
      fines: 15.00,
      status: 'suspended',
      memberSince: '3/10/2026'
    },
    {
      id: 4,
      userId: 'USR004',
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-3456',
      booksIssued: 5,
      fines: 0,
      status: 'active',
      memberSince: '1/5/2026'
    }
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddUser = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Manage Users
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage all registered users
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddUser}
            sx={{ px: 3 }}
          >
            Add User
          </Button>
        </Box>

        <Card>
          <CardContent>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search users by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            {/* Users Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell align="center">Books Issued</TableCell>
                    <TableCell align="center">Fines</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Member Since</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              backgroundColor: '#4a9b8e',
                              width: 40,
                              height: 40,
                              mr: 2
                            }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {user.userId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.phone}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.booksIssued}
                          size="small"
                          sx={{
                            backgroundColor: user.booksIssued > 0 ? '#e3f2fd' : '#f5f5f5',
                            color: user.booksIssued > 0 ? '#1976d2' : '#666',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={user.fines > 0 ? 'error' : 'success.main'}
                        >
                          ${user.fines.toFixed(2)}
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
                        <Typography variant="body2">{user.memberSince}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <Edit sx={{ mr: 2, fontSize: 20 }} />
            Edit User
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <CheckCircle sx={{ mr: 2, fontSize: 20 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Block sx={{ mr: 2, fontSize: 20 }} />
            Suspend User
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 2, fontSize: 20 }} />
            Delete User
          </MenuItem>
        </Menu>

        {/* Add User Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="John Doe"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="+1-555-1234"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  placeholder="123 Main St, City, State"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleCloseDialog}>
              Add User
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default AdminUsers;
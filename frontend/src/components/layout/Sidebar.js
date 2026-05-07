import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  People,
  SupervisorAccount,
  Settings,
  Inventory,
  Assignment,
  History,
  EmojiEvents,
  MenuBook,
  GetApp,
  Notifications,
  AccountCircle,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const Sidebar = ({ open = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { text: 'Overview', icon: <Dashboard />, path: '/admin', color: '#4a9b8e' },
          { text: 'Analytics', icon: <TrendingUp />, path: '/admin/analytics', color: '#4a9b8e' },
          { text: 'Users', icon: <People />, path: '/admin/users', color: '#4a9b8e' },
          { text: 'Librarians', icon: <SupervisorAccount />, path: '/admin/librarians', color: '#4a9b8e' },
          { text: 'Settings', icon: <Settings />, path: '/admin/settings', color: '#4a9b8e' },
        ];
      case 'librarian':
        return [
          { text: 'Overview', icon: <Dashboard />, path: '/librarian', color: '#4a9b8e' },
          { text: 'Notifications', icon: <Notifications />, path: '/librarian/notifications', color: '#ff6b6b', badge: '!' },
          { text: 'Requests', icon: <Assignment />, path: '/librarian/requests', color: '#4a9b8e' },
          { text: 'Inventory', icon: <Inventory />, path: '/librarian/inventory', color: '#4a9b8e' },
          { text: 'Members', icon: <People />, path: '/librarian/members', color: '#4a9b8e' },
          { text: 'Reports', icon: <TrendingUp />, path: '/librarian/reports', color: '#4a9b8e' },
        ];
      default:
        return [
          { text: 'Overview', icon: <Dashboard />, path: '/dashboard', color: '#4a9b8e' },
          { text: 'My Books', icon: <MenuBook />, path: '/my-books', color: '#4a9b8e' },
          { text: 'History', icon: <History />, path: '/history', color: '#4a9b8e' },
          { text: 'Reading Goals', icon: <TrendingUp />, path: '/reading-goals', color: '#4a9b8e' },
          { text: 'Achievements', icon: <EmojiEvents />, path: '/achievements', color: '#4a9b8e' },
        ];
    }
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleOpenLogoutDialog = () => {
    setOpenLogoutDialog(true);
  };

  const handleCloseLogoutDialog = () => {
    setOpenLogoutDialog(false);
  };

  const handleConfirmLogout = () => {
    logout();
    setOpenLogoutDialog(false);
    navigate('/login');
  };

  const handleLogout = () => {
    handleOpenLogoutDialog();
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          top: 64, // Height of AppBar
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive(item.path) ? '#4a9b8e' : 'transparent',
                  color: isActive(item.path) ? 'white' : '#666',
                  '&:hover': {
                    backgroundColor: isActive(item.path) ? '#4a9b8e' : '#f5f5f5',
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive(item.path) ? 'white' : item.color,
                    minWidth: 40 
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.path) ? 600 : 500,
                    fontSize: '0.9rem'
                  }}
                />
                {item.badge && (
                  <Chip 
                    label={item.badge} 
                    size="small" 
                    color="error"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* System Health Status */}
        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            System Health
          </Typography>
          <Chip 
            label="Healthy" 
            size="small" 
            color="success" 
            variant="outlined"
          />
        </Box>

        {/* Export Report Button for Admin/Librarian */}
        {(user?.role === 'admin' || user?.role === 'librarian') && (
          <Box sx={{ mt: 2 }}>
            <ListItemButton
              onClick={() => navigate('/librarian/reports')}
              sx={{
                borderRadius: 2,
                backgroundColor: '#4a9b8e',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#3d8276',
                },
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <GetApp />
              </ListItemIcon>
              <ListItemText 
                primary="Export Report"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </Box>
        )}

        {/* Browse Books Button for Users */}
        {user?.role === 'user' && (
          <Box sx={{ mt: 2 }}>
            <ListItemButton
              onClick={() => navigate('/browse')}
              sx={{
                borderRadius: 2,
                backgroundColor: '#4a9b8e',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#3d8276',
                },
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <MenuBook />
              </ListItemIcon>
              <ListItemText 
                primary="Browse Books"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Profile and Logout Section */}
        <List>
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => navigate('/profile')}
              sx={{
                borderRadius: 2,
                backgroundColor: isActive('/profile') ? '#4a9b8e' : 'transparent',
                color: isActive('/profile') ? 'white' : '#666',
                '&:hover': {
                  backgroundColor: isActive('/profile') ? '#4a9b8e' : '#f5f5f5',
                },
                py: 1.5,
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40 
                }}
              >
                <Avatar
                  src={user?.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: isActive('/profile') ? 'white' : '#4a9b8e',
                    color: isActive('/profile') ? '#4a9b8e' : 'white',
                    fontSize: '1rem',
                    fontWeight: 600
                  }}
                >
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Avatar>
              </ListItemIcon>
              <ListItemText 
                primary="Profile"
                primaryTypographyProps={{
                  fontWeight: isActive('/profile') ? 600 : 500,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                color: '#f44336',
                '&:hover': {
                  backgroundColor: '#ffebee',
                },
                py: 1.5,
              }}
            >
              <ListItemIcon 
                sx={{ 
                  color: '#f44336',
                  minWidth: 40 
                }}
              >
                <Logout />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle 
          sx={{ 
            bgcolor: '#f44336',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Logout />
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You will be logged out of your account and redirected to the login page.
          </Alert>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              src={user?.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
              sx={{
                width: 60,
                height: 60,
                bgcolor: '#4a9b8e',
                fontSize: '1.5rem',
                fontWeight: 600
              }}
            >
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {user?.full_name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Chip
                label={user?.role || 'user'}
                size="small"
                color="primary"
                sx={{ mt: 0.5, textTransform: 'capitalize' }}
              />
            </Box>
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseLogoutDialog}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmLogout}
            variant="contained"
            color="error"
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default Sidebar;
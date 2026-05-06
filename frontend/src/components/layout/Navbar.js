import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ExitToApp,
  Dashboard,
  Person,
  MenuBook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ title = "Digital Library", showUserMenu = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const handleDashboard = () => {
    switch (user?.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'librarian':
        navigate('/librarian');
        break;
      default:
        navigate('/dashboard');
    }
    handleClose();
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: '#4a9b8e' }}>
      <Toolbar>
        <MenuBook sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>

        {showUserMenu && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user.role === 'admin' ? 'System Administrator' : 
               user.role === 'librarian' ? user.full_name : 
               `Welcome, ${user.full_name}`}
            </Typography>

            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotifications}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}
                src={user.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
              >
                {user.full_name?.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleDashboard}>
                <Dashboard sx={{ mr: 2 }} />
                Dashboard
              </MenuItem>
              <MenuItem onClick={handleProfile}>
                <Person sx={{ mr: 2 }} />
                My Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}

        {!user && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button 
              color="inherit" 
              variant="outlined" 
              onClick={() => navigate('/register')}
              sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
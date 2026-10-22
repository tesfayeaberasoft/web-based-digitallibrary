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
  MenuBook,
  Login as LoginIcon,
  PersonAddAlt1 as RegisterIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = ({ title = "Digital Library", showUserMenu = true, browseHeader = false }) => {
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
      case 'super-admin':
        navigate('/super-admin');
        break;
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
    <AppBar
      position={browseHeader ? 'sticky' : 'static'}
      elevation={0}
      sx={browseHeader ? {
        zIndex: (theme) => theme.zIndex.appBar,
        color: 'white',
        background: 'linear-gradient(110deg, rgba(20,62,43,.97), rgba(45,106,79,.96) 58%, rgba(59,135,98,.96))',
        borderBottom: '1px solid rgba(255,255,255,.16)',
        boxShadow: '0 8px 28px rgba(18,54,37,.16)',
        backdropFilter: 'blur(16px)',
      } : { backgroundColor: '#4a9b8e' }}
    >
      <Toolbar sx={browseHeader ? {
        width: '100%',
        maxWidth: 1280,
        mx: 'auto',
        minHeight: { xs: 68, sm: 76 },
        px: { xs: 2, sm: 3 },
        gap: 1,
      } : undefined}>
        {browseHeader ? (
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            aria-label="Digital Library home"
            sx={{
              flexGrow: 1,
              justifyContent: 'flex-start',
              minWidth: 0,
              p: 0,
              textAlign: 'left',
              textTransform: 'none',
              borderRadius: 2,
              '&:hover': { bgcolor: 'transparent', '& .browse-brand-icon': { transform: 'rotate(-8deg) scale(1.05)' } },
              '&:focus-visible': { outline: '2px solid rgba(255,255,255,.85)', outlineOffset: 4 },
            }}
          >
            <Box
              className="browse-brand-icon"
              sx={{
                width: 44,
                height: 44,
                mr: 1.5,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                borderRadius: '14px',
                color: 'white',
                bgcolor: 'rgba(255,255,255,.14)',
                border: '1px solid rgba(255,255,255,.27)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18)',
                transition: 'transform 220ms ease, background-color 220ms ease',
              }}
            >
              <MenuBook sx={{ fontSize: 25 }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  color: 'white',
                  fontSize: { xs: '1.05rem', sm: '1.2rem' },
                  fontWeight: 800,
                  letterSpacing: '-.025em',
                  lineHeight: 1.2,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </Typography>
              <Typography
                component="span"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  color: 'rgba(255,255,255,.68)',
                  fontSize: '.72rem',
                  fontWeight: 500,
                  letterSpacing: '.045em',
                  lineHeight: 1.5,
                }}
              >
                Discover. Read. Grow.
              </Typography>
            </Box>
          </Button>
        ) : (
          <>
            <MenuBook sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {title}
            </Typography>
          </>
        )}

        {showUserMenu && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user.role === 'super-admin' ? 'Super Administrator' :
               user.role === 'admin' ? 'System Administrator' : 
               user.role === 'librarian' ? user.full_name : 
               `Welcome, ${user.full_name}`}
            </Typography>

            {/* Show notification icon only for regular users, not for librarians/admins */}
            {user.role === 'user' && (
              <IconButton
                size="large"
                color="inherit"
                onClick={handleNotifications}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            )}

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 } }}>
            <Button
              color="inherit"
              startIcon={browseHeader ? <LoginIcon /> : undefined}
              onClick={() => navigate('/login')}
              sx={browseHeader ? {
                minWidth: { xs: 42, sm: 104 },
                px: { xs: 1, sm: 2 },
                py: 1,
                borderRadius: 2.5,
                color: 'rgba(255,255,255,.94)',
                fontWeight: 700,
                textTransform: 'none',
                '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 } },
                '&:hover': { bgcolor: 'rgba(255,255,255,.12)', transform: 'translateY(-1px)' },
                '&:focus-visible': { outline: '2px solid white', outlineOffset: 3 },
                transition: 'transform 180ms ease, background-color 180ms ease',
              } : undefined}
            >
              <Box component="span" sx={{ display: { xs: browseHeader ? 'none' : 'inline', sm: 'inline' } }}>
                Login
              </Box>
            </Button>
            <Button
              color="inherit"
              variant={browseHeader ? 'contained' : 'outlined'}
              startIcon={browseHeader ? <RegisterIcon /> : undefined}
              onClick={() => navigate('/register')}
              sx={browseHeader ? {
                minWidth: { xs: 44, sm: 126 },
                px: { xs: 1.1, sm: 2 },
                py: 1,
                borderRadius: 2.5,
                color: '#1b4332',
                bgcolor: '#fff',
                fontWeight: 800,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(9,39,25,.17)',
                '& .MuiButton-startIcon': { mr: { xs: 0, sm: 0.75 } },
                '&:hover': { bgcolor: '#effaf2', transform: 'translateY(-2px)', boxShadow: '0 7px 18px rgba(9,39,25,.23)' },
                '&:focus-visible': { outline: '2px solid white', outlineOffset: 3 },
                transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
              } : { borderColor: 'rgba(255,255,255,0.5)' }}
            >
              <Box component="span" sx={{ display: { xs: browseHeader ? 'none' : 'inline', sm: 'inline' } }}>
                Register
              </Box>
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
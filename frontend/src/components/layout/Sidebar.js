import React from 'react';
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
  Divider
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
  Notifications
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 280;

const Sidebar = ({ open = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
      </Box>
    </Drawer>
  );
};

export default Sidebar;
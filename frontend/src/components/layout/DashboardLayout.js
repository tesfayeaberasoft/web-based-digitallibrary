import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Avatar, Badge, Menu, MenuItem,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Divider, Chip, useMediaQuery, useTheme, Fab, BottomNavigation,
  BottomNavigationAction, Paper, Tooltip, Collapse, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Alert, Fade, Zoom
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications as NotificationsIcon, AccountCircle,
  Dashboard, MenuBook, History, TrendingUp, EmojiEvents, Logout, ExitToApp,
  ChevronLeft, ChevronRight, Settings, AdminPanelSettings, People,
  SupervisorAccount, Assignment, QrCodeScanner, LibraryBooks, Queue,
  Inventory, GetApp, Shield, LocalFireDepartment, AccessTime, Close
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Green theme palette
const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#d8f3dc',
  lighter: '#f0fdf4',
  dark: '#1b4332',
  accent: '#95d5b2',
  gradient: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)'
};

const drawerWidth = 280;
const miniDrawerWidth = 72;

export default function DashboardLayout({ children, title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarMini, setSidebarMini] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileNavValue, setMobileNavValue] = useState(0);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Update mobile nav value based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') setMobileNavValue(0);
    else if (path === '/my-books') setMobileNavValue(1);
    else if (path === '/history') setMobileNavValue(2);
    else if (path === '/achievements') setMobileNavValue(3);
    else setMobileNavValue(0);
  }, [location]);

  const getMenuItems = () => {
    switch (user?.role) {
      case 'super-admin':
        return [
          { text: 'Super Admin', icon: <SupervisorAccount />, path: '/super-admin', color: '#d32f2f' },
          { text: 'System Overview', icon: <Dashboard />, path: '/super-admin', color: '#d32f2f' },
          { text: 'Admins', icon: <AdminPanelSettings />, path: '/super-admin/admins', color: '#d32f2f' },
          { text: 'Users', icon: <People />, path: '/admin/users', color: '#d32f2f' },
          { text: 'Librarians', icon: <SupervisorAccount />, path: '/super-admin/librarians', color: '#d32f2f' },
          { text: 'Settings', icon: <Settings />, path: '/super-admin/settings', color: '#d32f2f' },
          { text: 'Security', icon: <Shield />, path: '/super-admin/security', color: '#d32f2f' },
          { text: 'Audit Logs', icon: <History />, path: '/super-admin/audit-logs', color: '#d32f2f' },
          { text: 'Analytics', icon: <TrendingUp />, path: '/super-admin/analytics', color: '#d32f2f' },
        ];
      case 'admin':
        return [
          { text: 'Overview', icon: <Dashboard />, path: '/admin', color: C.primary },
          { text: 'Analytics', icon: <TrendingUp />, path: '/admin/analytics', color: C.primary },
          { text: 'Users', icon: <People />, path: '/admin/users', color: C.primary },
          { text: 'Librarians', icon: <SupervisorAccount />, path: '/admin/librarians', color: C.primary },
          { text: 'Settings', icon: <Settings />, path: '/admin/settings', color: C.primary },
        ];
      case 'librarian':
        return [
          { text: 'Overview', icon: <Dashboard />, path: '/librarian', color: C.primary },
          { text: 'Notifications', icon: <NotificationsIcon />, path: '/librarian/notifications', color: '#ff6b6b', badge: '!' },
          { text: 'Requests', icon: <Assignment />, path: '/librarian/requests', color: C.primary },
          { text: 'Barcode', icon: <QrCodeScanner />, path: '/librarian/barcode', color: C.primary },
          { text: 'Bulk Ops', icon: <LibraryBooks />, path: '/librarian/bulk-operations', color: C.primary },
          { text: 'Reservations', icon: <Queue />, path: '/librarian/reservations', color: C.primary },
          { text: 'Inventory', icon: <Inventory />, path: '/librarian/inventory', color: C.primary },
          { text: 'Members', icon: <People />, path: '/librarian/members', color: C.primary },
          { text: 'Reports', icon: <TrendingUp />, path: '/librarian/reports', color: C.primary },
        ];
      default:
        return [
          { text: 'Overview', icon: <Dashboard />, path: '/dashboard', color: C.primary },
          { text: 'My Books', icon: <MenuBook />, path: '/my-books', color: C.primary },
          { text: 'History', icon: <History />, path: '/history', color: C.primary },
          { text: 'Reading Goals', icon: <TrendingUp />, path: '/reading-goals', color: C.primary },
          { text: 'Achievements', icon: <EmojiEvents />, path: '/achievements', color: C.primary },
          { text: 'Notification Settings', icon: <Settings />, path: '/notification-settings', color: C.primary },
        ];
    }
  };

  const menuItems = getMenuItems();
  const isActive = (path) => location.pathname === path;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarMiniToggle = () => setSidebarMini(!sidebarMini);
  const handleProfileMenuOpen = (e) => setProfileMenuAnchor(e.currentTarget);
  const handleProfileMenuClose = () => setProfileMenuAnchor(null);
  const handleLogoutClick = () => {
    handleProfileMenuClose();
    setLogoutDialogOpen(true);
  };
  const handleLogoutConfirm = () => {
    logout();
    setLogoutDialogOpen(false);
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  // Desktop Sidebar Content
  const sidebarContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fdfb 100%)'
    }}>
      {/* Sidebar Header */}
      <Box sx={{ 
        p: sidebarMini ? 1 : 2.5, 
        borderBottom: `1px solid ${C.light}`,
        transition: 'all 0.3s ease'
      }}>
        {!sidebarMini && (
          <Fade in={!sidebarMini}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ 
                bgcolor: C.gradient, 
                width: 48, 
                height: 48,
                boxShadow: `0 4px 12px ${C.primary}40`
              }}>
                <MenuBook />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: C.dark, lineHeight: 1.2 }}>
                  Library Hub
                </Typography>
                <Typography variant="caption" sx={{ color: C.secondary, fontWeight: 500 }}>
                  {user?.role === 'super-admin' ? 'Super Admin' : 
                   user?.role === 'admin' ? 'Administrator' : 
                   user?.role === 'librarian' ? 'Librarian' : 'Member Portal'}
                </Typography>
              </Box>
            </Box>
          </Fade>
        )}
        {sidebarMini && (
          <Zoom in={sidebarMini}>
            <Avatar sx={{ 
              bgcolor: C.gradient, 
              width: 48, 
              height: 48,
              mx: 'auto',
              boxShadow: `0 4px 12px ${C.primary}40`
            }}>
              <MenuBook />
            </Avatar>
          </Zoom>
        )}
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: sidebarMini ? 1 : 2 }}>
        <List sx={{ py: 0 }}>
          {menuItems.map((item, index) => (
            <Tooltip title={sidebarMini ? item.text : ''} placement="right" key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.75 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    px: sidebarMini ? 1.5 : 2,
                    py: 1.5,
                    justifyContent: sidebarMini ? 'center' : 'flex-start',
                    background: isActive(item.path) ? C.gradient : 'transparent',
                    color: isActive(item.path) ? '#fff' : C.dark,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: isActive(item.path) ? C.gradient : C.lighter,
                      transform: 'translateX(4px)',
                      boxShadow: isActive(item.path) ? `0 8px 24px ${C.primary}40` : 'none'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: isActive(item.path) ? '#fff' : 'transparent',
                      borderRadius: '0 4px 4px 0',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive(item.path) ? '#fff' : item.color,
                    minWidth: sidebarMini ? 0 : 40,
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!sidebarMini && (
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive(item.path) ? 600 : 500,
                        fontSize: '0.9rem'
                      }}
                    />
                  )}
                  {!sidebarMini && item.badge && (
                    <Chip 
                      label={item.badge} 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        height: 20,
                        bgcolor: '#ff6b6b',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>

        {/* Action Buttons */}
        {!sidebarMini && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            {user?.role === 'user' && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<MenuBook />}
                onClick={() => handleNavigation('/browse')}
                sx={{
                  background: C.gradient,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 4px 12px ${C.primary}40`,
                  '&:hover': {
                    boxShadow: `0 8px 24px ${C.primary}50`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Browse Books
              </Button>
            )}

            {(user?.role === 'admin' || user?.role === 'librarian') && (
              <Button
                fullWidth
                variant="contained"
                startIcon={<GetApp />}
                onClick={() => navigate('/librarian/reports')}
                sx={{
                  background: C.gradient,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: `0 4px 12px ${C.primary}40`,
                  '&:hover': {
                    boxShadow: `0 8px 24px ${C.primary}50`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Export Report
              </Button>
            )}
          </Box>
        )}

        {/* System Status */}
        {!sidebarMini && (
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            background: `linear-gradient(135deg, ${C.lighter} 0%, #fff 100%)`,
            borderRadius: 2,
            border: `1px solid ${C.light}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocalFireDepartment sx={{ color: C.secondary, fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: C.dark }}>
                System Health
              </Typography>
            </Box>
            <Chip 
              label="All Systems Operational" 
              size="small" 
              sx={{ 
                bgcolor: C.light,
                color: C.dark,
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Box>
        )}
      </Box>

      {/* Sidebar Footer - Profile & Logout */}
      <Box sx={{ 
        borderTop: `1px solid ${C.light}`,
        p: sidebarMini ? 1 : 2
      }}>
        {!sidebarMini && (
          <Box>
            <ListItemButton
              onClick={() => handleNavigation('/profile')}
              sx={{
                borderRadius: 2,
                mb: 1,
                background: isActive('/profile') ? C.gradient : 'transparent',
                color: isActive('/profile') ? '#fff' : C.dark,
                '&:hover': {
                  background: isActive('/profile') ? C.gradient : C.lighter
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar
                  src={user?.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: isActive('/profile') ? '#fff' : C.primary,
                    color: isActive('/profile') ? C.primary : '#fff',
                    fontWeight: 700
                  }}
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </Avatar>
              </ListItemIcon>
              <ListItemText 
                primary={user?.full_name || 'User Profile'}
                secondary={user?.email}
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                secondaryTypographyProps={{ 
                  fontSize: '0.75rem',
                  color: isActive('/profile') ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                borderRadius: 2,
                color: '#f44336',
                '&:hover': {
                  bgcolor: '#ffebee'
                }
              }}
            >
              <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
                <Logout />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
              />
            </ListItemButton>
          </Box>
        )}

        {sidebarMini && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip title="Profile" placement="right">
              <IconButton
                onClick={() => handleNavigation('/profile')}
                sx={{
                  bgcolor: isActive('/profile') ? C.primary : 'transparent',
                  color: isActive('/profile') ? '#fff' : C.dark,
                  '&:hover': { bgcolor: isActive('/profile') ? C.primary : C.lighter }
                }}
              >
                <Avatar
                  src={user?.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: C.primary,
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout" placement="right">
              <IconButton onClick={handleLogoutClick} sx={{ color: '#f44336' }}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: C.lighter }}>
      {/* Top AppBar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          background: C.gradient,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${C.secondary}40`,
          boxShadow: `0 4px 20px ${C.primary}30`
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {!isMobile && (
            <IconButton
              color="inherit"
              onClick={handleSidebarMiniToggle}
              sx={{ mr: 2 }}
            >
              {sidebarMini ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          )}

          <MenuBook sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
            {title || 'Digital Library'}
          </Typography>

          {/* Time Display */}
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            alignItems: 'center', 
            gap: 1, 
            mr: 3,
            px: 2,
            py: 0.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <AccessTime sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>

          {/* Notifications */}
          {user?.role === 'user' && (
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={() => navigate('/notifications')}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Profile Menu */}
          <Tooltip title="Account">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
            >
              <Avatar 
                src={user?.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
                sx={{ 
                  width: 36, 
                  height: 36, 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  fontWeight: 700
                }}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={profileMenuAnchor}
            open={Boolean(profileMenuAnchor)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 220,
                borderRadius: 2,
                boxShadow: `0 8px 32px ${C.primary}20`
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${C.light}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.dark }}>
                {user?.full_name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email}
              </Typography>
              <Chip 
                label={user?.role || 'user'} 
                size="small" 
                sx={{ 
                  mt: 0.5, 
                  bgcolor: C.light, 
                  color: C.dark,
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }} 
              />
            </Box>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
              <AccountCircle sx={{ mr: 2 }} /> My Profile
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/dashboard'); }}>
              <Dashboard sx={{ mr: 2 }} /> Dashboard
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick} sx={{ color: '#f44336' }}>
              <ExitToApp sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarMini ? miniDrawerWidth : drawerWidth,
            flexShrink: 0,
            transition: 'width 0.3s ease',
            '& .MuiDrawer-paper': {
              width: sidebarMini ? miniDrawerWidth : drawerWidth,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100vh - 64px)',
              borderRight: `1px solid ${C.light}`,
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
              boxShadow: `4px 0 20px ${C.primary}10`
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100vh - 64px)',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 10,
          pb: isMobile ? 10 : 4,
          px: { xs: 2, sm: 3, md: 4 },
          ml: isMobile ? 0 : (sidebarMini ? `${miniDrawerWidth}px` : `${drawerWidth}px`),
          transition: 'margin 0.3s ease',
          minHeight: '100vh',
          bgcolor: C.lighter,
          position: 'relative'
        }}
      >
        {/* Content Wrapper with Fade Animation */}
        <Fade in={true} timeout={600}>
          <Box sx={{ 
            maxWidth: 1400, 
            mx: 'auto',
            minHeight: 'calc(100vh - 180px)'
          }}>
            {children}
          </Box>
        </Fade>
      </Box>

      {/* Mobile Bottom Navigation (for users only) */}
      {isMobile && user?.role === 'user' && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1100,
            borderTop: `2px solid ${C.light}`,
            boxShadow: `0 -4px 20px ${C.primary}20`
          }} 
          elevation={8}
        >
          <BottomNavigation
            value={mobileNavValue}
            onChange={(event, newValue) => {
              setMobileNavValue(newValue);
              const paths = ['/dashboard', '/my-books', '/history', '/achievements'];
              navigate(paths[newValue]);
            }}
            sx={{
              bgcolor: '#fff',
              '& .MuiBottomNavigationAction-root': {
                color: C.dark,
                '&.Mui-selected': {
                  color: C.primary
                }
              }
            }}
          >
            <BottomNavigationAction label="Home" icon={<Dashboard />} />
            <BottomNavigationAction label="Books" icon={<MenuBook />} />
            <BottomNavigationAction label="History" icon={<History />} />
            <BottomNavigationAction label="Awards" icon={<EmojiEvents />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 12px 48px ${C.primary}30`
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontWeight: 700
        }}>
          <Logout />
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            You will be logged out and redirected to the login page.
          </Alert>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar
              src={user?.profile_image ? `http://localhost:8000/${user.profile_image}` : undefined}
              sx={{
                width: 64,
                height: 64,
                bgcolor: C.primary,
                fontSize: '1.75rem',
                fontWeight: 700,
                boxShadow: `0 4px 16px ${C.primary}40`
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: C.dark }}>
                {user?.full_name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {user?.email}
              </Typography>
              <Chip
                label={user?.role || 'user'}
                size="small"
                sx={{ 
                  bgcolor: C.light, 
                  color: C.dark,
                  textTransform: 'capitalize',
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 600, color: C.dark }}>
            Are you sure you want to logout?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setLogoutDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm}
            variant="contained"
            startIcon={<Logout />}
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(244, 67, 54, 0.5)'
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
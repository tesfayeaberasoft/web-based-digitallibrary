import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  MenuBook as BookIcon,
  DoneAll as DoneAllIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  dark: '#1b4332',
  pale: '#f3f8f4',
  border: '#e4ebe6',
  muted: '#718078',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = {
        status: tabValue === 1 ? 'read' : tabValue === 2 ? 'unread' : undefined
      };
      
      const response = await axios.get('http://localhost:8000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Show actual error message from backend
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load notifications. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8000/api/notifications/mark-all-read',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getNotificationIcon = (type) => {
    const color = getNotificationColor(type);
    const iconProps = {
      sx: {
        width: 46,
        height: 46,
        bgcolor: `${color}15`,
        color,
        border: `1px solid ${color}28`,
      }
    };
    
    switch (type) {
      case 'loan':
        return <Avatar {...iconProps}><BookIcon /></Avatar>;
      case 'return':
        return <Avatar {...iconProps}><CheckIcon /></Avatar>;
      case 'fine':
        return <Avatar {...iconProps}><WarningIcon /></Avatar>;
      case 'reservation':
        return <Avatar {...iconProps}><ScheduleIcon /></Avatar>;
      case 'payment':
        return <Avatar {...iconProps}><PaymentIcon /></Avatar>;
      default:
        return <Avatar {...iconProps}><InfoIcon /></Avatar>;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'loan':
        return C.primary;
      case 'return':
        return '#3f8f63';
      case 'fine':
        return '#c04f45';
      case 'reservation':
        return '#b7791f';
      case 'payment':
        return '#3975a8';
      case 'due_reminder':
        return '#3975a8';
      case 'overdue_alert':
        return '#c04f45';
      case 'fine_notice':
        return '#b7791f';
      default:
        return '#718078';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout title="Digital Library">
      <Box sx={{ maxWidth: 1180, mx: 'auto', pb: { xs: 3, md: 5 } }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
          flexWrap: 'wrap',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              width: 54,
              height: 54,
              borderRadius: 2.5,
              bgcolor: '#eaf4ed',
              color: C.primary,
              border: '1px solid #d8e8dc',
            }}>
              <NotificationsIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={750} sx={{
                color: C.dark,
                letterSpacing: '-0.035em',
                fontSize: { xs: '1.7rem', sm: '2rem' },
                lineHeight: 1.2,
                mb: 0.5,
              }}>
              Notifications
              </Typography>
              <Typography variant="body2" sx={{ color: C.muted, lineHeight: 1.6 }}>
                Your latest library updates, all in one place.
              </Typography>
            </Box>
          </Box>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              sx={{
                borderColor: '#cbdacf',
                color: C.primary,
                bgcolor: '#fff',
                borderRadius: 2,
                px: 2,
                py: 1,
                fontWeight: 650,
                '&:hover': { borderColor: C.primary, bgcolor: C.pale },
                transition: 'all 180ms ease',
              }}
            >
              Mark All as Read
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #f0d2cf' }}>
            {error}
          </Alert>
        )}

        <Card elevation={0} sx={{
          border: `1px solid ${C.border}`,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: '#fff',
          boxShadow: '0 2px 8px rgba(24, 45, 32, 0.035)',
        }}>
          <Box sx={{ px: { xs: 1, sm: 2.5 }, borderBottom: `1px solid ${C.border}`, bgcolor: '#fcfdfc' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="Filter notifications"
              sx={{
                minHeight: 58,
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: C.primary },
                '& .MuiTab-root': {
                  minHeight: 58,
                  textTransform: 'none',
                  fontWeight: 600,
                  color: C.muted,
                  px: { xs: 1.5, sm: 2.5 },
                  '&.Mui-selected': { color: C.primary },
                },
              }}
            >
              <Tab label={`All (${notifications.length})`} />
              <Tab label="Read" />
              <Tab label={`Unread (${unreadCount})`} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: { xs: 1.25, sm: 2 } }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: C.primary }} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: { xs: 7, sm: 9 }, px: 2 }}>
                <Avatar sx={{
                  width: 72,
                  height: 72,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: '#edf5ef',
                  color: C.primary,
                }}>
                  <NotificationsIcon sx={{ fontSize: 34 }} />
                </Avatar>
                <Typography variant="h6" sx={{ color: C.dark, fontWeight: 700, mb: 0.5 }}>
                  No notifications
                </Typography>
                <Typography variant="body2" sx={{ color: C.muted }}>
                  You're all caught up!
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        alignItems: 'flex-start',
                        px: { xs: 1.5, sm: 2 },
                        py: 2,
                        pr: { xs: 7, sm: 8 },
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: notification.status === 'unread' ? '#d4e5d9' : '#edf0ee',
                        bgcolor: notification.status === 'unread' ? '#f7fbf8' : '#fff',
                        transition: 'border-color 180ms ease, background-color 180ms ease, transform 180ms ease',
                        '&:hover': {
                          borderColor: '#bdd4c4',
                          bgcolor: notification.status === 'unread' ? '#f1f8f3' : '#fbfcfb',
                          transform: 'translateY(-1px)',
                        },
                      }}
                      secondaryAction={
                        notification.status === 'unread' && (
                          <IconButton
                            edge="end"
                            aria-label="Mark notification as read"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{
                              mt: 0.5,
                              mr: { xs: -0.5, sm: 0 },
                              color: C.primary,
                              bgcolor: '#e9f3ec',
                              '&:hover': { bgcolor: '#dcece1' },
                              transition: 'background-color 180ms ease',
                            }}
                          >
                            <CheckIcon />
                          </IconButton>
                        )
                      }
                    >
                      <ListItemAvatar>
                        {getNotificationIcon(notification.type)}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight={notification.status === 'unread' ? 700 : 550}
                              sx={{ color: '#20352a', letterSpacing: '-0.01em', lineHeight: 1.4 }}>
                              {notification.title}
                            </Typography>
                            {notification.status === 'unread' && (
                              <Chip label="New" size="small" sx={{
                                height: 22,
                                bgcolor: '#e4f1e8',
                                color: C.primary,
                                border: '1px solid #cce0d2',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mt: 0.65, color: '#66736b', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#89948d', fontWeight: 500 }}>
                              {formatDate(notification.sent_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {!loading && notifications.length > 0 && (
          <Card elevation={0} sx={{
            mt: 2.5,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            bgcolor: '#fff',
          }}>
            <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: C.dark, letterSpacing: '-0.01em' }}>
                Notification Summary
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5, mt: 2 }}>
                <Box sx={{ p: 2, border: '1px solid #edf0ee', borderRadius: 2.5, bgcolor: '#fcfdfc' }}>
                  <Typography variant="caption" sx={{ color: C.muted, fontWeight: 600 }}>
                    Total Notifications
                  </Typography>
                  <Typography variant="h5" fontWeight={750} sx={{ mt: 0.5, color: C.dark }}>
                    {notifications.length}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, border: '1px solid #edf0ee', borderRadius: 2.5, bgcolor: '#fcfdfc' }}>
                  <Typography variant="caption" sx={{ color: C.muted, fontWeight: 600 }}>
                    Unread
                  </Typography>
                  <Typography variant="h5" fontWeight={750} sx={{ mt: 0.5, color: C.primary }}>
                    {unreadCount}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, border: '1px solid #edf0ee', borderRadius: 2.5, bgcolor: '#fcfdfc' }}>
                  <Typography variant="caption" sx={{ color: C.muted, fontWeight: 600 }}>
                    Read
                  </Typography>
                  <Typography variant="h5" fontWeight={750} sx={{ mt: 0.5, color: '#3f8f63' }}>
                    {notifications.length - unreadCount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default NotificationsPage;
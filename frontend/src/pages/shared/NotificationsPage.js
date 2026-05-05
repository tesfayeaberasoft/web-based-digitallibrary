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
  Divider,
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
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

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
        is_read: tabValue === 1 ? 'true' : tabValue === 2 ? 'false' : undefined
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
      setError('Failed to load notifications. Please try again.');
      console.error('Error fetching notifications:', err);
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
    const iconProps = { sx: { bgcolor: getNotificationColor(type), color: 'white' } };
    
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
        return '#4a9b8e';
      case 'return':
        return '#4caf50';
      case 'fine':
        return '#f44336';
      case 'reservation':
        return '#ff9800';
      case 'payment':
        return '#2196f3';
      default:
        return '#9e9e9e';
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
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with your library activities
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
              sx={{ color: '#4a9b8e' }}
            >
              Mark All as Read
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`All (${notifications.length})`} />
              <Tab label="Read" />
              <Tab label={`Unread (${unreadCount})`} />
            </Tabs>
          </Box>

          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <NotificationsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                        cursor: 'pointer'
                      }}
                      secondaryAction={
                        !notification.is_read && (
                          <IconButton
                            edge="end"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{ color: '#4a9b8e' }}
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
                            <Typography variant="body1" fontWeight={notification.is_read ? 400 : 600}>
                              {notification.title}
                            </Typography>
                            {!notification.is_read && (
                              <Chip label="New" size="small" color="primary" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {formatDate(notification.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {!loading && notifications.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Notification Summary
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Notifications
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {notifications.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Unread
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {unreadCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Read
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
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
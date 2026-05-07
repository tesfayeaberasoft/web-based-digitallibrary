import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Grid,
  Paper,
  Badge,
  Fade,
  Grow
} from '@mui/material';
import {
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
  AssignmentReturn as ReturnIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  PersonAdd as PersonAddIcon,
  Notifications as NotificationsIcon,
  Refresh as RefreshIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibrarianNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [priorityCounts, setPriorityCounts] = useState({ high: 0, medium: 0, low: 0 });

  useEffect(() => {
    fetchNotifications();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:8000/api/librarian/notifications',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setPriorityCounts(response.data.priority_counts);
      } else {
        setError(response.data.message || 'Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getFilteredNotifications = () => {
    switch (tabValue) {
      case 0: // All
        return notifications;
      case 1: // High Priority
        return notifications.filter(n => n.priority === 'high');
      case 2: // Medium Priority
        return notifications.filter(n => n.priority === 'medium');
      case 3: // Low Priority
        return notifications.filter(n => n.priority === 'low');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    const iconStyle = { fontSize: 28 };
    
    switch (type) {
      case 'overdue_alert':
        return <Avatar sx={{ bgcolor: '#ff6b6b', width: 48, height: 48 }}><WarningIcon sx={iconStyle} /></Avatar>;
      case 'low_inventory':
        return <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}><InventoryIcon sx={iconStyle} /></Avatar>;
      case 'new_loan':
        return <Avatar sx={{ bgcolor: '#4a9b8e', width: 48, height: 48 }}><CheckIcon sx={iconStyle} /></Avatar>;
      case 'book_returned':
        return <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}><ReturnIcon sx={iconStyle} /></Avatar>;
      case 'pending_reservation':
        return <Avatar sx={{ bgcolor: '#a78bfa', width: 48, height: 48 }}><ScheduleIcon sx={iconStyle} /></Avatar>;
      case 'unpaid_fine':
        return <Avatar sx={{ bgcolor: '#f59e0b', width: 48, height: 48 }}><MoneyIcon sx={iconStyle} /></Avatar>;
      case 'new_user':
        return <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}><PersonAddIcon sx={iconStyle} /></Avatar>;
      default:
        return <Avatar sx={{ bgcolor: '#6b7280', width: 48, height: 48 }}><NotificationsIcon sx={iconStyle} /></Avatar>;
    }
  };

  const getPriorityChip = (priority) => {
    const config = {
      high: { label: 'High Priority', color: '#ff6b6b', bgcolor: '#ffe5e5' },
      medium: { label: 'Medium', color: '#ff9800', bgcolor: '#fff3e0' },
      low: { label: 'Low', color: '#4a9b8e', bgcolor: '#e0f2f1' }
    };
    
    const { label, color, bgcolor } = config[priority] || config.low;
    
    return (
      <Chip
        label={label}
        size="small"
        sx={{
          bgcolor: bgcolor,
          color: color,
          fontWeight: 600,
          borderRadius: 1
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <DashboardLayout title="Librarian Panel">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                🔔 Notifications Center
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Real-time library activity and alerts
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchNotifications}
              disabled={loading}
              sx={{ borderColor: '#4a9b8e', color: '#4a9b8e' }}
            >
              Refresh
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Priority Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Grow in={true} timeout={600}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <PriorityIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {priorityCounts.high}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        High Priority
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grow>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Grow in={true} timeout={800}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <WarningIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {priorityCounts.medium}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Medium Priority
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grow>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Grow in={true} timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                    color: 'white',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                      <NotificationsIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h3" fontWeight={700}>
                        {priorityCounts.low}
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Low Priority
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grow>
            </Grid>
          </Grid>

          {/* Notifications List */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label={`All (${notifications.length})`} />
                <Tab 
                  label={
                    <Badge badgeContent={priorityCounts.high} color="error">
                      <span style={{ marginRight: priorityCounts.high > 0 ? 16 : 0 }}>High Priority</span>
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={priorityCounts.medium} color="warning">
                      <span style={{ marginRight: priorityCounts.medium > 0 ? 16 : 0 }}>Medium</span>
                    </Badge>
                  } 
                />
                <Tab label={`Low (${priorityCounts.low})`} />
              </Tabs>
            </Box>

            <CardContent>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                  <CircularProgress sx={{ color: '#4a9b8e' }} />
                </Box>
              ) : filteredNotifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <NotificationsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All caught up! No {tabValue > 0 ? 'priority' : ''} notifications at this time.
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {filteredNotifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <Fade in={true} timeout={300 + index * 50}>
                        <ListItem
                          sx={{
                            py: 2,
                            px: 2,
                            borderRadius: 2,
                            mb: 1,
                            bgcolor: notification.priority === 'high' ? 'rgba(255, 107, 107, 0.05)' : 'transparent',
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <ListItemAvatar>
                            {getNotificationIcon(notification.type)}
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body1" fontWeight={600}>
                                  {notification.title}
                                </Typography>
                                {getPriorityChip(notification.priority)}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {notification.message}
                                </Typography>
                                {notification.user_name && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    👤 {notification.user_name} • {notification.user_email}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  🕒 {formatDate(notification.sent_at)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </Fade>
                      {index < filteredNotifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {!loading && notifications.length > 0 && (
            <Fade in={true} timeout={1200}>
              <Alert severity="info" sx={{ mt: 3 }} icon={<NotificationsIcon />}>
                <Typography variant="body2" fontWeight={600}>
                  Total: {notifications.length} notifications • Auto-refreshes every 30 seconds
                </Typography>
              </Alert>
            </Fade>
          )}
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default LibrarianNotifications;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  FormGroup,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Chip,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MoneyIcon,
  BookmarkBorder as ReservationIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';

const UserNotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });
  const [settings, setSettings] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    due_reminder_days: [3, 1],
    overdue_reminder_days: [1, 3, 7],
    reservation_notifications: true,
    fine_notifications: true,
    general_notifications: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/notifications/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      showAlert('Failed to load notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:8000/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('Notification settings saved successfully', 'success');
      } else {
        showAlert(data.message || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showAlert('Failed to save notification settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleReminderDaysChange = (type, day, checked) => {
    const currentDays = settings[type] || [];
    let newDays;
    
    if (checked) {
      newDays = [...currentDays, day].sort((a, b) => a - b);
    } else {
      newDays = currentDays.filter(d => d !== day);
    }
    
    handleSettingChange(type, newDays);
  };

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box p={3}>
        <Fade in timeout={300}>
          <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="#4a9b8e">
              🔔 Notification Settings
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={3}>
              Customize how and when you receive notifications from the library
            </Typography>

            {alert.show && (
              <Alert severity={alert.severity} sx={{ mb: 3 }}>
                {alert.message}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Notification Methods */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <NotificationsIcon sx={{ mr: 1, color: '#4a9b8e' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Notification Methods
                      </Typography>
                    </Box>
                    
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.email_enabled}
                            onChange={(e) => handleSettingChange('email_enabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                            Email Notifications
                          </Box>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.sms_enabled}
                            onChange={(e) => handleSettingChange('sms_enabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <SmsIcon sx={{ mr: 1, fontSize: 20 }} />
                            SMS Notifications
                          </Box>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.push_enabled}
                            onChange={(e) => handleSettingChange('push_enabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <NotificationsIcon sx={{ mr: 1, fontSize: 20 }} />
                            In-App Notifications
                          </Box>
                        }
                      />
                    </FormGroup>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      <InfoIcon sx={{ mr: 1 }} />
                      SMS notifications require a valid phone number in your profile
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notification Types */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      📋 Notification Types
                    </Typography>
                    
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.reservation_notifications}
                            onChange={(e) => handleSettingChange('reservation_notifications', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <ReservationIcon sx={{ mr: 1, fontSize: 20 }} />
                            Reservation Updates
                          </Box>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.fine_notifications}
                            onChange={(e) => handleSettingChange('fine_notifications', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <MoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                            Fine Reminders
                          </Box>
                        }
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.general_notifications}
                            onChange={(e) => handleSettingChange('general_notifications', e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center">
                            <InfoIcon sx={{ mr: 1, fontSize: 20 }} />
                            General Announcements
                          </Box>
                        }
                      />
                    </FormGroup>
                  </CardContent>
                </Card>
              </Grid>

              {/* Due Date Reminders */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <ScheduleIcon sx={{ mr: 1, color: '#4a9b8e' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Due Date Reminders
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Choose when to receive reminders before books are due:
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {[7, 3, 1].map(day => (
                        <Chip
                          key={day}
                          label={`${day} day${day > 1 ? 's' : ''} before`}
                          color={settings.due_reminder_days?.includes(day) ? 'primary' : 'default'}
                          onClick={() => handleReminderDaysChange('due_reminder_days', day, !settings.due_reminder_days?.includes(day))}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Selected: {settings.due_reminder_days?.length || 0} reminder{settings.due_reminder_days?.length !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Overdue Alerts */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <ScheduleIcon sx={{ mr: 1, color: '#f44336' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Overdue Alerts
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Choose when to receive alerts after books become overdue:
                    </Typography>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {[1, 3, 7, 14].map(day => (
                        <Chip
                          key={day}
                          label={`${day} day${day > 1 ? 's' : ''} after`}
                          color={settings.overdue_reminder_days?.includes(day) ? 'error' : 'default'}
                          onClick={() => handleReminderDaysChange('overdue_reminder_days', day, !settings.overdue_reminder_days?.includes(day))}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Selected: {settings.overdue_reminder_days?.length || 0} alert{settings.overdue_reminder_days?.length !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Save Button */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={saveSettings}
                    disabled={saving}
                    sx={{ 
                      bgcolor: '#4a9b8e',
                      '&:hover': { bgcolor: '#3d8276' },
                      minWidth: 200
                    }}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Save Settings'}
                  </Button>
                  
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Changes will take effect immediately for future notifications
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Box>
    </Layout>
  );
};

export default UserNotificationSettings;
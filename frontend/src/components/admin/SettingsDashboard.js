import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Dashboard,
  Settings,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  Speed,
  Memory,
  Storage,
  Group,
  Book,
  AttachMoney,
  Schedule,
  Notifications,
  Security,
  Backup,
  Analytics,
  MonitorHeart,
  SystemUpdateAlt,
  PolicyOutlined,
  AssessmentOutlined,
  HealthAndSafety
} from '@mui/icons-material';
import axios from 'axios';

const SettingsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [policyStatus, setPolicyStatus] = useState(null);
  const [maintenanceDialog, setMaintenanceDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load system status
      const statusResponse = await axios.get('http://localhost:8000/api/admin/maintenance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statusResponse.data.success) {
        setSystemStatus(statusResponse.data.status);
      }
      
      // Load policy enforcement status
      await loadPolicyStatus();
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadPolicyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get overdue loans for policy monitoring
      const overdueResponse = await axios.get('http://localhost:8000/api/fines/calculate-overdue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (overdueResponse.data.success) {
        setPolicyStatus({
          overdue_loans: overdueResponse.data.overdue_loans || [],
          policy_settings: overdueResponse.data.policy_settings || {},
          summary: overdueResponse.data.summary || {}
        });
      }
    } catch (error) {
      console.error('Failed to load policy status:', error);
    }
  };

  const handleMaintenanceAction = async (action) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/admin/maintenance', {
        action: action
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        // Refresh dashboard data after maintenance action
        await loadDashboardData();
        setMaintenanceDialog(false);
      }
    } catch (error) {
      console.error(`Maintenance action ${action} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': 
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const formatUptime = (uptime) => {
    if (!uptime) return 'Unknown';
    return uptime;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!systemStatus) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          <Dashboard sx={{ mr: 1, verticalAlign: 'middle' }} />
          Settings Dashboard
        </Typography>
        <Box>
          <Tooltip title="Last updated">
            <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
              {lastUpdate.toLocaleTimeString()}
            </Typography>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadDashboardData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* System Health Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary">
                    Database
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {systemStatus.database?.response_time}ms response
                  </Typography>
                </Box>
                <Chip
                  icon={<Storage />}
                  label={systemStatus.database?.status || 'Unknown'}
                  color={getStatusColor(systemStatus.database?.status)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary">
                    Memory
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {systemStatus.memory?.used}MB / {systemStatus.memory?.limit}MB
                  </Typography>
                </Box>
                <Box sx={{ width: 60 }}>
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus.memory?.usage_percent || 0}
                    color={systemStatus.memory?.usage_percent > 80 ? 'error' : 'primary'}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary">
                    Storage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {systemStatus.storage?.used}GB / {systemStatus.storage?.total}GB
                  </Typography>
                </Box>
                <Box sx={{ width: 60 }}>
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus.storage?.usage_percent || 0}
                    color={systemStatus.storage?.usage_percent > 90 ? 'error' : 'info'}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="primary">
                    CPU Usage
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {systemStatus.cpu?.usage_percent}%
                  </Typography>
                </Box>
                <Box sx={{ width: 60 }}>
                  <LinearProgress
                    variant="determinate"
                    value={systemStatus.cpu?.usage_percent || 0}
                    color={systemStatus.cpu?.usage_percent > 70 ? 'warning' : 'success'}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Policy Enforcement Status */}
      {policyStatus && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <PolicyOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Policy Enforcement
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Book />
                    </ListItemIcon>
                    <ListItemText
                      primary="Overdue Books"
                      secondary={`${policyStatus.summary?.total_overdue_loans || 0} books overdue`}
                    />
                    <Badge
                      badgeContent={policyStatus.summary?.loans_needing_fines || 0}
                      color="error"
                    >
                      <Warning color={policyStatus.summary?.total_overdue_loans > 0 ? 'warning' : 'disabled'} />
                    </Badge>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary="Fine Policy"
                      secondary={`$${policyStatus.policy_settings?.fine_per_day || 0.50}/day after ${policyStatus.policy_settings?.grace_period_days || 3} days`}
                    />
                    <CheckCircle color="success" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <AssessmentOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                  System Activity
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Group />
                    </ListItemIcon>
                    <ListItemText
                      primary="Active Users"
                      secondary={systemStatus.recent_activity?.length || 0}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Schedule />
                    </ListItemIcon>
                    <ListItemText
                      primary="System Uptime"
                      secondary={formatUptime(systemStatus.system_info?.uptime)}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <SystemUpdateAlt sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quick Maintenance Actions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Backup />}
                onClick={() => {
                  setSelectedAction('backup');
                  setMaintenanceDialog(true);
                }}
              >
                Backup Database
              </Button>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setSelectedAction('clearCache');
                  setMaintenanceDialog(true);
                }}
              >
                Clear System Cache
              </Button>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AttachMoney />}
                onClick={() => {
                  setSelectedAction('calculate_all');
                  setMaintenanceDialog(true);
                }}
              >
                Calculate Overdue Fines
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {systemStatus.storage?.usage_percent > 90 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>Storage Warning:</strong> Disk usage is above 90%. Consider cleaning up old files or expanding storage.
        </Alert>
      )}
      
      {systemStatus.memory?.usage_percent > 85 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <strong>Memory Warning:</strong> Memory usage is high. Consider restarting the system or optimizing processes.
        </Alert>
      )}
      
      {policyStatus?.summary?.loans_needing_fines > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Policy Notice:</strong> {policyStatus.summary.loans_needing_fines} overdue loans need fine calculations.
        </Alert>
      )}

      {/* Maintenance Action Dialog */}
      <Dialog open={maintenanceDialog} onClose={() => setMaintenanceDialog(false)}>
        <DialogTitle>
          Confirm Maintenance Action
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to perform this maintenance action: <strong>{selectedAction}</strong>?
          </Typography>
          {selectedAction === 'backup' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This will create a complete database backup. The process may take a few minutes.
            </Alert>
          )}
          {selectedAction === 'clearCache' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will clear all system caches. Users may experience slower performance temporarily.
            </Alert>
          )}
          {selectedAction === 'calculate_all' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              This will calculate fines for all overdue books based on current library policies.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleMaintenanceAction(selectedAction)}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsDashboard;
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid
} from '@mui/material';
import { Save } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    libraryName: 'Digital Library Management System',
    maxBorrowDays: '30',
    finePerDay: '0.50',
    maxBooksPerUser: '5'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          System Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Configure system-wide settings and parameters
        </Typography>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Library Configuration
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Library Name"
                  name="libraryName"
                  value={settings.libraryName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Borrow Days"
                  name="maxBorrowDays"
                  type="number"
                  value={settings.maxBorrowDays}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fine Per Day (USD)"
                  name="finePerDay"
                  type="number"
                  value={settings.finePerDay}
                  onChange={handleChange}
                  inputProps={{ step: '0.01' }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Books Per User"
                  name="maxBooksPerUser"
                  type="number"
                  value={settings.maxBooksPerUser}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  sx={{ px: 4 }}
                >
                  Save Settings
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default AdminSettings;
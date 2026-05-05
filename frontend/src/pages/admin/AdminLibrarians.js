import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Avatar,
  Chip,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  Delete
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminLibrarians = () => {
  const librarians = [
    {
      id: 1,
      initials: 'SJ',
      name: 'Sarah Johnson',
      email: 'sarah@library.com',
      booksManaged: 234,
      performance: 95,
      status: 'active'
    },
    {
      id: 2,
      initials: 'MC',
      name: 'Michael Chen',
      email: 'michael@library.com',
      booksManaged: 189,
      performance: 88,
      status: 'active'
    },
    {
      id: 3,
      initials: 'ED',
      name: 'Emily Davis',
      email: 'emily@library.com',
      booksManaged: 156,
      performance: 78,
      status: 'inactive'
    }
  ];

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Manage Librarians
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage librarian accounts
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ px: 3 }}
          >
            Add Librarian
          </Button>
        </Box>

        <Grid container spacing={3}>
          {librarians.map((librarian) => (
            <Grid item xs={12} md={4} key={librarian.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: '#4a9b8e',
                        width: 56,
                        height: 56,
                        fontSize: '1.5rem',
                        fontWeight: 600
                      }}
                    >
                      {librarian.initials}
                    </Avatar>
                    <Chip
                      label={librarian.status}
                      size="small"
                      color={librarian.status === 'active' ? 'success' : 'default'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {librarian.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {librarian.email}
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Books Managed:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {librarian.booksManaged}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Performance:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {librarian.performance}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={librarian.performance}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: librarian.performance >= 90 ? '#4caf50' : '#ff9800',
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <IconButton size="small" sx={{ backgroundColor: '#e3f2fd' }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ backgroundColor: '#e8f5e9' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ backgroundColor: '#ffebee' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AdminLibrarians;
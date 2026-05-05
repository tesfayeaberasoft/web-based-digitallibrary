import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People,
  MenuBook,
  TrendingUp,
  AttachMoney,
  SupervisorAccount,
  Shield
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const StatCard = ({ title, value, change, icon, color, bgColor }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            {value}
          </Typography>
          <Chip
            label={change}
            size="small"
            sx={{
              backgroundColor: change.startsWith('+') ? '#e8f5e9' : '#ffebee',
              color: change.startsWith('+') ? '#2e7d32' : '#c62828',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        </Box>
        <Avatar
          sx={{
            backgroundColor: bgColor,
            width: 56,
            height: 56
          }}
        >
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Borrowed a book', time: '5 minutes ago', avatar: 'J' },
    { id: 2, user: 'Jane Smith', action: 'Registered account', time: '15 minutes ago', avatar: 'J' },
    { id: 3, user: 'Bob Johnson', action: 'Returned a book', time: '1 hour ago', avatar: 'B' },
    { id: 4, user: 'Alice Brown', action: 'Reserved a book', time: '2 hours ago', avatar: 'A' }
  ];

  return (
    <DashboardLayout title="Admin Panel">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome back! Here's what's happening with your library today.
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Total Users"
              value="5,234"
              change="+12%"
              icon={<People />}
              bgColor="#e3f2fd"
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Total Books"
              value="10,234"
              change="+245"
              icon={<MenuBook />}
              bgColor="#e8f5e9"
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Active Loans"
              value="856"
              change="+8%"
              icon={<TrendingUp />}
              bgColor="#f3e5f5"
              color="#7b1fa2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Revenue"
              value="$45,678"
              change="+15%"
              icon={<AttachMoney />}
              bgColor="#fff3e0"
              color="#e65100"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Librarians"
              value="12"
              change="+2"
              icon={<SupervisorAccount />}
              bgColor="#fce4ec"
              color="#c2185b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Fines Collected"
              value="$2,345"
              change="+23%"
              icon={<Shield />}
              bgColor="#e0f2f1"
              color="#00695c"
            />
          </Grid>
        </Grid>

        {/* Charts and Activity */}
        <Grid container spacing={3}>
          {/* Monthly Circulation Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Monthly Circulation
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, mt: 3 }}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => {
                    const heights = [150, 180, 160, 200, 220];
                    return (
                      <Box key={month} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            height: heights[index],
                            backgroundColor: '#4a9b8e',
                            borderRadius: '8px 8px 0 0',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            pb: 1,
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          {600 + index * 100}
                        </Box>
                        <Typography variant="caption">{month}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue Trend */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Revenue Trend
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, mt: 3 }}>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => {
                    const heights = [180, 200, 190, 230, 250];
                    return (
                      <Box key={month} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            height: heights[index],
                            backgroundColor: '#5c6bc0',
                            borderRadius: '8px 8px 0 0',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            pb: 1,
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          ${3000 + index * 500}
                        </Box>
                        <Typography variant="caption">{month}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Category Distribution
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {[
                    { name: 'Fiction', percentage: 35, color: '#9575cd' },
                    { name: 'Science', percentage: 25, color: '#64b5f6' },
                    { name: 'History', percentage: 20, color: '#ef5350' },
                    { name: 'Arts', percentage: 12, color: '#ffa726' },
                    { name: 'Other', percentage: 8, color: '#26a69a' }
                  ].map((category) => (
                    <Box key={category.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{category.name}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {category.percentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={category.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: category.color,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activities */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Activities
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {recentActivities.map((activity) => (
                    <Box
                      key={activity.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        pb: 2,
                        borderBottom: '1px solid #f0f0f0',
                        '&:last-child': { borderBottom: 'none', mb: 0, pb: 0 }
                      }}
                    >
                      <Avatar
                        sx={{
                          backgroundColor: '#4a9b8e',
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        {activity.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {activity.user}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.action}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AdminDashboard;
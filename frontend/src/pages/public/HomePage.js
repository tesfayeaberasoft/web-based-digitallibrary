import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { MenuBook, TrendingUp, People, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Navbar title="Digital Library" showUserMenu={false} />
      
      <Box sx={{ background: 'linear-gradient(135deg, #4a9b8e 0%, #2d6b61 100%)', color: 'white', py: 10 }}>
        <Container>
          <Typography variant="h2" fontWeight={700} gutterBottom align="center">
            Welcome to Your Digital Library
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 4, opacity: 0.9 }}>
            Discover thousands of books, journals, and resources at your fingertips. Search, borrow, and explore our extensive collection of knowledge.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" size="large" sx={{ backgroundColor: 'white', color: '#4a9b8e', '&:hover': { backgroundColor: '#f5f5f5' } }} onClick={() => navigate('/register')}>
              Get Started
            </Button>
            <Button variant="outlined" size="large" sx={{ borderColor: 'white', color: 'white' }} onClick={() => navigate('/browse')}>
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="h3" fontWeight={700} align="center" gutterBottom>
          Our Impact in Numbers
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 6 }}>
          Empowering readers and learners worldwide
        </Typography>

        <Grid container spacing={4}>
          {[
            { icon: <MenuBook />, value: '10,000+', label: 'Total Books', color: '#3498db' },
            { icon: <People />, value: '5,000+', label: 'Active Members', color: '#e91e63' },
            { icon: <TrendingUp />, value: '100K+', label: 'Reading Hours', color: '#ff9800' },
            { icon: <Star />, value: '4.8', label: 'Avg Rating', color: '#4caf50' }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', py: 3 }}>
                <CardContent>
                  <Box sx={{ color: stat.color, mb: 2 }}>
                    {React.cloneElement(stat.icon, { sx: { fontSize: 48 } })}
                  </Box>
                  <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="body1" color="text.secondary">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
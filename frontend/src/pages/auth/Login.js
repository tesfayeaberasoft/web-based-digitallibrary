import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google,
  GitHub,
  Facebook,
  MenuBook
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('Login successful!');
      
      // Redirect based on user role
      switch (result.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'librarian':
          navigate('/librarian');
          break;
        default:
          navigate(from);
      }
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleQuickAccess = (role) => {
    const credentials = {
      admin: { email: 'admin@digitallibrary.com', password: 'password' },
      librarian: { email: 'sarah@library.com', password: 'password' },
      user: { email: 'john.doe@example.com', password: 'password' }
    };

    setFormData(prev => ({
      ...prev,
      email: credentials[role].email,
      password: credentials[role].password
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#f5f7fa'
      }}
    >
      {/* Left Side - Welcome Section */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #4a9b8e 0%, #2d6b61 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          p: 4,
          position: 'relative'
        }}
      >
        <MenuBook sx={{ fontSize: 80, mb: 3, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight={700} gutterBottom align="center">
          Welcome Back!
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 4, opacity: 0.9 }}>
          Access your digital library and continue your reading journey.
        </Typography>

        {/* Features List */}
        <Box sx={{ maxWidth: 400 }}>
          {[
            { number: '1', title: '10,000+ Books', desc: 'Vast collection across all genres' },
            { number: '2', title: 'Instant Access', desc: 'Borrow and read immediately' },
            { number: '3', title: '24/7 Support', desc: 'Always here to help you' }
          ].map((feature, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 3,
                  fontWeight: 700
                }}
              >
                {feature.number}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {feature.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <MenuBook sx={{ fontSize: 48, color: '#4a9b8e', mb: 2 }} />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Sign In
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your credentials to access your account
              </Typography>
            </Box>

            {/* Social Login Buttons */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Google />}
                    sx={{ py: 1.5 }}
                  >
                    Google
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GitHub />}
                    sx={{ py: 1.5 }}
                  >
                    GitHub
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Facebook />}
                    sx={{ py: 1.5 }}
                  >
                    Facebook
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Or continue with email
              </Typography>
            </Divider>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                placeholder="you@example.com"
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                placeholder="••••••••"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />
                  }
                  label="Remember me"
                />
                <Link href="#" variant="body2" color="primary">
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                loading={loading}
                sx={{ mb: 3, py: 1.5 }}
              >
                Sign In
              </Button>
            </form>

            <Typography variant="body2" align="center" sx={{ mb: 3 }}>
              Don't have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/register')}
                sx={{ textDecoration: 'none' }}
              >
                Create Account
              </Link>
            </Typography>

            {/* Quick Access for Demo */}
            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Quick access for demo
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chip
                label="User"
                onClick={() => handleQuickAccess('user')}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="Librarian"
                onClick={() => handleQuickAccess('librarian')}
                clickable
                variant="outlined"
                size="small"
              />
              <Chip
                label="Admin"
                onClick={() => handleQuickAccess('admin')}
                clickable
                variant="outlined"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
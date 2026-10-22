import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Chip,
  CircularProgress,
  Container,
  Fade,
  Grow
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  MenuBook,
  Lock,
  Email,
  TrendingUp,
  Security,
  Schedule,
  ArrowForward,
  Home
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#f0fdf4',
  dark: '#1a1a2e'
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userMaxAttempts, setUserMaxAttempts] = useState(5);
  const [lockoutInfo, setLockoutInfo] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    axios
      .get('http://localhost:8000/api/auth/login-policy')
      .then((res) => {
        const max = res.data?.data?.user_max_login_attempts;
        if (res.data?.success && max) {
          setUserMaxAttempts(max);
        }
      })
      .catch(() => {});
  }, []);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'email') {
      setLockoutInfo(null);
      setError('');
    }
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLockoutInfo(null);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      setLockoutInfo(null);
      toast.success('Login successful!');
      
      switch (result.user.role) {
        case 'super-admin':
          navigate('/super-admin');
          break;
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
      if (result.userLockout) {
        setLockoutInfo({
          remaining: result.remainingAttempts,
          max: result.maxAttempts ?? userMaxAttempts,
          suspended: result.accountSuspended,
        });
      }
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      toast.success('Signed in with Google!');
      switch (result.user.role) {
        case 'super-admin': navigate('/super-admin'); break;
        case 'admin':       navigate('/admin');       break;
        case 'librarian':   navigate('/librarian');   break;
        default:            navigate(from);
      }
    } else {
      setError(result.message || 'Google sign-in failed. Please try again.');
      toast.error(result.message || 'Google sign-in failed.');
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
    toast.error('Google sign-in failed.');
  };

  const handleQuickAccess = (role) => {
    const credentials = {
      admin: { email: 'admin@digitallibrary.com', password: 'password' },
      librarian: { email: 'sarah@library.com', password: 'password' },
      user: { email: 'john.doe@example.com', password: 'password' },
      'super-admin': { email: 'superadmin@digitallibrary.com', password: 'password' }
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
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 4
      }}
    >
      {/* Animated Background Elements */}
      {[
        { size: 400, top: -100, right: -100, opacity: 0.1 },
        { size: 300, bottom: -80, left: -80, opacity: 0.08 },
        { size: 200, top: '40%', left: '10%', opacity: 0.06 },
      ].map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)',
            top: orb.top,
            bottom: orb.bottom,
            left: orb.left,
            right: orb.right,
            opacity: orb.opacity,
            animation: `float ${6 + i * 2}s ease-in-out infinite`,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            }
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Go to Home Button */}
        <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              color: '#1a1a2e',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ffed4e, #ffd700)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Home
          </Button>
        </Box>

        <Fade in={visible} timeout={800}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'white'
            }}
          >
            <Grid container spacing={0} alignItems="stretch">
              {/* Left Side - Welcome Section */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
                    p: { xs: 4, md: 6 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { xs: 400, md: 650 },
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Decorative circles */}
                  {[
                    { size: 150, top: -30, right: -30, opacity: 0.1 },
                    { size: 100, bottom: 50, left: -20, opacity: 0.08 },
                  ].map((circle, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: circle.size,
                        height: circle.size,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        top: circle.top,
                        bottom: circle.bottom,
                        left: circle.left,
                        right: circle.right,
                        opacity: circle.opacity
                      }}
                    />
                  ))}

                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}
                      >
                        <MenuBook sx={{ fontSize: 36, color: 'white' }} />
                      </Box>
                      <Typography variant="h4" fontWeight={900} sx={{ color: 'white' }}>
                        DigiLib
                      </Typography>
                    </Box>

                    <Typography variant="h3" fontWeight={900} sx={{ color: 'white', mb: 2, lineHeight: 1.2 }}>
                      Welcome Back!
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.7 }}>
                      Access your digital library and continue your reading journey.
                    </Typography>

                    {/* Features */}
                    {[
                      { icon: <MenuBook />, title: '10,000+ Books', desc: 'Vast collection across all genres' },
                      { icon: <TrendingUp />, title: 'Track Progress', desc: 'Monitor your reading goals' },
                      { icon: <Security />, title: 'Secure Access', desc: '256-bit encryption protected' }
                    ].map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            flexShrink: 0
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { color: 'white', fontSize: 24 } })}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white' }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {feature.desc}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Right Side - Login Form */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: { xs: 4, md: 6 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { xs: 'auto', md: 650 }
                  }}
                >
                  <Typography variant="h4" fontWeight={800} sx={{ color: C.dark, mb: 1 }}>
                    Sign In
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                    Enter your credentials to access your account
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {lockoutInfo && !lockoutInfo.suspended && (
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                      <strong>Warning:</strong> {lockoutInfo.remaining} of {lockoutInfo.max} attempts remaining
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: C.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: C.secondary }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
                            sx={{ color: C.secondary, '&.Mui-checked': { color: C.primary } }}
                          />
                        }
                        label="Remember me"
                      />
                      <Link href="#" underline="hover" sx={{ color: C.primary, fontWeight: 600 }}>
                        Forgot Password?
                      </Link>
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      endIcon={!loading && <ArrowForward />}
                      sx={{
                        background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                        color: 'white',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: 16,
                        mb: 3,
                        boxShadow: `0 4px 15px ${C.secondary}40`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${C.secondary}50`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Sign In'}
                    </Button>

                    <Divider sx={{ mb: 3 }}>
                      <Chip label="OR" size="small" />
                    </Divider>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        useOneTap
                        size="large"
                        width="100%"
                      />
                    </Box>

                    <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                      Don't have an account?{' '}
                      <Link
                        onClick={() => navigate('/register')}
                        sx={{ color: C.primary, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        Sign Up
                      </Link>
                    </Typography>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<MenuBook />}
                      onClick={() => navigate('/browse')}
                      sx={{
                        mt: 2,
                        py: 1.15,
                        borderRadius: 2,
                        borderColor: `${C.secondary}80`,
                        color: C.primary,
                        fontWeight: 700,
                        '&:hover': {
                          borderColor: C.primary,
                          bgcolor: C.light,
                          transform: 'translateY(-1px)',
                        },
                        '&:focus-visible': { outline: `2px solid ${C.primary}`, outlineOffset: 2 },
                        transition: 'all 180ms ease',
                      }}
                    >
                      Browse Books
                    </Button>
                  </Box>

                  {/* Quick Access (for development) */}
                  {process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Quick Access (Dev Only):
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {['user', 'librarian', 'admin', 'super-admin'].map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            onClick={() => handleQuickAccess(role)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { background: C.light }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;

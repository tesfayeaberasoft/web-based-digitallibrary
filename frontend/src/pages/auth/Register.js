import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Stepper,
  Step,
  StepLabel,
  Grid,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  CircularProgress,
  Container,
  Fade,
  Grow,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  MenuBook,
  Person,
  Security,
  CheckCircle,
  Email,
  Phone,
  Home,
  HomeOutlined,
  Lock,
  ArrowForward,
  ArrowBack,
  LibraryBooks,
  EmojiObjects,
  Group,
  Devices
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';

const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#f0fdf4',
  dark: '#1a1a2e'
};

const steps = ['Personal Info', 'Security', 'Confirmation'];

const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    setVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.fullName || !formData.email || !formData.phone) {
          setError('Please fill in all required fields');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 1:
        if (!formData.password || !formData.confirmPassword) {
          setError('Please fill in all password fields');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    const result = await register({
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      password: formData.password
    });
    
    if (result.success) {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      toast.success('Account created with Google!');
      navigate('/dashboard');
    } else {
      setError(result.message || 'Google sign-up failed. Please try again.');
      toast.error(result.message || 'Google sign-up failed.');
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('Google sign-up was cancelled or failed. Please try again.');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: C.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: C.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 123-4567"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: C.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State 12345"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 2 }}>
                      <Home sx={{ color: C.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: C.secondary }} />
                    </InputAdornment>
                  ),
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Security sx={{ color: C.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, backgroundColor: C.light, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Password must be at least 6 characters long
                </Typography>
              </Box>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: C.secondary, mb: 2 }} />
            <Typography variant="h5" fontWeight={700} sx={{ color: C.dark, mb: 1 }}>
              Ready to Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please review your information and click "Create Account" to complete registration.
            </Typography>
            
            <Box sx={{ textAlign: 'left', backgroundColor: C.light, p: 3, borderRadius: 2, border: `1px solid ${C.secondary}40` }}>
              <Typography variant="h6" sx={{ color: C.dark, mb: 2, fontWeight: 700 }}>
                Account Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 18, color: C.secondary }} />
                  <Typography variant="body2"><strong>Name:</strong> {formData.fullName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 18, color: C.secondary }} />
                  <Typography variant="body2"><strong>Email:</strong> {formData.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 18, color: C.secondary }} />
                  <Typography variant="body2"><strong>Phone:</strong> {formData.phone}</Typography>
                </Box>
                {formData.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Home sx={{ fontSize: 18, color: C.secondary, mt: 0.3 }} />
                    <Typography variant="body2"><strong>Address:</strong> {formData.address}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
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
        { size: 450, top: -120, right: -120, opacity: 0.1 },
        { size: 350, bottom: -100, left: -100, opacity: 0.08 },
        { size: 250, top: '50%', right: '15%', opacity: 0.06 },
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
            animation: `float ${7 + i * 2}s ease-in-out infinite`,
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-30px) rotate(5deg)' }
            }
          }}
        />
      ))}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Go to Home Button */}
        <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <Button
            variant="contained"
            startIcon={<HomeOutlined />}
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
           Goto Home
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
                    minHeight: { xs: 400, md: 750 },
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Decorative circles */}
                  {[
                    { size: 180, top: -40, right: -40, opacity: 0.1 },
                    { size: 120, bottom: 30, left: -30, opacity: 0.08 },
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
                      Join Our Community
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.7 }}>
                      Create your account and unlock a world of knowledge at your fingertips.
                    </Typography>

                    {/* Features List */}
                    {[
                      { icon: <LibraryBooks />, title: 'Instant Access', desc: 'Browse and borrow from 10,000+ books immediately' },
                      { icon: <EmojiObjects />, title: 'Personalized Recommendations', desc: 'Get book suggestions based on your interests' },
                      { icon: <Group />, title: 'Community Features', desc: 'Join discussions and share reviews' },
                      { icon: <Devices />, title: 'Multi-Device Access', desc: 'Read on any device, anytime, anywhere' }
                    ].map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 3,
                            flexShrink: 0
                          }}
                        >
                          {React.cloneElement(feature.icon, { sx: { color: 'white', fontSize: 26 } })}
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

              {/* Right Side - Registration Form */}
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: { xs: 4, md: 6 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { xs: 'auto', md: 750 }
                  }}
                >
                  <Typography variant="h4" fontWeight={800} sx={{ color: C.dark, mb: 1 }}>
                    Create Account
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                    Get started with your free account
                  </Typography>

                  {/* Google Sign-Up Button */}
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">Connecting to Google...</Typography>
                      </Box>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width="100%"
                        text="signup_with"
                        shape="rectangular"
                      />
                    )}
                  </Box>

                  <Divider sx={{ mb: 3 }}>
                    <Chip label="OR" size="small" />
                  </Divider>

                  {/* Stepper */}
                  <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel
                          StepIconProps={{
                            sx: {
                              '&.Mui-active': { color: C.primary },
                              '&.Mui-completed': { color: C.secondary }
                            }
                          }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1 }}>
                      {renderStepContent()}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, gap: 2 }}>
                      <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        sx={{
                          borderColor: C.secondary,
                          color: C.primary,
                          '&:hover': {
                            borderColor: C.primary,
                            backgroundColor: C.light
                          }
                        }}
                      >
                        Back
                      </Button>
                      
                      {activeStep === steps.length - 1 ? (
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          endIcon={!loading && <CheckCircle />}
                          sx={{
                            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                            color: 'white',
                            fontWeight: 700,
                            px: 4,
                            boxShadow: `0 4px 15px ${C.secondary}40`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 20px ${C.secondary}50`
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          variant="contained"
                          endIcon={<ArrowForward />}
                          sx={{
                            background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                            color: 'white',
                            fontWeight: 700,
                            px: 4,
                            boxShadow: `0 4px 15px ${C.secondary}40`,
                            '&:hover': {
                              background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 20px ${C.secondary}50`
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Continue
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
                    Already have an account?{' '}
                    <Link
                      onClick={() => navigate('/login')}
                      sx={{ color: C.primary, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Sign In
                    </Link>
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LibraryBooks />}
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
              </Grid>
            </Grid>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;

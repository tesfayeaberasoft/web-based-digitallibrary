import React, { useRef, useState } from 'react';
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
import { useTranslation } from 'react-i18next';

const C = {
  primary: '#2d6a4f',
  secondary: '#52b788',
  light: '#f0fdf4',
  dark: '#1a1a2e'
};

const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin, checkEmailAvailability } = useAuth();
  const { t } = useTranslation();
  const steps = [
    t('auth.register.stepPersonal'),
    t('auth.register.stepSecurity'),
    t('auth.register.stepConfirmation'),
  ];
  
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [emailAvailability, setEmailAvailability] = useState(null);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailCheckWarning, setEmailCheckWarning] = useState(false);
  const emailCheckRequest = useRef(0);

  React.useEffect(() => {
    setVisible(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (touched[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
    if (name === 'email') {
      emailCheckRequest.current += 1;
      setEmailAvailability(null);
      setEmailCheckLoading(false);
      setEmailCheckWarning(false);
    } else if (name === 'password' && touched.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: value === formData.confirmPassword
          ? ''
          : 'auth.register.validation.passwordMismatch'
      }));
    }
  };

  const validateField = (name, value) => {
    const trimmed = value.trim();
    switch (name) {
      case 'fullName':
        if (trimmed.length < 3 || trimmed.length > 100 || !/^[\p{L}\p{M} ]+$/u.test(trimmed)) {
          return 'auth.register.validation.name';
        }
        return '';
      case 'email':
        if (trimmed.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
          return 'auth.register.validation.email';
        }
        return '';
      case 'phone':
        if (!/^(?:\+251|0)?[79]\d{8}$/.test(trimmed.replace(/[\s()-]/g, ''))) {
          return 'auth.register.validation.phone';
        }
        return '';
      case 'address':
        if (trimmed.length < 5) {
          return 'auth.register.validation.address';
        }
        return '';
      case 'password':
        if (value.length < 8 || !/[A-Z]/.test(value) || !/[a-z]/.test(value)
          || !/[0-9]/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
          return 'auth.register.validation.password';
        }
        return '';
      case 'confirmPassword':
        return value !== formData.password
          ? 'auth.register.validation.passwordMismatch'
          : '';
      default:
        return '';
    }
  };

  const verifyEmailAvailability = async () => {
    const email = formData.email.trim().toLowerCase();
    if (emailAvailability?.email === email) {
      if (!emailAvailability.available) {
        setFieldErrors(prev => ({
          ...prev,
          email: 'auth.register.validation.emailTaken',
        }));
        return false;
      }
      return true;
    }

    const requestId = ++emailCheckRequest.current;
    setEmailCheckLoading(true);
    const result = await checkEmailAvailability(email);
    if (requestId !== emailCheckRequest.current) {
      return false;
    }
    setEmailCheckLoading(false);

    if (!result.success) {
      setEmailCheckWarning(true);
      setFieldErrors(prev => ({ ...prev, email: '' }));
      return true;
    }

    setEmailCheckWarning(false);
    setEmailAvailability({ email, available: result.available });
    const message = result.available ? '' : 'auth.register.validation.emailTaken';
    setFieldErrors(prev => ({ ...prev, email: message }));
    return result.available;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    if (name === 'email' && !validateField(name, value)) {
      verifyEmailAvailability();
    }
  };

  const handleNext = async () => {
    if (await validateStep()) {
      setActiveStep(prev => prev + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const validateStep = async () => {
    const fields = activeStep === 0
      ? ['fullName', 'email', 'phone', 'address']
      : ['password', 'confirmPassword'];
    const nextErrors = {};
    fields.forEach((name) => {
      nextErrors[name] = validateField(name, formData[name]);
    });
    setTouched(prev => ({
      ...prev,
      ...fields.reduce((result, name) => ({ ...result, [name]: true }), {})
    }));
    setFieldErrors(prev => ({ ...prev, ...nextErrors }));

    if (Object.values(nextErrors).some(Boolean)) {
      return false;
    }
    if (activeStep === 0) {
      return verifyEmailAvailability();
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFields = ['fullName', 'email', 'phone', 'address', 'password', 'confirmPassword'];
    const nextErrors = {};
    allFields.forEach((name) => {
      nextErrors[name] = validateField(name, formData[name]);
    });
    setTouched(allFields.reduce((result, name) => ({ ...result, [name]: true }), {}));
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

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
      toast.success(t('auth.register.success'));
      navigate('/login');
    } else {
      setError('auth.register.failed');
      if (result.errors) {
        const serverErrors = {
          full_name: 'fullName',
          email: 'email',
          phone: 'phone',
          address: 'address',
          password: 'password'
        };
        setFieldErrors(prev => ({
          ...prev,
          ...Object.entries(result.errors).reduce((mapped, [field]) => {
            if (serverErrors[field]) {
              const validationKey = field === 'full_name'
                ? 'name'
                : field === 'confirm_password'
                  ? 'passwordMismatch'
                  : field;
              mapped[serverErrors[field]] = `auth.register.validation.${validationKey}`;
            }
            return mapped;
          }, {})
        }));
      }
      toast.error(t('auth.register.failed'));
    }
    
    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential);
    if (result.success) {
      toast.success(t('auth.register.googleSuccess'));
      navigate('/dashboard');
    } else {
      setError('auth.register.googleFailed');
      toast.error(t('auth.register.googleFailed'));
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    setError('auth.register.googleCancelled');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('auth.register.fullName')}
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={Boolean(touched.fullName && fieldErrors.fullName)}
                helperText={touched.fullName && fieldErrors.fullName ? t(fieldErrors.fullName) : ''}
                placeholder={t('auth.register.fullNamePlaceholder')}
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
                label={t('auth.register.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={Boolean(touched.email && fieldErrors.email)}
                helperText={touched.email
                  ? (emailCheckLoading
                    ? t('auth.register.checkingEmail')
                    : fieldErrors.email
                      ? t(fieldErrors.email)
                      : emailCheckWarning
                        ? t('auth.register.validation.emailCheckFailed')
                        : '')
                  : ''}
                placeholder={t('auth.register.emailPlaceholder')}
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
                label={t('auth.register.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={Boolean(touched.phone && fieldErrors.phone)}
                helperText={touched.phone && fieldErrors.phone ? t(fieldErrors.phone) : ''}
                placeholder={t('auth.register.phonePlaceholder')}
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
                label={t('auth.register.address')}
                name="address"
                multiline
                rows={3}
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={Boolean(touched.address && fieldErrors.address)}
                helperText={touched.address && fieldErrors.address ? t(fieldErrors.address) : ''}
                placeholder={t('auth.register.addressPlaceholder')}
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
                label={t('auth.register.password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={Boolean(touched.password && fieldErrors.password)}
                helperText={touched.password && fieldErrors.password ? t(fieldErrors.password) : ''}
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
                label={t('auth.register.confirmPassword')}
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                error={Boolean(touched.confirmPassword && fieldErrors.confirmPassword)}
                helperText={touched.confirmPassword && fieldErrors.confirmPassword ? t(fieldErrors.confirmPassword) : ''}
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
                  {t('auth.register.passwordRequirements')}
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
              {t('auth.register.ready')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {t('auth.register.review')}
            </Typography>
            
            <Box sx={{ textAlign: 'left', backgroundColor: C.light, p: 3, borderRadius: 2, border: `1px solid ${C.secondary}40` }}>
              <Typography variant="h6" sx={{ color: C.dark, mb: 2, fontWeight: 700 }}>
                {t('auth.register.summary')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 18, color: C.secondary }} />
                  <Typography variant="body2"><strong>{t('auth.register.name')}</strong> {formData.fullName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 18, color: C.secondary }} />
                  <Typography variant="body2"><strong>{t('auth.register.emailLabel')}</strong> {formData.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 18, color: C.secondary }} />
                  <Typography variant="body2"><strong>{t('auth.register.phoneLabel')}</strong> {formData.phone}</Typography>
                </Box>
                {formData.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Home sx={{ fontSize: 18, color: C.secondary, mt: 0.3 }} />
                    <Typography variant="body2"><strong>{t('auth.register.addressLabel')}</strong> {formData.address}</Typography>
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
            {t('common.home')}
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
                      {t('auth.register.welcome')}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.7 }}>
                      {t('auth.register.intro')}
                    </Typography>

                    {/* Features List */}
                    {[
                      { icon: <LibraryBooks />, title: t('auth.register.featureAccess'), desc: t('auth.register.featureAccessDesc') },
                      { icon: <EmojiObjects />, title: t('auth.register.featureRecommendations'), desc: t('auth.register.featureRecommendationsDesc') },
                      { icon: <Group />, title: t('auth.register.featureCommunity'), desc: t('auth.register.featureCommunityDesc') },
                      { icon: <Devices />, title: t('auth.register.featureDevices'), desc: t('auth.register.featureDevicesDesc') }
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
                    {t('auth.register.title')}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                    {t('auth.register.subtitle')}
                  </Typography>

                  {/* Google Sign-Up Button */}
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 400, mx: 'auto', gap: 1 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">{t('auth.register.connectingGoogle')}</Typography>
                      </Box>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        text="signup_with"
                        shape="rectangular"
                      />
                    )}
                  </Box>

                  <Divider sx={{ mb: 3 }}>
                    <Chip label={t('auth.register.or')} size="small" />
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
                      {t(error)}
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
                        {t('auth.register.back')}
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
                          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : t('auth.register.submit')}
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
                          {t('auth.register.continue')}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" align="center" sx={{ mt: 3, color: 'text.secondary' }}>
                    {t('auth.register.existingAccount')}{' '}
                    <Link
                      onClick={() => navigate('/login')}
                      sx={{ color: C.primary, fontWeight: 700, cursor: 'pointer', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {t('auth.register.signIn')}
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
                    {t('auth.register.browseBooks')}
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

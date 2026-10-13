import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Avatar, Divider, Alert, CircularProgress, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  Chip, Paper, Fade, Grow, LinearProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Upload as UploadIcon,
  Visibility, VisibilityOff,
  Lock, Shield, CheckCircle,
  CalendarToday, VerifiedUser,
  Badge, Close, CameraAlt
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const C = {
  primary:   '#2d6a4f',
  secondary: '#52b788',
  light:     '#d8f3dc',
  lighter:   '#f0fdf4',
  dark:      '#1b4332',
  accent:    '#95d5b2',
};

const inputSx = (active = true) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    transition: 'all 0.2s ease',
    '&:hover fieldset': { borderColor: active ? C.secondary : undefined },
    '&.Mui-focused fieldset': { borderColor: C.primary, borderWidth: 2 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: C.primary },
});

const gradientBtn = {
  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
  color: 'white',
  fontWeight: 700,
  borderRadius: 2,
  boxShadow: `0 4px 12px rgba(45,106,79,0.35)`,
  '&:hover': {
    background: `linear-gradient(135deg, ${C.dark}, ${C.primary})`,
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 20px rgba(45,106,79,0.45)`,
  },
  '&.Mui-disabled': { opacity: 0.5 },
  transition: 'all 0.3s ease',
};

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const videoRef     = useRef(null);
  const canvasRef    = useRef(null);

  const [editing,        setEditing]        = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [success,        setSuccess]        = useState('');
  const [error,          setError]          = useState('');
  const [imagePreview,   setImagePreview]   = useState(null);
  const [cameraOpen,     setCameraOpen]     = useState(false);
  const [cameraStream,   setCameraStream]   = useState(null);
  const [cameraError,    setCameraError]    = useState('');

  const [formData, setFormData] = useState({ full_name:'', email:'', phone:'', address:'' });
  const [pwData,   setPwData]   = useState({ current_password:'', new_password:'', confirm_password:'' });
  const [showPw,   setShowPw]   = useState({ current:false, new:false, confirm:false });

  /* ── sync user ── */
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email:     user.email    || '',
        phone:     user.phone    || '',
        address:   user.address  || '',
      });
      if (user.profile_image) setImagePreview(`http://localhost:8000/${user.profile_image}`);
    }
  }, [user]);

  /* ── cleanup camera ── */
  useEffect(() => () => {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
  }, [cameraStream]);

  /* ────────── handlers ────────── */
  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwChange = e => setPwData(p => ({ ...p, [e.target.name]: e.target.value }));
  const togglePw = field => setShowPw(p => ({ ...p, [field]: !p[field] }));

  const handleEdit   = () => { setEditing(true);  setSuccess(''); setError(''); };
  const handleCancel = () => {
    setEditing(false);
    setFormData({ full_name: user?.full_name||'', email: user?.email||'', phone: user?.phone||'', address: user?.address||'' });
    setError('');
  };

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`http://localhost:8000/api/users/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) { setSuccess('Profile updated successfully!'); setEditing(false); updateUser({ ...user, ...formData }); }
    } catch (e) { setError(e.response?.data?.message || 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handlePasswordUpdate = async () => {
    if (pwData.new_password !== pwData.confirm_password) { setError('Passwords do not match'); return; }
    if (pwData.new_password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(`http://localhost:8000/api/users/${user.id}/password`, {
        current_password: pwData.current_password, new_password: pwData.new_password,
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setSuccess('Password updated successfully!');
        setPwData({ current_password:'', new_password:'', confirm_password:'' });
        setShowPw({ current:false, new:false, confirm:false });
      }
    } catch (e) { setError(e.response?.data?.message || 'Failed to update password'); }
    finally { setLoading(false); }
  };

  const uploadImage = async (file) => {
    setUploading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData(); fd.append('profile_image', file);
      const { data } = await axios.post(`http://localhost:8000/api/users/${user.id}/profile-image`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setSuccess('Profile image updated!');
        const updated = { ...user, profile_image: data.profile_image };
        updateUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to upload image');
      setImagePreview(user?.profile_image ? `http://localhost:8000/${user.profile_image}` : null);
    } finally { setUploading(false); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg','image/jpg','image/png','image/gif','image/webp'];
    if (!allowed.includes(file.type)) { setError('Only JPG, PNG, GIF, WEBP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Max file size is 5 MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    uploadImage(file);
  };

  const openCamera = async () => {
    setCameraOpen(true); setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' } });
      setCameraStream(stream);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch { setCameraError('Unable to access camera. Use file upload instead.'); }
  };

  const closeCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); setCameraStream(null); }
    setCameraOpen(false); setCameraError('');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    c.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type:'image/jpeg' });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      closeCamera();
      uploadImage(file);
    }, 'image/jpeg', 0.9);
  };

  const initials = (n) => (n||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);

  /* ── password strength ── */
  const pwStrength = (() => {
    const p = pwData.new_password;
    if (!p) return { score:0, label:'', color:'' };
    let s = 0;
    if (p.length >= 6)  s += 25;
    if (p.length >= 10) s += 25;
    if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9!@#$%^&*]/.test(p)) s += 25;
    const map = { 25:['Weak','#ef4444'], 50:['Fair','#f59e0b'], 75:['Good', C.secondary], 100:['Strong', C.primary] };
    const [label, color] = map[s] || ['Weak','#ef4444'];
    return { score:s, label, color };
  })();

  const pwMatch = pwData.confirm_password && pwData.new_password === pwData.confirm_password;
  const pwMismatch = pwData.confirm_password && pwData.new_password !== pwData.confirm_password;

  /* ════════════ render ════════════ */
  return (
    <DashboardLayout title="My Profile">
      <Fade in timeout={500}>
        <Box>

          {/* ── page header ── */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5,
            }}>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account information and security settings
            </Typography>
          </Box>

          {/* ── alerts ── */}
          {success && (
            <Grow in timeout={300}>
              <Alert severity="success" icon={<CheckCircle />} onClose={() => setSuccess('')}
                sx={{ mb: 3, borderRadius: 2, border:`1px solid ${C.secondary}`, bgcolor: C.lighter,
                  '& .MuiAlert-icon': { color: C.primary } }}>
                {success}
              </Alert>
            </Grow>
          )}
          {error && (
            <Grow in timeout={300}>
              <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            </Grow>
          )}

          <Grid container spacing={3}>
            {/* ══════════════ LEFT COLUMN ══════════════ */}
            <Grid item xs={12} md={8}>

              {/* ─── Personal Information ─── */}
              <Card elevation={0} sx={{
                mb: 3, border:`1px solid ${C.light}`, borderRadius: 3,
                transition:'box-shadow 0.3s', '&:hover':{ boxShadow:`0 8px 24px ${C.light}` },
              }}>
                <CardContent sx={{ p:{ xs:3, md:4 } }}>
                  <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 3 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                      <Avatar sx={{ bgcolor: C.lighter, width:44, height:44 }}>
                        <PersonIcon sx={{ color: C.primary }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} color={C.dark}>Personal Information</Typography>
                        <Typography variant="caption" color="text.secondary">Update your personal details</Typography>
                      </Box>
                    </Box>
                    {!editing && (
                      <Button startIcon={<EditIcon />} onClick={handleEdit} variant="outlined" sx={{
                        borderColor: C.secondary, color: C.primary, fontWeight:700, borderRadius:2,
                        '&:hover':{ borderColor: C.primary, bgcolor: C.lighter, transform:'translateY(-1px)' },
                        transition:'all 0.2s ease',
                      }}>
                        Edit Profile
                      </Button>
                    )}
                  </Box>

                  <Grid container spacing={2.5}>
                    {[
                      { label:'Full Name',      name:'full_name', icon:<PersonIcon/>,   type:'text',  sm:6 },
                      { label:'Email Address',  name:'email',     icon:<EmailIcon/>,    type:'email', sm:6 },
                      { label:'Phone Number',   name:'phone',     icon:<PhoneIcon/>,    type:'text',  sm:6 },
                      { label:'Address',        name:'address',   icon:<LocationIcon/>, type:'text',  sm:6 },
                    ].map(f => (
                      <Grid item xs={12} sm={f.sm} key={f.name}>
                        <TextField fullWidth label={f.label} name={f.name} type={f.type}
                          value={formData[f.name]} onChange={handleChange} disabled={!editing}
                          InputProps={{ startAdornment:(
                            <InputAdornment position="start">
                              {React.cloneElement(f.icon, { sx:{ color: editing ? C.secondary : 'text.disabled', fontSize:20 } })}
                            </InputAdornment>
                          )}}
                          sx={inputSx(editing)}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {editing && (
                    <Grow in timeout={300}>
                      <Box sx={{ display:'flex', gap:2, mt:3, flexWrap:'wrap' }}>
                        <Button variant="contained" onClick={handleSave} disabled={loading}
                          startIcon={loading ? <CircularProgress size={18} sx={{color:'white'}}/> : <SaveIcon/>}
                          sx={{ ...gradientBtn, px:3, py:1.2 }}>
                          {loading ? 'Saving…' : 'Save Changes'}
                        </Button>
                        <Button variant="outlined" startIcon={<CancelIcon/>} onClick={handleCancel} disabled={loading}
                          sx={{ borderColor:'#e5e7eb', color:'text.secondary', fontWeight:600, borderRadius:2,
                            '&:hover':{ borderColor:'#9ca3af', bgcolor:'#f9fafb' } }}>
                          Cancel
                        </Button>
                      </Box>
                    </Grow>
                  )}
                </CardContent>
              </Card>

              {/* ─── Change Password ─── */}
              <Card elevation={0} sx={{
                border:`1px solid ${C.light}`, borderRadius:3,
                transition:'box-shadow 0.3s', '&:hover':{ boxShadow:`0 8px 24px ${C.light}` },
              }}>
                <CardContent sx={{ p:{ xs:3, md:4 } }}>
                  <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1 }}>
                    <Avatar sx={{ bgcolor: C.lighter, width:44, height:44 }}>
                      <Shield sx={{ color: C.primary }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color={C.dark}>Change Password</Typography>
                      <Typography variant="caption" color="text.secondary">Keep your account secure</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my:2.5, borderColor: C.light }} />

                  <Grid container spacing={2.5}>
                    {/* Current */}
                    <Grid item xs={12}>
                      <TextField fullWidth label="Current Password" name="current_password"
                        type={showPw.current ? 'text' : 'password'}
                        value={pwData.current_password} onChange={handlePwChange}
                        InputProps={{
                          startAdornment:<InputAdornment position="start"><Lock sx={{color:C.secondary,fontSize:20}}/></InputAdornment>,
                          endAdornment:(
                            <InputAdornment position="end">
                              <IconButton onClick={()=>togglePw('current')} edge="end"
                                sx={{ color: showPw.current ? C.primary : 'text.secondary',
                                  '&:hover':{ color:C.primary, bgcolor:C.lighter } }}>
                                {showPw.current ? <VisibilityOff/> : <Visibility/>}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx()}
                      />
                    </Grid>

                    {/* New */}
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="New Password" name="new_password"
                        type={showPw.new ? 'text' : 'password'}
                        value={pwData.new_password} onChange={handlePwChange}
                        InputProps={{
                          startAdornment:<InputAdornment position="start"><Lock sx={{color:C.secondary,fontSize:20}}/></InputAdornment>,
                          endAdornment:(
                            <InputAdornment position="end">
                              <IconButton onClick={()=>togglePw('new')} edge="end"
                                sx={{ color: showPw.new ? C.primary : 'text.secondary',
                                  '&:hover':{ color:C.primary, bgcolor:C.lighter } }}>
                                {showPw.new ? <VisibilityOff/> : <Visibility/>}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx()}
                      />
                      {/* strength bar */}
                      {pwData.new_password && (
                        <Fade in timeout={300}>
                          <Box sx={{ mt:1 }}>
                            <LinearProgress variant="determinate" value={pwStrength.score} sx={{
                              height:6, borderRadius:3, bgcolor:'#e5e7eb',
                              '& .MuiLinearProgress-bar':{ borderRadius:3, bgcolor: pwStrength.color },
                            }}/>
                            <Typography variant="caption" sx={{ color: pwStrength.color, fontWeight:700, mt:0.5, display:'block' }}>
                              Strength: {pwStrength.label}
                            </Typography>
                          </Box>
                        </Fade>
                      )}
                    </Grid>

                    {/* Confirm */}
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Confirm New Password" name="confirm_password"
                        type={showPw.confirm ? 'text' : 'password'}
                        value={pwData.confirm_password} onChange={handlePwChange}
                        error={pwMismatch}
                        helperText={pwMismatch ? 'Passwords do not match' : pwMatch ? '✓ Passwords match' : ''}
                        FormHelperTextProps={{ sx:{ color: pwMatch ? C.secondary : undefined } }}
                        InputProps={{
                          startAdornment:<InputAdornment position="start"><Lock sx={{color:C.secondary,fontSize:20}}/></InputAdornment>,
                          endAdornment:(
                            <InputAdornment position="end">
                              <IconButton onClick={()=>togglePw('confirm')} edge="end"
                                sx={{ color: showPw.confirm ? C.primary : 'text.secondary',
                                  '&:hover':{ color:C.primary, bgcolor:C.lighter } }}>
                                {showPw.confirm ? <VisibilityOff/> : <Visibility/>}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={inputSx()}
                      />
                    </Grid>
                  </Grid>

                  <Button variant="contained" onClick={handlePasswordUpdate}
                    disabled={loading || !pwData.current_password || !pwData.new_password || !pwMatch}
                    startIcon={loading ? <CircularProgress size={18} sx={{color:'white'}}/> : <Shield/>}
                    sx={{ ...gradientBtn, mt:3, px:4, py:1.3 }}>
                    {loading ? 'Updating…' : 'Update Password'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* ══════════════ RIGHT COLUMN ══════════════ */}
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{
                border:`1px solid ${C.light}`, borderRadius:3, overflow:'hidden',
                position:{ md:'sticky' }, top:20,
                transition:'box-shadow 0.3s', '&:hover':{ boxShadow:`0 8px 24px ${C.light}` },
              }}>
                {/* green banner */}
                <Box sx={{
                  background:`linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                  height:95, position:'relative', overflow:'hidden',
                }}>
                  {[{ s:120, t:-35, r:-25, o:.15 },{ s:70, t:15, l:-15, o:.1 }].map((c,i)=>(
                    <Box key={i} sx={{
                      position:'absolute', width:c.s, height:c.s, borderRadius:'50%',
                      background:'rgba(255,255,255,0.35)', top:c.t, right:c.r, left:c.l, opacity:c.o,
                    }}/>
                  ))}
                </Box>

                <CardContent sx={{ px:3, pb:3, pt:0, textAlign:'center' }}>
                  {/* Avatar overlapping banner */}
                  <Box sx={{ position:'relative', display:'inline-block', mt:-7, mb:1.5 }}>
                    <Avatar src={imagePreview}
                      sx={{
                        width:114, height:114,
                        border:`4px solid white`,
                        boxShadow:`0 8px 20px rgba(45,106,79,.25)`,
                        background:`linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                        fontSize:'2.2rem', fontWeight:800,
                      }}>
                      {!imagePreview && initials(user?.full_name)}
                    </Avatar>
                    {uploading && (
                      <CircularProgress size={114} thickness={2}
                        sx={{ position:'absolute', top:0, left:0, color: C.secondary }}/>
                    )}
                    <Tooltip title="Change Photo">
                      <IconButton onClick={()=>fileInputRef.current?.click()}
                        sx={{
                          position:'absolute', bottom:4, right:4,
                          bgcolor: C.primary, color:'white', width:30, height:30,
                          '&:hover':{ bgcolor: C.dark, transform:'scale(1.15)' },
                          transition:'all 0.2s ease',
                        }}>
                        <CameraAlt sx={{ fontSize:15 }}/>
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography variant="h6" fontWeight={800} color={C.dark} sx={{ mb:.5 }}>
                    {user?.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb:1.5 }}>
                    {user?.email}
                  </Typography>
                  <Chip label={(user?.role||'user').replace('-',' ')} size="small" sx={{
                    background:`linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    color:'white', fontWeight:700, textTransform:'capitalize', px:1, mb:2.5,
                  }}/>

                  {/* action buttons */}
                  <Box sx={{ display:'flex', gap:1, mb:1.5 }}>
                    <Button fullWidth variant="contained" size="small" startIcon={<UploadIcon/>}
                      onClick={()=>fileInputRef.current?.click()} disabled={uploading}
                      sx={{ ...gradientBtn }}>
                      Upload
                    </Button>
                    <Button fullWidth variant="outlined" size="small" startIcon={<PhotoCameraIcon/>}
                      onClick={openCamera} disabled={uploading}
                      sx={{ borderColor:C.secondary, color:C.primary, fontWeight:700, borderRadius:2,
                        '&:hover':{ borderColor:C.primary, bgcolor:C.lighter, transform:'translateY(-1px)' },
                        transition:'all 0.2s ease',
                      }}>
                      Camera
                    </Button>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display:'block', mb:2.5 }}>
                    JPG · PNG · GIF · WEBP &nbsp;·&nbsp; Max 5 MB
                  </Typography>

                  <input ref={fileInputRef} type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect} style={{ display:'none' }}/>

                  <Divider sx={{ borderColor: C.light, mb:2.5 }}/>

                  {/* info pills */}
                  <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                    {[
                      { icon:<CalendarToday sx={{fontSize:15,color:C.secondary}}/>, label:'Member Since',
                        value: user?.created_at
                          ? new Date(user.created_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})
                          : '—' },
                      { icon:<VerifiedUser sx={{fontSize:15,color:C.secondary}}/>, label:'Account Status',
                        value: user?.status === 'active' ? 'Active' : user?.status || '—',
                        valueColor: user?.status === 'active' ? C.primary : '#ef4444' },
                      { icon:<Badge sx={{fontSize:15,color:C.secondary}}/>, label:'Account ID',
                        value: user?.id ? `#${user.id}` : '—' },
                    ].map((info,i)=>(
                      <Paper key={i} elevation={0} sx={{
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        p:1.5, borderRadius:2, bgcolor: C.lighter, border:`1px solid ${C.light}`,
                      }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          {info.icon}
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {info.label}
                          </Typography>
                        </Box>
                        <Typography variant="caption" fontWeight={700} sx={{ color: info.valueColor || C.dark }}>
                          {info.value}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ══════════════ CAMERA DIALOG ══════════════ */}
          <Dialog open={cameraOpen} onClose={closeCamera} maxWidth="md" fullWidth
            PaperProps={{ sx:{ borderRadius:3, overflow:'hidden' } }}>
            <DialogTitle sx={{
              background:`linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              color:'white', display:'flex', alignItems:'center', justifyContent:'space-between', py:2,
            }}>
              <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                <PhotoCameraIcon/>
                <Typography variant="h6" fontWeight={700}>Take a Photo</Typography>
              </Box>
              <IconButton onClick={closeCamera}
                sx={{ color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,0.2)' } }}>
                <Close/>
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p:3, bgcolor: C.lighter }}>
              {cameraError ? (
                <Alert severity="error" sx={{ borderRadius:2 }}>{cameraError}</Alert>
              ) : (
                <Box sx={{
                  position:'relative', width:'100%', bgcolor:'black',
                  borderRadius:3, overflow:'hidden', border:`3px solid ${C.secondary}`,
                }}>
                  <video ref={videoRef} autoPlay playsInline
                    style={{ width:'100%', height:'auto', display:'block', transform:'scaleX(-1)' }}/>
                  <canvas ref={canvasRef} style={{ display:'none' }}/>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary"
                sx={{ mt:2, textAlign:'center', fontWeight:500 }}>
                Position yourself in the frame and click "Capture Photo"
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p:2.5, gap:1, bgcolor: C.lighter, borderTop:`1px solid ${C.light}` }}>
              <Button variant="outlined" startIcon={<CancelIcon/>} onClick={closeCamera}
                sx={{ borderColor:'#e5e7eb', color:'text.secondary', fontWeight:600, borderRadius:2,
                  '&:hover':{ borderColor:'#9ca3af', bgcolor:'#f9fafb' } }}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<PhotoCameraIcon/>} onClick={capturePhoto}
                disabled={!cameraStream || !!cameraError}
                sx={{ ...gradientBtn, px:3 }}>
                Capture Photo
              </Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Fade>
    </DashboardLayout>
  );
}

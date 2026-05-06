import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      
      // Set profile image if exists
      if (user.profile_image) {
        setImagePreview(`http://localhost:8000/${user.profile_image}`);
      }
    }
  }, [user]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setEditing(true);
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8000/api/users/${user.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        // Update user context
        updateUser({ ...user, ...formData });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8000/api/users/${user.id}/password`,
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setSuccess('Password updated successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File too large. Maximum size is 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Auto-upload the image
      uploadProfileImage(file);
    }
  };

  const uploadProfileImage = async (file) => {
    setUploadingImage(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profile_image', file);
      
      const response = await axios.post(
        `http://localhost:8000/api/users/${user.id}/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setSuccess('Profile image updated successfully!');
        // Update user context with new image
        updateUser({ ...user, profile_image: response.data.profile_image });
        
        // Update localStorage
        const updatedUser = { ...user, profile_image: response.data.profile_image };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile image');
      // Reset preview on error
      if (user.profile_image) {
        setImagePreview(`http://localhost:8000/${user.profile_image}`);
      } else {
        setImagePreview(null);
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    // For now, just clear the preview
    // In a full implementation, you'd call an API to delete the image
    setImagePreview(null);
    setProfileImage(null);
  };

  const handleOpenCamera = async () => {
    setCameraDialogOpen(true);
    setCameraError('');
    
    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' // Front camera
        } 
      });
      
      setCameraStream(stream);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  const handleCloseCamera = () => {
    // Stop camera stream
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    setCameraDialogOpen(false);
    setCameraError('');
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        // Create file from blob
        const file = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        
        // Close camera dialog
        handleCloseCamera();
        
        // Upload the photo
        uploadProfileImage(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your account information
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Profile Information
                  </Typography>
                  {!editing && (
                    <Button
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      sx={{ color: '#4a9b8e' }}
                    >
                      Edit
                    </Button>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
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
                      disabled={!editing}
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                      }}
                    />
                  </Grid>
                </Grid>

                {editing && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Change Password
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update your password to keep your account secure
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      helperText="Minimum 6 characters"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  onClick={handlePasswordUpdate}
                  disabled={loading || !passwordData.current_password || !passwordData.new_password}
                  sx={{ mt: 3, bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src={imagePreview}
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      bgcolor: '#4a9b8e',
                      fontSize: '2.5rem'
                    }}
                  >
                    {!imagePreview && user && getInitials(user.full_name)}
                  </Avatar>
                  
                  {uploadingImage && (
                    <CircularProgress
                      size={120}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        marginLeft: '-60px',
                        zIndex: 1
                      }}
                    />
                  )}
                </Box>

                {/* Upload and Camera Buttons */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleUploadClick}
                    disabled={uploadingImage}
                    sx={{ 
                      bgcolor: '#4a9b8e', 
                      '&:hover': { bgcolor: '#3d8276' },
                      flex: 1
                    }}
                  >
                    Upload
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={handleOpenCamera}
                    disabled={uploadingImage}
                    sx={{ 
                      borderColor: '#4a9b8e',
                      color: '#4a9b8e',
                      '&:hover': { 
                        borderColor: '#3d8276',
                        bgcolor: 'rgba(74, 155, 142, 0.04)'
                      },
                      flex: 1
                    }}
                  >
                    Camera
                  </Button>
                </Box>
                  
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.75rem' }}>
                  Upload from file or take a photo
                  <br />
                  (JPG, PNG, GIF, WEBP - Max 5MB)
                </Typography>

                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {user?.full_name}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>

                <Box
                  sx={{
                    display: 'inline-block',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: '#4a9b8e',
                    color: 'white',
                    textTransform: 'capitalize',
                    mt: 2
                  }}
                >
                  {user?.role}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Member Since
                  </Typography>
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    {user?.created_at && new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Account Status
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="success.main">
                    {user?.status === 'active' ? 'Active' : user?.status}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Camera Dialog */}
        <Dialog 
          open={cameraDialogOpen} 
          onClose={handleCloseCamera}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Take a Photo
          </DialogTitle>
          <DialogContent>
            {cameraError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {cameraError}
              </Alert>
            ) : (
              <Box sx={{ position: 'relative', width: '100%', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    transform: 'scaleX(-1)' // Mirror effect for front camera
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Position yourself in the frame and click "Capture Photo"
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button 
              onClick={handleCloseCamera}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCapturePhoto}
              variant="contained"
              startIcon={<PhotoCameraIcon />}
              disabled={!cameraStream || cameraError}
              sx={{ 
                bgcolor: '#4a9b8e', 
                '&:hover': { bgcolor: '#3d8276' }
              }}
            >
              Capture Photo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default UserProfile;
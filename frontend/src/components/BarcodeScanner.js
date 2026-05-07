import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { BrowserMultiFormatReader } from '@zxing/library';

const BarcodeScanner = ({ 
  open, 
  onClose, 
  onScan, 
  title = "Scan Barcode",
  subtitle = "Position the barcode within the camera view"
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (open) {
      initializeScanner();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open]);

  const initializeScanner = async () => {
    try {
      setError('');
      setIsScanning(true);

      // Initialize the code reader
      codeReader.current = new BrowserMultiFormatReader();

      // Get available video devices
      const videoDevices = await codeReader.current.listVideoInputDevices();
      setDevices(videoDevices);

      if (videoDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Prefer back camera if available
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      );
      const deviceToUse = backCamera || videoDevices[0];
      setSelectedDevice(deviceToUse);

      // Request camera permission and start scanning
      await startScanning(deviceToUse.deviceId);
      setHasPermission(true);

    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError(err.message || 'Failed to initialize camera');
      setHasPermission(false);
      setIsScanning(false);
    }
  };

  const startScanning = async (deviceId) => {
    try {
      if (!codeReader.current || !videoRef.current) return;

      // Configure camera constraints
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : { ideal: 'environment' }
        }
      };

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      // Start decoding
      codeReader.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScanResult(result.getText());
          }
          if (error && error.name !== 'NotFoundException') {
            console.warn('Scan error:', error);
          }
        }
      );

    } catch (err) {
      console.error('Start scanning error:', err);
      throw new Error('Failed to access camera: ' + err.message);
    }
  };

  const stopScanning = () => {
    try {
      // Stop the code reader
      if (codeReader.current) {
        codeReader.current.reset();
      }

      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setIsScanning(false);
    } catch (err) {
      console.error('Stop scanning error:', err);
    }
  };

  const handleScanResult = (text) => {
    try {
      // Validate barcode format (ISBN, user ID, etc.)
      const cleanText = text.trim();
      
      if (cleanText) {
        onScan(cleanText);
        handleClose();
      }
    } catch (err) {
      console.error('Scan result processing error:', err);
      setError('Invalid barcode format');
    }
  };

  const handleClose = () => {
    stopScanning();
    setError('');
    setHasPermission(null);
    onClose();
  };

  const toggleFlash = async () => {
    try {
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        if (track && track.getCapabilities && track.getCapabilities().torch) {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }]
          });
          setFlashEnabled(!flashEnabled);
        }
      }
    } catch (err) {
      console.warn('Flash toggle failed:', err);
    }
  };

  const switchCamera = async () => {
    if (devices.length <= 1) return;

    try {
      stopScanning();
      
      const currentIndex = devices.findIndex(d => d.deviceId === selectedDevice?.deviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      const nextDevice = devices[nextIndex];
      
      setSelectedDevice(nextDevice);
      await startScanning(nextDevice.deviceId);
    } catch (err) {
      console.error('Camera switch error:', err);
      setError('Failed to switch camera');
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          bgcolor: '#000',
          color: 'white',
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#1a1a1a', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="grey.400">
            {subtitle}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#000', position: 'relative' }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {hasPermission === false && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CameraIcon sx={{ fontSize: 64, color: 'grey.500', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Camera Access Required
            </Typography>
            <Typography variant="body2" color="grey.400" paragraph>
              Please allow camera access to scan barcodes
            </Typography>
            <Button 
              variant="contained" 
              onClick={initializeScanner}
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              Enable Camera
            </Button>
          </Box>
        )}

        {hasPermission === true && (
          <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            
            {/* Scanning overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <Box
                sx={{
                  width: 250,
                  height: 150,
                  border: '2px solid #4a9b8e',
                  borderRadius: 2,
                  position: 'relative',
                  '&::before, &::after': {
                    content: '""',
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    border: '3px solid #4a9b8e'
                  },
                  '&::before': {
                    top: -3,
                    left: -3,
                    borderRight: 'none',
                    borderBottom: 'none'
                  },
                  '&::after': {
                    bottom: -3,
                    right: -3,
                    borderLeft: 'none',
                    borderTop: 'none'
                  }
                }}
              />
            </Box>

            {/* Camera controls */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2
              }}
            >
              {devices.length > 1 && (
                <IconButton
                  onClick={switchCamera}
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              )}
              
              <IconButton
                onClick={toggleFlash}
                sx={{ 
                  bgcolor: 'rgba(0,0,0,0.5)', 
                  color: flashEnabled ? '#4a9b8e' : 'white',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                }}
              >
                {flashEnabled ? <FlashOnIcon /> : <FlashOffIcon />}
              </IconButton>
            </Box>
          </Box>
        )}

        {isScanning && hasPermission === null && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#4a9b8e', mb: 2 }} />
            <Typography variant="body2" color="grey.400">
              Initializing camera...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ bgcolor: '#1a1a1a', p: 2 }}>
        <Button onClick={handleClose} sx={{ color: 'grey.400' }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BarcodeScanner;
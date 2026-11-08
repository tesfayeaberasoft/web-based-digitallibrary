import React, { useState } from 'react';
import { useInstallPrompt } from '../contexts/InstallPromptContext';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Slide,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  Close,
  GetApp,
  PhoneIphone,
  DesktopMac,
  CheckCircle,
  InstallMobile,
} from '@mui/icons-material';

const DISMISSED_KEY = 'digital-library-install-dismissed-v2';

export default function InstallCard() {
  const { canInstall, isInstalled, promptToInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(
    () => window.localStorage.getItem(DISMISSED_KEY) === 'true'
  );
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Don't show if: already a PWA, user dismissed it, or just installed
  if (isInstalled || isDismissed || installed) return null;

  const handleInstall = async () => {
    if (canInstall) {
      // Native browser install dialog available — use it
      setInstalling(true);
      try {
        const outcome = await promptToInstall();
        if (outcome === 'accepted') {
          setInstalled(true);
        }
      } catch (err) {
        console.error('Install prompt failed:', err);
        setShowManual(true);
      } finally {
        setInstalling(false);
      }
    } else {
      // No native prompt available — show manual instructions
      setShowManual((v) => !v);
    }
  };

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  // Detect platform for tailored instructions
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isMacSafari = /macintosh/i.test(ua) && /safari/i.test(ua) && !/chrome/i.test(ua);
  const isAndroid = /android/i.test(ua);

  const getManualInstructions = () => {
    if (isIOS) {
      return [
        { icon: '📤', text: 'Tap the Share button in Safari\'s bottom toolbar' },
        { icon: '📱', text: 'Scroll down and tap "Add to Home Screen"' },
        { icon: '✅', text: 'Tap "Add" — the app icon appears on your home screen' },
      ];
    }
    if (isMacSafari) {
      return [
        { icon: '📁', text: 'In Safari, click File in the menu bar' },
        { icon: '🖥️', text: 'Choose "Add to Dock"' },
        { icon: '✅', text: 'The app launches like a native macOS app' },
      ];
    }
    if (isAndroid) {
      return [
        { icon: '⋮', text: 'Tap the three-dot menu in Chrome' },
        { icon: '📲', text: 'Tap "Add to Home screen" or "Install app"' },
        { icon: '✅', text: 'Tap "Add" to confirm' },
      ];
    }
    // Desktop Chrome/Edge
    return [
      { icon: '⬇️', text: 'Click the install icon (⊕) in your browser\'s address bar' },
      { icon: '🖥️', text: 'Or open the browser menu (⋮) and choose "Install app"' },
      { icon: '✅', text: 'Click "Install" to confirm' },
    ];
  };

  return (
    <Slide direction="up" in mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 12, sm: 24 },
          left: { xs: 12, sm: 'auto' },
          width: { xs: 'auto', sm: 360 },
          zIndex: 1500,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'rgba(45,106,79,0.2)',
          boxShadow: '0 16px 48px rgba(45,106,79,0.25)',
        }}
      >
        {/* Header gradient bar */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)',
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.4)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/digital-library-icon-192x192.png`}
              alt="App icon"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
              Install Digital Library
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Get the full app experience
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' } }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ p: 2.5, bgcolor: '#fff' }}>
          {/* Benefits */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {[
              { icon: <PhoneIphone sx={{ fontSize: 14 }} />, label: 'Works offline' },
              { icon: <DesktopMac sx={{ fontSize: 14 }} />, label: 'No browser UI' },
              { icon: <GetApp sx={{ fontSize: 14 }} />, label: 'Fast launch' },
            ].map((b) => (
              <Chip
                key={b.label}
                icon={b.icon}
                label={b.label}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 24,
                  bgcolor: '#f0fdf4',
                  color: '#2d6a4f',
                  border: '1px solid #d8f3dc',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: '#2d6a4f' },
                }}
              />
            ))}
          </Box>

          {/* Main CTA */}
          {canInstall ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={installing ? null : <InstallMobile />}
              onClick={handleInstall}
              disabled={installing}
              sx={{
                background: 'linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)',
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 15,
                py: 1.25,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(45,106,79,0.35)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(45,106,79,0.5)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {installing ? 'Opening installer…' : 'Install App'}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleInstall}
              sx={{
                borderColor: '#2d6a4f',
                color: '#2d6a4f',
                borderRadius: 2,
                fontWeight: 700,
                fontSize: 15,
                py: 1.25,
                textTransform: 'none',
                '&:hover': { bgcolor: '#f0fdf4', borderColor: '#2d6a4f' },
              }}
            >
              {showManual ? 'Hide Instructions' : 'How to Install'}
            </Button>
          )}

          {/* Manual instructions (shown when browser prompt unavailable) */}
          {showManual && !canInstall && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 1.5 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', display: 'block', mb: 1.5 }}>
                Install steps for your device:
              </Typography>
              {getManualInstructions().map((step, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    mb: 1,
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: '#f8fdfb',
                    border: '1px solid #e8f5e0',
                  }}
                >
                  <Typography sx={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{step.icon}</Typography>
                  <Typography variant="caption" sx={{ color: '#374151', lineHeight: 1.5 }}>
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* "Already installed?" small link */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
            <Typography
              variant="caption"
              onClick={handleDismiss}
              sx={{
                color: '#9ca3af',
                cursor: 'pointer',
                '&:hover': { color: '#6b7280', textDecoration: 'underline' },
              }}
            >
              Already installed? Dismiss
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
}

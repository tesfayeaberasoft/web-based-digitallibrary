/**
 * PersistentInstallCard
 *
 * Shows a floating install-prompt card at the bottom-right corner.
 *
 * Dismiss behaviour (per spec):
 *  - Clicking X hides the card for the current page-view only.
 *  - sessionStorage is used so the card reappears on every new
 *    page load / refresh, until the app is actually installed.
 *  - localStorage is intentionally NOT used for dismissal.
 *
 * Install behaviour:
 *  - If the browser has fired `beforeinstallprompt` (canInstall=true),
 *    clicking "Install" triggers the native browser install dialog.
 *  - Otherwise, platform-aware manual instructions are shown inline.
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Slide,
  Typography,
} from '@mui/material';
import {
  Close,
  DesktopMac,
  GetApp,
  InstallMobile,
  PhoneIphone,
} from '@mui/icons-material';

// ─── Session-scoped dismiss key (resets on every new page load) ────────────
const SESSION_DISMISSED_KEY = 'pwa-install-card-dismissed';

// ─── Module-level prompt capture ──────────────────────────────────────────
// We manage the deferred event here (outside React) so we can capture it
// before any component mounts, and re-expose it after navigation.
let _deferredPrompt = null;
const _listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    _listeners.forEach((fn) => fn(e));
  });

  window.addEventListener('appinstalled', () => {
    _deferredPrompt = null;
    _listeners.forEach((fn) => fn(null));
  });
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// ─── Platform detection ────────────────────────────────────────────────────
function getPlatformSteps() {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) {
    return [
      { icon: '📤', text: "Tap the Share button in Safari's bottom toolbar" },
      { icon: '📱', text: 'Scroll down and tap "Add to Home Screen"' },
      { icon: '✅', text: 'Tap "Add" — the app icon appears on your home screen' },
    ];
  }
  if (/macintosh/i.test(ua) && /safari/i.test(ua) && !/chrome/i.test(ua)) {
    return [
      { icon: '📁', text: 'In Safari, open the File menu' },
      { icon: '🖥️', text: 'Choose "Add to Dock"' },
      { icon: '✅', text: 'The app opens like a native macOS app' },
    ];
  }
  if (/android/i.test(ua)) {
    return [
      { icon: '⋮', text: 'Tap the three-dot menu in Chrome' },
      { icon: '📲', text: 'Tap "Add to Home screen" or "Install app"' },
      { icon: '✅', text: 'Tap "Add" to confirm' },
    ];
  }
  // Desktop Chrome / Edge / Brave
  return [
    { icon: '⬇️', text: 'Click the ⊕ install icon in the browser address bar' },
    { icon: '🖥️', text: 'Or open the browser menu (⋮) → "Install app"' },
    { icon: '✅', text: 'Click "Install" to confirm' },
  ];
}

// ══════════════════════════════════════════════════════════════════════════
export default function PersistentInstallCard() {
  // ── 1. Already running as installed PWA? Never show. ──────────────────
  const [alreadyInstalled] = useState(isStandalone);

  // ── 2. Dismissed this page-view? (session-scoped, resets on refresh) ──
  const [dismissed, setDismissed] = useState(
    () => window.sessionStorage.getItem(SESSION_DISMISSED_KEY) === '1'
  );

  // ── 3. Track the deferred prompt ──────────────────────────────────────
  const [prompt, setPrompt] = useState(_deferredPrompt);

  // ── 4. UI states ──────────────────────────────────────────────────────
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // Stay in sync with the module-level prompt (fires on navigation too)
  useEffect(() => {
    const handler = (e) => setPrompt(e); // null when appinstalled
    _listeners.add(handler);
    // Sync immediately in case the event was captured before mount
    if (_deferredPrompt) setPrompt(_deferredPrompt);
    return () => _listeners.delete(handler);
  }, []);

  // ── Visibility gate ───────────────────────────────────────────────────
  if (alreadyInstalled || dismissed || justInstalled) return null;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleInstall = async () => {
    if (prompt) {
      setInstalling(true);
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === 'accepted') {
          setJustInstalled(true);
          _deferredPrompt = null;
          setPrompt(null);
        }
      } catch (err) {
        console.error('[InstallCard] prompt() failed:', err);
        setShowSteps(true);
      } finally {
        setInstalling(false);
      }
    } else {
      setShowSteps((v) => !v);
    }
  };

  const handleDismiss = () => {
    // Only session-scoped — reappears on next page load / refresh
    window.sessionStorage.setItem(SESSION_DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const canInstall = Boolean(prompt);
  const steps = getPlatformSteps();

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <Slide direction="up" in mountOnEnter unmountOnExit timeout={350}>
      <Paper
        role="dialog"
        aria-label="Install Digital Library app"
        elevation={12}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 28 },
          right: { xs: 12, sm: 28 },
          left: { xs: 12, sm: 'auto' },
          width: { xs: 'auto', sm: 356 },
          zIndex: 1500,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(45,106,79,0.18)',
          boxShadow: '0 20px 60px rgba(45,106,79,0.22), 0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        {/* ── Gradient header ── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 55%, #52b788 100%)',
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {/* App icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.35)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/digital-library-icon-192x192.png`}
              alt=""
              aria-hidden="true"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>

          {/* Title */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.25, fontSize: 14 }}
            >
              Install Digital Library
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
              Add to your device for the best experience
            </Typography>
          </Box>

          {/* Close button — session dismiss only */}
          <IconButton
            size="small"
            onClick={handleDismiss}
            aria-label="Close install prompt"
            sx={{
              color: 'rgba(255,255,255,0.75)',
              flexShrink: 0,
              '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.15)' },
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: 2.5, pt: 2, pb: 2.5, bgcolor: '#ffffff' }}>
          {/* Benefit chips */}
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
            {[
              { icon: <PhoneIphone sx={{ fontSize: 13 }} />, label: 'Works offline' },
              { icon: <DesktopMac sx={{ fontSize: 13 }} />, label: 'No browser chrome' },
              { icon: <GetApp sx={{ fontSize: 13 }} />, label: 'Instant launch' },
            ].map((b) => (
              <Chip
                key={b.label}
                icon={b.icon}
                label={b.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 10,
                  fontWeight: 600,
                  bgcolor: '#f0fdf4',
                  color: '#1b4332',
                  border: '1px solid #b7e4c7',
                  '& .MuiChip-icon': { color: '#2d6a4f', ml: '6px' },
                }}
              />
            ))}
          </Box>

          {/* Primary CTA */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={canInstall && !installing ? <InstallMobile /> : undefined}
            onClick={handleInstall}
            disabled={installing}
            sx={{
              background: canInstall
                ? 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #52b788 100%)'
                : 'transparent',
              border: canInstall ? 'none' : '2px solid #2d6a4f',
              color: canInstall ? '#fff' : '#2d6a4f',
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 14,
              py: 1.1,
              textTransform: 'none',
              letterSpacing: 0.2,
              boxShadow: canInstall ? '0 4px 18px rgba(45,106,79,0.38)' : 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: canInstall
                  ? '0 6px 24px rgba(45,106,79,0.5)'
                  : '0 2px 8px rgba(45,106,79,0.15)',
                background: canInstall
                  ? 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #52b788 100%)'
                  : '#f0fdf4',
              },
              '&.Mui-disabled': { opacity: 0.7 },
            }}
          >
            {installing
              ? 'Opening installer…'
              : canInstall
              ? 'Install App'
              : showSteps
              ? 'Hide Instructions'
              : 'How to Install'}
          </Button>

          {/* Manual step-by-step instructions */}
          {showSteps && !canInstall && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ mb: 1.5, borderColor: '#e5f2eb' }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#374151', display: 'block', mb: 1.25, fontSize: 11 }}
              >
                STEPS FOR YOUR DEVICE
              </Typography>
              {steps.map((step, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                    mb: 0.75,
                    p: '8px 10px',
                    borderRadius: 1.5,
                    bgcolor: '#f8fdfb',
                    border: '1px solid #d8f3dc',
                  }}
                >
                  <Box sx={{ fontSize: 16, lineHeight: 1.2, flexShrink: 0, mt: '1px' }}>
                    {step.icon}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#374151', lineHeight: 1.55, fontSize: 12 }}>
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Dismiss link */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
            <Typography
              component="button"
              onClick={handleDismiss}
              sx={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: 11,
                p: 0,
                '&:hover': { color: '#6b7280', textDecoration: 'underline' },
              }}
            >
              Maybe later
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Slide>
  );
}

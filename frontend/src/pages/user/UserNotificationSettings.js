import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Switch, Button, Alert, Divider,
  Card, CardContent, Chip, Fade, CircularProgress, Avatar, Paper, Grow
} from '@mui/material';
import {
  Notifications as NotifIcon, Email as EmailIcon,
  Sms as SmsIcon, Schedule as ScheduleIcon,
  MonetizationOn as MoneyIcon, BookmarkBorder as ReservationIcon,
  Info as InfoIcon, CheckCircle, Save, Settings
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';

const C = {
  primary: '#2d6a4f', secondary: '#52b788',
  light: '#d8f3dc', lighter: '#f0fdf4',
  dark: '#1b4332', accent: '#95d5b2'
};

const GreenSwitch = ({ checked, onChange }) => (
  <Switch checked={checked} onChange={onChange}
    sx={{
      '& .MuiSwitch-switchBase.Mui-checked': { color: C.primary },
      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: C.secondary },
    }}
  />
);

export default function UserNotificationSettings() {
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [alert,   setAlert]   = useState({ show:false, msg:'', sev:'info' });
  const [settings, setSettings] = useState({
    email_enabled:              true,
    sms_enabled:                false,
    push_enabled:               true,
    due_reminder_days:          [3, 1],
    overdue_reminder_days:      [1, 3, 7],
    reservation_notifications:  true,
    fine_notifications:         true,
    general_notifications:      true,
  });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/notifications/settings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const d = await res.json();
        if (d.success && d.settings) setSettings(d.settings);
      }
    } catch { /* use defaults */ }
    finally { setLoading(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(settings)
      });
      const d = await res.json();
      flash(d.success ? 'Settings saved!' : d.message || 'Failed to save.', d.success ? 'success' : 'error');
    } catch { flash('Failed to save settings.', 'error'); }
    finally { setSaving(false); }
  };

  const flash = (msg, sev) => {
    setAlert({ show:true, msg, sev });
    setTimeout(() => setAlert({ show:false, msg:'', sev:'info' }), 4000);
  };

  const set  = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  const toggleDay = (type, day) => {
    const cur = settings[type] || [];
    set(type, cur.includes(day) ? cur.filter(d => d !== day) : [...cur, day].sort((a,b)=>a-b));
  };

  /* ── reusable toggle row ── */
  const ToggleRow = ({ icon, iconColor, label, sub, settingKey }) => (
    <Box sx={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      p:2, borderRadius:2, border:`1px solid ${C.light}`, mb:1.5,
      bgcolor: settings[settingKey] ? C.lighter : 'white',
      transition:'all 0.2s ease',
      '&:hover':{ borderColor: C.secondary, boxShadow:`0 2px 8px ${C.light}` }
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Avatar sx={{ width:40, height:40, bgcolor: settings[settingKey] ? iconColor : '#e5e7eb' }}>
          {React.cloneElement(icon, { sx:{ fontSize:20, color:'white' } })}
        </Avatar>
        <Box>
          <Typography variant="body1" fontWeight={700} sx={{ color: C.dark }}>{label}</Typography>
          {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
        </Box>
      </Box>
      <GreenSwitch checked={!!settings[settingKey]} onChange={e => set(settingKey, e.target.checked)} />
    </Box>
  );

  if (loading) return (
    <DashboardLayout title="Notification Settings">
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', flexDirection:'column', gap:2 }}>
        <CircularProgress size={56} sx={{ color:C.primary }} />
        <Typography color="text.secondary">Loading settings…</Typography>
      </Box>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Notification Settings">
      <Fade in timeout={500}>
        <Box>
          {/* header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{
              background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', mb:0.5
            }}>Notification Settings</Typography>
            <Typography variant="body1" color="text.secondary">
              Customize how and when you receive library notifications
            </Typography>
          </Box>

          {alert.show && (
            <Grow in timeout={300}>
              <Alert severity={alert.sev} icon={alert.sev === 'success' ? <CheckCircle /> : undefined}
                sx={{ mb:3, borderRadius:2, ...(alert.sev === 'success' ? { border:`1px solid ${C.secondary}`, bgcolor:C.lighter } : {}) }}>
                {alert.msg}
              </Alert>
            </Grow>
          )}

          <Grid container spacing={3}>
            {/* ── Delivery Methods ── */}
            <Grid item xs={12} md={6}>
              <Grow in timeout={400}>
                <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, height:'100%',
                  transition:'box-shadow 0.3s', '&:hover':{ boxShadow:`0 8px 24px ${C.light}` } }}>
                  <CardContent sx={{ p:3 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2.5 }}>
                      <Avatar sx={{ bgcolor:C.lighter, width:42, height:42 }}>
                        <NotifIcon sx={{ color:C.primary }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Delivery Methods</Typography>
                        <Typography variant="caption" color="text.secondary">Choose how to receive alerts</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2, borderColor:C.light }} />
                    <ToggleRow icon={<EmailIcon />} iconColor="#3b82f6" label="Email"
                      sub="Delivered to your registered email" settingKey="email_enabled" />
                    <ToggleRow icon={<SmsIcon />} iconColor="#8b5cf6" label="SMS"
                      sub="Requires a valid phone number in profile" settingKey="sms_enabled" />
                    <ToggleRow icon={<NotifIcon />} iconColor={C.secondary} label="In-App"
                      sub="Shown inside the library dashboard" settingKey="push_enabled" />
                    <Alert severity="info" sx={{ mt:2, borderRadius:2, fontSize:'0.8rem' }}>
                      SMS requires a valid phone number in your profile.
                    </Alert>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* ── Notification Types ── */}
            <Grid item xs={12} md={6}>
              <Grow in timeout={500}>
                <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, height:'100%',
                  transition:'box-shadow 0.3s', '&:hover':{ boxShadow:`0 8px 24px ${C.light}` } }}>
                  <CardContent sx={{ p:3 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2.5 }}>
                      <Avatar sx={{ bgcolor:C.lighter, width:42, height:42 }}>
                        <Settings sx={{ color:C.primary }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Notification Types</Typography>
                        <Typography variant="caption" color="text.secondary">Choose what to be notified about</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2, borderColor:C.light }} />
                    <ToggleRow icon={<ReservationIcon />} iconColor={C.primary} label="Reservation Updates"
                      sub="When your reserved book becomes available" settingKey="reservation_notifications" />
                    <ToggleRow icon={<MoneyIcon />} iconColor="#f59e0b" label="Fine Reminders"
                      sub="Alerts about outstanding fines" settingKey="fine_notifications" />
                    <ToggleRow icon={<InfoIcon />} iconColor="#3b82f6" label="General Announcements"
                      sub="Library news and updates" settingKey="general_notifications" />
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* ── Due Date Reminders ── */}
            <Grid item xs={12} md={6}>
              <Grow in timeout={600}>
                <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3,
                  transition:'box-shadow 0.3s', '&:hover':{ boxShadow:`0 8px 24px ${C.light}` } }}>
                  <CardContent sx={{ p:3 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2.5 }}>
                      <Avatar sx={{ bgcolor:C.lighter, width:42, height:42 }}>
                        <ScheduleIcon sx={{ color:C.primary }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Due Date Reminders</Typography>
                        <Typography variant="caption" color="text.secondary">Remind me before books are due</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2.5, borderColor:C.light }} />
                    <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.2, mb:2 }}>
                      {[7, 3, 1].map(d => {
                        const active = settings.due_reminder_days?.includes(d);
                        return (
                          <Chip key={d} label={`${d} day${d > 1 ? 's' : ''} before`}
                            onClick={() => toggleDay('due_reminder_days', d)}
                            sx={{
                              cursor:'pointer', fontWeight:700, px:1,
                              bgcolor: active ? C.primary : C.lighter,
                              color:   active ? 'white'   : C.primary,
                              border:  `2px solid ${active ? C.primary : C.light}`,
                              transition:'all 0.2s ease',
                              '&:hover':{ bgcolor: active ? C.dark : C.light, borderColor: active ? C.dark : C.secondary }
                            }} />
                        );
                      })}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {settings.due_reminder_days?.length || 0} reminder{settings.due_reminder_days?.length !== 1 ? 's' : ''} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* ── Overdue Alerts ── */}
            <Grid item xs={12} md={6}>
              <Grow in timeout={700}>
                <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3,
                  transition:'box-shadow 0.3s', '&:hover':{ boxShadow:`0 8px 24px ${C.light}` } }}>
                  <CardContent sx={{ p:3 }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2.5 }}>
                      <Avatar sx={{ bgcolor:'#fef2f2', width:42, height:42 }}>
                        <ScheduleIcon sx={{ color:'#ef4444' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Overdue Alerts</Typography>
                        <Typography variant="caption" color="text.secondary">Alert me after books become overdue</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2.5, borderColor:C.light }} />
                    <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.2, mb:2 }}>
                      {[1, 3, 7, 14].map(d => {
                        const active = settings.overdue_reminder_days?.includes(d);
                        return (
                          <Chip key={d} label={`${d} day${d > 1 ? 's' : ''} after`}
                            onClick={() => toggleDay('overdue_reminder_days', d)}
                            sx={{
                              cursor:'pointer', fontWeight:700, px:1,
                              bgcolor: active ? '#ef4444' : '#fef2f2',
                              color:   active ? 'white'  : '#ef4444',
                              border:  `2px solid ${active ? '#ef4444' : '#fecaca'}`,
                              transition:'all 0.2s ease',
                              '&:hover':{ bgcolor: active ? '#dc2626' : '#fee2e2', borderColor:'#ef4444' }
                            }} />
                        );
                      })}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {settings.overdue_reminder_days?.length || 0} alert{settings.overdue_reminder_days?.length !== 1 ? 's' : ''} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* ── Save ── */}
            <Grid item xs={12}>
              <Grow in timeout={800}>
                <Paper elevation={0} sx={{
                  p:3, borderRadius:3, textAlign:'center',
                  background:`linear-gradient(135deg,${C.lighter},white)`,
                  border:`2px solid ${C.light}`
                }}>
                  <Button variant="contained" size="large" onClick={saveSettings} disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} sx={{ color:'white' }} /> : <Save />}
                    sx={{
                      background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
                      color:'white', fontWeight:700, px:6, py:1.5, borderRadius:2,
                      boxShadow:`0 4px 16px rgba(45,106,79,.35)`,
                      '&:hover':{ background:`linear-gradient(135deg,${C.dark},${C.primary})`,
                        transform:'translateY(-2px)', boxShadow:`0 8px 24px rgba(45,106,79,.45)` },
                      '&.Mui-disabled':{ opacity:0.5 }, transition:'all 0.3s ease', minWidth:200
                    }}>
                    {saving ? 'Saving…' : 'Save Settings'}
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt:1.5 }}>
                    Changes apply immediately for future notifications
                  </Typography>
                </Paper>
              </Grow>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

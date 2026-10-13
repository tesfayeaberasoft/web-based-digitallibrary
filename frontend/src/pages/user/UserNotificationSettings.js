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
      width: 48,
      height: 28,
      p: 0,
      overflow: 'visible',
      '& .MuiSwitch-switchBase': {
        p: '3px',
        transition: 'transform 220ms cubic-bezier(.2,.8,.2,1)',
        '&.Mui-checked': {
          transform: 'translateX(20px)',
          color: '#fff',
          '& + .MuiSwitch-track': {
            bgcolor: C.primary,
            opacity: 1,
            border: `1px solid ${C.primary}`,
          },
        },
      },
      '& .MuiSwitch-thumb': {
        width: 22,
        height: 22,
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.18)',
      },
      '& .MuiSwitch-track': {
        borderRadius: 14,
        bgcolor: '#e4e9e6',
        opacity: 1,
        border: '1px solid #d9e1dc',
        transition: 'background-color 220ms ease, border-color 220ms ease',
      },
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
      p:{ xs:1.5, sm:2 }, borderRadius:2.5, border:'1px solid',
      borderColor: settings[settingKey] ? '#c9dfd1' : '#e8ede9', mb:1.25,
      bgcolor: settings[settingKey] ? '#f7fbf8' : '#fff',
      transition:'border-color 180ms ease, background-color 180ms ease, transform 180ms ease',
      '&:hover':{ borderColor:'#b5d3c1', transform:'translateY(-1px)' }
    }}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Avatar sx={{
          width:42, height:42,
          bgcolor: settings[settingKey] ? `${iconColor}18` : '#f1f3f2',
          color: settings[settingKey] ? iconColor : '#89948d',
          border: '1px solid',
          borderColor: settings[settingKey] ? `${iconColor}30` : '#e8ece9',
          transition:'all 180ms ease',
        }}>
          {React.cloneElement(icon, { sx:{ fontSize:20, color:'inherit' } })}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={650} sx={{ color:'#20352a', letterSpacing:'-0.01em' }}>{label}</Typography>
          {sub && <Typography variant="caption" sx={{ color:'#748078', display:'block', mt:0.25, lineHeight:1.45 }}>{sub}</Typography>}
        </Box>
      </Box>
      <GreenSwitch checked={!!settings[settingKey]} onChange={e => set(settingKey, e.target.checked)} />
    </Box>
  );

  if (loading) return (
    <DashboardLayout title="Notification Settings">
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', flexDirection:'column', gap:2 }}>
        <CircularProgress size={42} thickness={4} sx={{ color:C.primary }} />
        <Typography variant="body2" sx={{ color:'#748078', fontWeight:500 }}>Loading your preferences…</Typography>
      </Box>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Notification Settings">
      <Fade in timeout={500}>
        <Box>
          {/* header */}
          <Box sx={{ mb: { xs:3, md:4 }, display:'flex', alignItems:{ xs:'flex-start', sm:'center' }, gap:2 }}>
            <Avatar sx={{
              width:52, height:52, borderRadius:2.5,
              bgcolor:'#eaf4ed', color:C.primary,
              border:'1px solid #d9e9de',
            }}>
              <NotifIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={750} sx={{
                color:'#20352a', letterSpacing:'-0.035em', mb:0.5,
                fontSize:{ xs:'1.7rem', sm:'2rem' }, lineHeight:1.2
              }}>Notification Settings</Typography>
              <Typography variant="body2" sx={{ color:'#748078', lineHeight:1.6 }}>
                Customize how and when you receive library notifications
              </Typography>
            </Box>
          </Box>

          {alert.show && (
            <Grow in timeout={300}>
              <Alert severity={alert.sev} icon={alert.sev === 'success' ? <CheckCircle /> : undefined}
                sx={{ mb:3, borderRadius:2.5, border:'1px solid', borderColor:alert.sev === 'success' ? '#c9dfd1' : undefined,
                  ...(alert.sev === 'success' ? { bgcolor:'#f2f8f4' } : {}) }}>
                {alert.msg}
              </Alert>
            </Grow>
          )}

          <Grid container spacing={3}>
            {/* ── Delivery Methods ── */}
            <Grid item xs={12} md={6}>
              <Grow in timeout={400}>
                <Card elevation={0} sx={{ border:'1px solid #e5ebe7', borderRadius:3, height:'100%', bgcolor:'#fff',
                  boxShadow:'0 1px 2px rgba(16,24,40,.025)',
                  transition:'border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease',
                  '&:hover':{ borderColor:'#c8d9ce', boxShadow:'0 12px 32px rgba(32,53,42,.07)', transform:'translateY(-2px)' } }}>
                  <CardContent sx={{ p:{ xs:2.25, sm:3 } }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
                      <Avatar sx={{ bgcolor:'#edf5ef', width:42, height:42, borderRadius:2, color:C.primary }}>
                        <NotifIcon sx={{ color:C.primary }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color:'#20352a', letterSpacing:'-0.015em' }}>Delivery Methods</Typography>
                        <Typography variant="caption" sx={{ color:'#748078' }}>Choose how to receive alerts</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2, borderColor:'#edf0ee' }} />
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
                <Card elevation={0} sx={{ border:'1px solid #e5ebe7', borderRadius:3, height:'100%', bgcolor:'#fff',
                  boxShadow:'0 1px 2px rgba(16,24,40,.025)',
                  transition:'border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease',
                  '&:hover':{ borderColor:'#c8d9ce', boxShadow:'0 12px 32px rgba(32,53,42,.07)', transform:'translateY(-2px)' } }}>
                  <CardContent sx={{ p:{ xs:2.25, sm:3 } }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
                      <Avatar sx={{ bgcolor:'#edf5ef', width:42, height:42, borderRadius:2, color:C.primary }}>
                        <Settings sx={{ color:C.primary }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color:'#20352a', letterSpacing:'-0.015em' }}>Notification Types</Typography>
                        <Typography variant="caption" sx={{ color:'#748078' }}>Choose what to be notified about</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2, borderColor:'#edf0ee' }} />
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
                <Card elevation={0} sx={{ border:'1px solid #e5ebe7', borderRadius:3, bgcolor:'#fff',
                  boxShadow:'0 1px 2px rgba(16,24,40,.025)',
                  transition:'border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease',
                  '&:hover':{ borderColor:'#c8d9ce', boxShadow:'0 12px 32px rgba(32,53,42,.07)', transform:'translateY(-2px)' } }}>
                  <CardContent sx={{ p:{ xs:2.25, sm:3 } }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
                      <Avatar sx={{ bgcolor:'#edf5ef', width:42, height:42, borderRadius:2, color:C.primary }}>
                        <ScheduleIcon sx={{ color:C.primary }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color:'#20352a', letterSpacing:'-0.015em' }}>Due Date Reminders</Typography>
                        <Typography variant="caption" sx={{ color:'#748078' }}>Remind me before books are due</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2.5, borderColor:'#edf0ee' }} />
                    <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.2, mb:2 }}>
                      {[7, 3, 1].map(d => {
                        const active = settings.due_reminder_days?.includes(d);
                        return (
                          <Chip key={d} label={`${d} day${d > 1 ? 's' : ''} before`}
                            onClick={() => toggleDay('due_reminder_days', d)}
                            sx={{
                              cursor:'pointer', fontWeight:600, px:0.7, height:34, borderRadius:2,
                              bgcolor: active ? '#e8f2eb' : '#fff',
                              color: active ? C.primary : '#66736b',
                              border: `1px solid ${active ? '#b9d4c2' : '#e4e9e6'}`,
                              transition:'all 180ms ease',
                              '&:hover':{ bgcolor: active ? '#dcece1' : '#f6f8f6', borderColor:'#a9cbb5', transform:'translateY(-1px)' }
                            }} />
                        );
                      })}
                    </Box>
                    <Typography variant="caption" sx={{ color:'#748078' }}>
                      {settings.due_reminder_days?.length || 0} reminder{settings.due_reminder_days?.length !== 1 ? 's' : ''} selected
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>

            {/* ── Overdue Alerts ── */}
            <Grid item xs={12} md={6}>
              <Grow in timeout={700}>
                <Card elevation={0} sx={{ border:'1px solid #e5ebe7', borderRadius:3, bgcolor:'#fff',
                  boxShadow:'0 1px 2px rgba(16,24,40,.025)',
                  transition:'border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease',
                  '&:hover':{ borderColor:'#c8d9ce', boxShadow:'0 12px 32px rgba(32,53,42,.07)', transform:'translateY(-2px)' } }}>
                  <CardContent sx={{ p:{ xs:2.25, sm:3 } }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
                      <Avatar sx={{ bgcolor:'#fff1f0', width:42, height:42, borderRadius:2 }}>
                        <ScheduleIcon sx={{ color:'#ef4444' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color:'#20352a', letterSpacing:'-0.015em' }}>Overdue Alerts</Typography>
                        <Typography variant="caption" sx={{ color:'#748078' }}>Alert me after books become overdue</Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb:2.5, borderColor:'#edf0ee' }} />
                    <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.2, mb:2 }}>
                      {[1, 3, 7, 14].map(d => {
                        const active = settings.overdue_reminder_days?.includes(d);
                        return (
                          <Chip key={d} label={`${d} day${d > 1 ? 's' : ''} after`}
                            onClick={() => toggleDay('overdue_reminder_days', d)}
                            sx={{
                              cursor:'pointer', fontWeight:600, px:0.7, height:34, borderRadius:2,
                              bgcolor: active ? '#fff0ee' : '#fff',
                              color: active ? '#b9382f' : '#66736b',
                              border: `1px solid ${active ? '#f0c4bf' : '#e4e9e6'}`,
                              transition:'all 180ms ease',
                              '&:hover':{ bgcolor: active ? '#ffe5e1' : '#f6f8f6', borderColor:'#e7aaa3', transform:'translateY(-1px)' }
                            }} />
                        );
                      })}
                    </Box>
                    <Typography variant="caption" sx={{ color:'#748078' }}>
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
                  p:{ xs:2.5, sm:3 }, borderRadius:3, textAlign:'center',
                  background:'#f8fbf9',
                  border:'1px solid #e3ebe5'
                }}>
                  <Button variant="contained" size="large" onClick={saveSettings} disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} sx={{ color:'white' }} /> : <Save />}
                    sx={{
                      background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
                      color:'white', fontWeight:650, letterSpacing:'0.005em',
                      px:{ xs:4, sm:5 }, py:1.35, borderRadius:2.25,
                      boxShadow:'0 3px 8px rgba(45,106,79,.18)',
                      '&:hover':{ background:`linear-gradient(135deg,${C.dark},${C.primary})`,
                        transform:'translateY(-1px)', boxShadow:'0 6px 14px rgba(45,106,79,.24)' },
                      '&.Mui-disabled':{ opacity:0.55 }, transition:'all 200ms ease', minWidth:200
                    }}>
                    {saving ? 'Saving…' : 'Save Settings'}
                  </Button>
                  <Typography variant="caption" sx={{ mt:1.5, display:'block', color:'#748078' }}>
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

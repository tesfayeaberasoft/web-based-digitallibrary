import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Chip,
  LinearProgress, CircularProgress, Alert, Paper, Fade, Grow
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  MenuBook as BookIcon,
  LocalFireDepartment as FireIcon,
  AccessTime as TimeIcon,
  Stars as StarsIcon,
  WorkspacePremium
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const C = {
  primary: '#2d6a4f', secondary: '#52b788',
  light: '#d8f3dc', lighter: '#f0fdf4',
  dark: '#1b4332', accent: '#95d5b2'
};

const ACHIEVEMENTS = (s) => [
  { id:1, name:'First Book',        desc:'Read your first book',            icon:'book', type:'books_read',    target:1,   pts:10,  earned: s?.books_read >= 1 },
  { id:2, name:'Bookworm',          desc:'Read 5 books',                    icon:'book', type:'books_read',    target:5,   pts:25,  earned: s?.books_read >= 5 },
  { id:3, name:'Book Master',       desc:'Read 10 books',                   icon:'book', type:'books_read',    target:10,  pts:50,  earned: s?.books_read >= 10 },
  { id:4, name:'Book Legend',       desc:'Read 25 books',                   icon:'book', type:'books_read',    target:25,  pts:100, earned: s?.books_read >= 25 },
  { id:5, name:'Reading Streak',    desc:'Maintain a 7-day reading streak', icon:'fire', type:'reading_streak',target:7,   pts:30,  earned: s?.reading_streak >= 7 },
  { id:6, name:'Dedicated Reader',  desc:'30-day reading streak',           icon:'fire', type:'reading_streak',target:30,  pts:100, earned: s?.reading_streak >= 30 },
  { id:7, name:'Time Traveler',     desc:'Spend 100 hours reading',         icon:'time', type:'total_hours',   target:100, pts:75,  earned: s?.total_hours >= 100 },
  { id:8, name:'Reading Marathon',  desc:'Spend 500 hours reading',         icon:'time', type:'total_hours',   target:500, pts:200, earned: s?.total_hours >= 500 },
];

const ICON_MAP = {
  book: <BookIcon />,
  fire: <FireIcon />,
  time: <TimeIcon />,
};

const CARD_THEME = {
  book: { earned: { grad:`linear-gradient(135deg,${C.lighter},${C.light})`, border:C.secondary, icon:C.primary },
          locked: { grad:`linear-gradient(135deg,#f0fdf4,#dcfce7)`,         border:`${C.secondary}60`, icon:C.secondary } },
  fire: { earned: { grad:'linear-gradient(135deg,#fff7ed,#ffedd5)', border:'#f97316', icon:'#ea580c' },
          locked: { grad:'linear-gradient(135deg,#fff7ed,#fef3c7)', border:'#f9731660', icon:'#f97316' } },
  time: { earned: { grad:'linear-gradient(135deg,#f5f3ff,#ede9fe)', border:'#8b5cf6', icon:'#7c3aed' },
          locked: { grad:'linear-gradient(135deg,#f5f3ff,#f0fdf4)', border:'#8b5cf660', icon:'#8b5cf6' } },
};

export default function UserAchievements() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const token   = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) { setError('Please login.'); return; }
      const { id } = JSON.parse(userStr);
      const { data } = await axios.get(`http://localhost:8000/api/users/${id}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setStats(data.stats);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load achievements');
    } finally { setLoading(false); }
  };

  if (loading) return (
    <DashboardLayout title="Achievements">
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh', flexDirection:'column', gap:2 }}>
        <CircularProgress size={60} sx={{ color: C.primary }} />
        <Typography color="text.secondary">Loading achievements…</Typography>
      </Box>
    </DashboardLayout>
  );

  const list     = ACHIEVEMENTS(stats);
  const earned   = list.filter(a => a.earned);
  const locked   = list.filter(a => !a.earned);
  const totalPts = earned.reduce((s, a) => s + a.pts, 0);
  const pct      = Math.round((earned.length / list.length) * 100);

  const getProgress = (a) => {
    if (!stats) return 0;
    const cur = stats[a.type === 'books_read' ? 'books_read' : a.type === 'reading_streak' ? 'reading_streak' : 'total_hours'] || 0;
    return { pct: Math.min(100, (cur / a.target) * 100), cur };
  };

  return (
    <DashboardLayout title="Achievements">
      <Fade in timeout={500}>
        <Box>
          {/* ── header ── */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', mb:0.5
            }}>
              Achievements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your reading milestones and unlock badges
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb:3, borderRadius:2 }}>{error}</Alert>}

          {/* ── summary strip ── */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {[
              { icon:<TrophyIcon/>,        label:'Earned',       value:`${earned.length}/${list.length}`, color:C.primary,  grad:`linear-gradient(135deg,${C.primary},${C.secondary})` },
              { icon:<StarsIcon/>,         label:'Total Points', value:totalPts,                          color:'#f59e0b',  grad:'linear-gradient(135deg,#f59e0b,#fbbf24)' },
              { icon:<LockIcon/>,          label:'Locked',       value:locked.length,                     color:'#8b5cf6',  grad:'linear-gradient(135deg,#8b5cf6,#a78bfa)' },
              { icon:<WorkspacePremium/>,  label:'Completion',   value:`${pct}%`,                         color:C.secondary,grad:`linear-gradient(135deg,${C.secondary},${C.accent})` },
            ].map((s, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Grow in timeout={400 + i * 120}>
                  <Card elevation={0} sx={{
                    border:`2px solid ${s.color}30`, borderRadius:3,
                    transition:'all 0.3s ease',
                    '&:hover':{ transform:'translateY(-6px)', boxShadow:`0 16px 32px ${s.color}25`, borderColor:s.color }
                  }}>
                    <CardContent sx={{ p:2.5, textAlign:'center' }}>
                      <Avatar sx={{ width:52, height:52, mx:'auto', mb:1.5, background:s.grad }}>
                        {React.cloneElement(s.icon, { sx:{ color:'white', fontSize:26 } })}
                      </Avatar>
                      <Typography variant="h4" fontWeight={900} sx={{ color:s.color, letterSpacing:-1 }}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* ── overall progress bar ── */}
          <Paper elevation={0} sx={{ p:3, mb:4, borderRadius:3, border:`2px solid ${C.light}`,
            background:`linear-gradient(135deg,${C.lighter},white)` }}>
            <Box sx={{ display:'flex', justifyContent:'space-between', mb:1.5 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color:C.dark }}>Overall Progress</Typography>
              <Typography variant="subtitle1" fontWeight={800} sx={{ color:C.primary }}>{earned.length} / {list.length}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={pct} sx={{
              height:14, borderRadius:7, bgcolor:C.light,
              '& .MuiLinearProgress-bar':{ background:`linear-gradient(90deg,${C.primary},${C.secondary})`, borderRadius:7 }
            }} />
            <Typography variant="caption" color="text.secondary" sx={{ mt:1, display:'block' }}>
              {pct}% of achievements unlocked · {totalPts} points earned
            </Typography>
          </Paper>

          {/* ── earned section ── */}
          {earned.length > 0 && (
            <>
              <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2.5 }}>
                <CheckIcon sx={{ color:C.secondary }} />
                <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Unlocked ({earned.length})</Typography>
              </Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {earned.map((a, i) => {
                  const theme = CARD_THEME[a.icon]?.earned || CARD_THEME.book.earned;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={a.id}>
                      <Grow in timeout={400 + i * 100}>
                        <Card elevation={0} sx={{
                          height:'100%', background:theme.grad,
                          border:`2px solid ${theme.border}`,
                          borderRadius:3, position:'relative', overflow:'visible',
                          transition:'all 0.3s ease',
                          '&:hover':{ transform:'translateY(-8px) scale(1.02)', boxShadow:`0 20px 40px ${theme.border}30` }
                        }}>
                          {/* checkmark badge */}
                          <Box sx={{
                            position:'absolute', top:-12, right:-12,
                            width:40, height:40, borderRadius:'50%',
                            background:`linear-gradient(135deg,${C.secondary},${C.primary})`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow:`0 4px 12px ${C.primary}50`
                          }}>
                            <CheckIcon sx={{ color:'white', fontSize:22 }} />
                          </Box>
                          <CardContent sx={{ p:3 }}>
                            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2 }}>
                              <Avatar sx={{ width:60, height:60, bgcolor:theme.icon, boxShadow:`0 4px 12px ${theme.icon}40` }}>
                                {React.cloneElement(ICON_MAP[a.icon] || <TrophyIcon/>, { sx:{ color:'white', fontSize:30 } })}
                              </Avatar>
                              <Chip label={`${a.pts} pts`} size="small"
                                sx={{ bgcolor:`${theme.icon}20`, color:theme.icon, fontWeight:700, border:`1px solid ${theme.icon}40` }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} sx={{ color:C.dark, mb:0.5 }}>{a.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb:2 }}>{a.desc}</Typography>
                            <Box sx={{ px:2, py:1.5, borderRadius:2, bgcolor:`${theme.icon}10`,
                              border:`1px solid ${theme.icon}30`, display:'flex', alignItems:'center', gap:1 }}>
                              <CheckIcon sx={{ color:theme.icon, fontSize:18 }} />
                              <Typography variant="body2" fontWeight={700} sx={{ color:theme.icon }}>🎉 Unlocked!</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}

          {/* ── locked section ── */}
          {locked.length > 0 && (
            <>
              <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2.5 }}>
                <LockIcon sx={{ color:'#9ca3af' }} />
                <Typography variant="h6" fontWeight={700} sx={{ color:C.dark }}>Locked ({locked.length})</Typography>
              </Box>
              <Grid container spacing={3}>
                {locked.map((a, i) => {
                  const theme = CARD_THEME[a.icon]?.locked || CARD_THEME.book.locked;
                  const { pct: p, cur } = getProgress(a);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={a.id}>
                      <Grow in timeout={400 + i * 100}>
                        <Card elevation={0} sx={{
                          height:'100%', background:theme.grad,
                          border:`2px solid ${theme.border}`,
                          borderRadius:3, opacity:0.88,
                          transition:'all 0.3s ease',
                          '&:hover':{ transform:'translateY(-6px)', opacity:1, boxShadow:`0 16px 32px ${theme.border}20` }
                        }}>
                          <CardContent sx={{ p:3 }}>
                            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2 }}>
                              <Avatar sx={{ width:60, height:60, bgcolor:`${theme.icon}25`, border:`2px dashed ${theme.icon}60` }}>
                                {React.cloneElement(ICON_MAP[a.icon] || <TrophyIcon/>, { sx:{ color:theme.icon, fontSize:30 } })}
                              </Avatar>
                              <Chip label={`${a.pts} pts`} size="small"
                                sx={{ bgcolor:`${theme.icon}15`, color:theme.icon, fontWeight:700, border:`1px solid ${theme.icon}40` }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} sx={{ color:C.dark, mb:0.5 }}>{a.name}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb:2.5 }}>{a.desc}</Typography>
                            <Box sx={{ mb:0.8, display:'flex', justifyContent:'space-between' }}>
                              <Typography variant="caption" fontWeight={600} sx={{ color:theme.icon }}>Progress</Typography>
                              <Typography variant="caption" fontWeight={700} sx={{ color:theme.icon }}>{cur} / {a.target}</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={p} sx={{
                              height:10, borderRadius:5, bgcolor:`${theme.icon}15`,
                              '& .MuiLinearProgress-bar':{ bgcolor:theme.icon, borderRadius:5 }
                            }} />
                            <Typography variant="caption" color="text.secondary" sx={{ mt:0.8, display:'block' }}>
                              {Math.round(p)}% complete
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}

          {/* ── zero state ── */}
          {earned.length === 0 && !error && (
            <Fade in timeout={600}>
              <Paper elevation={0} sx={{ textAlign:'center', py:10, mt:2, borderRadius:3,
                background:`linear-gradient(135deg,${C.lighter},white)`, border:`2px dashed ${C.secondary}` }}>
                <Avatar sx={{ width:100, height:100, mx:'auto', mb:3,
                  background:`linear-gradient(135deg,${C.primary},${C.secondary})` }}>
                  <TrophyIcon sx={{ fontSize:56, color:'white' }} />
                </Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color:C.dark, mb:1 }}>No achievements yet</Typography>
                <Typography variant="body1" color="text.secondary">Start reading books to unlock your first badge! 📚</Typography>
              </Paper>
            </Fade>
          )}
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

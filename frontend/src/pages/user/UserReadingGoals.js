import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, LinearProgress,
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Chip, Avatar, Paper, Fade, Grow, Divider,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingIcon, Add as AddIcon,
  CheckCircle as CheckIcon, Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon, Edit as EditIcon,
  Delete as DeleteIcon, CalendarToday as CalendarIcon,
  LocalFireDepartment as FireIcon, Close, FlagOutlined,
  Cancel as CancelIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

const C = {
  primary: '#2d6a4f', secondary: '#52b788',
  light: '#d8f3dc', lighter: '#f0fdf4',
  dark: '#1b4332', accent: '#95d5b2'
};

const gradBtn = (outline = false) => outline ? {
  borderColor: C.secondary, color: C.primary, fontWeight: 700, borderRadius: 2,
  '&:hover': { borderColor: C.primary, bgcolor: C.lighter }, transition: 'all 0.2s'
} : {
  background: `linear-gradient(135deg,${C.primary},${C.secondary})`, color: 'white',
  fontWeight: 700, borderRadius: 2, boxShadow: `0 4px 12px rgba(45,106,79,.3)`,
  '&:hover': { background: `linear-gradient(135deg,${C.dark},${C.primary})`, transform: 'translateY(-2px)' },
  '&.Mui-disabled': { opacity: 0.5 }, transition: 'all 0.3s'
};

const TYPE_COLOR = {
  weekly:  { color: C.secondary,  grad: `linear-gradient(135deg,${C.secondary},${C.accent})` },
  monthly: { color: C.primary,    grad: `linear-gradient(135deg,${C.primary},${C.secondary})` },
  yearly:  { color: '#8b5cf6',    grad: 'linear-gradient(135deg,#8b5cf6,#a78bfa)' },
};

export default function UserReadingGoals() {
  const { user } = useAuth();
  const [goals,         setGoals]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [editingGoal,   setEditingGoal]   = useState(null);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [goalToDelete,  setGoalToDelete]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);

  const [formData, setFormData] = useState({
    goal_type: 'monthly', target_books: 5,
    start_date: new Date().toISOString().split('T')[0], end_date: ''
  });

  useEffect(() => { fetchGoals(); }, []);

  /* auto-calc end date */
  useEffect(() => {
    if (!formData.start_date) return;
    const d = new Date(formData.start_date);
    if (formData.goal_type === 'weekly')  d.setDate(d.getDate() + 7);
    if (formData.goal_type === 'monthly') d.setMonth(d.getMonth() + 1);
    if (formData.goal_type === 'yearly')  d.setFullYear(d.getFullYear() + 1);
    setFormData(p => ({ ...p, end_date: d.toISOString().split('T')[0] }));
  }, [formData.goal_type, formData.start_date]);

  const fetchGoals = async () => {
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 400));
    setGoals([
      { id:1, goal_type:'monthly', target_books:5,  current_progress:3,  start_date:'2026-05-01', end_date:'2026-05-31', status:'active' },
      { id:2, goal_type:'yearly',  target_books:50, current_progress:23, start_date:'2026-01-01', end_date:'2026-12-31', status:'active' },
    ]);
    setLoading(false);
  };

  const openAdd  = () => { setEditingGoal(null); setFormData({ goal_type:'monthly', target_books:5, start_date:new Date().toISOString().split('T')[0], end_date:'' }); setDialogOpen(true); };
  const openEdit = (g) => { setEditingGoal(g); setFormData({ goal_type:g.goal_type, target_books:g.target_books, start_date:g.start_date, end_date:g.end_date }); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditingGoal(null); setError(''); };

  const handleSave = async () => {
    if (formData.target_books < 1) { setError('Target must be at least 1 book'); return; }
    setSaving(true); setError(''); setSuccess('');
    await new Promise(r => setTimeout(r, 400));
    if (editingGoal) {
      setGoals(gs => gs.map(g => g.id === editingGoal.id ? { ...g, ...formData } : g));
      setSuccess('Goal updated successfully!');
    } else {
      setGoals(gs => [...gs, { id: Date.now(), ...formData, current_progress:0, status:'active' }]);
      setSuccess('Goal created successfully!');
    }
    setSaving(false); closeDialog();
  };

  const handleDelete = async () => {
    if (!goalToDelete) return;
    setDeleting(true);
    await new Promise(r => setTimeout(r, 400));
    setGoals(gs => gs.filter(g => g.id !== goalToDelete.id));
    setSuccess('Goal deleted.');
    setDeleting(false); setDeleteOpen(false); setGoalToDelete(null);
  };

  const pct       = (g) => Math.min(100, (g.current_progress / g.target_books) * 100);
  const daysLeft  = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);
  const typeLabel = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  const cardStatus = (g) => {
    const p = pct(g), dl = daysLeft(g.end_date);
    if (p >= 100) return { label:'Completed', color:C.secondary, icon:<CheckIcon sx={{ fontSize:14 }} /> };
    if (dl < 0)   return { label:'Expired',   color:'#ef4444',   icon:<CancelIcon sx={{ fontSize:14 }} /> };
    if (dl <= 7)  return { label:'Ending Soon',color:'#f59e0b',  icon:<ScheduleIcon sx={{ fontSize:14 }} /> };
    return             { label:'Active',     color:C.primary,   icon:<TrendingIcon sx={{ fontSize:14 }} /> };
  };

  /* derived summary */
  const completed  = goals.filter(g => pct(g) >= 100).length;
  const totalTarget= goals.reduce((s, g) => s + g.target_books, 0);
  const totalDone  = goals.reduce((s, g) => s + g.current_progress, 0);

  return (
    <DashboardLayout title="Reading Goals">
      <Fade in timeout={500}>
        <Box>
          {/* header */}
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:4, flexWrap:'wrap', gap:2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{
                background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', mb:0.5
              }}>Reading Goals</Typography>
              <Typography variant="body1" color="text.secondary">Set targets and track your reading journey</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}
              sx={{ ...gradBtn(), px:3, py:1.3 }}>New Goal</Button>
          </Box>

          {success && <Alert severity="success" onClose={() => setSuccess('')}
            sx={{ mb:3, borderRadius:2, border:`1px solid ${C.secondary}`, bgcolor:C.lighter }}>{success}</Alert>}
          {error && !dialogOpen && <Alert severity="error" onClose={() => setError('')}
            sx={{ mb:3, borderRadius:2 }}>{error}</Alert>}

          {/* summary pills */}
          {goals.length > 0 && (
            <Grid container spacing={2.5} sx={{ mb:4 }}>
              {[
                { label:'Total Goals',  value:goals.length,   icon:<FlagOutlined/>,   grad:`linear-gradient(135deg,${C.primary},${C.secondary})` },
                { label:'Completed',    value:completed,      icon:<CheckIcon/>,      grad:`linear-gradient(135deg,${C.secondary},${C.accent})` },
                { label:'Total Target', value:totalTarget,    icon:<TrendingIcon/>,   grad:'linear-gradient(135deg,#8b5cf6,#a78bfa)' },
                { label:'Books Read',   value:totalDone,      icon:<TrophyIcon/>,     grad:'linear-gradient(135deg,#f59e0b,#fbbf24)' },
              ].map((s, i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Grow in timeout={300 + i * 100}>
                    <Paper elevation={0} sx={{
                      p:2.5, borderRadius:3, textAlign:'center',
                      border:`2px solid transparent`,
                      background:`linear-gradient(white,white) padding-box, ${s.grad} border-box`,
                      transition:'all 0.3s ease',
                      '&:hover':{ transform:'translateY(-5px)', boxShadow:`0 12px 28px rgba(0,0,0,.08)` }
                    }}>
                      <Avatar sx={{ width:46, height:46, mx:'auto', mb:1.5, background:s.grad }}>
                        {React.cloneElement(s.icon, { sx:{ color:'white', fontSize:22 } })}
                      </Avatar>
                      <Typography variant="h4" fontWeight={900} sx={{
                        background:s.grad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:-1
                      }}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                    </Paper>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}

          {loading ? (
            <Box sx={{ display:'flex', justifyContent:'center', py:10 }}>
              <CircularProgress size={56} sx={{ color:C.primary }} />
            </Box>
          ) : goals.length === 0 ? (
            <Fade in timeout={600}>
              <Box sx={{ textAlign:'center', py:12 }}>
                <Avatar sx={{ width:110, height:110, mx:'auto', mb:3,
                  background:`linear-gradient(135deg,${C.primary},${C.secondary})` }}>
                  <TrophyIcon sx={{ fontSize:60, color:'white' }} />
                </Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color:C.dark, mb:1 }}>No reading goals yet</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb:4 }}>
                  Set your first goal and stay motivated! 🎯
                </Typography>
                <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={openAdd}
                  sx={{ ...gradBtn(), px:5, py:1.5 }}>Create Your First Goal</Button>
              </Box>
            </Fade>
          ) : (
            <Grid container spacing={3}>
              {goals.map((goal, idx) => {
                const p           = pct(goal);
                const dl          = daysLeft(goal.end_date);
                const { label, color, icon } = cardStatus(goal);
                const { grad }    = TYPE_COLOR[goal.goal_type] || TYPE_COLOR.monthly;
                return (
                  <Grid item xs={12} sm={6} lg={4} key={goal.id}>
                    <Grow in timeout={400 + idx * 150}>
                      <Card elevation={0} sx={{
                        height:'100%', border:`2px solid ${color}35`, borderRadius:3,
                        bgcolor: p >= 100 ? C.lighter : 'white',
                        transition:'all 0.3s ease',
                        '&:hover':{ transform:'translateY(-7px)', boxShadow:`0 18px 36px ${color}20`, borderColor:color }
                      }}>
                        {/* top gradient stripe */}
                        <Box sx={{ height:6, background:grad, borderRadius:'3px 3px 0 0' }} />
                        <CardContent sx={{ p:3 }}>
                          {/* header row */}
                          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:2 }}>
                            <Avatar sx={{ width:54, height:54, background:grad }}>
                              {p >= 100
                                ? <TrophyIcon sx={{ color:'white', fontSize:28 }} />
                                : <TrendingIcon sx={{ color:'white', fontSize:28 }} />}
                            </Avatar>
                            <Chip label={label} size="small" icon={icon}
                              sx={{ bgcolor:`${color}15`, color, fontWeight:700, border:`1px solid ${color}40`,
                                '& .MuiChip-icon':{ color } }} />
                          </Box>

                          <Typography variant="h5" fontWeight={800} sx={{ color:C.dark, mb:0.3 }}>
                            {typeLabel(goal.goal_type)} Goal
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb:2.5 }}>
                            Read <strong>{goal.target_books}</strong> book{goal.target_books !== 1 ? 's' : ''}
                          </Typography>

                          {/* progress */}
                          <Box sx={{ mb:2 }}>
                            <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.8 }}>
                              <Typography variant="caption" fontWeight={700} sx={{ color }}>Progress</Typography>
                              <Typography variant="caption" fontWeight={800} sx={{ color }}>
                                {goal.current_progress} / {goal.target_books}
                              </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={p} sx={{
                              height:12, borderRadius:6, bgcolor:`${color}15`,
                              '& .MuiLinearProgress-bar':{ background:grad, borderRadius:6 }
                            }} />
                            <Typography variant="caption" sx={{ color, fontWeight:600, mt:0.5, display:'block' }}>
                              {Math.round(p)}% complete
                            </Typography>
                          </Box>

                          {/* dates */}
                          <Paper elevation={0} sx={{ p:1.5, bgcolor:C.lighter, borderRadius:2, mb:2,
                            border:`1px solid ${C.light}` }}>
                            <Grid container spacing={1}>
                              {[['Start', goal.start_date], ['End', goal.end_date]].map(([k, v]) => (
                                <Grid item xs={6} key={k}>
                                  <Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}>
                                    <CalendarIcon sx={{ fontSize:12, color:'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">{k}</Typography>
                                  </Box>
                                  <Typography variant="body2" fontWeight={700} sx={{ color:C.dark }}>
                                    {new Date(v).toLocaleDateString()}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>
                          </Paper>

                          {/* due/done alert */}
                          {p >= 100 ? (
                            <Box sx={{ px:2, py:1.2, borderRadius:2, bgcolor:`${C.secondary}15`, border:`1px solid ${C.secondary}30`, mb:2 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ color:C.primary }}>🎉 Goal completed!</Typography>
                            </Box>
                          ) : dl >= 0 ? (
                            <Box sx={{ px:2, py:1.2, borderRadius:2, bgcolor:`${color}12`, border:`1px solid ${color}30`, mb:2 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ color }}>
                                {dl === 0 ? '⏰ Last day!' : `📅 ${dl} day${dl !== 1 ? 's' : ''} remaining`}
                              </Typography>
                            </Box>
                          ) : (
                            <Box sx={{ px:2, py:1.2, borderRadius:2, bgcolor:'#fef2f2', border:'1px solid #fecaca', mb:2 }}>
                              <Typography variant="body2" fontWeight={700} sx={{ color:'#ef4444' }}>⚠️ Goal expired</Typography>
                            </Box>
                          )}

                          <Divider sx={{ mb:2, borderColor:C.light }} />
                          <Box sx={{ display:'flex', gap:1 }}>
                            <Button fullWidth variant="outlined" size="small" startIcon={<EditIcon />}
                              onClick={() => openEdit(goal)} sx={{ ...gradBtn(true), py:0.8 }}>Edit</Button>
                            <Button fullWidth variant="outlined" color="error" size="small" startIcon={<DeleteIcon />}
                              onClick={() => { setGoalToDelete(goal); setDeleteOpen(true); }}
                              sx={{ borderRadius:2, fontWeight:700, py:0.8 }}>Delete</Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Add/Edit Dialog */}
          <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth
            PaperProps={{ sx:{ borderRadius:3, overflow:'hidden' } }}>
            <DialogTitle sx={{
              background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
              color:'white', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'space-between'
            }}>
              {editingGoal ? 'Edit Goal' : 'New Reading Goal'}
              <IconButton onClick={closeDialog} sx={{ color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,.2)' } }}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt:3 }}>
              {error && <Alert severity="error" sx={{ mb:2, borderRadius:2 }}>{error}</Alert>}
              <Grid container spacing={2.5} sx={{ mt:0.5 }}>
                <Grid item xs={12}>
                  <TextField select fullWidth label="Goal Type" name="goal_type"
                    value={formData.goal_type} onChange={e => setFormData(p => ({ ...p, goal_type:e.target.value }))}
                    sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }}>
                    {['weekly','monthly','yearly'].map(t => <MenuItem key={t} value={t}>{typeLabel(t)}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth type="number" label="Target Books" name="target_books"
                    value={formData.target_books} onChange={e => setFormData(p => ({ ...p, target_books:Number(e.target.value) }))}
                    inputProps={{ min:1 }} helperText="How many books do you want to read?"
                    sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } } }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth type="date" label="Start Date" name="start_date"
                    value={formData.start_date} onChange={e => setFormData(p => ({ ...p, start_date:e.target.value }))}
                    InputLabelProps={{ shrink:true }}
                    sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth type="date" label="End Date" value={formData.end_date}
                    InputLabelProps={{ shrink:true }} disabled
                    helperText="Auto-calculated"
                    sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2 } }} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p:2.5, gap:1 }}>
              <Button onClick={closeDialog} variant="outlined"
                sx={{ borderColor:'#e5e7eb', color:'text.secondary', borderRadius:2, fontWeight:600 }}>Cancel</Button>
              <Button onClick={handleSave} variant="contained" disabled={saving}
                startIcon={saving ? <CircularProgress size={18} sx={{ color:'white' }} /> : <AddIcon />}
                sx={{ ...gradBtn() }}>
                {saving ? (editingGoal ? 'Updating…' : 'Creating…') : (editingGoal ? 'Update Goal' : 'Create Goal')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth
            PaperProps={{ sx:{ borderRadius:3 } }}>
            <DialogTitle sx={{ fontWeight:700, color:C.dark }}>Delete Goal</DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb:2 }}>
                Delete the <strong>{goalToDelete && typeLabel(goalToDelete.goal_type)}</strong> goal with target <strong>{goalToDelete?.target_books} books</strong>?
              </Typography>
              <Alert severity="warning" sx={{ borderRadius:2 }}>This action cannot be undone.</Alert>
            </DialogContent>
            <DialogActions sx={{ p:2, gap:1 }}>
              <Button onClick={() => setDeleteOpen(false)} variant="outlined"
                sx={{ borderColor:'#e5e7eb', color:'text.secondary', borderRadius:2 }}>Cancel</Button>
              <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}
                startIcon={deleting ? <CircularProgress size={18} sx={{ color:'white' }} /> : <DeleteIcon />}
                sx={{ borderRadius:2, fontWeight:700 }}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

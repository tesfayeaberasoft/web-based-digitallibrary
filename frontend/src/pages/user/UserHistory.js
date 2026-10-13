import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, MenuItem,
  Grid, Pagination, CircularProgress, Alert, Avatar, Paper, Fade, Grow
} from '@mui/material';
import {
  CheckCircle as CheckIcon, Cancel as CancelIcon, // eslint-disable-line no-unused-vars
  Schedule as ScheduleIcon, MenuBook as BookIcon,
  History as HistoryIcon, TrendingUp as TrendingIcon,
  AccessTime as TimeIcon, EmojiEvents as TrophyIcon,
  FilterList
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const C = {
  primary: '#2d6a4f', secondary: '#52b788',
  light: '#d8f3dc', lighter: '#f0fdf4',
  dark: '#1b4332', accent: '#95d5b2'
};

export default function UserHistory() {
  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [statusFilter,setStatusFilter]= useState('all');
  const [yearFilter,  setYearFilter]  = useState('all');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const LIMIT = 10;

  useEffect(() => { fetchHistory(); }, [page, statusFilter, yearFilter]);

  const fetchHistory = async () => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const params = { page, limit: LIMIT, status: statusFilter === 'all' ? undefined : statusFilter };
      const { data } = await axios.get('http://localhost:8000/api/loans', {
        headers: { Authorization: `Bearer ${token}` }, params
      });
      if (data.success) {
        let loans = data.loans;
        if (yearFilter !== 'all')
          loans = loans.filter(l => new Date(l.loan_date).getFullYear().toString() === yearFilter);
        setHistory(loans);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load history.');
    } finally { setLoading(false); }
  };

  const duration = (a, b) => Math.ceil(Math.abs((b ? new Date(b) : new Date()) - new Date(a)) / 86400000);
  const years    = [...new Set(history.map(l => new Date(l.loan_date).getFullYear().toString()))].sort().reverse();

  const statusMeta = (loan) => {
    if (loan.status === 'returned') {
      const late = new Date(loan.return_date) > new Date(loan.due_date);
      return { label: late ? 'Returned Late' : 'Returned', color: late ? '#f59e0b' : C.secondary, icon: <CheckIcon sx={{ fontSize:14 }} /> };
    }
    if (loan.status === 'active')
      return { label: 'Active', color: C.primary, icon: <ScheduleIcon sx={{ fontSize:14 }} /> };
    return { label: 'Cancelled', color: '#ef4444', icon: <CancelIcon sx={{ fontSize:14 }} /> };
  };

  /* stats from loaded history */
  const returned   = history.filter(l => l.status === 'returned');
  const active     = history.filter(l => l.status === 'active');
  const avgDays    = returned.length ? Math.round(returned.reduce((s,l) => s + duration(l.loan_date, l.return_date), 0) / returned.length) : 0;
  const onTimePct  = returned.length ? Math.round(returned.filter(l => new Date(l.return_date) <= new Date(l.due_date)).length / returned.length * 100) : 0;

  return (
    <DashboardLayout title="Reading History">
      <Fade in timeout={500}>
        <Box>
          {/* header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} sx={{
              background: `linear-gradient(135deg,${C.primary},${C.secondary})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', mb:0.5
            }}>Reading History</Typography>
            <Typography variant="body1" color="text.secondary">Your complete reading journey</Typography>
          </Box>

          {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb:3, borderRadius:2 }}>{error}</Alert>}

          {/* stat cards */}
          <Grid container spacing={2.5} sx={{ mb:4 }}>
            {[
              { icon:<BookIcon/>,    label:'Books Read',    value:returned.length,  grad:`linear-gradient(135deg,${C.primary},${C.secondary})` },
              { icon:<ScheduleIcon/>,label:'Active Loans',  value:active.length,    grad:`linear-gradient(135deg,#3b82f6,#60a5fa)` },
              { icon:<TimeIcon/>,    label:'Avg. Days',     value:`${avgDays}d`,    grad:`linear-gradient(135deg,#8b5cf6,#a78bfa)` },
              { icon:<TrophyIcon/>,  label:'On-Time Rate',  value:`${onTimePct}%`,  grad:`linear-gradient(135deg,#f59e0b,#fbbf24)` },
            ].map((s,i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Grow in timeout={400 + i * 100}>
                  <Card elevation={0} sx={{
                    border:`2px solid transparent`,
                    background:`linear-gradient(white,white) padding-box, ${s.grad} border-box`,
                    borderRadius:3, transition:'all 0.3s ease',
                    '&:hover':{ transform:'translateY(-5px)', boxShadow:`0 12px 28px rgba(0,0,0,.1)` }
                  }}>
                    <CardContent sx={{ p:2.5, textAlign:'center' }}>
                      <Avatar sx={{ width:50, height:50, mx:'auto', mb:1.5, background:s.grad }}>
                        {React.cloneElement(s.icon, { sx:{ color:'white', fontSize:24 } })}
                      </Avatar>
                      <Typography variant="h4" fontWeight={900} sx={{
                        background:s.grad, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:-1
                      }}>{s.value}</Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* filters */}
          <Paper elevation={0} sx={{
            p:3, mb:3, borderRadius:3,
            background:`linear-gradient(135deg,${C.lighter},white)`,
            border:`2px solid ${C.light}`
          }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
              <FilterList sx={{ color:C.primary }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color:C.dark }}>Filter History</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField select fullWidth label="Status" value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } },
                    '& .MuiInputLabel-root.Mui-focused':{ color:C.primary } }}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField select fullWidth label="Year" value={yearFilter}
                  onChange={e => { setYearFilter(e.target.value); setPage(1); }}
                  sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2, '&.Mui-focused fieldset':{ borderColor:C.primary } },
                    '& .MuiInputLabel-root.Mui-focused':{ color:C.primary } }}>
                  <MenuItem value="all">All Years</MenuItem>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* table */}
          <Card elevation={0} sx={{ border:`2px solid ${C.light}`, borderRadius:3, overflow:'hidden', mb:3 }}>
            {loading ? (
              <Box sx={{ display:'flex', justifyContent:'center', py:10 }}>
                <CircularProgress size={56} sx={{ color:C.primary }} />
              </Box>
            ) : history.length === 0 ? (
              <Box sx={{ textAlign:'center', py:10 }}>
                <Avatar sx={{ width:96, height:96, mx:'auto', mb:3,
                  background:`linear-gradient(135deg,${C.primary},${C.secondary})` }}>
                  <HistoryIcon sx={{ fontSize:52, color:'white' }} />
                </Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ color:C.dark, mb:1 }}>No history found</Typography>
                <Typography variant="body1" color="text.secondary">Start borrowing books to build your reading history 📚</Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background:`linear-gradient(135deg,${C.primary},${C.secondary})` }}>
                        {['Book', 'Author', 'Issued', 'Returned', 'Duration', 'Status'].map(h => (
                          <TableCell key={h} sx={{ color:'white', fontWeight:700, fontSize:'0.88rem', py:2 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((loan, i) => {
                        const { label, color, icon } = statusMeta(loan);
                        return (
                          <TableRow key={loan.id} hover sx={{
                            bgcolor: i % 2 === 0 ? 'white' : C.lighter,
                            transition:'all 0.2s ease',
                            '&:hover':{ bgcolor:`${C.light}80` }
                          }}>
                            <TableCell>
                              <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                                <Avatar sx={{ width:34, height:34, bgcolor:C.primary, flexShrink:0 }}>
                                  <BookIcon sx={{ fontSize:18, color:'white' }} />
                                </Avatar>
                                <Typography variant="body2" fontWeight={700} sx={{ color:C.dark }}>
                                  {loan.book_title}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">{loan.book_author}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>{new Date(loan.loan_date).toLocaleDateString()}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {loan.return_date ? new Date(loan.return_date).toLocaleDateString() : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={`${duration(loan.loan_date, loan.return_date)}d`} size="small"
                                sx={{ bgcolor:`${C.primary}15`, color:C.primary, fontWeight:700, border:`1px solid ${C.primary}30` }} />
                            </TableCell>
                            <TableCell>
                              <Chip label={label} size="small" icon={icon}
                                sx={{ bgcolor:`${color}15`, color, fontWeight:700, border:`1px solid ${color}30`,
                                  '& .MuiChip-icon':{ color } }} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {totalPages > 1 && (
                  <Box sx={{ display:'flex', justifyContent:'center', py:3, borderTop:`1px solid ${C.light}` }}>
                    <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)}
                      sx={{ '& .Mui-selected':{ bgcolor:`${C.primary} !important`, color:'white' },
                        '& .MuiPaginationItem-root':{ fontWeight:600 } }} />
                  </Box>
                )}
              </>
            )}
          </Card>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

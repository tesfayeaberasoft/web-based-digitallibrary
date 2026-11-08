import { apiUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  LinearProgress, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Fade, Grow, Avatar, Paper, Tabs, Tab, Divider
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AssignmentReturn as ReturnIcon,
  AutoStories as ReadingIcon,
  CalendarToday as CalendarIcon,
  Bookmark as BookmarkIcon,
  ArrowForward,
  Refresh,
  LibraryBooks
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const C = {
  primary: '#2d6a4f', secondary: '#52b788',
  light: '#d8f3dc', lighter: '#f0fdf4',
  dark: '#1b4332', accent: '#95d5b2'
};

const gradBtn = (outline = false) => outline ? {
  borderColor: C.secondary, color: C.primary, fontWeight: 700, borderRadius: 2,
  '&:hover': { borderColor: C.primary, bgcolor: C.lighter, transform: 'translateY(-1px)' },
  transition: 'all 0.2s ease'
} : {
  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
  color: 'white', fontWeight: 700, borderRadius: 2,
  boxShadow: `0 4px 12px rgba(45,106,79,.3)`,
  '&:hover': { background: `linear-gradient(135deg, ${C.dark}, ${C.primary})`, transform: 'translateY(-2px)', boxShadow: `0 8px 20px rgba(45,106,79,.4)` },
  '&.Mui-disabled': { opacity: 0.5 },
  transition: 'all 0.3s ease'
};

export default function UserBooks() {
  const { t } = useTranslation();
  const [tab, setTab]                       = useState(0);
  const [loans, setLoans]                   = useState([]);
  const [reservations, setReservations]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [returnOpen, setReturnOpen]         = useState(false);
  const [renewOpen, setRenewOpen]           = useState(false);
  const [selectedLoan, setSelectedLoan]     = useState(null);
  const [returning, setReturning]           = useState(false);
  const [returnError, setReturnError]       = useState('');
  const [renewing, setRenewing]             = useState(false);
  const [cancelOpen, setCancelOpen]         = useState(false);
  const [selectedRes, setSelectedRes]       = useState(null);
  const [cancelling, setCancelling]         = useState(false);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view your books.');
      setLoading(false);
      return;
    }
    const cfg = { headers: { Authorization: `Bearer ${token}` } };
    const [loansResult, reservationsResult] = await Promise.allSettled([
      axios.get(apiUrl("/api/loans?status=active"), cfg),
      axios.get(apiUrl("/api/reservations"), cfg)
    ]);

    const errors = [];
    if (loansResult.status === 'fulfilled' && loansResult.value.data.success) {
      setLoans(Array.isArray(loansResult.value.data.loans) ? loansResult.value.data.loans : []);
    } else {
      setLoans([]);
      errors.push(
        loansResult.status === 'rejected'
          ? loansResult.reason.response?.data?.message || loansResult.reason.message
          : loansResult.value.data.message || 'Could not load borrowed books.'
      );
    }

    if (reservationsResult.status === 'fulfilled' && reservationsResult.value.data.success) {
      const items = Array.isArray(reservationsResult.value.data.reservations)
        ? reservationsResult.value.data.reservations
        : [];
      setReservations(items.filter((reservation) => (
        reservation.status === 'pending' || reservation.status === 'available'
      )));
    } else {
      setReservations([]);
      errors.push(
        reservationsResult.status === 'rejected'
          ? reservationsResult.reason.response?.data?.message || reservationsResult.reason.message
          : reservationsResult.value.data.message || 'Could not load reservations.'
      );
    }

    setError(errors.join(' '));
    setLoading(false);
  };

  const daysUntilDue = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

  const handleReturn = async () => {
    if (!selectedLoan) return;
    setReturning(true); setError(''); setSuccess('');
    setReturnError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(apiUrl(`/api/loans/${selectedLoan.id}/return`), {}, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setSuccess(data.fine_amount > 0
          ? `Returned! Fine of $${data.fine_amount} applied for late return.`
          : `"${selectedLoan.book_title}" returned successfully!`);
        setReturnOpen(false); setSelectedLoan(null); fetchBooks();
      }
    } catch (e) {
      if (e.response?.data?.error_code === 'UNPAID_FINES' || e.response?.status === 409) {
        setReturnError(t('support.blockedReturn'));
      } else {
        setError(e.response?.data?.message || 'Failed to return book.');
      }
    }
    finally { setReturning(false); }
  };

  const handleRenew = async () => {
    if (!selectedLoan) return;
    setRenewing(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(apiUrl(`/api/loans/${selectedLoan.id}/renew`), {}, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setSuccess(`"${selectedLoan.book_title}" renewed! New due: ${new Date(data.new_due_date).toLocaleDateString()}. ${data.renewals_remaining} renewal(s) left.`);
        setRenewOpen(false); setSelectedLoan(null); fetchBooks();
      }
    } catch (e) { setError(e.response?.data?.message || 'Failed to renew book.'); }
    finally { setRenewing(false); }
  };

  const handleCancelReservation = async () => {
    if (!selectedRes) return;
    setCancelling(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(
        apiUrl(`/api/reservations/${selectedRes.id}/cancel`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setSuccess(`Reservation for "${selectedRes.book_title}" cancelled successfully.`);
        setCancelOpen(false); setSelectedRes(null); fetchBooks();
      }
    } catch (e) { setError(e.response?.data?.message || 'Failed to cancel reservation.'); }
    finally { setCancelling(false); }
  };

  const statusChip = (loan) => {
    const d = daysUntilDue(loan.due_date);
    if (d < 0)  return { label: 'Overdue',  color: '#ef4444', bg: '#fef2f2', icon: <WarningIcon sx={{ fontSize: 14 }} /> };
    if (d <= 3) return { label: 'Due Soon', color: '#f59e0b', bg: '#fffbeb', icon: <ScheduleIcon sx={{ fontSize: 14 }} /> };
    return { label: 'Active', color: C.secondary, bg: C.lighter, icon: <CheckIcon sx={{ fontSize: 14 }} /> };
  };

  /* ── empty state ── */
  const EmptyState = ({ icon, title, sub, btnLabel, btnHref, color }) => (
    <Fade in timeout={600}>
      <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
        <Avatar sx={{ width: 100, height: 100, mx: 'auto', mb: 3, background: `linear-gradient(135deg, ${color}99, ${color})` }}>
          {icon}
        </Avatar>
        <Typography variant="h5" fontWeight={700} sx={{ color: C.dark, mb: 1 }}>{title}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{sub}</Typography>
        <Button variant="contained" href={btnHref} endIcon={<ArrowForward />} sx={{ ...gradBtn(), px: 4, py: 1.3 }}>
          {btnLabel}
        </Button>
      </Box>
    </Fade>
  );

  /* ── loan card ── */
  const LoanCard = ({ loan, idx }) => {
    const { label, color, bg, icon } = statusChip(loan);
    const days  = daysUntilDue(loan.due_date);
    const prog  = Math.max(0, Math.min(100, ((14 - days) / 14) * 100));
    return (
      <Grow in timeout={500 + idx * 150}>
        <Card elevation={0} sx={{
          height: '100%', width: '100%', minWidth: 0, border: `2px solid ${color}40`, borderRadius: 3,
          bgcolor: bg, transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 32px ${color}25`, borderColor: color }
        }}>
          <CardContent sx={{ p: 3 }}>
            {/* header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ width: 52, height: 52, background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                <ReadingIcon sx={{ fontSize: 28, color: 'white' }} />
              </Avatar>
              <Chip label={label} size="small" icon={icon}
                sx={{ bgcolor: `${color}20`, color, fontWeight: 700, border: `1px solid ${color}50`,
                  '& .MuiChip-icon': { color } }} />
            </Box>

            <Typography variant="h6" fontWeight={800} sx={{ color: C.dark, mb: 0.5,
              overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.35 }}>
              {loan.book_title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              by {loan.book_author}
            </Typography>

            {/* progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">Time Used</Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color }}>{Math.round(prog)}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={prog} sx={{
                height: 8, borderRadius: 4, bgcolor: `${color}20`,
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
              }} />
            </Box>

            {/* dates */}
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, mb: 2, border: `1px solid ${color}20` }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">Issued</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: C.dark }}>
                    {new Date(loan.loan_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color }}>
                    {new Date(loan.due_date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* due alert */}
            <Box sx={{ mb: 2, px: 2, py: 1.2, borderRadius: 2,
              bgcolor: `${color}15`, border: `1px solid ${color}30` }}>
              <Typography variant="body2" fontWeight={700} sx={{ color }}>
                {days < 0 ? `⚠️ Overdue by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}`
                  : days === 0 ? '⏰ Due today!'
                  : `📅 ${days} day${days !== 1 ? 's' : ''} remaining`}
              </Typography>
            </Box>

            {/* actions */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button fullWidth variant="contained" size="small" startIcon={<ReturnIcon />}
                onClick={() => { setSelectedLoan(loan); setReturnError(''); setReturnOpen(true); }}
                sx={{ ...gradBtn(), py: 1 }}>Return</Button>
              <Button fullWidth variant="outlined" size="small" startIcon={<ScheduleIcon />}
                onClick={() => { setSelectedLoan(loan); setRenewOpen(true); }}
                sx={{ ...gradBtn(true), py: 1 }}>Renew</Button>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  /* ── reservation card ── */
  const ReservationCard = ({ res, idx }) => {
    const ready = res.status === 'available';
    const color = ready ? C.secondary : '#f59e0b';
    return (
      <Grow in timeout={500 + idx * 150}>
        <Card elevation={0} sx={{
          height: '100%', width: '100%', minWidth: 0, border: `2px solid ${color}40`, borderRadius: 3,
          bgcolor: ready ? C.lighter : '#fffbeb', transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 16px 32px ${color}25`, borderColor: color }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ width: 52, height: 52, background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                {ready ? <CheckIcon sx={{ fontSize: 28, color: 'white' }} /> : <BookmarkIcon sx={{ fontSize: 28, color: 'white' }} />}
              </Avatar>
              <Chip label={ready ? '✅ Ready' : '⏳ Pending'} size="small"
                sx={{ bgcolor: `${color}20`, color, fontWeight: 700, border: `1px solid ${color}50` }} />
            </Box>

            <Typography variant="h6" fontWeight={800} sx={{ color: C.dark, mb: 0.5,
              overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {res.book_title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>by {res.book_author}</Typography>

            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2, mb: 2, border: `1px solid ${color}20` }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">Reserved On</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ color: C.dark }}>
                    {new Date(res.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">Queue</Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color }}>#{res.queue_position}</Typography>
                </Grid>
              </Grid>
            </Paper>

            <Box sx={{ mb: 2, px: 2, py: 1.2, borderRadius: 2, bgcolor: `${color}15`, border: `1px solid ${color}30` }}>
              <Typography variant="body2" fontWeight={700} sx={{ color }}>
                {ready ? '🎉 Ready for pickup at the library!' : `📋 You're #${res.queue_position} in the queue`}
              </Typography>
            </Box>

            <Button fullWidth variant="outlined" color="error" size="small"
              onClick={() => { setSelectedRes(res); setCancelOpen(true); }}
              sx={{ borderRadius: 2, fontWeight: 700 }}>
              Cancel Reservation
            </Button>
          </CardContent>
        </Card>
      </Grow>
    );
  };

  return (
    <DashboardLayout title="My Books">
      <Fade in timeout={500}>
        <Box>
          {/* header */}
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
            {/* Centered Text */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={800} sx={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 0.5
              }}>My Books</Typography>
              <Typography variant="body1" color="text.secondary">Manage your borrowed books and reservations</Typography>
            </Box>
            {/* Refresh Button - Positioned Absolutely */}
            <Button variant="outlined" startIcon={<Refresh />} onClick={fetchBooks}
              sx={{ ...gradBtn(true), px: 3, position: 'absolute', right: 0 }}>Refresh</Button>
          </Box>

          {/* alerts */}
          {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3, borderRadius: 2, border:`1px solid ${C.secondary}`, bgcolor: C.lighter }}>{success}</Alert>}

          {/* summary pills */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))'
            },
            gap: 2,
            width: '100%',
            minWidth: 0,
            mb: 4
          }}>
            {[
              { label: 'Borrowed',     value: loans.length,        color: C.primary,  icon: <BookIcon/> },
              { label: 'Reservations', value: reservations.length, color: '#f59e0b',  icon: <BookmarkIcon/> },
              { label: 'Overdue',      value: loans.filter(l => daysUntilDue(l.due_date) < 0).length, color: '#ef4444', icon: <WarningIcon/> },
              { label: 'Due Soon',     value: loans.filter(l => { const d = daysUntilDue(l.due_date); return d >= 0 && d <= 3; }).length, color: '#f59e0b', icon: <ScheduleIcon/> },
            ].map((s, i) => (
              <Box key={i} sx={{ minWidth: 0 }}>
                <Grow in timeout={400 + i * 100}>
                  <Paper elevation={0} sx={{
                    width: '100%',
                    height: '100%',
                    p: 2, borderRadius: 3, textAlign: 'center',
                    border: `2px solid ${s.color}30`, bgcolor: `${s.color}08`,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 20px ${s.color}20`, borderColor: s.color }
                  }}>
                    <Avatar sx={{ width: 44, height: 44, mx: 'auto', mb: 1, bgcolor: `${s.color}20`, color: s.color }}>{s.icon}</Avatar>
                    <Typography variant="h4" fontWeight={900} sx={{ color: s.color }}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                  </Paper>
                </Grow>
              </Box>
            ))}
          </Box>

          {/* tabs */}
          <Paper elevation={0} sx={{ mb: 4, borderRadius: 3, overflow: 'hidden', border: `2px solid ${C.light}` }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{
              width: '100%',
              '& .MuiTabs-flexContainer': { justifyContent: 'center' },
              '& .MuiTab-root': { fontWeight: 700, py: 2, px: 3, minWidth: { xs: 150, sm: 220 }, flexGrow: 0, minHeight: 60, fontSize: '0.95rem' },
              '& .Mui-selected': { color: `${C.primary} !important` },
              '& .MuiTabs-indicator': { bgcolor: C.primary, height: 3 }
            }}>
              {[
                { label: 'Borrowed Books', icon: <LibraryBooks sx={{ fontSize: 20 }} />, count: loans.length },
                { label: 'Reservations',   icon: <BookmarkIcon sx={{ fontSize: 20 }} />, count: reservations.length }
              ].map((t, i) => (
                <Tab key={i} label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {t.icon} {t.label}
                    <Chip label={t.count} size="small" sx={{
                      bgcolor: tab === i ? C.primary : C.light,
                      color: tab === i ? 'white' : C.primary,
                      fontWeight: 700, height: 22, fontSize: '0.75rem'
                    }} />
                  </Box>
                } />
              ))}
            </Tabs>
          </Paper>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress size={56} sx={{ color: C.primary }} />
            </Box>
          ) : (
            <>
              {tab === 0 && (
                loans.length === 0
                  ? <EmptyState icon={<BookIcon sx={{ fontSize: 52, color: 'white' }} />}
                      title="No borrowed books" sub="Visit the library to borrow your first book! 📚"
                      btnLabel="Browse Books" btnHref="/user/browse" color={C.primary} />
                  : <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                      gap: 3,
                      width: '100%',
                      minWidth: 0,
                      alignItems: 'stretch'
                    }}>
                      {loans.map((l, i) => (
                        <Box key={l.id} sx={{ minWidth: 0, display: 'flex' }}>
                          <LoanCard loan={l} idx={i} />
                        </Box>
                      ))}
                    </Box>
              )}
              {tab === 1 && (
                reservations.length === 0
                  ? <EmptyState icon={<BookmarkIcon sx={{ fontSize: 52, color: 'white' }} />}
                      title="No reservations" sub="Reserve books that are currently unavailable! 🔔"
                      btnLabel="Browse Books" btnHref="/user/browse" color="#f59e0b" />
                  : <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                      gap: 3,
                      width: '100%',
                      minWidth: 0,
                      alignItems: 'stretch'
                    }}>
                      {reservations.map((r, i) => (
                        <Box key={r.id} sx={{ minWidth: 0, display: 'flex' }}>
                          <ReservationCard res={r} idx={i} />
                        </Box>
                      ))}
                    </Box>
              )}
            </>
          )}

          {/* Return Dialog */}
          <Dialog open={returnOpen} onClose={() => { setReturnOpen(false); setReturnError(''); }} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: 'white', fontWeight: 700 }}>
              Return Book
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to return <strong>"{selectedLoan?.book_title}"</strong>?
              </Typography>
              {returnError && (
                <Alert
                  severity="warning"
                  onClose={() => setReturnError('')}
                  action={<Button color="inherit" size="small" href="/fines">Pay fines</Button>}
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  {returnError}
                </Alert>
              )}
              {selectedLoan && daysUntilDue(selectedLoan.due_date) < 0 && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  This book is overdue by {Math.abs(daysUntilDue(selectedLoan.due_date))} day(s). A fine will be applied.
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button onClick={() => { setReturnOpen(false); setReturnError(''); }} variant="outlined"
                sx={{ borderColor: '#e5e7eb', color: 'text.secondary', borderRadius: 2 }}>Cancel</Button>
              <Button onClick={handleReturn} variant="contained" disabled={returning}
                startIcon={returning ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <ReturnIcon />}
                sx={{ ...gradBtn() }}>
                {returning ? 'Returning…' : 'Confirm Return'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Renew Dialog */}
          <Dialog open={renewOpen} onClose={() => setRenewOpen(false)} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: 'white', fontWeight: 700 }}>
              Renew Book
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Renew <strong>"{selectedLoan?.book_title}"</strong>?
              </Typography>
              {selectedLoan && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: C.lighter, borderRadius: 2, border: `1px solid ${C.light}` }}>
                  {[
                    ['Current Due Date', new Date(selectedLoan.due_date).toLocaleDateString()],
                    ['New Due Date', new Date(new Date(selectedLoan.due_date).getTime() + 14 * 86400000).toLocaleDateString()],
                    ['Renewals Used', `${selectedLoan.renewal_count || 0} / 2`]
                  ].map(([k, v]) => (
                    <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8 }}>
                      <Typography variant="body2" color="text.secondary">{k}</Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: C.primary }}>{v}</Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button onClick={() => setRenewOpen(false)} variant="outlined"
                sx={{ borderColor: '#e5e7eb', color: 'text.secondary', borderRadius: 2 }}>Cancel</Button>
              <Button onClick={handleRenew} variant="contained" disabled={renewing}
                startIcon={renewing ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <ScheduleIcon />}
                sx={{ ...gradBtn() }}>
                {renewing ? 'Renewing…' : 'Confirm Renew'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </DashboardLayout>
  );
}

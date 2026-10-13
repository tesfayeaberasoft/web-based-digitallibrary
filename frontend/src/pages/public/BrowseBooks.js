import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  CardActions, Button, TextField, MenuItem, Chip, Rating,
  InputAdornment, Pagination, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar,
  Paper, Fade, Grow, IconButton, Tooltip, Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  MenuBook as BookIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  FilterList,
  Close,
  Bookmark,
  BookmarkBorder,
  Star,
  AutoStories,
  LibraryBooks,
  CheckCircle,
  ArrowForward,
  Refresh
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ── green palette ── */
const C = {
  primary:   '#2d6a4f',
  secondary: '#52b788',
  light:     '#d8f3dc',
  lighter:   '#f0fdf4',
  dark:      '#1b4332',
  accent:    '#95d5b2',
};

const gradBtn = (outline = false) => outline ? {
  borderColor: C.secondary, color: C.primary, fontWeight: 700, borderRadius: 2,
  '&:hover': { borderColor: C.primary, bgcolor: C.lighter, transform: 'translateY(-1px)' },
  transition: 'all 0.2s ease',
} : {
  background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
  color: 'white', fontWeight: 700, borderRadius: 2,
  boxShadow: `0 4px 12px rgba(45,106,79,.3)`,
  '&:hover': {
    background: `linear-gradient(135deg, ${C.dark}, ${C.primary})`,
    transform: 'translateY(-2px)', boxShadow: `0 8px 20px rgba(45,106,79,.4)`,
  },
  '&.Mui-disabled': { opacity: 0.5 },
  transition: 'all 0.3s ease',
};

/* ── deterministic cover colour from book id ── */
const COVER_GRADS = [
  `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
  `linear-gradient(135deg, #3b82f6, #60a5fa)`,
  `linear-gradient(135deg, #8b5cf6, #a78bfa)`,
  `linear-gradient(135deg, #f59e0b, #fbbf24)`,
  `linear-gradient(135deg, #ef4444, #f87171)`,
  `linear-gradient(135deg, #06b6d4, #67e8f9)`,
  `linear-gradient(135deg, ${C.secondary}, ${C.accent})`,
  `linear-gradient(135deg, #ec4899, #f9a8d4)`,
];
const coverGrad = (id) => COVER_GRADS[(id || 0) % COVER_GRADS.length];

export default function BrowseBooks() {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [books,       setBooks]       = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [borrowing,   setBorrowing]   = useState(false);
  const [selectedBook,setSelectedBook]= useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbar,    setSnackbar]    = useState({ open:false, msg:'', sev:'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selCategory, setSelCategory] = useState('');
  const [avail,       setAvail]       = useState('all');
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [totalBooks,  setTotalBooks]  = useState(0);
  const LIMIT = 12;

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchBooks(); }, [page, searchQuery, selCategory, avail]); // eslint-disable-line

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/api/categories');
      if (data.success) setCategories(data.categories);
    } catch { /* silent */ }
  };

  const fetchBooks = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.get('http://localhost:8000/api/books', {
        params: { page, limit: LIMIT, search: searchQuery, category_id: selCategory, availability: avail },
      });
      if (data.success) {
        setBooks(data.books || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalBooks(data.pagination?.total || 0);
      } else {
        setBooks([]); setError('Failed to load books.');
      }
    } catch { setBooks([]); setError('Failed to load books.'); }
    finally { setLoading(false); }
  };

  const handleBorrow = (book) => {
    if (!user) {
      setSnackbar({ open:true, msg:'Please login to borrow books', sev:'warning' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    setSelectedBook(book); setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedBook) return;
    setBorrowing(true); setConfirmOpen(false);
    try {
      const token = localStorage.getItem('token');
      const cfg   = { headers: { Authorization: `Bearer ${token}` } };
      if (selectedBook.available_copies > 0) {
        const { data } = await axios.post('http://localhost:8000/api/loans', { book_id: selectedBook.id }, cfg);
        if (data.success) {
          setSnackbar({ open:true, msg:`"${selectedBook.title}" borrowed successfully! Due in 14 days.`, sev:'success' });
          fetchBooks();
        } else throw new Error(data.message);
      } else {
        const { data } = await axios.post('http://localhost:8000/api/reservations', { book_id: selectedBook.id }, cfg);
        if (data.success) {
          setSnackbar({ open:true, msg:`Reserved! You're #${data.queue_position || 1} in the queue.`, sev:'success' });
        } else throw new Error(data.message);
      }
    } catch (e) {
      setSnackbar({ open:true, msg: e.response?.data?.message || e.message || 'Failed to process request.', sev:'error' });
    } finally { setBorrowing(false); setSelectedBook(null); }
  };

  const available  = books.filter(b => b.available_copies > 0).length;
  const unavailable= books.filter(b => b.available_copies === 0).length;

  /* ─────────────────────── render ─────────────────────── */
  return (
    <Box sx={{ bgcolor: C.lighter, minHeight: '100vh' }}>
      <Navbar title="Digital Library" showUserMenu />

      {/* ── Hero Banner ── */}
      <Box sx={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 100%)`,
        py: { xs: 5, md: 7 }, position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circles */}
        {[
          { s:300, t:-80,  r:-80,  o:.1 },
          { s:200, b:-60,  l:-60,  o:.08 },
          { s:150, t:'40%',r:'15%',o:.06 },
        ].map((c, i) => (
          <Box key={i} sx={{
            position:'absolute', width:c.s, height:c.s, borderRadius:'50%',
            background:'rgba(255,255,255,0.2)',
            top:c.t, bottom:c.b, left:c.l, right:c.r, opacity:c.o,
          }}/>
        ))}
        <Container sx={{ position:'relative', zIndex:1 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:2, mb:2 }}>
            <Avatar sx={{ width:56, height:56, bgcolor:'rgba(255,255,255,0.2)' }}>
              <LibraryBooks sx={{ fontSize:32, color:'white' }} />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{ color:'white', lineHeight:1.1 }}>
                Browse Books
              </Typography>
              <Typography variant="h6" sx={{ color:'rgba(255,255,255,.85)', fontWeight:400 }}>
                Discover your next favourite read
              </Typography>
            </Box>
          </Box>

          {/* summary pills */}
          <Box sx={{ display:'flex', flexWrap:'wrap', gap:1.5, mt:3 }}>
            {[
              { label:`${totalBooks} Total Books`,    color:'rgba(255,255,255,.25)' },
              { label:`${available} Available`,       color:'rgba(255,255,255,.25)' },
              { label:`${categories.length} Categories`, color:'rgba(255,255,255,.25)' },
            ].map((p,i) => (
              <Chip key={i} label={p.label} size="small"
                sx={{ bgcolor:p.color, color:'white', fontWeight:700,
                  border:'1px solid rgba(255,255,255,.3)', backdropFilter:'blur(8px)' }} />
            ))}
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        {/* ── Filter Bar ── */}
        <Paper elevation={0} sx={{
          p: 3, mb: 4, borderRadius: 3,
          border: `2px solid ${C.light}`,
          background: `linear-gradient(135deg, white, ${C.lighter})`,
        }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
            <FilterList sx={{ color:C.primary }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color:C.dark }}>
              Filter & Search
            </Typography>
          </Box>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth placeholder="Search by title, author, or ISBN…"
                value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                InputProps={{ startAdornment:(
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color:C.secondary }} />
                  </InputAdornment>
                )}}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2,
                  '&.Mui-focused fieldset':{ borderColor:C.primary } },
                  '& .MuiInputLabel-root.Mui-focused':{ color:C.primary } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Category" value={selCategory}
                onChange={e => { setSelCategory(e.target.value); setPage(1); }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2,
                  '&.Mui-focused fieldset':{ borderColor:C.primary } },
                  '& .MuiInputLabel-root.Mui-focused':{ color:C.primary } }}>
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name} ({c.book_count})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField select fullWidth label="Availability" value={avail}
                onChange={e => { setAvail(e.target.value); setPage(1); }}
                sx={{ '& .MuiOutlinedInput-root':{ borderRadius:2,
                  '&.Mui-focused fieldset':{ borderColor:C.primary } },
                  '& .MuiInputLabel-root.Mui-focused':{ color:C.primary } }}>
                <MenuItem value="all">All Books</MenuItem>
                <MenuItem value="available">Available Now</MenuItem>
                <MenuItem value="unavailable">Currently Unavailable</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchBooks}
                  sx={{ bgcolor:C.lighter, color:C.primary, width:48, height:48,
                    '&:hover':{ bgcolor:C.light, transform:'rotate(180deg)' },
                    transition:'all 0.5s ease' }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Paper>

        {/* ── Error ── */}
        {error && (
          <Alert severity="error" onClose={() => setError('')}
            sx={{ mb:3, borderRadius:2 }}>{error}</Alert>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', py:12, gap:2 }}>
            <CircularProgress size={60} sx={{ color:C.primary }} />
            <Typography color="text.secondary">Loading books…</Typography>
          </Box>

        /* ── Empty ── */
        ) : books.length === 0 ? (
          <Fade in timeout={500}>
            <Box sx={{ textAlign:'center', py:12 }}>
              <Avatar sx={{ width:100, height:100, mx:'auto', mb:3,
                background:`linear-gradient(135deg,${C.primary},${C.secondary})` }}>
                <BookIcon sx={{ fontSize:56, color:'white' }} />
              </Avatar>
              <Typography variant="h5" fontWeight={700} sx={{ color:C.dark, mb:1 }}>
                No books found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb:3 }}>
                Try adjusting your search terms or filters
              </Typography>
              <Button variant="contained" onClick={() => { setSearchQuery(''); setSelCategory(''); setAvail('all'); }}
                sx={{ ...gradBtn(), px:4 }}>
                Clear Filters
              </Button>
            </Box>
          </Fade>

        /* ── Book Grid ── */
        ) : (
          <>
            {/* result count */}
            <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:1 }}>
              <Typography variant="body1" sx={{ color:C.dark, fontWeight:600 }}>
                Showing <strong>{books.length}</strong> of <strong>{totalBooks}</strong> books
              </Typography>
              <Box sx={{ display:'flex', gap:1 }}>
                <Chip label={`${available} Available`} size="small"
                  sx={{ bgcolor:`${C.secondary}20`, color:C.primary, fontWeight:700, border:`1px solid ${C.secondary}40` }} />
                <Chip label={`${unavailable} Unavailable`} size="small"
                  sx={{ bgcolor:'#fef2f2', color:'#ef4444', fontWeight:700, border:'1px solid #fecaca' }} />
              </Box>
            </Box>

            <Grid container spacing={3}>
              {books.map((book, idx) => {
                const isAvail = book.available_copies > 0;
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                    <Grow in timeout={300 + (idx % 12) * 60}>
                      <Card elevation={0} sx={{
                        height:'100%', display:'flex', flexDirection:'column',
                        border:`2px solid ${C.light}`, borderRadius:3,
                        transition:'all 0.3s cubic-bezier(.4,0,.2,1)',
                        '&:hover':{
                          transform:'translateY(-8px) scale(1.01)',
                          boxShadow:`0 20px 40px rgba(45,106,79,.15)`,
                          borderColor: C.secondary,
                        },
                      }}>
                        {/* ── Cover ── */}
                        <Box sx={{
                          height: 200,
                          background: coverGrad(book.id),
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          overflow: 'hidden',
                        }}>
                          {/* availability badge */}
                          <Chip
                            label={isAvail ? `${book.available_copies} Available` : 'Unavailable'}
                            size="small"
                            icon={isAvail
                              ? <CheckCircle sx={{ fontSize:13, color:'white !important' }} />
                              : <BookmarkBorder sx={{ fontSize:13, color:'white !important' }} />}
                            sx={{
                              position:'absolute', top:10, right:10,
                              bgcolor: isAvail ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.25)',
                              color:'white', fontWeight:700, fontSize:'0.72rem',
                              border:'1px solid rgba(255,255,255,.35)',
                              backdropFilter:'blur(8px)',
                            }}
                          />
                          {/* book icon + title preview */}
                          <AutoStories sx={{ fontSize:56, color:'rgba(255,255,255,.6)', mb:1 }} />
                          <Typography variant="caption" sx={{
                            color:'rgba(255,255,255,.9)', fontWeight:700, textAlign:'center',
                            overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box',
                            WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.3,
                          }}>
                            {book.title}
                          </Typography>
                        </Box>

                        {/* ── Content ── */}
                        <CardContent sx={{ flexGrow:1, p:2.5 }}>
                          <Typography variant="h6" fontWeight={800} sx={{
                            color:C.dark, mb:0.5, lineHeight:1.25,
                            overflow:'hidden', textOverflow:'ellipsis',
                            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical',
                            minHeight:'2.6em',
                          }}>
                            {book.title}
                          </Typography>

                          <Box sx={{ display:'flex', alignItems:'center', gap:0.8, mb:0.8 }}>
                            <PersonIcon sx={{ fontSize:14, color:C.secondary }} />
                            <Typography variant="body2" color="text.secondary"
                              sx={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {book.author}
                            </Typography>
                          </Box>

                          <Box sx={{ display:'flex', alignItems:'center', gap:0.8, mb:1.5 }}>
                            <CategoryIcon sx={{ fontSize:14, color:C.secondary }} />
                            <Typography variant="body2" color="text.secondary">
                              {book.category_name || 'Uncategorized'}
                            </Typography>
                          </Box>

                          {/* rating */}
                          <Box sx={{ display:'flex', alignItems:'center', gap:0.8, mb:1.5 }}>
                            <Rating value={parseFloat(book.avg_rating) || 0}
                              precision={0.5} size="small" readOnly
                              sx={{ '& .MuiRating-iconFilled':{ color:C.secondary } }} />
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              ({book.review_count || 0})
                            </Typography>
                          </Box>

                          {/* isbn chip */}
                          {book.isbn && (
                            <Chip label={`ISBN: ${book.isbn}`} size="small" variant="outlined"
                              sx={{ fontSize:'0.68rem', borderColor:C.light, color:'text.secondary',
                                height:22, maxWidth:'100%', overflow:'hidden' }} />
                          )}
                        </CardContent>

                        <Divider sx={{ borderColor:C.light }} />

                        {/* ── Action ── */}
                        <CardActions sx={{ p:2 }}>
                          <Button fullWidth variant="contained" disabled={borrowing}
                            startIcon={isAvail ? <BookIcon /> : <Bookmark />}
                            onClick={() => handleBorrow(book)}
                            sx={{
                              ...gradBtn(),
                              ...(isAvail ? {} : {
                                background:`linear-gradient(135deg,#f59e0b,#fbbf24)`,
                                '&:hover':{ background:`linear-gradient(135deg,#d97706,#f59e0b)` },
                              }),
                            }}>
                            {isAvail ? 'Borrow' : 'Reserve'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grow>
                  </Grid>
                );
              })}
            </Grid>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <Box sx={{ display:'flex', justifyContent:'center', mt:5 }}>
                <Pagination count={totalPages} page={page}
                  onChange={(_, v) => { setPage(v); window.scrollTo({ top:0, behavior:'smooth' }); }}
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root':{ fontWeight:700, borderRadius:2 },
                    '& .Mui-selected':{
                      background:`linear-gradient(135deg,${C.primary},${C.secondary}) !important`,
                      color:'white',
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* ── Confirm Dialog ── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}
        maxWidth="sm" fullWidth PaperProps={{ sx:{ borderRadius:3, overflow:'hidden' } }}>
        <DialogTitle sx={{
          background:`linear-gradient(135deg,${C.primary},${C.secondary})`,
          color:'white', fontWeight:700,
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          {selectedBook?.available_copies > 0 ? 'Confirm Borrow' : 'Confirm Reservation'}
          <IconButton onClick={() => setConfirmOpen(false)}
            sx={{ color:'white', '&:hover':{ bgcolor:'rgba(255,255,255,.2)' } }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt:3 }}>
          {/* book mini-card */}
          {selectedBook && (
            <Box sx={{ display:'flex', gap:2, mb:3, p:2,
              bgcolor:C.lighter, borderRadius:2, border:`1px solid ${C.light}` }}>
              <Avatar sx={{ width:56, height:56, flexShrink:0, background:coverGrad(selectedBook.id) }}>
                <AutoStories sx={{ color:'white', fontSize:28 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ color:C.dark }}>
                  {selectedBook.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">{selectedBook.author}</Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body1" sx={{ mb:2 }}>
            {selectedBook?.available_copies > 0
              ? `Borrow this book and return it within 14 days.`
              : `This book is currently unavailable. You'll be notified when it becomes available.`}
          </Typography>

          {selectedBook?.available_copies > 0 && (
            <Paper elevation={0} sx={{ p:2, bgcolor:C.lighter, borderRadius:2, border:`1px solid ${C.light}` }}>
              {[
                ['Loan Period',    '14 days'],
                ['Available Copies', selectedBook.available_copies],
                ['Due Date',       new Date(Date.now() + 14*86400000).toLocaleDateString()],
              ].map(([k,v]) => (
                <Box key={k} sx={{ display:'flex', justifyContent:'space-between', py:0.6 }}>
                  <Typography variant="body2" color="text.secondary">{k}</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color:C.primary }}>{v}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p:2.5, gap:1 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined"
            sx={{ borderColor:'#e5e7eb', color:'text.secondary', borderRadius:2, fontWeight:600 }}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              ...gradBtn(),
              ...(selectedBook?.available_copies === 0 ? {
                background:`linear-gradient(135deg,#f59e0b,#fbbf24)`,
                '&:hover':{ background:`linear-gradient(135deg,#d97706,#f59e0b)` },
              } : {}),
              px:3,
            }}>
            {selectedBook?.available_copies > 0 ? 'Confirm Borrow' : 'Confirm Reservation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snackbar.open} autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open:false }))}
        anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open:false }))}
          severity={snackbar.sev}
          icon={snackbar.sev === 'success' ? <CheckCircle /> : undefined}
          sx={{
            width:'100%', borderRadius:2, fontWeight:600,
            ...(snackbar.sev === 'success'
              ? { border:`1px solid ${C.secondary}`, bgcolor:C.lighter }
              : {}),
          }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

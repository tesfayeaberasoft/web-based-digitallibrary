import React, { useState, useEffect, useRef } from 'react';
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
  Favorite,
  FavoriteBorder,
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
import BookReviewsDialog from '../../components/books/BookReviewsDialog';

/* ── green palette ── */
const C = {
  primary:   '#2d6a4f',
  secondary: '#52b788',
  light:     '#d8f3dc',
  lighter:   '#f0fdf4',
  dark:      '#1b4332',
  accent:    '#95d5b2',
};

const API_BASE_URL = 'http://localhost:8000';

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

const getCoverImageUrl = (coverImage) => {
  if (typeof coverImage !== 'string' || !coverImage.trim()) return '';

  try {
    return new URL(coverImage.trim(), `${API_BASE_URL}/`).toString();
  } catch {
    return '';
  }
};

function BookCover({ book, isAvail, compact = false }) {
  const savedCover = getCoverImageUrl(book.cover_image);
  const isbn = typeof book.isbn === 'string' ? book.isbn.replace(/[^0-9X]/gi, '') : '';
  const isbnCover = isbn
    ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-M.jpg?default=false`
    : '';
  const sources = [savedCover, isbnCover].filter((source, index, all) => source && all.indexOf(source) === index);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [savedCover, isbnCover]);

  const handleImageError = () => {
    setSourceIndex((current) => Math.min(current + 1, sources.length));
  };

  const handleImageLoad = (event) => {
    if (event.currentTarget.naturalWidth <= 1) handleImageError(event);
  };

  return (
    <Box sx={{
      width: compact ? 56 : '100%',
      height: compact ? 76 : 220,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      p: compact ? 0 : 2,
      bgcolor: '#f3f6f4',
    }}>
      {sourceIndex < sources.length ? (
        <Box
          component="img"
          src={sources[sourceIndex]}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          onLoad={handleImageLoad}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      ) : (
        <Box sx={{ textAlign: 'center', color: '#718078' }}>
          <AutoStories sx={{ fontSize: compact ? 28 : 52, mb: compact ? 0 : 1, color: '#aab8af' }} />
          {!compact && (
            <Typography variant="caption" sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              fontWeight: 600,
              lineHeight: 1.35,
            }}>
              {book.title}
            </Typography>
          )}
        </Box>
      )}
      {!compact && (
        <Chip
          label={isAvail ? `${book.available_copies} Available` : 'Unavailable'}
          size="small"
          icon={isAvail
            ? <CheckCircle sx={{ fontSize: 13, color: `${C.primary} !important` }} />
            : <BookmarkBorder sx={{ fontSize: 13, color: '#64746a !important' }} />}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'rgba(255,255,255,.92)',
            color: isAvail ? C.primary : '#526158',
            fontWeight: 700,
            fontSize: '0.72rem',
            border: '1px solid rgba(255,255,255,.8)',
            boxShadow: '0 2px 8px rgba(25,45,32,.12)',
          }}
        />
      )}
    </Box>
  );
}

export default function BrowseBooks() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const searchInputRef = useRef(null);

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
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [reviewsBook, setReviewsBook] = useState(null);
  const LIMIT = 12;

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchBooks(); }, [page, searchQuery, selCategory, avail]); // eslint-disable-line
  useEffect(() => {
    let active = true;
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:8000/api/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (active && data.success) {
          setFavoriteIds(new Set((data.favorites || []).map((book) => Number(book.id))));
        }
      } catch (requestError) {
        if (active) console.error('Unable to load favorites:', requestError);
      }
    };
    fetchFavorites();
    return () => { active = false; };
  }, [user]);

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

  const handleReadOnline = (book) => {
    if (!user) {
      setSnackbar({ open: true, msg: 'Please login to read this eBook', sev: 'warning' });
      navigate('/login');
      return;
    }
    navigate(`/read/${book.id}`);
  };

  const handleFavoriteToggle = async (book) => {
    if (!user) {
      setSnackbar({ open: true, msg: 'Please login to save favorites', sev: 'warning' });
      navigate('/login');
      return;
    }
    const isFavorite = favoriteIds.has(Number(book.id));
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = isFavorite
        ? await axios.delete(`http://localhost:8000/api/favorites/${book.id}`, config)
        : await axios.post('http://localhost:8000/api/favorites', { book_id: book.id }, config);
      if (!data.success) throw new Error(data.message || 'Could not update favorites.');
      setFavoriteIds((current) => {
        const next = new Set(current);
        if (isFavorite) next.delete(Number(book.id));
        else next.add(Number(book.id));
        return next;
      });
      setSnackbar({
        open: true,
        msg: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        sev: 'success'
      });
    } catch (requestError) {
      setSnackbar({
        open: true,
        msg: requestError.response?.data?.message || requestError.message || 'Could not update favorites.',
        sev: 'error'
      });
    }
  };

  const handleReviewsUpdated = (bookId, summary) => {
    setBooks((current) => current.map((book) => (
      Number(book.id) === Number(bookId)
        ? { ...book, avg_rating: summary.average_rating, review_count: summary.review_count }
        : book
    )));
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
  const focusSearch = () => {
    const searchInput = searchInputRef.current;
    searchInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    searchInput?.focus({ preventScroll: true });
  };

  /* ─────────────────────── render ─────────────────────── */
  return (
    <Box sx={{ bgcolor: C.lighter, minHeight: '100vh' }}>
      <Navbar title="Digital Library" showUserMenu browseHeader />

      {/* ── Hero Banner ── */}
      <Box sx={{
        background: `radial-gradient(ellipse at 82% 12%, rgba(149,213,178,.42), transparent 36%), linear-gradient(120deg, ${C.dark} 0%, ${C.primary} 55%, ${C.secondary} 100%)`,
        py: { xs: 5, md: 8 },
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background: 'linear-gradient(100deg, transparent 20%, rgba(255,255,255,.07) 50%, transparent 80%)',
          backgroundSize: '220% 100%',
          transition: 'background-position 700ms ease',
        },
        '&:hover::after': { backgroundPosition: '100% 0' },
      }}>
        {/* Decorative shapes */}
        {[
          { s: 340, t: -135, r: -85, opacity: 0.11 },
          { s: 220, b: -130, l: '42%', opacity: 0.08 },
          { s: 145, t: '36%', r: '17%', opacity: 0.07 },
        ].map((c, i) => (
          <Box key={i} sx={{
            position: 'absolute',
            width: c.s,
            height: c.s,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,.34)',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.2), rgba(255,255,255,.015) 70%)',
            top: c.t,
            bottom: c.b,
            left: c.l,
            right: c.r,
            opacity: c.opacity,
            pointerEvents: 'none',
            transition: 'transform 600ms ease, opacity 600ms ease',
            '.browse-books-hero:hover &': {
              transform: `translate(${i % 2 ? '-8px' : '8px'}, ${i % 2 ? '6px' : '-6px'})`,
              opacity: c.opacity + 0.04,
            },
          }} />
        ))}
        <Container className="browse-books-hero" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 3,
            flexWrap: 'wrap',
          }}>
            <Box sx={{ flex: '1 1 360px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Avatar sx={{
                  width: { xs: 52, md: 62 },
                  height: { xs: 52, md: 62 },
                  bgcolor: 'rgba(255,255,255,.16)',
                  border: '1px solid rgba(255,255,255,.32)',
                  boxShadow: '0 8px 24px rgba(8,43,28,.16)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <LibraryBooks sx={{ fontSize: { xs: 29, md: 34 }, color: 'white' }} />
                </Avatar>
                <Box>
                  <Typography variant="overline" sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,.72)',
                    fontWeight: 800,
                    letterSpacing: '.18em',
                    lineHeight: 1.5,
                  }}>
                    YOUR NEXT CHAPTER STARTS HERE
                  </Typography>
                  <Typography variant="h3" fontWeight={900} sx={{
                    color: 'white',
                    fontSize: { xs: '2rem', sm: '2.65rem', md: '3.35rem' },
                    letterSpacing: '-.045em',
                    lineHeight: 1.08,
                    textShadow: '0 3px 18px rgba(10,47,30,.2)',
                  }}>
                    Browse Books
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h6" sx={{
                color: 'rgba(255,255,255,.86)',
                fontWeight: 400,
                maxWidth: 520,
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.65,
              }}>
                Find your next favourite read from a collection made for curious minds.
              </Typography>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={focusSearch}
                sx={{
                  mt: 3,
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 2.5,
                  color: C.dark,
                  bgcolor: 'white',
                  fontWeight: 800,
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(8,43,28,.2)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
                  '&:hover': {
                    bgcolor: '#f2fff6',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(8,43,28,.26)',
                  },
                  '&:focus-visible': { outline: '3px solid rgba(255,255,255,.65)', outlineOffset: 3 },
                }}
              >
                Start exploring
              </Button>
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, minmax(0, 1fr))', sm: '1fr' },
              gap: 1.2,
              width: { xs: '100%', sm: 220 },
              flexShrink: 0,
            }}>
            {[
              { value: totalBooks, label: 'Books' },
              { value: available, label: 'Available now' },
              { value: categories.length, label: 'Categories' },
            ].map((stat) => (
              <Box key={stat.label} sx={{
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 1.25 },
                borderRadius: 2.5,
                textAlign: { xs: 'center', sm: 'left' },
                bgcolor: 'rgba(255,255,255,.12)',
                border: '1px solid rgba(255,255,255,.22)',
                backdropFilter: 'blur(12px)',
                transition: 'transform 180ms ease, background-color 180ms ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  bgcolor: 'rgba(255,255,255,.19)',
                },
              }}>
                <Typography sx={{
                  color: 'white',
                  fontSize: { xs: '1.2rem', sm: '1.45rem' },
                  fontWeight: 850,
                  lineHeight: 1.1,
                }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" sx={{
                  color: 'rgba(255,255,255,.78)',
                  fontWeight: 650,
                  fontSize: { xs: '.65rem', sm: '.76rem' },
                }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
            </Box>
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
              <TextField inputRef={searchInputRef} fullWidth placeholder="Search by title, author, or ISBN…"
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
                        <BookCover book={book} isAvail={isAvail} />

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
                              onClick={() => setReviewsBook(book)}
                              sx={{ cursor: 'pointer', '& .MuiRating-iconFilled':{ color:C.secondary } }}
                            />
                            <Button
                              size="small"
                              onClick={() => setReviewsBook(book)}
                              sx={{ minWidth: 0, p: 0, color: 'text.secondary', fontWeight: 600 }}
                            >
                              {book.review_count || 0} reviews
                            </Button>
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
                        <CardActions sx={{ p:2, gap:1 }}>
                          <Tooltip title={favoriteIds.has(Number(book.id)) ? 'Remove from favorites' : 'Add to favorites'}>
                            <IconButton
                              aria-label={favoriteIds.has(Number(book.id)) ? 'Remove from favorites' : 'Add to favorites'}
                              color={favoriteIds.has(Number(book.id)) ? 'error' : 'default'}
                              onClick={() => handleFavoriteToggle(book)}
                            >
                              {favoriteIds.has(Number(book.id)) ? <Favorite /> : <FavoriteBorder />}
                            </IconButton>
                          </Tooltip>
                          <Button
                            variant="outlined"
                            startIcon={<Star />}
                            onClick={() => setReviewsBook(book)}
                            sx={{ ...gradBtn(true), flex: 1, minWidth: 0 }}
                          >
                            Review
                          </Button>
                          {book.can_read_online && (
                            <Button variant="outlined" startIcon={<AutoStories />}
                              onClick={() => handleReadOnline(book)}
                              sx={{ ...gradBtn(true), flex:1, minWidth:0 }}>
                              Read Online
                            </Button>
                          )}
                          <Button fullWidth variant="contained" disabled={borrowing}
                            startIcon={isAvail ? <BookIcon /> : <Bookmark />}
                            onClick={() => handleBorrow(book)}
                            sx={{
                              ...gradBtn(),
                              flex:1,
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
              <BookCover
                book={selectedBook}
                isAvail={selectedBook.available_copies > 0}
                compact
              />
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
      <BookReviewsDialog
        open={Boolean(reviewsBook)}
        book={reviewsBook}
        isAuthenticated={Boolean(user)}
        onClose={() => setReviewsBook(null)}
        onUpdated={(summary) => handleReviewsUpdated(reviewsBook?.id, summary)}
      />
    </Box>
  );
}

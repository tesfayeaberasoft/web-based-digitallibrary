import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  IconButton, Drawer, List, ListItem, ListItemText, Chip,
  Avatar, Rating, Divider, useScrollTrigger, Slide, AppBar,
  Toolbar, useMediaQuery, useTheme, Fade, Grow, CircularProgress,
  ClickAwayListener, Popper
} from '@mui/material';
import {
  MenuBook, People, TrendingUp, Star, Search, ArrowForward,
  Menu as MenuIcon, Close, LibraryBooks, Schedule, EmojiEvents,
  Smartphone, Cloud, Security, CheckCircle, Facebook, Twitter,
  Instagram, LinkedIn, YouTube, Email, Phone, LocationOn,
  AutoStories, Bookmark, Notifications, Analytics, KeyboardArrowUp
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/* ─── Sticky hide-on-scroll helper ─────────────────────────────── */
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

/* ─── Colour palette ────────────────────────────────────────────── */
const C = {
  primary:   '#2d6a4f',
  secondary: '#52b788',
  accent:    '#f77f00',
  purple:    '#7c3aed',
  pink:      '#db2777',
  blue:      '#1d4ed8',
  teal:      '#0f766e',
  orange:    '#ea580c',
  gold:      '#d97706',
  dark:      '#1a1a2e',
  light:     '#f0fdf4',
};

/* ─── Images (high-quality library & reading images) ───────────── */
const IMG = {
  hero:       'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1400&q=85',  // Library interior
  shelves:    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&q=85',   // Colorful books
  reader:     'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=85',   // Open books
  student:    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=85',   // Students studying
  team:       'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=85',   // Happy readers
  digital:    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&q=85',   // Digital reading
  ladder:     'https://images.unsplash.com/photo-1568667256549-094345857637?w=900&q=85',   // Library ladder
  cozy:       'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=900&q=85',   // Cozy reading
};

/* ─── Testimonials (static — can be replaced with DB data) ─────── */
const TESTIMONIALS = [
  {
    name:   'Sarah Johnson',
    role:   'University Student',
    avatar: 'https://i.pravatar.cc/100?img=47',
    rating: 5,
    text:   'This digital library transformed how I study. I can access thousands of books anytime, anywhere. The reservation system is incredibly smooth!',
  },
  {
    name:   'Dr. Michael Chen',
    role:   'Research Professor',
    avatar: 'https://i.pravatar.cc/100?img=12',
    rating: 5,
    text:   'Outstanding collection of academic resources. The search functionality and category filtering saved me countless hours of research time.',
  },
  {
    name:   'Amina Tesfaye',
    role:   'High School Teacher',
    avatar: 'https://i.pravatar.cc/100?img=32',
    rating: 5,
    text:   'My students love using this platform. The reading goals and achievements feature keeps them motivated and engaged with books every day.',
  },
];

/* ─── Features with green color scheme ────────────────────────── */
const FEATURES = [
  { 
    icon: <Search sx={{ fontSize: 40 }} />, 
    title: 'Smart Search', 
    desc: 'Find any book instantly by title, author, ISBN or category with our AI-powered search engine.',
    gradient: `linear-gradient(135deg, ${C.secondary} 0%, ${C.primary} 100%)`,
    color: C.secondary,
    lightBg: C.light,
    emoji: '🔍'
  },
  { 
    icon: <Bookmark sx={{ fontSize: 40 }} />, 
    title: 'Easy Reservations', 
    desc: 'Reserve books online, get instant notifications, and pick them up at your convenience.',
    gradient: `linear-gradient(135deg, ${C.primary} 0%, #1e5a3c 100%)`,
    color: C.primary,
    lightBg: '#e8f5e0',
    emoji: '📚'
  },
  { 
    icon: <Notifications sx={{ fontSize: 40 }} />, 
    title: 'Smart Reminders', 
    desc: 'Never miss a due date. Automatic reminders for returns, reservations, and new arrivals.',
    gradient: `linear-gradient(135deg, #52b788 0%, #2d6a4f 100%)`,
    color: '#52b788',
    lightBg: '#d8f3dc',
    emoji: '🔔'
  },
  { 
    icon: <Analytics sx={{ fontSize: 40 }} />, 
    title: 'Reading Analytics', 
    desc: 'Track your reading progress, set goals, earn achievements and compete with other readers.',
    gradient: `linear-gradient(135deg, #74c69d 0%, ${C.secondary} 100%)`,
    color: '#74c69d',
    lightBg: '#e8f5e0',
    emoji: '📊'
  },
  { 
    icon: <Cloud sx={{ fontSize: 40 }} />, 
    title: 'Digital Access', 
    desc: 'Access PDF and EPUB books online directly from your browser — no downloads needed.',
    gradient: `linear-gradient(135deg, #95d5b2 0%, #74c69d 100%)`,
    color: '#95d5b2',
    lightBg: '#f0fdf4',
    emoji: '☁️'
  },
  { 
    icon: <Security sx={{ fontSize: 40 }} />, 
    title: 'Secure & Reliable', 
    desc: 'Your data is protected with industry-standard encryption and 99.9% uptime guarantee.',
    gradient: `linear-gradient(135deg, ${C.primary} 0%, #1a4d35 100%)`,
    color: C.primary,
    lightBg: '#d8f3dc',
    emoji: '🔒'
  },
];

/* ══════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate  = useNavigate();
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down('sm'));

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [stats,       setStats]       = useState(null);
  const [categories,  setCategories]  = useState([]);
  const [popularBooks,setPopularBooks]= useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visible,     setVisible]     = useState(false);
  const [scrollY,     setScrollY]     = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchType, setSearchType] = useState('all'); // 'all', 'title', 'author', 'isbn'
  const [isSearching, setIsSearching] = useState(false);

  // Parallax scroll effect and scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setVisible(true);
    axios.get('http://localhost:8000/api/public/stats')
      .then(r => {
        if (r.data.success) {
          setStats(r.data.data.stats);
          setCategories(r.data.data.categories || []);
          setPopularBooks(r.data.data.popular_books || []);
        }
      })
      .catch(() => {
        setStats({ total_books: 500, total_members: 1200, total_loans: 8500, avg_rating: 4.8, total_categories: 12 });
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams({
        search: searchQuery.trim(),
      });
      if (searchType !== 'all') {
        searchParams.append('type', searchType);
      }
      navigate(`/browse?${searchParams.toString()}`);
      setShowSuggestions(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
      const yOffset = -80; // Account for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Fetch search suggestions as user types
  const fetchSearchSuggestions = async (query) => {
    if (query.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get('http://localhost:8000/api/books', {
        params: {
          search: query,
          limit: 5
        }
      });

      if (response.data.success && response.data.books) {
        setSearchSuggestions(response.data.books);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && showSuggestions) {
        fetchSearchSuggestions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, showSuggestions]);

  const navLinks = [
    { label: 'Home',       path: '/',          type: 'route'   },
    { label: 'Browse',     path: '/browse',    type: 'route'   },
    { label: 'Features',   path: '#features',  type: 'scroll'  },
    { label: 'Categories', path: '#categories', type: 'scroll' },
    { label: 'Popular',    path: '#popular',   type: 'scroll'  },
  ];

  /* ── stat cards data (uses live DB) ────────────────────────────── */
  const statCards = [
    { icon: <MenuBook sx={{ fontSize: 40 }} />,    label: 'Total Books',    value: stats ? stats.total_books.toLocaleString()   : '…', color: C.blue,    bg: '#eff6ff' },
    { icon: <People sx={{ fontSize: 40 }} />,      label: 'Active Members', value: stats ? stats.total_members.toLocaleString() : '…', color: C.purple,  bg: '#f5f3ff' },
    { icon: <TrendingUp sx={{ fontSize: 40 }} />,  label: 'Books Borrowed', value: stats ? stats.total_loans.toLocaleString()   : '…', color: C.orange,  bg: '#fff7ed' },
    { icon: <Star sx={{ fontSize: 40 }} />,        label: 'Avg Rating',     value: stats ? `${stats.avg_rating}★`              : '…', color: C.gold,    bg: '#fffbeb' },
  ];

  return (
    <Box sx={{ overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ══════════════════════════════════════════════════════════
          1. NAVIGATION BAR
      ══════════════════════════════════════════════════════════ */}
      <HideOnScroll>
        <AppBar
          elevation={0}
          sx={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(45,106,79,0.12)',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 6 }, minHeight: { xs: 64, md: 72 } }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{ width: 38, height: 38, borderRadius: 2, background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LibraryBooks sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} sx={{ color: C.primary, letterSpacing: '-0.5px', display: { xs: 'none', sm: 'block' } }}>
                DigiLib
              </Typography>
            </Box>

            {/* Nav links — desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1 }}>
              {navLinks.map(l => (
                <Button
                  key={l.label}
                  onClick={() => l.type === 'scroll' ? scrollToSection(l.path) : navigate(l.path)}
                  sx={{ color: '#374151', fontWeight: 600, fontSize: 15, px: 2, borderRadius: 2, '&:hover': { color: C.primary, background: C.light } }}
                >
                  {l.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{ display: { xs: 'none', sm: 'flex' }, borderColor: C.primary, color: C.primary, fontWeight: 600, borderRadius: 3, '&:hover': { background: C.light } }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, color: 'white', fontWeight: 700, borderRadius: 3, px: 3, boxShadow: '0 4px 15px rgba(45,106,79,0.35)', '&:hover': { boxShadow: '0 6px 20px rgba(45,106,79,0.45)' } }}
              >
                {isMobile ? 'Join' : 'Get Started'}
              </Button>
              <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileOpen(true)}>
                <MenuIcon sx={{ color: C.primary }} />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)} PaperProps={{ sx: { width: 280, p: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: C.primary }}>DigiLib</Typography>
          <IconButton onClick={() => setMobileOpen(false)}><Close /></IconButton>
        </Box>
        <List>
          {navLinks.map(l => (
            <ListItem 
              key={l.label} 
              button 
              onClick={() => { 
                setMobileOpen(false); 
                l.type === 'scroll' ? scrollToSection(l.path) : navigate(l.path);
              }} 
              sx={{ borderRadius: 2, mb: 1, '&:hover': { background: C.light } }}
            >
              <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 600, color: '#374151' }} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button fullWidth variant="outlined" onClick={() => { setMobileOpen(false); navigate('/login'); }} sx={{ borderColor: C.primary, color: C.primary, fontWeight: 600, borderRadius: 3 }}>Sign In</Button>
          <Button fullWidth variant="contained" onClick={() => { setMobileOpen(false); navigate('/register'); }} sx={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, fontWeight: 700, borderRadius: 3 }}>Get Started</Button>
        </Box>
      </Drawer>

      {/* Toolbar spacer */}
      <Box sx={{ minHeight: { xs: 64, md: 72 } }} />

      {/* ══════════════════════════════════════════════════════════
          2. HERO SECTION
      ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          minHeight: { xs: '92vh', md: '88vh' },
          background: `linear-gradient(135deg, #0a2e1f 0%, #1a4d35 40%, #2d6a4f 100%)`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background library image with parallax */}
        <Box sx={{
          position: 'absolute', 
          inset: 0,
          backgroundImage: `url(${IMG.hero})`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.18,
          transform: `translateY(${scrollY * 0.3}px)`,
          transition: 'transform 0.1s linear'
        }} />
        {/* Gradient overlay */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,46,31,0.95) 0%, rgba(10,46,31,0.7) 60%, rgba(10,46,31,0.3) 100%)' }} />

        {/* Animated decorative circles */}
        {[
          { size: 500, top: -150, right: -100, opacity: 0.06, delay: 0 },
          { size: 300, bottom: -80, left:  -60, opacity: 0.08, delay: 1 },
          { size: 200, top:  '30%', right: '15%', opacity: 0.05, delay: 2 },
        ].map((c, i) => (
          <Fade in={visible} timeout={1000 + c.delay * 500} key={i}>
            <Box sx={{ 
              position: 'absolute', 
              width: c.size, 
              height: c.size, 
              borderRadius: '50%', 
              border: '2px solid rgba(82,183,136,0.4)', 
              top: c.top, 
              bottom: c.bottom, 
              left: c.left, 
              right: c.right, 
              opacity: c.opacity,
              animation: 'pulse 4s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' }
              }
            }} />
          </Fade>
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 8, md: 4 } }}>
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
            {/* Left — text */}
            <Grid item xs={12} md={6}>
              <Fade in={visible} timeout={800}>
                <Box>
                  <Chip label="🚀 Now with Digital Books" sx={{ mb: 3, background: 'rgba(82,183,136,0.2)', color: '#86efac', border: '1px solid rgba(82,183,136,0.3)', fontWeight: 600 }} />
                  <Typography
                    variant={isMobile ? 'h3' : 'h2'}
                    fontWeight={900}
                    sx={{ color: 'white', lineHeight: 1.15, mb: 3, letterSpacing: '-1px' }}
                  >
                    Your Gateway to
                    <Box component="span" sx={{ display: 'block', background: 'linear-gradient(90deg, #52b788, #95d5b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Infinite Knowledge
                    </Box>
                  </Typography>
                  <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ color: 'rgba(255,255,255,0.8)', mb: 5, lineHeight: 1.7, maxWidth: 480 }}>
                    Explore {stats ? stats.total_books.toLocaleString() : '500+'} books across {stats ? stats.total_categories : '12'} categories. Borrow, reserve, and read — all from one beautifully designed platform.
                  </Typography>

                  {/* Advanced Search Bar with Autocomplete */}
                  <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                    <Box sx={{ position: 'relative', maxWidth: 580, mb: 4 }}>
                      <Box 
                        component="form" 
                        onSubmit={handleSearch} 
                        sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0, 
                          background: 'rgba(255,255,255,0.12)', 
                          borderRadius: 3, 
                          border: '2px solid rgba(255,255,255,0.2)', 
                          overflow: 'hidden', 
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:focus-within': {
                            border: `2px solid ${C.secondary}`,
                            boxShadow: `0 0 0 4px ${C.secondary}20`
                          }
                        }}
                      >
                        {/* Main Search Input */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', px: 2.5, py: 0.5 }}>
                            <Search sx={{ color: 'rgba(255,255,255,0.7)', mr: 1.5, fontSize: 22 }} />
                            <Box
                              component="input"
                              value={searchQuery}
                              onChange={e => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                              }}
                              onFocus={() => setShowSuggestions(true)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSearch(e);
                                }
                              }}
                              placeholder="Search by title, author, ISBN, or keyword..."
                              autoComplete="off"
                              sx={{ 
                                border: 'none', 
                                background: 'transparent', 
                                outline: 'none', 
                                color: 'white', 
                                fontSize: 15.5, 
                                width: '100%',
                                fontWeight: 500,
                                '&::placeholder': { color: 'rgba(255,255,255,0.6)' } 
                              }}
                            />
                            {isSearching && (
                              <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.7)', mr: 1 }} />
                            )}
                          </Box>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={!searchQuery.trim()}
                            sx={{ 
                              m: 0.75, 
                              borderRadius: 2, 
                              background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`, 
                              px: 3, 
                              py: 1.5,
                              fontWeight: 700, 
                              minWidth: 'auto',
                              '&:disabled': {
                                background: 'rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.5)'
                              },
                              '&:hover:not(:disabled)': {
                                background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Search
                          </Button>
                        </Box>

                        {/* Search Type Filter Chips */}
                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1, 
                          px: 2.5, 
                          py: 1.5, 
                          borderTop: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(0,0,0,0.1)'
                        }}>
                          {[
                            { value: 'all', label: 'All Fields', icon: '🔍' },
                            { value: 'title', label: 'Title', icon: '📖' },
                            { value: 'author', label: 'Author', icon: '✍️' },
                            { value: 'isbn', label: 'ISBN', icon: '🔢' }
                          ].map((type) => (
                            <Chip
                              key={type.value}
                              label={`${type.icon} ${type.label}`}
                              onClick={() => setSearchType(type.value)}
                              sx={{
                                background: searchType === type.value 
                                  ? 'rgba(255,255,255,0.25)' 
                                  : 'rgba(255,255,255,0.1)',
                                color: 'white',
                                fontWeight: searchType === type.value ? 700 : 500,
                                fontSize: { xs: 11, md: 12 },
                                height: { xs: 26, md: 28 },
                                cursor: 'pointer',
                                border: searchType === type.value 
                                  ? '2px solid rgba(255,255,255,0.4)' 
                                  : '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.2)',
                                  transform: 'scale(1.05)'
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Autocomplete Suggestions Dropdown */}
                      {showSuggestions && searchQuery.trim().length >= 2 && searchSuggestions.length > 0 && (
                        <Fade in timeout={200}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              mt: 1,
                              background: 'rgba(255,255,255,0.98)',
                              backdropFilter: 'blur(20px)',
                              borderRadius: 3,
                              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                              border: `2px solid ${C.secondary}40`,
                              maxHeight: 400,
                              overflowY: 'auto',
                              zIndex: 1000,
                              '&::-webkit-scrollbar': {
                                width: '8px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: C.secondary,
                                borderRadius: '4px',
                              },
                            }}
                          >
                            <Box sx={{ p: 2 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', px: 1 }}>
                                Search Results ({searchSuggestions.length})
                              </Typography>
                              <List sx={{ p: 0, mt: 1 }}>
                                {searchSuggestions.map((book, index) => (
                                  <ListItem
                                    key={book.id}
                                    button
                                    onClick={() => {
                                      navigate(`/browse?search=${encodeURIComponent(book.title)}`);
                                      setShowSuggestions(false);
                                    }}
                                    sx={{
                                      borderRadius: 2,
                                      mb: 0.5,
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        background: C.light,
                                        transform: 'translateX(4px)'
                                      }
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 50,
                                          borderRadius: 1,
                                          background: `linear-gradient(135deg, ${C.primary}40, ${C.secondary}40)`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0
                                        }}
                                      >
                                        <MenuBook sx={{ color: C.primary, fontSize: 24 }} />
                                      </Box>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="body2"
                                          fontWeight={700}
                                          sx={{
                                            color: C.dark,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {book.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                          by {book.author}
                                        </Typography>
                                        {book.isbn && (
                                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: 10 }}>
                                            ISBN: {book.isbn}
                                          </Typography>
                                        )}
                                      </Box>
                                      {book.available_copies > 0 ? (
                                        <Chip
                                          label="Available"
                                          size="small"
                                          sx={{
                                            background: `${C.secondary}20`,
                                            color: C.primary,
                                            fontWeight: 700,
                                            fontSize: 10
                                          }}
                                        />
                                      ) : (
                                        <Chip
                                          label="Unavailable"
                                          size="small"
                                          sx={{
                                            background: '#ff000020',
                                            color: '#d32f2f',
                                            fontWeight: 700,
                                            fontSize: 10
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </ListItem>
                                ))}
                              </List>
                              <Button
                                fullWidth
                                variant="text"
                                onClick={() => {
                                  handleSearch({ preventDefault: () => {} });
                                  setShowSuggestions(false);
                                }}
                                sx={{
                                  mt: 1,
                                  color: C.primary,
                                  fontWeight: 700,
                                  '&:hover': {
                                    background: C.light
                                  }
                                }}
                              >
                                View All Results →
                              </Button>
                            </Box>
                          </Box>
                        </Fade>
                      )}

                      {/* No Results Message */}
                      {showSuggestions && searchQuery.trim().length >= 2 && !isSearching && searchSuggestions.length === 0 && (
                        <Fade in timeout={200}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              mt: 1,
                              background: 'rgba(255,255,255,0.98)',
                              backdropFilter: 'blur(20px)',
                              borderRadius: 3,
                              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                              border: `2px solid ${C.secondary}40`,
                              p: 3,
                              textAlign: 'center',
                              zIndex: 1000
                            }}
                          >
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                              No books found matching "{searchQuery}"
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Try different keywords or browse all books
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate('/browse')}
                              sx={{ mt: 2, borderColor: C.primary, color: C.primary }}
                            >
                              Browse All Books
                            </Button>
                          </Box>
                        </Fade>
                      )}
                    </Box>
                  </ClickAwayListener>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      onClick={() => navigate('/register')}
                      sx={{ 
                        background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`, 
                        color: 'white', 
                        fontWeight: 700, 
                        borderRadius: 3, 
                        px: 4, 
                        py: 1.5, 
                        fontSize: 16, 
                        boxShadow: `0 8px 25px ${C.secondary}50`, 
                        '&:hover': { 
                          transform: 'translateY(-2px) scale(1.05)', 
                          boxShadow: `0 12px 30px ${C.secondary}60` 
                        }, 
                        transition: 'all 0.3s' 
                      }}
                    >
                      Start Reading Free
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/browse')}
                      sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, borderRadius: 3, px: 4, py: 1.5, fontSize: 16, '&:hover': { borderColor: 'white', background: 'rgba(255,255,255,0.1)' } }}
                    >
                      Browse Books
                    </Button>
                  </Box>

                  {/* Trust row */}
                  <Box sx={{ display: 'flex', gap: 3, mt: 5, flexWrap: 'wrap' }}>
                    {[
                      { v: stats ? stats.total_books.toLocaleString() : '500+', l: 'Books' },
                      { v: stats ? stats.total_members.toLocaleString() : '1K+', l: 'Members' },
                      { v: stats ? `${stats.avg_rating}★` : '4.8★', l: 'Rating' },
                    ].map((s, i) => (
                      <Box key={i} sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#86efac' }}>{s.v}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.l}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Fade>
            </Grid>

            {/* Right — image collage */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Fade in={visible} timeout={1200}>
                <Box sx={{ position: 'relative', height: 500 }}>
                  {/* Main image */}
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: '75%', height: '70%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
                    <Box component="img" src={IMG.shelves} alt="Library shelves" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  {/* Secondary image */}
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '55%', height: '55%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '3px solid rgba(82,183,136,0.4)' }}>
                    <Box component="img" src={IMG.reader} alt="Reading" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  {/* Floating card */}
                  <Box sx={{ position: 'absolute', top: '40%', left: '15%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 3, p: 2, minWidth: 160 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <CheckCircle sx={{ color: '#86efac', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>New arrival!</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                      {popularBooks[0]?.title || 'The Great Gatsby'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#86efac' }}>Just added today</Typography>
                  </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          LIVE STATS BANNER - ENHANCED
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ 
        background: `linear-gradient(135deg, #1a4d35 0%, ${C.primary} 30%, ${C.secondary} 70%, #95d5b2 100%)`, 
        py: { xs: 6, md: 8 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated wave pattern background */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'wave\' x=\'0\' y=\'0\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M0 50 Q25 30 50 50 T100 50\' stroke=\'rgba(255,255,255,0.1)\' fill=\'none\' stroke-width=\'2\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill=\'url(%23wave)\' width=\'100%25\' height=\'100%25\'/%3E%3C/svg%3E")',
          animation: 'waveMove 20s linear infinite',
          '@keyframes waveMove': {
            '0%': { backgroundPosition: '0 0' },
            '100%': { backgroundPosition: '100px 0' }
          }
        }} />

        {/* Floating geometric shapes */}
        {[
          { size: 150, top: '10%', left: '5%', delay: 0, shape: 'circle' },
          { size: 100, top: '60%', right: '10%', delay: 2, shape: 'square' },
          { size: 120, bottom: '15%', left: '15%', delay: 4, shape: 'triangle' },
          { size: 80, top: '30%', right: '20%', delay: 1, shape: 'circle' },
        ].map((item, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: item.size,
              height: item.size,
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              background: item.shape === 'circle' 
                ? 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)'
                : 'rgba(255,255,255,0.08)',
              borderRadius: item.shape === 'circle' ? '50%' : item.shape === 'square' ? '20%' : 0,
              transform: item.shape === 'triangle' ? 'rotate(45deg)' : 'none',
              animation: `float${i} ${8 + item.delay}s ease-in-out infinite`,
              [`@keyframes float${i}`]: {
                '0%, 100%': { transform: `translateY(0px) ${item.shape === 'triangle' ? 'rotate(45deg)' : ''}` },
                '50%': { transform: `translateY(-${20 + i * 5}px) ${item.shape === 'triangle' ? 'rotate(45deg)' : ''}` }
              }
            }}
          />
        ))}
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Section Header */}
          <Fade in={visible} timeout={800}>
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                fontWeight={900} 
                sx={{ 
                  color: 'white', 
                  mb: 1,
                  textShadow: '0 2px 15px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.5px'
                }}
              >
                📊 Real-Time Library Stats
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 500,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                Live metrics from our growing digital library community
              </Typography>
            </Box>
          </Fade>

          {/* Enhanced Stat Cards Grid */}
          <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
            {statCards.map((s, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Grow in={visible} timeout={700 + i * 150}>
                  <Card
                    elevation={0}
                    sx={{ 
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(255,255,255,0.25)',
                      borderRadius: 4,
                      p: { xs: 2.5, md: 3.5 },
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                        transform: 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.4s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.03)',
                        background: 'rgba(255,255,255,0.2)',
                        boxShadow: `0 20px 50px rgba(0,0,0,0.3)`,
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&::before': {
                          transform: 'scaleX(1)'
                        },
                        '& .stat-icon': {
                          transform: 'scale(1.2) rotate(10deg)',
                          background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)`
                        },
                        '& .stat-value': {
                          transform: 'scale(1.1)',
                          color: '#fff'
                        },
                        '& .stat-progress': {
                          width: '100%'
                        }
                      }
                    }}
                  >
                    {/* Background glow effect */}
                    <Box sx={{
                      position: 'absolute',
                      inset: 0,
                      background: `radial-gradient(circle at center, ${s.color}20, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      '.MuiCard-root:hover &': {
                        opacity: 1
                      }
                    }} />

                    {/* Icon Container */}
                    <Box 
                      className="stat-icon"
                      sx={{ 
                        display: 'inline-flex', 
                        p: { xs: 1.8, md: 2.2 }, 
                        borderRadius: 3, 
                        background: s.bg,
                        mb: { xs: 2, md: 2.5 },
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: `2px solid ${s.color}40`,
                        boxShadow: `0 4px 15px ${s.color}30`
                      }}
                    >
                      {React.cloneElement(s.icon, { sx: { fontSize: { xs: 32, md: 40 }, color: s.color } })}
                      
                      {/* Pulse effect */}
                      <Box sx={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: 3,
                        border: `2px solid ${s.color}`,
                        opacity: 0,
                        animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 0.6 },
                          '100%': { transform: 'scale(1.3)', opacity: 0 }
                        }
                      }} />
                    </Box>

                    {/* Value */}
                    <Typography 
                      className="stat-value"
                      variant={isMobile ? 'h4' : 'h3'} 
                      fontWeight={900} 
                      sx={{ 
                        color: 'white', 
                        lineHeight: 1,
                        mb: 1,
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        letterSpacing: '-1px'
                      }}
                    >
                      {s.value}
                    </Typography>

                    {/* Label */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.95)', 
                        fontWeight: 700,
                        fontSize: { xs: 13, md: 15 },
                        mb: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      {s.label}
                    </Typography>

                    {/* Progress Bar */}
                    <Box sx={{ 
                      width: '100%', 
                      height: 4, 
                      borderRadius: 2, 
                      background: 'rgba(255,255,255,0.2)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <Box 
                        className="stat-progress"
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: '70%',
                          background: `linear-gradient(90deg, ${s.color}, ${s.color}aa)`,
                          borderRadius: 2,
                          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: `0 0 10px ${s.color}`
                        }}
                      />
                    </Box>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* Additional Metrics Row */}
          <Fade in={visible} timeout={1200}>
            <Box sx={{ 
              mt: { xs: 4, md: 6 }, 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: { xs: 2, md: 3 },
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {[
                { icon: '🔥', label: 'Trending', value: 'Technology' },
                { icon: '⚡', label: 'Most Borrowed', value: 'The Great Gatsby' },
                { icon: '🎯', label: 'Completion Rate', value: '94%' },
                { icon: '📈', label: 'Growth', value: '+12% This Month' }
              ].map((metric, i) => (
                <Grow in={visible} timeout={1300 + i * 100} key={i}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      px: { xs: 2, md: 3 },
                      py: { xs: 1.2, md: 1.5 },
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.25)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.25)',
                        transform: 'scale(1.05)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    <Typography sx={{ fontSize: { xs: 20, md: 24 } }}>
                      {metric.icon}
                    </Typography>
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.8)', 
                          display: 'block',
                          fontSize: { xs: 10, md: 11 },
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {metric.label}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'white', 
                          fontWeight: 800,
                          fontSize: { xs: 13, md: 14 }
                        }}
                      >
                        {metric.value}
                      </Typography>
                    </Box>
                  </Box>
                </Grow>
              ))}
            </Box>
          </Fade>

          {/* Call to Action */}
          <Fade in={visible} timeout={1400}>
            <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 6 } }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  mb: 3,
                  fontWeight: 600
                }}
              >
                Join our community and start your reading journey today!
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    background: 'white',
                    color: C.primary,
                    fontWeight: 800,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                    '&:hover': {
                      background: '#f0fdf4',
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: '0 12px 35px rgba(255,255,255,0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => scrollToSection('#features')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.8)',
                    borderWidth: 2,
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      borderColor: 'white',
                      borderWidth: 2,
                      background: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-3px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Explore Features
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          3. FEATURES / VALUE PROPOSITION - ENHANCED
      ══════════════════════════════════════════════════════════ */}
      <Box id="features" sx={{ py: { xs: 10, md: 14 }, background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Animated background gradient orbs - green theme */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 20%, ${C.secondary}10 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${C.primary}10 0%, transparent 50%)`,
          animation: 'gradientShift 15s ease infinite',
          '@keyframes gradientShift': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(20px, -20px) scale(1.1)' }
          }
        }} />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Section header with animation */}
          <Fade in={visible} timeout={800}>
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label="✨ Why Choose DigiLib?" 
                  sx={{ 
                    mb: 2, 
                    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 15,
                    px: 3,
                    py: 2.5,
                    height: 'auto',
                    animation: 'bounce 2s ease-in-out infinite',
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-8px)' }
                    }
                  }} 
                />
              </Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                fontWeight={900} 
                sx={{ 
                  color: C.dark, 
                  mb: 3,
                  background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 50%, #95d5b2 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                Everything You Need to Read & Learn
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: 650, 
                  mx: 'auto', 
                  lineHeight: 1.8,
                  fontSize: { xs: 16, md: 18 }
                }}
              >
                A powerful, modern platform built for students, researchers, and book lovers of all ages with cutting-edge features.
              </Typography>
            </Box>
          </Fade>

          {/* Enhanced Feature Cards Grid - 2 per row */}
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {FEATURES.map((f, i) => (
              <Grid item xs={12} sm={6} md={6} key={i}>
                <Grow in={visible} timeout={500 + i * 150}>
                  <Card
                    elevation={0}
                    onClick={() => setActiveFeature(activeFeature === i ? null : i)}
                    sx={{
                      height: '100%',
                      p: 0,
                      borderRadius: 5,
                      border: '2px solid transparent',
                      background: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderColor: activeFeature === i ? f.color : 'transparent',
                      transform: activeFeature === i ? 'translateY(-8px) scale(1.01)' : 'none',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '6px',
                        background: f.gradient,
                        transform: activeFeature === i ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'left',
                        transition: 'transform 0.5s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 25px 60px ${f.color}30`,
                        borderColor: f.color,
                        '&::before': {
                          transform: 'scaleX(1)'
                        },
                        '& .feature-icon-box': {
                          background: f.gradient,
                          transform: 'rotate(10deg) scale(1.15)',
                          boxShadow: `0 12px 30px ${f.color}50`
                        },
                        '& .feature-icon': {
                          color: 'white',
                          transform: 'scale(1.2) rotate(-10deg)'
                        },
                        '& .feature-emoji': {
                          transform: 'scale(1.4) rotate(360deg)',
                          opacity: 1
                        },
                        '& .feature-learn-more': {
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
                      {/* Floating emoji decoration */}
                      <Box 
                        className="feature-emoji"
                        sx={{ 
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          fontSize: 32,
                          opacity: 0.2,
                          transform: 'scale(1)',
                          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          pointerEvents: 'none'
                        }}
                      >
                        {f.emoji}
                      </Box>

                      {/* Icon container with gradient background */}
                      <Box 
                        className="feature-icon-box"
                        sx={{ 
                          display: 'inline-flex', 
                          p: 2.5, 
                          borderRadius: 4,
                          background: f.lightBg,
                          mb: 3,
                          position: 'relative',
                          transform: 'rotate(0deg) scale(1)',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: `0 4px 15px ${f.color}20`
                        }}
                      >
                        {React.cloneElement(f.icon, { 
                          className: 'feature-icon',
                          sx: { 
                            fontSize: { xs: 36, md: 44 },
                            color: f.color,
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                          } 
                        })}
                      </Box>

                      {/* Title with gradient on hover */}
                      <Typography 
                        variant="h5" 
                        fontWeight={800} 
                        sx={{ 
                          mb: 2, 
                          color: C.dark,
                          fontSize: { xs: 20, md: 22 },
                          letterSpacing: '-0.3px'
                        }}
                      >
                        {f.title}
                      </Typography>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.8,
                          fontSize: { xs: 14, md: 15 },
                          mb: 2
                        }}
                      >
                        {f.desc}
                      </Typography>

                      {/* Learn more link - appears on hover */}
                      <Box 
                        className="feature-learn-more"
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: f.color,
                          fontWeight: 700,
                          fontSize: 14,
                          opacity: 0,
                          transform: 'translateX(-10px)',
                          transition: 'all 0.4s ease',
                          mt: 1
                        }}
                      >
                        <span>Learn more</span>
                        <ArrowForward sx={{ fontSize: 16 }} />
                      </Box>
                    </CardContent>

                    {/* Decorative corner gradient */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: f.gradient,
                      opacity: 0.05,
                      borderRadius: '100% 0 0 0',
                      transition: 'all 0.5s ease',
                    }} />
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* Enhanced Image gallery strip with better animations */}
          <Box sx={{ mt: { xs: 8, md: 12 } }}>
            <Fade in={visible} timeout={1200}>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                textAlign="center" 
                sx={{ 
                  mb: 4,
                  color: C.dark,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                <Box sx={{ 
                  width: { xs: 30, md: 40 }, 
                  height: 3, 
                  background: 'linear-gradient(90deg, transparent, #667eea)',
                  borderRadius: 2 
                }} />
                <span>Experience Our Library</span>
                <Box sx={{ 
                  width: { xs: 30, md: 40 }, 
                  height: 3, 
                  background: 'linear-gradient(90deg, #667eea, transparent)',
                  borderRadius: 2 
                }} />
              </Typography>
            </Fade>
            
            <Grid container spacing={2}>
              {[
                { src: IMG.shelves, label: 'Vast Collection', gradient: 'linear-gradient(135deg, #667eea99, #764ba299)', count: '10K+', desc: 'Books' },
                { src: IMG.reader,  label: 'Comfortable Reading', gradient: 'linear-gradient(135deg, #f093fb99, #f5576c99)', count: '24/7', desc: 'Access' },
                { src: IMG.student, label: 'Study Together', gradient: 'linear-gradient(135deg, #ffa75199, #ffe25999)', count: '5K+', desc: 'Members' },
                { src: IMG.digital, label: 'Digital Access', gradient: 'linear-gradient(135deg, #43e97b99, #38f9d799)', count: '100%', desc: 'Cloud' }
              ].map((item, i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Fade in={visible} timeout={1000 + i * 200}>
                    <Box 
                      sx={{ 
                        borderRadius: 4, 
                        overflow: 'hidden', 
                        height: { xs: 180, md: 240 }, 
                        position: 'relative',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          '& img': { 
                            transform: 'scale(1.15) rotate(2deg)',
                          },
                          '& .overlay': { 
                            opacity: 1,
                            background: item.gradient
                          },
                          '& .label': {
                            transform: 'translateY(0)',
                            opacity: 1
                          },
                          '& .stats-badge': {
                            transform: 'scale(1.15) rotate(-5deg)',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                          }
                        }
                      }}
                    >
                      <Box 
                        component="img" 
                        src={item.src} 
                        alt={item.label}
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover', 
                          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }} 
                      />
                      <Box 
                        className="overlay"
                        sx={{ 
                          position: 'absolute', 
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          pb: 3,
                          opacity: 0,
                          transition: 'all 0.4s ease'
                        }}
                      >
                        <Typography 
                          className="label"
                          variant="subtitle1" 
                          sx={{ 
                            color: 'white', 
                            fontWeight: 800,
                            fontSize: { xs: 14, md: 16 },
                            transform: 'translateY(20px)',
                            opacity: 0,
                            transition: 'all 0.4s ease 0.1s',
                            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            letterSpacing: '0.5px',
                            mb: 0.5
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography 
                          className="label"
                          variant="caption" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.8)', 
                            fontSize: 12,
                            transform: 'translateY(20px)',
                            opacity: 0,
                            transition: 'all 0.4s ease 0.15s',
                          }}
                        >
                          {item.desc}
                        </Typography>
                      </Box>

                      {/* Corner stats badge */}
                      <Box 
                        className="stats-badge"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          minWidth: 50,
                          px: 1.5,
                          py: 1,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="caption" fontWeight={900} sx={{ fontSize: { xs: 14, md: 16 }, color: '#667eea', display: 'block', lineHeight: 1 }}>
                          {item.count}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.secondary', textTransform: 'uppercase' }}>
                          {item.desc}
                        </Typography>
                      </Box>

                      {/* Position number - bottom left */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(5px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 13,
                        color: 'white',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}>
                        {i + 1}
                      </Box>
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* Interactive Feature Stats Row */}
            <Box sx={{ mt: 6, p: { xs: 3, md: 5 }, borderRadius: 4, background: 'linear-gradient(135deg, #667eea15, #f5576c15)', border: '2px solid', borderColor: '#667eea30' }}>
              <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
                {[
                  { icon: <CheckCircle />, label: 'Instant Access', value: '100%', color: '#43e97b' },
                  { icon: <TrendingUp />, label: 'User Satisfaction', value: '4.8★', color: '#667eea' },
                  { icon: <Security />, label: 'Secure Platform', value: '256-bit', color: '#f5576c' },
                  { icon: <Cloud />, label: 'Uptime', value: '99.9%', color: '#ffa751' }
                ].map((stat, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Fade in={visible} timeout={1400 + i * 150}>
                      <Box sx={{ textAlign: 'center', transition: 'all 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }}>
                        <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: 3, background: `${stat.color}20`, mb: 1 }}>
                          {React.cloneElement(stat.icon, { sx: { fontSize: 28, color: stat.color } })}
                        </Box>
                        <Typography variant="h5" fontWeight={900} sx={{ color: C.dark, mb: 0.5 }}>{stat.value}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{stat.label}</Typography>
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          CATEGORIES SECTION - ENHANCED (live DB data)
      ══════════════════════════════════════════════════════════ */}
      <Box id="categories" sx={{ py: { xs: 10, md: 14 }, background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Animated background pattern with green theme */}
        <Box sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 10% 20%, ${C.secondary}15 0%, transparent 50%), radial-gradient(circle at 90% 80%, ${C.primary}15 0%, transparent 50%)`,
          animation: 'categoryFloat 12s ease-in-out infinite',
          '@keyframes categoryFloat': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(-15px, 15px) scale(1.05)' }
          }
        }} />

        {/* Floating green orbs */}
        {[
          { size: 400, top: -100, right: -100, opacity: 0.08 },
          { size: 300, bottom: -80, left: -80, opacity: 0.1 },
          { size: 180, top: '40%', right: '20%', opacity: 0.06 },
        ].map((orb, i) => (
          <Fade in={visible} timeout={1000 + i * 300} key={`orb-${i}`}>
            <Box sx={{
              position: 'absolute',
              width: orb.size,
              height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${C.secondary}, ${C.primary})`,
              top: orb.top,
              bottom: orb.bottom,
              left: orb.left,
              right: orb.right,
              opacity: orb.opacity,
              filter: 'blur(60px)',
              animation: `pulse${i} ${4 + i}s ease-in-out infinite`,
              [`@keyframes pulse${i}`]: {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.15)' }
              }
            }} />
          </Fade>
        ))}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Enhanced Section Header */}
          <Fade in={visible} timeout={800}>
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label="📚 Browse by Topic" 
                  sx={{ 
                    mb: 2, 
                    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 15,
                    px: 3,
                    py: 2.5,
                    height: 'auto',
                    boxShadow: `0 4px 15px ${C.secondary}50`,
                    animation: 'categoryBounce 2.5s ease-in-out infinite',
                    '@keyframes categoryBounce': {
                      '0%, 100%': { transform: 'translateY(0) scale(1)' },
                      '50%': { transform: 'translateY(-6px) scale(1.05)' }
                    }
                  }} 
                />
              </Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                fontWeight={900} 
                sx={{ 
                  color: C.dark, 
                  mb: 3,
                  letterSpacing: '-0.5px'
                }}
              >
                Explore by
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'inline-block',
                    ml: 1.5,
                    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Category
                </Box>
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ 
                  maxWidth: 650, 
                  mx: 'auto', 
                  lineHeight: 1.8,
                  fontSize: { xs: 16, md: 18 }
                }}
              >
                Browse our collection across <Box component="span" fontWeight={700} color={C.primary}>{stats ? stats.total_categories : '12'}</Box> curated categories
              </Typography>
            </Box>
          </Fade>

          {/* Enhanced Category Grid */}
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {(categories.length > 0 ? categories : [
              { name: 'Fiction',      color_code: '#9b59b6', book_count: 45, icon: '📖' },
              { name: 'Science',      color_code: '#3498db', book_count: 38, icon: '🔬' },
              { name: 'Technology',   color_code: '#2ecc71', book_count: 52, icon: '💻' },
              { name: 'History',      color_code: '#f39c12', book_count: 29, icon: '📜' },
              { name: 'Academic',     color_code: '#e74c3c', book_count: 61, icon: '🎓' },
              { name: 'Business',     color_code: '#34495e', book_count: 33, icon: '💼' },
              { name: 'Arts',         color_code: '#e91e63', book_count: 24, icon: '🎨' },
              { name: 'Philosophy',   color_code: '#9c27b0', book_count: 18, icon: '🤔' },
              { name: 'Literature',   color_code: '#ff5722', book_count: 42, icon: '📚' },
              { name: 'Biography',    color_code: '#00bcd4', book_count: 27, icon: '👤' },
              { name: 'Self-Help',    color_code: '#4caf50', book_count: 35, icon: '💪' },
              { name: 'Children',     color_code: '#ff9800', book_count: 48, icon: '🧸' },
            ]).map((cat, i) => {
              const categoryGradient = `linear-gradient(135deg, ${cat.color_code}, ${cat.color_code}dd)`;
              const lightBg = `${cat.color_code}12`;
              
              return (
                <Grid item xs={6} sm={4} md={2} key={i}>
                  <Grow in={visible} timeout={500 + i * 100}>
                    <Card
                      onClick={() => navigate(`/browse?category=${encodeURIComponent(cat.name)}`)}
                      elevation={0}
                      sx={{
                        textAlign: 'center',
                        p: 0,
                        borderRadius: 5,
                        cursor: 'pointer',
                        border: '3px solid transparent',
                        background: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '5px',
                          background: categoryGradient,
                          transform: 'scaleX(0)',
                          transformOrigin: 'left',
                          transition: 'transform 0.5s ease'
                        },
                        '&:hover': { 
                          border: `3px solid ${cat.color_code}`, 
                          transform: 'translateY(-10px) scale(1.03)', 
                          boxShadow: `0 20px 50px ${cat.color_code}35`,
                          '&::before': {
                            transform: 'scaleX(1)'
                          },
                          '& .category-icon-box': {
                            background: categoryGradient,
                            transform: 'rotate(15deg) scale(1.2)',
                            boxShadow: `0 10px 30px ${cat.color_code}50`
                          },
                          '& .category-icon': {
                            color: 'white',
                            transform: 'scale(1.3) rotate(-15deg)'
                          },
                          '& .category-emoji': {
                            transform: 'scale(1.5) rotate(360deg)',
                            opacity: 1
                          },
                          '& .book-count': {
                            background: categoryGradient,
                            color: 'white',
                            transform: 'scale(1.1)'
                          },
                          '& .category-pulse': {
                            opacity: 1,
                            transform: 'scale(1.5)'
                          }
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2.5, md: 3 }, position: 'relative' }}>
                        {/* Floating emoji decoration */}
                        <Box 
                          className="category-emoji"
                          sx={{ 
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            fontSize: 24,
                            opacity: 0.15,
                            transform: 'scale(1)',
                            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: 'none'
                          }}
                        >
                          {cat.icon || '📚'}
                        </Box>

                        {/* Pulse effect on hover */}
                        <Box 
                          className="category-pulse"
                          sx={{ 
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            background: `radial-gradient(circle, ${cat.color_code}20, transparent)`,
                            opacity: 0,
                            transform: 'scale(0)',
                            transition: 'all 0.5s ease',
                            pointerEvents: 'none'
                          }}
                        />

                        {/* Icon container with gradient */}
                        <Box 
                          className="category-icon-box"
                          sx={{ 
                            width: { xs: 64, md: 72 }, 
                            height: { xs: 64, md: 72 }, 
                            borderRadius: '50%', 
                            background: lightBg,
                            mx: 'auto', 
                            mb: 2, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            position: 'relative',
                            transform: 'rotate(0deg) scale(1)',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 4px 15px ${cat.color_code}20`,
                            border: `2px solid ${cat.color_code}30`
                          }}
                        >
                          <AutoStories 
                            className="category-icon"
                            sx={{ 
                              color: cat.color_code, 
                              fontSize: { xs: 28, md: 32 },
                              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} 
                          />
                        </Box>

                        {/* Category name */}
                        <Typography 
                          variant="body1" 
                          fontWeight={800} 
                          sx={{ 
                            color: C.dark, 
                            mb: 1,
                            fontSize: { xs: 14, md: 15 },
                            letterSpacing: '0.3px'
                          }}
                        >
                          {cat.name}
                        </Typography>

                        {/* Book count badge */}
                        <Box
                          className="book-count"
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 10,
                            background: lightBg,
                            border: `1px solid ${cat.color_code}40`,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            fontWeight={700}
                            sx={{ 
                              color: cat.color_code,
                              fontSize: { xs: 11, md: 12 }
                            }}
                          >
                            {cat.book_count} books
                          </Typography>
                        </Box>
                      </CardContent>

                      {/* Decorative corner gradient */}
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 60,
                        height: 60,
                        background: categoryGradient,
                        opacity: 0.05,
                        borderRadius: '100% 0 0 0',
                        transition: 'all 0.5s ease',
                      }} />
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>

          {/* Category Stats Bar */}
          <Fade in={visible} timeout={1500}>
            <Box sx={{ 
              mt: { xs: 8, md: 10 }, 
              p: { xs: 3, md: 5 }, 
              borderRadius: 5, 
              background: `linear-gradient(135deg, ${C.primary}15, ${C.secondary}15)`,
              border: `3px solid ${C.secondary}40`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Animated background shimmer */}
              <Box sx={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(90deg, transparent, ${C.secondary}20, transparent)`,
                animation: 'shimmer 3s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(100%)' }
                }
              }} />

              <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={900} sx={{ 
                      color: C.primary, 
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'center', md: 'flex-start' },
                      gap: 1
                    }}>
                      <EmojiEvents sx={{ fontSize: { xs: 28, md: 36 }, color: C.accent }} />
                      {stats ? stats.total_categories : '12'}+ Categories
                    </Typography>
                    <Typography variant="body1" color="text.secondary" fontWeight={600}>
                      Find exactly what you're looking for
                    </Typography>
                  </Box>
                </Grid>

                {[
                  { icon: <TrendingUp />, label: 'Most Popular', value: 'Technology', color: '#2ecc71' },
                  { icon: <Star />, label: 'Top Rated', value: 'Academic', color: '#e74c3c' },
                  { icon: <MenuBook />, label: 'Most Books', value: '50+', color: C.primary }
                ].map((stat, i) => (
                  <Grid item xs={4} md={2.66} key={i}>
                    <Fade in={visible} timeout={1600 + i * 150}>
                      <Box sx={{ 
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        p: { xs: 1, md: 2 },
                        borderRadius: 3,
                        '&:hover': { 
                          transform: 'scale(1.1)',
                          background: 'rgba(255,255,255,0.8)'
                        }
                      }}>
                        <Box sx={{ 
                          display: 'inline-flex', 
                          p: 1.5, 
                          borderRadius: 3, 
                          background: `${stat.color}20`,
                          mb: 1
                        }}>
                          {React.cloneElement(stat.icon, { 
                            sx: { fontSize: { xs: 24, md: 28 }, color: stat.color } 
                          })}
                        </Box>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight={900} 
                          sx={{ color: C.dark, mb: 0.5, fontSize: { xs: 13, md: 15 } }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ color: 'text.secondary', fontWeight: 600, fontSize: { xs: 10, md: 11 } }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>

              {/* Quick browse button */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/browse')}
                  endIcon={<ArrowForward />}
                  sx={{
                    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: { xs: 14, md: 15 },
                    boxShadow: `0 8px 25px ${C.primary}40`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${C.secondary}, ${C.primary})`,
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: `0 12px 35px ${C.primary}50`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Browse All Categories
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          4. TESTIMONIALS / SOCIAL PROOF
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: `linear-gradient(135deg, ${C.dark} 0%, #16213e 100%)`, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative background */}
        <Box sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${IMG.hero})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Chip label="⭐ What Readers Say" sx={{ mb: 2, background: 'rgba(82,183,136,0.2)', color: '#86efac', border: '1px solid rgba(82,183,136,0.3)', fontWeight: 700 }} />
            <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight={800} sx={{ color: 'white', mb: 2 }}>
              Loved by Thousands of Readers
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 2 }}>
              {[1,2,3,4,5].map(s => <Star key={s} sx={{ color: '#fbbf24', fontSize: 28 }} />)}
            </Box>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Rated {stats?.avg_rating || 4.8} out of 5 from our readers
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {TESTIMONIALS.map((t, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Grow in={visible} timeout={500 + i * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%', borderRadius: 4,
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s',
                      '&:hover': { background: 'rgba(255,255,255,0.1)', transform: 'translateY(-4px)', borderColor: 'rgba(82,183,136,0.4)' },
                    }}
                  >
                    <CardContent sx={{ p: 3.5 }}>
                      {/* Quote icon */}
                      <Typography variant="h2" sx={{ color: C.secondary, opacity: 0.4, lineHeight: 1, mb: 1.5, fontFamily: 'serif' }}>"</Typography>
                      <Rating value={t.rating} readOnly size="small" sx={{ mb: 2, '& .MuiRating-iconFilled': { color: '#fbbf24' } }} />
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}>
                        {t.text}
                      </Typography>
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2.5 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={t.avatar} sx={{ width: 48, height: 48, border: `2px solid ${C.secondary}` }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white' }}>{t.name}</Typography>
                          <Typography variant="caption" sx={{ color: C.secondary }}>{t.role}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {/* Trust badges */}
          <Box sx={{ mt: 8, display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', alignItems: 'center' }}>
            {[
              { icon: <Security sx={{ fontSize: 20 }} />,    label: 'SSL Secured'       },
              { icon: <Schedule sx={{ fontSize: 20 }} />,    label: '24/7 Access'       },
              { icon: <EmojiEvents sx={{ fontSize: 20 }} />, label: 'Award Winning'     },
              { icon: <People sx={{ fontSize: 20 }} />,      label: '1000+ Members'     },
              { icon: <Smartphone sx={{ fontSize: 20 }} />,  label: 'Mobile Friendly'   },
            ].map((b, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.5, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                {React.cloneElement(b.icon, { sx: { fontSize: 18, color: C.secondary } })}
                <Typography variant="body2" fontWeight={600}>{b.label}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          POPULAR BOOKS (live DB data)
      ══════════════════════════════════════════════════════════ */}
      <Box id="popular" sx={{ py: { xs: 8, md: 10 }, background: '#fafafa' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Chip label="🔥 Trending Now" sx={{ mb: 1.5, background: `${C.orange}15`, color: C.orange, fontWeight: 700, border: `1px solid ${C.orange}` }} />
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={800} sx={{ color: C.dark }}>Most Popular Books</Typography>
              <Typography color="text.secondary">Top picks from our readers this month</Typography>
            </Box>
            <Button 
              endIcon={<ArrowForward />} 
              onClick={() => navigate('/browse')} 
              sx={{ 
                color: C.primary, 
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  background: C.light
                }
              }}
            >
              View All Books
            </Button>
          </Box>

          <Grid container spacing={3}>
            {(popularBooks.length > 0 ? popularBooks.slice(0, 4) : [
              { title: 'The Great Gatsby',        author: 'F. Scott Fitzgerald', loan_count: 15, book_id: 1 },
              { title: '1984',                    author: 'George Orwell',       loan_count: 12, book_id: 2 },
              { title: 'To Kill a Mockingbird',   author: 'Harper Lee',          loan_count: 10, book_id: 3 },
              { title: 'The Hobbit',              author: 'J.R.R. Tolkien',      loan_count: 9,  book_id: 4 },
            ]).map((book, i) => {
              const bookColors = [C.blue, C.purple, C.orange, C.pink];
              const color = bookColors[i % 4];
              return (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Grow in={visible} timeout={500 + i * 150}>
                    <Card
                      onClick={() => navigate(`/browse?search=${encodeURIComponent(book.title)}`)}
                      elevation={0}
                      sx={{
                        borderRadius: 4, 
                        cursor: 'pointer', 
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        height: '100%',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': { 
                          transform: 'translateY(-8px) scale(1.02)', 
                          boxShadow: `0 20px 50px ${color}30`, 
                          borderColor: color 
                        },
                      }}
                    >
                      {/* Book cover placeholder */}
                      <Box sx={{ 
                        height: 200, 
                        background: `linear-gradient(135deg, ${color}dd, ${color}88)`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)',
                        }} />
                        <MenuBook sx={{ fontSize: 72, color: 'white', opacity: 0.9, zIndex: 1 }} />
                        <Chip 
                          label={`#${i + 1} Popular`} 
                          size="small" 
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12, 
                            background: 'rgba(255,255,255,0.95)', 
                            fontWeight: 700, 
                            fontSize: 11,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }} 
                        />
                      </Box>
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={700} 
                          sx={{ 
                            color: C.dark, 
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: 48
                          }}
                        >
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                          {book.author}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ flex: 1, height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
                            <Box sx={{ 
                              width: `${Math.min(100, (book.loan_count / 20) * 100)}%`, 
                              height: '100%', 
                              borderRadius: 3, 
                              background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                              transition: 'width 0.5s ease'
                            }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: color, fontWeight: 700, minWidth: 60, textAlign: 'right' }}>
                            {book.loan_count} loans
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          5. CTA BANNER - ENHANCED WITH GREEN THEME
      ══════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          py: { xs: 8, md: 14 },
          background: `linear-gradient(135deg, ${C.primary} 0%, ${C.secondary} 50%, #95d5b2 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <Box sx={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: `url(${IMG.team})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          opacity: 0.15 
        }} />
        
        {/* Animated green geometric shapes */}
        <Box sx={{ 
          position: 'absolute', 
          top: -80, 
          right: -80, 
          width: { xs: 250, md: 400 }, 
          height: { xs: 250, md: 400 }, 
          borderRadius: '50%', 
          background: `radial-gradient(circle, ${C.secondary}30, transparent)`,
          animation: 'float 6s ease-in-out infinite',
        }} />
        <Box sx={{ 
          position: 'absolute', 
          bottom: -60, 
          left: -60, 
          width: { xs: 200, md: 300 }, 
          height: { xs: 200, md: 300 }, 
          borderRadius: '50%', 
          background: `radial-gradient(circle, rgba(255,255,255,0.1), transparent)`,
          animation: 'float 8s ease-in-out infinite reverse',
        }} />

        {/* Additional decorative elements */}
        {[
          { size: 100, top: '20%', right: '15%', delay: 0 },
          { size: 80, bottom: '25%', left: '10%', delay: 2 },
        ].map((item, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: item.size,
              height: item.size,
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.2)',
              animation: `pulse 3s ease-in-out ${item.delay}s infinite`,
            }}
          />
        ))}

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Fade in={visible} timeout={1000}>
            <Box>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                fontWeight={900} 
                sx={{ 
                  color: 'white', 
                  mb: 2.5, 
                  textShadow: '0 2px 15px rgba(0,0,0,0.3)',
                  lineHeight: 1.2
                }}
              >
                Ready to Start Your Reading Journey?
              </Typography>
              <Typography 
                variant={isMobile ? 'body1' : 'h6'} 
                sx={{ 
                  color: 'rgba(255,255,255,0.95)', 
                  mb: 5, 
                  maxWidth: 600, 
                  mx: 'auto', 
                  lineHeight: 1.8,
                  px: { xs: 2, md: 0 }
                }}
              >
                Join {stats ? stats.total_members.toLocaleString() : '1,000+'} readers already enjoying unlimited access to our growing library. Sign up free — no credit card required.
              </Typography>
              <Box sx={{ display: 'flex', gap: { xs: 2, md: 2.5 }, justifyContent: 'center', flexWrap: 'wrap', px: { xs: 2, md: 0 } }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  endIcon={<ArrowForward />}
                  sx={{
                    background: 'white', 
                    color: C.primary, 
                    fontWeight: 800, 
                    borderRadius: 3,
                    px: { xs: 3, md: 6 }, 
                    py: { xs: 1.5, md: 2 }, 
                    fontSize: { xs: 14, md: 17 },
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    '&:hover': { 
                      background: C.light, 
                      transform: 'translateY(-4px) scale(1.05)', 
                      boxShadow: '0 15px 40px rgba(45,106,79,0.4)' 
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Create Free Account
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/browse')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.9)', 
                    borderWidth: 2,
                    color: 'white', 
                    fontWeight: 700,
                    borderRadius: 3, 
                    px: { xs: 3, md: 6 }, 
                    py: { xs: 1.5, md: 2 }, 
                    fontSize: { xs: 14, md: 17 },
                    '&:hover': { 
                      background: 'rgba(255,255,255,0.2)', 
                      borderColor: 'white',
                      borderWidth: 2,
                      transform: 'translateY(-4px)' 
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Browse Library
                </Button>
              </Box>

              {/* Feature bullets with green theme */}
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 2, md: 5 }, 
                justifyContent: 'center', 
                mt: 5, 
                flexWrap: 'wrap',
                px: { xs: 2, md: 0 }
              }}>
                {[
                  { icon: <CheckCircle />, text: 'Free forever plan' },
                  { icon: <CheckCircle />, text: 'No credit card' },
                  { icon: <CheckCircle />, text: 'Cancel anytime' }
                ].map((f, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {React.cloneElement(f.icon, { sx: { color: '#86efac', fontSize: { xs: 18, md: 20 } } })}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.95)', 
                        fontWeight: 600,
                        fontSize: { xs: 13, md: 14 }
                      }}
                    >
                      {f.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════
          6. FOOTER
      ══════════════════════════════════════════════════════════ */}
      <Box sx={{ background: C.dark, color: 'white', pt: { xs: 8, md: 10 }, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ mb: 6 }}>
            {/* Brand column */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2.5, background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LibraryBooks sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h5" fontWeight={900} sx={{ background: `linear-gradient(90deg, ${C.secondary}, #95d5b2)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  DigiLib
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, mb: 3, maxWidth: 300 }}>
                A comprehensive digital library management system designed to connect readers with knowledge. Browse, borrow, and explore thousands of books.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { icon: <Facebook />,  href: '#' },
                  { icon: <Twitter />,   href: '#' },
                  { icon: <Instagram />, href: '#' },
                  { icon: <LinkedIn />,  href: '#' },
                  { icon: <YouTube />,   href: '#' },
                ].map((s, i) => (
                  <IconButton key={i} component="a" href={s.href} size="small" sx={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { color: C.secondary, background: 'rgba(82,183,136,0.15)', borderColor: C.secondary } }}>
                    {React.cloneElement(s.icon, { fontSize: 'small' })}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Quick links */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2.5, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1.5 }}>Explore</Typography>
              {[
                { label: 'Browse Books', path: '/browse' },
                { label: 'Categories', action: () => scrollToSection('#categories') },
                { label: 'New Arrivals', path: '/browse?sort=newest' },
                { label: 'Popular Books', action: () => scrollToSection('#popular') },
                { label: 'All Categories', path: '/browse' }
              ].map((l, i) => (
                <Typography 
                  key={i}
                  variant="body2" 
                  onClick={() => l.action ? l.action() : navigate(l.path)} 
                  sx={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.55)', 
                    mb: 1.5, 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    '&:hover': { 
                      color: C.secondary,
                      paddingLeft: '4px'
                    } 
                  }}
                >
                  {l.label}
                </Typography>
              ))}
            </Grid>

            {/* Account */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2.5, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1.5 }}>Account</Typography>
              {[
                { label: 'Sign In', path: '/login' },
                { label: 'Register', path: '/register' },
                { label: 'Browse Books', path: '/browse' },
                { label: 'Features', action: () => scrollToSection('#features') },
                { label: 'Categories', action: () => scrollToSection('#categories') }
              ].map((l, i) => (
                <Typography 
                  key={i}
                  variant="body2" 
                  onClick={() => l.action ? l.action() : navigate(l.path)}
                  sx={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.55)', 
                    mb: 1.5, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      color: C.secondary,
                      paddingLeft: '4px'
                    } 
                  }}
                >
                  {l.label}
                </Typography>
              ))}
            </Grid>

            {/* Contact */}
            <Grid item xs={12} sm={4} md={4}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'white', mb: 2.5, textTransform: 'uppercase', fontSize: 12, letterSpacing: 1.5 }}>Contact</Typography>
              {[
                { icon: <Email sx={{ fontSize: 16 }} />,       text: 'info@digitallibrary.com'          },
                { icon: <Phone sx={{ fontSize: 16 }} />,       text: '+1 (555) 123-4567'                },
                { icon: <LocationOn sx={{ fontSize: 16 }} />,  text: '123 Library Street, Education City' },
                { icon: <Schedule sx={{ fontSize: 16 }} />,    text: 'Mon – Sat: 8 AM – 8 PM'           },
              ].map((c, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                  <Box sx={{ color: C.secondary, mt: 0.2 }}>{c.icon}</Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{c.text}</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} DigiLib Digital Library Management System. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                <Typography key={l} variant="body2" component="a" href="#" sx={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', '&:hover': { color: C.secondary } }}>
                  {l}
                </Typography>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      <Fade in={showScrollTop}>
        <Box
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 32 },
            right: { xs: 24, md: 32 },
            zIndex: 1000,
            cursor: 'pointer'
          }}
        >
          <Box
            sx={{
              width: { xs: 48, md: 56 },
              height: { xs: 48, md: 56 },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(45,106,79,0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.1)',
                boxShadow: '0 12px 35px rgba(45,106,79,0.5)',
              }
            }}
          >
            <KeyboardArrowUp sx={{ color: 'white', fontSize: { xs: 28, md: 32 } }} />
          </Box>
        </Box>
      </Fade>

    </Box>
  );
}

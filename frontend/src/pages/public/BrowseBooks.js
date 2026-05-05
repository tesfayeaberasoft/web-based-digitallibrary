import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Rating,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  MenuBook as BookIcon,
  Person as PersonIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, searchQuery, selectedCategory, availabilityFilter]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        limit,
        search: searchQuery,
        category_id: selectedCategory,
        availability: availabilityFilter
      };
      
      const response = await axios.get('http://localhost:8000/api/books', { params });
      
      if (response.data.success) {
        setBooks(response.data.books || []);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setBooks([]);
        setError('Failed to load books. Please try again.');
      }
    } catch (err) {
      setBooks([]);
      setError('Failed to load books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handleAvailabilityChange = (e) => {
    setAvailabilityFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBookImage = (book) => {
    // Placeholder image based on category
    const colors = ['#4a9b8e', '#e91e63', '#9c27b0', '#3f51b5', '#00bcd4', '#4caf50'];
    const colorIndex = book.category_id % colors.length;
    return `https://via.placeholder.com/300x400/${colors[colorIndex].substring(1)}/ffffff?text=${encodeURIComponent(book.title.substring(0, 20))}`;
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar title="Digital Library" showUserMenu={true} />
      
      <Container sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Browse Our Collection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover your next favorite book from our extensive library
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4, p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Category"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} ({category.book_count})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Availability"
                value={availabilityFilter}
                onChange={handleAvailabilityChange}
              >
                <MenuItem value="all">All Books</MenuItem>
                <MenuItem value="available">Available Now</MenuItem>
                <MenuItem value="unavailable">Currently Unavailable</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !books || books.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No books found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        ) : (
          <>
            {/* Books Grid */}
            <Grid container spacing={3}>
              {books.map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="250"
                      image={getBookImage(book)}
                      alt={book.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3.6em'
                        }}
                      >
                        {book.title}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {book.author}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CategoryIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {book.category_name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating 
                          value={parseFloat(book.avg_rating) || 0} 
                          precision={0.5} 
                          size="small" 
                          readOnly 
                        />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          ({book.review_count || 0})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {book.available_copies > 0 ? (
                          <Chip 
                            label={`${book.available_copies} Available`}
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip 
                            label="Unavailable"
                            color="error"
                            size="small"
                          />
                        )}
                        
                        {book.isbn && (
                          <Chip 
                            label={`ISBN: ${book.isbn}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button 
                        fullWidth 
                        variant="contained"
                        disabled={book.available_copies === 0}
                        sx={{
                          bgcolor: '#4a9b8e',
                          '&:hover': { bgcolor: '#3d8276' }
                        }}
                      >
                        {book.available_copies > 0 ? 'Borrow' : 'Reserve'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default BrowseBooks;
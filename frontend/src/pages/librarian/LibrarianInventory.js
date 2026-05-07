import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibrarianInventory = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  
  // Delete confirmation dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: '',
    category_id: '',
    description: '',
    language: 'English',
    pages: '',
    total_copies: ''
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, searchQuery, categoryFilter]);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories from API...');
      const response = await axios.get('http://localhost:8000/api/categories');
      console.log('Categories API response:', response.data);
      
      if (response.data.success) {
        setCategories(response.data.categories);
        console.log('Categories loaded:', response.data.categories.length, 'categories');
      } else {
        console.error('Categories API returned success=false:', response.data);
        toast.error('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      console.error('Error details:', err.response?.data);
      toast.error('Failed to load categories. Please check console for details.');
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const params = {
        page,
        limit,
        search: searchQuery,
        category_id: categoryFilter
      };
      
      const response = await axios.get('http://localhost:8000/api/books', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      if (response.data.success) {
        setBooks(response.data.books);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err) {
      setError('Failed to load books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (book = null) => {
    if (book) {
      setEditMode(true);
      setCurrentBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publisher: book.publisher || '',
        publication_year: book.publication_year || '',
        category_id: book.category_id,
        description: book.description || '',
        language: book.language || 'English',
        pages: book.pages || '',
        total_copies: book.total_copies
      });
    } else {
      setEditMode(false);
      setCurrentBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publication_year: '',
        category_id: '',
        description: '',
        language: 'English',
        pages: '',
        total_copies: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentBook(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      if (editMode) {
        await axios.put(
          `http://localhost:8000/api/books/${currentBook.id}`,
          formData,
          config
        );
        toast.success('Book updated successfully!');
      } else {
        await axios.post(
          'http://localhost:8000/api/books',
          formData,
          config
        );
        toast.success('Book added successfully!');
      }
      
      handleCloseDialog();
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleOpenDeleteDialog = (book) => {
    setBookToDelete(book);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setBookToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:8000/api/books/${bookToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Book deleted successfully!');
      handleCloseDeleteDialog();
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book');
      handleCloseDeleteDialog();
    }
  };

  return (
    <DashboardLayout title="Librarian Panel">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Book Inventory
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage book inventory and stock levels
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
          >
            Add Book
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card 
          sx={{ 
            mb: 3,
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#4a9b8e', fontSize: { xs: 24, sm: 28 } }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      height: { xs: '50px', sm: '56px' },
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      '&:hover fieldset': {
                        borderColor: '#4a9b8e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a9b8e',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CategoryIcon sx={{ 
                          color: '#4a9b8e', 
                          fontSize: { xs: 24, sm: 28 } 
                        }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    '& .MuiOutlinedInput-root': {
                      height: { xs: '50px', sm: '56px' },
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      fontWeight: 600,
                      '&:hover fieldset': {
                        borderColor: '#4a9b8e',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#4a9b8e',
                      },
                    },
                    '& .MuiSelect-select': {
                      fontWeight: 600,
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      color: categoryFilter ? 'inherit' : '#9e9e9e',
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: '#9e9e9e' }} />
                      <Typography 
                        fontWeight={600} 
                        fontSize={{ xs: '0.95rem', sm: '1rem' }}
                        color="#9e9e9e"
                      >
                        Select Categories
                      </Typography>
                    </Box>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: '#4a9b8e' }} />
                        <Typography 
                          fontWeight={600} 
                          fontSize={{ xs: '0.95rem', sm: '1rem' }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                {categoryFilter && (
                  <Chip
                    label={`Filtered: ${categories.find(c => c.id === parseInt(categoryFilter))?.name || 'Category'}`}
                    onDelete={() => {
                      setCategoryFilter('');
                      setPage(1);
                    }}
                    sx={{
                      mt: 1,
                      bgcolor: '#4a9b8e',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      height: { xs: '28px', sm: '32px' },
                      '& .MuiChip-deleteIcon': {
                        color: 'white',
                        fontSize: { xs: '18px', sm: '20px' },
                        '&:hover': {
                          color: '#f5f5f5',
                        },
                      },
                    }}
                  />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : books.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No books found
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Book ID</strong></TableCell>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Author</strong></TableCell>
                        <TableCell><strong>ISBN</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Total Copies</strong></TableCell>
                        <TableCell><strong>Available</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow key={book.id} hover>
                          <TableCell>
                            <Chip
                              label={`#${book.id}`}
                              size="small"
                              sx={{
                                bgcolor: '#e3f2fd',
                                color: '#1976d2',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {book.title}
                            </Typography>
                          </TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.isbn}</TableCell>
                          <TableCell>{book.category_name}</TableCell>
                          <TableCell>{book.total_copies}</TableCell>
                          <TableCell>
                            <Chip
                              label={book.available_copies}
                              color={book.available_copies > 0 ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={book.status}
                              color={book.status === 'available' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(book)}
                              sx={{ color: '#4a9b8e' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(book)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editMode ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="ISBN"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  required
                  label="Category"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  helperText={categories.length === 0 ? "Loading categories..." : "Select a book category"}
                  error={categories.length === 0}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.length === 0 ? (
                    <MenuItem value="" disabled>
                      No categories available - Please add categories first
                    </MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Publication Year"
                  name="publication_year"
                  type="number"
                  value={formData.publication_year}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Pages"
                  name="pages"
                  type="number"
                  value={formData.pages}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  required
                  label="Total Copies"
                  name="total_copies"
                  type="number"
                  value={formData.total_copies}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              {editMode ? 'Update' : 'Add'} Book
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={openDeleteDialog} 
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: '#ff6b6b', color: 'white' }}>
            ⚠️ Confirm Deletion
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {bookToDelete && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to delete this book?
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Title
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {bookToDelete.title}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Author
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {bookToDelete.author}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        ISBN
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {bookToDelete.isbn}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Copies
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {bookToDelete.total_copies}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Warning:</strong> This action cannot be undone. The book will be permanently removed from the library.
                  </Typography>
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDeleteDialog}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete Book
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianInventory;
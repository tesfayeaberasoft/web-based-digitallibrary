import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
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
  InputAdornment,
  Checkbox,
  Toolbar,
  Fade,
  Grow,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  DeleteSweep as BulkDeleteIcon,
  Edit as BulkEditIcon,
  CheckCircle as StatusIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  GetApp as ExportIcon,
  CloudUpload as ImportIcon,
  QrCode as QrCodeIcon,
  Print as PrintIcon,
  GetApp as DownloadQrIcon
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
  
  // Bulk operations state
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [openBulkDialog, setBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState(''); // 'delete', 'category', 'status'
  const [bulkFormData, setBulkFormData] = useState({
    category_id: '',
    status: ''
  });
  
  // Import/Export state
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // QR Code state
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [qrCodeBook, setQrCodeBook] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [bulkQrDialog, setBulkQrDialog] = useState(false);
  
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
    total_copies: '',
    condition_status: 'good'
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
        total_copies: book.total_copies,
        condition_status: book.condition_status || 'good'
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
        total_copies: '',
        condition_status: 'good'
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

  // Bulk operations handlers
  const handleSelectBook = (bookId) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(book => book.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedBooks([]);
  };

  const handleOpenBulkDialog = (action) => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books first');
      return;
    }
    setBulkAction(action);
    setBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setBulkDialog(false);
    setBulkAction('');
    setBulkFormData({ category_id: '', status: '' });
  };

  const handleBulkAction = async () => {
    if (selectedBooks.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (bulkAction === 'delete') {
        // Bulk delete using new API
        await axios.delete('http://localhost:8000/api/books/bulk-delete', {
          ...config,
          data: { book_ids: selectedBooks }
        });
        toast.success(`${selectedBooks.length} books deleted successfully!`);
      } else if (bulkAction === 'category') {
        // Bulk update category using new API
        if (!bulkFormData.category_id) {
          toast.error('Please select a category');
          return;
        }
        await axios.put(
          'http://localhost:8000/api/books/bulk-update',
          { 
            book_ids: selectedBooks,
            action: 'category',
            category_id: bulkFormData.category_id
          },
          config
        );
        toast.success(`Category updated for ${selectedBooks.length} books!`);
      } else if (bulkAction === 'status') {
        // Bulk update status using new API
        if (!bulkFormData.status) {
          toast.error('Please select a status');
          return;
        }
        await axios.put(
          'http://localhost:8000/api/books/bulk-update',
          { 
            book_ids: selectedBooks,
            action: 'status',
            status: bulkFormData.status
          },
          config
        );
        toast.success(`Status updated for ${selectedBooks.length} books!`);
      } else if (bulkAction === 'condition') {
        // Bulk update condition using new API
        if (!bulkFormData.condition_status) {
          toast.error('Please select a condition');
          return;
        }
        await axios.put(
          'http://localhost:8000/api/books/bulk-update',
          { 
            book_ids: selectedBooks,
            action: 'condition',
            condition_status: bulkFormData.condition_status
          },
          config
        );
        toast.success(`Condition updated for ${selectedBooks.length} books!`);
      }

      handleCloseBulkDialog();
      setSelectedBooks([]);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk operation failed');
    }
  };

  // Helper function for condition colors
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new':
        return '#4caf50'; // Green
      case 'good':
        return '#2196f3'; // Blue
      case 'fair':
        return '#ff9800'; // Orange
      case 'poor':
        return '#f44336'; // Red
      case 'damaged':
        return '#9e9e9e'; // Gray
      default:
        return '#2196f3'; // Default blue
    }
  };

  // Import/Export handlers
  const handleOpenImportDialog = () => {
    setOpenImportDialog(true);
    setImportFile(null);
    setImportPreview([]);
  };

  const handleCloseImportDialog = () => {
    setOpenImportDialog(false);
    setImportFile(null);
    setImportPreview([]);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      parseCSVPreview(file);
    } else {
      toast.error('Please select a valid CSV file');
      event.target.value = '';
    }
  };

  const parseCSVPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file must have at least a header and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const requiredHeaders = ['title', 'author', 'isbn', 'category_id', 'total_copies'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const preview = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setImportPreview(preview);
    };
    reader.readAsText(file);
  };

  const handleImportBooks = async () => {
    if (!importFile) {
      toast.error('Please select a file first');
      return;
    }

    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('csv_file', importFile);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/books/import',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Successfully imported ${response.data.imported_count} books!`);
        if (response.data.errors && response.data.errors.length > 0) {
          toast.warning(`${response.data.errors.length} rows had errors - check console for details`);
          console.log('Import errors:', response.data.errors);
        }
        handleCloseImportDialog();
        fetchBooks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleExportBooks = async (format = 'csv') => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = {
        format,
        search: searchQuery,
        category_id: categoryFilter
      };

      const response = await axios.get('http://localhost:8000/api/books/export', {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `books_inventory_${timestamp}.${format}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Inventory exported successfully as ${filename}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['title', 'author', 'isbn', 'category_id', 'publisher', 'publication_year', 'description', 'language', 'pages', 'total_copies'],
      ['Sample Book Title', 'John Doe', '978-1234567890', '1', 'Sample Publisher', '2024', 'A sample book description', 'English', '200', '5'],
      ['Another Book', 'Jane Smith', '978-0987654321', '2', 'Another Publisher', '2023', 'Another book description', 'English', '150', '3']
    ];

    const csvContent = sampleData.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_books_import.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    toast.success('Sample CSV downloaded!');
  };

  // QR Code handlers
  const handleOpenQrDialog = async (book) => {
    setQrCodeBook(book);
    setOpenQrDialog(true);
    setQrLoading(true);
    
    try {
      // Create QR code data with book information
      const qrData = JSON.stringify({
        id: book.id,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category_name,
        library: 'Digital Library System'
      });
      
      setQrCodeData(qrData);
      
      // Generate QR code image
      const qrImageUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeImage(qrImageUrl);
    } catch (error) {
      toast.error('Failed to generate QR code');
      console.error('QR Code generation error:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleCloseQrDialog = () => {
    setOpenQrDialog(false);
    setQrCodeBook(null);
    setQrCodeData('');
    setQrCodeImage('');
  };

  const handleDownloadQr = () => {
    if (!qrCodeImage || !qrCodeBook) return;
    
    const link = document.createElement('a');
    link.href = qrCodeImage;
    link.download = `qr_code_${qrCodeBook.title.replace(/[^a-zA-Z0-9]/g, '_')}_${qrCodeBook.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded!');
  };

  const handlePrintQr = () => {
    if (!qrCodeImage || !qrCodeBook) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${qrCodeBook.title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .qr-container {
              border: 2px solid #4a9b8e;
              border-radius: 10px;
              padding: 20px;
              margin: 20px auto;
              max-width: 400px;
              background: white;
            }
            .book-info {
              margin-bottom: 20px;
              text-align: left;
            }
            .book-info h2 {
              color: #4a9b8e;
              margin-bottom: 10px;
            }
            .book-info p {
              margin: 5px 0;
              color: #333;
            }
            .qr-image {
              margin: 20px 0;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .qr-container { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="book-info">
              <h2>${qrCodeBook.title}</h2>
              <p><strong>Author:</strong> ${qrCodeBook.author}</p>
              <p><strong>ISBN:</strong> ${qrCodeBook.isbn}</p>
              <p><strong>Category:</strong> ${qrCodeBook.category_name}</p>
              <p><strong>Book ID:</strong> #${qrCodeBook.id}</p>
            </div>
            <div class="qr-image">
              <img src="${qrCodeImage}" alt="QR Code" style="max-width: 100%;" />
            </div>
            <div class="footer">
              <p>Digital Library Management System</p>
              <p>Scan this QR code to access book information</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleBulkQrGeneration = () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books first');
      return;
    }
    setBulkQrDialog(true);
  };

  const handleCloseBulkQrDialog = () => {
    setBulkQrDialog(false);
  };

  const handleGenerateBulkQr = async () => {
    if (selectedBooks.length === 0) return;
    
    setQrLoading(true);
    try {
      const selectedBooksData = books.filter(book => selectedBooks.includes(book.id));
      
      // Generate QR codes for all selected books
      const qrPromises = selectedBooksData.map(async (book) => {
        const qrData = JSON.stringify({
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category_name,
          library: 'Digital Library System'
        });
        
        const qrImageUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        return { book, qrImageUrl };
      });
      
      const qrResults = await Promise.all(qrPromises);
      
      // Create a print page with all QR codes
      const printWindow = window.open('', '_blank');
      let htmlContent = `
        <html>
          <head>
            <title>Bulk QR Codes - ${selectedBooks.length} Books</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px;
                margin: 0;
              }
              .qr-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 20px 0;
              }
              .qr-item {
                border: 2px solid #4a9b8e;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                background: white;
                break-inside: avoid;
              }
              .book-info {
                margin-bottom: 10px;
                text-align: left;
              }
              .book-info h3 {
                color: #4a9b8e;
                margin: 0 0 8px 0;
                font-size: 14px;
              }
              .book-info p {
                margin: 3px 0;
                font-size: 12px;
                color: #333;
              }
              .qr-image {
                margin: 10px 0;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #4a9b8e;
                padding-bottom: 20px;
              }
              @media print {
                body { margin: 0; }
                .qr-item { border: 1px solid #000; }
                .qr-grid { grid-template-columns: repeat(2, 1fr); }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Digital Library QR Codes</h1>
              <p>Generated on ${new Date().toLocaleDateString()} - ${selectedBooks.length} Books</p>
            </div>
            <div class="qr-grid">
      `;
      
      qrResults.forEach(({ book, qrImageUrl }) => {
        htmlContent += `
          <div class="qr-item">
            <div class="book-info">
              <h3>${book.title}</h3>
              <p><strong>Author:</strong> ${book.author}</p>
              <p><strong>ISBN:</strong> ${book.isbn}</p>
              <p><strong>ID:</strong> #${book.id}</p>
            </div>
            <div class="qr-image">
              <img src="${qrImageUrl}" alt="QR Code" style="width: 120px; height: 120px;" />
            </div>
          </div>
        `;
      });
      
      htmlContent += `
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      
      toast.success(`Generated QR codes for ${selectedBooks.length} books!`);
      handleCloseBulkQrDialog();
      
    } catch (error) {
      toast.error('Failed to generate bulk QR codes');
      console.error('Bulk QR generation error:', error);
    } finally {
      setQrLoading(false);
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExportBooks('csv')}
              disabled={exportLoading}
              sx={{ borderColor: '#4a9b8e', color: '#4a9b8e' }}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => handleExportBooks('xlsx')}
              disabled={exportLoading}
              sx={{ borderColor: '#ff9800', color: '#ff9800' }}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<ImportIcon />}
              onClick={handleOpenImportDialog}
              sx={{ borderColor: '#2196f3', color: '#2196f3' }}
            >
              Import CSV
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              Add Book
            </Button>
          </Box>
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

        {/* Bulk Operations Toolbar */}
        {selectedBooks.length > 0 && (
          <Fade in={true} timeout={300}>
            <Card sx={{ mb: 3, bgcolor: '#e3f2fd', border: '2px solid #2196f3' }}>
              <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`${selectedBooks.length} book${selectedBooks.length > 1 ? 's' : ''} selected`}
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  />
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={handleClearSelection}
                    sx={{ color: '#1976d2' }}
                  >
                    Clear Selection
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<QrCodeIcon />}
                    onClick={handleBulkQrGeneration}
                    sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
                  >
                    Generate QR Codes
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<BulkEditIcon />}
                    onClick={() => handleOpenBulkDialog('category')}
                    sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
                  >
                    Update Category
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<StatusIcon />}
                    onClick={() => handleOpenBulkDialog('condition')}
                    sx={{ bgcolor: '#607d8b', '&:hover': { bgcolor: '#546e7a' } }}
                  >
                    Update Condition
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<StatusIcon />}
                    onClick={() => handleOpenBulkDialog('status')}
                    sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#45a049' } }}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<BulkDeleteIcon />}
                    onClick={() => handleOpenBulkDialog('delete')}
                    color="error"
                  >
                    Delete Selected
                  </Button>
                </Box>
              </Toolbar>
            </Card>
          </Fade>
        )}

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
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedBooks.length > 0 && selectedBooks.length < books.length}
                            checked={books.length > 0 && selectedBooks.length === books.length}
                            onChange={handleSelectAll}
                            sx={{ color: '#4a9b8e' }}
                          />
                        </TableCell>
                        <TableCell><strong>Book ID</strong></TableCell>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Author</strong></TableCell>
                        <TableCell><strong>ISBN</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Condition</strong></TableCell>
                        <TableCell><strong>Total Copies</strong></TableCell>
                        <TableCell><strong>Available</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {books.map((book) => (
                        <TableRow 
                          key={book.id} 
                          hover
                          selected={selectedBooks.includes(book.id)}
                          sx={{ 
                            '&.Mui-selected': { 
                              bgcolor: 'rgba(74, 155, 142, 0.08)' 
                            }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedBooks.includes(book.id)}
                              onChange={() => handleSelectBook(book.id)}
                              sx={{ color: '#4a9b8e' }}
                            />
                          </TableCell>
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
                          <TableCell>
                            <Chip
                              label={book.condition_status || 'good'}
                              size="small"
                              sx={{
                                bgcolor: getConditionColor(book.condition_status || 'good'),
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'capitalize'
                              }}
                            />
                          </TableCell>
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
                              onClick={() => handleOpenQrDialog(book)}
                              sx={{ color: '#9c27b0' }}
                              title="Generate QR Code"
                            >
                              <QrCodeIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(book)}
                              sx={{ color: '#4a9b8e' }}
                              title="Edit Book"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDeleteDialog(book)}
                              color="error"
                              title="Delete Book"
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
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  select
                  required
                  label="Condition"
                  name="condition_status"
                  value={formData.condition_status}
                  onChange={handleChange}
                  helperText="Physical condition of the book"
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                  <MenuItem value="damaged">Damaged</MenuItem>
                </TextField>
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

        {/* Bulk Operations Dialog */}
        <Dialog 
          open={openBulkDialog} 
          onClose={handleCloseBulkDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            sx={{ 
              bgcolor: bulkAction === 'delete' ? '#f44336' : '#4a9b8e',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {bulkAction === 'delete' && <BulkDeleteIcon />}
            {bulkAction === 'category' && <BulkEditIcon />}
            {bulkAction === 'status' && <StatusIcon />}
            {bulkAction === 'delete' && `Delete ${selectedBooks.length} Books`}
            {bulkAction === 'category' && `Update Category for ${selectedBooks.length} Books`}
            {bulkAction === 'condition' && `Update Condition for ${selectedBooks.length} Books`}
            {bulkAction === 'status' && `Update Status for ${selectedBooks.length} Books`}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box>
              <Alert 
                severity={bulkAction === 'delete' ? 'error' : 'info'}
                sx={{ mb: 3 }}
              >
                {bulkAction === 'delete' && (
                  <Typography variant="body2">
                    <strong>Warning:</strong> This will permanently delete {selectedBooks.length} books. This action cannot be undone.
                  </Typography>
                )}
                {bulkAction === 'category' && (
                  <Typography variant="body2">
                    <strong>Info:</strong> This will update the category for {selectedBooks.length} selected books.
                  </Typography>
                )}
                {bulkAction === 'condition' && (
                  <Typography variant="body2">
                    <strong>Info:</strong> This will update the physical condition for {selectedBooks.length} selected books.
                  </Typography>
                )}
                {bulkAction === 'status' && (
                  <Typography variant="body2">
                    <strong>Info:</strong> This will update the status for {selectedBooks.length} selected books.
                  </Typography>
                )}
              </Alert>

              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Selected Books ({selectedBooks.length}):</strong>
                </Typography>
                <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                  {books
                    .filter(book => selectedBooks.includes(book.id))
                    .map(book => (
                      <Typography key={book.id} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                        #{book.id} - {book.title} by {book.author}
                      </Typography>
                    ))
                  }
                </Box>
              </Box>

              {bulkAction === 'category' && (
                <TextField
                  fullWidth
                  select
                  required
                  label="New Category"
                  value={bulkFormData.category_id}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, category_id: e.target.value })}
                  helperText="Select the new category for all selected books"
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {bulkAction === 'condition' && (
                <TextField
                  fullWidth
                  select
                  required
                  label="New Condition"
                  value={bulkFormData.condition_status}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, condition_status: e.target.value })}
                  helperText="Select the new physical condition for all selected books"
                >
                  <MenuItem value="">
                    <em>Select a condition</em>
                  </MenuItem>
                  <MenuItem value="new">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50' }} />
                      New
                    </Box>
                  </MenuItem>
                  <MenuItem value="good">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196f3' }} />
                      Good
                    </Box>
                  </MenuItem>
                  <MenuItem value="fair">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800' }} />
                      Fair
                    </Box>
                  </MenuItem>
                  <MenuItem value="poor">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336' }} />
                      Poor
                    </Box>
                  </MenuItem>
                  <MenuItem value="damaged">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#9e9e9e' }} />
                      Damaged
                    </Box>
                  </MenuItem>
                </TextField>
              )}

              {bulkAction === 'status' && (
                <TextField
                  fullWidth
                  select
                  required
                  label="New Status"
                  value={bulkFormData.status}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, status: e.target.value })}
                  helperText="Select the new status for all selected books"
                >
                  <MenuItem value="">
                    <em>Select a status</em>
                  </MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </TextField>
              )}

              {bulkAction === 'delete' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Type "DELETE" to confirm:
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Type DELETE to confirm"
                    value={bulkFormData.confirmText || ''}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, confirmText: e.target.value })}
                    error={bulkFormData.confirmText && bulkFormData.confirmText !== 'DELETE'}
                    helperText={bulkFormData.confirmText && bulkFormData.confirmText !== 'DELETE' ? 'Please type "DELETE" exactly' : ''}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseBulkDialog}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              variant="contained"
              color={bulkAction === 'delete' ? 'error' : 'primary'}
              disabled={
                (bulkAction === 'category' && !bulkFormData.category_id) ||
                (bulkAction === 'condition' && !bulkFormData.condition_status) ||
                (bulkAction === 'status' && !bulkFormData.status) ||
                (bulkAction === 'delete' && bulkFormData.confirmText !== 'DELETE')
              }
              startIcon={
                bulkAction === 'delete' ? <BulkDeleteIcon /> :
                bulkAction === 'category' ? <BulkEditIcon /> : <StatusIcon />
              }
              sx={bulkAction !== 'delete' ? { bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } } : {}}
            >
              {bulkAction === 'delete' && 'Delete Books'}
              {bulkAction === 'category' && 'Update Category'}
              {bulkAction === 'condition' && 'Update Condition'}
              {bulkAction === 'status' && 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Import Books Dialog */}
        <Dialog 
          open={openImportDialog} 
          onClose={handleCloseImportDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle 
            sx={{ 
              bgcolor: '#2196f3',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ImportIcon />
            Import Books from CSV
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  CSV Import Instructions:
                </Typography>
                <Typography variant="body2" component="div">
                  • Required columns: title, author, isbn, category_id, total_copies<br/>
                  • Optional columns: publisher, publication_year, description, language, pages<br/>
                  • Use category IDs from your existing categories<br/>
                  • Ensure ISBN values are unique
                </Typography>
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadSampleCSV}
                  sx={{ mb: 2, borderColor: '#4a9b8e', color: '#4a9b8e' }}
                >
                  Download Sample CSV Template
                </Button>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Select CSV File:
                </Typography>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ 
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #2196f3',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </Box>

              {importPreview.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Preview (First 5 rows):
                  </Typography>
                  <Box sx={{ 
                    maxHeight: 300, 
                    overflow: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: 1
                  }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Title</strong></TableCell>
                          <TableCell><strong>Author</strong></TableCell>
                          <TableCell><strong>ISBN</strong></TableCell>
                          <TableCell><strong>Category ID</strong></TableCell>
                          <TableCell><strong>Copies</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importPreview.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.title}</TableCell>
                            <TableCell>{row.author}</TableCell>
                            <TableCell>{row.isbn}</TableCell>
                            <TableCell>{row.category_id}</TableCell>
                            <TableCell>{row.total_copies}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              )}

              <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Available Categories:</strong>
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories.map(category => (
                    <Chip
                      key={category.id}
                      label={`${category.id}: ${category.name}`}
                      size="small"
                      sx={{ bgcolor: '#4a9b8e', color: 'white' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseImportDialog}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportBooks}
              variant="contained"
              disabled={!importFile || importLoading}
              startIcon={importLoading ? <CircularProgress size={20} /> : <UploadIcon />}
              sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
            >
              {importLoading ? 'Importing...' : 'Import Books'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog 
          open={openQrDialog} 
          onClose={handleCloseQrDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            sx={{ 
              bgcolor: '#9c27b0',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <QrCodeIcon />
            QR Code - {qrCodeBook?.title}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            {qrCodeBook && (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    This QR code contains book information that can be scanned for quick access.
                  </Typography>
                </Alert>

                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Book Information:</strong>
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Book ID
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        #{qrCodeBook.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        ISBN
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {qrCodeBook.isbn}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Title
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {qrCodeBook.title}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Author
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {qrCodeBook.author}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Category
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {qrCodeBook.category_name}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  {qrLoading ? (
                    <Box sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: '#9c27b0' }} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Generating QR Code...
                      </Typography>
                    </Box>
                  ) : qrCodeImage ? (
                    <Box>
                      <img 
                        src={qrCodeImage} 
                        alt="QR Code" 
                        style={{ 
                          maxWidth: '100%', 
                          border: '2px solid #9c27b0',
                          borderRadius: '8px',
                          padding: '10px',
                          backgroundColor: 'white'
                        }} 
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                        Scan with any QR code reader
                      </Typography>
                    </Box>
                  ) : (
                    <Alert severity="error">
                      Failed to generate QR code
                    </Alert>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadQrIcon />}
                    onClick={handleDownloadQr}
                    disabled={!qrCodeImage}
                    sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintQr}
                    disabled={!qrCodeImage}
                    sx={{ borderColor: '#4a9b8e', color: '#4a9b8e' }}
                  >
                    Print
                  </Button>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQrDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Bulk QR Generation Dialog */}
        <Dialog 
          open={bulkQrDialog} 
          onClose={handleCloseBulkQrDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle 
            sx={{ 
              bgcolor: '#9c27b0',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <QrCodeIcon />
            Generate QR Codes for {selectedBooks.length} Books
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  This will generate QR codes for all selected books and open a print-ready page.
                </Typography>
              </Alert>

              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Selected Books ({selectedBooks.length}):</strong>
                </Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {books
                    .filter(book => selectedBooks.includes(book.id))
                    .map(book => (
                      <Box key={book.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <QrCodeIcon sx={{ fontSize: 16, color: '#9c27b0' }} />
                        <Typography variant="caption">
                          #{book.id} - {book.title} by {book.author}
                        </Typography>
                      </Box>
                    ))
                  }
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Features:</strong><br/>
                  • Individual QR codes for each book<br/>
                  • Print-optimized layout<br/>
                  • Book information included<br/>
                  • Ready for cutting and labeling
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseBulkQrDialog}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateBulkQr}
              variant="contained"
              disabled={qrLoading}
              startIcon={qrLoading ? <CircularProgress size={20} /> : <QrCodeIcon />}
              sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              {qrLoading ? 'Generating...' : 'Generate & Print'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianInventory;
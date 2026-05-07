import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  Avatar,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  Tabs,
  Tab,
  Fade,
  Grow,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  Book as BookIcon,
  CheckCircle as CheckIcon,
  Assignment as IssueIcon,
  AssignmentReturn as ReturnIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Group as GroupIcon,
  LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibrarianBulkOperations = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Bulk Issue State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [borrowDays, setBorrowDays] = useState(14);
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  
  // Bulk Return State
  const [activeLoans, setActiveLoans] = useState([]);
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [groupedLoans, setGroupedLoans] = useState({});
  const [expandedUsers, setExpandedUsers] = useState({});
  
  // Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '',
    data: null
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchUsers();
      fetchBooks();
    } else if (tabValue === 1) {
      fetchActiveLoans();
    }
  }, [tabValue]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:8000/api/users', config);
      if (response.data.success) {
        setUsers(response.data.users.filter(user => user.role === 'user' && user.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:8000/api/books?status=active', config);
      if (response.data.success) {
        setBooks(response.data.books.filter(book => book.available_copies > 0));
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    }
  };

  const fetchActiveLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:8000/api/loans?status=active', config);
      if (response.data.success) {
        setActiveLoans(response.data.loans);
        
        // Group loans by user
        const grouped = response.data.loans.reduce((acc, loan) => {
          const userId = loan.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_name: loan.user_name,
              user_email: loan.user_email,
              loans: []
            };
          }
          acc[userId].loans.push(loan);
          return acc;
        }, {});
        
        setGroupedLoans(grouped);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error('Failed to load active loans');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset state when switching tabs
    if (newValue === 0) {
      setSelectedUser(null);
      setSelectedBooks([]);
    } else {
      setSelectedLoans([]);
    }
  };

  const handleAddBook = (book) => {
    if (!selectedBooks.find(b => b.id === book.id)) {
      setSelectedBooks([...selectedBooks, book]);
    }
  };

  const handleRemoveBook = (bookId) => {
    setSelectedBooks(selectedBooks.filter(book => book.id !== bookId));
  };

  const handleLoanSelection = (loanId, checked) => {
    if (checked) {
      setSelectedLoans([...selectedLoans, loanId]);
    } else {
      setSelectedLoans(selectedLoans.filter(id => id !== loanId));
    }
  };

  const handleUserLoanSelection = (userId, checked) => {
    const userLoans = groupedLoans[userId]?.loans || [];
    const loanIds = userLoans.map(loan => loan.id);
    
    if (checked) {
      const newSelectedLoans = [...new Set([...selectedLoans, ...loanIds])];
      setSelectedLoans(newSelectedLoans);
    } else {
      setSelectedLoans(selectedLoans.filter(id => !loanIds.includes(id)));
    }
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleBulkIssue = async () => {
    if (!selectedUser || selectedBooks.length === 0) {
      toast.error('Please select a user and at least one book');
      return;
    }

    setConfirmDialog({
      open: true,
      type: 'issue',
      data: {
        user: selectedUser,
        books: selectedBooks,
        borrow_days: borrowDays
      }
    });
  };

  const handleBulkReturn = async () => {
    if (selectedLoans.length === 0) {
      toast.error('Please select at least one loan to return');
      return;
    }

    setConfirmDialog({
      open: true,
      type: 'return',
      data: {
        loan_ids: selectedLoans,
        loans: activeLoans.filter(loan => selectedLoans.includes(loan.id))
      }
    });
  };

  const confirmBulkIssue = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(
        'http://localhost:8000/api/loans/bulk-issue',
        {
          user_id: selectedUser.id,
          book_ids: selectedBooks.map(book => book.id),
          borrow_days: borrowDays
        },
        config
      );

      if (response.data.success) {
        toast.success(`Successfully issued ${response.data.issued_count} books!`);
        setSelectedUser(null);
        setSelectedBooks([]);
        fetchBooks(); // Refresh available books
      }
    } catch (error) {
      console.error('Bulk issue error:', error);
      toast.error(error.response?.data?.message || 'Failed to issue books');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, type: '', data: null });
    }
  };

  const confirmBulkReturn = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(
        'http://localhost:8000/api/loans/bulk-return',
        {
          loan_ids: selectedLoans
        },
        config
      );

      if (response.data.success) {
        const result = response.data;
        let message = `Successfully returned ${result.returned_count} books!`;
        
        if (result.total_fine > 0) {
          message += ` Total fines: $${result.total_fine.toFixed(2)}`;
        }
        
        toast.success(message);
        setSelectedLoans([]);
        fetchActiveLoans(); // Refresh active loans
      }
    } catch (error) {
      console.error('Bulk return error:', error);
      toast.error(error.response?.data?.message || 'Failed to return books');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, type: '', data: null });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'suspended': return '#f44336';
      case 'inactive': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getOverdueChip = (dueDate) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (daysUntilDue < 0) {
      return <Chip label={`${Math.abs(daysUntilDue)} days overdue`} color="error" size="small" />;
    } else if (daysUntilDue <= 3) {
      return <Chip label={`Due in ${daysUntilDue} days`} color="warning" size="small" />;
    } else {
      return <Chip label={`Due in ${daysUntilDue} days`} color="success" size="small" />;
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#4a9b8e', fontWeight: 600 }}>
          Bulk Operations
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Process multiple book issues or returns efficiently
        </Typography>

        <Card sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                label="Bulk Issue" 
                icon={<IssueIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Bulk Return" 
                icon={<ReturnIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent>
            {/* Bulk Issue Tab */}
            {tabValue === 0 && (
              <Fade in timeout={500}>
                <Box>
                  <Grid container spacing={3}>
                    {/* User Selection */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ color: '#4a9b8e' }}>
                            Select User
                          </Typography>
                          
                          <Autocomplete
                            options={users}
                            getOptionLabel={(option) => `${option.full_name} (${option.user_id})`}
                            value={selectedUser}
                            onChange={(event, newValue) => setSelectedUser(newValue)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Search Users"
                                variant="outlined"
                                fullWidth
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Avatar sx={{ mr: 2, bgcolor: '#4a9b8e' }}>
                                  {option.full_name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1">{option.full_name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    ID: {option.user_id} | {option.email}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          />

                          {selectedUser && (
                            <Grow in timeout={300}>
                              <Box sx={{ mt: 2, p: 2, bgcolor: 'white', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                                    {selectedUser.full_name.charAt(0)}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6">{selectedUser.full_name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      ID: {selectedUser.user_id} | {selectedUser.email}
                                    </Typography>
                                  </Box>
                                  <Chip 
                                    label={selectedUser.status}
                                    sx={{ 
                                      bgcolor: getStatusColor(selectedUser.status),
                                      color: 'white'
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Grow>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Book Selection */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom sx={{ color: '#4a9b8e' }}>
                            Select Books ({selectedBooks.length})
                          </Typography>
                          
                          <Autocomplete
                            options={books.filter(book => !selectedBooks.find(sb => sb.id === book.id))}
                            getOptionLabel={(option) => `${option.title} by ${option.author}`}
                            onChange={(event, newValue) => {
                              if (newValue) {
                                handleAddBook(newValue);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Search Books"
                                variant="outlined"
                                fullWidth
                              />
                            )}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Avatar sx={{ mr: 2, bgcolor: '#2196f3' }}>
                                  <BookIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="body1">{option.title}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    by {option.author} | Available: {option.available_copies}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                          />

                          {selectedBooks.length > 0 && (
                            <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                              {selectedBooks.map((book) => (
                                <Box 
                                  key={book.id}
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2, 
                                    p: 1,
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    mb: 1
                                  }}
                                >
                                  <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                                    <BookIcon sx={{ fontSize: 16 }} />
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                      {book.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      by {book.author}
                                    </Typography>
                                  </Box>
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleRemoveBook(book.id)}
                                    sx={{ color: '#f44336' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Issue Controls */}
                    <Grid item xs={12}>
                      <Card sx={{ bgcolor: '#e8f5e8' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <TextField
                              label="Borrow Days"
                              type="number"
                              value={borrowDays}
                              onChange={(e) => setBorrowDays(parseInt(e.target.value))}
                              size="small"
                              sx={{ width: 150 }}
                            />
                            <Button
                              variant="contained"
                              size="large"
                              onClick={handleBulkIssue}
                              disabled={!selectedUser || selectedBooks.length === 0 || loading}
                              startIcon={loading ? <CircularProgress size={20} /> : <IssueIcon />}
                              sx={{ 
                                bgcolor: '#4a9b8e', 
                                '&:hover': { bgcolor: '#3d8276' },
                                px: 4
                              }}
                            >
                              Issue {selectedBooks.length} Books
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}

            {/* Bulk Return Tab */}
            {tabValue === 1 && (
              <Fade in timeout={500}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#4a9b8e' }}>
                      Active Loans ({activeLoans.length})
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleBulkReturn}
                      disabled={selectedLoans.length === 0 || loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <ReturnIcon />}
                      sx={{ 
                        bgcolor: '#2196f3', 
                        '&:hover': { bgcolor: '#1976d2' }
                      }}
                    >
                      Return {selectedLoans.length} Books
                    </Button>
                  </Box>

                  {Object.keys(groupedLoans).length === 0 ? (
                    <Alert severity="info">No active loans found</Alert>
                  ) : (
                    <List>
                      {Object.entries(groupedLoans).map(([userId, userData]) => {
                        const userLoanIds = userData.loans.map(loan => loan.id);
                        const allSelected = userLoanIds.every(id => selectedLoans.includes(id));
                        const someSelected = userLoanIds.some(id => selectedLoans.includes(id));
                        
                        return (
                          <Card key={userId} sx={{ mb: 2 }}>
                            <ListItem>
                              <ListItemIcon>
                                <Checkbox
                                  checked={allSelected}
                                  indeterminate={someSelected && !allSelected}
                                  onChange={(e) => handleUserLoanSelection(userId, e.target.checked)}
                                />
                              </ListItemIcon>
                              <Avatar sx={{ mr: 2, bgcolor: '#4a9b8e' }}>
                                {userData.user_name.charAt(0)}
                              </Avatar>
                              <ListItemText
                                primary={userData.user_name}
                                secondary={`${userData.user_email} | ${userData.loans.length} active loans`}
                              />
                              <Chip 
                                label={`${userData.loans.length} books`}
                                color="primary"
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <IconButton onClick={() => toggleUserExpansion(userId)}>
                                {expandedUsers[userId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                            </ListItem>
                            
                            <Collapse in={expandedUsers[userId]} timeout="auto" unmountOnExit>
                              <Box sx={{ pl: 4, pr: 2, pb: 2 }}>
                                {userData.loans.map((loan) => (
                                  <Box 
                                    key={loan.id}
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 2, 
                                      p: 2,
                                      bgcolor: '#f8f9fa',
                                      borderRadius: 1,
                                      mb: 1
                                    }}
                                  >
                                    <Checkbox
                                      checked={selectedLoans.includes(loan.id)}
                                      onChange={(e) => handleLoanSelection(loan.id, e.target.checked)}
                                    />
                                    <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                                      <BookIcon sx={{ fontSize: 16 }} />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        {loan.book_title}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        by {loan.book_author} | Issued: {new Date(loan.loan_date).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                    {getOverdueChip(loan.due_date)}
                                  </Box>
                                ))}
                              </Box>
                            </Collapse>
                          </Card>
                        );
                      })}
                    </List>
                  )}
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, type: '', data: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {confirmDialog.type === 'issue' ? 'Confirm Bulk Issue' : 'Confirm Bulk Return'}
          </DialogTitle>
          <DialogContent>
            {confirmDialog.type === 'issue' && confirmDialog.data && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  You are about to issue {confirmDialog.data.books.length} books to {confirmDialog.data.user.full_name}
                </Alert>
                
                <Typography variant="h6" gutterBottom>User:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                    {confirmDialog.data.user.full_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {confirmDialog.data.user.full_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {confirmDialog.data.user.user_id} | {confirmDialog.data.user.email}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom>Books ({confirmDialog.data.books.length}):</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {confirmDialog.data.books.map((book) => (
                    <Box key={book.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                        <BookIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{book.title}</Typography>
                        <Typography variant="caption" color="text.secondary">by {book.author}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Due date: {new Date(Date.now() + confirmDialog.data.borrow_days * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {confirmDialog.type === 'return' && confirmDialog.data && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You are about to return {confirmDialog.data.loans.length} books. Any overdue fines will be calculated automatically.
                </Alert>
                
                <Typography variant="h6" gutterBottom>Books to Return ({confirmDialog.data.loans.length}):</Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {confirmDialog.data.loans.map((loan) => (
                    <Box key={loan.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Avatar sx={{ bgcolor: '#2196f3', width: 32, height: 32 }}>
                        <BookIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{loan.book_title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {loan.book_author} | Borrower: {loan.user_name}
                        </Typography>
                      </Box>
                      {getOverdueChip(loan.due_date)}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, type: '', data: null })}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDialog.type === 'issue' ? confirmBulkIssue : confirmBulkReturn}
              variant="contained"
              disabled={loading}
              sx={{ 
                bgcolor: confirmDialog.type === 'issue' ? '#4a9b8e' : '#2196f3',
                '&:hover': { 
                  bgcolor: confirmDialog.type === 'issue' ? '#3d8276' : '#1976d2'
                }
              }}
            >
              {loading ? <CircularProgress size={20} /> : `Confirm ${confirmDialog.type === 'issue' ? 'Issue' : 'Return'}`}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianBulkOperations;
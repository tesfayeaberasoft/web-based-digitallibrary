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
  Fade,
  Grow,
  CircularProgress
} from '@mui/material';
import {
  QrCodeScanner as ScannerIcon,
  Person as PersonIcon,
  Book as BookIcon,
  CheckCircle as CheckIcon,
  Assignment as IssueIcon,
  AssignmentReturn as ReturnIcon,
  Search as SearchIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BarcodeScanner from '../../components/BarcodeScanner';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibrarianBarcode = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMode, setScanMode] = useState(''); // 'issue', 'return', 'lookup'
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Issue workflow state
  const [issueStep, setIssueStep] = useState(0); // 0: scan user, 1: scan book, 2: confirm
  const [issueData, setIssueData] = useState({
    user: null,
    book: null,
    borrow_days: 14
  });
  
  // Return workflow state
  const [returnData, setReturnData] = useState(null);
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: '',
    data: null
  });

  const handleStartScan = (mode) => {
    setScanMode(mode);
    setScannedData(null);
    
    if (mode === 'issue') {
      setIssueStep(0);
      setIssueData({ user: null, book: null, borrow_days: 14 });
    } else if (mode === 'return') {
      setReturnData(null);
    }
    
    setScannerOpen(true);
  };

  const handleScanResult = async (barcode) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (scanMode === 'lookup') {
        // General lookup
        const response = await axios.get(
          `http://localhost:8000/api/barcode/lookup?code=${encodeURIComponent(barcode)}`,
          config
        );
        
        if (response.data.success) {
          setScannedData(response.data);
          toast.success(`${response.data.type === 'book' ? 'Book' : 'User'} found!`);
        }
      } else if (scanMode === 'issue') {
        if (issueStep === 0) {
          // Scanning user barcode
          const response = await axios.get(
            `http://localhost:8000/api/barcode/lookup?code=${encodeURIComponent(barcode)}&type=user`,
            config
          );
          
          if (response.data.success && response.data.type === 'user') {
            setIssueData(prev => ({ ...prev, user: response.data.data }));
            setIssueStep(1);
            toast.success('User found! Now scan the book barcode.');
            setScannerOpen(true); // Keep scanner open for book scan
            return; // Don't close scanner yet
          } else {
            toast.error('User not found with this barcode');
          }
        } else if (issueStep === 1) {
          // Scanning book barcode
          const response = await axios.get(
            `http://localhost:8000/api/barcode/lookup?code=${encodeURIComponent(barcode)}&type=book`,
            config
          );
          
          if (response.data.success && response.data.type === 'book') {
            setIssueData(prev => ({ ...prev, book: response.data.data }));
            setIssueStep(2);
            toast.success('Book found! Review and confirm issue.');
          } else {
            toast.error('Book not found with this barcode');
          }
        }
      } else if (scanMode === 'return') {
        // Book return - scan book barcode
        const response = await axios.get(
          `http://localhost:8000/api/barcode/lookup?code=${encodeURIComponent(barcode)}&type=book`,
          config
        );
        
        if (response.data.success && response.data.type === 'book') {
          setReturnData({ book: response.data.data, barcode });
          setConfirmDialog({
            open: true,
            type: 'return',
            data: { book: response.data.data, barcode }
          });
        } else {
          toast.error('Book not found with this barcode');
        }
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      toast.error(error.response?.data?.message || 'Failed to lookup barcode');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async () => {
    if (!issueData.user || !issueData.book) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(
        'http://localhost:8000/api/barcode/quick-issue',
        {
          user_barcode: issueData.user.user_id,
          book_barcode: issueData.book.isbn,
          borrow_days: issueData.borrow_days
        },
        config
      );

      if (response.data.success) {
        toast.success('Book issued successfully!');
        resetIssueWorkflow();
      }
    } catch (error) {
      console.error('Issue book error:', error);
      toast.error(error.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async () => {
    if (!returnData) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(
        'http://localhost:8000/api/barcode/quick-return',
        {
          book_barcode: returnData.barcode
        },
        config
      );

      if (response.data.success) {
        const result = response.data;
        let message = 'Book returned successfully!';
        
        if (result.fine_amount > 0) {
          message += ` Fine: $${result.fine_amount.toFixed(2)} (${result.days_overdue} days overdue)`;
        }
        
        if (result.reservation_info) {
          message += ` Next user notified: ${result.reservation_info.next_user}`;
        }
        
        toast.success(message);
        setReturnData(null);
        setConfirmDialog({ open: false, type: '', data: null });
      }
    } catch (error) {
      console.error('Return book error:', error);
      toast.error(error.response?.data?.message || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const resetIssueWorkflow = () => {
    setIssueStep(0);
    setIssueData({ user: null, book: null, borrow_days: 14 });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'suspended': return '#f44336';
      case 'inactive': return '#9e9e9e';
      default: return '#2196f3';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'new': return '#4caf50';
      case 'good': return '#2196f3';
      case 'fair': return '#ff9800';
      case 'poor': return '#ff5722';
      case 'damaged': return '#f44336';
      default: return '#2196f3';
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#4a9b8e', fontWeight: 600 }}>
          Barcode Scanner
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Scan barcodes for quick book issue, return, and lookup operations
        </Typography>

        {/* Quick Action Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Fade in timeout={300}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
              onClick={() => handleStartScan('issue')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <IssueIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Issue Book
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Scan user ID then book barcode to issue
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={600}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
              onClick={() => handleStartScan('return')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <ReturnIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Return Book
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Scan book barcode to process return
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={900}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}
              onClick={() => handleStartScan('lookup')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SearchIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Lookup
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Scan any barcode to lookup information
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Issue Workflow Progress */}
        {scanMode === 'issue' && (
          <Grow in timeout={500}>
            <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#4a9b8e' }}>
                  Issue Book Workflow
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip 
                    label="1. Scan User" 
                    color={issueStep >= 0 ? 'primary' : 'default'}
                    icon={issueStep > 0 ? <CheckIcon /> : <PersonIcon />}
                  />
                  <Chip 
                    label="2. Scan Book" 
                    color={issueStep >= 1 ? 'primary' : 'default'}
                    icon={issueStep > 1 ? <CheckIcon /> : <BookIcon />}
                  />
                  <Chip 
                    label="3. Confirm Issue" 
                    color={issueStep >= 2 ? 'primary' : 'default'}
                    icon={<IssueIcon />}
                  />
                </Box>

                {issueData.user && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">User:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                        {issueData.user.full_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {issueData.user.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ID: {issueData.user.user_id} | Active Loans: {issueData.user.active_loans}
                        </Typography>
                      </Box>
                      <Chip 
                        label={issueData.user.status}
                        size="small"
                        sx={{ 
                          bgcolor: getStatusColor(issueData.user.status),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {issueData.book && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Book:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <BookIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {issueData.book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {issueData.book.author} | Available: {issueData.book.available_copies}
                        </Typography>
                      </Box>
                      <Chip 
                        label={issueData.book.condition_status || 'good'}
                        size="small"
                        sx={{ 
                          bgcolor: getConditionColor(issueData.book.condition_status),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {issueStep === 2 && (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      label="Borrow Days"
                      type="number"
                      value={issueData.borrow_days}
                      onChange={(e) => setIssueData(prev => ({ ...prev, borrow_days: parseInt(e.target.value) }))}
                      size="small"
                      sx={{ width: 120 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleIssueBook}
                      disabled={loading}
                      sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Issue Book'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={resetIssueWorkflow}
                    >
                      Reset
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        )}

        {/* Lookup Results */}
        {scannedData && scanMode === 'lookup' && (
          <Grow in timeout={500}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#4a9b8e' }}>
                  Scan Result - {scannedData.type === 'book' ? 'Book' : 'User'}
                </Typography>
                
                {scannedData.type === 'user' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: '#4a9b8e' }}>
                      {scannedData.data.full_name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{scannedData.data.full_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {scannedData.data.user_id} | Email: {scannedData.data.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={`Active Loans: ${scannedData.data.active_loans}`} size="small" />
                        <Chip label={`Overdue: ${scannedData.data.overdue_loans}`} size="small" color={scannedData.data.overdue_loans > 0 ? 'error' : 'default'} />
                        {scannedData.data.pending_fines > 0 && (
                          <Chip label={`Fines: $${scannedData.data.pending_fines.toFixed(2)}`} size="small" color="warning" />
                        )}
                      </Box>
                    </Box>
                    <Chip 
                      label={scannedData.data.status}
                      sx={{ 
                        bgcolor: getStatusColor(scannedData.data.status),
                        color: 'white'
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: '#2196f3' }}>
                      <BookIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{scannedData.data.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        by {scannedData.data.author} | ISBN: {scannedData.data.isbn}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={`Available: ${scannedData.data.available_copies}/${scannedData.data.total_copies}`} size="small" />
                        <Chip 
                          label={scannedData.data.condition_status || 'good'}
                          size="small"
                          sx={{ 
                            bgcolor: getConditionColor(scannedData.data.condition_status),
                            color: 'white'
                          }}
                        />
                        <Chip label={scannedData.data.category_name || 'Uncategorized'} size="small" />
                      </Box>
                    </Box>
                    <Chip 
                      label={scannedData.data.status}
                      color={scannedData.data.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>
        )}

        {/* Instructions */}
        <Card sx={{ bgcolor: '#f0f7ff' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <InfoIcon sx={{ color: '#2196f3' }} />
              <Typography variant="h6" sx={{ color: '#2196f3' }}>
                How to Use Barcode Scanner
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Issue Book:</Typography>
                <Typography variant="body2" color="text.secondary">
                  1. Click "Issue Book"<br/>
                  2. Scan user ID barcode<br/>
                  3. Scan book ISBN barcode<br/>
                  4. Confirm and issue
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Return Book:</Typography>
                <Typography variant="body2" color="text.secondary">
                  1. Click "Return Book"<br/>
                  2. Scan book ISBN barcode<br/>
                  3. Confirm return<br/>
                  4. Process any fines
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>Lookup:</Typography>
                <Typography variant="body2" color="text.secondary">
                  1. Click "Lookup"<br/>
                  2. Scan any barcode<br/>
                  3. View information<br/>
                  4. Take appropriate action
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Barcode Scanner Component */}
        <BarcodeScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={handleScanResult}
          title={
            scanMode === 'issue' 
              ? `Issue Book - Step ${issueStep + 1}: Scan ${issueStep === 0 ? 'User ID' : 'Book ISBN'}`
              : scanMode === 'return'
              ? 'Return Book - Scan Book ISBN'
              : 'Barcode Lookup'
          }
          subtitle={
            scanMode === 'issue'
              ? issueStep === 0 
                ? 'Scan the user ID barcode or card'
                : 'Scan the book ISBN barcode'
              : scanMode === 'return'
              ? 'Scan the book ISBN barcode to return'
              : 'Scan any barcode to lookup information'
          }
        />

        {/* Return Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open && confirmDialog.type === 'return'}
          onClose={() => setConfirmDialog({ open: false, type: '', data: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Book Return</DialogTitle>
          <DialogContent>
            {confirmDialog.data && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Are you sure you want to return this book?
                </Alert>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3' }}>
                    <BookIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{confirmDialog.data.book.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      by {confirmDialog.data.book.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ISBN: {confirmDialog.data.book.isbn}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, type: '', data: null })}>
              Cancel
            </Button>
            <Button 
              onClick={handleReturnBook}
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              {loading ? <CircularProgress size={20} /> : 'Confirm Return'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianBarcode;
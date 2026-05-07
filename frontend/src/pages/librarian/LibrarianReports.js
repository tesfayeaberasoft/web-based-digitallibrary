import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Fade,
  Grow,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment as ReportIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MenuBook as BookIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  BarChart as ChartIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const LibrarianReports = () => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [reportData, setReportData] = useState(null);
  
  // Filters
  const [reportType, setReportType] = useState('circulation');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customDateRange, setCustomDateRange] = useState(false);

  useEffect(() => {
    // Set default date range
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(lastMonth.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [reportType, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/librarian/reports', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: reportType,
          start_date: startDate,
          end_date: endDate
        }
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load report data');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(today.getDate() - 7);
        setCustomDateRange(false);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        setCustomDateRange(false);
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        setCustomDateRange(false);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        setCustomDateRange(false);
        break;
      case 'custom':
        setCustomDateRange(true);
        return;
      default:
        break;
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const handleExport = (format) => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }
    
    // Convert report data to CSV or JSON
    if (format === 'csv') {
      exportToCSV();
    } else if (format === 'json') {
      exportToJSON();
    } else if (format === 'pdf') {
      toast.info('PDF export coming soon!');
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;
    
    let csv = '';
    let filename = '';
    
    switch (reportType) {
      case 'circulation':
        csv = 'Date,Total Loans,Total Returns,Active Loans,Overdue Books\n';
        filename = 'circulation_report.csv';
        if (reportData.daily_stats) {
          reportData.daily_stats.forEach(stat => {
            csv += `${stat.date},${stat.loans},${stat.returns},${stat.active},${stat.overdue}\n`;
          });
        }
        break;
      case 'inventory':
        csv = 'Category,Total Books,Available,Borrowed,Reserved\n';
        filename = 'inventory_report.csv';
        if (reportData.by_category) {
          reportData.by_category.forEach(cat => {
            csv += `${cat.category},${cat.total},${cat.available},${cat.borrowed},${cat.reserved}\n`;
          });
        }
        break;
      case 'members':
        csv = 'Status,Count,Percentage\n';
        filename = 'members_report.csv';
        if (reportData.by_status) {
          reportData.by_status.forEach(stat => {
            csv += `${stat.status},${stat.count},${stat.percentage}%\n`;
          });
        }
        break;
      case 'financial':
        csv = 'Type,Amount,Count\n';
        filename = 'financial_report.csv';
        if (reportData.fines) {
          csv += `Total Fines,${reportData.fines.total},${reportData.fines.count}\n`;
          csv += `Paid Fines,${reportData.fines.paid},${reportData.fines.paid_count}\n`;
          csv += `Unpaid Fines,${reportData.fines.unpaid},${reportData.fines.unpaid_count}\n`;
        }
        break;
      default:
        break;
    }
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const exportToJSON = () => {
    if (!reportData) return;
    
    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSummaryCards = () => {
    if (!reportData || !reportData.summary) return null;
    
    const { summary } = reportData;
    
    return (
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={600}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {summary.total_transactions || 0}
                    </Typography>
                    <Typography variant="body2">
                      Total Transactions
                    </Typography>
                  </Box>
                  <BookIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={800}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {summary.active_members || 0}
                    </Typography>
                    <Typography variant="body2">
                      Active Members
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={1000}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {summary.books_circulated || 0}
                    </Typography>
                    <Typography variant="body2">
                      Books Circulated
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Grow in={true} timeout={1200}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      ${summary.total_revenue || 0}
                    </Typography>
                    <Typography variant="body2">
                      Total Revenue
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Grid>
      </Grid>
    );
  };

  const renderCirculationReport = () => {
    if (!reportData || !reportData.daily_stats) return null;
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Daily Circulation Statistics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Loans</strong></TableCell>
                  <TableCell><strong>Returns</strong></TableCell>
                  <TableCell><strong>Active</strong></TableCell>
                  <TableCell><strong>Overdue</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.daily_stats.map((stat, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{new Date(stat.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={stat.loans} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={stat.returns} color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={stat.active} color="info" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={stat.overdue} color="error" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData || !reportData.by_category) return null;
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Inventory by Category
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Total Books</strong></TableCell>
                  <TableCell><strong>Available</strong></TableCell>
                  <TableCell><strong>Borrowed</strong></TableCell>
                  <TableCell><strong>Reserved</strong></TableCell>
                  <TableCell><strong>Utilization</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.by_category.map((cat, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{cat.category}</TableCell>
                    <TableCell>{cat.total}</TableCell>
                    <TableCell>
                      <Chip label={cat.available} color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={cat.borrowed} color="warning" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={cat.reserved} color="info" size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {cat.utilization}%
                        </Typography>
                        {cat.utilization > 70 ? (
                          <TrendingUpIcon color="success" fontSize="small" />
                        ) : (
                          <TrendingDownIcon color="error" fontSize="small" />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderMembersReport = () => {
    if (!reportData) return null;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Members by Status
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Count</strong></TableCell>
                      <TableCell><strong>Percentage</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.by_status && reportData.by_status.map((stat, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Chip 
                            label={stat.status} 
                            color={stat.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{stat.count}</TableCell>
                        <TableCell>{stat.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top Active Members
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Member</strong></TableCell>
                      <TableCell><strong>Books Borrowed</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.top_members && reportData.top_members.map((member, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>
                          <Chip label={member.books_borrowed} color="primary" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData || !reportData.fines) return null;
    
    const { fines } = reportData;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Fines
              </Typography>
              <Typography variant="h4" fontWeight={700} color="primary">
                ${fines.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fines.count} transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Paid Fines
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                ${fines.paid}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fines.paid_count} payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Unpaid Fines
              </Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">
                ${fines.unpaid}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fines.unpaid_count} outstanding
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Fine Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell><strong>Member</strong></TableCell>
                      <TableCell><strong>Book</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fines.details && fines.details.map((fine, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{fine.member_name}</TableCell>
                        <TableCell>{fine.book_title}</TableCell>
                        <TableCell>${fine.amount}</TableCell>
                        <TableCell>
                          <Chip 
                            label={fine.status} 
                            color={fine.status === 'paid' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{new Date(fine.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <DashboardLayout title="Librarian Panel">
      <Fade in={true} timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                📊 Reports & Analytics
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Generate and export library reports
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchReportData} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print Report">
                <IconButton onClick={handlePrint} color="primary">
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Report Type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <MenuItem value="circulation">Circulation Report</MenuItem>
                    <MenuItem value="inventory">Inventory Report</MenuItem>
                    <MenuItem value="members">Members Report</MenuItem>
                    <MenuItem value="financial">Financial Report</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Date Range"
                    value={dateRange}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                    <MenuItem value="week">Last Week</MenuItem>
                    <MenuItem value="month">Last Month</MenuItem>
                    <MenuItem value="quarter">Last Quarter</MenuItem>
                    <MenuItem value="year">Last Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </TextField>
                </Grid>
                
                {customDateRange && (
                  <>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Start Date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        type="date"
                        label="End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12} md={customDateRange ? 2 : 6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<ExcelIcon />}
                      onClick={() => handleExport('csv')}
                      sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleExport('json')}
                    >
                      JSON
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#4a9b8e' }} />
            </Box>
          )}

          {/* Report Content */}
          {!loading && reportData && (
            <Box>
              {renderSummaryCards()}
              
              {reportType === 'circulation' && renderCirculationReport()}
              {reportType === 'inventory' && renderInventoryReport()}
              {reportType === 'members' && renderMembersReport()}
              {reportType === 'financial' && renderFinancialReport()}
            </Box>
          )}

          {/* No Data State */}
          {!loading && !reportData && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <ChartIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Report Data Available
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a report type and date range to generate a report
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Fade>
    </DashboardLayout>
  );
};

export default LibrarianReports;

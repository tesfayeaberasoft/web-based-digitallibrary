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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Fade,
  Grow,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Book as BookIcon,
  DragIndicator as DragIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Queue as QueueIcon,
  Reorder as ReorderIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountBalance as FineIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

// Sortable Item Component
const SortableReservationItem = ({ reservation, onCancel }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reservation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (position) => {
    if (position === 1) return '#4caf50'; // Green for first
    if (position <= 3) return '#ff9800'; // Orange for top 3
    return '#2196f3'; // Blue for others
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        bgcolor: 'white',
        mb: 1,
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        '&:hover': { bgcolor: '#f8f9fa' },
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={reservation.queue_position}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: getPriorityColor(reservation.queue_position),
              color: 'white',
              fontWeight: 600
            }
          }}
        >
          <Avatar sx={{ bgcolor: '#4a9b8e' }}>
            {reservation.user_name.charAt(0)}
          </Avatar>
        </Badge>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight={600}>
              {reservation.user_name}
            </Typography>
            {reservation.pending_fines > 0 && (
              <Tooltip title={`Pending fines: $${reservation.pending_fines.toFixed(2)}`}>
                <FineIcon sx={{ color: '#f44336', fontSize: 16 }} />
              </Tooltip>
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {reservation.user_email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {reservation.user_code} | Active Loans: {reservation.active_loans}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Reserved: {new Date(reservation.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        }
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
        >
          <DragIcon />
        </IconButton>
        
        <Tooltip title="Cancel Reservation">
          <IconButton
            onClick={() => onCancel(reservation)}
            sx={{ color: '#f44336' }}
          >
            <CancelIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </ListItem>
  );
};

const LibrarianReservations = () => {
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState({});
  
  // Cancel confirmation dialog
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    reservation: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchQueueData();
  }, []);

  const fetchQueueData = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get('http://localhost:8000/api/reservations/queue-management', config);
      if (response.data.success) {
        setQueueData(response.data.queue_data);
        
        // Auto-expand books with reservations
        const expanded = {};
        response.data.queue_data.forEach((item, index) => {
          if (index < 3) { // Auto-expand first 3 books
            expanded[item.book.book_id] = true;
          }
        });
        setExpandedBooks(expanded);
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
      toast.error('Failed to load reservation queues');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event, bookId) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find the book data
    const bookData = queueData.find(item => item.book.book_id === bookId);
    if (!bookData) return;

    const oldIndex = bookData.reservations.findIndex(r => r.id === active.id);
    const newIndex = bookData.reservations.findIndex(r => r.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update the UI
    const newReservations = arrayMove(bookData.reservations, oldIndex, newIndex);
    
    setQueueData(prevData => 
      prevData.map(item => 
        item.book.book_id === bookId 
          ? { ...item, reservations: newReservations }
          : item
      )
    );

    // Send update to server
    setReorderLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const newOrder = newReservations.map(r => r.id);
      
      const response = await axios.put(
        'http://localhost:8000/api/reservations/reorder-queue',
        {
          book_id: bookId,
          reservation_order: newOrder
        },
        config
      );

      if (response.data.success) {
        toast.success(`Queue reordered for "${response.data.book_title}"`);
        // Refresh data to ensure consistency
        fetchQueueData();
      }
    } catch (error) {
      console.error('Error reordering queue:', error);
      toast.error('Failed to reorder queue');
      // Revert optimistic update
      fetchQueueData();
    } finally {
      setReorderLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelDialog.reservation) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(
        `http://localhost:8000/api/reservations/${cancelDialog.reservation.id}/cancel`,
        config
      );

      if (response.data.success) {
        toast.success(`Reservation cancelled for ${response.data.user_name}`);
        fetchQueueData(); // Refresh data
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelDialog({ open: false, reservation: null });
    }
  };

  const toggleBookExpansion = (bookId) => {
    setExpandedBooks(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  const getQueueSummary = () => {
    const totalBooks = queueData.length;
    const totalReservations = queueData.reduce((sum, item) => sum + item.reservations.length, 0);
    const avgQueueLength = totalBooks > 0 ? (totalReservations / totalBooks).toFixed(1) : 0;
    
    return { totalBooks, totalReservations, avgQueueLength };
  };

  const summary = getQueueSummary();

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#4a9b8e' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading reservation queues...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: '#4a9b8e', fontWeight: 600 }}>
              Reservation Queue Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage book reservation queues with drag-and-drop reordering
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchQueueData}
            disabled={loading}
            sx={{ borderColor: '#4a9b8e', color: '#4a9b8e' }}
          >
            Refresh
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Fade in timeout={300}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4a9b8e 0%, #3d8276 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <QueueIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" fontWeight={600}>
                    {summary.totalBooks}
                  </Typography>
                  <Typography variant="body1">
                    Books with Queues
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={600}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PersonIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" fontWeight={600}>
                    {summary.totalReservations}
                  </Typography>
                  <Typography variant="body1">
                    Total Reservations
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={900}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ReorderIcon sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="h4" fontWeight={600}>
                    {summary.avgQueueLength}
                  </Typography>
                  <Typography variant="body1">
                    Avg Queue Length
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Queue Management */}
        {queueData.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center' }}>
            <Typography variant="h6">No Active Reservation Queues</Typography>
            <Typography variant="body2">
              All books are currently available or have no pending reservations.
            </Typography>
          </Alert>
        ) : (
          <Box>
            {queueData.map((item, index) => (
              <Grow key={item.book.book_id} in timeout={300 + index * 100}>
                <Accordion 
                  expanded={expandedBooks[item.book.book_id] || false}
                  onChange={() => toggleBookExpansion(item.book.book_id)}
                  sx={{ mb: 2, boxShadow: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Avatar sx={{ bgcolor: '#2196f3' }}>
                        <BookIcon />
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {item.book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {item.book.author} | ISBN: {item.book.isbn}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Available: {item.book.available_copies}/{item.book.total_copies} | 
                          Category: {item.book.category_name || 'Uncategorized'}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={`${item.reservations.length} in queue`}
                        color="primary"
                        sx={{ mr: 2 }}
                      />
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <Box sx={{ mb: 2 }}>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Drag and drop</strong> reservations to reorder the queue. 
                          Position 1 will be notified first when the book becomes available.
                        </Typography>
                      </Alert>
                      
                      {reorderLoading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2">Updating queue order...</Typography>
                        </Box>
                      )}
                    </Box>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, item.book.book_id)}
                    >
                      <SortableContext
                        items={item.reservations.map(r => r.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <List sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 1 }}>
                          {item.reservations.map((reservation) => (
                            <SortableReservationItem
                              key={reservation.id}
                              reservation={reservation}
                              onCancel={(res) => setCancelDialog({ open: true, reservation: res })}
                            />
                          ))}
                        </List>
                      </SortableContext>
                    </DndContext>
                  </AccordionDetails>
                </Accordion>
              </Grow>
            ))}
          </Box>
        )}

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={cancelDialog.open}
          onClose={() => setCancelDialog({ open: false, reservation: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cancel Reservation</DialogTitle>
          <DialogContent>
            {cancelDialog.reservation && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Are you sure you want to cancel this reservation? This action cannot be undone.
                </Alert>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#4a9b8e' }}>
                    {cancelDialog.reservation.user_name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{cancelDialog.reservation.user_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cancelDialog.reservation.user_email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Queue Position: {cancelDialog.reservation.queue_position}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialog({ open: false, reservation: null })}>
              Keep Reservation
            </Button>
            <Button 
              onClick={handleCancelReservation}
              variant="contained"
              color="error"
            >
              Cancel Reservation
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default LibrarianReservations;
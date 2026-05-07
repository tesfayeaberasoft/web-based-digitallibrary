import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as TrophyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const UserReadingGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    goal_type: 'monthly',
    target_books: 5,
    start_date: new Date().toISOString().split('T')[0],
    end_date: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    // Calculate end date based on goal type
    if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      let endDate = new Date(startDate);
      
      switch (formData.goal_type) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        default:
          break;
      }
      
      setFormData(prev => ({
        ...prev,
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.goal_type, formData.start_date]);

  const fetchGoals = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // For now, create sample goals since the API might not exist
      // In production, you would fetch from: /api/reading-goals
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample goals based on user's reading history
      const sampleGoals = [
        {
          id: 1,
          goal_type: 'monthly',
          target_books: 5,
          current_progress: 3,
          start_date: '2026-05-01',
          end_date: '2026-05-31',
          status: 'active'
        },
        {
          id: 2,
          goal_type: 'yearly',
          target_books: 50,
          current_progress: 23,
          start_date: '2026-01-01',
          end_date: '2026-12-31',
          status: 'active'
        }
      ];
      
      setGoals(sampleGoals);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load reading goals');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setEditingGoal(null);
    setFormData({
      goal_type: 'monthly',
      target_books: 5,
      start_date: new Date().toISOString().split('T')[0],
      end_date: ''
    });
  };

  const handleOpenEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      goal_type: goal.goal_type,
      target_books: goal.target_books,
      start_date: goal.start_date,
      end_date: goal.end_date
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingGoal(null);
    setError('');
  };

  const handleOpenDeleteDialog = (goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setGoalToDelete(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveGoal = async () => {
    if (formData.target_books < 1) {
      setError('Target must be at least 1 book');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // In production, you would call: POST /api/reading-goals or PUT /api/reading-goals/{id}
      // For now, just update local state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingGoal) {
        // Update existing goal
        const updatedGoals = goals.map(goal => 
          goal.id === editingGoal.id 
            ? { ...goal, ...formData }
            : goal
        );
        setGoals(updatedGoals);
        setSuccess('Reading goal updated successfully!');
      } else {
        // Create new goal
        const newGoal = {
          id: goals.length + 1,
          ...formData,
          current_progress: 0,
          status: 'active'
        };
        setGoals([...goals, newGoal]);
        setSuccess('Reading goal created successfully!');
      }
      
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    
    setDeleting(true);
    setError('');
    setSuccess('');
    
    try {
      // In production, you would call: DELETE /api/reading-goals/{id}
      // For now, just remove from local state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedGoals = goals.filter(goal => goal.id !== goalToDelete.id);
      setGoals(updatedGoals);
      setSuccess(`Reading goal "${getGoalTypeLabel(goalToDelete.goal_type)}" deleted successfully!`);
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Failed to delete goal. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getProgressPercentage = (goal) => {
    return Math.min(100, (goal.current_progress / goal.target_books) * 100);
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getStatusChip = (goal) => {
    const daysRemaining = getDaysRemaining(goal.end_date);
    const progress = getProgressPercentage(goal);
    
    if (progress >= 100) {
      return <Chip label="Completed" color="success" size="small" icon={<CheckIcon />} />;
    } else if (daysRemaining < 0) {
      return <Chip label="Expired" color="error" size="small" />;
    } else if (daysRemaining <= 7) {
      return <Chip label="Ending Soon" color="warning" size="small" icon={<ScheduleIcon />} />;
    } else {
      return <Chip label="Active" color="primary" size="small" icon={<TrendingUpIcon />} />;
    }
  };

  return (
    <DashboardLayout title="Digital Library">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Reading Goals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set and track your reading targets
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
          >
            New Goal
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && !dialogOpen && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : goals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <TrophyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No reading goals yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set your first reading goal to track your progress
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              Create Your First Goal
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {goals.map((goal) => {
              const progress = getProgressPercentage(goal);
              const daysRemaining = getDaysRemaining(goal.end_date);
              
              return (
                <Grid item xs={12} md={6} key={goal.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {getGoalTypeLabel(goal.goal_type)} Goal
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Read {goal.target_books} book{goal.target_books !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        {getStatusChip(goal)}
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {goal.current_progress} / {goal.target_books} books
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: progress >= 100 ? 'success.main' : '#4a9b8e'
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {Math.round(progress)}% complete
                        </Typography>
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Start Date
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(goal.start_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            End Date
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(goal.end_date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>

                      {daysRemaining >= 0 && progress < 100 && (
                        <Alert severity={daysRemaining <= 7 ? 'warning' : 'info'} sx={{ mb: 2 }}>
                          {daysRemaining === 0
                            ? 'Last day to complete!'
                            : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
                        </Alert>
                      )}

                      {progress >= 100 && (
                        <Alert severity="success" sx={{ mb: 2 }} icon={<TrophyIcon />}>
                          Goal completed! Great job! 🎉
                        </Alert>
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenEditDialog(goal)}
                          sx={{ borderColor: '#4a9b8e', color: '#4a9b8e' }}
                        >
                          Edit
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleOpenDeleteDialog(goal)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Create/Edit Goal Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingGoal ? 'Edit Reading Goal' : 'Create Reading Goal'}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Goal Type"
                  name="goal_type"
                  value={formData.goal_type}
                  onChange={handleChange}
                >
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="number"
                  label="Target Books"
                  name="target_books"
                  value={formData.target_books}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                  helperText="How many books do you want to read?"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  helperText="Automatically calculated based on goal type"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={handleCloseDialog} variant="outlined" disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveGoal}
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <AddIcon />}
              disabled={saving}
              sx={{ bgcolor: '#4a9b8e', '&:hover': { bgcolor: '#3d8276' } }}
            >
              {saving ? (editingGoal ? 'Updating...' : 'Creating...') : (editingGoal ? 'Update Goal' : 'Create Goal')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Reading Goal</DialogTitle>
          <DialogContent>
            {goalToDelete && (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to delete this reading goal?
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Goal Type:</strong> {getGoalTypeLabel(goalToDelete.goal_type)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Target:</strong> {goalToDelete.target_books} book{goalToDelete.target_books !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Progress:</strong> {goalToDelete.current_progress} / {goalToDelete.target_books}
                  </Typography>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This action cannot be undone. Your progress will be lost.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={handleCloseDeleteDialog} variant="outlined" disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteGoal}
              variant="contained"
              color="error"
              startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Goal'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default UserReadingGoals;

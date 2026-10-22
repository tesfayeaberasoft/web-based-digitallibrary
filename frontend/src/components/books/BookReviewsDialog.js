import React, { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Rating,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export default function BookReviewsDialog({ open, book, isAuthenticated, onClose, onUpdated }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !book?.id) return undefined;

    let active = true;
    const loadReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/books/${book.id}/reviews`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!data.success) throw new Error(data.message || 'Could not load reviews.');
        if (active) {
          setReviews(data.reviews || []);
          setAverageRating(Number(data.average_rating) || 0);
          setReviewCount(Number(data.review_count) || 0);
          setRating(Number(data.my_review?.rating) || 0);
          setReviewText(data.my_review?.review_text || '');
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || requestError.message || 'Could not load reviews.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReviews();
    return () => { active = false; };
  }, [open, book?.id]);

  const handleSubmit = async () => {
    if (!rating) {
      setError('Choose a star rating before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_URL}/books/${book.id}/reviews`,
        { rating, review_text: reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message || 'Could not save your review.');
      setReviews(data.reviews || []);
      setAverageRating(Number(data.average_rating) || 0);
      setReviewCount(Number(data.review_count) || 0);
      setRating(Number(data.my_review?.rating) || rating);
      setReviewText(data.my_review?.review_text ?? reviewText);
      onUpdated?.({ average_rating: data.average_rating, review_count: data.review_count });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not save your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reviews: {book?.title}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={averageRating} precision={0.1} readOnly />
                <Typography fontWeight={700}>{averageRating.toFixed(1)}</Typography>
                <Typography color="text.secondary">({reviewCount} reviews)</Typography>
              </Stack>
            </Box>

            {isAuthenticated ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  {rating ? 'Update your rating and review' : 'Rate this book'}
                </Typography>
                <Rating
                  value={rating}
                  onChange={(_, value) => setRating(value || 0)}
                  getLabelText={(value) => `${value} star${value === 1 ? '' : 's'}`}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  maxRows={6}
                  label="Review (optional)"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  inputProps={{ maxLength: 2000 }}
                  helperText={`${reviewText.length}/2000`}
                  sx={{ mt: 1.5 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || !rating}
                  sx={{ mt: 1.5 }}
                >
                  {submitting ? 'Saving…' : 'Submit review'}
                </Button>
              </Box>
            ) : (
              <Alert severity="info">Sign in to rate or review this book.</Alert>
            )}

            <Divider />
            <Typography variant="h6">Reader reviews</Typography>
            {reviews.length === 0 ? (
              <Typography color="text.secondary">No reviews yet. Be the first to rate this book.</Typography>
            ) : reviews.map((review) => (
              <Box key={review.id}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 36, height: 36 }}>
                    {review.reviewer_name?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700}>{review.reviewer_name}</Typography>
                    <Rating value={Number(review.rating)} readOnly size="small" />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(review.updated_at || review.created_at), 'MMM d, yyyy')}
                  </Typography>
                </Stack>
                {review.review_text && (
                  <Typography variant="body2" sx={{ ml: 6.5, mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {review.review_text}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

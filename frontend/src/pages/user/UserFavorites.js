import { apiUrl } from '../../config/api';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  Typography
} from '@mui/material';
import { AutoStories, Favorite, MenuBook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';

const API_URL = apiUrl("/api");

export default function UserFavorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!data.success) throw new Error(data.message || 'Could not load favorites.');
      setFavorites(data.favorites || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not load favorites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  const removeFavorite = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.delete(`${API_URL}/favorites/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!data.success) throw new Error(data.message || 'Could not remove favorite.');
      setFavorites((current) => current.filter((book) => Number(book.id) !== Number(bookId)));
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Could not remove favorite.');
    }
  };

  return (
    <DashboardLayout title="My Favorites">
      <Stack spacing={3}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700}>My Favorites</Typography>
          <Typography color="text.secondary">Books you have saved to your wishlist.</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 7 }}>
              <Favorite color="disabled" sx={{ fontSize: 52, mb: 1 }} />
              <Typography variant="h6">Your favorites list is empty</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>Browse the library and save books you want to revisit.</Typography>
              <Button variant="contained" onClick={() => navigate('/browse')}>Browse books</Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
            gap: 2.5,
            width: '100%',
            minWidth: 0,
            alignItems: 'stretch'
          }}>
            {favorites.map((book) => (
              <Box key={book.id} sx={{ minWidth: 0, display: 'flex' }}>
                <Card sx={{
                  width: '100%',
                  minWidth: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: '0 2px 12px rgba(27, 67, 50, 0.08)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 20px rgba(27, 67, 50, 0.14)' }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        <Typography variant="h6" fontWeight={700}>{book.title}</Typography>
                        <Typography color="text.secondary">{book.author}</Typography>
                      </Box>
                      <IconButton
                        aria-label={`Remove ${book.title} from favorites`}
                        color="error"
                        onClick={() => removeFavorite(book.id)}
                      >
                        <Favorite />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1 }}>{book.category_name || 'Uncategorized'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      ★ {Number(book.avg_rating || 0).toFixed(1)} · {book.review_count} reviews
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {book.can_read_online && (
                      <Button
                        startIcon={<AutoStories />}
                        onClick={() => navigate(`/read/${book.id}`)}
                      >
                        Read online
                      </Button>
                    )}
                    <Button
                      startIcon={<MenuBook />}
                      onClick={() => navigate('/browse')}
                    >
                      View in library
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Stack>
    </DashboardLayout>
  );
}

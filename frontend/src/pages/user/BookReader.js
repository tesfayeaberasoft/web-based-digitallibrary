import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { ArrowBack, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';
import { ReactReader } from 'react-reader';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axios from 'axios';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const API_URL = 'http://localhost:8000/api';

export default function BookReader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [book, setBook] = useState(null);
  const [epubUrl, setEpubUrl] = useState('');
  const [location, setLocation] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [pageWidth, setPageWidth] = useState(Math.min(window.innerWidth - 40, 800));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const updatePageWidth = () => setPageWidth(Math.min(window.innerWidth - 40, 800));
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    const loadBook = async () => {
      setLoading(true);
      setError('');
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_URL}/books/${bookId}`, config);
        if (!data.success || !data.book?.has_digital_content) {
          throw new Error('This book has no digital content available.');
        }

        if (active) setBook(data.book);

        if (data.book.file_type === 'epub') {
          const content = await axios.get(`${API_URL}/books/${bookId}/content`, {
            ...config,
            responseType: 'blob'
          });
          objectUrl = URL.createObjectURL(content.data);
          if (active) {
            setEpubUrl(objectUrl);
          } else {
            URL.revokeObjectURL(objectUrl);
          }
        } else if (data.book.file_type !== 'pdf') {
          throw new Error('This eBook format is not supported.');
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.status === 401
            ? 'Your session has expired. Please sign in again.'
            : requestError.response?.data?.message || requestError.message || 'Unable to open this eBook.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBook();
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bookId, token]);

  const readerContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    }
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!book) return null;

    if (book.file_type === 'epub') {
      return epubUrl ? (
        <Box sx={{ height: '75vh', minHeight: 500 }}>
          <ReactReader
            url={epubUrl}
            location={location}
            locationChanged={setLocation}
            title={book.title}
          />
        </Box>
      ) : <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    }

    return (
      <Stack spacing={2} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((page) => page - 1)}
          >
            Previous
          </Button>
          <Typography variant="body2">
            Page {pageCount ? pageNumber : '—'} of {pageCount || '—'}
          </Typography>
          <Button
            variant="outlined"
            endIcon={<NavigateNext />}
            disabled={!pageCount || pageNumber >= pageCount}
            onClick={() => setPageNumber((page) => page + 1)}
          >
            Next
          </Button>
        </Stack>
        <Document
          file={{
            url: `${API_URL}/books/${bookId}/content`,
            httpHeaders: { Authorization: `Bearer ${token}` }
          }}
          onLoadSuccess={({ numPages }) => {
            setPageCount(numPages);
            setPageNumber((page) => Math.min(page, numPages));
          }}
          onLoadError={(loadError) => setError(loadError.message || 'Unable to render this PDF.')}
          loading={<CircularProgress />}
          error={<Alert severity="error">Unable to render this PDF. Please try again.</Alert>}
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </Stack>
    );
  };

  return (
    <DashboardLayout title="Digital Reader">
      <Stack spacing={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to library
        </Button>
        <Paper
          elevation={2}
          onContextMenu={(event) => event.preventDefault()}
          sx={{ p: { xs: 2, md: 3 }, minHeight: '70vh', overflow: 'auto' }}
        >
          {book && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={700}>{book.title}</Typography>
              <Typography color="text.secondary">{book.author}</Typography>
            </Box>
          )}
          {readerContent()}
        </Paper>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          This reader does not provide download or print controls. Digital content can still be captured from a screen or browser.
        </Typography>
      </Stack>
    </DashboardLayout>
  );
}

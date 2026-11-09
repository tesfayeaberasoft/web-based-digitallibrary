import { apiUrl } from '../../config/api';
import React, { useEffect, useRef, useState } from 'react';
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
import BookNotepad from './BookNotepad';
import './BookReader.css';
import axios from 'axios';
import 'react-pdf/dist/cjs/Page/AnnotationLayer.css';
import 'react-pdf/dist/cjs/Page/TextLayer.css';

// ── PDF.js worker setup ──────────────────────────────────────────────────
// react-pdf v7 uses pdfjs-dist 3.x which ships a classic (non-ESM) worker.
// Point directly at the static file in /public — no webpack interception,
// no blob tricks needed. The classic worker runs fine in CRA.
pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const API_URL = apiUrl('/api');

export default function BookReader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [book, setBook] = useState(null);
  const [epubUrl, setEpubUrl] = useState('');
  const [location, setLocation] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [pageWidth, setPageWidth] = useState(720);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const readerContainerRef = useRef(null);

  useEffect(() => {
    const container = readerContainerRef.current;
    if (!container) return undefined;
    const updatePageWidth = () => {
      setPageWidth(Math.max(160, Math.min(container.clientWidth - 32, 800)));
    };
    const observer = new ResizeObserver(updatePageWidth);
    observer.observe(container);
    updatePageWidth();
    return () => observer.disconnect();
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
            responseType: 'blob',
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
          setError(
            requestError.response?.status === 401
              ? 'Your session has expired. Please sign in again.'
              : requestError.response?.data?.message ||
                requestError.message ||
                'Unable to open this eBook.'
          );
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
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!book) return null;

    if (book.file_type === 'epub') {
      return epubUrl ? (
        <Box className="book-reader-epub" sx={{ height: '75vh', minHeight: 500 }}>
          <ReactReader
            url={epubUrl}
            location={location}
            locationChanged={setLocation}
            title={book.title}
            epubOptions={{ flow: 'paginated', spread: 'always' }}
          />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Stack className="book-reader-pdf" spacing={2} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 2))}
          >
            Previous
          </Button>
          <Typography variant="body2">
            Pages {pageCount ? `${pageNumber}–${Math.min(pageNumber + 1, pageCount)}` : '—'} of {pageCount || '—'}
          </Typography>
          <Button
            variant="outlined"
            endIcon={<NavigateNext />}
            disabled={!pageCount || pageNumber >= pageCount}
            onClick={() => setPageNumber((p) => Math.min(p + 2, pageCount))}
          >
            Next
          </Button>
        </Stack>
        <Document
          file={{
            url: `${API_URL}/books/${bookId}/content`,
            httpHeaders: { Authorization: `Bearer ${token}` },
          }}
          onLoadSuccess={({ numPages }) => {
            setPageCount(numPages);
            setPageNumber((p) => Math.min(p, numPages));
          }}
          onLoadError={(loadError) => {
            console.error('PDF load error:', loadError);
            setError(loadError.message || 'Unable to render this PDF.');
          }}
          loading={<CircularProgress />}
          error={
            <Alert severity="error">
              Unable to render this PDF. Please try again.
            </Alert>
          }
        >
          <Box className="book-reader-pdf-spread">
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            {pageCount > pageNumber && (
              <Page
                pageNumber={pageNumber + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
          </Box>
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
        <Box
          className="book-reader-grid"
          sx={{
            display: 'grid',
            gridTemplateColumns: book
              ? { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(300px, 1fr)' }
              : 'minmax(0, 1fr)',
            gap: 2.5,
            alignItems: 'stretch',
          }}
        >
          <Paper
            className="book-reader-panel"
            component="section"
            elevation={2}
            onContextMenu={(e) => e.preventDefault()}
            sx={{ p: { xs: 2, md: 3 }, minHeight: '70vh', minWidth: 0, overflow: 'auto' }}
          >
            {book && (
              <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700}>
                  {book.title}
                </Typography>
                <Typography color="text.secondary">{book.author}</Typography>
              </Box>
            )}
            <Box ref={readerContainerRef} className="book-reader-content" sx={{ minWidth: 0 }}>
              {readerContent()}
            </Box>
          </Paper>
          {book && !loading && !error && (
            <BookNotepad bookId={bookId} bookTitle={book.title} token={token} />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" textAlign="center">
          This reader does not provide download or print controls. Digital
          content can still be captured from a screen or browser.
        </Typography>
      </Stack>
    </DashboardLayout>
  );
}

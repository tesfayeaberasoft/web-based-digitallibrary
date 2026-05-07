import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import AuthProvider from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import HomePage from './pages/public/HomePage';
import BrowseBooks from './pages/public/BrowseBooks';
import NotificationsPage from './pages/shared/NotificationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminLibrarians from './pages/admin/AdminLibrarians';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

// Librarian Pages
import LibrarianDashboard from './pages/librarian/LibrarianDashboard';
import LibrarianInventory from './pages/librarian/LibrarianInventory';
import LibrarianRequests from './pages/librarian/LibrarianRequests';
import LibrarianNotifications from './pages/librarian/LibrarianNotifications';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import UserProfile from './pages/user/UserProfile';
import UserBooks from './pages/user/UserBooks';
import UserHistory from './pages/user/UserHistory';
import UserAchievements from './pages/user/UserAchievements';
import UserReadingGoals from './pages/user/UserReadingGoals';

import './App.css';

// Create theme with the teal color scheme from the designs
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a9b8e', // Teal color from the designs
      light: '#7bb3a8',
      dark: '#2d6b61',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowseBooks />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes - Admin */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/librarians" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLibrarians />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />

              {/* Protected Routes - Librarian */}
              <Route path="/librarian" element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <LibrarianDashboard />
                </ProtectedRoute>
              } />
              <Route path="/librarian/inventory" element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <LibrarianInventory />
                </ProtectedRoute>
              } />
              <Route path="/librarian/requests" element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <LibrarianRequests />
                </ProtectedRoute>
              } />
              <Route path="/librarian/notifications" element={
                <ProtectedRoute allowedRoles={['librarian', 'admin']}>
                  <LibrarianNotifications />
                </ProtectedRoute>
              } />

              {/* Protected Routes - User */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/my-books" element={
                <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
                  <UserBooks />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
                  <UserHistory />
                </ProtectedRoute>
              } />
              <Route path="/reading-goals" element={
                <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
                  <UserReadingGoals />
                </ProtectedRoute>
              } />
              <Route path="/achievements" element={
                <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
                  <UserAchievements />
                </ProtectedRoute>
              } />

              {/* Shared Protected Routes */}
              <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={['user', 'librarian', 'admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              } />

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

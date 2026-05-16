import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

/** Canonical role strings for routing — tolerant of legacy/alternate spellings */
export function normalizeUserRole(role) {
  if (role == null || role === '') return role;
  const raw = String(role).trim();
  const compact = raw.toLowerCase().replace(/[\s_-]+/g, '');
  if (compact === 'superadmin') return 'super-admin';
  return raw.toLowerCase();
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          // Verify token is still valid
          const response = await axios.get('http://localhost:8000/api/auth/verify', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          
          if (response.data.success) {
            const parsed = JSON.parse(storedUser);
            const d = response.data.data || {};
            const merged = {
              ...parsed,
              ...(d.email && { email: d.email }),
              ...(d.role != null && d.role !== '' && { role: d.role }),
            };
            merged.role = normalizeUserRole(merged.role);
            localStorage.setItem('user', JSON.stringify(merged));
            setToken(storedToken);
            setUser(merged);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token verification failed, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;
        const normalized = { ...userData, role: normalizeUserRole(userData.role) };
        
        // Store in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(normalized));
        
        // Update state
        setToken(newToken);
        setUser(normalized);
        
        return { success: true, user: normalized };
      } else {
        const d = response.data || {};
        return {
          success: false,
          message: d.message,
          userLockout: d.user_lockout,
          remainingAttempts: d.remaining_attempts,
          maxAttempts: d.max_attempts,
          accountSuspended: d.account_suspended,
        };
      }
    } catch (error) {
      const d = error.response?.data || {};
      return {
        success: false,
        message: d.message || 'Login failed. Please try again.',
        userLockout: d.user_lockout,
        remainingAttempts: d.remaining_attempts,
        maxAttempts: d.max_attempts,
        accountSuspended: d.account_suspended,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register', userData);
      
      if (response.data.success) {
        return { success: true, message: 'Registration successful. Please login.' };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedUser) => {
    const next = { ...updatedUser, role: normalizeUserRole(updatedUser.role) };
    setUser(next);
    localStorage.setItem('user', JSON.stringify(next));
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const myRole = normalizeUserRole(user.role);
    if (Array.isArray(roles)) {
      return roles.some((r) => normalizeUserRole(r) === myRole);
    }
    return normalizeUserRole(roles) === myRole;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
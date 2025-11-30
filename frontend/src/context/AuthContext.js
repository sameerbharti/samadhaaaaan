import React, { createContext, useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { useNotifications } from './NotificationContext';

const AuthContext = createContext();

// Reducer for auth state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'REGISTER_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'REGISTER_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const { initializeSocket } = useNotifications();
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null
  });

  // Set axios defaults with token if available
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  // Check if token exists on initial load
  useEffect(() => {
    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token');

      // Verify token and get user data
      const verifyToken = async () => {
        try {
          const res = await axios.get('/api/auth/profile');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: res.data.user,
              token
            }
          });

          // Initialize socket connection with user token and role
          if (token && res.data.user) {
            initializeSocket(token, res.data.user.role);
          }
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      };

      verifyToken();
    }
  }, []); // Remove initializeSocket from dependency array to prevent multiple calls

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const res = await axios.post('/api/auth/login', { email, password });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });

      // Initialize socket connection with user token and role
      if (res.data.token && res.data.user) {
        initializeSocket(res.data.token, res.data.user.role);
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: message
      });

      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const res = await axios.post('/api/auth/register', userData);

      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: {
          user: res.data.user,
          token: res.data.token
        }
      });

      // Initialize socket connection with user token and role
      if (res.data.token && res.data.user) {
        initializeSocket(res.data.token, res.data.user.role);
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'REGISTER_FAIL',
        payload: message
      });

      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Update user function
  const updateUser = async (userData) => {
    try {
      const res = await axios.put('/api/auth/profile', userData);
      dispatch({
        type: 'SET_USER',
        payload: res.data.user
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed';
      return { success: false, message };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      updateUser,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
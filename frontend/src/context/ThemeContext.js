import React, { createContext, useContext, useEffect, useState } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';

// Create theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Function to get theme based on mode
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: '#3f51b5', // Indigo
            light: '#757de8',
            dark: '#002984',
          },
          secondary: {
            main: '#f50057', // Pink
            light: '#ff5983',
            dark: '#bb002f',
          },
          background: {
            default: '#f8fafc', // Light grey background
            paper: '#ffffff',
          },
          text: {
            primary: '#1e293b',
            secondary: '#64748b',
          },
          success: {
            main: '#4caf50',
            light: '#80e27e',
            dark: '#087f23',
          },
          warning: {
            main: '#ff9800',
            light: '#ffc947',
            dark: '#c66900',
          },
          error: {
            main: '#f44336',
            light: '#ff7961',
            dark: '#ba000d',
          },
          info: {
            main: '#2196f3',
            light: '#64c8ff',
            dark: '#0069c0',
          },
          grey: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: '#90a4ae', // Light blue grey
            light: '#cfd8dc',
            dark: '#607d8b',
          },
          secondary: {
            main: '#f06292', // Light pink
            light: '#f8bbd9',
            dark: '#c2185b',
          },
          background: {
            default: '#121826', // Dark blue background
            paper: '#1e293b', // Darker blue for cards/papers
          },
          text: {
            primary: '#f1f5f9', // Light text
            secondary: '#94a3b8', // Lighter grey text
          },
          success: {
            main: '#66bb6a',
            light: '#a5d6a7',
            dark: '#388e3c',
          },
          warning: {
            main: '#ffb74d',
            light: '#ffe0b2',
            dark: '#f57c00',
          },
          error: {
            main: '#ef5350',
            light: '#ffcdd2',
            dark: '#d32f2f',
          },
          info: {
            main: '#4fc3f7',
            light: '#81d4fa',
            dark: '#0288d1',
          },
          grey: {
            50: '#1e293b',
            100: '#334155',
            200: '#475569',
            300: '#64748b',
            400: '#94a3b8',
            500: '#cbd5e1',
            600: '#d5d7e0',
            700: '#e2e8f0',
            800: '#f1f5f9',
            900: '#f8fafc',
          },
        }),
  },
});

// Create the theme component
const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  // Toggle theme function
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setMode(savedTheme);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  // Create theme based on current mode
  const theme = createTheme(getDesignTokens(mode));

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
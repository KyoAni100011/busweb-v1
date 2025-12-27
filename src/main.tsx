import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './core/routes/routes';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b63ce',
      light: '#3b82f6',
      dark: '#0a4ca3',
      contrastText: '#f5fbff',
    },
    secondary: {
      main: '#ffcf5c',
      dark: '#f4b000',
      light: '#ffeaa6',
      contrastText: '#0a0a0a',
    },
    background: {
      default: '#f6f9ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0d2345',
      secondary: '#4f6480',
    },
  },
  typography: {
    fontFamily: 'Space Grotesk, Inter, Segoe UI, system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 },
    h2: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.15 },
    h3: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(11, 99, 206, 0.14), transparent 35%),' +
            'radial-gradient(circle at 80% 0%, rgba(255, 207, 92, 0.2), transparent 30%),' +
            'linear-gradient(135deg, rgba(15, 45, 90, 0.04), rgba(12, 33, 60, 0.02))',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: '1px solid #d6e2f2',
          boxShadow: '0 14px 40px rgba(13, 35, 69, 0.08)',
        },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);

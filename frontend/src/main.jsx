import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import { AuthProvider } from './context/AuthContext'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c8a96e',       // warm gold
      light: '#e2c98f',
      dark: '#a07840',
    },
    secondary: {
      main: '#4ade80',       // emerald accent
      light: '#86efac',
      dark: '#16a34a',
    },
    error: {
      main: '#f87171',
    },
    warning: {
      main: '#fbbf24',
    },
    success: {
      main: '#4ade80',
    },
    background: {
      default: '#0d1f17',   // deep forest green
      paper: '#132a1e',     // card green
    },
    text: {
      primary: '#f0ece3',
      secondary: '#9db8a8',
    },
    divider: 'rgba(200,169,110,0.15)',
  },
  typography: {
    fontFamily: '"Cormorant Garamond", "Georgia", serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem' },
    body2: { fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: '"DM Sans", sans-serif',
      letterSpacing: '0.02em',
    },
    overline: { fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.15em' },
    caption: { fontFamily: '"DM Sans", sans-serif' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          borderRadius: '8px',
          fontSize: '0.875rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #c8a96e, #a07840)',
          color: '#0d1f17',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #e2c98f, #c8a96e)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(200,169,110,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(200,169,110,0.1)',
          fontFamily: '"DM Sans", sans-serif',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            fontFamily: '"DM Sans", sans-serif',
          },
          '& .MuiInputLabel-root': {
            fontFamily: '"DM Sans", sans-serif',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          background: '#132a1e',
          border: '1px solid rgba(200,169,110,0.2)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"DM Sans", sans-serif',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={4000}
        >
          <CssBaseline />
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)

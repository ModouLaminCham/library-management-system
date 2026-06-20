import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Alert,
  IconButton, InputAdornment, Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      bgcolor: 'rgba(0,0,0,0.25)',
      color: '#f0ece3',
      fontFamily: '"DM Sans", sans-serif',
      '& fieldset': { borderColor: 'rgba(200,169,110,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#c8a96e' },
    },
    '& .MuiInputLabel-root': { fontFamily: '"DM Sans", sans-serif', color: '#9db8a8' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#c8a96e' },
  };

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(200,169,110,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      },
    }}>
      <Container maxWidth="xs">
        <Box className="page-enter">
          {/* Icon + brand */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #c8a96e, #a07840)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 32px rgba(200,169,110,0.3)',
            }}>
              <AutoStoriesIcon sx={{ color: '#0d1f17', fontSize: '1.8rem' }} />
            </Box>
            <Typography sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#c8a96e',
              lineHeight: 1,
              mb: 0.5,
            }}>
              Welcome Back
            </Typography>
            <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.9rem' }}>
              Sign in to the NextGen Library
            </Typography>
          </Box>

          <Paper sx={{ p: 4, borderRadius: '16px', bgcolor: '#132a1e' }}>
            {error && (
              <Alert severity="error" sx={{
                mb: 3, borderRadius: '8px',
                bgcolor: 'rgba(248,113,113,0.1)', color: '#f87171',
                border: '1px solid rgba(248,113,113,0.25)',
                fontFamily: '"DM Sans", sans-serif',
                '& .MuiAlert-icon': { color: '#f87171' },
              }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Username"
                variant="outlined"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={fieldSx}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={fieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#9db8a8' }}>
                        {showPassword ? <VisibilityOff sx={{ fontSize: '1.1rem' }} /> : <Visibility sx={{ fontSize: '1.1rem' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 1, height: 50, fontSize: '0.95rem' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(200,169,110,0.1)' }}>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#9db8a8' }}>OR</Typography>
            </Divider>

            <Typography sx={{ fontFamily: '"DM Sans", sans-serif', textAlign: 'center', fontSize: '0.875rem', color: '#9db8a8' }}>
              Don't have an account?{' '}
              <Box component={Link} to="/register" sx={{ color: '#c8a96e', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Register
              </Box>
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;

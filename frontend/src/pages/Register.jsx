import React, { useState } from 'react';
import {
  Box, Container, Paper, Typography, TextField, Button, Alert,
  IconButton, InputAdornment,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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

  if (success) {
    return (
      <Box sx={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }} className="page-enter">
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%',
            bgcolor: 'rgba(74,222,128,0.1)', border: '2px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
          }}>
            <CheckCircleOutlineIcon sx={{ color: '#4ade80', fontSize: '2.5rem' }} />
          </Box>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 700, color: '#4ade80', mb: 1 }}>
            Account Created!
          </Typography>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8' }}>
            Redirecting you to login…
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2,
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(200,169,110,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      },
    }}>
      <Container maxWidth="xs">
        <Box className="page-enter">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '14px',
              background: 'linear-gradient(135deg, #c8a96e, #a07840)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2, boxShadow: '0 8px 32px rgba(200,169,110,0.3)',
            }}>
              <PersonAddOutlinedIcon sx={{ color: '#0d1f17', fontSize: '1.8rem' }} />
            </Box>
            <Typography sx={{
              fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 700, color: '#c8a96e', lineHeight: 1, mb: 0.5,
            }}>
              Join NextGen
            </Typography>
            <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.9rem' }}>
              Create your library account
            </Typography>
          </Box>

          <Paper sx={{ p: 4, borderRadius: '16px', bgcolor: '#132a1e' }}>
            {error && (
              <Alert severity="error" sx={{
                mb: 3, borderRadius: '8px',
                bgcolor: 'rgba(248,113,113,0.1)', color: '#f87171',
                border: '1px solid rgba(248,113,113,0.25)',
                '& .MuiAlert-icon': { color: '#f87171' },
              }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField name="username" label="Username" required value={formData.username} onChange={handleChange} sx={fieldSx} />
              <TextField name="email" label="Email Address" type="email" required value={formData.email} onChange={handleChange} sx={fieldSx} />
              <TextField
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
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
              <TextField name="confirmPassword" label="Confirm Password" type="password" required value={formData.confirmPassword} onChange={handleChange} sx={fieldSx} />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || success}
                sx={{ mt: 1, height: 50, fontSize: '0.95rem' }}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#9db8a8' }}>
                Already have an account?{' '}
                <Box component={Link} to="/login" sx={{ color: '#c8a96e', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Sign in
                </Box>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;

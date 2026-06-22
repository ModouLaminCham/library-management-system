import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { useSnackbar } from 'notistack';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LockIcon from '@mui/icons-material/Lock';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navItems = [
    { label: 'Books', path: '/books', icon: <MenuBookIcon sx={{ fontSize: '1.1rem' }} /> },
    ...(user ? [
      { label: 'My Books', path: '/my-books', icon: <BookmarkBorderIcon sx={{ fontSize: '1.1rem' }} /> },
    ] : []),
    ...(isAdmin ? [
      { label: 'Members', path: '/members', icon: <PeopleAltIcon sx={{ fontSize: '1.1rem' }} /> },
      { label: 'Circulation', path: '/borrowing', icon: <CompareArrowsIcon sx={{ fontSize: '1.1rem' }} /> },
      { label: 'Users', path: '/users', icon: <ManageAccountsIcon sx={{ fontSize: '1.1rem' }} /> },
      { label: 'Genres', path: '/genres', icon: <CategoryIcon sx={{ fontSize: '1.1rem' }} /> },
      { label: 'Holds', path: '/holds', icon: <BookmarkBorderIcon sx={{ fontSize: '1.1rem' }} /> },
      { label: 'Reports', path: '/reports', icon: <BarChartIcon sx={{ fontSize: '1.1rem' }} /> },
    ] : [
      ...(user ? [{ label: 'Holds', path: '/holds', icon: <BookmarkBorderIcon sx={{ fontSize: '1.1rem' }} /> }] : []),
    ]),
  ];

  const isActive = (path) => {
    if (path === '/books' && (location.pathname === '/' || location.pathname === '/books')) return true;
    return location.pathname === path;
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      enqueueSnackbar('New password must be at least 6 characters', { variant: 'error' });
      return;
    }
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      setPasswordDialog(false);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to change password', { variant: 'error' });
    }
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: 'rgba(13,31,23,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(200,169,110,0.2)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}>
        <Toolbar sx={{ height: 70, px: { xs: 2, md: 5 } }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', mr: 8, flexShrink: 0 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg, #c8a96e, #a07840)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoStoriesIcon sx={{ color: '#0d1f17', fontSize: '1.2rem' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.25rem', color: '#c8a96e', lineHeight: 1, letterSpacing: '0.05em' }}>
                NEXTGEN
              </Typography>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.6rem', color: '#9db8a8', letterSpacing: '0.2em', lineHeight: 1 }}>
                LIBRARY SYSTEM
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {user && navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Button key={item.label} component={Link} to={item.path} startIcon={item.icon}
                  sx={{
                    px: 2.5, py: 1,
                    color: active ? '#c8a96e' : '#9db8a8',
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem',
                    fontWeight: active ? 700 : 400, borderRadius: '8px',
                    bgcolor: active ? 'rgba(200,169,110,0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: active ? 'rgba(200,169,110,0.3)' : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': { bgcolor: 'rgba(200,169,110,0.08)', color: '#c8a96e', borderColor: 'rgba(200,169,110,0.2)' },
                    '& .MuiButton-startIcon': { color: active ? '#c8a96e' : '#9db8a8' },
                  }}>
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '8px', bgcolor: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.15)' }}>
                  <AccountCircleOutlinedIcon sx={{ color: '#c8a96e', fontSize: '1rem' }} />
                  <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#f0ece3' }}>
                    {user.username}
                  </Typography>
                  {isAdmin && (
                    <Box sx={{ px: 1, py: 0.2, borderRadius: '4px', bgcolor: 'rgba(200,169,110,0.2)', fontSize: '0.6rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, color: '#c8a96e', letterSpacing: '0.1em' }}>
                      ADMIN
                    </Box>
                  )}
                </Box>
                <Button onClick={() => setPasswordDialog(true)} startIcon={<LockIcon sx={{ fontSize: '1rem !important' }} />}
                  sx={{ color: '#9db8a8', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', border: '1px solid rgba(157,184,168,0.2)', borderRadius: '8px', px: 2, '&:hover': { bgcolor: 'rgba(200,169,110,0.08)', borderColor: 'rgba(200,169,110,0.2)', color: '#c8a96e' }, transition: 'all 0.2s' }}>
                  Password
                </Button>
                <Button onClick={logout} startIcon={<LogoutIcon sx={{ fontSize: '1rem !important' }} />}
                  sx={{ color: '#9db8a8', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', border: '1px solid rgba(157,184,168,0.2)', borderRadius: '8px', px: 2, '&:hover': { bgcolor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)', color: '#f87171' }, transition: 'all 0.2s' }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button component={Link} to="/login" startIcon={<LoginIcon />}
                sx={{ background: 'linear-gradient(135deg, #c8a96e, #a07840)', color: '#0d1f17', fontWeight: 700, fontFamily: '"DM Sans", sans-serif', borderRadius: '8px', px: 3, '&:hover': { background: 'linear-gradient(135deg, #e2c98f, #c8a96e)' } }}>
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Current Password" type="password" fullWidth value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <TextField label="New Password" type="password" fullWidth value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <TextField label="Confirm New Password" type="password" fullWidth value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">Change Password</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;

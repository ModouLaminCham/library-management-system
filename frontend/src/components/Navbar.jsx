import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  const navItems = [
    { label: 'Books', path: '/books', icon: <MenuBookIcon sx={{ fontSize: '1.1rem' }} /> },
    ...(isAdmin ? [
      { label: 'Members', path: '/members', icon: <PeopleAltIcon sx={{ fontSize: '1.1rem' }} /> },
      { label: 'Circulation', path: '/borrowing', icon: <CompareArrowsIcon sx={{ fontSize: '1.1rem' }} /> },
    ] : []),
  ];

  const isActive = (path) => {
    if (path === '/books' && (location.pathname === '/' || location.pathname === '/books')) return true;
    return location.pathname === path;
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(13,31,23,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(200,169,110,0.2)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ height: 70, px: { xs: 2, md: 5 } }}>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            textDecoration: 'none',
            mr: 8,
            flexShrink: 0,
          }}
        >
          <Box sx={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #c8a96e, #a07840)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <AutoStoriesIcon sx={{ color: '#0d1f17', fontSize: '1.2rem' }} />
          </Box>
          <Box>
            <Typography sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#c8a96e',
              lineHeight: 1,
              letterSpacing: '0.05em',
            }}>
              NEXTGEN
            </Typography>
            <Typography sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.6rem',
              color: '#9db8a8',
              letterSpacing: '0.2em',
              lineHeight: 1,
            }}>
              LIBRARY SYSTEM
            </Typography>
          </Box>
        </Box>

        {/* Nav links */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
          {user && navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Button
                key={item.label}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  px: 2.5,
                  py: 1,
                  color: active ? '#c8a96e' : '#9db8a8',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: active ? 700 : 400,
                  borderRadius: '8px',
                  bgcolor: active ? 'rgba(200,169,110,0.1)' : 'transparent',
                  border: '1px solid',
                  borderColor: active ? 'rgba(200,169,110,0.3)' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(200,169,110,0.08)',
                    color: '#c8a96e',
                    borderColor: 'rgba(200,169,110,0.2)',
                  },
                  '& .MuiButton-startIcon': {
                    color: active ? '#c8a96e' : '#9db8a8',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Auth */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: '8px',
                bgcolor: 'rgba(200,169,110,0.08)',
                border: '1px solid rgba(200,169,110,0.15)',
              }}>
                <AccountCircleOutlinedIcon sx={{ color: '#c8a96e', fontSize: '1rem' }} />
                <Typography sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#f0ece3',
                }}>
                  {user.username}
                </Typography>
                {isAdmin && (
                  <Box sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '4px',
                    bgcolor: 'rgba(200,169,110,0.2)',
                    fontSize: '0.6rem',
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 700,
                    color: '#c8a96e',
                    letterSpacing: '0.1em',
                  }}>
                    ADMIN
                  </Box>
                )}
              </Box>
              <Button
                onClick={logout}
                startIcon={<LogoutIcon sx={{ fontSize: '1rem !important' }} />}
                sx={{
                  color: '#9db8a8',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.85rem',
                  border: '1px solid rgba(157,184,168,0.2)',
                  borderRadius: '8px',
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(248,113,113,0.08)',
                    borderColor: 'rgba(248,113,113,0.3)',
                    color: '#f87171',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Button
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
              sx={{
                background: 'linear-gradient(135deg, #c8a96e, #a07840)',
                color: '#0d1f17',
                fontWeight: 700,
                fontFamily: '"DM Sans", sans-serif',
                borderRadius: '8px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, #e2c98f, #c8a96e)',
                },
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

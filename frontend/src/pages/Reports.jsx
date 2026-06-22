import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Grid, Chip,
} from '@mui/material';
import {
  AutoStories, PeopleAlt, CompareArrows, Warning,
  AttachMoney, CheckCircle,
} from '@mui/icons-material';
import { reportsApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ value, label, sublabel, color = '#c8a96e', icon }) => (
  <Paper sx={{
    p: 3.5, borderRadius: '12px', bgcolor: '#132a1e',
    display: 'flex', flexDirection: 'column', gap: 0.5,
    position: 'relative', overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color },
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: '#9db8a8', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
        {label}
      </Typography>
      {icon}
    </Box>
    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.8rem', fontWeight: 700, color, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9db8a8' }}>
      {sublabel}
    </Typography>
  </Paper>
);

const Reports = () => {
  const [stats, setStats] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || !user?.roles?.includes('ROLE_ADMIN')) { navigate('/'); return; }
    loadStats();
  }, [user, loading]);

  const loadStats = async () => {
    try {
      const response = await reportsApi.getSummary();
      setStats(response.data);
    } catch (err) {
      enqueueSnackbar('Error loading reports', { variant: 'error' });
    }
  };

  if (!stats) return null;

  return (
    <Box sx={{ width: '100%', flexGrow: 1 }} className="page-enter">
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, color: '#c8a96e', lineHeight: 1, mb: 1 }}>
          Reports & Analytics
        </Typography>
        <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.95rem' }}>
          Library overview and operational metrics.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard value={stats.totalBooks} label="Total Books" sublabel={`${stats.availableBooks} available \u00B7 ${stats.onLoanBooks} on loan`} color="#c8a96e" icon={<AutoStories sx={{ color: 'rgba(200,169,110,0.4)', fontSize: '1.5rem' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard value={stats.availableBooks} label="Available Books" sublabel="Ready for checkout" color="#4ade80" icon={<CheckCircle sx={{ color: 'rgba(74,222,128,0.4)', fontSize: '1.5rem' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard value={stats.onLoanBooks} label="On Loan" sublabel="Currently borrowed" color="#60a5fa" icon={<CompareArrows sx={{ color: 'rgba(96,165,250,0.4)', fontSize: '1.5rem' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard value={stats.totalMembers} label="Total Members" sublabel={`${stats.activeMembers} active`} color="#c8a96e" icon={<PeopleAlt sx={{ color: 'rgba(200,169,110,0.4)', fontSize: '1.5rem' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard value={stats.activeLoans} label="Active Loans" sublabel="Currently out" color="#60a5fa" icon={<CompareArrows sx={{ color: 'rgba(96,165,250,0.4)', fontSize: '1.5rem' }} />} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard value={stats.overdueBooks} label="Overdue Items" sublabel="Past return date" color="#f87171" icon={<Warning sx={{ color: 'rgba(248,113,113,0.4)', fontSize: '1.5rem' }} />} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Paper sx={{
          p: 3.5, borderRadius: '12px', bgcolor: '#132a1e', position: 'relative', overflow: 'hidden',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#fbbf24' },
        }}>
          <Box>
            <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: '#9db8a8', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Fines Accrued
            </Typography>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.8rem', fontWeight: 700, color: '#fbbf24', lineHeight: 1, mt: 0.5 }}>
              ${stats.totalFinesAccrued.toFixed(2)}
            </Typography>
          </Box>
          <AttachMoney sx={{ color: 'rgba(251,191,36,0.3)', fontSize: '4rem' }} />
        </Paper>
      </Box>
    </Box>
  );
};

export default Reports;

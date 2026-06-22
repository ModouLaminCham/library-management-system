import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, Box, Chip, IconButton,
} from '@mui/material';
import { BookmarkBorder, Cancel, CheckCircle, BookmarkAdd } from '@mui/icons-material';
import { holdsApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import PaginationBar from '../components/PaginationBar';

const GoldDivider = () => (
  <Box sx={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(200,169,110,0.4), transparent)', my: 0 }} />
);

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '\u2014';

const statusConfig = {
  ACTIVE: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
  FULFILLED: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)' },
  CANCELLED: { color: '#9db8a8', bg: 'rgba(157,184,168,0.1)', border: 'rgba(157,184,168,0.3)' },
};

const Holds = () => {
  const [pageData, setPageData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });
  const [page, setPage] = useState(0);
  const [view, setView] = useState('all');
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  useEffect(() => { loadHolds(); }, [page, view]);

  const loadHolds = async () => {
    try {
      const response = view === 'my'
        ? await holdsApi.getMyHolds()
        : await holdsApi.getAll({ page, size: 15 });
      if (view === 'my') setPageData({ content: response.data, totalPages: 1, totalElements: response.data.length, number: 0 });
      else setPageData(response.data);
    } catch { enqueueSnackbar('Error loading holds', { variant: 'error' }); }
  };

  const handleFulfill = async (id) => {
    try {
      await holdsApi.fulfillHold(id);
      enqueueSnackbar('Hold fulfilled \u2014 book ready for checkout', { variant: 'success' });
      loadHolds();
    } catch { enqueueSnackbar('Error fulfilling hold', { variant: 'error' }); }
  };

  const handleCancel = async (id) => {
    try {
      await holdsApi.cancelMyHold(id);
      enqueueSnackbar('Hold cancelled', { variant: 'success' });
      loadHolds();
    } catch { enqueueSnackbar('Error cancelling hold', { variant: 'error' }); }
  };

  const holds = pageData.content || [];

  return (
    <Box sx={{ width: '100%', flexGrow: 1 }} className="page-enter">
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, color: '#c8a96e', lineHeight: 1, mb: 1 }}>
            Holds & Reservations
          </Typography>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.95rem' }}>
            {pageData.totalElements} hold{pageData.totalElements !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {isAdmin && (
          <Button variant={view === 'all' ? 'contained' : 'outlined'} onClick={() => { setView('all'); setPage(0); }}>
            All Holds
          </Button>
        )}
        <Button variant={view === 'my' ? 'contained' : 'outlined'} onClick={() => { setView('my'); setPage(0); }}>
          My Holds
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: '#132a1e' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(200,169,110,0.08)' }}>
              {['Book', 'Patron', 'Placed', 'Status', 'Action'].map((h) => (
                <TableCell key={h} sx={{ color: '#c8a96e', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', py: 2, borderBottom: '1px solid rgba(200,169,110,0.2)' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {holds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                  <BookmarkBorder sx={{ fontSize: '3rem', color: 'rgba(200,169,110,0.2)', mb: 2, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', color: '#9db8a8' }}>
                    No holds placed
                  </Typography>
                </TableCell>
              </TableRow>
            ) : holds.map((hold) => {
              const cfg = statusConfig[hold.status] || statusConfig.ACTIVE;
              return (
                <TableRow key={hold.id} hover sx={{ '&:hover': { bgcolor: 'rgba(200,169,110,0.04)' }, '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '1.05rem', color: '#f0ece3' }}>
                      {hold.bookTitle || hold.book?.title || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.88rem' }}>
                      {hold.memberName || hold.member?.name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.85rem' }}>
                    {formatDate(hold.holdDate)}
                  </TableCell>
                  <TableCell>
                    <Chip label={hold.status} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {hold.status === 'ACTIVE' && isAdmin && (
                        <Button size="small" variant="outlined" color="success" startIcon={<CheckCircle />}
                          onClick={() => handleFulfill(hold.id)} sx={{ fontSize: '0.75rem' }}>
                          Fulfill
                        </Button>
                      )}
                      {hold.status === 'ACTIVE' && view === 'my' && (
                        <Button size="small" variant="outlined" color="error" startIcon={<Cancel />}
                          onClick={() => handleCancel(hold.id)} sx={{ fontSize: '0.75rem' }}>
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {view !== 'my' && (
        <PaginationBar page={pageData.number} totalPages={pageData.totalPages} totalElements={pageData.totalElements} onPageChange={setPage} />
      )}
    </Box>
  );
};

export default Holds;

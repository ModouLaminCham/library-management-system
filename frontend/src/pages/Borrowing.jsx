import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Grid,
  Alert,
  Divider,
  DialogContentText,
} from '@mui/material';
import { Add, Undo, Warning, AttachMoney, CompareArrows, CheckCircle } from '@mui/icons-material';
import { booksApi, membersApi, borrowingApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Fine rate: $0.50 per day overdue
const FINE_RATE_PER_DAY = 0.50;

const GoldDivider = () => (
  <Box sx={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(200,169,110,0.4), transparent)', my: 0 }} />
);

const StatCard = ({ value, label, sublabel, color = '#c8a96e' }) => (
  <Paper sx={{
    p: 3.5,
    borderRadius: '12px',
    bgcolor: '#132a1e',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.5,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: color,
    },
  }}>
    <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', color: '#9db8a8', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
      {label}
    </Typography>
    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.8rem', fontWeight: 700, color, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9db8a8' }}>
      {sublabel}
    </Typography>
  </Paper>
);

const calculateFine = (dueDateStr) => {
  const due = new Date(dueDateStr);
  const now = new Date();
  if (now <= due) return 0;
  const diffMs = now - due;
  const daysOverdue = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return daysOverdue * FINE_RATE_PER_DAY;
};

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, {
  year: 'numeric', month: 'short', day: 'numeric'
});

const selectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    bgcolor: 'rgba(0,0,0,0.2)',
    fontFamily: '"DM Sans", sans-serif',
    '& fieldset': { borderColor: 'rgba(200,169,110,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#c8a96e' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#c8a96e' },
  '& .MuiInputLabel-root': { fontFamily: '"DM Sans", sans-serif' },
};

const Borrowing = () => {
  const [borrowingRecords, setBorrowingRecords] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [fineDialogOpen, setFineDialogOpen] = useState(false);
  const [recordToReturn, setRecordToReturn] = useState(null);
  const [returnedRecord, setReturnedRecord] = useState(null); // the response after return
  const [overdueBooks, setOverdueBooks] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ bookId: '', memberId: '' });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    if (!user?.roles?.includes('ROLE_ADMIN')) {
      enqueueSnackbar('Admin privileges required', { variant: 'error' });
      navigate('/');
      return;
    }
    loadData();
  }, [user, loading]);

  const loadData = async () => {
    try {
      const [borrowingRes, booksRes, membersRes, overdueRes] = await Promise.all([
        borrowingApi.getActive(),
        booksApi.getAvailable(),
        membersApi.getActive(),
        borrowingApi.getOverdue(),
      ]);
      setBorrowingRecords(borrowingRes.data);
      setBooks(booksRes.data);
      setMembers(membersRes.data);
      setOverdueBooks(overdueRes.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      } else {
        enqueueSnackbar('Error loading data', { variant: 'error' });
      }
    }
  };

  const handleBorrow = async () => {
    try {
      await borrowingApi.borrow(formData.bookId, formData.memberId);
      enqueueSnackbar('Book issued successfully', { variant: 'success' });
      setOpen(false);
      loadData();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Error issuing book', { variant: 'error' });
    }
  };

  const handleReturnClick = (record) => {
    setRecordToReturn(record);
    setReturnDialogOpen(true);
  };

  const confirmReturn = async () => {
    if (!recordToReturn) return;
    try {
      const response = await borrowingApi.return(recordToReturn.id);
      const record = response.data;
      setReturnDialogOpen(false);
      setRecordToReturn(null);

      if (record.fineAmount > 0) {
        // Show fine payment dialog
        setReturnedRecord(record);
        setFineDialogOpen(true);
      } else {
        enqueueSnackbar('Book returned — no fine due', { variant: 'success' });
        loadData();
      }
    } catch {
      enqueueSnackbar('Error processing return', { variant: 'error' });
      setReturnDialogOpen(false);
      setRecordToReturn(null);
    }
  };

  const handleFineAcknowledge = () => {
    setFineDialogOpen(false);
    setReturnedRecord(null);
    loadData();
    enqueueSnackbar('Fine recorded. Book return complete.', { variant: 'success' });
  };

  // Compute fine preview for a record that's currently overdue
  const getFinePreview = (record) => {
    const isOverdue = new Date(record.dueDate) < new Date();
    if (!isOverdue) return null;
    return calculateFine(record.dueDate);
  };

  if (!user) return null;

  const totalFinesOwed = borrowingRecords
    .filter(r => new Date(r.dueDate) < new Date())
    .reduce((sum, r) => sum + calculateFine(r.dueDate), 0);

  return (
    <Box sx={{ width: '100%', flexGrow: 1 }} className="page-enter">
      {/* Header */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: { xs: '2rem', md: '3rem' },
            fontWeight: 700,
            color: '#c8a96e',
            lineHeight: 1,
            mb: 1,
          }}>
            Circulation Hub
          </Typography>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.95rem' }}>
            Track loans, returns, and overdue fines across the collection.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setFormData({ bookId: '', memberId: '' }); setOpen(true); }}>
          Issue Loan
        </Button>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value={borrowingRecords.length} label="Active Loans" sublabel="Books currently out" color="#c8a96e" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value={books.length} label="Available" sublabel="Ready for checkout" color="#4ade80" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard value={overdueBooks.length} label="Overdue" sublabel="Past return date" color="#f87171" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            value={`$${totalFinesOwed.toFixed(2)}`}
            label="Fines Accruing"
            sublabel={`@ $${FINE_RATE_PER_DAY.toFixed(2)}/day overdue`}
            color="#fbbf24"
          />
        </Grid>
      </Grid>

      {/* Overdue Alert */}
      {overdueBooks.length > 0 && (
        <Box sx={{
          mb: 4,
          p: 3,
          borderRadius: '12px',
          bgcolor: 'rgba(248,113,113,0.07)',
          border: '1px solid rgba(248,113,113,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Warning sx={{ color: '#f87171', fontSize: '1.5rem', flexShrink: 0 }} />
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#f87171', fontWeight: 600, fontSize: '0.9rem', flexGrow: 1 }}>
            {overdueBooks.length} item{overdueBooks.length > 1 ? 's are' : ' is'} overdue. Fines of ${FINE_RATE_PER_DAY.toFixed(2)}/day are accruing automatically.
          </Typography>
          <Chip
            label={`$${totalFinesOwed.toFixed(2)} total`}
            sx={{ bgcolor: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', fontWeight: 700 }}
          />
        </Box>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: '#132a1e' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(200,169,110,0.08)' }}>
              {['Book', 'Member', 'Borrowed', 'Due Date', 'Status / Fine', 'Action'].map((h) => (
                <TableCell key={h} sx={{
                  color: '#c8a96e', fontFamily: '"DM Sans", sans-serif', fontWeight: 700,
                  fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                  py: 2, borderBottom: '1px solid rgba(200,169,110,0.2)',
                }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {borrowingRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                  <CompareArrows sx={{ fontSize: '3rem', color: 'rgba(200,169,110,0.2)', mb: 2, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', color: '#9db8a8' }}>
                    No active loans
                  </Typography>
                </TableCell>
              </TableRow>
            ) : borrowingRecords.map((record) => {
              const isOverdue = new Date(record.dueDate) < new Date();
              const finePreview = getFinePreview(record);
              return (
                <TableRow key={record.id} hover sx={{
                  '&:hover': { bgcolor: 'rgba(200,169,110,0.04)' },
                  '&:last-child td': { border: 0 },
                  transition: 'background 0.15s',
                  ...(isOverdue ? { borderLeft: '3px solid rgba(248,113,113,0.5)' } : {}),
                }}>
                  <TableCell sx={{ py: 2.5 }}>
                    <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '1.05rem', color: '#f0ece3' }}>
                      {record.bookTitle || record.book?.title || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, color: '#9db8a8', fontSize: '0.88rem' }}>
                      {record.memberName || record.member?.name || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.85rem' }}>
                    {formatDate(record.borrowDate)}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: isOverdue ? 700 : 400,
                      color: isOverdue ? '#f87171' : '#9db8a8',
                    }}>
                      {formatDate(record.dueDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Chip
                        label={isOverdue ? 'Overdue' : 'On Loan'}
                        size="small"
                        sx={{
                          bgcolor: isOverdue ? 'rgba(248,113,113,0.1)' : 'rgba(96,165,250,0.1)',
                          color: isOverdue ? '#f87171' : '#60a5fa',
                          border: `1px solid ${isOverdue ? 'rgba(248,113,113,0.3)' : 'rgba(96,165,250,0.3)'}`,
                          ...(isOverdue ? { animation: 'finePulse 2s ease infinite' } : {}),
                        }}
                      />
                      {finePreview !== null && finePreview > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoney sx={{ fontSize: '0.75rem', color: '#fbbf24' }} />
                          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                            ${finePreview.toFixed(2)} accrued
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Undo sx={{ fontSize: '0.85rem !important' }} />}
                      onClick={() => handleReturnClick(record)}
                      sx={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        borderColor: isOverdue ? 'rgba(248,113,113,0.4)' : 'rgba(200,169,110,0.3)',
                        color: isOverdue ? '#f87171' : '#c8a96e',
                        '&:hover': {
                          borderColor: isOverdue ? '#f87171' : '#c8a96e',
                          bgcolor: isOverdue ? 'rgba(248,113,113,0.08)' : 'rgba(200,169,110,0.08)',
                        },
                      }}
                    >
                      Return
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ─── Issue Loan Dialog ─── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 700, color: '#c8a96e', pb: 1 }}>
          Issue New Loan
        </DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth sx={selectSx}>
              <InputLabel>Select Book</InputLabel>
              <Select value={formData.bookId} onChange={(e) => setFormData({ ...formData, bookId: e.target.value })} label="Select Book">
                {books.map((book) => (
                  <MenuItem key={book.id} value={book.id} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                    {book.title} <Box component="span" sx={{ color: '#9db8a8', ml: 1, fontSize: '0.8rem' }}>({book.isbn})</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={selectSx}>
              <InputLabel>Select Member</InputLabel>
              <Select value={formData.memberId} onChange={(e) => setFormData({ ...formData, memberId: e.target.value })} label="Select Member">
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id} sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                    {member.name} <Box component="span" sx={{ color: '#9db8a8', ml: 1, fontSize: '0.8rem' }}>({member.email})</Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ p: 2, borderRadius: '8px', bgcolor: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.15)' }}>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#9db8a8' }}>
                📋 Late returns accrue a fine of <Box component="span" sx={{ color: '#fbbf24', fontWeight: 700 }}>${FINE_RATE_PER_DAY.toFixed(2)} per day</Box> after the due date. Fines are calculated automatically at return.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={handleBorrow} variant="contained" disabled={!formData.bookId || !formData.memberId}>
            Issue Loan
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Confirm Return Dialog ─── */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#c8a96e' }}>
          Confirm Return
        </DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 2.5 }}>
          {recordToReturn && (() => {
            const isOverdue = new Date(recordToReturn.dueDate) < new Date();
            const fine = calculateFine(recordToReturn.dueDate);
            return (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <DialogContentText sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8' }}>
                  Mark <Box component="span" sx={{ color: '#f0ece3', fontWeight: 600 }}>{recordToReturn.bookTitle || recordToReturn.book?.title}</Box> as returned by{' '}
                  <Box component="span" sx={{ color: '#f0ece3', fontWeight: 600 }}>{recordToReturn.memberName || recordToReturn.member?.name}</Box>?
                </DialogContentText>
                {isOverdue && fine > 0 && (
                  <Box sx={{
                    p: 2.5,
                    borderRadius: '10px',
                    bgcolor: 'rgba(251,191,36,0.08)',
                    border: '1px solid rgba(251,191,36,0.25)',
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <AttachMoney sx={{ color: '#fbbf24' }} />
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, color: '#fbbf24' }}>
                        Late Return Fine
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#9db8a8' }}>Due date</Typography>
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#f0ece3' }}>{formatDate(recordToReturn.dueDate)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#9db8a8' }}>Days overdue</Typography>
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#f87171' }}>
                        {Math.ceil((new Date() - new Date(recordToReturn.dueDate)) / (1000 * 60 * 60 * 24))} days
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#9db8a8' }}>Rate</Typography>
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#9db8a8' }}>${FINE_RATE_PER_DAY.toFixed(2)} / day</Typography>
                    </Box>
                    <Divider sx={{ my: 1.5, borderColor: 'rgba(251,191,36,0.2)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, color: '#fbbf24' }}>Fine amount</Typography>
                      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, fontSize: '1.3rem', color: '#fbbf24' }}>
                        ${fine.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setReturnDialogOpen(false)} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={confirmReturn} variant="contained">
            {recordToReturn && new Date(recordToReturn.dueDate) < new Date() ? 'Return & Record Fine' : 'Confirm Return'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Fine Confirmed Dialog ─── */}
      <Dialog open={fineDialogOpen} onClose={handleFineAcknowledge} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24', pb: 1 }}>
          Fine Issued
        </DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 3 }}>
          {returnedRecord && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center' }}>
              <Box sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'rgba(251,191,36,0.1)',
                border: '2px solid rgba(251,191,36,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AttachMoney sx={{ color: '#fbbf24', fontSize: '2rem' }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2.5rem', fontWeight: 700, color: '#fbbf24', lineHeight: 1 }}>
                  ${returnedRecord.fineAmount?.toFixed(2)}
                </Typography>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', mt: 0.5 }}>
                  fine due from <Box component="span" sx={{ color: '#f0ece3' }}>{returnedRecord.memberName || returnedRecord.member?.name || 'this member'}</Box>
                </Typography>
              </Box>
              <Box sx={{ width: '100%', p: 2, borderRadius: '8px', bgcolor: 'rgba(200,169,110,0.05)', border: '1px solid rgba(200,169,110,0.12)', textAlign: 'left' }}>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#9db8a8', mb: 1 }}>
                  <strong style={{ color: '#c8a96e' }}>Book:</strong> {returnedRecord.bookTitle || returnedRecord.book?.title || 'N/A'}
                </Typography>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#9db8a8', mb: 1 }}>
                  <strong style={{ color: '#c8a96e' }}>Returned:</strong> {formatDate(returnedRecord.returnDate || new Date())}
                </Typography>
                <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#9db8a8' }}>
                  <strong style={{ color: '#c8a96e' }}>Days late:</strong>{' '}
                  {Math.ceil(returnedRecord.fineAmount / FINE_RATE_PER_DAY)} days × ${FINE_RATE_PER_DAY.toFixed(2)}/day
                </Typography>
              </Box>
              <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#9db8a8' }}>
                Please collect payment from the member. The fine has been recorded in the system.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>
          <Button
            onClick={handleFineAcknowledge}
            variant="contained"
            startIcon={<CheckCircle />}
            sx={{ px: 4 }}
          >
            Acknowledge & Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Borrowing;

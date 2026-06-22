import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, CircularProgress, Alert, Snackbar,
  Card, CardContent, Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { borrowingApi, booksApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const FINE_RATE_PER_DAY = 0.50;

const calculateFine = (dueDateStr) => {
  if (!dueDateStr) return 0;
  const due = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - due.getTime();
  const daysOverdue = Math.floor(diff / (1000 * 60 * 60 * 24));
  return daysOverdue > 0 ? daysOverdue * FINE_RATE_PER_DAY : 0;
};

const MyLoans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [myBooks, setMyBooks] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowDialogOpen, setBorrowDialogOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [fineDialogOpen, setFineDialogOpen] = useState(false);
  const [fineAmount, setFineAmount] = useState(0);
  const [view, setView] = useState('active');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [myBooksRes, myHistoryRes] = await Promise.all([
        borrowingApi.getMyBooks(),
        borrowingApi.getMyHistory(),
      ]);
      setMyBooks(Array.isArray(myBooksRes.data) ? myBooksRes.data : []);
      setMyHistory(Array.isArray(myHistoryRes.data) ? myHistoryRes.data : []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAvailableBooks = useCallback(async () => {
    try {
      const res = await booksApi.getAvailable();
      setAvailableBooks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load available books:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user, navigate, loadData]);

  const handleBorrowOpen = () => {
    loadAvailableBooks();
    setBorrowDialogOpen(true);
  };

  const handleBorrow = async () => {
    if (!selectedBookId) return;
    try {
      await borrowingApi.borrowMyBook(selectedBookId);
      enqueueSnackbar('Book borrowed successfully!', { variant: 'success' });
      setBorrowDialogOpen(false);
      setSelectedBookId('');
      loadData();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to borrow book', { variant: 'error' });
    }
  };

  const handleReturnOpen = (record) => {
    setSelectedRecord(record);
    setReturnDialogOpen(true);
  };

  const handleReturn = async () => {
    if (!selectedRecord) return;
    try {
      const res = await borrowingApi.returnMyBook(selectedRecord.id);
      const fine = res.data?.fineAmount || 0;
      setReturnDialogOpen(false);
      setSelectedRecord(null);
      if (fine > 0) {
        setFineAmount(fine);
        setFineDialogOpen(true);
      } else {
        enqueueSnackbar('Book returned successfully!', { variant: 'success' });
      }
      loadData();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Failed to return book', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const activeCount = myBooks.length;
  const overdueCount = myBooks.filter(r => calculateFine(r.dueDate) > 0).length;
  const totalFines = myHistory.reduce((sum, r) => sum + (r.fineAmount || 0), 0);

  const records = view === 'active' ? myBooks : myHistory;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: 'text.primary' }}>
        My Library
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Currently Borrowed</Typography>
              <Typography variant="h3" color="primary">{activeCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Overdue</Typography>
              <Typography variant="h3" color="error">{overdueCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">Total Fines Accrued</Typography>
              <Typography variant="h3" color="warning.main">${totalFines.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant={view === 'active' ? 'contained' : 'outlined'}
          onClick={() => setView('active')}
        >
          Active Loans
        </Button>
        <Button
          variant={view === 'history' ? 'contained' : 'outlined'}
          onClick={() => setView('history')}
        >
          History
        </Button>
        <Button variant="contained" color="secondary" onClick={handleBorrowOpen} sx={{ ml: 'auto' }}>
          Borrow a Book
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Book</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Borrowed</TableCell>
              <TableCell>Due Date</TableCell>
              {view === 'history' && <TableCell>Returned</TableCell>}
              <TableCell>Status / Fine</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    {view === 'active' ? 'No books currently borrowed' : 'No borrowing history'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => {
                const fine = view === 'active' ? calculateFine(record.dueDate) : (record.fineAmount || 0);
                const isOverdue = fine > 0;
                return (
                  <TableRow
                    key={record.id}
                    sx={isOverdue && view === 'active' ? { borderLeft: '3px solid rgba(248,113,113,0.5)' } : {}}
                  >
                    <TableCell>{record.bookTitle}</TableCell>
                    <TableCell>{record.bookAuthor}</TableCell>
                    <TableCell>{record.borrowDate}</TableCell>
                    <TableCell>{record.dueDate}</TableCell>
                    {view === 'history' && <TableCell>{record.returnDate || '-'}</TableCell>}
                    <TableCell>
                      {record.returned ? (
                        <Chip label={fine > 0 ? `Fine: $${fine.toFixed(2)}` : 'Returned OK'} color={fine > 0 ? 'error' : 'success'} size="small" />
                      ) : (
                        <Chip label={isOverdue ? `Overdue ($${fine.toFixed(2)})` : 'On Time'} color={isOverdue ? 'error' : 'success'} size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {!record.returned && (
                        <Button size="small" variant="outlined" color="secondary" onClick={() => handleReturnOpen(record)}>
                          Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Borrow Dialog */}
      <Dialog open={borrowDialogOpen} onClose={() => setBorrowDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Borrow a Book</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Select a book to borrow. You have a 14-day loan period. Overdue books incur a ${FINE_RATE_PER_DAY.toFixed(2)}/day fine.
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#132a1e',
                color: '#f0ece3',
                border: '1px solid rgba(200,169,110,0.3)',
                fontSize: '1rem',
              }}
            >
              <option value="">Select a book...</option>
              {availableBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} by {book.author}
                </option>
              ))}
            </select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setBorrowDialogOpen(false); setSelectedBookId(''); }}>Cancel</Button>
          <Button onClick={handleBorrow} variant="contained" disabled={!selectedBookId}>
            Borrow
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)}>
        <DialogTitle>Return Book</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to return "{selectedRecord?.bookTitle}"?
            {selectedRecord && calculateFine(selectedRecord.dueDate) > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(248,113,113,0.1)', borderRadius: 1 }}>
                <Typography color="error">
                  This book is overdue. A fine of ${calculateFine(selectedRecord.dueDate).toFixed(2)} will be applied.
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReturn} variant="contained" color="secondary">Confirm Return</Button>
        </DialogActions>
      </Dialog>

      {/* Fine Issued Dialog */}
      <Dialog open={fineDialogOpen} onClose={() => setFineDialogOpen(false)}>
        <DialogTitle>Fine Issued</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A fine of <strong>${fineAmount.toFixed(2)}</strong> has been recorded for the overdue return.
            Please see the librarian to pay your fines.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFineDialogOpen(false)} variant="contained">OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyLoans;

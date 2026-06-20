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
  TextField,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  DialogContentText,
} from '@mui/material';
import { Add, Edit, Delete, Search, AutoStories } from '@mui/icons-material';
import { booksApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';

const GoldDivider = () => (
  <Box sx={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(200,169,110,0.4), transparent)', my: 0 }} />
);

const Books = () => {
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', genre: '', publicationYear: '', description: '',
  });

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    try {
      const response = await booksApi.getAll();
      setBooks(response.data);
    } catch {
      enqueueSnackbar('Error loading books', { variant: 'error' });
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) { loadBooks(); return; }
    try {
      const response = await booksApi.search(searchTerm);
      setBooks(response.data);
    } catch {
      enqueueSnackbar('Error searching books', { variant: 'error' });
    }
  };

  const handleOpenDialog = (book = null) => {
    setEditingBook(book);
    setFormData(book ? {
      title: book.title, author: book.author, isbn: book.isbn,
      genre: book.genre, publicationYear: book.publicationYear, description: book.description || '',
    } : { title: '', author: '', isbn: '', genre: '', publicationYear: '', description: '' });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.author || !formData.isbn) {
      enqueueSnackbar('Title, Author and ISBN are required', { variant: 'warning' });
      return;
    }
    try {
      const bookData = { ...formData, publicationYear: parseInt(formData.publicationYear) };
      if (editingBook) {
        await booksApi.update(editingBook.id, bookData);
        enqueueSnackbar('Book updated successfully', { variant: 'success' });
      } else {
        await booksApi.create(bookData);
        enqueueSnackbar('Book catalogued successfully', { variant: 'success' });
      }
      setOpen(false);
      setEditingBook(null);
      loadBooks();
    } catch (error) {
      enqueueSnackbar(error.response?.status === 403 ? 'Permission denied' : 'Error saving book', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      await booksApi.delete(bookToDelete.id);
      enqueueSnackbar('Book removed from catalogue', { variant: 'success' });
      loadBooks();
    } catch (error) {
      enqueueSnackbar(error.response?.status === 403 ? 'Admin access required' : 'Error deleting book', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isUser = user?.roles?.includes('ROLE_USER') || isAdmin;
  const available = books.filter(b => b.available).length;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      bgcolor: 'rgba(0,0,0,0.2)',
      '& fieldset': { borderColor: 'rgba(200,169,110,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#c8a96e' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#c8a96e' },
  };

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
            The Collection
          </Typography>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.95rem' }}>
            {available} available · {books.length - available} on loan · {books.length} total volumes
          </Typography>
        </Box>
        {isUser && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ px: 3, py: 1.5 }}
          >
            Add Volume
          </Button>
        )}
      </Box>

      {/* Search */}
      <Paper sx={{ p: 1, mb: 4, display: 'flex', gap: 1.5, bgcolor: 'rgba(19,42,30,0.8)', borderRadius: '10px' }}>
        <TextField
          fullWidth
          placeholder="Search title, author, or ISBN..."
          variant="standard"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#9db8a8', ml: 1, mr: 1 }} />
              </InputAdornment>
            ),
            sx: { fontFamily: '"DM Sans", sans-serif', color: '#f0ece3', height: 46 },
          }}
        />
        <Button variant="contained" onClick={handleSearch} sx={{ px: 4, flexShrink: 0 }}>
          Search
        </Button>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: '#132a1e' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(200,169,110,0.08)' }}>
              {['Title & Author', 'Genre', 'ISBN', 'Year', 'Status', ...(isUser ? [''] : [])].map((h) => (
                <TableCell key={h} sx={{
                  color: '#c8a96e',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  py: 2,
                  borderBottom: '1px solid rgba(200,169,110,0.2)',
                }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                  <AutoStories sx={{ fontSize: '3rem', color: 'rgba(200,169,110,0.2)', mb: 2, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', color: '#9db8a8' }}>
                    The shelves are empty
                  </Typography>
                </TableCell>
              </TableRow>
            ) : books.map((book) => (
              <TableRow key={book.id} hover sx={{
                '&:hover': { bgcolor: 'rgba(200,169,110,0.04)' },
                '&:last-child td': { border: 0 },
                transition: 'background 0.15s',
              }}>
                <TableCell sx={{ py: 2.5, maxWidth: 260 }}>
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '1.05rem', color: '#f0ece3' }}>
                    {book.title}
                  </Typography>
                  <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9db8a8', mt: 0.3 }}>
                    {book.author}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={book.genre}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(200,169,110,0.1)',
                      color: '#c8a96e',
                      border: '1px solid rgba(200,169,110,0.25)',
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: '#9db8a8', fontSize: '0.8rem' }}>{book.isbn}</TableCell>
                <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8' }}>{book.publicationYear}</TableCell>
                <TableCell>
                  <Chip
                    label={book.available ? 'Available' : 'On Loan'}
                    size="small"
                    sx={{
                      bgcolor: book.available ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                      color: book.available ? '#4ade80' : '#fbbf24',
                      border: `1px solid ${book.available ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    }}
                  />
                </TableCell>
                {isUser && (
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleOpenDialog(book)} sx={{
                        color: '#9db8a8', bgcolor: 'rgba(200,169,110,0.08)',
                        '&:hover': { bgcolor: 'rgba(200,169,110,0.15)', color: '#c8a96e' },
                      }}>
                        <Edit sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                      {isAdmin && (
                        <IconButton size="small" onClick={() => { setBookToDelete(book); setDeleteDialogOpen(true); }} sx={{
                          color: '#9db8a8', bgcolor: 'rgba(248,113,113,0.06)',
                          '&:hover': { bgcolor: 'rgba(248,113,113,0.15)', color: '#f87171' },
                        }}>
                          <Delete sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setEditingBook(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 700, color: '#c8a96e', pb: 1 }}>
          {editingBook ? 'Edit Volume' : 'Catalogue New Volume'}
        </DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required fullWidth sx={fieldSx} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Author" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required fullWidth sx={fieldSx} />
              <TextField label="Genre" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} fullWidth sx={fieldSx} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="ISBN" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} required fullWidth sx={fieldSx} />
              <TextField label="Year" type="number" value={formData.publicationYear} onChange={(e) => setFormData({ ...formData, publicationYear: e.target.value })} fullWidth sx={fieldSx} />
            </Box>
            <TextField label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} fullWidth sx={fieldSx} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => { setOpen(false); setEditingBook(null); }} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingBook ? 'Save Changes' : 'Add to Collection'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#f87171' }}>Remove Volume</DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8' }}>
            Permanently remove <Box component="span" sx={{ color: '#f0ece3', fontWeight: 600 }}>{bookToDelete?.title}</Box> from the collection? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={confirmDelete} sx={{
            bgcolor: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)',
            '&:hover': { bgcolor: 'rgba(248,113,113,0.2)' },
          }}>
            Remove Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Books;

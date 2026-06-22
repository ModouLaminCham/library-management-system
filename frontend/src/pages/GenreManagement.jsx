import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, IconButton, DialogContentText,
} from '@mui/material';
import { Add, Edit, Delete, Category } from '@mui/icons-material';
import { genresApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const GoldDivider = () => (
  <Box sx={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(200,169,110,0.4), transparent)', my: 0 }} />
);

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [genreToDelete, setGenreToDelete] = useState(null);
  const [editingGenre, setEditingGenre] = useState(null);
  const [name, setName] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || !user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/');
      return;
    }
    loadGenres();
  }, [user, loading]);

  const loadGenres = async () => {
    try {
      const response = await genresApi.getAll();
      setGenres(response.data);
    } catch { enqueueSnackbar('Error loading genres', { variant: 'error' }); }
  };

  const handleOpenDialog = (genre = null) => {
    setEditingGenre(genre);
    setName(genre ? genre.name : '');
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { enqueueSnackbar('Genre name is required', { variant: 'warning' }); return; }
    try {
      if (editingGenre) {
        await genresApi.update(editingGenre.id, { name: name.trim() });
        enqueueSnackbar('Genre updated', { variant: 'success' });
      } else {
        await genresApi.create({ name: name.trim() });
        enqueueSnackbar('Genre created', { variant: 'success' });
      }
      setOpen(false);
      setEditingGenre(null);
      setName('');
      loadGenres();
    } catch (error) {
      enqueueSnackbar(error.response?.status === 403 ? 'Permission denied' : 'Error saving genre', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!genreToDelete) return;
    try {
      await genresApi.delete(genreToDelete.id);
      enqueueSnackbar('Genre deleted', { variant: 'success' });
      loadGenres();
    } catch { enqueueSnackbar('Error deleting genre', { variant: 'error' }); }
    finally { setDeleteDialogOpen(false); setGenreToDelete(null); }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.2)',
      '& fieldset': { borderColor: 'rgba(200,169,110,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(200,169,110,0.4)' },
      '&.Mui-focused fieldset': { borderColor: '#c8a96e' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#c8a96e' },
  };

  return (
    <Box sx={{ width: '100%', flexGrow: 1 }} className="page-enter">
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, color: '#c8a96e', lineHeight: 1, mb: 1 }}>
            Genre Management
          </Typography>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.95rem' }}>
            {genres.length} genres defined
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Genre
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: '#132a1e' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(200,169,110,0.08)' }}>
              {['Genre Name', ''].map((h) => (
                <TableCell key={h} sx={{ color: '#c8a96e', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', py: 2, borderBottom: '1px solid rgba(200,169,110,0.2)' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {genres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 12 }}>
                  <Category sx={{ fontSize: '3rem', color: 'rgba(200,169,110,0.2)', mb: 2, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', color: '#9db8a8' }}>
                    No genres defined
                  </Typography>
                </TableCell>
              </TableRow>
            ) : genres.map((genre) => (
              <TableRow key={genre.id} hover sx={{ '&:hover': { bgcolor: 'rgba(200,169,110,0.04)' }, '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ py: 2.5 }}>
                  <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, color: '#f0ece3', fontSize: '0.95rem' }}>
                    {genre.name}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenDialog(genre)} sx={{ color: '#9db8a8', bgcolor: 'rgba(200,169,110,0.08)', '&:hover': { bgcolor: 'rgba(200,169,110,0.15)', color: '#c8a96e' } }}>
                      <Edit sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setGenreToDelete(genre); setDeleteDialogOpen(true); }} sx={{ color: '#9db8a8', bgcolor: 'rgba(248,113,113,0.06)', '&:hover': { bgcolor: 'rgba(248,113,113,0.15)', color: '#f87171' } }}>
                      <Delete sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => { setOpen(false); setEditingGenre(null); setName(''); }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 700, color: '#c8a96e', pb: 1 }}>
          {editingGenre ? 'Edit Genre' : 'Add Genre'}
        </DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 3 }}>
          <TextField label="Genre Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus fullWidth sx={fieldSx} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => { setOpen(false); setEditingGenre(null); setName(''); }} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingGenre ? 'Save' : 'Add Genre'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#f87171' }}>Delete Genre</DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8' }}>
            Delete <Box component="span" sx={{ color: '#f0ece3', fontWeight: 600 }}>{genreToDelete?.name}</Box>? Existing books with this genre will keep it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={confirmDelete} sx={{ bgcolor: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', '&:hover': { bgcolor: 'rgba(248,113,113,0.2)' } }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GenreManagement;

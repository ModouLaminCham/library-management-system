import React, { useState, useEffect } from 'react';
import {
  Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Box, Chip, IconButton, InputAdornment,
  Avatar, DialogContentText,
} from '@mui/material';
import { Add, Edit, Delete, Search, PeopleAlt } from '@mui/icons-material';
import { membersApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaginationBar from '../components/PaginationBar';

const GoldDivider = () => (
  <Box sx={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(200,169,110,0.4), transparent)', my: 0 }} />
);

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

const AVATAR_COLORS = [
  'rgba(200,169,110,0.3)', 'rgba(74,222,128,0.2)', 'rgba(96,165,250,0.2)',
  'rgba(251,191,36,0.2)', 'rgba(248,113,113,0.2)',
];

const Members = () => {
  const [pageData, setPageData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', phoneNumber: '', address: '' });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    if (!user?.roles?.includes('ROLE_ADMIN')) {
      enqueueSnackbar('Admin privileges required', { variant: 'error' });
      navigate('/');
      return;
    }
    loadMembers();
  }, [user, loading, page]);

  const loadMembers = async () => {
    try {
      const response = await membersApi.getAll({ page, size: 15 });
      setPageData(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) navigate('/login');
      else enqueueSnackbar('Error loading members', { variant: 'error' });
    }
  };

  const handleSearch = async () => {
    setPage(0);
    if (!searchTerm.trim()) { loadMembers(); return; }
    try {
      const response = await membersApi.search(searchTerm, { page: 0, size: 15 });
      setPageData(response.data);
    } catch { enqueueSnackbar('Search failed', { variant: 'error' }); }
  };

  const handleOpenDialog = (member = null) => {
    setEditingMember(member);
    setFormData(member
      ? { name: member.name, email: member.email, phoneNumber: member.phoneNumber, address: member.address || '' }
      : { name: '', email: '', phoneNumber: '', address: '' }
    );
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phoneNumber) {
      enqueueSnackbar('Name, email and phone are required', { variant: 'warning' });
      return;
    }
    try {
      if (editingMember) {
        await membersApi.update(editingMember.id, formData);
        enqueueSnackbar('Member updated', { variant: 'success' });
      } else {
        await membersApi.create(formData);
        enqueueSnackbar('Member registered', { variant: 'success' });
      }
      setOpen(false);
      setEditingMember(null);
      loadMembers();
    } catch (error) {
      enqueueSnackbar(error.response?.status === 403 ? 'Permission denied' : 'Error saving member', { variant: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    try {
      await membersApi.delete(memberToDelete.id);
      enqueueSnackbar('Member removed', { variant: 'success' });
      loadMembers();
    } catch (error) {
      enqueueSnackbar(error.response?.status === 403 ? 'Admin only action' : 'Error deleting member', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  if (!user) return null;

  const members = pageData.content || [];

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
            Member Registry
          </Typography>
          <Typography sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.95rem' }}>
            {pageData.totalElements} total patrons
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Register Patron
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 1, mb: 4, display: 'flex', gap: 1.5, bgcolor: 'rgba(19,42,30,0.8)', borderRadius: '10px' }}>
        <TextField
          fullWidth placeholder="Search by name or email..." variant="standard"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9db8a8', ml: 1, mr: 1 }} /></InputAdornment>, sx: { fontFamily: '"DM Sans", sans-serif', color: '#f0ece3', height: 46 } }}
        />
        <Button variant="contained" onClick={handleSearch} sx={{ px: 4, flexShrink: 0 }}>Search</Button>
        <Button variant="outlined" onClick={() => { setSearchTerm(''); setPage(0); loadMembers(); }} sx={{ flexShrink: 0 }}>Clear</Button>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden', bgcolor: '#132a1e' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(200,169,110,0.08)' }}>
              {['Patron', 'Email', 'Phone', 'Address', 'Status', ''].map((h) => (
                <TableCell key={h} sx={{ color: '#c8a96e', fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', py: 2, borderBottom: '1px solid rgba(200,169,110,0.2)' }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 12 }}>
                  <PeopleAlt sx={{ fontSize: '3rem', color: 'rgba(200,169,110,0.2)', mb: 2, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', color: '#9db8a8' }}>No patrons registered</Typography>
                </TableCell>
              </TableRow>
            ) : members.map((member, idx) => (
              <TableRow key={member.id} hover sx={{ '&:hover': { bgcolor: 'rgba(200,169,110,0.04)' }, '&:last-child td': { border: 0 }, transition: 'background 0.15s' }}>
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: '#c8a96e', fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', fontWeight: 700, border: '1px solid rgba(200,169,110,0.2)' }}>
                      {getInitials(member.name)}
                    </Avatar>
                    <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, color: '#f0ece3', fontSize: '0.9rem' }}>{member.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.85rem' }}>{member.email}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: '#9db8a8', fontSize: '0.85rem' }}>{member.phoneNumber}</TableCell>
                <TableCell sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8', fontSize: '0.85rem' }}>{member.address || '\u2014'}</TableCell>
                <TableCell>
                  <Chip label={member.active ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: member.active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: member.active ? '#4ade80' : '#f87171', border: `1px solid ${member.active ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}` }} />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenDialog(member)} sx={{ color: '#9db8a8', bgcolor: 'rgba(200,169,110,0.08)', '&:hover': { bgcolor: 'rgba(200,169,110,0.15)', color: '#c8a96e' } }}>
                      <Edit sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                    {isAdmin && (
                      <IconButton size="small" onClick={() => { setMemberToDelete(member); setDeleteDialogOpen(true); }} sx={{ color: '#9db8a8', bgcolor: 'rgba(248,113,113,0.06)', '&:hover': { bgcolor: 'rgba(248,113,113,0.15)', color: '#f87171' } }}>
                        <Delete sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PaginationBar page={pageData.number} totalPages={pageData.totalPages} totalElements={pageData.totalElements} onPageChange={setPage} />

      <Dialog open={open} onClose={() => { setOpen(false); setEditingMember(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 700, color: '#c8a96e', pb: 1 }}>
          {editingMember ? 'Update Patron' : 'Register New Patron'}
        </DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required fullWidth sx={fieldSx} />
            <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required fullWidth sx={fieldSx} />
            <TextField label="Phone Number" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} required fullWidth sx={fieldSx} />
            <TextField label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} multiline rows={2} fullWidth sx={fieldSx} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={() => { setOpen(false); setEditingMember(null); }} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingMember ? 'Save Changes' : 'Register'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', color: '#f87171' }}>Remove Patron</DialogTitle>
        <GoldDivider />
        <DialogContent sx={{ pt: 2.5 }}>
          <DialogContentText sx={{ fontFamily: '"DM Sans", sans-serif', color: '#9db8a8' }}>
            Remove <Box component="span" sx={{ color: '#f0ece3', fontWeight: 600 }}>{memberToDelete?.name}</Box> from the registry? They will lose borrowing privileges.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#9db8a8' }}>Cancel</Button>
          <Button onClick={confirmDelete} sx={{ bgcolor: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', '&:hover': { bgcolor: 'rgba(248,113,113,0.2)' } }}>Remove</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Members;

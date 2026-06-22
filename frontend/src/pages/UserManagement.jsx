import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, CircularProgress, IconButton,
  Checkbox, FormControlLabel,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usersApi.getAll();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || !user.roles?.includes('ROLE_ADMIN')) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [user, navigate, loadUsers]);

  const handleToggleEnabled = async (userId) => {
    try {
      const res = await usersApi.toggleEnabled(userId);
      enqueueSnackbar(res.data?.message || 'User status toggled', { variant: 'success' });
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to toggle user status', { variant: 'error' });
    }
  };

  const handleToggleRole = async (targetUser) => {
    const currentRoles = targetUser.roles || [];
    const isAdmin = currentRoles.includes('ROLE_ADMIN');
    let newRoles;
    if (isAdmin) {
      newRoles = ['ROLE_USER'];
    } else {
      newRoles = ['ROLE_USER', 'ROLE_ADMIN'];
    }
    try {
      await usersApi.updateRoles(targetUser.id, newRoles);
      enqueueSnackbar('Roles updated successfully', { variant: 'success' });
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to update roles', { variant: 'error' });
    }
  };

  const handleDeleteOpen = (targetUser) => {
    setSelectedUser(targetUser);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await usersApi.delete(selectedUser.id);
      enqueueSnackbar('User deleted', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err) {
      enqueueSnackbar('Failed to delete user', { variant: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, color: 'text.primary' }}>
        User Management
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Member ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.roles.map(r => (
                      <Chip key={r} label={r.replace('ROLE_', '')} size="small" color={r === 'ROLE_ADMIN' ? 'primary' : 'default'} sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip label={u.enabled ? 'Active' : 'Disabled'} color={u.enabled ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell>{u.memberId || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleToggleRole(u)} title="Toggle admin role" size="small">
                      <AdminPanelSettingsIcon color={u.roles?.includes('ROLE_ADMIN') ? 'primary' : 'disabled'} />
                    </IconButton>
                    <Button size="small" onClick={() => handleToggleEnabled(u)} sx={{ mx: 0.5 }}>
                      {u.enabled ? 'Disable' : 'Enable'}
                    </Button>
                    <IconButton onClick={() => handleDeleteOpen(u)} size="small" color="error" title="Delete user">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{selectedUser?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

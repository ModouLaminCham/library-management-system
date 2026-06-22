import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const PaginationBar = ({ page, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, px: 1 }}>
      <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9db8a8' }}>
        {totalElements} total
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" disabled={page === 0} onClick={() => onPageChange(page - 1)}
          sx={{ color: '#9db8a8', '&.Mui-disabled': { color: 'rgba(157,184,168,0.3)' } }}>
          <ChevronLeft />
        </IconButton>
        <Typography sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#f0ece3' }}>
          {page + 1} / {totalPages}
        </Typography>
        <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}
          sx={{ color: '#9db8a8', '&.Mui-disabled': { color: 'rgba(157,184,168,0.3)' } }}>
          <ChevronRight />
        </IconButton>
      </Box>
    </Box>
  );
};

export default PaginationBar;

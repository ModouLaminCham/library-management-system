import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import Books from './pages/Books';
import Members from './pages/Members';
import Borrowing from './pages/Borrowing';
import MyLoans from './pages/MyLoans';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        bgcolor: 'background.default',
      }}>
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: '100%',
            p: { xs: 2, md: 4, lg: 6 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Routes>
            <Route path="/" element={<Books />} />
            <Route path="/books" element={<Books />} />
            <Route path="/members" element={<Members />} />
            <Route path="/borrowing" element={<Borrowing />} />
            <Route path="/my-books" element={<MyLoans />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers['Authorization'] = 'Bearer ' + user.token;
        }
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem('user');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/signin', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Books API
export const booksApi = {
  getAll: () => api.get('/books'),
  getAvailable: () => api.get('/books/available'),
  getById: (id) => api.get(`/books/${id}`),
  create: (book) => api.post('/books', book),
  update: (id, book) => api.put(`/books/${id}`, book),
  delete: (id) => api.delete(`/books/${id}`),
  search: (title) => api.get(`/books/search?title=${title}`),
  searchAvailable: (title) => api.get(`/books/search/available?title=${title}`),
  getByAuthor: (author) => api.get(`/books/author/${author}`),
  getByGenre: (genre) => api.get(`/books/genre/${genre}`),
};

// Members API
export const membersApi = {
  getAll: () => api.get('/members'),
  getActive: () => api.get('/members/active'),
  getById: (id) => api.get(`/members/${id}`),
  getByEmail: (email) => api.get(`/members/email/${email}`),
  create: (member) => api.post('/members', member),
  update: (id, member) => api.put(`/members/${id}`, member),
  delete: (id) => api.delete(`/members/${id}`),
  search: (name) => api.get(`/members/search?name=${name}`),
};

// Borrowing API
export const borrowingApi = {
  getAll: () => api.get('/borrowing'),
  getActive: () => api.get('/borrowing/active'),
  getById: (id) => api.get(`/borrowing/${id}`),
  borrow: (bookId, memberId) => api.post('/borrowing/borrow', { bookId, memberId }),
  return: (id) => api.post(`/borrowing/return/${id}`),
  getByMember: (memberId) => api.get(`/borrowing/member/${memberId}`),
  getOverdue: () => api.get('/borrowing/overdue'),
  getOverdueByMember: (memberId) => api.get(`/borrowing/overdue/member/${memberId}`),
  delete: (id) => api.delete(`/borrowing/${id}`),
  getHistory: () => api.get('/borrowing/history'),
  getMemberHistory: (memberId) => api.get(`/borrowing/member/${memberId}/history`),
  payFine: (id) => api.post(`/borrowing/${id}/pay-fine`),
  waiveFine: (id) => api.post(`/borrowing/${id}/waive-fine`),
  getMyBooks: () => api.get('/borrowing/my-books'),
  getMyHistory: () => api.get('/borrowing/my-history'),
  borrowMyBook: (bookId) => api.post(`/borrowing/my-borrow/${bookId}`),
  returnMyBook: (id) => api.post(`/borrowing/my-return/${id}`),
};

// Users API (admin)
export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateRoles: (id, roles) => api.put(`/users/${id}/roles`, { roles }),
  toggleEnabled: (id) => api.put(`/users/${id}/toggle-enabled`),
  delete: (id) => api.delete(`/users/${id}`),
  getMemberId: (id) => api.get(`/users/${id}/member-id`),
};

export default api;

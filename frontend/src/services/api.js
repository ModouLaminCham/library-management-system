import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) config.headers['Authorization'] = 'Bearer ' + user.token;
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem('user');
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/signin', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const booksApi = {
  getAll: (params) => api.get('/books', { params }),
  getAvailable: (params) => api.get('/books/available', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (book) => api.post('/books', book),
  update: (id, book) => api.put(`/books/${id}`, book),
  delete: (id) => api.delete(`/books/${id}`),
  search: (title, params) => api.get(`/books/search?title=${title}`, { params }),
  searchAvailable: (title, params) => api.get(`/books/search/available?title=${title}`, { params }),
  getByAuthor: (author, params) => api.get(`/books/author/${author}`, { params }),
  getByGenre: (genre, params) => api.get(`/books/genre/${genre}`, { params }),
};

export const membersApi = {
  getAll: (params) => api.get('/members', { params }),
  getActive: (params) => api.get('/members/active', { params }),
  getById: (id) => api.get(`/members/${id}`),
  getByEmail: (email) => api.get(`/members/email/${email}`),
  create: (member) => api.post('/members', member),
  update: (id, member) => api.put(`/members/${id}`, member),
  delete: (id) => api.delete(`/members/${id}`),
  search: (name, params) => api.get(`/members/search?name=${name}`, { params }),
};

export const borrowingApi = {
  getAll: (params) => api.get('/borrowing', { params }),
  getActive: (params) => api.get('/borrowing/active', { params }),
  getById: (id) => api.get(`/borrowing/${id}`),
  borrow: (data) => api.post('/borrowing/borrow', data),
  return: (id) => api.post(`/borrowing/return/${id}`),
  getByMember: (memberId, params) => api.get(`/borrowing/member/${memberId}`, { params }),
  getOverdue: (params) => api.get('/borrowing/overdue', { params }),
  getOverdueByMember: (memberId, params) => api.get(`/borrowing/overdue/member/${memberId}`, { params }),
  delete: (id) => api.delete(`/borrowing/${id}`),
  getHistory: (params) => api.get('/borrowing/history', { params }),
  getMemberHistory: (memberId, params) => api.get(`/borrowing/member/${memberId}/history`, { params }),
  payFine: (id) => api.post(`/borrowing/${id}/pay-fine`),
  waiveFine: (id) => api.post(`/borrowing/${id}/waive-fine`),
  getMyBooks: (params) => api.get('/borrowing/my-books', { params }),
  getMyHistory: (params) => api.get('/borrowing/my-history', { params }),
  borrowMyBook: (bookId) => api.post(`/borrowing/my-borrow/${bookId}`),
  returnMyBook: (id) => api.post(`/borrowing/my-return/${id}`),
};

export const usersApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateRoles: (id, roles) => api.put(`/users/${id}/roles`, { roles }),
  toggleEnabled: (id) => api.put(`/users/${id}/toggle-enabled`),
  delete: (id) => api.delete(`/users/${id}`),
  getMemberId: (id) => api.get(`/users/${id}/member-id`),
};

export const genresApi = {
  getAll: () => api.get('/genres'),
  getById: (id) => api.get(`/genres/${id}`),
  create: (genre) => api.post('/genres', genre),
  update: (id, genre) => api.put(`/genres/${id}`, genre),
  delete: (id) => api.delete(`/genres/${id}`),
};

export const holdsApi = {
  getAll: (params) => api.get('/holds', { params }),
  getByBook: (bookId, params) => api.get(`/holds/book/${bookId}`, { params }),
  fulfillHold: (id) => api.post(`/holds/${id}/fulfill`),
  getMyHolds: () => api.get('/holds/my-holds'),
  placeMyHold: (bookId) => api.post(`/holds/my-hold/${bookId}`),
  cancelMyHold: (id) => api.post(`/holds/my-cancel/${id}`),
};

export const reportsApi = {
  getSummary: () => api.get('/reports/summary'),
};

export default api;

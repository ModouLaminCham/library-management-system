import axios from 'axios';

// In production this must be set at build time (see frontend/Dockerfile and
// docker-compose.yml's VITE_API_BASE_URL build arg) because Vite inlines
// import.meta.env.* values into the static bundle at build time — there is no
// way to change this after the app is built and served as static files.
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
      console.error(`${error.response.status} - Token may be invalid, expired, or insufficient permissions`);
      // Only force a logout+redirect for actual auth failures (401), not
      // authorization failures on an otherwise-valid session (403, e.g. a
      // regular user hitting an admin-only endpoint) — a 403 shouldn't log
      // the person out of a session that is still valid.
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
};

export default api;
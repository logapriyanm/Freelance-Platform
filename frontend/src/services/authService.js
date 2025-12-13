import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/auth` || 'http://localhost:5000/api/auth';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL + '/register', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + '/login', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Get user profile
const getProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await axios.get(API_URL + '/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return response.data.user;
};

// Update profile
const updateProfile = async (userData) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.put(API_URL + '/profile', userData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  if (response.data) {
    // Update localStorage with new user data
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const updatedUser = { ...currentUser, ...response.data.user };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
  
  return response.data.user;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
};

export default authService;
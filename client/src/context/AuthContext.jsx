import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default API configuration
  axios.defaults.baseURL = ''; // proxy takes care of routing /api to port 5000 in dev

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await axios.get('/api/auth/me');
        if (data.success) {
          setUser(data);
        } else {
          // Token is invalid
          logout();
        }
      } catch (err) {
        console.error('Error fetching current user:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Register User
  const register = async (name, email, password, role = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/auth/register', { name, email, password, role });
      if (data.success) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // Sync Cart items to server
  const syncCart = async (cartItems) => {
    if (!token) return;
    try {
      await axios.post('/api/users/cart', {
        cart: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      });
    } catch (err) {
      console.error('Cart sync error:', err.message);
    }
  };

  // Toggle wishlist item on server
  const toggleWishlistServer = async (productId) => {
    if (!token) return null;
    try {
      const { data } = await axios.post('/api/users/wishlist', { productId });
      if (data.success && user) {
        setUser(prev => ({
          ...prev,
          wishlist: data.wishlist
        }));
        return data.wishlist;
      }
    } catch (err) {
      console.error('Wishlist sync error:', err.message);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        syncCart,
        toggleWishlistServer,
        clearError: () => setError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

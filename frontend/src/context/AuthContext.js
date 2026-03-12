import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCallback, setAuthCallback] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('passportUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verify user still exists in backend
        verifyUser(parsedUser.user_id);
      } catch (e) {
        localStorage.removeItem('passportUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyUser = async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/user/${userId}`);
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('passportUser', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('User verification failed:', error);
      localStorage.removeItem('passportUser');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
      const newUser = response.data;
      setUser(newUser);
      localStorage.setItem('passportUser', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const updateUser = async (userData) => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      const response = await axios.put(`${BACKEND_URL}/api/auth/user/${user.user_id}`, userData);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('passportUser', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Update failed' 
      };
    }
  };

  const deleteAccount = async () => {
    if (!user) return { success: false, error: 'Not logged in' };
    try {
      await axios.delete(`${BACKEND_URL}/api/auth/user/${user.user_id}`);
      setUser(null);
      localStorage.removeItem('passportUser');
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Delete failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('passportUser');
  };

  // Function to require auth - shows modal if not logged in
  const requireAuth = (callback) => {
    if (user) {
      callback();
    } else {
      setAuthCallback(() => callback);
      setShowAuthModal(true);
    }
  };

  // Called after successful registration
  const onAuthSuccess = () => {
    setShowAuthModal(false);
    if (authCallback) {
      authCallback();
      setAuthCallback(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoggedIn: !!user,
      register,
      updateUser,
      deleteAccount,
      logout,
      requireAuth,
      showAuthModal,
      setShowAuthModal,
      onAuthSuccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

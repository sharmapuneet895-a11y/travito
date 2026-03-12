import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('travelWishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('travelWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync wishlist with backend when user logs in
  const syncWithBackend = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/${userId}/wishlist`);
      if (response.data?.data) {
        setWishlist(response.data.data);
      }
    } catch (error) {
      console.error('Failed to sync wishlist:', error);
    }
  }, []);

  const addToWishlist = async (country, userId = null) => {
    // Add locally first
    setWishlist(prev => {
      if (prev.some(item => item.country_code === country.country_code)) {
        return prev;
      }
      return [...prev, { ...country, addedAt: new Date().toISOString() }];
    });

    // If user is logged in, also add to backend
    if (userId) {
      try {
        await axios.post(`${BACKEND_URL}/api/user/${userId}/wishlist`, {
          country_code: country.country_code,
          country_name: country.country_name
        });
      } catch (error) {
        console.error('Failed to sync wishlist add:', error);
      }
    }
  };

  const removeFromWishlist = async (countryCode, userId = null) => {
    // Remove locally first
    setWishlist(prev => prev.filter(item => item.country_code !== countryCode));

    // If user is logged in, also remove from backend
    if (userId) {
      try {
        await axios.delete(`${BACKEND_URL}/api/user/${userId}/wishlist/${countryCode}`);
      } catch (error) {
        console.error('Failed to sync wishlist remove:', error);
      }
    }
  };

  const isInWishlist = (countryCode) => {
    return wishlist.some(item => item.country_code === countryCode);
  };

  const clearWishlist = async (userId = null) => {
    setWishlist([]);
    
    // If user is logged in, clear all items from backend too
    if (userId) {
      try {
        // Remove each item individually (or implement a clear endpoint)
        for (const item of wishlist) {
          await axios.delete(`${BACKEND_URL}/api/user/${userId}/wishlist/${item.country_code}`);
        }
      } catch (error) {
        console.error('Failed to clear wishlist on backend:', error);
      }
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      syncWithBackend
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

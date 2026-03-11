import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    localStorage.setItem('travelWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (country) => {
    setWishlist(prev => {
      if (prev.some(item => item.country_code === country.country_code)) {
        return prev;
      }
      return [...prev, { ...country, addedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (countryCode) => {
    setWishlist(prev => prev.filter(item => item.country_code !== countryCode));
  };

  const isInWishlist = (countryCode) => {
    return wishlist.some(item => item.country_code === countryCode);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import BackToTop from './components/BackToTop';
import { WishlistProvider } from './context/WishlistContext';
import Seasons from './pages/Seasons';
import Visa from './pages/Visa';
import Forex from './pages/Forex';
import Apps from './pages/Apps';
import Weather from './pages/Weather';
import PowerPlug from './pages/PowerPlug';
import Festivals from './pages/Festivals';
import CountryDetail from './pages/CountryDetail';
import Blog from './pages/Blog';
import Wishlist from './pages/Wishlist';
import '@/App.css';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <div className="App">
      <WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navigation />
          <Routes>
            <Route path="/" element={<Seasons />} />
            <Route path="/visa" element={<Visa />} />
            <Route path="/forex" element={<Forex />} />
            <Route path="/apps" element={<Apps />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/plugs" element={<PowerPlug />} />
            <Route path="/festivals" element={<Festivals />} />
            <Route path="/country/:countryCode" element={<CountryDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
          <BackToTop />
        </BrowserRouter>
      </WishlistProvider>
    </div>
  );
}

export default App;
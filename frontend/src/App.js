import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import AuthModal from './components/AuthModal';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import Seasons from './pages/Seasons';
import Visa from './pages/Visa';
import Forex from './pages/Forex';
import Apps from './pages/Apps';
import Weather from './pages/Weather';
import PowerPlug from './pages/PowerPlug';
import Festivals from './pages/Festivals';
import Safety from './pages/Safety';
import CountryDetail from './pages/CountryDetail';
import Blog from './pages/Blog';
import Wishlist from './pages/Wishlist';
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact';
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
      <AuthProvider>
        <WishlistProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Navigation />
            <AuthModal />
            <Routes>
              <Route path="/" element={<Seasons />} />
              <Route path="/seasons" element={<Seasons />} />
              <Route path="/visa" element={<Visa />} />
              <Route path="/forex" element={<Forex />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/plugs" element={<PowerPlug />} />
              <Route path="/festivals" element={<Festivals />} />
              <Route path="/safety" element={<Safety />} />
              <Route path="/country/:countryCode" element={<CountryDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
            <Footer />
            <BackToTop />
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
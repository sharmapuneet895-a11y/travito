import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Seasons from './pages/Seasons';
import Visa from './pages/Visa';
import Forex from './pages/Forex';
import Apps from './pages/Apps';
import Weather from './pages/Weather';
import PowerPlug from './pages/PowerPlug';
import Festivals from './pages/Festivals';
import CountryDetail from './pages/CountryDetail';
import Blog from './pages/Blog';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/seasons" element={<Seasons />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/forex" element={<Forex />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/plugs" element={<PowerPlug />} />
          <Route path="/festivals" element={<Festivals />} />
          <Route path="/country/:countryCode" element={<CountryDetail />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
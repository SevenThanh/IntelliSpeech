import React from 'react';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/hero/Hero';
import Navbar from '../components/ui/Navbar';

const LandingPage = () => {
  const { showNavbar } = useAuth();

  return (
    <div className="relative overflow-x-hidden">
      <Hero />
      {showNavbar && <Navbar />}
    </div>
  );
};

export default LandingPage;
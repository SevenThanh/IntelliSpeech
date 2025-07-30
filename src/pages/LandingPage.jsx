import React from 'react';
import { useAuth } from '../context/AuthContext';
import Hero from '../components/hero/Hero';
import Navbar from '../components/ui/Navbar';
import About from '../components/hero/About'

const LandingPage = () => {
  const { showNavbar } = useAuth();

  return (
    <div className="relative overflow-x-hidden">
      <Hero />
      {showNavbar && <Navbar />}
      <About/>
    </div>
  );
};

export default LandingPage;
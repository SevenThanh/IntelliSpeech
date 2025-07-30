import React from 'react';
import Hero from '../components/hero/Hero';
import About from '../components/hero/About'

const LandingPage = () => {
  return (
    <div className=" bg-gradient-to-br from-slate-100 via-blue-200 to-purple-200">
      <Hero />
      <About/>
    </div>
  );
};

export default LandingPage;
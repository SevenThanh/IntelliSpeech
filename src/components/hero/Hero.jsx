import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
// import ThreeJSDevices from './ThreeJSDevices';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)`
             }} />
      </div>

      {/* <ThreeJSDevices /> */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-light text-gray-600 mb-4">
            Welcome to
          </h2>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            IntelliSpeech
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 mb-12 font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            talk, without barriers
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <Button variant="primary">
              Join Call
            </Button>
            <Button variant="secondary">
              Host Meeting
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
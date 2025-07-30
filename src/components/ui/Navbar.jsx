import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
    >
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center"
            >
              <h2 className="text-lg font-semibold text-black">
                Hi, {user.username || user.email?.split('@')[0]} 👋
              </h2>
            </motion.div>

            {/* Right side - Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              
              {/* Clone Voice Button */}
              <Button
                variant="primary"
                onClick={() => navigate('/voice-cloning')}
                className="text-sm py-2 px-4 bg-blue-600/80 hover:bg-blue-700/80 backdrop-blur-sm"
              >
                🎤 Clone Your Voice
              </Button>

              {/* Sign Out Button */}
              <Button
                variant="secondary"
                onClick={handleSignOut}
                className="text-sm py-2 px-4"
              >
                Sign Out
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar; 
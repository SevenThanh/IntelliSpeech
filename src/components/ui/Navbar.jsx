import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

const Navbar = ({ className = '' }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsLanguageDropdownOpen(false);
    // Here you could save the language preference to user profile or local storage
    console.log('Selected language:', language);
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
              
              {/* Language Dropdown */}
                             <div className="relative">
                 <button
                   onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                   className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 transition-all duration-200"
                 >
                   <span className="text-lg">{selectedLanguage.flag}</span>
                   <span className="hidden sm:inline text-sm font-medium">
                     {selectedLanguage.name}
                   </span>
                   <svg
                     className={`w-4 h-4 transition-transform duration-200 ${
                       isLanguageDropdownOpen ? 'rotate-180' : ''
                     }`}
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                   >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                 </button>

                                 {/* Dropdown Menu */}
                 {isLanguageDropdownOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                   >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-blue-50/50 transition-colors duration-150 ${
                          selectedLanguage.code === language.code ? 'bg-blue-100/50' : ''
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span className="text-sm font-medium text-gray-700">{language.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

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

      {/* Click outside to close dropdown */}
      {isLanguageDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsLanguageDropdownOpen(false)}
        />
      )}
    </motion.nav>
  );
};

export default Navbar; 
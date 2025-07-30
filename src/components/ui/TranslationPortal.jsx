import React, { useState, useEffect } from 'react';

const TranslationPortal = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(true);
  const [showTranslated, setShowTranslated] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('start');
  
  const translations = [
    { original: 'Hi', translated: 'Hola' },
    { original: 'Hi', translated: 'Bonjour' },
    { original: 'Hi', translated: '你好' },
    { original: 'Hi', translated: 'こんにちは' },
    { original: 'Hi', translated: 'Ciao' },
    { original: 'Hi', translated: 'Hallo' },
  ];

  useEffect(() => {
    const runAnimation = () => {
      setShowOriginal(true);
      setShowTranslated(false);
      setAnimationPhase('sliding-to-portal');
      
      setTimeout(() => {
        setShowOriginal(false);
        setShowTranslated(true);
        setAnimationPhase('appearing-at-portal');
      }, 1000);
      
      setTimeout(() => {
        setAnimationPhase('sliding-from-portal');
      }, 1500);
      
      setTimeout(() => {
        setShowTranslated(false);
        setAnimationPhase('pause');
      }, 3000);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % translations.length);
      }, 3500);
    };

    runAnimation();
    
    const interval = setInterval(runAnimation, 4000);
    
    return () => clearInterval(interval);
  }, [translations.length]);

  const currentTranslation = translations[currentIndex];

  return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="relative w-[800px] h-[200px] flex items-center justify-center">
        <div className="absolute left-0 w-1/2 h-full flex items-center">
          {showOriginal && (
            <div
              className="text-6xl font-bold text-gray-900 ml-16"
              style={{
                animation: animationPhase === 'sliding-to-portal' 
                  ? 'slideToPortal 1s ease-in-out forwards' 
                  : 'none'
              }}
            >
              {currentTranslation.original}
            </div>
          )}
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full bg-black z-10" />

        <div className="absolute right-0 w-1/2 h-full flex items-center">
          {showTranslated && (
            <div
              className="text-6xl font-bold text-gray-900 ml-4"
              style={{
                animation: animationPhase === 'sliding-from-portal' 
                  ? 'slideFromPortal 1.5s ease-in-out forwards' 
                  : 'none',
                transform: animationPhase === 'appearing-at-portal' ? 'translateX(0)' : undefined
              }}
            >
              {currentTranslation.translated}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes slideToPortal {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(280px);
            }
          }

          @keyframes slideFromPortal {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(350px);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default TranslationPortal;
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';


const ProcessStep = ({ step, title, description, icon, index, isLast }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      className="relative flex items-start space-x-6"
    >
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{step}</span>
          </div>
          {!isLast && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-purple-300 to-transparent"></div>
          )}
        </div>
      </div>

      <div className="flex-1 pb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-2xl">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const FloatingElement = ({ children, delay = 0, duration = 4 }) => {
  return (
    <motion.div
      animate={{
        y: [-10, 10, -10],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute"
    >
      {children}
    </motion.div>
  );
};


const HowToUseSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, threshold: 0.1 });

  const steps = [
    {
      step: 1,
      title: "Join the Room",
      description: "Click the meeting link or enter the room ID. No downloads required, works instantly in your browser.",
      icon: "🚀"
    },
    {
      step: 2,
      title: "Choose Your Language",
      description: "Select your preferred language from 40+ options. Our AI adapts to your accent and speaking style.",
      icon: "🗣️"
    },
    {
      step: 3,
      title: "Start Speaking",
      description: "Talk naturally in your language. Real-time translation appears instantly for all participants.",
      icon: "💬"
    },
    {
      step: 4,
      title: "Connect Globally",
      description: "Experience seamless conversations with anyone, anywhere. Language barriers disappear completely.",
      icon: "🌍"
    }
  ];

  return (
    <div className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      <FloatingElement delay={0} duration={6}>
        <div className="top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-xl"></div>
      </FloatingElement>
      
      <FloatingElement delay={2} duration={8}>
        <div className="top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-200/30 to-yellow-200/30 rounded-full blur-xl"></div>
      </FloatingElement>
      
      <FloatingElement delay={4} duration={5}>
        <div className="bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-2xl"></div>
      </FloatingElement>

      <div ref={sectionRef} className="max-w-6xl mx-auto relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the future of global communication in just four simple steps. 
            Our cutting-edge AI technology makes international collaboration effortless.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            {steps.slice(0, 2).map((stepData, index) => (
              <ProcessStep
                key={stepData.step}
                {...stepData}
                index={index}
                isLast={index === 1}
              />
            ))}
          </div>

          <div className="space-y-8 lg:mt-16">
            {steps.slice(2, 4).map((stepData, index) => (
              <ProcessStep
                key={stepData.step}
                {...stepData}
                index={index + 2}
                isLast={index === 1}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-20"
        >
   
        </motion.div>
      </div>
    </div>
  );
};

export default HowToUseSection;
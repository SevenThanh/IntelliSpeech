import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Globe, Mic, Shield, Zap, Users, Lock } from 'lucide-react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const faqData = [
    {
      question: "How does real-time translation work?",
      answer: "Our AI-powered engine processes speech in milliseconds, translating across 40+ languages while preserving tone and context. The technology adapts to accents and speaking styles for natural conversations.",
      icon: <Globe className="w-5 h-5" />,
      gradient: "from-blue-500 to-purple-500"
    },
    {
      question: "Is my conversation data secure?",
      answer: "We use enterprise-grade encryption for all communications. Your conversations are never stored, and our zero-knowledge architecture ensures complete privacy. All data is processed in real-time and immediately discarded.",
      icon: <Shield className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      question: "What makes your voice synthesis unique?",
      answer: "Our neural voice synthesis creates natural-sounding speech that maintains emotional nuance and speaking patterns.",
      icon: <Mic className="w-5 h-5" />,
      gradient: "from-pink-500 to-orange-500"
    },
    {
      question: "How many participants can join a call?",
      answer: "Our platform supports up to 20 participants simultaneously, each speaking different languages. The system intelligently manages audio streams to ensure crystal-clear communication for everyone.",
      icon: <Users className="w-5 h-5" />,
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      question: "Do I need special equipment?",
      answer: "No special hardware required. Our platform works in any modern browser with just a microphone and camera.",
      icon: <Lock className="w-5 h-5" />,
      gradient: "from-green-500 to-blue-500"
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-pulse" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Questions?
            </span>
            <br />
            <span className="text-gray-900">We've Got Answers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our revolutionary translation platform
          </p>
        </motion.div>
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full text-left p-6 rounded-2xl backdrop-blur-lg bg-white/70 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-lg`}>
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {item.question}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-400 group-hover:text-purple-600"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="pl-16">
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">Still have questions?</p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Contact Our Team
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import Devices from "./Devices";
import TextType from "../ui/TextType";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoinCall = () => {
    if (user) {
      navigate("/video-call");
    } else {
      navigate("/login");
    }
  };

  const handleHostMeeting = () => {
    if (user) {
      navigate("/video-call");
    } else {
      navigate("/register");
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      <Devices />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <TextType
            text={["Welcome to"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="text-2xl md:text-3xl font-light text-gray-600 mb-4"
          />

          <motion.h1
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
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
            <Button variant="primary" onClick={handleJoinCall}>
              {user ? "Join Call" : "Sign In to Start"}
            </Button>
            <Button variant="secondary" onClick={handleHostMeeting}>
              {user ? "Host Meeting" : "Sign Up to Host"}
            </Button>
          </motion.div>

          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="mt-6"
            >
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors underline"
                >
                  Sign in here
                </button>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

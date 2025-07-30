import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Navbar from '../components/ui/Navbar';

const VoiceCloning = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cloningSuccess, setCloningSuccess] = useState(false);
  const [permissionError, setPermissionError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const navigate = useNavigate();
  const { user, showNavbar } = useAuth();

  const MAX_RECORDING_TIME = 15; // 15 seconds

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setPermissionError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        setShowConfirmation(true);

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionError('Please allow microphone access to record your voice.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    }
  };

  const confirmRecording = () => {
    setCloningSuccess(true);
    setShowConfirmation(false);
  };

  const retryRecording = () => {
    setAudioBlob(null);
    setShowConfirmation(false);
    setRecordingTime(0);
    setCloningSuccess(false);
  };


  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {showNavbar && <Navbar />}

      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-purple-1000" />
        </div>

        {/* Back button */}
        <div className={`absolute ${showNavbar ? 'top-20' : 'top-4'} left-4 z-20`}>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/')}
            className="text-sm py-2 px-4"
          >
            ← Back to Home
          </Button>
        </div>

        <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-4 ${showNavbar ? 'pt-20' : 'pt-4'}`}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center">

              {!cloningSuccess ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                  >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Voice Cloning</h1>
                    <p className="text-gray-600 text-lg">
                      Record a 15-second sample of your voice to create your personal voice clone
                    </p>
                  </motion.div>

                  {/* Recording Interface */}
                  {!showConfirmation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="space-y-8"
                    >

                      {/* Timer */}
                      <div className="text-center">
                        <span className="text-3xl font-bold text-gray-700">
                          {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
                        </span>
                      </div>

                      {/* Recording Circle */}
                      <div className="flex justify-center">
                        <div className={`relative w-48 h-48 rounded-full border-8 flex items-center justify-center transition-all duration-300 ${isRecording
                            ? 'border-red-500 bg-red-50 animate-pulse'
                            : 'border-blue-500 bg-blue-50 hover:border-blue-600'
                          }`}>
                          <div className={`w-20 h-20 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500' : 'bg-blue-500'
                            }`} />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-4">
                        {!isRecording ? (
                          <Button
                            variant="primary"
                            onClick={startRecording}
                            className="text-xl py-4 px-8"
                          >
                            Start Recording
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            onClick={stopRecording}
                            className="text-xl py-4 px-8"
                          >
                            Stop Recording
                          </Button>
                        )}

                        {permissionError && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-50 border border-red-200 rounded-lg"
                          >
                            <p className="text-red-600">{permissionError}</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Confirmation Interface */}
                  {showConfirmation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-8"
                    >
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recording Complete!</h2>
                        <p className="text-gray-600">Listen to your recording and confirm if you're happy with it.</p>
                      </div>

                      {/* Playback Controls */}
                      <div className="space-y-6">
                        <Button
                          variant="secondary"
                          onClick={playRecording}
                          disabled={isPlaying}
                          className="text-lg py-3 px-6"
                        >
                          {isPlaying ? '▶️ Playing...' : '▶️ Play Recording'}
                        </Button>

                        <div className="flex gap-4 justify-center">
                          <Button
                            variant="primary"
                            onClick={confirmRecording}
                            className="py-3 px-6"
                          >
                            Use This Recording
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={retryRecording}
                            className="py-3 px-6"
                          >
                            Record Again
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8"
                >
                  <div className="text-6xl">🎉</div>
                  <div>
                    <h2 className="text-3xl font-bold text-green-600 mb-4">Voice Cloned Successfully!</h2>
                    <p className="text-gray-600 text-lg mb-8">
                      Your voice has been processed and is ready to use. You can now generate speech with your personal voice.
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/')}
                      className="py-3 px-6"
                    >
                      Return to Home
                    </Button>

                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Hidden audio element for playback */}
          <audio ref={audioRef} style={{ display: 'none' }} />
        </div>
      </section>
    </div>
  );
};

export default VoiceCloning; 
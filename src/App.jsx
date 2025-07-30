import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import LandingPage from './pages/LandingPage'
import VoiceCloning from './pages/VoiceCloning'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import MicTestPage from './pages/MicTestPage'
import VideoCallPage from './pages/VideoCallPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/voice-cloning" 
              element={
                <ProtectedRoute>
                  <VoiceCloning />
                </ProtectedRoute>
              } 
            />
            <Route path="/mic-test" element={<MicTestPage />} />
            <Route path="/video-call" element={<VideoCallPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App

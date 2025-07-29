import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import MicTestPage from "./pages/MicTestPage";
import VideoCallPage from "./pages/VideoCallPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mic-test" element={<MicTestPage />} />
          <Route path="/video-call" element={<VideoCallPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

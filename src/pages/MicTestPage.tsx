import React, { useState, useRef, useEffect } from "react";
import { transcribeAudio } from "../components/transcribe/transcribeAudio";
import { translateText } from "../components/translate/translateText";
const LANGUAGES = [
  { label: "English (US)", code: "en-US", ttsCode: "en-US" },
  { label: "Spanish", code: "es-ES", ttsCode: "es-ES" },
  { label: "Japanese", code: "ja-JP", ttsCode: "ja-JP" },
  { label: "Bangla", code: "bn-BD", ttsCode: "bn-IN" },
];
export default function SimpleVoiceTranslator() {
  const [recording, setRecording] = useState(false);
  const [output, setOutput] = useState("");
  const [translation, setTranslation] = useState("");
  const [transcribeLang, setTranscribeLang] = useState("en-US");
  const [translateLang, setTranslateLang] = useState("es-ES");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Initialize video stream on component mount
  useEffect(() => {
    const initVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Could not access camera:", err);
      }
    };
    initVideo();
    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  function speak(text: string, lang: string = "es-ES") {
    if (!window.speechSynthesis) {
      alert("Speech synthesis not supported");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
  const startRecording = async () => {
    setOutput("");
    setTranslation("");
    chunksRef.current = [];
    try {
      // Get fresh audio stream for recording
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      // Try different MIME types for better compatibility
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = ""; // Let browser choose
        }
      }
      const mediaRecorder = new MediaRecorder(
        audioStream,
        mimeType ? { mimeType } : {}
      );
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      mediaRecorder.onstop = async () => {
        // Stop the audio stream tracks to free up the microphone
        audioStream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const file = new File([blob], "recording.webm", {
          type: mimeType || "audio/webm",
        });
        try {
          const transcript = await transcribeAudio(file);
          const translatedText = await translateText(
            transcript,
            translateLang.split("-")[0]
          );
          setTranslation(translatedText);
          setOutput(
            `Transcript: ${transcript}\n\nTranslation: ${translatedText}`
          );
          const ttsLang =
            LANGUAGES.find((l) => l.code === translateLang)?.ttsCode || "es-ES";
          speak(translatedText, ttsLang);
        } catch (err: any) {
          setOutput("Error: " + err.message);
        }
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err: any) {
      setOutput("Could not access microphone: " + err.message);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };
  const playTranslation = () => {
    if (translation) {
      const ttsLang =
        LANGUAGES.find((l) => l.code === translateLang)?.ttsCode || "es-ES";
      speak(translation, ttsLang);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 space-y-6">
      {/* Video Display */}
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-80 h-60 border-2 border-blue-400 rounded-xl bg-gray-800"
        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
          Your Camera
        </div>
      </div>
      {/* Language Selection */}
      <div className="flex space-x-4 w-full max-w-lg">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Transcription Language:</label>
          <select
            value={transcribeLang}
            onChange={(e) => setTranscribeLang(e.target.value)}
            className="w-full border rounded px-3 py-2 text-black bg-white"
          >
            {LANGUAGES.map(({ label, code }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Translation Language:</label>
          <select
            value={translateLang}
            onChange={(e) => setTranslateLang(e.target.value)}
            className="w-full border rounded px-3 py-2 text-black bg-white"
          >
            {LANGUAGES.map(({ label, code }) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Recording Controls */}
      <div className="flex space-x-4">
        <button
          onClick={startRecording}
          disabled={recording}
          className={`px-6 py-3 rounded-xl font-bold transition-colors ${
            recording
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {recording ? "Recording..." : "Start Recording"}
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          className={`px-6 py-3 rounded-xl font-bold transition-colors ${
            !recording
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Stop Recording
        </button>
      </div>
      {/* Play Translation Button */}
      {translation && (
        <button
          onClick={playTranslation}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold"
        >
          :loud_sound: Play Translation
        </button>
      )}
      {/* Output Display */}
      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-2xl space-y-4">
        <div className="space-y-2">
          <div>
            <p className="text-lg">
              <strong className="text-blue-300">Transcript:</strong>{" "}
              {translation
                ? output
                    .split("\n\nTranslation:")[0]
                    .replace("Transcript: ", "")
                : "No transcript yet..."}
            </p>
          </div>
          <div>
            <p className="text-lg">
              <strong className="text-green-300">Translation:</strong>{" "}
              {translation || "No translation yet..."}
            </p>
          </div>
        </div>
        {output && (
          <div className="mt-4 pt-4 border-t border-gray-600">
            <h4 className="text-sm font-bold text-gray-400 mb-2">
              Full Output:
            </h4>
            <pre className="bg-gray-700 p-3 rounded text-sm whitespace-pre-wrap text-gray-200">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

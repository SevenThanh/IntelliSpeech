import React, { useState, useRef } from "react";
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });

        try {
          const transcript = await transcribeAudio(file, transcribeLang);
          const translatedText = await translateText(transcript, translateLang.split("-")[0]);
          setTranslation(translatedText);
          setOutput(`Transcript: ${transcript}\n\nTranslation: ${translatedText}`);

          const ttsLang = LANGUAGES.find((l) => l.code === translateLang)?.ttsCode || "es-ES";
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
      const ttsLang = LANGUAGES.find((l) => l.code === translateLang)?.ttsCode || "es-ES";
      speak(translation, ttsLang);
    }
  };

return (
  <div className="p-4 space-y-4 border rounded-md max-w-md mx-auto">
    <div className="space-y-1">
      <label>Transcription Language:</label>
      <select
        value={transcribeLang}
        onChange={(e) => setTranscribeLang(e.target.value)}
        className="w-full border rounded px-2 py-1"
      >
        {LANGUAGES.map(({ label, code }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>

    <div className="space-y-1">
      <label>Translation Language:</label>
      <select
        value={translateLang}
        onChange={(e) => setTranslateLang(e.target.value)}
        className="w-full border rounded px-2 py-1"
      >
        {LANGUAGES.map(({ label, code }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>

    <div className="flex space-x-2">
      <button
        onClick={startRecording}
        disabled={recording}
        className="border rounded px-3 py-1"
      >
        {recording ? "Recording..." : "Start Recording"}
      </button>

      <button
        onClick={stopRecording}
        disabled={!recording}
        className="border rounded px-3 py-1"
      >
        Stop Recording
      </button>
    </div>

    {translation && (
      <button
        onClick={playTranslation}
        className="w-full border rounded px-3 py-1"
      >
        Play Translation
      </button>
    )}

    <pre className="bg-gray-100 border rounded p-2 text-sm whitespace-pre-wrap">{output}</pre>
  </div>
);
}
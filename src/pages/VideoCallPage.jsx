import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { transcribeAudio } from "../components/transcribe/transcribeAudio";
import { translateText } from "../components/translate/translateText";

const LANGUAGES = [
  { label: "English (US)", code: "en-US", ttsCode: "en-US" },
  { label: "Spanish", code: "es-ES", ttsCode: "es-ES" },
  { label: "Japanese", code: "ja-JP", ttsCode: "ja-JP" },
  { label: "Bangla", code: "bn-BD", ttsCode: "bn-IN" },
];

const VideoCallPage = () => {
  // WebRTC Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  // Recording / Translation State
  const [recording, setRecording] = useState(false);
  const [output, setOutput] = useState("");
  const [translation, setTranslation] = useState("");
  const [transcribeLang, setTranscribeLang] = useState("en-US");
  const [translateLang, setTranslateLang] = useState("es-ES");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isMicOn, setIsMicOn] = useState(false); // Start muted
  const [remoteMicOn, setRemoteMicOn] = useState(false);

  // Remote transcript/translation state
  const [remoteTranscript, setRemoteTranscript] = useState("");
  const [remoteTranslation, setRemoteTranslation] = useState("");

  const ROOM_ID = "demo-room";

  useEffect(() => {
    const socket = io("https://ca2d871c4c47.ngrok.app");
    socketRef.current = socket;

    console.log("🔌 Setting up socket connection...");

    socket.on("connect", () => {
      console.log("✅ Connected to signaling server");
      socket.emit("join-room", ROOM_ID, socket.id);
      console.log("📩 Emitted join-room for", ROOM_ID);
      // Emit initial mic status to room
      socket.emit("mic-status", {
        micOn: isMicOn,
        targetId: null,
        senderId: socket.id,
      });
    });

    socket.on("user-connected", (userId) => {
      console.log(`🔗 New user joined room: ${userId}`);
      remoteSocketIdRef.current = userId;

      const trySendOffer = setInterval(async () => {
        if (peerConnectionRef.current && localStreamRef.current) {
          clearInterval(trySendOffer);

          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);

          console.log("📤 Sending offer to", userId);
          socket.emit("offer", { offer, targetId: userId });
        }
      }, 250);
    });

    socket.on("offer", async ({ offer, senderId }) => {
      console.log("📥 Received offer from", senderId);
      remoteSocketIdRef.current = senderId;

      if (!peerConnectionRef.current) initPeerConnection();

      await peerConnectionRef.current.setRemoteDescription(
        new window.RTCSessionDescription(offer)
      );

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      console.log("📤 Sending answer back to", senderId);
      socket.emit("answer", { answer, targetId: senderId });
    });

    socket.on("answer", async ({ answer }) => {
      console.log("📥 Received answer");
      await peerConnectionRef.current.setRemoteDescription(
        new window.RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("📥 Received ICE candidate");
      try {
        await peerConnectionRef.current.addIceCandidate(
          new window.RTCIceCandidate(candidate)
        );
        console.log("✅ Added remote ICE candidate");
      } catch (err) {
        console.error("❌ Error adding ICE candidate", err);
      }
    });

    socket.on("user-disconnected", () => {
      console.log("👋 User disconnected");

      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      remoteSocketIdRef.current = null;
      setRemoteTranscript("");
      setRemoteTranslation("");
      setRemoteMicOn(false);
    });

    // Listen for remote transcription messages
    socket.on("transcription-message", ({ transcript, translation }) => {
      setRemoteTranscript(transcript);
      setRemoteTranslation(translation);
    });

    // Listen for remote mic status
    socket.on("mic-status", ({ micOn, senderId }) => {
      // Only update if not from self
      if (senderId !== socket.id) {
        setRemoteMicOn(micOn);
      }
    });

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("📷 Accessed local media stream");
        localStreamRef.current = stream;

        // Mute audio tracks initially
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
        }

        initPeerConnection();
      })
      .catch((err) => {
        console.error("❌ Could not access camera or mic:", err);
        alert("Could not access camera or microphone.");
      });

    // Setup peer connection
    function initPeerConnection() {
      console.log("⚙️ Initializing peer connection");
      const pc = new window.RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerConnectionRef.current = pc;

      localStreamRef.current?.getTracks().forEach((track) => {
        console.log(`🎙️ Adding local track: ${track.kind}`);
        pc.addTrack(track, localStreamRef.current);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current && remoteSocketIdRef.current) {
          console.log("📤 Sending ICE candidate");
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            targetId: remoteSocketIdRef.current,
          });
        }
      };

      pc.ontrack = (event) => {
        console.log("📺 Received remote track");
        const remoteStream = event.streams[0];
        const remoteVideo = remoteVideoRef.current;

        if (remoteVideo && remoteStream) {
          remoteVideo.srcObject = remoteStream;
          remoteVideo.load();
          remoteVideo.play().catch((err) => {
            console.warn("⚠️ Remote video play() error:", err);
          });
          console.log("✅ Set remote video stream");
        }
      };

      pc.onconnectionstatechange = () => {
        console.log("🔄 Connection state:", pc.connectionState);
      };
    }

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      socketRef.current?.disconnect();
    };
  }, []);

  // 🔊 Speech Synthesis
  const speak = (text, lang = "es-ES") => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis not supported");
      return;
    }
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const playTranslation = () => {
    if (translation) {
      const ttsLang =
        LANGUAGES.find((l) => l.code === translateLang)?.ttsCode || "es-ES";
      speak(translation, ttsLang);
    }
  };

  const playRemoteTranslation = () => {
    if (remoteTranslation) {
      const ttsLang =
        LANGUAGES.find((l) => l.code === translateLang)?.ttsCode || "es-ES";
      speak(remoteTranslation, ttsLang);
    }
  };

  const startRecording = async () => {
    setOutput("");
    setTranslation("");
    chunksRef.current = [];

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      let mimeType = "audio/webm";
      if (!window.MediaRecorder.isTypeSupported("audio/webm")) {
        if (window.MediaRecorder.isTypeSupported("audio/mp4"))
          mimeType = "audio/mp4";
        else if (window.MediaRecorder.isTypeSupported("audio/ogg"))
          mimeType = "audio/ogg";
        else mimeType = "";
      }

      const mediaRecorder = new window.MediaRecorder(
        audioStream,
        mimeType ? { mimeType } : {}
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        audioStream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const file = new File([blob], "recording.webm", {
          type: mimeType || "audio/webm",
        });

        try {
          const transcript = await transcribeAudio(file, transcribeLang);
          const translatedText = await translateText(
            transcript,
            translateLang.split("-")[0]
          );
          setTranslation(translatedText);
          setOutput(
            `Transcript: ${transcript}\n\nTranslation: ${translatedText}`
          );

          // Send to remote user via socket
          if (socketRef.current && remoteSocketIdRef.current) {
            socketRef.current.emit("transcription-message", {
              transcript,
              translation: translatedText,
              targetId: remoteSocketIdRef.current,
            });
          }

          const ttsLang =
            LANGUAGES.find((l) => l.code === translateLang)?.ttsCode || "es-ES";
          speak(translatedText, ttsLang);
        } catch (err) {
          setOutput("Error: " + err.message);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      setOutput("Could not access microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Mute/unmute microphone
  const muteMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      setIsMicOn(false);
      // Notify remote
      if (socketRef.current) {
        socketRef.current.emit("mic-status", {
          micOn: false,
          targetId: null,
          senderId: socketRef.current.id,
        });
      }
    }
  };

  const unmuteMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
      setIsMicOn(true);
      // Notify remote
      if (socketRef.current) {
        socketRef.current.emit("mic-status", {
          micOn: true,
          targetId: null,
          senderId: socketRef.current.id,
        });
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-900 space-y-6 p-4 text-white">
      <div className="flex space-x-4 relative">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-72 h-48 border-2 border-blue-400 rounded-xl shadow-lg object-cover"
          />
          {/* Mic status badge */}
          <div className="absolute top-2 left-2">
            {isMicOn ? (
              <span className="flex items-center bg-green-700 bg-opacity-80 px-3 py-1 rounded-full shadow text-xs font-bold">
                <svg
                  className="w-4 h-4 mr-1 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v2m0 0h3m-3 0H9m6-2a6 6 0 01-12 0V9a6 6 0 0112 0v7z"
                  />
                </svg>
                Unmuted
              </span>
            ) : (
              <span className="flex items-center bg-red-700 bg-opacity-80 px-3 py-1 rounded-full shadow text-xs font-bold">
                <svg
                  className="w-4 h-4 mr-1 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9v6m6-6v6m-7.5 4.5l11-11"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 13V9a7 7 0 00-14 0v4a7 7 0 0014 0z"
                  />
                </svg>
                Muted
              </span>
            )}
          </div>
        </div>
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-72 h-48 border-2 border-green-400 rounded-xl shadow-lg object-cover"
          />
          {/* Remote mic status badge */}
          <div className="absolute top-2 left-2">
            {remoteMicOn ? (
              <span className="flex items-center bg-green-700 bg-opacity-80 px-3 py-1 rounded-full shadow text-xs font-bold">
                <svg
                  className="w-4 h-4 mr-1 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v2m0 0h3m-3 0H9m6-2a6 6 0 01-12 0V9a6 6 0 0112 0v7z"
                  />
                </svg>
                Unmuted
              </span>
            ) : (
              <span className="flex items-center bg-red-700 bg-opacity-80 px-3 py-1 rounded-full shadow text-xs font-bold">
                <svg
                  className="w-4 h-4 mr-1 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9v6m6-6v6m-7.5 4.5l11-11"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 13V9a7 7 0 00-14 0v4a7 7 0 0014 0z"
                  />
                </svg>
                Muted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Language and Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <div>
            <label className="block mb-1 text-sm font-semibold text-blue-200">
              Transcribe:
            </label>
            <select
              value={transcribeLang}
              onChange={(e) => setTranscribeLang(e.target.value)}
              className="text-black rounded-lg p-2 border border-blue-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map(({ label, code }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold text-green-200">
              Translate:
            </label>
            <select
              value={translateLang}
              onChange={(e) => setTranslateLang(e.target.value)}
              className="text-black rounded-lg bg-white p-2 border border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {LANGUAGES.map(({ label, code }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => {
              unmuteMic();
              startRecording();
            }}
            disabled={recording}
            className={`px-4 py-2 rounded-lg bg-green-600 font-bold shadow transition-all duration-150 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 ${
              recording && "opacity-50 cursor-not-allowed"
            }`}
          >
            Unmute
          </button>
          <button
            onClick={() => {
              muteMic();
              stopRecording();
            }}
            disabled={!recording}
            className={`px-4 py-2 rounded-lg bg-red-600 font-bold shadow transition-all duration-150 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 ${
              !recording && "opacity-50 cursor-not-allowed"
            }`}
          >
            Mute
          </button>
          {translation && (
            <button
              onClick={playTranslation}
              className="px-4 py-2 rounded-lg bg-purple-600 font-bold shadow transition-all duration-150 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              🔊 Play
            </button>
          )}
        </div>

        <div className="text-left w-full max-w-xl bg-gray-800 rounded-lg p-4 shadow space-y-2">
          <div>
            <span className="inline-block px-2 py-1 rounded bg-blue-700 text-xs font-semibold mr-2">
              Transcript
            </span>
            <span className="text-gray-100">
              {translation
                ? output
                    .split("\n\nTranslation:")[0]
                    .replace("Transcript: ", "")
                : "No transcript yet"}
            </span>
          </div>
          <div>
            <span className="inline-block px-2 py-1 rounded bg-green-700 text-xs font-semibold mr-2">
              Translation
            </span>
            <span className="text-gray-100">
              {translation || "No translation yet"}
            </span>
          </div>
        </div>

        {/* Remote transcript/translation */}
        <div className="text-left w-full max-w-xl bg-gray-700 rounded-lg p-4 shadow space-y-2 mt-4">
          <div>
            <span className="inline-block px-2 py-1 rounded bg-blue-500 text-xs font-semibold mr-2">
              Remote Transcript
            </span>
            <span className="text-gray-100">
              {remoteTranscript || "No transcript yet"}
            </span>
          </div>
          <div>
            <span className="inline-block px-2 py-1 rounded bg-green-500 text-xs font-semibold mr-2">
              Remote Translation
            </span>
            <span className="text-gray-100">
              {remoteTranslation || "No translation yet"}
            </span>
            {remoteTranslation && (
              <button
                onClick={playRemoteTranslation}
                className="ml-2 px-2 py-1 rounded bg-purple-500 font-bold text-xs hover:bg-purple-600"
              >
                🔊 Play
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;

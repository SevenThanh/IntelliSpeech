import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const VideoCallPage = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const remoteSocketIdRef = useRef(null);

  const ROOM_ID = "demo-room";

  useEffect(() => {
    const socket = io("https://0db1f0cef3ab.ngrok.app");
    socketRef.current = socket;

    console.log("🔌 Setting up socket connection...");

    socket.on("connect", () => {
      console.log("✅ Connected to signaling server");
      socket.emit("join-room", ROOM_ID, socket.id);
      console.log("📩 Emitted join-room for", ROOM_ID);
    });

    // 🧠 Delay offer until peer is ready
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
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      console.log("📤 Sending answer back to", senderId);
      socket.emit("answer", { answer, targetId: senderId });
    });

    socket.on("answer", async ({ answer }) => {
      console.log("📥 Received answer");
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("📥 Received ICE candidate");
      try {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
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
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        console.log("📷 Accessed local media stream");
        localStreamRef.current = stream;

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

    const initPeerConnection = () => {
      console.log("⚙️ Initializing peer connection");
      const pc = new RTCPeerConnection({
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

          const videoTracks = remoteStream.getVideoTracks();
          console.log("🎥 Remote video tracks:", videoTracks);

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
    };

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

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 space-x-4 px-4">
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-1/2 max-w-md h-72 border-2 border-blue-400 rounded-xl shadow-lg object-cover"
      />
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-1/2 max-w-md h-72 border-2 border-green-400 rounded-xl shadow-lg object-cover"
      />
    </div>
  );
};

export default VideoCallPage;

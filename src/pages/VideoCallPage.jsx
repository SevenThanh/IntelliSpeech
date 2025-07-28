import { useEffect, useRef } from "react";

const VideoCallPage = () => {
  useEffect(() => {
    const socket = io();
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();

    let localStream;
    let remoteStream;
    let peerConnection;

    const ROOM_ID = "demo-room";

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream = stream;
        localVideoRef.srcObject = stream;
      });
  }, []);

  return (
    <div>
      {/* Current user's video */}
      <video ref={localVideoRef} autoplay playsinline muted />

      {/* "Friend"'s video */}
      <video ref={remoteVideoRef} autoplay playsInline />
    </div>
  );
};

export default VideoCallPage;

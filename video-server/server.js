const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://silly-things-kiss.loca.lt",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentuserId = null;

  console.log(`User ${socket.id} connected`);

  socket.on("join-room", (roomId, userId) => {
    currentRoom = roomId;
    currentuserId = userId;

    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);

    // Notify all other users in the room
    socket.to(roomId).emit("user-connected", socket.id);
  });

  // Send offer directly to target peer
  socket.on("offer", ({ offer, targetId }) => {
    console.log(`Forwarding offer to ${targetId}`);
    io.to(targetId).emit("offer", {
      offer,
      senderId: socket.id,
    });
  });

  // Send answer directly to target peer
  socket.on("answer", ({ answer, targetId }) => {
    console.log(`Forwarding answer to ${targetId}`);
    io.to(targetId).emit("answer", {
      answer,
      senderId: socket.id,
    });
  });

  // Send ICE candidate directly to target peer
  socket.on("ice-candidate", ({ candidate, targetId }) => {
    console.log(`Forwarding ICE candidate to ${targetId}`);
    io.to(targetId).emit("ice-candidate", {
      candidate,
      senderId: socket.id,
    });
  });

  // Relay mic-status to other users in the room
  socket.on("mic-status", ({ micOn, targetId, senderId }) => {
    if (currentRoom) {
      // Broadcast to everyone else in the room except sender
      socket.to(currentRoom).emit("mic-status", { micOn, senderId });
    }
  });

  // Relay transcription-message to the target peer
  socket.on(
    "transcription-message",
    ({ transcript, translation, targetId }) => {
      if (targetId) {
        io.to(targetId).emit("transcription-message", {
          transcript,
          translation,
        });
      }
    }
  );

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    if (currentRoom && currentuserId) {
      socket.to(currentRoom).emit("user-disconnected", currentuserId);
      console.log(
        `Notified room ${currentRoom} that ${currentuserId} disconnected`
      );
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

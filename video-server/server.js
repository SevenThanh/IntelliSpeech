const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentuserId = null;

  console.log(`User ${socket.id} has entered the room`);

  // Handling user joining room
  socket.on("join-room", (roomId, userId) => {
    currentRoom = roomId;
    currentuserId = userId;

    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);

    socket.to(roomId).emit("user-connected", socket.id);
  });

  // Broadcasting offer to other users
  socket.on("offer", (offer) => {
    console.log("Offer has been received!");
    socket.broadcast.emit("offer", offer);
  });

  // Broadcasting answer to other users
  socket.on("answer", (answer) => {
    console.log("Answer has been received");
    socket.broadcast.emit("answer", answer);
  });

  // Broadcast ICE Candidates
  socket.on("ice-candidates", (candidate) => {
    console.log("Ice candidate recieved");
    socket.broadcast.emit("ice-candidate", candidate);
  });

  // Disconnected event handler
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} has disconnected`);
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

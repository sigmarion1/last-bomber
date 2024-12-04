const express = require("express");
const path = require("path");

const http = require("http");
const { v4: uuidv4 } = require("uuid");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // To keep track of game rooms and players

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Handle player joining a room
  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    rooms[roomCode] = rooms[roomCode] || [];
    rooms[roomCode].push(socket.id);
    console.log(`Player ${socket.id} joined room ${roomCode}`);

    // Notify the player
    socket.emit("joinedRoom", roomCode);

    setTimeout(() => {
      io.in(roomCode).emit("gameStarted");
      // Begin
    }, 5000);

    setTimeout(() => {
      io.in(roomCode).emit("bombFlash");
    }, 10000);
  });

  // Handle game start
  socket.on("startGame", (roomCode) => {
    io.in(roomCode).emit("gameStarted");
    // Begin the bomb flashing sequence
    startBombSequence(roomCode);
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    // Remove player from rooms
    for (const room in rooms) {
      rooms[room] = rooms[room].filter((id) => id !== socket.id);
    }
  });
});

// Function to handle the bomb sequence
function startBombSequence(roomCode) {
  const players = rooms[roomCode];
  if (players.length <= 1) {
    io.in(roomCode).emit("gameOver", players[0]);
    return;
  }

  // Simulate bomb flashing sequence
  let currentPlayerIndex = 0;
  const interval = setInterval(() => {
    const currentPlayerId = players[currentPlayerIndex];
    io.to(currentPlayerId).emit("bombFlash");

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  }, 1000);

  // After some time, eliminate a player
  setTimeout(() => {
    clearInterval(interval);
    const eliminatedPlayerIndex = Math.floor(Math.random() * players.length);
    const eliminatedPlayerId = players.splice(eliminatedPlayerIndex, 1)[0];
    io.to(eliminatedPlayerId).emit("bombExplode");
    io.in(roomCode).emit("playerEliminated", eliminatedPlayerId);

    // Recursively start the next round
    startBombSequence(roomCode);
  }, 5000); // Adjust the duration as needed
}

app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

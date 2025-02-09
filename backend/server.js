const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (Update this for production)
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const rooms = {}; // Stores room data: code, language, and users

io.on("connection", (socket) => {
  console.log(`🔵 User connected: ${socket.id}`);

  // Handle user joining a room
  socket.on("joinRoom", ({ roomId, username }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        code: "console.log('Hello, Monaco!');",
        language: "javascript",
        users: {},
      };
    }

    // Store user in room
    rooms[roomId].users[socket.id] = { username };

    socket.join(roomId);
    io.to(roomId).emit("userList", Object.values(rooms[roomId].users));

    // Send existing code and language to new user
    socket.emit("codeUpdate", rooms[roomId].code);
    socket.emit("languageUpdate", rooms[roomId].language);

    console.log(`📢 ${username} joined room: ${roomId}`);
  });

  // Handle real-time code updates
  socket.on("codeUpdate", ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code;
      socket.to(roomId).emit("codeUpdate", code);
    }
  });

  // Handle language change
  socket.on("languageUpdate", ({ roomId, language }) => {
    if (rooms[roomId]) {
      rooms[roomId].language = language;
      socket.to(roomId).emit("languageUpdate", language);
    }
  });

  // Handle real-time cursor movement
  socket.on("cursorMove", ({ roomId, user, position }) => {
    if (rooms[roomId]) {
      socket.to(roomId).emit("cursorMove", { user, position });
    }
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        const username = rooms[roomId].users[socket.id].username;
        delete rooms[roomId].users[socket.id];

        io.to(roomId).emit("userList", Object.values(rooms[roomId].users));
        console.log(`🔴 ${username} left room: ${roomId}`);
      }
    }
  });
});

server.listen(4000, () => {
  console.log("🚀 Server running on port 4000");
});

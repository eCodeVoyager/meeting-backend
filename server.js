// const express = require("express");
// const http = require("http");
// const socketIO = require("socket.io");
// const cors = require("cors");
// const path = require("path");

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server, { cors: { origin: "*" } });

// app.use(cors({ origin: "*" }));

// const PORT = process.env.PORT || 5000;

// // Create a users map to keep track of users
// const users = new Map();

// io.on("connection", (socket) => {
//   console.log(`user connected: ${socket.id}`);
//   users.set(socket.id, socket.id);

//   // Emit that a new user has joined to all users
//   io.emit("users:joined", socket.id);

//   socket.on("outgoing:call", (data) => {
//     const { fromOffer, to } = data;
//     console.log(`Outgoing call from ${socket.id} to ${to}`);
//     socket.to(to).emit("incoming:call", { from: socket.id, offer: fromOffer });
//   });

//   socket.on("call:accepted", (data) => {
//     const { answer, to } = data;
//     console.log(`Call accepted by ${socket.id} for ${to}`);
//     socket.to(to).emit("incoming:answer", { from: socket.id, answer });
//   });

//   socket.on("disconnect", () => {
//     console.log(`user disconnected: ${socket.id}`);
//     users.delete(socket.id);
//     io.emit("user:disconnect", socket.id);
//   });
// });

// app.use(express.static(path.resolve("./public")));

// app.get("/", (req, res) => {
//   res.sendFile(path.resolve("./public/index.html"));
// });

// app.get("/users", (req, res) => {
//   return res.json(Array.from(users));
// });

// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// server.js
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });

app.use(cors({ origin: "*" }));

const PORT = process.env.PORT || 5000;

// Create a users map to keep track of users and their rooms
const users = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join:room", ({ username, meetingId }) => {
    socket.join(meetingId);
    users.set(socket.id, { username, meetingId });

    // Notify other users in the room
    socket.to(meetingId).emit("user:joined", { id: socket.id, username });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      users.delete(socket.id);
      socket.to(meetingId).emit("user:disconnected", socket.id);
    });
  });

  socket.on("outgoing:call", (data) => {
    const { fromOffer, to } = data;
    socket.to(to).emit("incoming:call", { from: socket.id, offer: fromOffer });
  });

  socket.on("call:accepted", (data) => {
    const { answer, to } = data;
    socket.to(to).emit("incoming:answer", { from: socket.id, offer: answer });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("./public/index.html"));
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

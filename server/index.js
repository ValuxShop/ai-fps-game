const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, "..")));
app.use("/client", express.static(path.join(__dirname, "..", "client")));

let players = {};

io.on("connection", socket => {
  console.log("Player joined:", socket.id);

  players[socket.id] = {
    id: socket.id,
    x: 0,
    y: 5,
    z: 0,
    health: 100,
    rank: 1000
  };

  socket.emit("init", players);
  socket.broadcast.emit("playerJoined", players[socket.id]);

  socket.on("update", data => {
    if (!players[socket.id]) return;
    players[socket.id] = { ...players[socket.id], ...data };
    socket.broadcast.emit("updatePlayer", players[socket.id]);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playerLeft", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

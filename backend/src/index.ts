import express from "express";
import { Server } from "socket.io";
import http from "http";
import { Socket } from "socket.io";
import { UserManager } from "./managers/UserManager";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  },
});

const userManager = new UserManager();

io.on("connection", (socket: Socket) => {
  const name = socket.handshake.query.name as string;
  console.log(`a user connected: ${name}`);
  userManager.addUser(name || "vineeth", socket);
  socket.on("disconnect", () => {
    console.log(`user disconnected: (${socket.id})`);
    userManager.removeUser(socket.id);
  });
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});

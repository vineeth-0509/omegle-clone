import { Socket } from "socket.io";
import http from "http";
import express, { Request, Response } from "express";
import { Server } from "socket.io";
import { UserManager } from "./managers/UserManager";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  const addUsers = new UserManager();
  // addUsers.addUser(req.params, socket.id)
  app.get("/createRoom", async (req: Request, res: Response) => {
    const params = await req.body();
    const data = addUsers.addUser(params, socket);
  });
});

server.listen(3000, () => {
  console.log("Listenig on 3000");
});

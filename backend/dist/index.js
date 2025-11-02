"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const UserManager_1 = require("./managers/UserManager");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    },
});
const userManager = new UserManager_1.UserManager();
io.on("connection", (socket) => {
    const name = socket.handshake.query.name;
    console.log(`a user connected: ${name}`);
    userManager.addUser(name || "vineeth", socket);
    socket.on("disconnect", () => {
        var _a;
        console.log("disconnected from :", socket.id, (_a = socket.data) === null || _a === void 0 ? void 0 : _a.username);
        userManager.removeUser(socket.id);
    });
});
server.listen(3000, () => {
    console.log("listening on port 3000");
});

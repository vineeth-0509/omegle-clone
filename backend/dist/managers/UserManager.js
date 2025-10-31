"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
let GLOBAL_RANDOM_ID = 1;
class UserManager {
    constructor() {
        this.clearQueue = () => {
            if (this.queue.length < 2) {
                return;
            }
            const user1 = this.users.find((x) => x.socket.id === this.queue.pop());
            const user2 = this.users.find((x) => x.socket.id === this.queue.pop());
            if (!user1 || !user2) {
                return;
            }
            const room = this.roomManager.createRoom(user1, user2);
            this.clearQueue();
        };
        this.initHandler = (socket) => {
            socket.on("offer", ({ sdp, roomId }) => {
                this.roomManager.onOffer(roomId, sdp);
            });
            socket.on("answer", ({ sdp, roomId }) => {
                this.roomManager.onAnswer(roomId, sdp);
            });
        };
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager_1.RoomManager();
    }
    addUser(name, socket) {
        this.users.push({
            name,
            socket,
        });
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue();
        this.initHandler(socket);
    }
    removeUser(socketId) {
        const user = this.users.find(x => x.socket.id === socketId);
        this.users = this.users.filter((x) => x.socket.id !== socketId);
        this.queue = this.queue.filter((x) => x === socketId);
    }
    getUser(socketId) {
        return this.users.find(x => x.socket.id === socketId);
    }
}
exports.UserManager = UserManager;

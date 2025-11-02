"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
class UserManager {
    constructor() {
        this.initHandler = (socket) => {
            socket.on("offer", ({ sdp, roomId, senderSocketId, }) => {
                console.log("offer received from: ", roomId);
                this.roomManager.onOffer(roomId, sdp, senderSocketId);
            });
            socket.on("answer", ({ sdp, roomId, senderSocketId, }) => {
                console.log("answer received");
                this.roomManager.onAnswer(roomId, sdp, senderSocketId);
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
        socket.emit("lobby");
        this.clearQueue();
        this.initHandler(socket);
    }
    removeUser(socketId) {
        //do the delete room logic later, anytime a user leaves the room
        //like one users exists from the room, we have to delete the room.
        // deleting the users from the room and deleting the room.
        this.users = this.users.filter((x) => x.socket.id !== socketId);
        this.queue = this.queue.filter((x) => x !== socketId);
    }
    clearQueue() {
        console.log("Inside clear queues");
        console.log(this.queue.length);
        if (this.queue.length < 2) {
            return;
        }
        console.log(this.users);
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find((x) => x.socket.id === id1);
        const user2 = this.users.find((x) => x.socket.id === id2);
        if (!user1 || !user2) {
            return;
        }
        console.log("creating room");
        const room = this.roomManager.createRoom(user1, user2);
        this.clearQueue();
    }
}
exports.UserManager = UserManager;

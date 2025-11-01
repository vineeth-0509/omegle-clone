"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate();
        this.rooms.set(roomId.toString(), {
            user1,
            user2,
        });
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("send-offer", {
            roomId,
        });
        user2 === null || user2 === void 0 ? void 0 : user2.socket.emit("offer", { roomId });
        return roomId;
    }
    //here it is coming the user1 to the server and the server is sending the offer with the sdp to the user2 based on the roomId
    onOffer(roomId, sdp, senderSocketid) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId,
        });
    }
    //user2 sets the user1 sdp and user2 returns the sdp of the user2 as answer to the server and server forwards it to the user1
    onAnswer(roomId, sdp, senderSocketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;

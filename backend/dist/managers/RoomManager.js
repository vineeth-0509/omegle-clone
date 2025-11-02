"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let GLOBAL_ROOM_ID = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(), {
            user1,
            user2,
        });
        console.log(`created room  ${roomId}`);
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("send-offer", {
            roomId,
        });
        user2 === null || user2 === void 0 ? void 0 : user2.socket.emit("prepare", {
            roomId
        });
        // user2?.socket.emit("send-offer", { roomId });
        return roomId;
    }
    onOffer(roomId, sdp, senderSocketId) {
        const room = this.rooms.get(roomId.toString());
        if (!room) {
            console.log("room not found");
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        console.log(`forwarding onoffer from ${senderSocketId} to ${receivingUser}`);
        receivingUser === null || receivingUser === void 0 ? void 0 : receivingUser.socket.emit("offer", {
            sdp,
            roomId,
        });
    }
    onAnswer(roomId, sdp, senderSocketId) {
        console.log(" [onAnswer] called with:", { roomId, senderSocketId, sdp });
        const room = this.rooms.get(roomId.toString());
        if (!room) {
            console.warn(" [onAnswer] Room not found for roomId:", roomId);
            console.log("Existing rooms:", Array.from(this.rooms.keys()));
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        if (!receivingUser) {
            console.warn("[onAnswer] Receiving user not found!");
            return;
        }
        console.log(` [onAnswer] Forwarding answer from ${senderSocketId} -> ${receivingUser.socket.id}`);
        receivingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
        console.log("[onAnswer] Emitted 'answer' to receiving user.");
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;

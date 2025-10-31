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
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    // removing the user from the room when the user disconnected.
    userLeft(socketId) {
        for (const [roomId, room] of this.rooms.entries()) {
            const { user1, user2 } = room;
            if (room.user1.socket.id === socketId || room.user2.socket.id === socketId) {
                const disconnectedUser = room.user1.socket.id === socketId ? room.user1 : room.user2;
                const remainingUser = room.user1.socket.id === socketId ? room.user2 : room.user1;
                remainingUser === null || remainingUser === void 0 ? void 0 : remainingUser.socket.emit("partner-left", {
                    roomId
                });
                this.rooms.delete(roomId);
                console.log(`Room ${roomId} deleted because ${socketId} disconnected`);
                break;
            }
        }
    }
    onOffer(roomId, sdp) {
        var _a;
        const user2 = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user2;
        user2 === null || user2 === void 0 ? void 0 : user2.socket.emit("offer", {
            sdp,
            roomId
        });
    }
    onAnswer(roomId, sdp) {
        var _a;
        const user1 = (_a = this.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.user1;
        user1 === null || user1 === void 0 ? void 0 : user1.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    generate() {
        return GLOBAL_ROOM_ID++;
    }
}
exports.RoomManager = RoomManager;

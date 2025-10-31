import { User } from "./UserManager";

let GLOBAL_ROOM_ID = 1;

interface Room {
  user1: User;
  user2: User;
}

export class RoomManager {
  private rooms: Map<string, Room>;
  constructor() {
    this.rooms = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate();
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });
    user1?.socket.emit("send-offer", {
      roomId,
    });
    user2?.socket.emit("offer", {roomId});
    return roomId;
  }

  //here it is coming the user1 to the server and the server is sending the offer with the sdp to the user2 based on the roomId
  onOffer(roomId: string, sdp: string, senderSocketid: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
    receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  //user2 sets the user1 sdp and user2 returns the sdp of the user2 as answer to the server and server forwards it to the user1
  onAnswer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user1 : room.user2;
    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }
  generate() {
    return GLOBAL_ROOM_ID++;
  }
}

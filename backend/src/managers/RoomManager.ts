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
    const roomId = this.generate().toString();
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });
    console.log(`created room  ${roomId}`)
    user1?.socket.emit("send-offer", {
      roomId,
    });
    user2?.socket.emit("prepare", {
      roomId
    })
    // user2?.socket.emit("send-offer", { roomId });
    return roomId;
  }

  
  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.rooms.get(roomId.toString());
    if (!room) {
      console.log("room not found")
      return;
    }
    const receivingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
      console.log(`forwarding onoffer from ${senderSocketId} to ${receivingUser}`)
      receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

 onAnswer(roomId: string, sdp: string, senderSocketId: string) {
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

  console.log(
    ` [onAnswer] Forwarding answer from ${senderSocketId} -> ${receivingUser.socket.id}`
  );
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

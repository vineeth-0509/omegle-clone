import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("names");
  const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteMediaTrack, setRemoteMediaTrack] =
    useState<MediaStreamTrack | null>(null);
 
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
 

  useEffect(() => {
    if (!name) {
      return;
    }
    const socket = io(URL, {
      query: {
        name,
      },
    });
    socket.on("send-offer", async ({ roomId }) => {
      alert("send offer please");
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      const sdp = await pc.createOffer();
      socket.emit("offer", {
        sdp, // session description protocol. encoding, ip and port for receiving the video and the audio
        roomId,
        senderSocketId: socket.id,
      });
    });

    socket.on("prepare", ({ roomId }) => {
      alert("you are user2 waiting for an offer...");
    });
    socket.on("offer", async ({ roomId, offer }) => {
      setLobby(false);
      alert("send answer please");
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription({ sdp: offer, type: "offer" });
      const sdp = await pc.createAnswer();
      setReceivingPc(pc);
      pc.ontrack = ({ track, type }) => {
        if (type == "audio") {
          setRemoteAudioTrack(track);
        } else {
          setRemoteAudioTrack(track);
        }
      };
      socket.emit("answer", {
        sdp: sdp,
        roomId,
        senderSocketId: socket.id,
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      console.log("answer received from server:", { roomId, answer });
      alert("connection done");
      setLobby(false);
    });

    socket.on("lobby", () => {
      setLobby(true);
    });
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [name]);

  if (lobby) {
    return <div>waiting you for the someone to connect</div>;
  }

  return (
    <div>
      <video width="400" height="400"></video>
      <video width="400" height="400"></video>
    </div>
  );
};

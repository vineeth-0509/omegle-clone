import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import io, { Socket } from "socket.io-client";
export const Room = () => {
  const URL = "http://localhost:3000";
  const [searchParams, setSearchParams] = useSearchParams();
  const [socket, setSocket] = useState<null | Socket>(null);
  const name = searchParams.get("names");

  useEffect(() => {
    if (!name) {
      return;
    }
    const socket = io(URL, {
      query: {
        name,
      },
    });
    console.log();
    socket.on("send-offer", async ({ roomId }) => {
      alert("send offer please");
      console.log("sending offer");
      const pc = new RTCPeerConnection();
      pc.onicecandidate = async ((e)=>{
        console.log("receing ice-candidates locally");
        
      })
      socket.emit("offer", {
        sdp: "",
        roomId,
      });
    });
    socket.on("offer", ({ roomId, offer }) => {
      alert("send answer please");
      socket.emit("answer", {
        sdp: "",
        roomId,
      });
    });

    socket.on("answer", ({ roomId, answer }) => {
      alert("connection done");
    });
    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, [name]);
  return <div>Hi {name}</div>;
};

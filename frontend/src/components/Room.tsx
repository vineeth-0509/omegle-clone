// import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import { Socket, io } from "socket.io-client";

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// const URL = "http://localhost:3000";
// export const Room = () => {
//   const [searchParams] = useSearchParams();
//   const name = searchParams.get("names");
//   const socketRef = useRef<Socket | null>(null);
//   const [lobby, setLobby] = useState(true);

//   useEffect(() => {
//     //logic to init the user
//     if (!name) {
//       return;
//     }
//     if (!socketRef.current) {
//       const socket = io(URL, { query: { name } });
//       socketRef.current = socket;
//       console.log("socket connected");

//       socket.on("send-offer", ({ roomId }) => {
//         alert("send offer please");
//         setLobby(false);
//         socket.emit("offer", {
//           sdp: "",
//           roomId,
//         });
//       });

//       socket.on("offer", ({ roomId, offer }) => {
//         alert("send answer please");
//         setLobby(false);
//         socket.emit("answer", {
//           roomId,
//           sdp: "",
//         });
//       });

//       socket.on("answer", ({ roomId, answer }) => {
//         console.log("connection done for room:", roomId);
//         setLobby(false);
//         alert("connection done");
//       });

//       socket.on("lobby", () => {
//         setLobby(true);
//       });

//       socket.on("disconnect", () => {
//         console.log("socket disconnected");
//       });
//     }
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [name]);

//   if (lobby) {
//     return <div>waiting to connect you to someone</div>;
//   }
//   return (
//     <div>
//       Hii {name}
//       <video width={400} height={400} />
//       <video width={400} height={400} />
//     </div>
//   );
// };

export const Room = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get("names");

  useEffect(() => {}, [name]);
  return <div>Hi {name}</div>;
};

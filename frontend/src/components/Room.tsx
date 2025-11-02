// import { useEffect, useRef, useState } from "react";
// import { useSearchParams } from "react-router-dom";

// import { io, Socket } from "socket.io-client";

// const URL = "http://localhost:3000";

// export const Room = ({
//   name,
//   localAudioTrack,
//   localMediaTrack,
// }: {
//   name: string;
//   localAudioTrack: MediaStreamTrack | null;
//   localMediaTrack: MediaStreamTrack | null;
// }) => {
//   const [searchParams] = useSearchParams();

//   const [socket, setSocket] = useState<null | Socket>(null);
//   const [lobby, setLobby] = useState(true);
//   const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
//   const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
//     null
//   );
//   const [remoteMediaTrack, setRemoteMediaTrack] =
//     useState<MediaStreamTrack | null>(null);

//   const [remoteAudioTrack, setRemoteAudioTrack] =
//     useState<MediaStreamTrack | null>(null);
//   const [remoteMediaStream, setRemoteMediaStream] =
//     useState<MediaStream | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   useEffect(() => {
//     if (!name) {
//       return;
//     }
//     const socket = io(URL);
//     socket.on("send-offer", async ({ roomId }) => {
//       alert("send offer please");
//       setLobby(false);
//       const pc = new RTCPeerConnection();
//       setSendingPc(pc);
//       if (localAudioTrack) {
//         console.error("added track");
//         pc.addTrack(localAudioTrack);
//       }
//       if (localMediaTrack) {
//         console.error("addded track");
//         pc.addTrack(localMediaTrack);
//       }

//       pc.onicecandidate = async () => {
//         const sdp = await pc.createOffer();
//         socket.emit("offer", {
//           sdp, // session description protocol. encoding, ip and port for receiving the video and the audio
//           roomId,
//           senderSocketId: socket.id,
//         });
//       };
//     });

//     socket.on("prepare", ({ roomId }) => {
//       alert("you are user2 waiting for an offer...");
//     });

//     // socket.on("offer", async ({ roomId, offer }) => {
//     //   setLobby(false);
//     //   alert("send answer please");
//     //   const pc = new RTCPeerConnection();
//     //   await pc.setRemoteDescription({ sdp: offer, type: "offer" });
//     //   const sdp = pc.createAnswer();
//     //   const stream = new MediaStream();
//     //   if (remoteVideoRef.current) {
//     //     remoteVideoRef.current.srcObject = stream;
//     //   }
//     //   setRemoteMediaStream(stream);

//     //   setReceivingPc(pc);
//     //   pc.ontrack = (e) => {
//     //     alert("ontrack");
//     //   };

//     //   socket.emit("answer", {
//     //     roomId,
//     //     sdp: sdp,
//     //   });

//     //   setTimeout(() => {
//     //     const track1 = pc.getTransceivers()[0].receiver.track;
//     //     const track2 = pc.getTransceivers()[1].receiver.track;
//     //     console.log(track1);
//     //     if (track1.kind === "video") {
//     //       setRemoteAudioTrack(track2);
//     //       setRemoteMediaTrack(track1);
//     //     } else {
//     //       setRemoteAudioTrack(track1);
//     //       setRemoteMediaTrack(track2);
//     //     }
//     //     // @ts-ignore
//     //     remoteVideoRef.current.srcObject.addTrack(track1);

//     //     //@ts-ignore
//     //     remoteVideoRef.current.srcObject.addTrack(track2);

//     //     // @ts-ignore
//     //     remoteVideoRef.current.play();
//     //   }, 5000);
//     // });

//     socket.on("offer", async ({ roomId, sdp }) => {
//       setLobby(false);
//       const pc = new RTCPeerConnection();
//       const remoteStream = new MediaStream();
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = remoteStream;
//       }
//       pc.ontrack = (event) => {
//         event.streams[0].getTracks().forEach((track) => {
//           remoteStream.addTrack(track);
//         });
//       };
//       await pc.setRemoteDescription(sdp);
//       const offer = await pc.createAnswer();
//       await pc.setLocalDescription(offer);
//       socket.emit("answer", { roomId, offer });
//     });

//     socket.on("answer", ({ roomId, sdp }) => {
//      setLobby(false);
//      setSendingPc(pc => {
//       pc?.setRemoteDescription({
//         type:"answer",
//         sdp: sdp
//       })
//       return pc;
//      })
//     });

//     socket.on("lobby", () => {
//       setLobby(true);
//     });
//     setSocket(socket);

//     return () => {
//       socket.disconnect();
//     };
//   }, [name]);

//   useEffect(() => {
//     if (localVideoRef.current) {
//       if (localMediaTrack) {
//         localVideoRef.current.srcObject = new MediaStream([localMediaTrack]);
//         localVideoRef.current.play();
//       }
//     }
//   }, [localVideoRef]);
//   return (
//     <div>
//       <video autoPlay width="400" height="400" ref={localVideoRef}></video>
//       {lobby ? "Waiting to connect you to someone" : null}
//       <video autoPlay width="400" height="400" ref={remoteVideoRef}></video>
//     </div>
//   );
// };



import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = ({
  name,
  localAudioTrack,
  localMediaTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localMediaTrack: MediaStreamTrack | null;
}) => {
  const [searchParams] = useSearchParams();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState(true);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  
  useEffect(() => {
    if (!name) return;

    const socket = io(URL, { transports: ["websocket"] });
    setSocket(socket);

    const peerConnection = new RTCPeerConnection();
    setPc(peerConnection);

    if (localMediaTrack) peerConnection.addTrack(localMediaTrack);
    if (localAudioTrack) peerConnection.addTrack(localAudioTrack);

   
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          roomId: searchParams.get("roomId"),
        });
      }
    };

   
    const remoteStream = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }

    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    socket.on("send-offer", async ({ roomId }) => {
      setLobby(false);
      console.log("Creating offer...");

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit("offer", {
        roomId,
        sdp: offer,
        senderSocketId: socket.id,
      });
    });

    socket.on("offer", async ({ roomId, sdp }) => {
      setLobby(false);
      console.log("Received offer, creating answer...");

      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit("answer", { roomId, sdp: answer });
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("Received answer");
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding received ICE candidate", err);
      }
    });

    socket.on("lobby", () => setLobby(true));

    return () => {
      socket.disconnect();
      peerConnection.close();
    };
  }, [name, localAudioTrack, localMediaTrack]);

  // Display local video
  useEffect(() => {
    if (localVideoRef.current && localMediaTrack) {
      const stream = new MediaStream([localMediaTrack]);
      localVideoRef.current.srcObject = stream;
    }
  }, [localMediaTrack]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-semibold">
        {lobby ? "Waiting to connect..." : "Connected!"}
      </h2>

      <div className="flex gap-4">
        <div>
          <h3 className="text-sm text-gray-500">You</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            width="400"
            height="400"
            className="rounded-xl border shadow"
          ></video>
        </div>

        <div>
          <h3 className="text-sm text-gray-500">Remote</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            width="400"
            height="400"
            className="rounded-xl border shadow"
          ></video>
        </div>
      </div>
    </div>
  );
};

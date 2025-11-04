/*
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
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [messages, setMessages] = useState<{ text: string; self: boolean }[]>(
    []
  );
  const [input, setInput] = useState("");
  useEffect(() => {
    if (!name) {
      return;
    }
    const socket = io(URL);
    socket.on("send-offer", async ({ roomId }) => {
      roomIdRef.current = roomId;
      console.log("creating offer for room:", roomId);
      setLobby(false);
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      setSendingPc(pc);

      if (localAudioTrack) {
        console.log("adding local audio track");
        pc.addTrack(localAudioTrack);
      }
      if (localMediaTrack) {
        console.log("adding the local media track");
        pc.addTrack(localMediaTrack);
      }

      pc.ontrack = (event) => {
        console.log("received remote track:", event.track.kind);
        const remoteStream = event.streams[0];
        if (remoteStream && remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(console.error);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("sending ice candidate");
          socket.emit("add-ice-candidate", {
            candidate: event.candidate,
            roomId,
            senderSocketId: socket.id,
          });
        }
      };

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("sending offer sdp");
        socket.emit("offer", {
          sdp: pc.localDescription,
          roomId,
          senderSocketId: socket.id,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
      }

      // pc.onicecandidate = async (event) => {
      //   // if (event.candidate) return;
      //   // const sdp = await pc.createOffer();
      //   // await pc.setLocalDescription(sdp);
      //   // socket.emit("offer", {
      //   //   sdp, // session description protocol. encoding, ip and port for receiving the video and the audio
      //   //   roomId,
      //   //   senderSocketId: socket.id,
      //   // });
      //   if(event.candidate){
      //   pc.addIceCandidate(event.candidate)
      //   }
      // };
    });

    socket.on("prepare", ({ roomId }) => {
      alert("you are user2 waiting for an offer...");
    });

    // socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
    //   try {
    //     roomIdRef.current = roomId;
    //     console.log("roomId set to:", roomId);
    //     setLobby(false);
    //     const pc = new RTCPeerConnection({
    //       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    //     });
    //     setReceivingPc(pc);

    //     const remoteStream = new MediaStream();
    //     setRemoteMediaStream(remoteStream);

    //     if (remoteVideoRef.current) {
    //       remoteVideoRef.current.srcObject = remoteStream;
    //     }

    //     pc.ontrack = (event) => {
    //       event.streams[0]?.getTracks().forEach((track) => {
    //         remoteStream.addTrack(track);
    //       });
    //       if (remoteVideoRef.current) {
    //         remoteVideoRef.current.play().catch((err) => {
    //           console.error("Error playing remote video:", err);
    //         });
    //       }
    //     };

    //     pc.onicecandidate = (event) => {
    //       if (event.candidate) {
    //         socket.emit("add-ice-candidate", {
    //           roomId,
    //           candidate: event.candidate,
    //           senderSocketId: socket.id,
    //         });
    //       }
    //     };

    //     await pc.setRemoteDescription(new RTCSessionDescription(remoteSdp));
    //     const answer = await pc.createAnswer();
    //     await pc.setLocalDescription(answer);
    //     socket.emit("answer", {
    //       roomId,
    //       sdp: pc.localDescription,
    //       senderSocketId: socket.id,
    //     });
    //   } catch (error) {
    //     console.error("Error handling offer:", error);
    //   }
    // });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      try {
        roomIdRef.current = roomId;
        console.log("received offer, creating answer for room:", roomId);
        setLobby(false);

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        setReceivingPc(pc);

        //handling the localTracks
        if (localAudioTrack) {
          console.log("Adding local audio track to answer");
          pc.addTrack(localAudioTrack);
        }
        if (localMediaTrack) {
          console.log("Adding local video track to answer");
          pc.addTrack(localMediaTrack);
        }

        // handling the remote tracks:
        pc.ontrack = (event) => {
          console.log("Received remote track in answer:", event.track.kind);
          const remoteStream = event.streams[0];
          if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(console.error);
          }
        };

        // handling ice-candidate
        pc.onicecandidate = (event) =>{
          if(event.candidate){
            console.log("Sending ICE candidate from answer");
            socket.emit("add-ice-candidate", {
              candidate: event.candidate,
              roomId,
              senderSocketId: socket.id
            })
          }
        }

        await pc.setRemoteDescription(remoteSdp);
        console.log("Remote description set");

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("setting the sdp");
        socket.emit("answer", {
          roomId,
          sdp: pc.localDescription,
          senderSocketId: socket.id
        });
      } catch (error) {
        console.log("error is :", error);
      }
    });

    // socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
    //   setLobby(false);
    //   const pc = new RTCPeerConnection();
    //   pc.setRemoteDescription(remoteSdp);
    //   const sdp = await pc.createAnswer();
    //   pc.setLocalDescription(sdp);
    //   const stream = new MediaStream();
    //   if(!remoteVideoRef.current){
    //     remoteVideoRef.current.srcObject = stream;
    //   }
    //   setRemoteMediaStream(stream);
    //   setReceivingPc(pc);

    //   pc.onicecandidate = async (e) =>{
    //     if(e.candidate){
    //       socket.emit("add-ice-candidate", {
    //         candidate: e.candidate
    //       })
    //     }
    //   }
    //   pc.ontrack = (({track, type})=>{
    //     if(type === 'audio'){
    //       //@ts-ignore
    //       remoteVideoRef.current.srcObject.addTrack(track);
    //     }else {
    //       //@ts-ignore
    //       remoteVideoRef.current.srcObject.addTrack(track);
    //     }
    //     //@ts-ignore
    //     remoteVideoRef.current.play();
    //   })
    //   socket.emit("answer", {
    //     roomId,
    //     sdp: sdp
    //   })
    // });

    socket.on("answer", async ({roomId, sdp: remoteSdp})=>{
      console.log("Received answer for room: ", roomId);
      if(sendingPc){
        try {
          await sendingPc.setRemoteDescription(remoteSdp);
          console.log("remote descritpion set on sending pc");
        } catch (error) {
          console.log("Error setting remote description: ", error);
        }
      }
    })

    // socket.on("answer", async ({ roomId, sdp: remoteSdp }) => {
    //   // setLobby(false);
    //   // setSendingPc((pc) => {
    //   //   pc?.setRemoteDescription(remoteSdp);
    //   //   return pc;
    //   // });
    //   if (sendingPc) {
    //     await sendingPc.setRemoteDescription(
    //       new RTCSessionDescription(remoteSdp)
    //     );
    //   }
    // });

    socket.on("room-ready", ({ roomId }) => {
      roomIdRef.current = roomId;
      console.log("room ready for chat:", roomId);
    });

    socket.on("add-ice-candidate", async ({candidate, roomId}) => {
      try {
        console.log("Received ice candidate");
        const iceCandidate = new RTCIceCandidate(candidate);
        if(sendingPc){
          await sendingPc.addIceCandidate(iceCandidate);
          console.log("Added ice candidates to sendingPc");
        }
        if(receivingPc){
          await receivingPc.addIceCandidate(iceCandidate);
          console.log("Added ice candidate to receiving pc");
        }
      } catch (error) {
        console.error("Error in adding ice candidates:", error);
      }
    })
    // socket?.on("add-ice-candidate", async ({ candidate }) => {
    //   try {
    //     if (sendingPc) {
    //       await sendingPc.addIceCandidate(new RTCIceCandidate(candidate));
    //     } else if (receivingPc) {
    //       await receivingPc.addIceCandidate(new RTCIceCandidate(candidate));
    //     }
    //   } catch (error) {
    //     console.error("Error adding ICE candidate:", error);
    //   }
    // });

    socket.on("lobby", () => {
      setLobby(true);
    });
    setSocket(socket);

    socket.on("lobby", () => setLobby(true));
    return () => {
      if(sendingPc){
        sendingPc.close();
        console.log("Sending pc closed");
      }
      if(receivingPc){
        receivingPc.close();
        console.log("Receiving pc closed");
      }
      if(socket){
        socket.disconnect();
        console.log("socket disconnected");
      }
    };
  }, [sendingPc,receivingPc, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = ({ message }: { message: string }) => {
      console.log("Received message in UI:", message);
      setMessages((prev) => [...prev, { text: message, self: false }]);
    };
    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket]);

  const sendMessage = () => {
    if (!roomIdRef.current) {
      console.warn("Room not ready yet, roomId is null");
      return;
    }
    if (!socket) {
      console.warn("Socket not connected");
      return;
    }

    console.log(
      "Sending message to room:",
      roomIdRef.current,
      "Message:",
      input
    );

    socket.emit("chat-message", {
      roomId: roomIdRef.current,
      message: input,
      senderSocketId: socket.id,
    });

    setMessages((prev) => [...prev, { text: input, self: true }]);
    setInput("");
  };

  useEffect(() => {
    if (localVideoRef.current && localMediaTrack) {
      const stream = new MediaStream([localMediaTrack]);
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();
    }
  }, [localMediaTrack]);

  return (
    <>
      <div className="flex flex-col items-center bg-gray-900 text-white min-h-screen p-6">
        <div className="flex gap-4">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            width="400"
            height="400"
            className="rounded-xl"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            width="400"
            height="400"
            className="rounded-xl"
          />
        </div>

        {lobby && (
          <p className="text-gray-400 mt-4">
            Waiting to connect you to someone...
          </p>
        )}

        <div className="w-full max-w-md mt-6 bg-gray-800 rounded-xl p-4 shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold mb-2 text-center">Chat Room</h2>
          <div className="flex-1 overflow-y-auto mb-3 space-y-2 h-64">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xs p-2 rounded-xl ${
                  msg.self ? "bg-blue-600 ml-auto" : "bg-gray-700 mr-auto"
                }`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex">
            <input
              className="flex-1 bg-gray-700 p-2 rounded-lg text-white outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="ml-3 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
*/

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

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
  const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const roomIdRef = useRef<string | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [messages, setMessages] = useState<{ text: string; self: boolean }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [connectedUser, setConnectedUser] = useState<string | null>(null);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (localAudioTrack) pc.addTrack(localAudioTrack);
    if (localMediaTrack) pc.addTrack(localMediaTrack);

    pc.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      const remoteStream = event.streams[0];
      if (remoteStream && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch(console.error);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && roomIdRef.current && socket) {
        socket.emit("add-ice-candidate", {
          candidate: event.candidate,
          roomId: roomIdRef.current,
          senderSocketId: socket.id,
        });
      }
    };

    return pc;
  };

  const cleanupConnection = () => {
    if (sendingPc) {
      sendingPc.close();
      console.log("Sending PC closed");
    }
    if (receivingPc) {
      receivingPc.close();
      console.log("Receiving PC closed");
    }
    setSendingPc(null);
    setReceivingPc(null);
    setMessages([]);
    setConnectedUser(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const handleNext = () => {
    if (socket && roomIdRef.current) {
      socket.emit("next-user", { roomId: roomIdRef.current });
    }
    cleanupConnection();
    setLobby(true);
  };

  useEffect(()=>{
    if(!name) return;
    const socket = io(URL);
    setSocket(socket);

    socket.on('send-offer', async ({roomId}) =>{
      roomIdRef.current = roomId;
      console.log("Creating offer for room:", roomId);
      setLobby(false);
      setConnectedUser("stranger");

      const pc = createPeerConnection();
      setSendingPc(pc);
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log("sending offer sdp");
        socket.emit("offer", {
          roomId,
          sdp: pc.localDescription,
          senderSocketId: socket.id
        })
      } catch (error) {
        console.log("Error in sending offer:", error);
      }
    })

    socket.on("offer", async ({roomId, sdp: remoteSdp}) => {
      try {
        roomIdRef.current = roomId;
        console.log("Receiving offer, creating answer for room:", roomId);
        setLobby(false);
        setConnectedUser("stranger");

        const pc = createPeerConnection();
        setReceivingPc(pc);
        await pc.setRemoteDescription(remoteSdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("sending answer sdp");
        socket.emit("answer", {
          roomId,
          sdp: pc.localDescription,
          senderSocketId: socket.id 
        })
      } catch (error) {
        console.error("Error handling offer: ", error);
      }
    })

    socket.on("answer", async ({roomId, sdp:remoteSdp}) => {
      console.log("receiving answer for room: ", roomId);
      if(sendingPc){
        try {
          await sendingPc.setRemoteDescription(remoteSdp);
          console.log("Remote description set on sending pc");
        } catch (error) {
          console.error("Error setting remote descripiton:", error);
        }
      }
    })

    socket.on("add-ice-candidate", async({candidate, roomId}) => {
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        if(sendingPc){
          await sendingPc.addIceCandidate(iceCandidate);
        }
        if(receivingPc){
          await receivingPc.addIceCandidate(iceCandidate);
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    })

    socket.on("room-ready", ({roomId}) =>{
      roomIdRef.current = roomId;
      console.log("Room ready for chat", roomId)
    })

    socket.on("lobby", () => {
      cleanupConnection();
      setLobby(true);
    })

    socket.on("user-disconnected", () =>{
      alert("stranger disconnected");
      cleanupConnection();
      setLobby(true);
    })

    return ()=>{
      cleanupConnection();
      socket.disconnect();
    }
  },[name]);


  useEffect(()=>{
    if(localVideoRef.current && localMediaTrack){
      const stream = new MediaStream([localMediaTrack]);
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();
    }
  },[localMediaTrack]);

  useEffect(() =>{
    if(!socket) return;
    const handleReceiveMessage = ({message}: {message: string}) =>{
      console.log("Received message in UI", message);
      setMessages((prev) => [...prev, {text:message, self: false}])
    }
    socket.on("receive-message", handleReceiveMessage);
    return () => {
      socket?.off("receive-message", handleReceiveMessage);
    }
  },[socket]);


  const sendMessage = () => {
    if(!roomIdRef.current || !socket || !input.trim()){
      return;
    }
    console.log("sending message to room:", roomIdRef.current, "Message:", input);
    socket.emit("chat-message", {
      roomId: roomIdRef.current,
      message: input,
      senderSocketId: socket.id
    })
    setMessages((prev) => [...prev, {text:input, self: true}]);
    setInput("");
  }

  return(
     <div className="flex flex-col items-center bg-gray-900 text-white min-h-screen p-6">
    
      <div className="w-full max-w-6xl mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Video Chat</h1>
          <div className="flex gap-4">
            <span className="bg-green-600 px-3 py-1 rounded-full">
              {connectedUser || "Connecting..."}
            </span>
            <button
              onClick={handleNext}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

     
      <div className="flex gap-6 w-full max-w-6xl">
       
        <div className="flex-1">
          <div className="bg-black rounded-xl overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-64 object-cover"
            />
            <div className="p-3 bg-gray-800 text-center">
              <span className="text-sm text-gray-300">You</span>
            </div>
          </div>
        </div>

       
        <div className="flex-1">
          <div className="bg-black rounded-xl overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-64 object-cover bg-gray-800"
            />
            <div className="p-3 bg-gray-800 text-center">
              <span className="text-sm text-gray-300">
                {connectedUser || "Waiting for stranger..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      
      {lobby && (
        <div className="mt-8 text-center">
          <div className="text-xl text-gray-400 mb-4">
            🔍 Looking for someone to connect with...
          </div>
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto"></div>
          </div>
        </div>
      )}

     
      {!lobby && (
        <div className="w-full max-w-2xl mt-8 bg-gray-800 rounded-xl p-4 shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-center">Chat</h2>
          
          <div className="flex-1 overflow-y-auto mb-4 space-y-2 h-64 p-2 bg-gray-900 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                Start a conversation...
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-xs p-3 rounded-xl ${
                    msg.self 
                      ? "bg-blue-600 ml-auto" 
                      : "bg-gray-700 mr-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              className="flex-1 bg-gray-700 p-3 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
};

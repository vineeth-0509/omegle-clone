import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

type Props = {};

const Landing = (props: Props) => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localMediaTrack, setLocalMediaTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const videoTracks = stream.getVideoTracks()[0];
    const audioTracks = stream.getAudioTracks()[0];
    setLocalAudioTrack(audioTracks);
    setLocalMediaTrack(videoTracks);
    if (!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTracks]);
    videoRef.current.play();
  };

  useEffect(() => {
    getCam();
  }, [videoRef]);

  return (
    <div>
      <video autoPlay ref={videoRef} height={400} width={400}>
        {" "}
      </video>
      <input
        type="text"
        onChange={(e) => {
          setName(e.target.value);
        }}
      />

      <Link to={`/room/?names=${name}`}>Join</Link>
    </div>
  );
};

export default Landing;

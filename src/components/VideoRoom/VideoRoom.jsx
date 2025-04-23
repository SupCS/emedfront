import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checkCallAccess } from "../../api/callApi";
import { socket } from "../../api/socket";
import { toast } from "react-toastify";
import styles from "./VideoRoom.module.css";
import cameraIcon from "../../assets/camera.svg";
import cameraOffIcon from "../../assets/camera-off.svg";
import microphoneIcon from "../../assets/microphone.svg";
import microphoneOffIcon from "../../assets/microphone-off.svg";
import exitIcon from "../../assets/exit.svg";

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const createSilentAudioTrack = () => {
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: false });
};

const createBlackVideoTrack = ({ width = 640, height = 480 } = {}) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);
  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];
  return Object.assign(track, { enabled: false });
};

const VideoRoom = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);
  const hasSentRenegotiationRef = useRef(false);
  const [focused, setFocused] = useState("remote");

  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await checkCallAccess(callId);
        setCurrentRole(res.role);
      } catch (err) {
        alert("Доступ до кімнати заборонено.");
        navigate("/");
      }
    };
    checkAccess();
  }, [callId, navigate]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = true;
      remoteVideoRef.current.volume = 0;

      setTimeout(() => {
        remoteVideoRef.current.play().catch(() => {});
      }, 0);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!currentRole) return;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;
    const stream = new MediaStream();
    setRemoteStream(stream);

    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    const start = async () => {
      let audioTrack, videoTrack;

      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioTrack = audioStream.getAudioTracks()[0];
      } catch (e) {
        console.warn("Не вдалося отримати аудіо:", e);
        audioTrack = createSilentAudioTrack();
      }

      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoTrack = videoStream.getVideoTracks()[0];
      } catch (e) {
        console.warn("Не вдалося отримати відео:", e);
        videoTrack = createBlackVideoTrack();
      }

      const local = new MediaStream([audioTrack, videoTrack].filter(Boolean));
      setLocalStream(local);

      local.getTracks().forEach((track) => {
        pc.addTrack(track, local);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = local;
      }

      socket.emit("join-room", { callId });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { callId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      const incomingStream = event.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = incomingStream;
        remoteVideoRef.current.muted = true;
        remoteVideoRef.current.volume = 0;
        setTimeout(() => remoteVideoRef.current.play().catch(() => {}), 0);
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = incomingStream;
        remoteAudioRef.current.muted = false;
        remoteAudioRef.current.volume = 1;
        setTimeout(() => remoteAudioRef.current.play().catch(() => {}), 0);
      }
      setRemoteStream(incomingStream);
      setIsRemoteConnected(true);
    };

    socket.on("user-joined", async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { callId, offer });
    });

    socket.on("user-left", () => {
      toast.info("Опонент залишив кімнату");
      remoteStream
        ?.getTracks()
        .forEach((track) => remoteStream.removeTrack(track));
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
      setIsRemoteConnected(false);
    });

    socket.on("offer", async ({ offer }) => {
      let pc = pcRef.current;
      if (pc.signalingState !== "stable") {
        try {
          pc.close();
        } catch (err) {
          console.error("Не вдалося закрити старий pc:", err);
        }
        pc = new RTCPeerConnection(servers);
        pcRef.current = pc;
        localStream
          ?.getTracks()
          .forEach((track) => pc.addTrack(track, localStream));
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              callId,
              candidate: event.candidate,
            });
          }
        };
        pc.ontrack = (event) => {
          const incomingStream = event.streams[0];
          setRemoteStream(incomingStream);
          setIsRemoteConnected(true);
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = incomingStream;
          if (remoteAudioRef.current)
            remoteAudioRef.current.srcObject = incomingStream;
        };
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { callId, answer });
        if (!hasSentRenegotiationRef.current) {
          hasSentRenegotiationRef.current = true;
          setTimeout(async () => {
            if (!pcRef.current) return;
            const renegotiationOffer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(renegotiationOffer);
            socket.emit("offer", { callId, offer: renegotiationOffer });
          }, 1000);
        }
      } catch (err) {
        console.error("Помилка обробки offer:", err);
      }
    });

    socket.on("answer", async ({ answer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Помилка додавання ICE:", err);
      }
    });

    start();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      pc.close();
      socket.emit("leave-room", { callId });
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [currentRole, callId]);

  useEffect(() => {
    if (!remoteStream) return;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = true;
      remoteVideoRef.current.volume = 0;
      setTimeout(() => {
        remoteVideoRef.current.play().catch(() => {});
      }, 0);
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1;
      setTimeout(() => {
        remoteAudioRef.current.play().catch(() => {});
      }, 0);
    }
  }, [remoteStream]);

  const leaveRoom = () => navigate("/");

  const toggleMic = () => {
    const track = localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicEnabled(track.enabled);
    }
  };

  const toggleCamera = () => {
    const track = localStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraEnabled(track.enabled);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Відеоконференція</h2>
      <p>
        Ви приєднались до кімнати: <strong>{callId}</strong>
      </p>

      <div className={styles.videoContainer}>
        <div
          className={
            focused === "local"
              ? styles.focusedVideoWrapper
              : focused === "remote"
              ? styles.miniVideoWrapper
              : styles.equalVideo
          }
          onClick={() => setFocused(focused === "local" ? null : "local")}
        >
          <p className={styles.videoLabel}>Ви ({currentRole})</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={styles.video}
          />
        </div>

        <div
          className={
            focused === "remote"
              ? styles.focusedVideoWrapper
              : focused === "local"
              ? styles.miniVideoWrapper
              : styles.equalVideo
          }
          onClick={() => setFocused(focused === "remote" ? null : "remote")}
        >
          <p className={styles.videoLabel}>Опонент</p>
          {isRemoteConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className={styles.video}
            />
          ) : (
            <div className={styles.placeholder}>
              Очікуємо підключення опонента...
            </div>
          )}
        </div>
      </div>

      <audio ref={remoteAudioRef} autoPlay />

      <div className={styles.controls}>
        <button onClick={toggleMic}>
          <img
            src={micEnabled ? microphoneIcon : microphoneOffIcon}
            alt={micEnabled ? "Мікрофон увімкнено" : "Мікрофон вимкнено"}
            className={styles.icon}
          />
        </button>
        <button onClick={toggleCamera}>
          <img
            src={cameraEnabled ? cameraIcon : cameraOffIcon}
            alt={cameraEnabled ? "Камера увімкнена" : "Камера вимкнена"}
            className={styles.icon}
          />
        </button>
        <button onClick={leaveRoom} className={styles.leaveButton}>
          <img className={styles.icon} src={exitIcon} alt="Вийти з кімнати" />
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checkCallAccess } from "../../api/callApi";
import { socket } from "../../api/socket";
import { toast } from "react-toastify";
import styles from "./VideoRoom.module.css";

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoRoom = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const pcRef = useRef(null);
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await checkCallAccess(callId);
        setCurrentRole(res.role);
        console.log("✅ Доступ підтверджено. Роль:", res.role);
      } catch (err) {
        alert("Доступ до кімнати заборонено.");
        navigate("/");
      }
    };
    checkAccess();
  }, [callId, navigate]);

  useEffect(() => {
    if (!currentRole) return;

    const pc = new RTCPeerConnection(servers);
    pcRef.current = pc;
    const stream = new MediaStream();
    setRemoteStream(stream);

    const start = async () => {
      try {
        const local = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(local);
        local.getTracks().forEach((track) => {
          console.log(`🎥 Додаємо локальний трек: ${track.kind}`);
          pc.addTrack(track, local);
        });

        localVideoRef.current.srcObject = local;
        console.log("🎬 Локальний потік встановлено");
      } catch (err) {
        console.error("🚫 Помилка доступу до камери/мікрофона:", err);
      }

      socket.emit("join-room", { callId });
      console.log(`🚪 Відправлено join-room → callId: ${callId}`);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 Відправляємо ICE кандидат:", event.candidate);
        socket.emit("ice-candidate", { callId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log("📥 Отримано remote track:", event.track.kind);
      event.streams[0].getTracks().forEach((track) => {
        stream.addTrack(track);
      });
      remoteVideoRef.current.srcObject = stream;
      setIsRemoteConnected(true);
    };

    socket.on("user-joined", async ({ socketId }) => {
      console.log("👤 Користувач приєднався:", socketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("📨 Відправляємо offer:", offer);
      socket.emit("offer", { callId, offer });
    });

    socket.on("user-left", ({ socketId }) => {
      console.log("🚪 Користувач вийшов з кімнати:", socketId);
      toast.info("Опонент залишив кімнату");

      remoteStream?.getTracks().forEach((track) => {
        remoteStream.removeTrack(track);
      });
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }

      setIsRemoteConnected(false);
    });
    socket.on("offer", async ({ offer, from }) => {
      console.log("📩 Отримано offer від:", from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log("📨 Відправляємо answer:", answer);
      socket.emit("answer", { callId, answer });
    });

    socket.on("answer", async ({ answer }) => {
      console.log("📩 Отримано answer");
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        console.log("📬 Отримано ICE кандидат:", candidate);
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("⚠️ Помилка додавання ICE:", err);
      }
    });

    start();

    return () => {
      console.log("🚫 Вихід із кімнати");
      localStream?.getTracks().forEach((track) => {
        track.stop();
        console.log(`🛑 Зупинено трек: ${track.kind}`);
      });

      pc.close();
      socket.emit("leave-room", { callId });
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [currentRole, callId]);

  const leaveRoom = () => {
    navigate("/");
  };

  const toggleMic = () => {
    const track = localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicEnabled(track.enabled);
      console.log(`🎙️ Мікрофон: ${track.enabled ? "Увімкнено" : "Вимкнено"}`);
    }
  };

  const toggleCamera = () => {
    const track = localStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraEnabled(track.enabled);
      console.log(`📷 Камера: ${track.enabled ? "Увімкнено" : "Вимкнено"}`);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Відеоконференція</h2>
      <p>
        Ви приєднались до кімнати: <strong>{callId}</strong>
      </p>

      <div className={styles.videoContainer}>
        <div>
          <p>Ви ({currentRole})</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={styles.video}
          />
        </div>
        <div>
          <p>Опонент</p>
          {isRemoteConnected ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={styles.video}
            />
          ) : (
            <div className={styles.placeholder}>
              Очікуємо підключення опонента...
            </div>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button onClick={toggleMic}>
          {micEnabled ? "🔇 Вимкнути мікрофон" : "🎙️ Увімкнути мікрофон"}
        </button>
        <button onClick={toggleCamera}>
          {cameraEnabled ? "📷 Вимкнути камеру" : "📹 Увімкнути камеру"}
        </button>
        <button onClick={leaveRoom} className={styles.leaveButton}>
          🚪 Вийти з кімнати
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;

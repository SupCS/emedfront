import { useEffect, useRef, useState } from "react";
import { db } from "../../firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteField,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { checkCallAccess } from "../../api/callApi";
import styles from "./VideoRoom.module.css";

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
};

const VideoRoom = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(new MediaStream());

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const remoteDescriptionSet = useRef(false);
  const candidateQueue = useRef([]);

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
    const init = async () => {
      const pc = new RTCPeerConnection(servers);
      setPeerConnection(pc);

      let local;
      try {
        local = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        local
          .getVideoTracks()
          .forEach((track) => (track.enabled = cameraEnabled));
        local.getAudioTracks().forEach((track) => (track.enabled = micEnabled));
        console.log("🎥 Отримано локальні треки:", local.getTracks());
      } catch (err) {
        console.warn("⚠️ Не вдалося отримати доступ до відео/аудіо:", err);
        local = new MediaStream();
      }

      setLocalStream(local);
      local.getTracks().forEach((track) => {
        console.log("🎤 Додаємо локальний трек:", track.kind);
        pc.addTrack(track, local);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = local;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.volume = 1.0;
        console.log("🔊 Установлено звук для remoteVideo");
      }

      pc.ontrack = (event) => {
        console.log("📥 Отримано remote track:", event.track.kind);
        event.streams[0].getTracks().forEach((track) => {
          const alreadyExists = remoteStream
            .getTracks()
            .some((t) => t.id === track.id);
          if (!alreadyExists) {
            console.log("➡️ Додаємо трек до remoteStream:", track.kind);
            remoteStream.addTrack(track);
          }
        });

        remoteVideoRef.current.srcObject = remoteStream;

        remoteStream.getTracks().forEach((t) => {
          console.log(
            `🛰️ Remote ${t.kind} — enabled: ${t.enabled}, state: ${t.readyState}`
          );
        });
      };

      pc.oniceconnectionstatechange = () => {
        console.log("❄️ ICE Connection State:", pc.iceConnectionState);
      };

      pc.onconnectionstatechange = () => {
        console.log("📡 Connection State:", pc.connectionState);
      };

      const callDoc = doc(collection(db, "calls"), callId);
      const offerCandidates = collection(callDoc, "offerCandidates");
      const answerCandidates = collection(callDoc, "answerCandidates");

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const target =
            currentRole === "doctor" ? offerCandidates : answerCandidates;
          console.log("🧊 Новий ICE кандидат:", event.candidate);
          await setDoc(doc(target), event.candidate.toJSON());
        }
      };

      const handleCandidate = (candidateData) => {
        if (!remoteDescriptionSet.current) {
          console.log(
            "⏳ Черга ICE (ще немає remoteDescription):",
            candidateData
          );
          candidateQueue.current.push(candidateData);
        } else {
          console.log("📬 Додаємо ICE одразу:", candidateData);
          pc.addIceCandidate(new RTCIceCandidate(candidateData));
        }
      };

      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && currentRole === "patient") {
            handleCandidate(change.doc.data());
          }
        });
      });

      onSnapshot(answerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added" && currentRole === "doctor") {
            handleCandidate(change.doc.data());
          }
        });
      });

      onSnapshot(callDoc, async (snapshot) => {
        const data = snapshot.data();

        if (currentRole === "doctor" && !data?.offer) {
          await setDoc(callDoc, {}, { merge: true });
          const offerDescription = await pc.createOffer();
          await pc.setLocalDescription(offerDescription);
          const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          };
          console.log("📨 Відправляємо offer:", offer);
          await updateDoc(callDoc, { offer });
        }

        if (
          currentRole === "patient" &&
          data?.offer &&
          !pc.currentRemoteDescription
        ) {
          console.log("📩 Отримано offer:", data.offer);
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          remoteDescriptionSet.current = true;
          console.log("✅ setRemoteDescription виконано");

          for (const c of candidateQueue.current) {
            console.log("🧊 Додаємо кандидат з черги:", c);
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          candidateQueue.current = [];

          const answerDescription = await pc.createAnswer();
          await pc.setLocalDescription(answerDescription);
          const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
          };
          console.log("📨 Відправляємо answer:", answer);
          await updateDoc(callDoc, { answer });
        }

        if (
          currentRole === "doctor" &&
          data?.answer &&
          !pc.currentRemoteDescription
        ) {
          console.log("📩 Отримано answer:", data.answer);
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          remoteDescriptionSet.current = true;
          console.log("✅ setRemoteDescription виконано");

          for (const c of candidateQueue.current) {
            console.log("🧊 Додаємо кандидат з черги:", c);
            await pc.addIceCandidate(new RTCIceCandidate(c));
          }
          candidateQueue.current = [];
        }
      });
    };

    if (currentRole && callId) {
      init();
    }
  }, [currentRole, callId]);

  const leaveRoom = async () => {
    console.log("🚪 Вихід з кімнати");

    localStream?.getTracks().forEach((track) => track.stop());
    peerConnection?.close();

    const callDoc = doc(collection(db, "calls"), callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    try {
      // Видаляємо підколекції кандидатів
      const offerSnap = await getDocs(offerCandidates);
      offerSnap.forEach(async (doc) => await deleteDoc(doc.ref));

      const answerSnap = await getDocs(answerCandidates);
      answerSnap.forEach(async (doc) => await deleteDoc(doc.ref));

      // Видаляємо SDP offer/answer
      await updateDoc(callDoc, {
        offer: deleteField(),
        answer: deleteField(),
      });

      console.log("🧹 Очищено callDoc від SDP та кандидатів");
    } catch (err) {
      console.warn("⚠️ Не вдалося очистити кімнату:", err);
    }

    navigate("/");
  };

  const toggleMic = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setMicEnabled(audioTrack.enabled);
    console.log("🎙️ Мікрофон:", audioTrack.enabled ? "Увімкнено" : "Вимкнено");
  };

  const toggleCamera = () => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setCameraEnabled(videoTrack.enabled);
    console.log("📷 Камера:", videoTrack.enabled ? "Увімкнено" : "Вимкнено");
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
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={styles.video}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <button
          onClick={toggleMic}
          disabled={!localStream || !localStream.getAudioTracks().length}
        >
          {micEnabled ? "🔇 Вимкнути мікрофон" : "🎙️ Увімкнути мікрофон"}
        </button>
        <button
          onClick={toggleCamera}
          disabled={!localStream || !localStream.getVideoTracks().length}
        >
          {cameraEnabled ? "📷 Вимкнути камеру" : "📹 Увімкнути камеру"}
        </button>
        <button onClick={leaveRoom} className={styles.leaveButton}>
          Вийти з кімнати
        </button>
      </div>
    </div>
  );
};

export default VideoRoom;

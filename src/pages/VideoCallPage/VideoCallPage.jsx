import { useParams } from "react-router-dom";

const VideoCallPage = () => {
  const { callId } = useParams();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Відеоконференція</h2>
      <p>
        Ви приєднались до кімнати: <strong>{callId}</strong>
      </p>
      {/* Тут буде компонент з WebRTC */}
    </div>
  );
};

export default VideoCallPage;

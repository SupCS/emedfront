import { useParams } from "react-router-dom";
import VideoRoom from "../../components/VideoRoom/VideoRoom";

const VideoCallPage = () => {
  const { callId } = useParams();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Відеоконференція</h2>
      <p>
        Ви приєднались до кімнати: <strong>{callId}</strong>
      </p>
      <VideoRoom />;
    </div>
  );
};

export default VideoCallPage;

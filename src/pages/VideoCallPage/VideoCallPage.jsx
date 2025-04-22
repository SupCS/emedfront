import { useParams } from "react-router-dom";
import VideoRoom from "../../components/VideoRoom/VideoRoom";

const VideoCallPage = () => {
  const { callId } = useParams();

  return (
    <div>
      <VideoRoom />
    </div>
  );
};

export default VideoCallPage;

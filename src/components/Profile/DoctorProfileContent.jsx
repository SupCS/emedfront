import DoctorSchedule from "../DoctorSchedule";
import styles from "./ProfileInfo.module.css";

function DoctorProfileContent({ doctorId }) {
  return <DoctorSchedule doctorId={doctorId} />;
}

export default DoctorProfileContent;

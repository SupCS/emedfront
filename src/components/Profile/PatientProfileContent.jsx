import { useNavigate } from "react-router-dom";
import styles from "./ProfileContent.module.css";

function PatientProfileContent({ patientId, isOwner }) {
  const navigate = useNavigate();

  if (!isOwner) return null;

  return (
    <div className={styles.buttonsWrapper}>
      <button
        className={styles.prescriptionsButton}
        onClick={() => navigate(`/profile/patient/${patientId}/prescriptions`)}
      >
        Мої призначення
      </button>
      <button
        className={styles.prescriptionsButton}
        onClick={() => navigate("/appointments")}
      >
        Мої записи
      </button>
    </div>
  );
}

export default PatientProfileContent;

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getPatientPrescriptions } from "../../api/prescriptionsApi";
import { getUserProfile } from "../../api/profileApi";
import { jwtDecode } from "jwt-decode";
import Loader from "../../components/Loader/Loader";
import PrescriptionModal from "../../components/PrescriptionModal/PrescriptionModal";
import styles from "./PrescriptionsPage.module.css";

const PrescriptionsPage = () => {
  const { id } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [patientProfile, setPatientProfile] = useState(null);

  const fetchData = async () => {
    try {
      const [prescData, profileData] = await Promise.all([
        getPatientPrescriptions(id),
        getUserProfile("patient", id),
      ]);
      setPrescriptions(prescData);
      setPatientProfile(profileData);
    } catch (err) {
      toast.error("Помилка завантаження даних пацієнта або призначень.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const token = localStorage.getItem("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      setIsDoctor(decoded.role === "doctor");
    }
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <h2>Мої призначення</h2>
      {isDoctor && (
        <button
          className={styles.createButton}
          onClick={() => setModalOpen(true)}
        >
          Створити призначення
        </button>
      )}
      {prescriptions.length === 0 ? (
        <p>У цього пацієнта ще немає призначень.</p>
      ) : (
        <ul className={styles.prescriptionList}>
          {console.log(prescriptions)}
          {prescriptions.map((prescription) => (
            <li key={prescription._id} className={styles.prescriptionItem}>
              <h3>Діагноз: {prescription.diagnosis}</h3>
              <p>
                <strong>Лікування:</strong> {prescription.treatment}
              </p>
              <p>
                <strong>Лікар:</strong>{" "}
                <Link
                  className={styles.linkText}
                  to={`/profile/doctor/${prescription.doctor._id}`}
                >
                  {prescription.doctor.name}
                </Link>{" "}
                ({prescription.doctor.specialization})
              </p>
              {prescription.pdfUrl && (
                <a
                  href={prescription.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pdfLink}
                >
                  📄 Переглянути PDF
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      <PrescriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchData}
        patientId={id}
        patientName={patientProfile?.name || ""}
        birthDate={patientProfile?.birthDate || ""}
      />
    </div>
  );
};

export default PrescriptionsPage;

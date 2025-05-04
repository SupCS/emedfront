import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getPatientPrescriptions } from "../../api/prescriptionsApi";
import { jwtDecode } from "jwt-decode";
import Loader from "../../components/Loader/Loader";
import PrescriptionModal from "../../components/PrescriptionModal/PrescriptionModal";
import styles from "./PrescriptionsPage.module.css";
import { Link } from "react-router-dom";

const PrescriptionsPage = () => {
  const { id } = useParams();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await getPatientPrescriptions(id);
        setPrescriptions(data);
      } catch (err) {
        toast.error(err.message || "Не вдалося завантажити призначення.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();

    // Перевіряємо, чи користувач - лікар
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

              <p>
                <strong>Дійсний до:</strong>{" "}
                {prescription.validUntil
                  ? new Date(prescription.validUntil).toLocaleDateString()
                  : "Без терміну дії"}
              </p>
            </li>
          ))}
        </ul>
      )}

      <PrescriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={id}
      />
    </div>
  );
};

export default PrescriptionsPage;

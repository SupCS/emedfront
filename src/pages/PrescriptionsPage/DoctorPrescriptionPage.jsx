import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { getDoctorPrescriptions } from "../../api/prescriptionsApi";
import Loader from "../../components/Loader/Loader";
import styles from "./PrescriptionsPage.module.css";

const DoctorPrescriptionsPage = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Ви не авторизовані.");
        navigate("/login");
        return;
      }

      const decoded = jwtDecode(token);
      if (decoded.role !== "doctor") {
        toast.error("Доступ дозволено лише лікарям.");
        navigate("/");
        return;
      }

      const data = await getDoctorPrescriptions(decoded.id);
      setPrescriptions(data);
    } catch (err) {
      toast.error(err.message || "Не вдалося завантажити призначення.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [navigate]);

  if (loading) return <Loader />;

  return (
    <div className={styles.container}>
      <h2>Призначення, які ви виписали</h2>

      {prescriptions.length === 0 ? (
        <p>Ви ще не виписали жодного призначення.</p>
      ) : (
        <ul className={styles.prescriptionList}>
          {prescriptions.map((prescription) => (
            <li key={prescription._id} className={styles.prescriptionItem}>
              <h3>Діагноз: {prescription.diagnosis}</h3>
              <p>
                <strong>Лікування:</strong> {prescription.treatment}
              </p>
              <p>
                <strong>Пацієнт:</strong>{" "}
                <Link
                  className={styles.linkText}
                  to={`/profile/patient/${prescription.patient._id}`}
                >
                  {prescription.patient.name}
                </Link>{" "}
                ({prescription.patient.email})
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
    </div>
  );
};

export default DoctorPrescriptionsPage;

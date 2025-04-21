import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { getDoctorPrescriptions } from "../../api/prescriptionsApi";
import Loader from "../../components/Loader/Loader";
import styles from "./PrescriptionsPage.module.css";

const DoctorPrescriptionsPage = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        const doctorId = decoded.id;
        const data = await getDoctorPrescriptions(doctorId);
        setPrescriptions(data);
      } catch (err) {
        toast.error(err.message || "Не вдалося завантажити призначення.");
      } finally {
        setLoading(false);
      }
    };

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
                <a
                  className={styles.linkText}
                  href={`/profile/patient/${prescription.patient._id}`}
                >
                  {prescription.patient.name}
                </a>{" "}
                ({prescription.patient.email})
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
    </div>
  );
};

export default DoctorPrescriptionsPage;

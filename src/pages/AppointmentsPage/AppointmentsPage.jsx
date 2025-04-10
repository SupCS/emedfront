import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDoctorAppointments,
  getPatientAppointments,
} from "../../api/appointmentApi";
import AppointmentsList from "../../components/AppointmentsList/AppointmentsList";
import Loader from "../../components/Loader/Loader";
import styles from "./AppointmentsPage.module.css";
import { toast } from "react-toastify";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const role = localStorage.getItem("userRole");
  const id = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || !role) {
      toast.error("Користувач не авторизований");
      navigate("/login");
      return;
    }

    async function fetchAppointments() {
      try {
        const data =
          role === "doctor"
            ? await getDoctorAppointments(id)
            : await getPatientAppointments(id);
        setAppointments(data);
      } catch (error) {
        toast.error("Помилка при завантаженні записів");
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [id, role, navigate]);

  const filteredAppointments = [...appointments]
    .filter((appt) => {
      if (activeTab === "upcoming") {
        return ["pending", "confirmed"].includes(appt.status);
      } else if (activeTab === "past") {
        return appt.status === "passed";
      } else if (activeTab === "cancelled") {
        return appt.status === "cancelled";
      }
      return false;
    })
    .sort((a, b) => {
      if (activeTab === "upcoming") {
        if (a.status !== b.status) {
          return a.status === "pending" ? -1 : 1;
        }
        return new Date(a.date) - new Date(b.date);
      } else if (activeTab === "past") {
        return new Date(b.date) - new Date(a.date);
      }
    });

  const handleStatusUpdate = (appointmentId, newStatus) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt._id === appointmentId ? { ...appt, status: newStatus } : appt
      )
    );
  };

  const handleMarkAsRated = (appointmentId, ratingValue) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt._id === appointmentId
          ? { ...appt, isRated: true, ratingValue }
          : appt
      )
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Мої записи</h2>

      <div className={styles.tabButtons}>
        <button
          className={`${styles.tab} ${
            activeTab === "upcoming" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Майбутні
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "past" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          Минулі
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "cancelled" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("cancelled")}
        >
          Скасовані
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <AppointmentsList
          appointments={filteredAppointments}
          role={role}
          onStatusUpdate={handleStatusUpdate}
          onRated={handleMarkAsRated}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;

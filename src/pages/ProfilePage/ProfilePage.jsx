import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/profileApi";
import {
  getDoctorAppointments,
  getPatientAppointments,
} from "../../api/appointmentApi";
import ProfileInfo from "../../components/ProfileInfo/ProfileInfo";
import AppointmentsList from "../../components/AppointmentsList/AppointmentsList";
import LogoutButton from "../../components/LogoutButton/LogoutButton";
import styles from "./ProfilePage.module.css";
import DoctorSchedule from "../../components/DoctorSchedule";
import Loader from "../../components/Loader/Loader";

function ProfilePage() {
  const { role, id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileData = await getUserProfile(role, id);
        setProfile(profileData);

        const appointmentsData =
          role === "doctor"
            ? await getDoctorAppointments(id)
            : await getPatientAppointments(id);
        setAppointments(appointmentsData);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, id]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <ProfileInfo profile={profile} role={role} />
          <AppointmentsList appointments={appointments} role={role} />
          {role === "doctor" && <DoctorSchedule doctorId={id} />}
          {role === "patient" && (
            <button
              className={styles.prescriptionsButton}
              onClick={() => navigate(`/profile/patient/${id}/prescriptions`)}
            >
              Мої призначення
            </button>
          )}
          <LogoutButton onLogout={handleLogout} />
        </>
      )}
    </div>
  );
}

export default ProfilePage;

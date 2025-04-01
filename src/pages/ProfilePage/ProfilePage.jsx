import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/profileApi";
import ProfileInfo from "../../components/ProfileInfo/ProfileInfo";
import LogoutButton from "../../components/LogoutButton/LogoutButton";
import DoctorSchedule from "../../components/DoctorSchedule";
import Loader from "../../components/Loader/Loader";
import { toast } from "react-toastify";
import styles from "./ProfilePage.module.css";
import AvatarUploader from "../../components/AvatarUploader/AvatarUploader";
import { getAvatarUrl } from "../../api/avatarApi";

function ProfilePage() {
  const { role, id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileData = await getUserProfile(role, id);
        setProfile(profileData);

        if (profileData) {
          setAvatar(getAvatarUrl(profileData.avatar));
        }

        const currentUserId = localStorage.getItem("userId");
        setIsOwner(currentUserId === id);
      } catch (error) {
        toast.error(error.message || "Не вдалося завантажити профіль.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, id]);

  const handleAvatarUpdate = (newAvatarPath) => {
    setAvatar(getAvatarUrl(newAvatarPath));
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Ви вийшли з акаунту.");
    navigate("/login");
  };

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.profileHeader}>
            <div className={styles.avatarSection}>
              <img src={avatar} alt="Аватар" className={styles.avatar} />
              {isOwner && <AvatarUploader onUpdate={handleAvatarUpdate} />}
            </div>
            <ProfileInfo profile={profile} role={role} />
          </div>

          {role === "doctor" && <DoctorSchedule doctorId={id} />}
          {role === "patient" && isOwner && (
            <button
              className={styles.prescriptionsButton}
              onClick={() => navigate(`/profile/patient/${id}/prescriptions`)}
            >
              Мої призначення
            </button>
          )}
          {isOwner && (
            <button
              className={styles.prescriptionsButton}
              onClick={() => navigate("/appointments")}
            >
              Мої записи
            </button>
          )}
          <LogoutButton onLogout={handleLogout} />
        </>
      )}
    </div>
  );
}

export default ProfilePage;

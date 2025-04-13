import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/profileApi";
import Loader from "../../components/Loader/Loader";
import LogoutButton from "../../components/LogoutButton/LogoutButton";
import AvatarUploader from "../../components/AvatarUploader/AvatarUploader";
import DoctorProfileContent from "../../components/Profile/DoctorProfileContent";
import PatientProfileContent from "../../components/Profile/PatientProfileContent";
import DoctorProfileInfo from "../../components/Profile/DoctorProfileInfo";
import PatientProfileInfo from "../../components/Profile/PatientProfileInfo";
import { getAvatarUrl } from "../../api/avatarApi";
import { toast } from "react-toastify";
import styles from "./ProfilePage.module.css";

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

  const renderProfileInfo = () => {
    if (role === "doctor") {
      return <DoctorProfileInfo profile={profile} />;
    }

    if (role === "patient") {
      return <PatientProfileInfo profile={profile} />;
    }

    return null;
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
            {renderProfileInfo()}
          </div>

          {role === "doctor" && (
            <DoctorProfileContent doctorId={id} isOwner={isOwner} />
          )}
          {role === "patient" && (
            <PatientProfileContent patientId={id} isOwner={isOwner} />
          )}

          {isOwner && <LogoutButton onLogout={handleLogout} />}
        </>
      )}
    </div>
  );
}

export default ProfilePage;

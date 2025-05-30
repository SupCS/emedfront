import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/profileApi";
import Loader from "../../components/Loader/Loader";
import DoctorProfileInfo from "../../components/Profile/DoctorProfileInfo";
import PatientProfileInfo from "../../components/Profile/PatientProfileInfo";
import { getAvatarUrl } from "../../api/avatarApi";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import { jwtDecode } from "jwt-decode";
import styles from "./ProfilePage.module.css";

function ProfilePage() {
  const { role, id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [modalState, setModalState] = useState({ open: false, fields: {} });

  useEffect(() => {
    async function fetchData() {
      try {
        const profileData = await getUserProfile(role, id);
        setProfile(profileData);

        if (profileData) {
          setAvatar(getAvatarUrl(profileData.avatar));
        }

        const token = localStorage.getItem("authToken");
        if (token) {
          const decoded = jwtDecode(token);
          setIsOwner(decoded.id === id);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error(error);
        navigate("/"); // або помилка
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, id, navigate]);

  const handleProfileUpdate = async () => {
    try {
      const updated = await getUserProfile(role, id);
      setProfile(updated);
      setAvatar(getAvatarUrl(updated.avatar));
    } catch (err) {
      console.error("Помилка оновлення профілю:", err);
    }
  };

  const openModalForFields = (fields) => {
    const currentData = {};
    fields.forEach((field) => {
      currentData[field] = profile[field] || "";
    });
    setModalState({ open: true, fields: currentData });
  };

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <Loader />
      ) : (
        <>
          {role === "doctor" && profile && (
            <DoctorProfileInfo
              profile={{ ...profile, avatar }}
              isOwner={isOwner}
              onEdit={openModalForFields}
            />
          )}

          {role === "patient" && profile && (
            <PatientProfileInfo
              profile={{ ...profile, avatar }}
              isOwner={isOwner}
              onEdit={openModalForFields}
            />
          )}

          <EditProfileModal
            isOpen={modalState.open}
            onClose={() => setModalState({ open: false, fields: {} })}
            currentData={modalState.fields}
            onUpdate={handleProfileUpdate}
          />
        </>
      )}
    </div>
  );
}

export default ProfilePage;

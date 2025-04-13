import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../api/profileApi";
import Loader from "../../components/Loader/Loader";
import LogoutButton from "../../components/LogoutButton/LogoutButton";
import AvatarUploader from "../../components/AvatarUploader/AvatarUploader";
import DoctorProfileContent from "../../components/Profile/DoctorProfileContent";
import PatientProfileContent from "../../components/Profile/PatientProfileContent";
import DoctorProfileInfo from "../../components/Profile/DoctorProfileInfo";
import { getAvatarUrl } from "../../api/avatarApi";
import EditProfileModal from "../../components/Profile/EditProfileModal/EditProfileModal";
import styles from "./ProfilePage.module.css";
import pencilIcon from "../../assets/pencil.svg";

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

        const currentUserId = localStorage.getItem("userId");
        setIsOwner(currentUserId === id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, id]);

  const handleAvatarUpdate = (newAvatarPath) => {
    setAvatar(getAvatarUrl(newAvatarPath));
  };

  const handleProfileUpdate = (updatedData) => {
    setProfile((prev) => ({ ...prev, ...updatedData }));
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("uk-UA");
  };

  const calculateAge = (isoDate) => {
    if (!isoDate) return null;
    const today = new Date();
    const birthDate = new Date(isoDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const openModalForFields = (fields) => {
    const currentData = {};
    fields.forEach((field) => {
      currentData[field] = profile[field] || "";
    });
    setModalState({ open: true, fields: currentData });
  };

  const getGenderLabel = (value) => {
    const map = {
      male: "Чоловіча",
      female: "Жіноча",
      other: "Інша",
    };
    return map[value] || value;
  };

  return (
    <div className={styles.pageContainer}>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.profileContent}>
            <div className={styles.leftColumn}>
              <div className={styles.leftBlock}>
                <img src={avatar} alt="Аватар" className={styles.avatar} />

                <div className={styles.fieldLine}>
                  <strong>Імʼя:</strong> {profile.name}
                </div>
                <div className={styles.fieldLine}>
                  <strong>Email:</strong> {profile.email}
                </div>
                <div className={styles.fieldLine}>
                  <strong>Телефон:</strong> {profile.phone}
                </div>

                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() =>
                      openModalForFields(["avatar", "name", "phone"])
                    }
                  >
                    <img
                      src={pencilIcon}
                      className={styles.blockEditIcon}
                      alt="edit"
                    />
                  </button>
                )}
              </div>

              <div className={styles.leftBlock}>
                <div className={styles.fieldLine}>
                  <strong>Алергії:</strong>{" "}
                  {(profile.allergies || []).join(", ") || "-"}
                </div>
                <div className={styles.fieldLine}>
                  <strong>Хронічні діагнози:</strong>{" "}
                  {(profile.chronicDiseases || []).join(", ") || "-"}
                </div>
                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() =>
                      openModalForFields(["allergies", "chronicDiseases"])
                    }
                  >
                    <img
                      src={pencilIcon}
                      className={styles.blockEditIcon}
                      alt="edit"
                    />
                  </button>
                )}
              </div>

              <div className={styles.leftBlock}>
                <div className={styles.fieldLine}>
                  <strong>Medical Records:</strong>{" "}
                  {profile.medicalRecords?.length || 0} records
                </div>
                <div className={styles.fieldLine}>
                  <strong>Prescriptions:</strong>{" "}
                  {profile.prescriptions?.length || 0} prescriptions
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.rightBlock}>
                <div className={styles.fieldLine}>
                  <strong>Дата народження:</strong>{" "}
                  {profile.birthDate
                    ? `${formatDate(profile.birthDate)} (${calculateAge(
                        profile.birthDate
                      )})`
                    : "-"}
                </div>
                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() => openModalForFields(["birthDate"])}
                  >
                    <img
                      src={pencilIcon}
                      className={styles.blockEditIcon}
                      alt="edit"
                    />
                  </button>
                )}
              </div>

              <div className={styles.rightBlock}>
                <div className={styles.fieldLine}>
                  <strong>Зріст (см):</strong> {profile.height || "-"}
                </div>
                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() => openModalForFields(["height"])}
                  >
                    <img
                      src={pencilIcon}
                      className={styles.blockEditIcon}
                      alt="edit"
                    />
                  </button>
                )}
              </div>

              <div className={styles.rightBlock}>
                <div className={styles.fieldLine}>
                  <strong>Вага (кг):</strong> {profile.weight || "-"}
                </div>
                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() => openModalForFields(["weight"])}
                  >
                    <img
                      src={pencilIcon}
                      className={styles.blockEditIcon}
                      alt="edit"
                    />
                  </button>
                )}
              </div>

              <div className={styles.rightBlock}>
                <div className={styles.fieldLine}>
                  <strong>Група крові:</strong> {profile.bloodType || "-"}
                </div>
                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() => openModalForFields(["bloodType"])}
                  >
                    <img
                      src={pencilIcon}
                      className={styles.blockEditIcon}
                      alt="edit"
                    />
                  </button>
                )}
              </div>

              <div className={styles.rightBlock}>
                <div className={styles.fieldLine}>
                  <strong>Стать:</strong>{" "}
                  {getGenderLabel(profile.gender) || "-"}
                </div>
                {isOwner && (
                  <button
                    className={styles.editButton}
                    onClick={() => openModalForFields(["gender"])}
                  >
                    <img
                      src={pencilIcon}
                      className={styles.blockEditIcon}
                      alt="edit"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          <EditProfileModal
            isOpen={modalState.open}
            onClose={() => setModalState({ open: false, fields: {} })}
            currentData={modalState.fields}
            onUpdate={handleProfileUpdate}
          />

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

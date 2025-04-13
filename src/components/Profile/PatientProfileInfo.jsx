import styles from "./ProfileInfo.module.css";
import pencilIcon from "../../assets/pencil.svg";
import OutlineButton from "../Buttons/OutlineButton";

export default function PatientProfileInfo({ profile, isOwner, onEdit }) {
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

  const getGenderLabel = (value) => {
    const map = {
      male: "Чоловіча",
      female: "Жіноча",
      other: "Інша",
    };
    return map[value] || value;
  };

  return (
    <div className={styles.profileContent}>
      <div className={styles.leftColumn}>
        <div className={styles.leftBlock}>
          <div className={styles.profileHeader}>
            <img
              src={profile.avatar}
              alt="Аватар"
              className={styles.avatarSquare}
            />

            <div className={styles.profileTextBlock}>
              <div className={styles.profileName}>{profile.name}</div>
              <div className={styles.profileEmail}>{profile.email}</div>
              <div className={styles.profilePhone}>{profile.phone}</div>
            </div>
          </div>

          {isOwner && (
            <button
              className={styles.editButton}
              onClick={() => onEdit(["avatar", "name", "phone"])}
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
              onClick={() => onEdit(["allergies", "chronicDiseases"])}
            >
              <img
                src={pencilIcon}
                className={styles.blockEditIcon}
                alt="edit"
              />
            </button>
          )}
        </div>

        {isOwner && (
          <div className={styles.leftBlock}>
            <div className={styles.inlineButtonGroup}>
              <OutlineButton
                to={`/profile/patient/${profile.id}/prescriptions`}
              >
                Переглянути призначення
              </OutlineButton>
              <OutlineButton to="/appointments">
                Переглянути записи
              </OutlineButton>
            </div>
          </div>
        )}
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
              onClick={() => onEdit(["birthDate"])}
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
              onClick={() => onEdit(["height"])}
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
              onClick={() => onEdit(["weight"])}
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
              onClick={() => onEdit(["bloodType"])}
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
            <strong>Стать:</strong> {getGenderLabel(profile.gender) || "-"}
          </div>
          {isOwner && (
            <button
              className={styles.editButton}
              onClick={() => onEdit(["gender"])}
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
  );
}

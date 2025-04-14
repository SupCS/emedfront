// 📄 PatientProfileInfo.jsx
import styles from "./ProfileInfo.module.css";
import pencilIcon from "../../assets/pencil.svg";
import calendarBirthdayIcon from "../../assets/calendarBirthday.svg";
import rulerIcon from "../../assets/ruler.svg";
import scaleIcon from "../../assets/scale.svg";
import bloodtypeIcon from "../../assets/bloodtype.svg";
import genderIcon from "../../assets/gender.svg";
import OutlineButton from "../Buttons/OutlineButton";
import RightBlock from "./RightBlock";

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
        {/* Заголовок */}
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

        {/* Медична інформація */}
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

        {/* Кнопки дій */}
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

      {/* Права колонка */}
      <div className={styles.rightColumn}>
        <RightBlock
          icon={calendarBirthdayIcon}
          label="Дата народження"
          value={
            profile.birthDate
              ? `${formatDate(profile.birthDate)} (${calculateAge(
                  profile.birthDate
                )})`
              : "-"
          }
          editable
          onEditClick={() => onEdit(["birthDate"])}
          isOwner={isOwner}
        />
        <RightBlock
          icon={rulerIcon}
          label="Зріст (см)"
          value={profile.height}
          editable
          onEditClick={() => onEdit(["height"])}
          isOwner={isOwner}
        />
        <RightBlock
          icon={scaleIcon}
          label="Вага (кг)"
          value={profile.weight}
          editable
          onEditClick={() => onEdit(["weight"])}
          isOwner={isOwner}
        />
        <RightBlock
          icon={bloodtypeIcon}
          label="Група крові"
          value={profile.bloodType}
          editable
          onEditClick={() => onEdit(["bloodType"])}
          isOwner={isOwner}
        />
        <RightBlock
          icon={genderIcon}
          label="Стать"
          value={getGenderLabel(profile.gender)}
          editable
          onEditClick={() => onEdit(["gender"])}
          isOwner={isOwner}
        />
      </div>
    </div>
  );
}

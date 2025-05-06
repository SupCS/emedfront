import styles from "./ProfileInfo.module.css";
import pencilIcon from "../../assets/pencil.svg";
import briefcaseIcon from "../../assets/briefcase.svg";
import starIcon from "../../assets/star.svg";
import checkIcon from "../../assets/check.svg";
import noteIcon from "../../assets/note.svg";
import OutlineButton from "../Buttons/OutlineButton";
import DoctorSchedule from "../DoctorSchedule/DoctorSchedule";
import RightBlock from "./RightBlock";
import DocumentSection from "./DocumentSection";

export default function DoctorProfileInfo({ profile, isOwner, onEdit }) {
  const renderFieldLine = (label, value) => (
    <div className={styles.fieldLine}>
      <strong>{label}:</strong> {value || "-"}
    </div>
  );

  function getYearsLabel(n) {
    if (typeof n !== "number") return "-";
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${n} років`;
    if (lastDigit === 1) return `${n} рік`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${n} роки`;
    return `${n} років`;
  }

  function getRatingLabel(value) {
    return value === null || value === undefined ? "Немає оцінок" : value;
  }

  return (
    <div className={styles.profileContent}>
      <div className={styles.leftColumn}>
        {/* Header */}
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

        {/* Additional Info */}
        <div className={styles.leftBlock}>
          {renderFieldLine("Спеціалізація", profile.specialization)}
          {renderFieldLine("Про себе", profile.bio)}
          {renderFieldLine(
            "Нагороди",
            profile.awards?.join(", ") || "Відсутні"
          )}

          {isOwner && (
            <button
              className={styles.editButton}
              onClick={() => onEdit(["bio"])}
            >
              <img
                src={pencilIcon}
                className={styles.blockEditIcon}
                alt="edit"
              />
            </button>
          )}
        </div>

        {/* Призначення */}
        {isOwner && (
          <div className={styles.leftBlock}>
            <div className={styles.prescriptionHeader}>
              <div className={styles.iconBlock}>
                <img src={noteIcon} alt="icon" className={styles.iconImage} />
              </div>
              <span>Мої призначення</span>
            </div>
            <OutlineButton to={`/prescriptions/doctor/${profile.id}`}>
              Переглянути призначення
            </OutlineButton>
          </div>
        )}

        {/* Документи */}
        <DocumentSection isOwner={isOwner} userId={profile.id} />

        {/* Schedule */}
        <div className={styles.leftBlock}>
          <DoctorSchedule
            doctorId={profile.id}
            isOwner={isOwner}
            doctorName={profile.name}
          />
        </div>
      </div>

      <div className={styles.rightColumn}>
        <RightBlock
          icon={briefcaseIcon}
          label="Стаж"
          value={getYearsLabel(profile.experience)}
        />
        <RightBlock
          icon={starIcon}
          label="Рейтинг"
          value={getRatingLabel(profile.rating)}
        />
        <RightBlock
          icon={checkIcon}
          label="Прийомів завершено"
          value={profile.passedAppointmentsCount || "—"}
        />
      </div>
    </div>
  );
}

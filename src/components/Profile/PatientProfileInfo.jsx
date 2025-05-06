import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./ProfileInfo.module.css";
import pencilIcon from "../../assets/pencil.svg";
import calendarBirthdayIcon from "../../assets/calendarBirthday.svg";
import rulerIcon from "../../assets/ruler.svg";
import scaleIcon from "../../assets/scale.svg";
import bloodtypeIcon from "../../assets/bloodtype.svg";
import genderIcon from "../../assets/gender.svg";
import OutlineButton from "../Buttons/OutlineButton";
import RightBlock from "./RightBlock";
import noteIcon from "../../assets/note.svg";
import DocumentSection from "./DocumentSection";

import { getPatientPrescriptions } from "../../api/prescriptionsApi";

export default function PatientProfileInfo({ profile, isOwner, onEdit }) {
  const [latestPrescription, setLatestPrescription] = useState(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await getPatientPrescriptions(profile.id);
        if (data.length > 0) setLatestPrescription(data[0]);
      } catch (e) {
        console.error("Помилка завантаження останнього призначення", e);
      }
    };
    fetchLatest();
  }, [profile.id]);

  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("uk-UA");
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

        {/* Призначення */}
        <div className={styles.leftBlock}>
          {latestPrescription ? (
            <div className={styles.prescriptionPreview}>
              <div className={styles.prescriptionHeader}>
                <div className={styles.iconBlock}>
                  <img src={noteIcon} alt="icon" className={styles.iconImage} />
                </div>
                <span>Останнє призначення</span>
              </div>

              <div className={styles.prescriptionGrid}>
                <div>
                  <div>
                    <strong>Діагноз:</strong> {latestPrescription.diagnosis}
                  </div>
                  <div>
                    <strong>Лікар:</strong>{" "}
                    <Link
                      to={`/profile/doctor/${latestPrescription.doctor._id}`}
                      className={styles.plainLink}
                    >
                      {latestPrescription.doctor.name}
                    </Link>
                  </div>
                </div>
                <div>
                  <div>
                    <strong>Дата:</strong>{" "}
                    {formatDate(latestPrescription.createdAt)}
                  </div>
                  <div>
                    <strong>Термін дії:</strong>{" "}
                    {latestPrescription.validUntil
                      ? formatDate(latestPrescription.validUntil)
                      : "Без терміну дії"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>Немає жодного призначення.</div>
          )}
          <OutlineButton to={`/profile/patient/${profile.id}/prescriptions`}>
            Переглянути всі призначення
          </OutlineButton>
        </div>

        {/* Документи */}
        <DocumentSection isOwner={isOwner} userId={profile.id} />

        {/* Кнопка до записів */}
        {isOwner && (
          <div className={styles.leftBlock}>
            <OutlineButton to="/appointments">Переглянути записи</OutlineButton>
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

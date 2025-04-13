import { useState } from "react";
import { toast } from "react-toastify";
import { updateUserProfile } from "../../api/profileApi";
import pencilIcon from "../../assets/pencil.svg";
import styles from "./ProfileInfo.module.css";

function PatientProfileInfo({ profile }) {
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone || "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    const trimmed = formData[field]?.trim();
    if (!trimmed) return toast.error("Поле не може бути порожнім");

    try {
      await updateUserProfile({ [field]: trimmed });
      setIsEditing((prev) => ({ ...prev, [field]: false }));
      toast.success("Дані оновлено успішно");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Помилка оновлення профілю");
    }
  };

  const handleCancel = (field) => {
    setFormData((prev) => ({ ...prev, [field]: profile[field] || "" }));
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  const renderField = (label, field, editable) => (
    <p className={styles.editableRow}>
      <strong>{label}:</strong>{" "}
      {isEditing[field] ? (
        <>
          <input
            value={formData[field] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            className={styles.inputField}
          />
          <button
            onClick={() => handleSave(field)}
            className={styles.saveButton}
          >
            Зберегти
          </button>
          <button
            onClick={() => handleCancel(field)}
            className={styles.cancelButton}
          >
            Відміна
          </button>
        </>
      ) : (
        <span className={styles.valueText}>
          {formData[field] || "-"}
          {editable && (
            <img
              src={pencilIcon}
              alt="Редагувати"
              className={styles.pencilIcon}
              onClick={() =>
                setIsEditing((prev) => ({ ...prev, [field]: true }))
              }
            />
          )}
        </span>
      )}
    </p>
  );

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.profileTitle}>Profile</h2>
      <div className={styles.profileDetails}>
        {renderField("Name", "name", true)}
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        {renderField("Phone", "phone", true)}
        <p>
          <strong>Medical Records:</strong>{" "}
          {profile.medicalRecords?.length || 0} records
        </p>
        <p>
          <strong>Prescriptions:</strong> {profile.prescriptions?.length || 0}{" "}
          prescriptions
        </p>
      </div>
    </div>
  );
}

export default PatientProfileInfo;

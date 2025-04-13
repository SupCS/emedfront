import { useState } from "react";
import { toast } from "react-toastify";
import { updateUserProfile } from "../../api/profileApi";
import pencilIcon from "../../assets/pencil.svg";
import styles from "./ProfileInfo.module.css";

function PatientProfileInfo({ profile }) {
  const [isEditing, setIsEditing] = useState({});
  const [formData, setFormData] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    birthDate: profile.birthDate || "",
    height: profile.height || "",
    weight: profile.weight || "",
    bloodType: profile.bloodType || "",
    gender: profile.gender || "",
    allergies: profile.allergies || [],
    chronicDiseases: profile.chronicDiseases || [],
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field) => {
    const value = formData[field];
    if (
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      toast.error("Поле не може бути порожнім");
      return;
    }

    try {
      await updateUserProfile({ [field]: value });
      setIsEditing((prev) => ({ ...prev, [field]: false }));
      toast.success("Дані оновлено успішно");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Помилка оновлення профілю");
    }
  };

  const handleCancel = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: profile[field] || (Array.isArray(prev[field]) ? [] : ""),
    }));
    setIsEditing((prev) => ({ ...prev, [field]: false }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const handleAddItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveItem = (field, index) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const renderField = (label, field, editable, type = "text") => (
    <p className={styles.editableRow}>
      <strong>{label}:</strong>{" "}
      {isEditing[field] ? (
        <>
          <input
            type={type}
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

  const renderArrayField = (label, field) => (
    <div className={styles.editableRow}>
      <strong>{label}:</strong>
      {formData[field].length === 0 && <span> - </span>}
      <ul className={styles.arrayFieldList}>
        {formData[field].map((item, index) => (
          <li key={index}>
            <input
              value={item}
              onChange={(e) => handleArrayChange(field, index, e.target.value)}
              className={styles.inputField}
            />
            <button
              onClick={() => handleRemoveItem(field, index)}
              className={styles.cancelButton}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleSave(field)} className={styles.saveButton}>
        Зберегти
      </button>
      <button
        onClick={() => handleAddItem(field)}
        className={styles.saveButton}
      >
        + Додати
      </button>
    </div>
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
        {renderField("Дата народження", "birthDate", true, "date")}
        <p>
          <strong>Вік:</strong> {profile.age ?? "-"}
        </p>
        {renderField("Зріст (см)", "height", true, "number")}
        {renderField("Вага (кг)", "weight", true, "number")}
        {renderField("Група крові", "bloodType", true)}
        {renderField("Стать", "gender", true)}
        <p>
          <strong>Medical Records:</strong>{" "}
          {profile.medicalRecords?.length || 0} records
        </p>
        <p>
          <strong>Prescriptions:</strong> {profile.prescriptions?.length || 0}{" "}
          prescriptions
        </p>
        {renderArrayField("Алергії", "allergies")}
        {renderArrayField("Хронічні діагнози", "chronicDiseases")}
      </div>
    </div>
  );
}

export default PatientProfileInfo;

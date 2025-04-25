import React, { useState, useEffect } from "react";
import styles from "./EditProfileModal.module.css";
import { updateUserProfile } from "../../../api/profileApi";
import { toast } from "react-toastify";
import AvatarUploader from "../../AvatarUploader/AvatarUploader";
import { getAvatarUrl } from "../../../api/avatarApi";
import TagInput from "../../Inputs/TagInput";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["male", "female", "other"];

function EditProfileModal({
  isOpen,
  onClose,
  currentData,
  onUpdate,
  onSubmit,
  editableFields, // масив полів, які МОЖНА редагувати
}) {
  const [formData, setFormData] = useState({});
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!currentData) return;

    // Якщо передані editableFields — беремо тільки їх
    const allowedData = editableFields
      ? Object.fromEntries(
          Object.entries(currentData).filter(([key]) =>
            editableFields.includes(key)
          )
        )
      : currentData;

    setFormData(allowedData);
  }, [currentData, editableFields]);

  useEffect(() => {
    if ("avatar" in currentData) {
      setAvatarPreview(getAvatarUrl(currentData.avatar));
    }
  }, [currentData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const updater = onSubmit || updateUserProfile;
      const updated = await updater(formData);
      toast.success("Профіль оновлено успішно");
      onUpdate(updated || formData);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Помилка оновлення");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Редагувати профіль</h2>

        {"avatar" in formData && (
          <div className={styles.avatarSection}>
            <AvatarUploader
              initialUrl={getAvatarUrl(formData.avatar)}
              onUpdate={(newAvatarPath) =>
                setFormData((prev) => ({
                  ...prev,
                  avatar: newAvatarPath,
                }))
              }
            />
          </div>
        )}

        <div className={styles.scrollableForm}>
          {Object.entries(formData).map(([field, value]) => {
            if (field === "avatar") return null;

            return (
              <div key={field} className={styles.inputGroup}>
                <label>{getFieldLabel(field)}:</label>

                {field === "bloodType" ? (
                  <select
                    value={value || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                  >
                    <option value="">Оберіть</option>
                    {bloodTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : field === "gender" ? (
                  <select
                    value={value || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                  >
                    <option value="">Оберіть</option>
                    <option value="male">Чоловіча</option>
                    <option value="female">Жіноча</option>
                    <option value="other">Інша</option>
                  </select>
                ) : field === "allergies" || field === "chronicDiseases" ? (
                  <TagInput
                    value={Array.isArray(value) ? value : []}
                    onChange={(tags) => handleChange(field, tags)}
                    placeholder="Введіть значення через кому або Enter"
                  />
                ) : (
                  <input
                    type={getInputType(field)}
                    value={value}
                    onChange={(e) => handleChange(field, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.buttons}>
          <button className={styles.saveButton} onClick={handleSubmit}>
            Зберегти
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );
}

function getFieldLabel(field) {
  const labels = {
    name: "Імʼя",
    phone: "Телефон",
    email: "Email",
    birthDate: "Дата народження",
    height: "Зріст (см)",
    weight: "Вага (кг)",
    bloodType: "Група крові",
    gender: "Стать",
    allergies: "Алергії",
    chronicDiseases: "Хронічні діагнози",
    bio: "Про себе",
    specialization: "Спеціалізація",
    experience: "Стаж (роки)",
  };
  return labels[field] || field;
}

function getInputType(field) {
  if (field === "birthDate") return "date";
  if (["height", "weight", "experience"].includes(field)) return "number";
  return "text";
}

export default EditProfileModal;

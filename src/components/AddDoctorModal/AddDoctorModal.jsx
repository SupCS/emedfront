import React, { useState } from "react";
import styles from "../Profile/EditProfileModal/EditProfileModal.module.css";
import { addDoctor } from "../../api/adminApi";
import { toast } from "react-toastify";

function AddDoctorModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    bio: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { doctor } = await addDoctor(formData);
      toast.success("Лікаря успішно створено");
      onCreated(doctor);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Помилка створення лікаря");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalHeader}>Новий лікар</h2>
        <div className={styles.scrollableForm}>
          {Object.entries(formData).map(([field, value]) => (
            <div key={field} className={styles.inputGroup}>
              <label>{getFieldLabel(field)}:</label>
              <input
                type={field === "experience" ? "number" : "text"}
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.saveButton} onClick={handleSubmit}>
            Створити
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
    email: "Email",
    password: "Пароль",
    phone: "Телефон",
    specialization: "Спеціалізація",
    experience: "Стаж (роки)",
    bio: "Про себе",
  };
  return labels[field] || field;
}

export default AddDoctorModal;

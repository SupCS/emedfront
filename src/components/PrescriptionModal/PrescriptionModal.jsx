import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { createPrescription } from "../../api/prescriptionsApi";
import "flatpickr/dist/flatpickr.min.css";
import styles from "./PrescriptionModal.module.css";
import { getDoctorDetails } from "../../api/doctorApi";
import { jwtDecode } from "jwt-decode";
import Loader from "../Loader/Loader";

const PrescriptionModal = ({
  isOpen,
  onClose,
  onCreated,
  patientId,
  patientName,
  birthDate,
}) => {
  const today = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(today.getDate() + 14);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patientId,
    institution: 'Медичний центр "Emed Clinic"',
    headerName: "Emed Clinic",
    headerAddress: "м. Київ, вул. Здоровʼя, 10",
    codeEDRPOU: "77778888",
    nakaz1: "140212",
    nakaz2: "110",
    dateDay: today.getDate().toString().padStart(2, "0"),
    dateMonth: (today.getMonth() + 1).toString().padStart(2, "0"),
    dateYear: today.getFullYear().toString(),
    headName: "Аспарян Д.С.",
    patientName: "",
    labResults: "",
    birthDate: "",
    doctorText: "",
    specialResults: "",
    diagnosis: "",
    treatment: "",
    doctorName: "",
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const decoded = jwtDecode(token);
      if (decoded.role === "doctor") {
        try {
          const doctor = await getDoctorDetails(decoded.id);
          setFormData((prev) => ({
            ...prev,
            doctorText: `${doctor.specialization || ""}, ${doctor.name || ""}`,
            doctorName: doctor.name || "",
            patientName: patientName || "",
            birthDate: birthDate?.split("T")[0] || "",
          }));
        } catch (err) {
          console.error("Помилка завантаження лікаря:", err);
        }
      }
    };

    if (isOpen) {
      fetchDoctorData();
    }
  }, [isOpen, patientName, birthDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      await createPrescription(payload);
      toast.success("Призначення успішно створено!");
      if (onCreated) await onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || "Не вдалося створити призначення.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <h2 className={styles.modalTitle}>Створити призначення</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          {[
            { label: "Назва закладу", name: "institution" },
            { label: "Найменування підприємства", name: "headerName" },
            { label: "Адреса закладу", name: "headerAddress" },
            { label: "Код ЄДРПОУ", name: "codeEDRPOU" },
            { label: "Наказ 1", name: "nakaz1" },
            { label: "Наказ 2", name: "nakaz2" },
            { label: "Число", name: "dateDay" },
            { label: "Місяць", name: "dateMonth" },
            { label: "Рік", name: "dateYear" },
            { label: "Ім’я голови установи", name: "headName" },
            { label: "Ім’я пацієнта", name: "patientName" },
            { label: "Дата народження пацієнта", name: "birthDate" },
            { label: "Спеціальність та імʼя лікаря", name: "doctorText" },
            { label: "Імʼя лікаря", name: "doctorName" },
            { label: "Лабораторні результати", name: "labResults" },
            { label: "Додаткові результати", name: "specialResults" },
            { label: "Діагноз", name: "diagnosis" },
            { label: "Лікування", name: "treatment", type: "textarea" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label className={styles.label}>{label}</label>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  required
                  className={styles.textarea}
                />
              ) : (
                <input
                  type="text"
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              )}
            </div>
          ))}

          {loading ? (
            <div className={styles.loaderWrapper}>
              <Loader />
            </div>
          ) : (
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton}>
                Виписати
              </button>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                Закрити
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
